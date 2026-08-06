import { z } from "zod";
export const timeEntrySchema = z.object({
  projectId: z.uuid(), workDate: z.iso.date(), startedAt: z.coerce.date(), endedAt: z.coerce.date(),
  breakMinutes: z.coerce.number().int().min(0).max(600).default(0), description: z.string().trim().min(1).max(240),
  internalNote: z.string().trim().max(2000).optional(), billable: z.boolean().default(true), tags: z.array(z.uuid()).max(20).default([]),
}).superRefine((value, ctx) => {
  const elapsed = (value.endedAt.getTime() - value.startedAt.getTime()) / 60000;
  if (elapsed <= 0) ctx.addIssue({ code: "custom", path: ["endedAt"], message: "End time must be after start time" });
  if (elapsed > 24 * 60) ctx.addIssue({ code: "custom", path: ["endedAt"], message: "An entry cannot exceed 24 hours" });
  if (value.breakMinutes >= elapsed) ctx.addIssue({ code: "custom", path: ["breakMinutes"], message: "Break must be shorter than the entry" });
});
