import Link from "next/link";
import { and, desc, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Check,
  LogOut,
  Palette,
  Plus,
  Save,
  Trash2,
  UserMinus,
} from "lucide-react";
import { getDb } from "@/db";
import { projectMembers, projects, timeEntries, user } from "@/db/schema";
import { ProjectInviteForm } from "@/components/projects/project-invite-form";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { requireUser } from "@/lib/auth/session";
import { formatDuration, initials } from "@/lib/utils";
import {
  leaveProject,
  removeProjectMember,
  updateProjectSettings,
} from "@/server/actions/projects";
import { deleteTimeEntry } from "@/server/actions/time-entries";
import { PROJECT_COLORS } from "@/lib/projects/colors";

export async function ProjectPage({
  projectId,
  tab = "overview",
}: {
  projectId: string;
  tab?: string;
}) {
  const current = await requireUser();
  const db = getDb();
  const [project] = await db
    .select({
      id: projects.id,
      name: projects.name,
      client: projects.clientName,
      code: projects.code,
      color: projects.color,
      status: projects.status,
      description: projects.description,
      currency: projects.currency,
      hourlyRate: projects.hourlyRate,
      billable: projects.billable,
      role: projectMembers.role,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projects.id, projectMembers.projectId))
    .where(
      and(
        eq(projectMembers.userId, current.id),
        eq(projects.id, projectId),
        isNull(projectMembers.revokedAt),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);
  if (!project) notFound();
  const [entries, members] = await Promise.all([
    db
      .select({
        id: timeEntries.id,
        userId: timeEntries.userId,
        description: timeEntries.description,
        startedAt: timeEntries.startedAt,
        durationMinutes: timeEntries.durationMinutes,
        status: timeEntries.status,
      })
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.projectId, project.id),
          isNull(timeEntries.deletedAt),
          project.role === "member"
            ? eq(timeEntries.userId, current.id)
            : undefined,
        ),
      )
      .orderBy(desc(timeEntries.startedAt))
      .limit(20),
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: projectMembers.role,
      })
      .from(projectMembers)
      .innerJoin(user, eq(user.id, projectMembers.userId))
      .where(
        and(
          eq(projectMembers.projectId, project.id),
          isNull(projectMembers.revokedAt),
        ),
      ),
  ]);
  const base = `/projects/${project.id}`;
  return (
    <>
      <section className="card mb-5 p-5">
        <div className="flex items-center gap-3">
          <span
            className="grid size-12 place-items-center rounded-xl text-lg font-bold text-white"
            style={{ background: project.color }}
          >
            {project.name[0]}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold">{project.name}</h1>
            <p className="muted mt-1 text-xs">
              {[project.client, project.code].filter(Boolean).join(" · ") ||
                "Personal project"}
            </p>
          </div>
          <span className="badge capitalize">{project.role}</span>
        </div>
        <nav className="-mb-5 mt-6 flex gap-5 overflow-auto">
          {[
            ["overview", "Overview"],
            ["timesheets", "Time entries"],
            ["members", "Members"],
            ["reports", "Reports"],
            ["settings", "Settings"],
          ].map(([id, label]) => (
            <Link
              key={id}
              href={id === "overview" ? base : `${base}/${id}`}
              className={`border-b-2 pb-3 text-xs font-semibold ${tab === id ? "border-[var(--accent)] text-[var(--accent)]" : "muted border-transparent"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </section>
      {tab === "members" ? (
        <section className="card overflow-hidden">
          {(project.role === "owner" || project.role === "admin") && (
            <ProjectInviteForm projectId={project.id} />
          )}
          <div className="border-b border-[var(--border)] p-5">
            <h2 className="section-title">Project users</h2>
            <p className="muted mt-1 text-xs">
              {members.length}{" "}
              {members.length === 1 ? "person has" : "people have"} access to
              this project.
            </p>
          </div>
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 border-b border-[var(--border)] p-4 last:border-0"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-[var(--surface-2)] text-xs font-bold">
                {initials(member.name)}
              </span>
              <div className="min-w-0 flex-1">
                <b className="block truncate text-sm">{member.name}</b>
                <p className="muted truncate text-xs">{member.email}</p>
              </div>
              <span className="badge capitalize">{member.role}</span>
              {(project.role === "owner" || project.role === "admin") &&
                member.role === "member" &&
                member.id !== current.id && (
                  <form action={removeProjectMember}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="memberId" value={member.id} />
                    <ConfirmSubmitButton
                      confirmMessage={`Remove ${member.name} from this project and delete all of their project entries?`}
                      className="btn text-red-600"
                    >
                      <UserMinus size={14} />
                      Remove
                    </ConfirmSubmitButton>
                  </form>
                )}
            </div>
          ))}
        </section>
      ) : tab === "settings" ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <section className="card overflow-hidden">
            <div className="border-b border-[var(--border)] p-5">
              <div className="flex items-center gap-2">
                <Palette size={17} className="text-[var(--accent)]" />
                <h2 className="section-title">Project settings</h2>
              </div>
              <p className="muted mt-1 text-xs">
                Choose the project color and configure its default billing
                details.
              </p>
            </div>
            {project.role === "owner" || project.role === "admin" ? (
              <form action={updateProjectSettings}>
                <input type="hidden" name="projectId" value={project.id} />
                <div className="grid gap-5 p-5 sm:grid-cols-2">
                  <fieldset className="sm:col-span-2">
                    <legend className="label flex items-center gap-2">
                      <Palette size={14} />
                      Project color
                    </legend>
                    <div className="flex flex-wrap gap-3">
                      {PROJECT_COLORS.map((color) => (
                        <label
                          key={color}
                          title={color}
                          aria-label={`Use ${color} as the project color`}
                          className="relative grid size-10 cursor-pointer place-items-center rounded-xl transition hover:scale-105 has-[:checked]:scale-105 has-[:checked]:ring-2 has-[:checked]:ring-[var(--text)] has-[:checked]:ring-offset-2 has-[:checked]:ring-offset-[var(--surface)]"
                          style={{ backgroundColor: color }}
                        >
                          <input
                            type="radio"
                            name="color"
                            value={color}
                            defaultChecked={
                              project.color.toUpperCase() === color
                            }
                            required
                            className="peer sr-only"
                          />
                          <Check
                            size={17}
                            strokeWidth={3}
                            className="text-white opacity-0 peer-checked:opacity-100"
                          />
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div>
                    <label className="label">Currency</label>
                    <select
                      name="currency"
                      defaultValue={project.currency}
                      className="field"
                    >
                      <option value="USD">USD · US Dollar</option>
                      <option value="PKR">PKR · Pakistani Rupee</option>
                      <option value="INR">INR · Indian Rupee</option>
                      <option value="EUR">EUR · Euro</option>
                      <option value="GBP">GBP · British Pound</option>
                      <option value="AED">AED · UAE Dirham</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Hourly rate</label>
                    <input
                      name="hourlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={project.hourlyRate ?? ""}
                      className="field"
                      placeholder="0.00"
                    />
                  </div>
                  <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-4 sm:col-span-2">
                    <input
                      name="billable"
                      type="checkbox"
                      defaultChecked={project.billable}
                      className="mt-0.5 size-4 accent-[var(--accent)]"
                    />
                    <span>
                      <b className="block text-sm">Billable by default</b>
                      <span className="muted mt-1 block text-xs">
                        New entries for this project can be marked as billable
                        and included in financial totals.
                      </span>
                    </span>
                  </label>
                </div>
                <div className="flex justify-end border-t border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <button className="btn btn-primary">
                    <Save size={14} />
                    Save project settings
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-5">
                <p className="muted text-sm">
                  Only project owners and admins can update project settings.
                </p>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="muted text-xs">Currency</dt>
                    <dd className="mt-1 font-bold">{project.currency}</dd>
                  </div>
                  <div>
                    <dt className="muted text-xs">Hourly rate</dt>
                    <dd className="mt-1 font-bold">
                      {project.hourlyRate ?? "Not set"}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </section>
          <aside className="card h-fit p-5">
            <h2 className="section-title">Project details</h2>
            <p className="muted mt-3 text-xs">Status</p>
            <p className="mt-1 text-sm font-bold capitalize">
              {project.status}
            </p>
            <p className="muted mt-4 text-xs">Description</p>
            <p className="mt-1 text-sm leading-6">
              {project.description || "No project description has been added."}
            </p>
            {project.role !== "owner" && (
              <div className="mt-6 border-t border-[var(--border)] pt-5">
                <h3 className="text-sm font-bold text-red-600">
                  Leave project
                </h3>
                <p className="muted mt-2 text-xs leading-5">
                  Your project access and all of your entries in this project
                  will be removed.
                </p>
                <form action={leaveProject} className="mt-4">
                  <input type="hidden" name="projectId" value={project.id} />
                  <ConfirmSubmitButton
                    confirmMessage="Leave this project and delete all of your entries in it?"
                    className="btn w-full text-red-600"
                  >
                    <LogOut size={14} />
                    Leave project
                  </ConfirmSubmitButton>
                </form>
              </div>
            )}
          </aside>
        </div>
      ) : (
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
            <div>
              <h2 className="section-title">Recorded time</h2>
              <p className="muted mt-1 text-xs">
                {formatDuration(
                  entries.reduce((n, e) => n + e.durationMinutes, 0),
                )}{" "}
                shown
              </p>
            </div>
            <Link href="/timer" className="btn btn-primary">
              <Plus size={14} />
              Add time
            </Link>
          </div>
          {entries.length ? (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 border-b border-[var(--border)] p-4 last:border-0"
              >
                <CalendarDays size={16} className="muted" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {entry.description}
                  </p>
                  <p className="muted mt-1 text-xs">
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                    }).format(entry.startedAt)}
                  </p>
                </div>
                <b className="text-sm">
                  {formatDuration(entry.durationMinutes)}
                </b>
                {entry.userId === current.id && (
                  <form action={deleteTimeEntry}>
                    <input type="hidden" name="entryId" value={entry.id} />
                    <ConfirmSubmitButton
                      confirmMessage="Delete this time entry? This cannot be undone."
                      className="btn icon-btn text-red-600"
                      aria-label="Delete time entry"
                      title="Delete time entry"
                    >
                      <Trash2 size={14} />
                    </ConfirmSubmitButton>
                  </form>
                )}
              </div>
            ))
          ) : (
            <div className="muted p-10 text-center text-sm">
              No time has been recorded for this project.
            </div>
          )}
        </section>
      )}
    </>
  );
}
