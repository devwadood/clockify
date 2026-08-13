import { ProjectsView } from "@/components/projects/projects-view";
import { and, count, eq, inArray, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { projectMembers, projects, timeEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
export const metadata = { title: "Projects" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await requireUser();
  const db = getDb();
  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      client: projects.clientName,
      code: projects.code,
      color: projects.color,
      status: projects.status,
      minutes: sql<number>`coalesce(sum(${timeEntries.durationMinutes}), 0)::int`,
    })
    .from(projects)
    .innerJoin(
      projectMembers,
      and(
        eq(projectMembers.projectId, projects.id),
        eq(projectMembers.userId, user.id),
        isNull(projectMembers.revokedAt),
      ),
    )
    .leftJoin(
      timeEntries,
      and(
        eq(timeEntries.projectId, projects.id),
        eq(timeEntries.userId, user.id),
        isNull(timeEntries.deletedAt),
      ),
    )
    .where(isNull(projects.deletedAt))
    .groupBy(projects.id);
  const projectIds = rows.map((project) => project.id);
  const counts = projectIds.length
    ? await db
        .select({ projectId: projectMembers.projectId, memberCount: count() })
        .from(projectMembers)
        .where(
          and(
            inArray(projectMembers.projectId, projectIds),
            isNull(projectMembers.revokedAt),
          ),
        )
        .groupBy(projectMembers.projectId)
    : [];
  const countsByProject = new Map(
    counts.map((row) => [row.projectId, row.memberCount]),
  );
  const projectRows = rows.map((project) => ({
    ...project,
    memberCount: countsByProject.get(project.id) ?? 0,
  }));
  return <ProjectsView projects={projectRows} />;
}
