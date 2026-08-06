"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { createProject } from "@/server/actions/projects";

const colors=["#6C5CE7","#0EA5A4","#2563EB","#F59E0B","#EC4899","#64748B"];

export function ProjectForm(){
  const router=useRouter();
  return <>
    <button onClick={()=>router.back()} className="muted mb-4 flex items-center gap-1 text-xs font-semibold hover:text-[var(--text)]"><ArrowLeft size={14}/>Back to projects</button>
    <PageHeader title="Create a project" description="Set up the basics now—you can refine permissions and approvals later."/>
    <form action={createProject} className="card mx-auto max-w-3xl overflow-hidden">
      <div className="border-b border-[var(--border)] p-5 md:p-7"><h2 className="section-title">Project details</h2><p className="muted mt-1 text-xs">Fields marked with an asterisk are required.</p><div className="mt-6 grid gap-5">
        <div><label className="label">Project name *</label><input name="name" required minLength={2} maxLength={100} className="field" placeholder="e.g. Website redesign"/></div>
        <div><label className="label">Description</label><textarea name="description" maxLength={1000} className="field min-h-24 resize-y py-3" placeholder="A short summary of the work and its outcome…"/></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><label className="label">Client</label><input name="clientName" className="field" placeholder="Client or company name"/></div><div><label className="label">Project code</label><input name="code" className="field" placeholder="e.g. WEB-24"/></div></div>
        <div><label className="label">Color</label><div className="flex gap-2">{colors.map((color,index)=><label key={color} className="grid size-9 cursor-pointer place-items-center rounded-lg" style={{background:color}}><input value={color} type="radio" name="color" defaultChecked={index===0} className="sr-only"/><span className="size-2 rounded-full bg-white/90"/></label>)}</div></div>
      </div></div>
      <div className="border-b border-[var(--border)] p-5 md:p-7"><h2 className="section-title">Billing & schedule</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div><label className="label">Hourly rate</label><div className="flex"><select name="currency" className="field w-24 rounded-r-none"><option>USD</option><option>EUR</option><option>GBP</option></select><input name="hourlyRate" type="number" min="0" step="0.01" className="field rounded-l-none border-l-0" placeholder="95.00"/></div></div>
        <div><label className="label">Project timezone *</label><select name="timezone" required className="field"><option value="Asia/Karachi">Asia/Karachi (UTC+05:00)</option><option value="UTC">UTC</option><option value="America/New_York">America/New_York</option><option value="Europe/London">Europe/London</option></select></div>
        <div><label className="label">Start date *</label><input name="startDate" required type="date" className="field" defaultValue={new Date().toISOString().slice(0,10)}/></div><div><label className="label">End date</label><input name="endDate" type="date" className="field"/></div>
      </div><div className="mt-5 space-y-3"><label className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-4"><input name="billable" defaultChecked type="checkbox" className="mt-0.5 size-4 accent-[var(--accent)]"/><span><b className="block text-sm">Billable project</b><span className="muted mt-1 block text-xs">New time entries will be billable by default.</span></span></label><label className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-4"><input name="approvalRequired" type="checkbox" className="mt-0.5 size-4 accent-[var(--accent)]"/><span><b className="block text-sm">Require timesheet approval</b><span className="muted mt-1 block text-xs">Members submit weekly hours for review.</span></span></label></div></div>
      <div className="flex justify-end gap-2 bg-[var(--surface-2)] p-4"><button type="button" className="btn" onClick={()=>router.back()}>Cancel</button><button className="btn btn-primary">Create project<ChevronRight size={15}/></button></div>
    </form>
  </>;
}
