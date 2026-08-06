import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { getDb } from "@/db";
import { projects, reports } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
export async function ReportPage({reportId}:{reportId:string}){const user=await requireUser();const [report]=await getDb().select({title:reports.title,status:reports.status,createdAt:reports.createdAt,generatedAt:reports.generatedAt,project:projects.name}).from(reports).leftJoin(projects,eq(projects.id,reports.projectId)).where(and(eq(reports.id,reportId),eq(reports.creatorId,user.id))).limit(1);if(!report)notFound();return <><PageHeader title={report.title} description={`${report.project??"All projects"} · Created ${new Intl.DateTimeFormat("en",{dateStyle:"medium"}).format(report.createdAt)}`}/><section className="card grid min-h-[420px] place-items-center p-6 text-center"><div className="max-w-sm"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]"><FileText size={23}/></span><h2 className="mt-5 text-xl font-bold capitalize">Report {report.status}</h2><p className="muted mt-2 text-sm leading-6">{report.status==="ready"?"This report was generated from your stored time data.":"The report is being prepared. Refresh this page shortly."}</p></div></section></>}
