import { TimerView } from "@/components/timesheets/timer-view";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { projectMembers, projects, timeEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
export const metadata = { title: "Timer" };
export const dynamic = "force-dynamic";
export default async function TimerPage() {
  const user = await requireUser();
  const db = getDb();
  const now = new Date();
  const today = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
  const [availableProjects, todayEntries] = await Promise.all([
    db
      .select({
        id: projects.id,
        name: projects.name,
        client: projects.clientName,
        color: projects.color,
        billable: projects.billable,
      })
      .from(projectMembers)
      .innerJoin(projects, eq(projects.id, projectMembers.projectId))
      .where(
        and(
          eq(projectMembers.userId, user.id),
          isNull(projectMembers.revokedAt),
          eq(projects.status, "active"),
          isNull(projects.deletedAt),
        ),
      ),
    db
      .select({
        id: timeEntries.id,
        project: projects.name,
        color: projects.color,
        description: timeEntries.description,
        startedAt: timeEntries.startedAt,
        endedAt: timeEntries.endedAt,
        durationMinutes: timeEntries.durationMinutes,
      })
      .from(timeEntries)
      .innerJoin(projects, eq(projects.id, timeEntries.projectId))
      .where(
        and(
          eq(timeEntries.userId, user.id),
          isNull(timeEntries.deletedAt),
          eq(timeEntries.workDate, today),
        ),
      )
      .orderBy(desc(timeEntries.startedAt)),
  ]);
  return <TimerView projects={availableProjects} entries={todayEntries} />;
}
