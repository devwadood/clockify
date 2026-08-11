"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { auditLogs, projectMembers, projects, publicReportLinks, reportFilters, reports } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { createToken, hashToken } from "@/lib/security/tokens";

const reportInput = z.object({
  title: z.string().trim().min(2).max(120),
  projectId: z.union([z.uuid(), z.literal("")]),
  from: z.iso.date(), to: z.iso.date(),
  billable: z.enum(["any", "yes", "no"]).default("any"),
}).refine((value) => value.to >= value.from, { path: ["to"], message: "End date must be on or after start date" });

export async function generateReport(formData: FormData) {
  const current = await requireUser();
  const parsed = reportInput.safeParse({ title: formData.get("title"), projectId: formData.get("projectId") || "", from: formData.get("from"), to: formData.get("to"), billable: formData.get("billable") || "any" });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid report filters");
  const input = parsed.data;
  const db = getDb();
  if (input.projectId) {
    const access = await db.select({ id: projects.id }).from(projectMembers).innerJoin(projects, eq(projects.id, projectMembers.projectId)).where(and(eq(projectMembers.userId, current.id), eq(projectMembers.projectId, input.projectId), isNull(projectMembers.revokedAt), isNull(projects.deletedAt))).limit(1);
    if (!access.length) throw new Error("You do not have access to this project");
  }
  const [report] = await db.insert(reports).values({ creatorId: current.id, projectId: input.projectId || null, title: input.title, status: "ready", generatedAt: new Date() }).returning({ id: reports.id });
  await db.insert(reportFilters).values({ reportId: report.id, filters: { from: input.from, to: input.to, billable: input.billable } });
  await db.insert(auditLogs).values({ actorId: current.id, action: "report.generated", targetType: "report", targetId: report.id, projectId: input.projectId || null, metadata: { from: input.from, to: input.to, billable: input.billable } });
  revalidatePath("/reports");
  redirect(`/reports/${report.id}`);
}

export async function createReportShareLink(formData: FormData) {
  const current = await requireUser();
  const parsed = z.object({ reportId: z.uuid(), expiresIn: z.enum(["never", "7", "30"]), downloadEnabled: z.boolean() }).safeParse({ reportId: formData.get("reportId"), expiresIn: formData.get("expiresIn") || "30", downloadEnabled: formData.get("downloadEnabled") === "on" });
  if (!parsed.success) throw new Error("Invalid sharing options");
  const db = getDb();
  const [report] = await db.select({ id: reports.id, projectId: reports.projectId }).from(reports).where(and(eq(reports.id, parsed.data.reportId), eq(reports.creatorId, current.id), eq(reports.status, "ready"))).limit(1);
  if (!report) throw new Error("Report not found or not ready");
  const token = createToken();
  const expiresAt = parsed.data.expiresIn === "never" ? null : new Date(Date.now() + Number(parsed.data.expiresIn) * 86400000);
  const [link] = await db.insert(publicReportLinks).values({ reportId: report.id, creatorId: current.id, tokenHash: hashToken(token), expiresAt, downloadEnabled: parsed.data.downloadEnabled }).returning({ id: publicReportLinks.id });
  await db.insert(auditLogs).values({ actorId: current.id, action: "report-link.created", targetType: "public-report-link", targetId: link.id, projectId: report.projectId, metadata: { expiresAt: expiresAt?.toISOString() ?? null, downloadEnabled: parsed.data.downloadEnabled } });
  revalidatePath("/shared-reports");
  redirect(`/shared/reports/${token}`);
}

export async function revokeReportShareLink(formData: FormData) {
  const current = await requireUser();
  const id = z.uuid().parse(formData.get("linkId"));
  const db = getDb();
  const [link] = await db.update(publicReportLinks).set({ revokedAt: new Date() }).where(and(eq(publicReportLinks.id, id), eq(publicReportLinks.creatorId, current.id), isNull(publicReportLinks.revokedAt))).returning({ id: publicReportLinks.id, reportId: publicReportLinks.reportId });
  if (!link) throw new Error("Share link not found");
  await db.insert(auditLogs).values({ actorId: current.id, action: "report-link.revoked", targetType: "public-report-link", targetId: id });
  revalidatePath("/shared-reports");
}
