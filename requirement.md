You are a senior full-stack engineer, SaaS architect, database designer, security engineer, and award-winning UI/UX designer.

Build a production-ready SaaS web application for logging project work hours.

## Project Overview

Create a fast, durable, secure, and highly polished hours-logging platform where users can:

* Create projects.
* Invite other users to projects.
* Log working hours against projects.
* View and manage their own time entries.
* Allow invited project members to log their hours.
* Manage project members and revoke their access.
* Generate professional reports.
* Export reports as PDF files.
* Share reports using secure public links.
* Deactivate their account.
* Deactivate or archive projects.

The production application will be deployed at:

`https://clockify.abdulwadood.com`

Build the frontend with exceptional UI/UX quality. The interface should feel like it was designed by champions of modern SaaS UI/UX: clean, fast, accessible, responsive, consistent, and pleasant to use.

Do not build a basic CRUD dashboard. Build a polished, production-quality SaaS product.

---

# Technology Stack

Use the following stack:

* Next.js using the latest stable App Router architecture.
* TypeScript with strict mode enabled.
* React Server Components where appropriate.
* Server Actions and Route Handlers where appropriate.
* Tailwind CSS.
* Neon PostgreSQL.
* Drizzle ORM.
* Resend for transactional emails.
* Vercel Blob for generated PDF reports and other uploaded/generated files.
* Vercel for deployment.
* Zod for validation.
* React Hook Form for complex client-side forms.
* A secure authentication solution compatible with Next.js, Neon, and Vercel.
* Use passwordless email authentication or email/password authentication with email verification.
* Use secure HTTP-only cookies and server-side session validation.
* Use a reliable React PDF generation library or server-compatible PDF solution.
* Use a component system based on accessible primitives, such as shadcn/ui and Radix UI.
* Use Lucide icons.
* Use date-fns for date handling.
* Use a lightweight charting solution for reports and dashboard analytics.

Do not use Firebase, Supabase, or a separate backend service.

Next.js must provide both the frontend and backend.

---

# Core Product Requirements

## 1. Authentication

Implement:

* User registration.
* Login.
* Logout.
* Email verification.
* Forgot password.
* Reset password.
* Secure session management.
* Protection against unauthorized access.
* Profile deactivation.
* Account reactivation flow where appropriate.

User fields should include:

* ID.
* Full name.
* Email.
* Profile image.
* Timezone.
* Preferred date format.
* Preferred week start day.
* Account status.
* Created date.
* Updated date.
* Deactivated date.

All stored dates must use UTC.

Display dates and times according to the user’s selected timezone.

---

## 2. User Onboarding

After registration, show a short onboarding flow:

1. Confirm full name.
2. Select timezone.
3. Select preferred date format.
4. Create the first project.
5. Optionally invite team members.

The onboarding process must be skippable after the required fields are completed.

Show an onboarding checklist on the dashboard until the user completes the important setup steps.

---

## 3. Projects

Users can create projects with:

* Project name.
* Description.
* Project color.
* Client name.
* Optional project code.
* Optional hourly rate.
* Currency.
* Project timezone.
* Start date.
* Optional end date.
* Billable or non-billable status.
* Active, archived, or deactivated status.

The user who creates the project becomes the project owner and administrator.

Project owners can:

* Edit the project.
* Archive the project.
* Deactivate the project.
* Reactivate the project.
* Permanently delete the project only through a protected confirmation flow.
* Invite project members.
* Remove project members.
* Revoke pending invitations.
* Change member roles.
* View all project time entries.
* Edit or delete member time entries, with audit logging.
* Generate reports.
* Create public report links.

A deactivated or archived project must not accept new time entries.

Existing historical time entries must remain available.

---

## 4. Project Membership and Roles

Implement these project roles:

### Owner

* Full control over the project.
* Cannot be removed by another member.
* Can transfer project ownership.
* Can deactivate or permanently delete the project.

### Admin

* Can manage project settings.
* Can invite and remove members.
* Can view and manage all time entries.
* Can generate and share reports.
* Cannot delete the project owner.
* Cannot transfer ownership unless explicitly allowed by the owner.

### Member

* Can view the projects they belong to.
* Can log their own hours.
* Can edit or delete their own time entries.
* Can view their own reports.
* Cannot manage other members.
* Cannot manage project settings.
* Cannot view financial information unless permission is granted.

Use server-side role checks for every protected operation.

Do not rely only on frontend permission checks.

---

## 5. Invitations

Project owners and admins can invite people by email.

Invitation requirements:

* Send invitations through Resend.
* Invitation links must contain a secure, random, single-use token.
* Invitations must expire after a configurable period, such as seven days.
* Users can resend invitations.
* Users can revoke pending invitations.
* Existing users can accept the invitation after login.
* New users can create an account and automatically join the project.
* Do not allow duplicate active invitations.
* Show invitation status:

  * Pending.
  * Accepted.
  * Expired.
  * Revoked.

Email templates must be professional and responsive.

Invitation emails should include:

* Inviter’s name.
* Project name.
* Assigned role.
* Expiration information.
* Accept invitation button.
* Plain-text fallback link.

---

## 6. Time Tracking and Hour Logging

Users must be able to log work using two methods.

### Manual Time Entry

Fields:

* Project.
* Work date.
* Start time.
* End time.
* Break duration.
* Calculated total duration.
* Description.
* Billable status.
* Optional tags.
* Optional internal note.

### Timer

Provide a start/stop timer:

* Select a project.
* Enter an optional task description.
* Start timer.
* Pause timer.
* Resume timer.
* Stop timer.
* Convert the timer into a saved time entry.
* Persist the active timer so refreshing the page does not lose it.
* Prevent users from accidentally running multiple timers simultaneously.
* Show a confirmation before replacing an active timer.

Time entry validation:

* End time must be after start time.
* Total duration must be positive.
* Break duration cannot exceed the working duration.
* Prevent clearly invalid or excessively long entries.
* Detect overlapping entries for the same user.
* Show a warning for overlapping entries.
* Allow authorized users to resolve overlaps.
* Prevent entries on deactivated projects.
* Prevent revoked members from creating new entries.

Time entries should support:

* Draft status.
* Submitted status.
* Approved status.
* Rejected status.

For the initial version, approval can be configurable at the project level.

When approval is disabled, entries can be treated as automatically approved.

---

## 7. Timesheet Views

Create the following views:

### Daily View

* Timeline of work entries.
* Total hours for the day.
* Billable and non-billable totals.

### Weekly View

* Week navigation.
* Daily totals.
* Project totals.
* Add time entry directly into a day.
* Copy entries from the previous week.
* Submit weekly timesheet when approval is enabled.

### Monthly View

* Calendar-style overview.
* Hours per day.
* Total monthly hours.
* Highlight weekends and missing days.

### List View

* Sortable and filterable data table.
* Search by description, project, member, or tag.
* Pagination.
* Bulk selection for authorized users.
* Bulk delete or status updates for authorized users.

---

## 8. Dashboard

Create a modern dashboard with:

* Greeting and current date.
* Active timer card.
* Hours logged today.
* Hours logged this week.
* Hours logged this month.
* Billable hours.
* Non-billable hours.
* Recently used projects.
* Recent time entries.
* Weekly activity chart.
* Project distribution chart.
* Pending invitations.
* Pending timesheet approvals.
* Quick actions:

  * Start timer.
  * Add time entry.
  * Create project.
  * Invite member.
  * Generate report.

Dashboard information must be based on the authenticated user’s permissions.

Use skeleton states while data is loading.

Provide well-designed empty states instead of blank sections.

---

## 9. Reports

Create a flexible report builder.

Report filters:

* Date range.
* Project.
* One or multiple members.
* Billable status.
* Entry status.
* Tags.
* Client.
* Minimum or maximum duration.
* Group by project, user, day, week, or month.

Report summary:

* Total hours.
* Billable hours.
* Non-billable hours.
* Billable amount.
* Average hours per day.
* Hours by project.
* Hours by user.
* Hours by date.
* Hours by tag.

Report table:

* Date.
* Member.
* Project.
* Description.
* Start time.
* End time.
* Break.
* Total duration.
* Billable status.
* Billable amount.
* Entry status.

Allow users to save report filter configurations.

---

## 10. PDF Report Generation

Users with permission can generate professional PDF reports.

PDF requirements:

* Company or workspace name.
* Project name.
* Report title.
* Selected report period.
* Generated date and time.
* Generated by.
* Applied filters.
* Summary totals.
* Charts where practical.
* Detailed time-entry table.
* Page numbers.
* Consistent header and footer.
* Clean printing layout.
* Professional typography.
* Support for multiple pages.
* Avoid splitting important rows incorrectly.
* Display durations consistently.
* Display financial values using the project currency.

PDF generation flow:

1. Validate the user’s report access.
2. Fetch the relevant data securely.
3. Generate the PDF on the server.
4. Upload the PDF to Vercel Blob.
5. Store report metadata in Neon PostgreSQL.
6. Return the report download URL.
7. Allow the report creator to download or share it.

Do not expose private Blob URLs directly where authorization is required.

Use a controlled download route or signed access mechanism.

---

## 11. Public Report Sharing

Users can create a public share link for a generated report.

Public link requirements:

* Use a long, cryptographically secure token.
* Never expose a sequential database ID.
* Allow an optional expiration date.
* Allow password protection.
* Allow the owner to revoke the link.
* Track view count.
* Track last viewed date.
* Do not expose internal project information beyond what is included in the report.
* Include `noindex` and `nofollow`.
* Do not expose private navigation or authenticated application controls.
* Show a clean public report page.
* Provide a PDF download button when enabled.
* Allow report creators to disable downloading while allowing browser viewing.
* Return a generic response for invalid, expired, or revoked links.

Public reports should be accessible through a route similar to:

`/shared/reports/[token]`

---

## 12. Profile Management

Users can manage:

* Full name.
* Profile image.
* Timezone.
* Date format.
* Week start day.
* Password or authentication settings.
* Notification preferences.
* Profile deactivation.

Profile deactivation requirements:

* Ask for confirmation.
* Explain the impact.
* End active sessions.
* Stop future project activity.
* Preserve existing historical time entries.
* Do not remove project history.
* Allow another owner to retain project data.
* Require project ownership transfer before deactivation when necessary.
* Allow reactivation through a secure process.

---

## 13. Project Deactivation

When a project is deactivated:

* Members can view historical entries if permitted.
* New time entries cannot be created.
* Active timers for that project must be stopped or cancelled.
* Invitations must be disabled.
* Reports can still be generated from historical data.
* Existing public report links can remain active unless explicitly revoked.
* The owner can reactivate the project.

Use soft deletion or status-based deactivation for important business records.

Avoid destructive deletion by default.

---

# Database Design

Create a normalized PostgreSQL schema using Drizzle ORM.

At minimum, include tables for:

* users
* accounts
* sessions
* verification_tokens
* user_preferences
* projects
* project_members
* project_invitations
* time_entries
* active_timers
* tags
* time_entry_tags
* timesheet_submissions
* timesheet_approvals
* reports
* report_filters
* report_files
* public_report_links
* notifications
* email_logs
* audit_logs

Use:

* UUID or secure non-sequential IDs.
* Foreign keys.
* Unique constraints.
* Check constraints.
* Indexes for common queries.
* `created_at`.
* `updated_at`.
* Soft-delete or deactivation timestamps where appropriate.

Important indexes should cover:

* User email.
* Project owner.
* Project member lookup.
* Time entries by user and date.
* Time entries by project and date.
* Active invitation token.
* Public report token.
* Active timers by user.
* Report creator.
* Entry status.
* Project status.

Create safe database migrations.

Do not use automatic schema synchronization in production.

---

# Security Requirements

Treat security as a core feature.

Implement:

* Server-side authentication checks.
* Server-side authorization checks.
* Role-based access control.
* Secure cookies.
* CSRF protection where applicable.
* Rate limiting for sensitive endpoints.
* Rate limiting for authentication and public share pages.
* Zod validation for all input.
* Sanitization for user-provided text.
* Secure invitation tokens.
* Secure report-sharing tokens.
* Hashed passwords for protected report links.
* No sensitive data in client bundles.
* No secrets exposed through `NEXT_PUBLIC_` variables.
* Protection against IDOR vulnerabilities.
* Protection against SQL injection through parameterized ORM queries.
* Safe file access.
* Safe error messages.
* Audit logging for sensitive operations.
* Security headers.
* Content Security Policy.
* `X-Content-Type-Options`.
* `Referrer-Policy`.
* `Permissions-Policy`.
* Clickjacking protection.
* Appropriate caching rules for private pages.

Sensitive actions that require audit logs:

* Project creation.
* Project update.
* Project deactivation.
* Project deletion.
* Member invitation.
* Member removal.
* Role update.
* Ownership transfer.
* Time entry modification by an admin.
* Report generation.
* Public link creation.
* Public link revocation.
* Profile deactivation.

Audit records should include:

* Actor.
* Action.
* Target type.
* Target ID.
* Project ID when relevant.
* Timestamp.
* Safe metadata.
* IP address when legally and technically appropriate.
* User agent when appropriate.

Never store passwords, tokens, or secrets in audit metadata.

---

# Performance and Durability

The application must be optimized for Vercel and Neon.

Use:

* Server Components for data-heavy pages.
* Client Components only where interactivity is required.
* Efficient SQL queries.
* Pagination for large datasets.
* Database indexes.
* Select only required columns.
* Avoid N+1 queries.
* Cache only safe, non-user-specific data.
* Revalidate data carefully after mutations.
* Lazy loading for heavy UI components.
* Dynamic imports for charts and PDF preview components.
* Optimistic updates only where rollback is safe.
* Debounced search.
* Streaming and Suspense where useful.
* Background-friendly PDF generation architecture.
* Idempotent report generation where possible.
* Transactions for multi-step database mutations.
* Retry-safe email operations.
* Retry-safe Blob uploads.
* Clear failure states.

Do not keep entire large reports unnecessarily in memory.

Generate and upload reports efficiently.

Design the application so it can later support queues or background jobs without requiring a complete rewrite.

---

# UI/UX Direction

The product must look premium and modern.

Design inspiration:

* Linear.
* Vercel.
* Stripe Dashboard.
* Notion.
* Raycast.
* Modern project-management and time-tracking SaaS products.

Do not directly copy any company’s branding or layout.

Use an original design system.

## Visual Style

* Clean light mode.
* Carefully designed dark mode.
* Neutral background colors.
* One strong but professional accent color.
* High readability.
* Clear visual hierarchy.
* Generous whitespace.
* Soft borders.
* Subtle shadows.
* Carefully designed hover and focus states.
* Consistent spacing.
* Consistent border radius.
* Smooth but restrained animations.
* Avoid excessive gradients.
* Avoid glassmorphism overuse.
* Avoid clutter.
* Avoid oversized cards that waste space.

## UX Requirements

* Fully responsive.
* Mobile-first behavior.
* Accessible keyboard navigation.
* Visible focus indicators.
* WCAG-friendly contrast.
* Proper ARIA labels.
* Good tab order.
* Tooltips for unfamiliar actions.
* Confirmation dialogs for destructive operations.
* Undo toast when possible.
* Helpful validation messages.
* Empty states with clear actions.
* Loading skeletons.
* Error boundaries.
* Friendly error messages.
* Clear success feedback.
* Preserve user input when an operation fails.
* Avoid unnecessary full-page reloads.
* Use drawers or sheets on mobile where appropriate.
* Make time entry creation extremely fast.

## Application Navigation

Desktop:

* Collapsible left sidebar.
* Top header.
* Workspace or account switcher area.
* Search or command menu.
* Notification button.
* Profile menu.

Mobile:

* Compact header.
* Bottom navigation or accessible mobile drawer.
* Floating action for quickly adding time.
* Touch-friendly controls.

Sidebar sections:

* Dashboard.
* Timer.
* Timesheets.
* Projects.
* Reports.
* Team.
* Shared reports.
* Settings.

Display only navigation items the user has permission to access.

---

# Important Pages

Create these routes or equivalent App Router route groups:

* `/`
* `/login`
* `/register`
* `/verify-email`
* `/forgot-password`
* `/reset-password`
* `/onboarding`
* `/dashboard`
* `/timer`
* `/timesheets`
* `/timesheets/day`
* `/timesheets/week`
* `/timesheets/month`
* `/projects`
* `/projects/new`
* `/projects/[projectId]`
* `/projects/[projectId]/settings`
* `/projects/[projectId]/members`
* `/projects/[projectId]/timesheets`
* `/projects/[projectId]/reports`
* `/reports`
* `/reports/new`
* `/reports/[reportId]`
* `/reports/[reportId]/preview`
* `/shared/reports/[token]`
* `/invitations/[token]`
* `/team`
* `/notifications`
* `/settings/profile`
* `/settings/preferences`
* `/settings/security`
* `/settings/notifications`

Use route groups for authenticated and unauthenticated areas.

---

# Email Requirements

Use Resend for:

* Email verification.
* Password reset.
* Project invitations.
* Invitation reminders.
* Invitation acceptance notification.
* Role change notification.
* Access revocation notification.
* Report shared notification.
* Account deactivation confirmation.
* Project deactivation notification.

Create reusable responsive email templates.

Create an email service abstraction rather than calling Resend directly from every feature.

In development, support a safe email preview or logging mode.

Never send real production emails from automated tests.

---

# Notifications

Add an in-app notification system.

Notification examples:

* You were invited to a project.
* An invitation was accepted.
* Your role was changed.
* Your project access was revoked.
* A timesheet was submitted.
* A timesheet was approved.
* A timesheet was rejected.
* A report was generated.
* A public report link was created.
* A project was deactivated.

Users should be able to:

* Mark a notification as read.
* Mark all as read.
* View unread count.
* Configure email notification preferences.

---

# Error Handling

Implement consistent typed error handling.

Create reusable error categories:

* Authentication error.
* Authorization error.
* Validation error.
* Not found error.
* Conflict error.
* Rate-limit error.
* Database error.
* Email delivery error.
* Blob upload error.
* PDF generation error.

Log server errors safely.

Do not return stack traces or sensitive implementation details to users.

Add error boundaries and not-found pages.

---

# Testing

Set up:

* Unit tests.
* Integration tests.
* End-to-end tests.
* Database-related tests using an isolated test database.
* Permission tests.
* Validation tests.
* Invitation-flow tests.
* Time-entry tests.
* Report-generation tests.
* Public-link security tests.

Use Playwright for end-to-end testing.

Critical test scenarios:

1. A project owner creates a project.
2. The owner invites another user.
3. A new user accepts the invitation.
4. The member logs hours.
5. The member cannot manage project settings.
6. The admin can view the member’s entries.
7. The owner revokes the member’s access.
8. The revoked member cannot add new entries.
9. Existing historical entries remain available.
10. A report is generated successfully.
11. A report is uploaded to Blob storage.
12. A public link opens the correct report.
13. An expired public link is rejected.
14. A revoked public link is rejected.
15. Unauthorized users cannot access private reports.
16. A deactivated project rejects new entries.
17. Account deactivation preserves historical data.

---

# Development Experience

Configure:

* ESLint.
* Prettier.
* TypeScript strict mode.
* Environment variable validation.
* Database migration scripts.
* Seed scripts.
* Test scripts.
* Production build scripts.
* Git hooks where appropriate.
* Consistent import aliases.
* Clear folder structure.
* Reusable domain services.
* Reusable repository or query modules where useful.

Suggested folder structure:

```text
src/
  app/
  components/
    ui/
    layout/
    forms/
    dashboard/
    projects/
    time-entries/
    reports/
  db/
    schema/
    migrations/
    queries/
  features/
    auth/
    users/
    projects/
    memberships/
    invitations/
    time-tracking/
    reports/
    notifications/
  lib/
    auth/
    email/
    blob/
    pdf/
    permissions/
    validation/
    dates/
    rate-limit/
    security/
  server/
    actions/
    services/
  types/
  hooks/
  emails/
  tests/
```

Keep business logic outside page components.

Avoid putting large amounts of logic directly inside Server Actions.

Use service functions for important operations.

---

# Environment Variables

Create a documented `.env.example` containing placeholders such as:

```env
DATABASE_URL=
AUTH_SECRET=
APP_URL=http://localhost:3000

RESEND_API_KEY=
EMAIL_FROM=

BLOB_READ_WRITE_TOKEN=

CRON_SECRET=
SENTRY_DSN=
NEXT_PUBLIC_APP_NAME=Hours Logger
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Validate required environment variables at startup.

Do not commit actual secrets.

---

# Deployment

Prepare the application for deployment on Vercel.

Production domain:

`clockify.abdulwadood.com`

Deployment requirements:

* Production-ready Vercel configuration.
* Neon database connection handling suitable for serverless execution.
* Vercel Blob integration.
* Secure production environment variables.
* Database migration process.
* Custom domain setup documentation.
* DNS configuration guidance.
* Correct authentication callback URLs.
* Correct Resend production sender configuration.
* Proper security headers.
* Production logging.
* Error monitoring integration points.
* Health-check endpoint.
* Robots and sitemap behavior.
* Public pages indexable only where appropriate.
* Authenticated and public-report pages must not be indexed.

Create a deployment guide explaining:

1. Creating the Neon database.
2. Running migrations.
3. Creating the Resend API key.
4. Verifying the sending domain.
5. Configuring Vercel Blob.
6. Adding Vercel environment variables.
7. Deploying to Vercel.
8. Configuring `clockify.abdulwadood.com`.
9. Updating authentication callback URLs.
10. Testing production email, report generation, and sharing.

---

# Seed Data

Create a seed script with:

* One project owner.
* One project admin.
* Two project members.
* Three sample projects.
* Sample invitations.
* Several weeks of time entries.
* Billable and non-billable entries.
* Multiple entry statuses.
* Sample reports.
* One active public report.
* One expired public report.
* Notifications.

The seed data should make the dashboard and reports visually meaningful.

---

# Product Branding

Use a temporary product name such as:

`HourFlow`

Keep the product name configurable so it can be changed later.

Create:

* Wordmark.
* Simple icon-based logo placeholder.
* Favicon.
* App metadata.
* Open Graph metadata.
* Email branding.
* PDF report branding.

Do not use Clockify’s logo, branding, copyrighted assets, or copied interface.

---

# Implementation Process

Work incrementally.

## Phase 1: Planning

Before creating application code:

1. Analyze all requirements.
2. Propose the system architecture.
3. Define the database schema.
4. Define authorization rules.
5. Define route structure.
6. Define major components.
7. Define the report-generation architecture.
8. Identify security risks.
9. Identify serverless limitations.
10. Produce a phased implementation plan.

Do not begin with random UI components.

## Phase 2: Foundation

Build:

* Next.js application.
* Tailwind configuration.
* Design system.
* Database setup.
* Authentication.
* Root layouts.
* Navigation.
* Environment validation.
* Error handling.

## Phase 3: Core Features

Build:

* Projects.
* Membership.
* Invitations.
* Time entries.
* Active timer.
* Timesheet views.
* Role-based access.

## Phase 4: Reporting

Build:

* Report filters.
* Report results.
* Charts.
* PDF generation.
* Blob storage.
* Download flow.
* Public report links.

## Phase 5: Polish

Add:

* Responsive behavior.
* Dark mode.
* Accessibility.
* Loading states.
* Empty states.
* Notifications.
* Audit logs.
* Performance improvements.

## Phase 6: Verification

Run:

* Type checking.
* Linting.
* Unit tests.
* Integration tests.
* Playwright tests.
* Production build.
* Security review.
* Permission review.
* Responsive UI review.

Fix all critical errors before considering the project complete.

---

# Coding Rules

* Use TypeScript everywhere.
* Avoid `any`.
* Use explicit types for domain models.
* Use Zod schemas for external input.
* Prefer server-side data fetching.
* Avoid unnecessary global state.
* Do not expose database models directly to client components.
* Use DTOs or safe mapped objects.
* Write readable and maintainable code.
* Keep functions focused.
* Avoid oversized components.
* Add comments only where the reasoning is not obvious.
* Use transactions for important multi-table operations.
* Make mutations idempotent where possible.
* Use consistent naming.
* Do not leave placeholder TODO implementations in critical flows.
* Do not silently ignore errors.
* Do not mock core production functionality.
* Do not bypass permissions for convenience.
* Do not use fake frontend-only authentication.
* Do not store timers only in browser memory.
* Do not store generated PDF files inside the Git repository.
* Do not hardcode production URLs.
* Do not hardcode currencies or timezones.
* Do not use client-side checks as the only security layer.

---

# Acceptance Criteria

The project is complete only when:

* A user can register and log in.
* A user can create a project.
* The project creator becomes the owner.
* The owner can invite another user.
* Invitation emails are sent through Resend.
* A new or existing user can accept the invitation.
* A member can log hours.
* A member cannot access admin-only settings.
* An owner or admin can manage members.
* Revoked users can no longer create project entries.
* Existing historical entries remain intact.
* Users can use manual entries and timers.
* Users can view daily, weekly, and monthly timesheets.
* Authorized users can generate reports.
* Reports can be exported to professional PDFs.
* PDFs are stored in Vercel Blob.
* Authorized users can download reports.
* Public report links can be created.
* Public links can expire or be revoked.
* Public reports do not expose unauthorized information.
* Profiles can be deactivated safely.
* Projects can be deactivated safely.
* The UI works on desktop, tablet, and mobile.
* Dark and light modes work correctly.
* Accessibility checks pass for critical workflows.
* Type checking passes.
* Linting passes.
* Automated tests pass.
* The production build succeeds.
* Deployment documentation is complete.

---

# First Response Instructions

Start by giving me:

1. A concise architectural overview.
2. Recommended authentication approach.
3. Database entity relationship summary.
4. Role and permission matrix.
5. Folder structure.
6. Implementation phases.
7. Main security risks and mitigations.
8. Any important assumptions.

After presenting the plan, begin implementing the foundation.

When making architectural decisions, prefer simplicity, security, maintainability, performance, and long-term durability over unnecessary complexity.
