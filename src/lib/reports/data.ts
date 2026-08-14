import "server-only";

import { and, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";
import { getDb } from "@/db";
import {
  projectMembers,
  projects,
  reportFilters,
  reports,
  timeEntries,
  user,
} from "@/db/schema";

type Filters = {
  from?: string;
  to?: string;
  billable?: "any" | "yes" | "no";
  scope?: "organization" | "selected";
  projectIds?: string[];
  excludedProjectIds?: string[];
  groupBy?: "none" | "project";
};

export async function getReportData(reportId: string, creatorId?: string) {
  const db = getDb();
  const [report] = await db
    .select({
      id: reports.id,
      title: reports.title,
      creatorId: reports.creatorId,
      projectId: reports.projectId,
      status: reports.status,
      generatedAt: reports.generatedAt,
      projectName: projects.name,
      currency: projects.currency,
    })
    .from(reports)
    .leftJoin(projects, eq(projects.id, reports.projectId))
    .where(
      and(
        eq(reports.id, reportId),
        creatorId ? eq(reports.creatorId, creatorId) : undefined,
      ),
    )
    .limit(1);
  if (!report) return null;
  const [filterRow] = await db
    .select({ filters: reportFilters.filters })
    .from(reportFilters)
    .where(eq(reportFilters.reportId, reportId))
    .limit(1);
  const filters = (filterRow?.filters ?? {}) as Filters;
  const configuredProjectIds = filters.projectIds?.length
    ? filters.projectIds
    : report.projectId
      ? [report.projectId]
      : null;
  const memberships = await db
    .select({ projectId: projectMembers.projectId, role: projectMembers.role })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.userId, report.creatorId),
        configuredProjectIds
          ? inArray(projectMembers.projectId, configuredProjectIds)
          : undefined,
        isNull(projectMembers.revokedAt),
      ),
    );
  const selectedProjectIds =
    configuredProjectIds ?? memberships.map((item) => item.projectId);
  const legacyOwnOnly = !filters.scope && !report.projectId;
  const teamProjectIds = memberships
    .filter(
      (item) =>
        !legacyOwnOnly && (item.role === "owner" || item.role === "admin"),
    )
    .map((item) => item.projectId);
  const ownOnlyProjectIds = memberships
    .filter((item) => legacyOwnOnly || item.role === "member")
    .map((item) => item.projectId);
  const visibility = [];
  if (teamProjectIds.length)
    visibility.push(inArray(timeEntries.projectId, teamProjectIds));
  if (ownOnlyProjectIds.length)
    visibility.push(
      and(
        inArray(timeEntries.projectId, ownOnlyProjectIds),
        eq(timeEntries.userId, report.creatorId),
      )!,
    );
  const conditions = [isNull(timeEntries.deletedAt)];
  conditions.push(
    selectedProjectIds.length && visibility.length
      ? or(...visibility)!
      : eq(timeEntries.id, "00000000-0000-0000-0000-000000000000"),
  );
  if (filters.from) conditions.push(gte(timeEntries.workDate, filters.from));
  if (filters.to) conditions.push(lte(timeEntries.workDate, filters.to));
  if (filters.billable === "yes")
    conditions.push(eq(timeEntries.billable, true));
  if (filters.billable === "no")
    conditions.push(eq(timeEntries.billable, false));
  const entries = await db
    .select({
      id: timeEntries.id,
      projectId: timeEntries.projectId,
      date: timeEntries.workDate,
      description: timeEntries.description,
      startedAt: timeEntries.startedAt,
      endedAt: timeEntries.endedAt,
      breakMinutes: timeEntries.breakMinutes,
      durationMinutes: timeEntries.durationMinutes,
      billable: timeEntries.billable,
      status: timeEntries.status,
      project: projects.name,
      color: projects.color,
      timezone: projects.timezone,
      hourlyRate: projects.hourlyRate,
      currency: projects.currency,
      member: user.name,
    })
    .from(timeEntries)
    .innerJoin(projects, eq(projects.id, timeEntries.projectId))
    .innerJoin(user, eq(user.id, timeEntries.userId))
    .where(and(...conditions))
    .orderBy(timeEntries.workDate, timeEntries.startedAt);
  const totalMinutes = entries.reduce(
    (sum, entry) => sum + entry.durationMinutes,
    0,
  );
  const billableMinutes = entries
    .filter((entry) => entry.billable)
    .reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const amount = entries.reduce(
    (sum, entry) =>
      sum +
      (entry.billable
        ? (entry.durationMinutes / 60) * Number(entry.hourlyRate ?? 0)
        : 0),
    0,
  );
  const amounts = entries.reduce<Record<string, number>>((totals, entry) => {
    if (entry.billable)
      totals[entry.currency] =
        (totals[entry.currency] ?? 0) +
        (entry.durationMinutes / 60) * Number(entry.hourlyRate ?? 0);
    return totals;
  }, {});
  const projectNames = [...new Set(entries.map((entry) => entry.project))];
  const scopeLabel =
    filters.scope === "organization"
      ? "Organization"
      : projectNames.length === 1
        ? projectNames[0]
        : `${selectedProjectIds.length} projects`;
  const groupedProjects = [
    ...new Map(
      entries.map((entry) => [
        entry.projectId,
        { projectId: entry.projectId, project: entry.project },
      ]),
    ).values(),
  ];
  const projectGroups = groupedProjects.map(({ projectId, project }) => {
    const projectEntries = entries.filter(
      (entry) => entry.projectId === projectId,
    );
    const totalMinutes = projectEntries.reduce(
      (sum, entry) => sum + entry.durationMinutes,
      0,
    );
    const billableMinutes = projectEntries
      .filter((entry) => entry.billable)
      .reduce((sum, entry) => sum + entry.durationMinutes, 0);
    const amounts = projectEntries.reduce<Record<string, number>>(
      (totals, entry) => {
        if (entry.billable)
          totals[entry.currency] =
            (totals[entry.currency] ?? 0) +
            (entry.durationMinutes / 60) * Number(entry.hourlyRate ?? 0);
        return totals;
      },
      {},
    );
    return {
      projectId,
      project,
      color: projectEntries[0]?.color ?? "#64748B",
      entries: projectEntries,
      totalMinutes,
      billableMinutes,
      amounts,
    };
  });
  return {
    report: { ...report, projectName: report.projectName ?? scopeLabel },
    filters,
    entries,
    projectGroups,
    summary: {
      totalMinutes,
      billableMinutes,
      nonBillableMinutes: totalMinutes - billableMinutes,
      amount,
      amounts,
    },
  };
}
