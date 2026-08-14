import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { MailPlus, Users } from "lucide-react";
import { getDb } from "@/db";
import {
  projectInvitations,
  projectMembers,
  projects,
  user,
} from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { UserAvatar } from "@/components/ui/user-avatar";
import { inviteTeamMember } from "@/server/actions/invitations";

export async function TeamPage() {
  const current = await requireUser();
  const db = getDb();
  const memberships = await db
    .select({
      projectId: projectMembers.projectId,
      projectName: projects.name,
      role: projectMembers.role,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projects.id, projectMembers.projectId))
    .where(
      and(
        eq(projectMembers.userId, current.id),
        isNull(projectMembers.revokedAt),
        isNull(projects.deletedAt),
      ),
    );
  const projectIds = memberships.map((row) => row.projectId);
  const manageable = memberships.filter(
    (row) => row.role === "owner" || row.role === "admin",
  );
  const [rows, pending] = await Promise.all([
    projectIds.length
      ? db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: projectMembers.role,
            project: projects.name,
          })
          .from(projectMembers)
          .innerJoin(user, eq(user.id, projectMembers.userId))
          .innerJoin(projects, eq(projects.id, projectMembers.projectId))
          .where(
            and(
              inArray(projectMembers.projectId, projectIds),
              isNull(projectMembers.revokedAt),
            ),
          )
      : [],
    manageable.length
      ? db
          .select({
            id: projectInvitations.id,
            email: projectInvitations.email,
            role: projectInvitations.role,
            status: projectInvitations.status,
            expiresAt: projectInvitations.expiresAt,
            project: projects.name,
          })
          .from(projectInvitations)
          .innerJoin(projects, eq(projects.id, projectInvitations.projectId))
          .where(
            and(
              inArray(
                projectInvitations.projectId,
                manageable.map((p) => p.projectId),
              ),
              eq(projectInvitations.status, "pending"),
            ),
          )
          .orderBy(desc(projectInvitations.createdAt))
      : [],
  ]);
  const members = [
    ...new Map(rows.map((row) => [`${row.id}:${row.project}`, row])).values(),
  ];
  return (
    <>
      <PageHeader
        title="Team"
        description="Invite people and manage collaboration across your projects."
      />
      {manageable.length > 0 && (
        <section className="card mb-5 p-5">
          <div className="mb-4">
            <h2 className="section-title">Invite a team member</h2>
            <p className="muted mt-1 text-xs">
              We’ll send a secure, single-use invitation that expires in seven
              days.
            </p>
          </div>
          <form
            action={inviteTeamMember}
            className="grid gap-3 sm:grid-cols-[1fr_1.4fr_130px_auto]"
          >
            <select name="projectId" required className="field">
              {manageable.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.projectName}
                </option>
              ))}
            </select>
            <input
              name="email"
              required
              type="email"
              className="field"
              placeholder="teammate@company.com"
            />
            <select name="role" className="field">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn btn-primary">
              <MailPlus size={15} />
              Send invite
            </button>
          </form>
        </section>
      )}
      {pending.length > 0 && (
        <section className="card mb-5 overflow-hidden">
          <div className="border-b border-[var(--border)] p-4">
            <h2 className="section-title">Pending invitations</h2>
          </div>
          {pending.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center gap-3 border-b border-[var(--border)] p-4 last:border-0"
            >
              <MailPlus size={16} className="text-[var(--accent)]" />
              <div className="min-w-0 flex-1">
                <b className="block truncate text-sm">{invite.email}</b>
                <p className="muted mt-1 text-xs">
                  {invite.project} · expires{" "}
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                  }).format(invite.expiresAt)}
                </p>
              </div>
              <span className="badge capitalize">{invite.role}</span>
            </div>
          ))}
        </section>
      )}
      {!members.length ? (
        <section className="card grid min-h-[300px] place-items-center text-center">
          <div>
            <Users className="mx-auto text-[var(--accent)]" />
            <h2 className="mt-4 text-lg font-bold">No team members yet</h2>
          </div>
        </section>
      ) : (
        <div className="card overflow-hidden">
          {members.map((member) => (
            <div
              key={`${member.id}:${member.project}`}
              className="flex items-center gap-3 border-b border-[var(--border)] p-4 last:border-0"
            >
              <UserAvatar name={member.name} image={member.image} />
              <div className="min-w-0 flex-1">
                <b className="block truncate text-sm">
                  {member.name}
                  {member.id === current.id ? " (you)" : ""}
                </b>
                <span className="muted block truncate text-xs">
                  {member.email} · {member.project}
                </span>
              </div>
              <span className="badge capitalize">{member.role}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
