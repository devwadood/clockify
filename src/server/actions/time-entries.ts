"use server";

import { and, eq, gt, isNull, lt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { auditLogs, projectMembers, projects, timeEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { parseClockTime, projectDateTimeToUtc } from "@/lib/time/clock";

const inputSchema = z.object({
  projectId: z.uuid(),
  date: z.iso.date(),
  start: z.string().trim().min(4).max(10),
  end: z.string().trim().min(4).max(10),
  breakMinutes: z.coerce.number().int().min(0).max(600),
  description: z.string().trim().min(1).max(240),
  billable: z.boolean(),
});

export type TimeEntryActionState = {
  error?: string;
  occupied?: { time: string; description: string; durationMinutes: number }[];
};

export async function createTimeEntry(
  previousState: TimeEntryActionState,
  formData: FormData,
): Promise<TimeEntryActionState> {
  void previousState;
  const user = await requireUser();
  const parsed = inputSchema.safeParse({
    projectId: formData.get("projectId"),
    date: formData.get("date"),
    start: formData.get("start"),
    end: formData.get("end"),
    breakMinutes: formData.get("breakMinutes") || 0,
    description: formData.get("description"),
    billable: formData.get("billable") === "on",
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid time entry" };
  const input = parsed.data;
  const start = parseClockTime(input.start);
  const end = parseClockTime(input.end);
  if (!start || !end) return { error: "Enter a valid start and end time" };
  const elapsed = end.totalMinutes - start.totalMinutes;
  const durationMinutes = elapsed - input.breakMinutes;
  if (elapsed <= 0 || elapsed > 1440)
    return { error: "End time must be after start time" };
  if (durationMinutes <= 0)
    return { error: "Break must be shorter than the working duration" };
  const db = getDb();
  const [membership] = await db
    .select({
      status: projects.status,
      approvalRequired: projects.approvalRequired,
      timezone: projects.timezone,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projects.id, projectMembers.projectId))
    .where(
      and(
        eq(projectMembers.projectId, input.projectId),
        eq(projectMembers.userId, user.id),
        isNull(projectMembers.revokedAt),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);
  if (!membership) return { error: "You do not have access to this project" };
  if (membership.status !== "active")
    return { error: "This project does not accept new time entries" };
  const startedAt = projectDateTimeToUtc(
    input.date,
    start,
    membership.timezone,
  );
  const endedAt = projectDateTimeToUtc(input.date, end, membership.timezone);
  const dayEntries = await db
    .select({
      id: timeEntries.id,
      description: timeEntries.description,
      startedAt: timeEntries.startedAt,
      endedAt: timeEntries.endedAt,
      durationMinutes: timeEntries.durationMinutes,
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.userId, user.id),
        isNull(timeEntries.deletedAt),
        eq(timeEntries.workDate, input.date),
      ),
    )
    .orderBy(timeEntries.startedAt);
  const overlap = dayEntries.some(
    (entry) => entry.startedAt < endedAt && entry.endedAt > startedAt,
  );
  if (overlap) {
    const clock = (date: Date) =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: membership.timezone,
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
    return {
      error:
        "That time overlaps an existing entry. Choose an available period.",
      occupied: dayEntries.map((entry) => ({
        time: `${clock(entry.startedAt)}–${clock(entry.endedAt)}`,
        description: entry.description,
        durationMinutes: entry.durationMinutes,
      })),
    };
  }
  await db.insert(timeEntries).values({
    projectId: input.projectId,
    userId: user.id,
    workDate: input.date,
    startedAt,
    endedAt,
    breakMinutes: input.breakMinutes,
    durationMinutes,
    description: input.description,
    billable: input.billable,
    status: membership.approvalRequired ? "draft" : "approved",
  });
  revalidatePath("/dashboard");
  revalidatePath("/timer");
  revalidatePath("/timesheets");
  redirect("/dashboard");
}

const editInputSchema = inputSchema.extend({ entryId: z.uuid() });

export async function updateTimeEntry(formData: FormData) {
  const current = await requireUser();
  const parsed = editInputSchema.safeParse({
    entryId: formData.get("entryId"),
    projectId: formData.get("projectId"),
    date: formData.get("date"),
    start: formData.get("start"),
    end: formData.get("end"),
    breakMinutes: formData.get("breakMinutes") || 0,
    description: formData.get("description"),
    billable: formData.get("billable") === "on",
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid time entry");
  const input = parsed.data;
  const start = parseClockTime(input.start);
  const end = parseClockTime(input.end);
  if (!start || !end) throw new Error("Enter a valid start and end time");
  const elapsed = end.totalMinutes - start.totalMinutes;
  const durationMinutes = elapsed - input.breakMinutes;
  if (elapsed <= 0 || elapsed > 1440)
    throw new Error("End time must be after start time");
  if (durationMinutes <= 0)
    throw new Error("Break must be shorter than the working duration");

  const db = getDb();
  const [existing] = await db
    .select({ userId: timeEntries.userId })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.id, input.entryId),
        eq(timeEntries.userId, current.id),
        isNull(timeEntries.deletedAt),
      ),
    )
    .limit(1);
  if (!existing) throw new Error("You can only update your own time entries");
  const [membership] = await db
    .select({
      status: projects.status,
      approvalRequired: projects.approvalRequired,
      timezone: projects.timezone,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projects.id, projectMembers.projectId))
    .where(
      and(
        eq(projectMembers.projectId, input.projectId),
        eq(projectMembers.userId, current.id),
        isNull(projectMembers.revokedAt),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);
  if (!membership) throw new Error("You do not have access to this project");
  if (membership.status !== "active")
    throw new Error("This project does not accept edited time entries");
  const startedAt = projectDateTimeToUtc(
    input.date,
    start,
    membership.timezone,
  );
  const endedAt = projectDateTimeToUtc(input.date, end, membership.timezone);
  const overlap = await db
    .select({ id: timeEntries.id })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.userId, existing.userId),
        ne(timeEntries.id, input.entryId),
        isNull(timeEntries.deletedAt),
        lt(timeEntries.startedAt, endedAt),
        gt(timeEntries.endedAt, startedAt),
      ),
    )
    .limit(1);
  if (overlap.length) throw new Error("This entry overlaps with existing time");
  await db
    .update(timeEntries)
    .set({
      projectId: input.projectId,
      workDate: input.date,
      startedAt,
      endedAt,
      breakMinutes: input.breakMinutes,
      durationMinutes,
      description: input.description,
      billable: input.billable,
      status: membership.approvalRequired ? "draft" : "approved",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(timeEntries.id, input.entryId),
        eq(timeEntries.userId, current.id),
        isNull(timeEntries.deletedAt),
      ),
    );
  await db.insert(auditLogs).values({
    actorId: current.id,
    action: "time-entry.updated",
    targetType: "time-entry",
    targetId: input.entryId,
    projectId: input.projectId,
    metadata: { editingOwnEntry: true },
  });
  revalidatePath("/dashboard");
  revalidatePath("/timer");
  revalidatePath("/timesheets");
}
