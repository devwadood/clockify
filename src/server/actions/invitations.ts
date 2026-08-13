"use server";

import { and, eq, gt, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import {
  auditLogs,
  emailLogs,
  projectInvitations,
  projectMembers,
  projects,
  user,
} from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { actionEmail, sendEmail } from "@/lib/email/service";
import { createToken, hashToken } from "@/lib/security/tokens";

export async function inviteTeamMember(formData: FormData) {
  const current = await requireUser();
  const parsed = z
    .object({
      projectId: z.uuid(),
      email: z.email().transform((v) => v.trim().toLowerCase()),
      role: z.enum(["admin", "member"]),
    })
    .safeParse({
      projectId: formData.get("projectId"),
      email: formData.get("email"),
      role: formData.get("role"),
    });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid invitation");
  const { projectId, email, role } = parsed.data;
  const db = getDb();
  const [access] = await db
    .select({
      name: projects.name,
      role: projectMembers.role,
      status: projects.status,
    })
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
  if (!access || !["owner", "admin"].includes(access.role))
    throw new Error("You cannot invite members to this project");
  if (access.status !== "active")
    throw new Error("Invitations are disabled for this project");
  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (existingUser) {
    const member = await db
      .select({ userId: projectMembers.userId })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, existingUser.id),
          isNull(projectMembers.revokedAt),
        ),
      )
      .limit(1);
    if (member.length)
      throw new Error("This person is already a project member");
  }
  const duplicate = await db
    .select({ id: projectInvitations.id })
    .from(projectInvitations)
    .where(
      and(
        eq(projectInvitations.projectId, projectId),
        eq(projectInvitations.email, email),
        eq(projectInvitations.status, "pending"),
        gt(projectInvitations.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (duplicate.length)
    throw new Error("An active invitation already exists for this email");
  const token = createToken();
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  const [invitation] = await db
    .insert(projectInvitations)
    .values({
      projectId,
      inviterId: current.id,
      email,
      role,
      tokenHash: hashToken(token),
      expiresAt,
    })
    .returning({ id: projectInvitations.id });
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000";
  const url = `${baseUrl}/invitations/${token}`;
  const html = actionEmail({
    name: email.split("@")[0],
    title: `Join ${access.name}`,
    message: `${current.name} invited you to collaborate as a ${role}. This invitation expires in 7 days.`,
    action: "Accept invitation",
    url,
  });
  try {
    const result = await sendEmail({
      to: email,
      subject: `${current.name} invited you to ${access.name}`,
      html,
      text: `${current.name} invited you to ${access.name} as a ${role}. Accept: ${url}`,
    });
    await db
      .insert(emailLogs)
      .values({
        recipient: email,
        template: "project-invitation",
        providerMessageId: result?.id ?? null,
        status: "sent",
      });
  } catch {
    await db
      .insert(emailLogs)
      .values({
        recipient: email,
        template: "project-invitation",
        status: "failed",
        errorCode: "delivery_failed",
      });
    throw new Error(
      "Invitation was created, but the email could not be delivered",
    );
  }
  await db
    .insert(auditLogs)
    .values({
      actorId: current.id,
      action: "member.invited",
      targetType: "project-invitation",
      targetId: invitation.id,
      projectId,
      metadata: { email, role },
    });
  revalidatePath("/team");
  revalidatePath(`/projects/${projectId}/members`);
}

export type ProjectInviteState = {
  error?: string;
  success?: string;
};

export async function inviteProjectMember(
  previousState: ProjectInviteState,
  formData: FormData,
): Promise<ProjectInviteState> {
  void previousState;
  try {
    await inviteTeamMember(formData);
    return { success: "Invitation sent successfully." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "The invitation could not be sent",
    };
  }
}

export async function acceptInvitation(formData: FormData) {
  const current = await requireUser();
  const token = z.string().min(20).parse(formData.get("token"));
  const db = getDb();
  const [invitation] = await db
    .select()
    .from(projectInvitations)
    .where(
      and(
        eq(projectInvitations.tokenHash, hashToken(token)),
        eq(projectInvitations.status, "pending"),
        gt(projectInvitations.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!invitation) throw new Error("This invitation is invalid or has expired");
  if (invitation.email.toLowerCase() !== current.email.toLowerCase())
    throw new Error("Sign in with the email address that was invited");
  await db
    .insert(projectMembers)
    .values({
      projectId: invitation.projectId,
      userId: current.id,
      role: invitation.role,
    })
    .onConflictDoUpdate({
      target: [projectMembers.projectId, projectMembers.userId],
      set: { role: invitation.role, revokedAt: null, updatedAt: new Date() },
    });
  await db
    .update(projectInvitations)
    .set({
      status: "accepted",
      acceptedById: current.id,
      acceptedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(projectInvitations.id, invitation.id));
  await db
    .insert(auditLogs)
    .values({
      actorId: current.id,
      action: "member.invitation-accepted",
      targetType: "project-invitation",
      targetId: invitation.id,
      projectId: invitation.projectId,
    });
  revalidatePath("/team");
  revalidatePath("/projects");
  redirect(`/projects/${invitation.projectId}`);
}
