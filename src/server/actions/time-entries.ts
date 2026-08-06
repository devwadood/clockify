"use server";

import { and, eq, gt, isNull, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { projectMembers, projects, timeEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

const inputSchema = z.object({ projectId: z.uuid(), date: z.iso.date(), start: z.string().regex(/^\d{2}:\d{2}$/), end: z.string().regex(/^\d{2}:\d{2}$/), breakMinutes: z.coerce.number().int().min(0).max(600), description: z.string().trim().min(1).max(240), billable: z.boolean() });

export async function createTimeEntry(formData: FormData) {
  const user = await requireUser();
  const parsed = inputSchema.safeParse({ projectId: formData.get("projectId"), date: formData.get("date"), start: formData.get("start"), end: formData.get("end"), breakMinutes: formData.get("breakMinutes") || 0, description: formData.get("description"), billable: formData.get("billable") === "on" });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid time entry");
  const input = parsed.data;
  const startedAt = new Date(`${input.date}T${input.start}:00Z`); const endedAt = new Date(`${input.date}T${input.end}:00Z`);
  const elapsed = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000); const durationMinutes = elapsed - input.breakMinutes;
  if (elapsed <= 0 || elapsed > 1440) throw new Error("End time must be after start time");
  if (durationMinutes <= 0) throw new Error("Break must be shorter than the working duration");
  const db = getDb();
  const [membership] = await db.select({ status: projects.status, approvalRequired: projects.approvalRequired }).from(projectMembers).innerJoin(projects, eq(projects.id, projectMembers.projectId)).where(and(eq(projectMembers.projectId, input.projectId), eq(projectMembers.userId, user.id), isNull(projectMembers.revokedAt), isNull(projects.deletedAt))).limit(1);
  if (!membership) throw new Error("You do not have access to this project");
  if (membership.status !== "active") throw new Error("This project does not accept new time entries");
  const overlap = await db.select({ id: timeEntries.id }).from(timeEntries).where(and(eq(timeEntries.userId, user.id), isNull(timeEntries.deletedAt), lt(timeEntries.startedAt, endedAt), gt(timeEntries.endedAt, startedAt))).limit(1);
  if (overlap.length) throw new Error("This entry overlaps with existing time");
  await db.insert(timeEntries).values({ projectId: input.projectId, userId: user.id, workDate: input.date, startedAt, endedAt, breakMinutes: input.breakMinutes, durationMinutes, description: input.description, billable: input.billable, status: membership.approvalRequired ? "draft" : "approved" });
  revalidatePath("/dashboard"); revalidatePath("/timer"); revalidatePath("/timesheets");
  redirect("/dashboard");
}
