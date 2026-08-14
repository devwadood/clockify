"use server";

import { and, eq, gt, isNull, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import {
  activeTimers,
  auditLogs,
  projectMembers,
  projects,
  timeEntries,
} from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { dateInTimeZone } from "@/lib/time/clock";

export type TimerActionState = { error?: string };

const startTimerInput = z.object({
  projectId: z.uuid(),
  description: z.string().trim().min(1).max(240),
});

export async function startTimer(
  previousState: TimerActionState,
  formData: FormData,
): Promise<TimerActionState> {
  void previousState;
  const current = await requireUser();
  const parsed = startTimerInput.safeParse({
    projectId: formData.get("projectId"),
    description: formData.get("description"),
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Enter task details" };
  const db = getDb();
  const [existing] = await db
    .select({ id: activeTimers.id })
    .from(activeTimers)
    .where(eq(activeTimers.userId, current.id))
    .limit(1);
  if (existing) return { error: "You already have an active timer." };
  const [project] = await db
    .select({ id: projects.id })
    .from(projectMembers)
    .innerJoin(projects, eq(projects.id, projectMembers.projectId))
    .where(
      and(
        eq(projectMembers.projectId, parsed.data.projectId),
        eq(projectMembers.userId, current.id),
        isNull(projectMembers.revokedAt),
        eq(projects.status, "active"),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);
  if (!project) return { error: "This project is not available for timing." };
  const [timer] = await db
    .insert(activeTimers)
    .values({
      userId: current.id,
      projectId: parsed.data.projectId,
      description: parsed.data.description,
      status: "running",
      startedAt: new Date(),
      accumulatedSeconds: 0,
    })
    .returning({ id: activeTimers.id });
  await db.insert(auditLogs).values({
    actorId: current.id,
    action: "timer.started",
    targetType: "active-timer",
    targetId: timer.id,
    projectId: parsed.data.projectId,
  });
  revalidatePath("/dashboard");
  revalidatePath("/timer");
  redirect("/timer");
}

export async function stopTimer(
  previousState: TimerActionState,
  formData: FormData,
): Promise<TimerActionState> {
  void previousState;
  const current = await requireUser();
  const timerId = z.uuid().safeParse(formData.get("timerId"));
  if (!timerId.success) return { error: "Invalid timer." };
  const db = getDb();
  const [timer] = await db
    .select({
      id: activeTimers.id,
      projectId: activeTimers.projectId,
      description: activeTimers.description,
      status: activeTimers.status,
      startedAt: activeTimers.startedAt,
      pausedAt: activeTimers.pausedAt,
      accumulatedSeconds: activeTimers.accumulatedSeconds,
      timezone: projects.timezone,
      billable: projects.billable,
      approvalRequired: projects.approvalRequired,
      projectStatus: projects.status,
    })
    .from(activeTimers)
    .innerJoin(projects, eq(projects.id, activeTimers.projectId))
    .innerJoin(
      projectMembers,
      and(
        eq(projectMembers.projectId, activeTimers.projectId),
        eq(projectMembers.userId, activeTimers.userId),
        isNull(projectMembers.revokedAt),
      ),
    )
    .where(
      and(
        eq(activeTimers.id, timerId.data),
        eq(activeTimers.userId, current.id),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);
  if (!timer) return { error: "Active timer not found." };
  if (timer.projectStatus !== "active")
    return { error: "This project no longer accepts time entries." };
  const endedAt =
    timer.status === "paused" && timer.pausedAt ? timer.pausedAt : new Date();
  const liveSeconds =
    timer.status === "running"
      ? Math.max(
          0,
          Math.floor((endedAt.getTime() - timer.startedAt.getTime()) / 1000),
        )
      : 0;
  const elapsedSeconds = timer.accumulatedSeconds + liveSeconds;
  if (elapsedSeconds > 24 * 60 * 60)
    return {
      error: "A timer cannot be saved as an entry longer than 24 hours.",
    };
  const overlap = await db
    .select({ id: timeEntries.id })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.userId, current.id),
        isNull(timeEntries.deletedAt),
        lt(timeEntries.startedAt, endedAt),
        gt(timeEntries.endedAt, timer.startedAt),
      ),
    )
    .limit(1);
  if (overlap.length)
    return {
      error:
        "This timer overlaps an existing entry. Remove or adjust that entry before saving.",
    };
  const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
  const [entry] = await db
    .insert(timeEntries)
    .values({
      projectId: timer.projectId,
      userId: current.id,
      workDate: dateInTimeZone(timer.startedAt, timer.timezone),
      startedAt: timer.startedAt,
      endedAt,
      breakMinutes: 0,
      durationMinutes,
      description: timer.description || "Timed work",
      billable: timer.billable,
      status: timer.approvalRequired ? "draft" : "approved",
    })
    .returning({ id: timeEntries.id });
  await db
    .delete(activeTimers)
    .where(
      and(eq(activeTimers.id, timer.id), eq(activeTimers.userId, current.id)),
    );
  await db.insert(auditLogs).values({
    actorId: current.id,
    action: "timer.stopped",
    targetType: "time-entry",
    targetId: entry.id,
    projectId: timer.projectId,
    metadata: { elapsedSeconds },
  });
  revalidatePath("/dashboard");
  revalidatePath("/timer");
  revalidatePath("/timesheets");
  revalidatePath(`/projects/${timer.projectId}`);
  revalidatePath("/reports");
  redirect("/timer");
}

export async function discardTimer(formData: FormData) {
  const current = await requireUser();
  const timerId = z.uuid().parse(formData.get("timerId"));
  const db = getDb();
  const [timer] = await db
    .delete(activeTimers)
    .where(
      and(eq(activeTimers.id, timerId), eq(activeTimers.userId, current.id)),
    )
    .returning({ id: activeTimers.id, projectId: activeTimers.projectId });
  if (!timer) throw new Error("Active timer not found");
  await db.insert(auditLogs).values({
    actorId: current.id,
    action: "timer.discarded",
    targetType: "active-timer",
    targetId: timer.id,
    projectId: timer.projectId,
  });
  revalidatePath("/dashboard");
  revalidatePath("/timer");
  redirect("/timer");
}
