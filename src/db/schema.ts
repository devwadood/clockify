import { sql } from "drizzle-orm";
import {
  boolean, check, date, index, integer, jsonb, numeric, pgEnum, pgTable,
  primaryKey, text, timestamp, uniqueIndex, uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").defaultRandom().primaryKey();
const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const accountStatus = pgEnum("account_status", ["active", "deactivated"]);
export const projectStatus = pgEnum("project_status", ["active", "archived", "deactivated"]);
export const projectRole = pgEnum("project_role", ["owner", "admin", "member"]);
export const invitationStatus = pgEnum("invitation_status", ["pending", "accepted", "expired", "revoked"]);
export const entryStatus = pgEnum("entry_status", ["draft", "submitted", "approved", "rejected"]);
export const timerStatus = pgEnum("timer_status", ["running", "paused"]);
export const reportStatus = pgEnum("report_status", ["queued", "generating", "ready", "failed"]);

// Better Auth tables. Tokens are only persisted as hashes.
export const user = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  status: accountStatus("status").default("active").notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [uniqueIndex("users_email_idx").on(t.email)]);

export const session = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"), userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("sessions_user_idx").on(t.userId), uniqueIndex("sessions_token_idx").on(t.token)]);

export const account = pgTable("accounts", {
  id: text("id").primaryKey(), accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"), refreshToken: text("refresh_token"), idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"), password: text("password"),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("accounts_user_idx").on(t.userId), uniqueIndex("accounts_provider_idx").on(t.providerId, t.accountId)]);

export const verification = pgTable("verification_tokens", {
  id: text("id").primaryKey(), identifier: text("identifier").notNull(), value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(), createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("verification_identifier_idx").on(t.identifier)]);

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  timezone: text("timezone").default("UTC").notNull(), dateFormat: text("date_format").default("MMM d, yyyy").notNull(),
  weekStartsOn: integer("week_starts_on").default(1).notNull(), emailNotifications: boolean("email_notifications").default(true).notNull(),
  theme: text("theme").default("system").notNull(), updatedAt: updatedAt(),
}, (t) => [check("week_start_valid", sql`${t.weekStartsOn} between 0 and 6`)]);

export const projects = pgTable("projects", {
  id: id(), ownerId: text("owner_id").notNull().references(() => user.id), name: text("name").notNull(),
  description: text("description"), color: text("color").default("#635BFF").notNull(), clientName: text("client_name"),
  code: text("code"), hourlyRate: numeric("hourly_rate", { precision: 12, scale: 2 }), currency: text("currency").default("USD").notNull(),
  timezone: text("timezone").default("UTC").notNull(), startDate: date("start_date").notNull(), endDate: date("end_date"),
  billable: boolean("billable").default(true).notNull(), approvalRequired: boolean("approval_required").default(false).notNull(),
  status: projectStatus("status").default("active").notNull(), deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }), createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("projects_owner_idx").on(t.ownerId), index("projects_status_idx").on(t.status)]);

export const projectMembers = pgTable("project_members", {
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "restrict" }), role: projectRole("role").default("member").notNull(),
  canViewFinancials: boolean("can_view_financials").default(false).notNull(), joinedAt: createdAt(), revokedAt: timestamp("revoked_at", { withTimezone: true }), updatedAt: updatedAt(),
}, (t) => [primaryKey({ columns: [t.projectId, t.userId] }), index("members_user_idx").on(t.userId), index("members_project_idx").on(t.projectId)]);

export const projectInvitations = pgTable("project_invitations", {
  id: id(), projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  inviterId: text("inviter_id").notNull().references(() => user.id), email: text("email").notNull(), role: projectRole("role").default("member").notNull(),
  tokenHash: text("token_hash").notNull().unique(), status: invitationStatus("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(), acceptedById: text("accepted_by_id").references(() => user.id),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }), revokedAt: timestamp("revoked_at", { withTimezone: true }), createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [index("invitations_project_idx").on(t.projectId), index("invitations_email_idx").on(t.email), index("invitations_token_idx").on(t.tokenHash)]);

export const timeEntries = pgTable("time_entries", {
  id: id(), projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "restrict" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "restrict" }), workDate: date("work_date").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(), endedAt: timestamp("ended_at", { withTimezone: true }).notNull(),
  breakMinutes: integer("break_minutes").default(0).notNull(), durationMinutes: integer("duration_minutes").notNull(), description: text("description").notNull(),
  internalNote: text("internal_note"), billable: boolean("billable").default(true).notNull(), status: entryStatus("status").default("approved").notNull(),
  rejectionReason: text("rejection_reason"), deletedAt: timestamp("deleted_at", { withTimezone: true }), createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [
  index("entries_user_date_idx").on(t.userId, t.workDate), index("entries_project_date_idx").on(t.projectId, t.workDate), index("entries_status_idx").on(t.status),
  check("entry_duration_positive", sql`${t.durationMinutes} > 0 and ${t.durationMinutes} <= 1440`), check("entry_break_valid", sql`${t.breakMinutes} >= 0`),
]);

export const activeTimers = pgTable("active_timers", {
  id: id(), userId: text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projects.id), description: text("description"), status: timerStatus("status").default("running").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(), pausedAt: timestamp("paused_at", { withTimezone: true }),
  accumulatedSeconds: integer("accumulated_seconds").default(0).notNull(), createdAt: createdAt(), updatedAt: updatedAt(),
}, (t) => [uniqueIndex("active_timer_user_idx").on(t.userId)]);

export const tags = pgTable("tags", { id: id(), projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }), name: text("name").notNull(), color: text("color").notNull(), createdAt: createdAt() });
export const timeEntryTags = pgTable("time_entry_tags", { timeEntryId: uuid("time_entry_id").notNull().references(() => timeEntries.id, { onDelete: "cascade" }), tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }) }, (t) => [primaryKey({ columns: [t.timeEntryId, t.tagId] })]);

export const timesheetSubmissions = pgTable("timesheet_submissions", { id: id(), userId: text("user_id").notNull().references(() => user.id), projectId: uuid("project_id").references(() => projects.id), weekStart: date("week_start").notNull(), status: entryStatus("status").default("submitted").notNull(), submittedAt: createdAt(), updatedAt: updatedAt() });
export const timesheetApprovals = pgTable("timesheet_approvals", { id: id(), submissionId: uuid("submission_id").notNull().references(() => timesheetSubmissions.id, { onDelete: "cascade" }), reviewerId: text("reviewer_id").notNull().references(() => user.id), decision: entryStatus("decision").notNull(), note: text("note"), createdAt: createdAt() });

export const reports = pgTable("reports", { id: id(), creatorId: text("creator_id").notNull().references(() => user.id), projectId: uuid("project_id").references(() => projects.id), title: text("title").notNull(), status: reportStatus("status").default("queued").notNull(), generatedAt: timestamp("generated_at", { withTimezone: true }), createdAt: createdAt(), updatedAt: updatedAt() }, (t) => [index("reports_creator_idx").on(t.creatorId)]);
export const reportFilters = pgTable("report_filters", { id: id(), reportId: uuid("report_id").notNull().references(() => reports.id, { onDelete: "cascade" }), filters: jsonb("filters").$type<Record<string, unknown>>().notNull(), createdAt: createdAt() });
export const reportFiles = pgTable("report_files", { id: id(), reportId: uuid("report_id").notNull().references(() => reports.id, { onDelete: "cascade" }), blobPathname: text("blob_pathname").notNull(), contentType: text("content_type").default("application/pdf").notNull(), sizeBytes: integer("size_bytes"), checksum: text("checksum"), createdAt: createdAt() });
export const publicReportLinks = pgTable("public_report_links", { id: id(), reportId: uuid("report_id").notNull().references(() => reports.id, { onDelete: "cascade" }), creatorId: text("creator_id").notNull().references(() => user.id), tokenHash: text("token_hash").notNull().unique(), passwordHash: text("password_hash"), expiresAt: timestamp("expires_at", { withTimezone: true }), revokedAt: timestamp("revoked_at", { withTimezone: true }), downloadEnabled: boolean("download_enabled").default(true).notNull(), viewCount: integer("view_count").default(0).notNull(), lastViewedAt: timestamp("last_viewed_at", { withTimezone: true }), createdAt: createdAt() }, (t) => [uniqueIndex("public_report_token_idx").on(t.tokenHash)]);

export const notifications = pgTable("notifications", { id: id(), userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }), type: text("type").notNull(), title: text("title").notNull(), body: text("body").notNull(), href: text("href"), readAt: timestamp("read_at", { withTimezone: true }), createdAt: createdAt() }, (t) => [index("notifications_user_idx").on(t.userId, t.readAt)]);
export const emailLogs = pgTable("email_logs", { id: id(), recipient: text("recipient").notNull(), template: text("template").notNull(), providerMessageId: text("provider_message_id"), status: text("status").notNull(), errorCode: text("error_code"), createdAt: createdAt() });
export const auditLogs = pgTable("audit_logs", { id: id(), actorId: text("actor_id").references(() => user.id), action: text("action").notNull(), targetType: text("target_type").notNull(), targetId: text("target_id").notNull(), projectId: uuid("project_id").references(() => projects.id), metadata: jsonb("metadata").$type<Record<string, unknown>>(), ipAddress: text("ip_address"), userAgent: text("user_agent"), createdAt: createdAt() }, (t) => [index("audit_project_idx").on(t.projectId, t.createdAt), index("audit_actor_idx").on(t.actorId, t.createdAt)]);

export const schema = { user, session, account, verification, userPreferences, projects, projectMembers, projectInvitations, timeEntries, activeTimers, tags, timeEntryTags, timesheetSubmissions, timesheetApprovals, reports, reportFilters, reportFiles, publicReportLinks, notifications, emailLogs, auditLogs };
