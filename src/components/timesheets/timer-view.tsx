"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Pause, Play, RotateCcw, Save, Square, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { entries, projects } from "@/lib/demo-data";
import { PageHeader } from "@/components/ui/page-header";

function clock(total: number) { const h=Math.floor(total/3600), m=Math.floor(total%3600/60), s=total%60; return [h,m,s].map(v=>String(v).padStart(2,"0")).join(":"); }

export function TimerView() {
  const [running, setRunning] = useState(true); const [seconds, setSeconds] = useState(5077); const [manual, setManual] = useState(false);
  useEffect(() => { if (!running) return; const i=setInterval(()=>setSeconds(s=>s+1),1000); return()=>clearInterval(i); },[running]);
  const todayTotal = useMemo(() => "6h 12m", []);
  const stop = () => { setRunning(false); toast.success("Timer saved to today’s timesheet"); setSeconds(0); };
  return <>
    <PageHeader title="Timer" description="Capture your work while it happens." actions={<button className="btn" onClick={()=>setManual(true)}><Clock3 size={15}/>Add manual time</button>}/>
    <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
      <section className="card overflow-hidden">
        <div className="border-b border-[var(--border)] px-5 py-4"><div className="flex items-center gap-2"><span className="timer-dot size-2 rounded-full bg-emerald-500"/><p className="text-xs font-bold tracking-[.08em] text-emerald-600 uppercase">{running ? "Tracking now" : "Paused"}</p></div></div>
        <div className="px-5 py-8 text-center md:px-10 md:py-12">
          <p className="font-mono text-[48px] leading-none font-semibold tracking-[-.06em] tabular-nums sm:text-[70px]">{clock(seconds)}</p>
          <div className="mx-auto mt-8 grid max-w-xl gap-3 text-left">
            <div><label className="label">What are you working on?</label><input className="field" defaultValue="Design system documentation" placeholder="Add a description…"/></div>
            <div className="grid gap-3 sm:grid-cols-2"><div><label className="label">Project</label><select className="field" defaultValue="atlas">{projects.filter(p=>p.status==="Active").map(p=><option key={p.id} value={p.id}>{p.name} · {p.client}</option>)}</select></div><div><label className="label">Tags</label><button className="field flex items-center gap-2 text-left text-[var(--muted)]"><Tag size={15}/>Add tags</button></div></div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-3"><button onClick={()=>setSeconds(0)} aria-label="Reset timer" className="btn icon-btn"><RotateCcw size={17}/></button><button onClick={()=>setRunning(!running)} className="btn h-12 min-w-32 px-6"><>{running ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}{running ? "Pause" : "Resume"}</></button><button onClick={stop} className="btn btn-primary h-12 min-w-32 px-6"><Square size={15} fill="currentColor"/>Stop & save</button></div>
        </div>
        <div className="flex items-center justify-between bg-[var(--surface-2)] px-5 py-3 text-xs"><span className="muted">Started today at 12:35 PM</span><span><b>{todayTotal}</b> logged today</span></div>
      </section>
      <aside className="card overflow-hidden"><div className="border-b border-[var(--border)] p-4"><h2 className="section-title">Today</h2><p className="muted mt-1 text-xs">Thursday, August 6</p></div>{entries.slice(0,3).map((e)=><div key={e.id} className="border-b border-[var(--border)] p-4 last:border-0"><div className="flex items-start gap-3"><span className="mt-1 size-2.5 rounded-full" style={{background:e.color}}/><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold">{e.description}</p><p className="muted mt-1 text-[11px]">{e.project}</p><p className="muted mt-2 text-xs">{e.time}</p></div><b className="text-[13px]">{e.duration}</b></div></div>)}<div className="flex justify-between bg-[var(--surface-2)] p-4 text-sm"><span className="muted">Total today</span><b>{todayTotal}</b></div></aside>
    </div>
    {manual && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onMouseDown={e=>{if(e.target===e.currentTarget)setManual(false)}}><form onSubmit={e=>{e.preventDefault();setManual(false);toast.success("Time entry added")}} className="w-full max-w-xl rounded-t-2xl bg-[var(--surface)] shadow-2xl sm:rounded-2xl"><div className="flex items-center justify-between border-b border-[var(--border)] p-5"><div><h2 className="text-lg font-bold">Add time entry</h2><p className="muted mt-1 text-xs">Times are shown in Asia/Karachi</p></div><button type="button" onClick={()=>setManual(false)} className="rounded-lg p-2 hover:bg-[var(--surface-2)]"><X size={19}/></button></div><div className="grid gap-4 p-5"><div><label className="label">Project</label><select required className="field">{projects.filter(p=>p.status==="Active").map(p=><option key={p.id}>{p.name}</option>)}</select></div><div><label className="label">Description</label><input required maxLength={240} className="field" placeholder="What did you work on?"/></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="col-span-2 sm:col-span-1"><label className="label">Date</label><input required type="date" className="field" defaultValue="2026-08-06"/></div><div><label className="label">Start</label><input required type="time" className="field" defaultValue="09:00"/></div><div><label className="label">End</label><input required type="time" className="field" defaultValue="10:00"/></div><div><label className="label">Break</label><input required type="number" min="0" max="600" className="field" defaultValue="0"/></div></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="size-4 accent-[var(--accent)]"/>Billable</label></div><div className="flex justify-end gap-2 border-t border-[var(--border)] p-4"><button type="button" className="btn" onClick={()=>setManual(false)}>Cancel</button><button className="btn btn-primary"><Save size={15}/>Save entry</button></div></form></div>}
  </>;
}
