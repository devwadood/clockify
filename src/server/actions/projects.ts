"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { auditLogs, projectMembers, projects } from "@/db/schema";
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

const billingInput = z.object({
  projectId: z.uuid(),
  currency: z.enum(["USD", "PKR", "INR", "EUR", "GBP", "AED"]),
  hourlyRate: z.union([
    z.literal(""),
    z.string().regex(/^\d{1,10}(?:\.\d{1,2})?$/, "Enter a valid hourly rate"),
  ]),
  billable: z.boolean(),
});

export async function updateProjectBilling(formData: FormData) {
  const current = await requireUser();
  const parsed = billingInput.safeParse({
    projectId: formData.get("projectId"),
    currency: formData.get("currency"),
    hourlyRate: String(formData.get("hourlyRate") ?? "").trim(),
    billable: formData.get("billable") === "on",
  });
  if (!parsed.success)
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid billing settings",
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
    throw new Error("You do not have permission to update project billing");
  const [updated] = await db
    .update(projects)
    .set({
      currency: input.currency,
      hourlyRate: input.hourlyRate || null,
      billable: input.billable,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, input.projectId), isNull(projects.deletedAt)))
    .returning({ id: projects.id });
  if (!updated) throw new Error("Project not found");
  await db.insert(auditLogs).values({
    actorId: current.id,
    action: "project.billing-updated",
    targetType: "project",
    targetId: input.projectId,
    projectId: input.projectId,
    metadata: {
      currency: input.currency,
      hourlyRate: input.hourlyRate || null,
      billable: input.billable,
    },
  });
  revalidatePath(`/projects/${input.projectId}`);
  revalidatePath(`/projects/${input.projectId}/settings`);
  revalidatePath("/timer");
  revalidatePath("/reports");
}
