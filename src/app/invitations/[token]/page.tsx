import Link from "next/link";
import { and, eq, gt } from "drizzle-orm";
import { ArrowRight, Check, LockKeyhole, Users } from "lucide-react";
import { getDb } from "@/db";
import { projectInvitations, projects, user } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth/session";
import { hashToken } from "@/lib/security/tokens";
import { acceptInvitation } from "@/server/actions/invitations";

export const dynamic="force-dynamic";
export default async function Invitation({params}:{params:Promise<{token:string}>}){
  const {token}=await params;const session=await getCurrentSession();
  const [invitation]=await getDb().select({email:projectInvitations.email,role:projectInvitations.role,expiresAt:projectInvitations.expiresAt,project:projects.name,inviter:user.name}).from(projectInvitations).innerJoin(projects,eq(projects.id,projectInvitations.projectId)).innerJoin(user,eq(user.id,projectInvitations.inviterId)).where(and(eq(projectInvitations.tokenHash,hashToken(token)),eq(projectInvitations.status,"pending"),gt(projectInvitations.expiresAt,new Date()))).limit(1);
  if(!invitation)return <Frame><LockKeyhole className="mx-auto text-[var(--accent)]"/><h1 className="mt-5 text-2xl font-bold">Invitation unavailable</h1><p className="muted mt-3 text-sm">This invitation is invalid, expired, accepted, or revoked.</p></Frame>;
  const next=encodeURIComponent(`/invitations/${token}`);
  return <Frame><Users className="mx-auto text-[var(--accent)]"/><h1 className="mt-5 text-2xl font-bold">Join {invitation.project}</h1><p className="muted mt-3 text-sm leading-6"><b className="text-[var(--text)]">{invitation.inviter}</b> invited <b className="text-[var(--text)]">{invitation.email}</b> to collaborate as a {invitation.role}.</p><div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-left text-xs"><p className="flex gap-2"><Check size={14} className="text-emerald-500"/>Log and manage your time</p><p className="mt-2 flex gap-2"><Check size={14} className="text-emerald-500"/>Collaborate on the project</p></div>{session?.user?<form action={acceptInvitation}><input type="hidden" name="token" value={token}/><button className="btn btn-primary mt-6 w-full">Accept invitation<ArrowRight size={15}/></button></form>:<><Link href={`/register?next=${next}`} className="btn btn-primary mt-6 w-full">Create account & join<ArrowRight size={15}/></Link><Link href={`/login?next=${next}`} className="muted mt-4 block text-xs">Already have an account? Sign in</Link></>}<p className="muted mt-7 text-[10px]">Expires {new Intl.DateTimeFormat("en",{dateStyle:"long"}).format(invitation.expiresAt)}</p></Frame>;
}
function Frame({children}:{children:React.ReactNode}){return <main className="grid min-h-screen place-items-center bg-[var(--background)] p-5"><div className="card w-full max-w-md p-7 text-center"><Link href="/" className="mb-8 block font-bold text-[var(--accent)]">tempo</Link>{children}</div></main>}
