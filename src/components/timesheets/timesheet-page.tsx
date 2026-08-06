import { desc, eq, and, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { projects, timeEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { TimesheetView } from "./timesheet-view";
export async function TimesheetPage(){const user=await requireUser();const rows=await getDb().select({id:timeEntries.id,date:timeEntries.workDate,description:timeEntries.description,project:projects.name,color:projects.color,startedAt:timeEntries.startedAt,endedAt:timeEntries.endedAt,durationMinutes:timeEntries.durationMinutes,billable:timeEntries.billable,status:timeEntries.status}).from(timeEntries).innerJoin(projects,eq(projects.id,timeEntries.projectId)).where(and(eq(timeEntries.userId,user.id),isNull(timeEntries.deletedAt))).orderBy(desc(timeEntries.startedAt));return <TimesheetView entries={rows}/>}
