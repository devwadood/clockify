"use client";

import Link from "next/link";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ArrowRight, BriefcaseBusiness, CalendarPlus, Clock3, FileBarChart, MoreHorizontal, Play, Plus, Sparkles, TrendingUp, Users } from "lucide-react";
import { entries, projects, weekData } from "@/lib/demo-data";
import { PageHeader } from "@/components/ui/page-header";

const stats = [
  { label: "Today", value: "4h 48m", note: "+42m vs avg.", trend: true },
  { label: "This week", value: "31h 24m", note: "78% of 40h", progress: 78 },
  { label: "This month", value: "126h 18m", note: "18 work days" },
  { label: "Billable", value: "26h 05m", note: "83% of this week", accent: true },
];

export function DashboardView() {
  const pieData = projects.slice(0, 3).map((p) => ({ name: p.name, value: p.hours, color: p.color }));
  return <>
    <PageHeader eyebrow="Thursday, August 6" title="Good evening, Abdul" description="Here’s where your time is going this week." actions={<><Link href="/projects/new" className="btn"><Plus size={15}/>New project</Link><Link href="/timer" className="btn btn-primary"><Play size={14} fill="currentColor"/>Start timer</Link></>}/>

    <section className="card mb-5 overflow-hidden border-[color-mix(in_srgb,var(--accent)_35%,var(--border))]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center md:p-5">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Clock3 size={21}/></div>
        <div className="min-w-0 flex-1"><div className="mb-1 flex items-center gap-2"><span className="timer-dot size-2 rounded-full bg-emerald-500"/><p className="text-xs font-bold tracking-[.07em] text-emerald-600 uppercase">Timer running</p></div><p className="truncate text-[15px] font-semibold">Design system documentation</p><p className="muted mt-0.5 flex items-center gap-2 text-xs"><span className="size-2 rounded-full bg-[#6C5CE7]"/>Atlas redesign · Northstar Labs</p></div>
        <div className="flex items-center gap-4 sm:ml-auto"><p className="font-mono text-[26px] font-semibold tracking-[-.04em] tabular-nums">01:24:37</p><Link href="/timer" className="btn">Open timer <ArrowRight size={14}/></Link></div>
      </div>
    </section>

    <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => <div key={stat.label} className="card p-4 md:p-5"><p className="muted text-xs font-medium">{stat.label}</p><p className="mt-2 text-[22px] font-bold tracking-[-.03em] md:text-[25px]">{stat.value}</p><div className="mt-2 flex h-4 items-center gap-2">{stat.trend && <TrendingUp size={13} className="text-emerald-500"/>}<span className="muted text-[11px]">{stat.note}</span></div>{stat.progress && <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full bg-[var(--accent)]" style={{width:`${stat.progress}%`}}/></div>}</div>)}
    </section>

    <section className="mb-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <div className="card p-4 md:p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="section-title">Weekly activity</h2><p className="muted mt-1 text-xs">Billable and non-billable hours</p></div><button className="btn h-8 text-xs">This week</button></div><div className="h-[220px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={weekData} margin={{ left: -24, right: 4, top: 8 }}><defs><linearGradient id="bill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6C5CE7" stopOpacity={.3}/><stop offset="1" stopColor="#6C5CE7" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--border)"/><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{fontSize:11,fill:"var(--muted)"}}/><Tooltip contentStyle={{borderRadius:10,border:"1px solid var(--border)",background:"var(--surface)",fontSize:12}}/><Area type="monotone" dataKey="billable" stroke="#6C5CE7" strokeWidth={2} fill="url(#bill)"/><Area type="monotone" dataKey="nonbillable" stroke="#A7A3C9" strokeWidth={1.5} fill="transparent"/></AreaChart></ResponsiveContainer></div></div>
      <div className="card p-4 md:p-5"><div className="mb-2 flex items-center justify-between"><div><h2 className="section-title">Project split</h2><p className="muted mt-1 text-xs">126h 18m this month</p></div><button aria-label="More" className="rounded-md p-2 hover:bg-[var(--surface-2)]"><MoreHorizontal size={17}/></button></div><div className="flex items-center"><div className="h-[175px] flex-1"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">{pieData.map((item) => <Cell key={item.name} fill={item.color}/>)}</Pie></PieChart></ResponsiveContainer></div><div className="w-[48%] space-y-3">{pieData.map((item, i) => <div key={item.name}><div className="flex items-center gap-2 text-xs"><span className="size-2 rounded-full" style={{background:item.color}}/><span className="flex-1 truncate">{item.name}</span><b>{[47,33,20][i]}%</b></div></div>)}</div></div></div>
    </section>

    <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <div className="card overflow-hidden"><div className="flex items-center justify-between border-b border-[var(--border)] p-4 md:px-5"><div><h2 className="section-title">Recent time</h2><p className="muted mt-1 text-xs">Your latest entries</p></div><Link href="/timesheets" className="text-xs font-semibold text-[var(--accent)]">View all</Link></div><div>{entries.slice(0,4).map((entry) => <div key={entry.id} className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3.5 last:border-0 md:px-5"><span className="size-2.5 shrink-0 rounded-full" style={{background:entry.color}}/><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold">{entry.description}</p><p className="muted mt-1 truncate text-[11px]">{entry.project} · {entry.date}</p></div><p className="muted hidden text-xs sm:block">{entry.time}</p><p className="w-[58px] text-right text-[13px] font-semibold">{entry.duration}</p></div>)}</div></div>
      <div className="space-y-5"><div className="card p-4 md:p-5"><h2 className="section-title mb-4">Quick actions</h2><div className="grid grid-cols-2 gap-2">{[[CalendarPlus,"Add time","/timer"],[BriefcaseBusiness,"New project","/projects/new"],[Users,"Invite team","/team"],[FileBarChart,"Build report","/reports/new"]].map(([Icon,label,href]) => { const C = Icon as typeof CalendarPlus; return <Link key={label as string} href={href as string} className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-3 text-xs font-semibold hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"><C size={18} className="text-[var(--accent)]"/>{label as string}</Link>})}</div></div><div className="card p-4 md:p-5"><div className="mb-3 flex items-center gap-2"><Sparkles size={16} className="text-[var(--accent)]"/><h2 className="section-title">Setup checklist</h2><span className="badge ml-auto">3 of 4</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full w-3/4 rounded-full bg-[var(--accent)]"/></div><p className="muted mt-3 text-xs leading-5">Invite a teammate to finish setting up your workspace.</p></div></div>
    </section>
  </>;
}
