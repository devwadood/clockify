"use client";

import { Clock3, Save } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { createTimeEntry } from "@/server/actions/time-entries";
import { formatDuration } from "@/lib/utils";
import { parseClockTime } from "@/lib/time/clock";
import { toast } from "sonner";

type Project = {
  id: string;
  name: string;
  client: string | null;
  color: string;
  billable: boolean;
};
type Entry = {
  id: string;
  project: string;
  color: string;
  description: string;
  startedAt: Date;
  endedAt: Date;
  durationMinutes: number;
};

export function TimerView({
  projects,
  entries,
}: {
  projects: Project[];
  entries: Entry[];
}) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const total = entries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  function validateEntry(event: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const start = parseClockTime(String(data.get("start") ?? ""));
    const end = parseClockTime(String(data.get("end") ?? ""));
    const breakMinutes = Number(data.get("breakMinutes") ?? 0);
    if (!start || !end) {
      event.preventDefault();
      toast.error("Enter a valid start and end time");
      return;
    }
    const elapsed = end.totalMinutes - start.totalMinutes;
    if (elapsed <= 0) {
      event.preventDefault();
      toast.error("End time must be later than start time");
      return;
    }
    if (!Number.isFinite(breakMinutes) || breakMinutes < 0 || breakMinutes >= elapsed) {
      event.preventDefault();
      toast.error("Break must be shorter than the working duration");
    }
  }
  if (!projects.length)
    return (
      <>
        <PageHeader
          title="Time entry"
          description="Record the work you have completed."
        />
        <section className="card grid min-h-[400px] place-items-center p-6 text-center">
          <div className="max-w-sm">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Clock3 size={24} />
            </span>
            <h2 className="mt-5 text-xl font-bold">A project comes first</h2>
            <p className="muted mt-2 text-sm leading-6">
              Create a project before logging time so every entry has the right
              home.
            </p>
            <Link href="/projects/new" className="btn btn-primary mt-5">
              Create first project
            </Link>
          </div>
        </section>
      </>
    );
  return (
    <>
      <PageHeader
        title="Add time"
        description="Record real work against one of your active projects."
      />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <form action={createTimeEntry} onSubmit={validateEntry} className="card overflow-hidden">
          <div className="border-b border-[var(--border)] p-5">
            <h2 className="section-title">New time entry</h2>
            <p className="muted mt-1 text-xs">
              All fields are validated before your entry is saved.
            </p>
          </div>
          <div className="grid gap-5 p-5 md:p-6">
            <div>
              <label className="label">Project</label>
              <select name="projectId" required className="field">
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                    {project.client ? ` · ${project.client}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <input
                name="description"
                required
                maxLength={240}
                className="field"
                placeholder="What did you work on?"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="label">Date</label>
                <input
                  name="date"
                  required
                  type="date"
                  max={today}
                  className="field"
                  defaultValue={today}
                />
              </div>
              <div>
                <label className="label">Start</label>
                <input
                  name="start"
                  required
                  type="time"
                  step="60"
                  className="field"
                  defaultValue="09:00"
                />
              </div>
              <div>
                <label className="label">End</label>
                <input
                  name="end"
                  required
                  type="time"
                  step="60"
                  className="field"
                  defaultValue="10:00"
                />
              </div>
              <div>
                <label className="label">Break, min</label>
                <input
                  name="breakMinutes"
                  required
                  type="number"
                  min="0"
                  max="600"
                  className="field"
                  defaultValue="0"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                name="billable"
                type="checkbox"
                defaultChecked
                className="size-4 accent-[var(--accent)]"
              />
              Billable time
            </label>
          </div>
          <div className="flex justify-end border-t border-[var(--border)] bg-[var(--surface-2)] p-4">
            <button className="btn btn-primary">
              <Save size={15} />
              Save time entry
            </button>
          </div>
        </form>
        <aside className="card h-fit overflow-hidden">
          <div className="border-b border-[var(--border)] p-4">
            <h2 className="section-title">Today</h2>
            <p className="muted mt-1 text-xs">
              {new Intl.DateTimeFormat("en", {
                weekday: "long",
                month: "long",
                day: "numeric",
              }).format(new Date())}
            </p>
          </div>
          {entries.length ? (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="flex gap-3 border-b border-[var(--border)] p-4 last:border-0"
              >
                <span
                  className="mt-1 size-2.5 rounded-full"
                  style={{ background: entry.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">
                    {entry.description}
                  </p>
                  <p className="muted mt-1 text-[11px]">{entry.project}</p>
                </div>
                <b className="text-[13px]">
                  {formatDuration(entry.durationMinutes)}
                </b>
              </div>
            ))
          ) : (
            <div className="muted p-8 text-center text-xs">
              No time logged today. Your first entry will appear here.
            </div>
          )}
          <div className="flex justify-between bg-[var(--surface-2)] p-4 text-sm">
            <span className="muted">Total today</span>
            <b>{formatDuration(total)}</b>
          </div>
        </aside>
      </div>
    </>
  );
}
