import { and, desc, eq, gte, ilike, isNull, lte } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { projectMembers, projects, timeEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { clockMinutesInTimeZone, parseClockTime } from "@/lib/time/clock";
import { TimesheetView } from "./timesheet-view";

export type TimesheetFilters = {
  search: string;
  from: string;
  to: string;
  fromTime: string;
  toTime: string;
  projectId: string;
  client: string;
  minHours: string;
  maxHours: string;
  billable: "" | "yes" | "no";
  status: "" | "draft" | "submitted" | "approved" | "rejected";
};
type SearchParams = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
const isoDate = (value: string) =>
  z.iso.date().safeParse(value).success ? value : "";
const decimal = (value: string) =>
  /^\d{0,2}(?:\.\d{0,2})?$/.test(value) &&
  Number(value) >= 0 &&
  Number(value) <= 24
    ? value
    : "";

export async function TimesheetPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const rawProject = one(params.projectId);
  const rawBillable = one(params.billable);
  const rawStatus = one(params.status);
  const filters: TimesheetFilters = {
    search: one(params.search).trim().slice(0, 120),
    from: isoDate(one(params.from)),
    to: isoDate(one(params.to)),
    fromTime: parseClockTime(one(params.fromTime)) ? one(params.fromTime) : "",
    toTime: parseClockTime(one(params.toTime)) ? one(params.toTime) : "",
    projectId: z.uuid().safeParse(rawProject).success ? rawProject : "",
    client: one(params.client).trim().slice(0, 100),
    minHours: decimal(one(params.minHours)),
    maxHours: decimal(one(params.maxHours)),
    billable: rawBillable === "yes" || rawBillable === "no" ? rawBillable : "",
    status: ["draft", "submitted", "approved", "rejected"].includes(rawStatus)
      ? (rawStatus as TimesheetFilters["status"])
      : "",
  };
  const current = await requireUser();
  const db = getDb();
  const conditions = [
    eq(timeEntries.userId, current.id),
    isNull(timeEntries.deletedAt),
  ];
  if (filters.from) conditions.push(gte(timeEntries.workDate, filters.from));
  if (filters.to) conditions.push(lte(timeEntries.workDate, filters.to));
  if (filters.projectId)
    conditions.push(eq(timeEntries.projectId, filters.projectId));
  if (filters.client) conditions.push(eq(projects.clientName, filters.client));
  if (filters.search)
    conditions.push(ilike(timeEntries.description, `%${filters.search}%`));
  if (filters.billable)
    conditions.push(eq(timeEntries.billable, filters.billable === "yes"));
  if (filters.status) conditions.push(eq(timeEntries.status, filters.status));
  const [databaseRows, availableProjects] = await Promise.all([
    db
      .select({
        id: timeEntries.id,
        projectId: timeEntries.projectId,
        date: timeEntries.workDate,
        description: timeEntries.description,
        project: projects.name,
        client: projects.clientName,
        color: projects.color,
        timezone: projects.timezone,
        startedAt: timeEntries.startedAt,
        endedAt: timeEntries.endedAt,
        breakMinutes: timeEntries.breakMinutes,
        durationMinutes: timeEntries.durationMinutes,
        billable: timeEntries.billable,
        status: timeEntries.status,
      })
      .from(timeEntries)
      .innerJoin(projects, eq(projects.id, timeEntries.projectId))
      .where(and(...conditions))
      .orderBy(desc(timeEntries.startedAt)),
    db
      .select({
        id: projects.id,
        name: projects.name,
        client: projects.clientName,
      })
      .from(projectMembers)
      .innerJoin(projects, eq(projects.id, projectMembers.projectId))
      .where(
        and(
          eq(projectMembers.userId, current.id),
          isNull(projectMembers.revokedAt),
          isNull(projects.deletedAt),
        ),
      )
      .orderBy(projects.name),
  ]);
  const fromClock = filters.fromTime
    ? parseClockTime(filters.fromTime)!.totalMinutes
    : null;
  const toClock = filters.toTime
    ? parseClockTime(filters.toTime)!.totalMinutes
    : null;
  const minMinutes = filters.minHours ? Number(filters.minHours) * 60 : null;
  const maxMinutes = filters.maxHours ? Number(filters.maxHours) * 60 : null;
  const rows = databaseRows.filter((entry) => {
    if (
      fromClock !== null &&
      clockMinutesInTimeZone(entry.startedAt, entry.timezone) < fromClock
    )
      return false;
    if (
      toClock !== null &&
      clockMinutesInTimeZone(entry.endedAt, entry.timezone) > toClock
    )
      return false;
    if (minMinutes !== null && entry.durationMinutes < minMinutes) return false;
    if (maxMinutes !== null && entry.durationMinutes > maxMinutes) return false;
    return true;
  });
  return (
    <TimesheetView
      entries={rows}
      projects={availableProjects}
      filters={filters}
    />
  );
}
