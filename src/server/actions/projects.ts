"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
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

const projectInput = z
  .object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(1000).optional(),
    clientName: z.string().trim().max(100).optional(),
    code: z.string().trim().max(30).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    currency: z.enum(["USD", "PKR", "INR", "EUR", "GBP", "AED"]),
    hourlyRate: z.string().optional(),
    timezone: z.string().min(1).max(80),
    startDate: z.iso.date(),
    endDate: z.union([z.iso.date(), z.literal("")]).optional(),
    billable: z.boolean(),
    approvalRequired: z.boolean(),
  })
  .refine((value) => !value.endDate || value.endDate >= value.startDate, {
    path: ["endDate"],
    message: "End date must be after the start date",
  });

export async function createProject(formData: FormData) {
  const user = await requireUser();
  const parsed = projectInput.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    clientName: formData.get("clientName") || undefined,
    code: formData.get("code") || undefined,
    color: formData.get("color"),
    currency: formData.get("currency"),
    hourlyRate: formData.get("hourlyRate") || undefined,
    timezone: formData.get("timezone"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    billable: formData.get("billable") === "on",
    approvalRequired: formData.get("approvalRequired") === "on",
  });
  if (!parsed.success)
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid project details",
    );
  const input = parsed.data;
  const db = getDb();
  const [project] = await db
    .insert(projects)
    .values({
      ownerId: user.id,
      name: input.name,
      description: input.description,
      clientName: input.clientName,
      code: input.code,
      color: input.color,
      currency: input.currency,
      hourlyRate: input.hourlyRate,
      timezone: input.timezone,
      startDate: input.startDate,
      endDate: input.endDate || null,
      billable: input.billable,
      approvalRequired: input.approvalRequired,
    })
    .returning({ id: projects.id });
  await db.insert(projectMembers).values({
    projectId: project.id,
    userId: user.id,
    role: "owner",
    canViewFinancials: true,
  });
  await db.insert(auditLogs).values({
    actorId: user.id,
    action: "project.created",
    targetType: "project",
    targetId: project.id,
    projectId: project.id,
    metadata: { name: input.name },
  });
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  redirect("/dashboard");
}

const projectSettingsInput = z.object({
  projectId: z.uuid(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  currency: z.enum(["USD", "PKR", "INR", "EUR", "GBP", "AED"]),
  hourlyRate: z.union([
    z.literal(""),
    z.string().regex(/^\d{1,10}(?:\.\d{1,2})?$/, "Enter a valid hourly rate"),
  ]),
  billable: z.boolean(),
});

export async function updateProjectSettings(formData: FormData) {
  const current = await requireUser();
  const parsed = projectSettingsInput.safeParse({
    projectId: formData.get("projectId"),
    color: formData.get("color"),
    currency: formData.get("currency"),
    hourlyRate: String(formData.get("hourlyRate") ?? "").trim(),
    billable: formData.get("billable") === "on",
  });
  if (!parsed.success)
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid project settings",
    );
  const input = parsed.data;
  const db = getDb();
  const [access] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, input.projectId),
        eq(projectMembers.userId, current.id),
        isNull(projectMembers.revokedAt),
      ),
    )
    .limit(1);
  if (!access || (access.role !== "owner" && access.role !== "admin"))
    throw new Error("You do not have permission to update project settings");
  const [updated] = await db
    .update(projects)
    .set({
      currency: input.currency,
      hourlyRate: input.hourlyRate || null,
      billable: input.billable,
      color: input.color,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, input.projectId), isNull(projects.deletedAt)))
    .returning({ id: projects.id });
  if (!updated) throw new Error("Project not found");
  await db.insert(auditLogs).values({
    actorId: current.id,
    action: "project.settings-updated",
    targetType: "project",
    targetId: input.projectId,
    projectId: input.projectId,
    metadata: {
      currency: input.currency,
      hourlyRate: input.hourlyRate || null,
      billable: input.billable,
      color: input.color,
    },
  });
  revalidatePath(`/projects/${input.projectId}`);
  revalidatePath(`/projects/${input.projectId}/settings`);
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/timer");
  revalidatePath("/reports");
}

const membershipActionInput = z.object({
  projectId: z.uuid(),
  memberId: z.string().min(1).optional(),
});

function revalidateMembershipViews(projectId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/members`);
  revalidatePath("/team");
  revalidatePath("/timer");
  revalidatePath("/timesheets");
  revalidatePath("/reports");
}

async function removeMemberData(projectId: string, memberId: string) {
  const db = getDb();
  const removedAt = new Date();
  await db
    .update(projectMembers)
    .set({ revokedAt: removedAt, updatedAt: removedAt })
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, memberId),
        isNull(projectMembers.revokedAt),
      ),
    );
  await db
    .update(timeEntries)
    .set({ deletedAt: removedAt, updatedAt: removedAt })
    .where(
      and(
        eq(timeEntries.projectId, projectId),
        eq(timeEntries.userId, memberId),
        isNull(timeEntries.deletedAt),
      ),
    );
  await db
    .delete(activeTimers)
    .where(
      and(
        eq(activeTimers.projectId, projectId),
        eq(activeTimers.userId, memberId),
      ),
    );
}

export async function leaveProject(formData: FormData) {
  const current = await requireUser();
  const parsed = membershipActionInput.safeParse({
    projectId: formData.get("projectId"),
  });
  if (!parsed.success) throw new Error("Invalid project");
  const { projectId } = parsed.data;
  const db = getDb();
  const [membership] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .innerJoin(projects, eq(projects.id, projectMembers.projectId))
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, current.id),
        isNull(projectMembers.revokedAt),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);
  if (!membership) throw new Error("You are not an active project member");
  if (membership.role === "owner")
    throw new Error("Project owners cannot leave their project");
  await removeMemberData(projectId, current.id);
  await db.insert(auditLogs).values({
    actorId: current.id,
    action: "member.left",
    targetType: "project-member",
    targetId: current.id,
    projectId,
    metadata: { deletedOwnEntries: true },
  });
  revalidateMembershipViews(projectId);
  redirect("/projects");
}

export async function removeProjectMember(formData: FormData) {
  const current = await requireUser();
  const parsed = membershipActionInput.safeParse({
    projectId: formData.get("projectId"),
    memberId: formData.get("memberId"),
  });
  if (!parsed.success || !parsed.data.memberId)
    throw new Error("Invalid project member");
  const { projectId, memberId } = parsed.data;
  if (memberId === current.id) throw new Error("Use Leave project instead");
  const db = getDb();
  const [actor] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .innerJoin(projects, eq(projects.id, projectMembers.projectId))
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, current.id),
        isNull(projectMembers.revokedAt),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);
  if (!actor || (actor.role !== "owner" && actor.role !== "admin"))
    throw new Error("You cannot remove project members");
  const [target] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, memberId),
        isNull(projectMembers.revokedAt),
      ),
    )
    .limit(1);
  if (!target) throw new Error("Project member not found");
  if (target.role !== "member")
    throw new Error("Only members can be removed from a project");
  await removeMemberData(projectId, memberId);
  await db.insert(auditLogs).values({
    actorId: current.id,
    action: "member.removed",
    targetType: "project-member",
    targetId: memberId,
    projectId,
    metadata: { deletedMemberEntries: true },
  });
  revalidateMembershipViews(projectId);
}
