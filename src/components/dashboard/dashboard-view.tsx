"use client";

import Link from "next/link";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ArrowRight, BriefcaseBusiness, Clock3, Play, Plus, TimerReset } from "lucide-react";
import type { DashboardData } from "@/db/queries/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { formatDuration } from "@/lib/utils";

const palette = ["#6C5CE7", "#0EA5A4", "#F59E0B", "#EC4899", "#2563EB"];

export function DashboardView({ data, name }: { data: DashboardData; name: string }) {
  const hasProjects = data.projects.length > 0;
  const hasEntries = data.entries.length > 0;
  const stats = [
    ["Today", formatDuration(data.totals.today), "Logged today"],
    ["This week", formatDuration(data.totals.week), "Monday through today"],
    ["This month", formatDuration(data.totals.month), "Current calendar month"],
    ["Billable", formatDuration(data.totals.billableWeek), `${formatDuration(data.totals.nonBillableWeek)} non-billable`],
  ];
  const pieData = data.distribution.slice(0, 5).map((project, index) => ({ name: project.name, value: project.minutes, color: project.color || palette[index] }));

  return <>
    <PageHeader eyebrow={new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date())} title={`Welcome, ${name.split(" ")[0]}`} description={hasEntries ? "Here’s where your time is going this week." : "Your workspace is ready. Start by recording your first piece of work."} actions={<>{hasProjects && <Link href="/timer" className="btn"><Plus size={15}/>Add time</Link>}<Link href={hasProjects ? "/timer" : "/projects/new"} className="btn btn-primary">{hasProjects ? <Play size={14} fill="currentColor"/> : <BriefcaseBusiness size={15}/>} {hasProjects ? "Start timer" : "Create first project"}</Link></>}/>

    {!hasProjects ? <FirstProjectEmpty/> : !hasEntries && !data.activeTimer ? <FirstEntryEmpty projectName={data.projects[0].name}/> : <>
      {data.activeTimer && <section className="card mb-5 overflow-hidden border-[color-mix(in_srgb,var(--accent)_35%,var(--border))]"><div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center md:p-5"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Clock3 size={21}/></div><div className="min-w-0 flex-1"><div className="mb-1 flex items-center gap-2"><span className="timer-dot size-2 rounded-full bg-emerald-500"/><p className="text-xs font-bold tracking-[.07em] text-emerald-600 uppercase">{data.activeTimer.status === "running" ? "Timer running" : "Timer paused"}</p></div><p className="truncate text-[15px] font-semibold">{data.activeTimer.description || "Untitled work"}</p><p className="muted mt-0.5 flex items-center gap-2 text-xs"><span className="size-2 rounded-full" style={{background:data.activeTimer.projectColor}}/>{data.activeTimer.project}</p></div><Link href="/timer" className="btn">Open timer <ArrowRight size={14}/></Link></div></section>}

      <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{stats.map(([label,value,note])=><div key={label} className="card p-4 md:p-5"><p className="muted text-xs font-medium">{label}</p><p className="mt-2 text-[22px] font-bold tracking-[-.03em] md:text-[25px]">{value}</p><p className="muted mt-2 text-[11px]">{note}</p></div>)}</section>

      <section className="mb-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="card p-4 md:p-5"><h2 className="section-title">Weekly activity</h2><p className="muted mt-1 text-xs">Billable and non-billable hours</p><div className="mt-4 h-[220px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.weeklyActivity} margin={{left:-24,right:4,top:8}}><CartesianGrid vertical={false} stroke="var(--border)"/><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{fontSize:11,fill:"var(--muted)"}}/><Tooltip contentStyle={{borderRadius:10,border:"1px solid var(--border)",background:"var(--surface)",fontSize:12}}/><Area type="monotone" dataKey="billable" stroke="#6C5CE7" strokeWidth={2} fill="#6C5CE7" fillOpacity={.12}/><Area type="monotone" dataKey="nonbillable" stroke="#A7A3C9" strokeWidth={1.5} fill="transparent"/></AreaChart></ResponsiveContainer></div></div>
        <div className="card p-4 md:p-5"><h2 className="section-title">Project split</h2><p className="muted mt-1 text-xs">This month</p>{pieData.length ? <div className="flex items-center"><div className="h-[175px] flex-1"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} innerRadius={46} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">{pieData.map(item=><Cell key={item.name} fill={item.color}/>)}</Pie></PieChart></ResponsiveContainer></div><div className="w-[48%] space-y-3">{pieData.map(item=><div className="flex items-center gap-2 text-xs" key={item.name}><span className="size-2 rounded-full" style={{background:item.color}}/><span className="flex-1 truncate">{item.name}</span><b>{formatDuration(item.value)}</b></div>)}</div></div> : <SmallEmpty text="Your project breakdown will appear after you log time."/>}</div>
      </section>

      <section className="card overflow-hidden"><div className="flex items-center justify-between border-b border-[var(--border)] p-4 md:px-5"><div><h2 className="section-title">Recent time</h2><p className="muted mt-1 text-xs">Your latest entries</p></div><Link href="/timesheets" className="text-xs font-semibold text-[var(--accent)]">View all</Link></div>{data.entries.length ? data.entries.map(entry=><div key={entry.id} className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3.5 last:border-0 md:px-5"><span className="size-2.5 shrink-0 rounded-full" style={{background:entry.projectColor}}/><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold">{entry.description}</p><p className="muted mt-1 truncate text-[11px]">{entry.project} · {new Intl.DateTimeFormat("en",{month:"short",day:"numeric"}).format(new Date(entry.startedAt))}</p></div><p className="w-[68px] text-right text-[13px] font-semibold">{formatDuration(entry.durationMinutes)}</p></div>) : <SmallEmpty text="No time entries yet."/>}</section>
    </>}
  </>;
}

function FirstProjectEmpty(){return <section className="card grid min-h-[430px] place-items-center p-6 text-center"><div className="max-w-md"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]"><BriefcaseBusiness size={24}/></span><h2 className="mt-6 text-2xl font-bold tracking-[-.03em]">Create your first project</h2><p className="muted mt-3 text-sm leading-6">Projects organize your work, clients, team, and reports. Create one now, then add your first time entry.</p><Link href="/projects/new" className="btn btn-primary mt-6"><Plus size={15}/>Create a project</Link></div></section>}
function FirstEntryEmpty({projectName}:{projectName:string}){return <section className="card grid min-h-[430px] place-items-center p-6 text-center"><div className="max-w-md"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]"><TimerReset size={24}/></span><h2 className="mt-6 text-2xl font-bold tracking-[-.03em]">Log your first hour</h2><p className="muted mt-3 text-sm leading-6">Your project <b className="text-[var(--text)]">{projectName}</b> is ready. Start the timer or add time manually—your real totals will appear here immediately.</p><Link href="/timer" className="btn btn-primary mt-6"><Play size={14} fill="currentColor"/>Add your first entry</Link></div></section>}
function SmallEmpty({text}:{text:string}){return <div className="muted grid h-[175px] place-items-center px-6 text-center text-xs">{text}</div>}
