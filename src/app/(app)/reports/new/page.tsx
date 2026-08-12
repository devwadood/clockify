import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { projectMembers, projects } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { ReportBuilderForm } from "@/components/reports/report-builder-form";
export const dynamic = "force-dynamic";
export default async function Page() {
  const current = await requireUser();
  const rows = await getDb()
    .select({
      id: projects.id,
      name: projects.name,
      client: projects.clientName,
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
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const monthStart = `${today.slice(0, 8)}01`;
  return (
    <>
      <PageHeader
        title="Build a report"
        description="Create project, multi-project, or organization-level reports."
      />
      {rows.length ? (
        <ReportBuilderForm
          projects={rows}
          today={today}
          monthStart={monthStart}
        />
      ) : (
        <section className="card p-10 text-center">
          <p className="muted text-sm">
            Create a project and log time before generating a report.
          </p>
        </section>
      )}
    </>
  );
}
