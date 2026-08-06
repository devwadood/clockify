import { ProjectsView } from "@/components/projects/projects-view";
import { and, count, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { projectMembers, projects, timeEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
export const metadata={title:"Projects"}; export const dynamic="force-dynamic";
export default async function Page(){const user=await requireUser();const db=getDb();const rows=await db.select({id:projects.id,name:projects.name,client:projects.clientName,code:projects.code,color:projects.color,status:projects.status,memberCount:count(projectMembers.userId),minutes:sql<number>`coalesce(sum(${timeEntries.durationMinutes}), 0)::int`}).from(projects).innerJoin(projectMembers,and(eq(projectMembers.projectId,projects.id),eq(projectMembers.userId,user.id),isNull(projectMembers.revokedAt))).leftJoin(timeEntries,and(eq(timeEntries.projectId,projects.id),eq(timeEntries.userId,user.id),isNull(timeEntries.deletedAt))).where(isNull(projects.deletedAt)).groupBy(projects.id);return <ProjectsView projects={rows}/>}
