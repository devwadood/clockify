import "server-only";

import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { getDb } from "@/db";
import { projectMembers, projects, reportFilters, reports, timeEntries, user } from "@/db/schema";

type Filters = { from?: string; to?: string; billable?: "any" | "yes" | "no" };

export async function getReportData(reportId: string, creatorId?: string) {
  const db = getDb();
  const [report] = await db.select({ id: reports.id, title: reports.title, creatorId: reports.creatorId, projectId: reports.projectId, status: reports.status, generatedAt: reports.generatedAt, projectName: projects.name, currency: projects.currency })
    .from(reports).leftJoin(projects, eq(projects.id, reports.projectId))
    .where(and(eq(reports.id, reportId), creatorId ? eq(reports.creatorId, creatorId) : undefined)).limit(1);
  if (!report) return null;
  const [filterRow] = await db.select({ filters: reportFilters.filters }).from(reportFilters).where(eq(reportFilters.reportId, reportId)).limit(1);
  const filters = (filterRow?.filters ?? {}) as Filters;
  let canSeeProjectTeam = false;
  if (report.projectId) {
    const [membership] = await db.select({ role: projectMembers.role }).from(projectMembers).where(and(eq(projectMembers.projectId, report.projectId), eq(projectMembers.userId, report.creatorId), isNull(projectMembers.revokedAt))).limit(1);
    canSeeProjectTeam = membership?.role === "owner" || membership?.role === "admin";
  }
  const conditions = [isNull(timeEntries.deletedAt)];
  if (report.projectId) conditions.push(eq(timeEntries.projectId, report.projectId));
  if (!report.projectId || !canSeeProjectTeam) conditions.push(eq(timeEntries.userId, report.creatorId));
  if (filters.from) conditions.push(gte(timeEntries.workDate, filters.from));
  if (filters.to) conditions.push(lte(timeEntries.workDate, filters.to));
  if (filters.billable === "yes") conditions.push(eq(timeEntries.billable, true));
  if (filters.billable === "no") conditions.push(eq(timeEntries.billable, false));
  const entries = await db.select({
    id: timeEntries.id, date: timeEntries.workDate, description: timeEntries.description, startedAt: timeEntries.startedAt,
    endedAt: timeEntries.endedAt, breakMinutes: timeEntries.breakMinutes, durationMinutes: timeEntries.durationMinutes,
    billable: timeEntries.billable, status: timeEntries.status, project: projects.name, color: projects.color,
    hourlyRate: projects.hourlyRate, currency: projects.currency, member: user.name,
  }).from(timeEntries).innerJoin(projects, eq(projects.id, timeEntries.projectId)).innerJoin(user, eq(user.id, timeEntries.userId)).where(and(...conditions)).orderBy(timeEntries.workDate, timeEntries.startedAt);
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const billableMinutes = entries.filter(entry => entry.billable).reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const amount = entries.reduce((sum, entry) => sum + (entry.billable ? entry.durationMinutes / 60 * Number(entry.hourlyRate ?? 0) : 0), 0);
  return { report, filters, entries, summary: { totalMinutes, billableMinutes, nonBillableMinutes: totalMinutes - billableMinutes, amount } };
}
