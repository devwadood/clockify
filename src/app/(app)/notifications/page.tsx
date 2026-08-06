import { desc, eq } from "drizzle-orm";
import { Bell } from "lucide-react";
import { getDb } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
export const dynamic="force-dynamic";
export default async function Page(){const user=await requireUser();const rows=await getDb().select().from(notifications).where(eq(notifications.userId,user.id)).orderBy(desc(notifications.createdAt)).limit(50);return <><PageHeader title="Notifications" description="Updates that need your attention."/>{rows.length?<div className="card overflow-hidden">{rows.map(note=><div key={note.id} className="flex gap-3 border-b border-[var(--border)] p-4 last:border-0"><span className={`mt-1 size-2 rounded-full ${note.readAt?"bg-transparent":"bg-[var(--accent)]"}`}/><div className="flex-1"><b className="text-sm">{note.title}</b><p className="muted mt-1 text-xs">{note.body}</p></div><span className="muted text-xs">{new Intl.DateTimeFormat("en",{dateStyle:"medium"}).format(note.createdAt)}</span></div>)}</div>:<section className="card grid min-h-[360px] place-items-center text-center"><div><Bell className="mx-auto text-[var(--accent)]"/><h2 className="mt-4 text-lg font-bold">You’re all caught up</h2><p className="muted mt-2 text-sm">New activity will appear here.</p></div></section>}</>}
