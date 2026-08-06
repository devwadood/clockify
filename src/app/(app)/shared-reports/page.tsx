import { desc, eq } from "drizzle-orm";
import { Share2 } from "lucide-react";
import { getDb } from "@/db";
import { publicReportLinks, reports } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
export const dynamic="force-dynamic";
export default async function Page(){const user=await requireUser();const rows=await getDb().select({id:publicReportLinks.id,title:reports.title,expiresAt:publicReportLinks.expiresAt,views:publicReportLinks.viewCount,createdAt:publicReportLinks.createdAt}).from(publicReportLinks).innerJoin(reports,eq(reports.id,publicReportLinks.reportId)).where(eq(publicReportLinks.creatorId,user.id)).orderBy(desc(publicReportLinks.createdAt));return <><PageHeader title="Shared reports" description="Manage public links created from your reports."/>{rows.length?<div className="card overflow-hidden">{rows.map(link=><div key={link.id} className="flex items-center gap-3 border-b border-[var(--border)] p-4 last:border-0"><Share2 size={17} className="text-[var(--accent)]"/><div className="flex-1"><b className="text-sm">{link.title}</b><p className="muted mt-1 text-xs">{link.views} views</p></div><span className="badge">Active</span></div>)}</div>:<section className="card grid min-h-[360px] place-items-center text-center"><div><Share2 className="mx-auto text-[var(--accent)]"/><h2 className="mt-4 text-lg font-bold">No shared reports</h2><p className="muted mt-2 text-sm">Public report links you create will appear here.</p></div></section>}</>}
