import "server-only";

import { and, asc, desc, eq, gte, isNull } from "drizzle-orm";
import { endOfWeek, format, startOfDay, startOfMonth, startOfWeek, subDays } from "date-fns";
import { getDb } from "@/db";
import { activeTimers, projectMembers, projects, timeEntries } from "@/db/schema";

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export async function getDashboardData(userId: string) {
  const db = getDb();
  const now = new Date();
  const today = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const [entries, memberships, timer] = await Promise.all([
    db.select({
      id: timeEntries.id, projectId: timeEntries.projectId, project: projects.name, projectColor: projects.color,
      description: timeEntries.description, startedAt: timeEntries.startedAt, endedAt: timeEntries.endedAt,
      durationMinutes: timeEntries.durationMinutes, billable: timeEntries.billable, status: timeEntries.status,
    }).from(timeEntries).innerJoin(projects, eq(projects.id, timeEntries.projectId)).where(and(
      eq(timeEntries.userId, userId), isNull(timeEntries.deletedAt), gte(timeEntries.startedAt, monthStart),
    )).orderBy(desc(timeEntries.startedAt)),
    db.select({ id: projects.id, name: projects.name, client: projects.clientName, color: projects.color, status: projects.status })
      .from(projectMembers).innerJoin(projects, eq(projects.id, projectMembers.projectId))
      .where(and(eq(projectMembers.userId, userId), isNull(projectMembers.revokedAt), isNull(projects.deletedAt))).orderBy(asc(projects.name)),
    db.select({ id: activeTimers.id, projectId: activeTimers.projectId, project: projects.name, projectColor: projects.color,
      description: activeTimers.description, status: activeTimers.status, startedAt: activeTimers.startedAt,
      pausedAt: activeTimers.pausedAt, accumulatedSeconds: activeTimers.accumulatedSeconds,
    }).from(activeTimers).innerJoin(projects, eq(projects.id, activeTimers.projectId)).where(eq(activeTimers.userId, userId)).limit(1),
  ]);

  const sum = (from: Date, predicate: (entry: typeof entries[number]) => boolean = () => true) => entries
    .filter((entry) => entry.startedAt >= from && predicate(entry)).reduce((total, entry) => total + entry.durationMinutes, 0);
  const weekEntries = entries.filter((entry) => entry.startedAt >= weekStart && entry.startedAt <= weekEnd);
  const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = subDays(weekEnd, 6 - index);
    const dayEntries = weekEntries.filter((entry) => format(entry.startedAt, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
    return { day: format(date, "EEE"), billable: dayEntries.filter((e) => e.billable).reduce((n,e)=>n+e.durationMinutes/60,0), nonbillable: dayEntries.filter((e) => !e.billable).reduce((n,e)=>n+e.durationMinutes/60,0) };
  });
  const distribution = memberships.map((project) => ({ ...project, minutes: entries.filter((entry) => entry.projectId === project.id).reduce((n,e)=>n+e.durationMinutes,0) })).filter((project) => project.minutes > 0).sort((a,b)=>b.minutes-a.minutes);

  return {
    projects: memberships,
    entries: entries.slice(0, 6),
    activeTimer: timer[0] ?? null,
    totals: {
      today: sum(today), week: sum(weekStart), month: sum(monthStart),
      billableWeek: sum(weekStart, (entry) => entry.billable), nonBillableWeek: sum(weekStart, (entry) => !entry.billable),
    },
    weeklyActivity,
    distribution,
  };
}
