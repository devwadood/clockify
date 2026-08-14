"use client";

import { useActionState, useEffect, useState } from "react";
import {
  AlertCircle,
  Clock3,
  LoaderCircle,
  Play,
  Save,
  Square,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import {
  createTimeEntry,
  type TimeEntryActionState,
} from "@/server/actions/time-entries";
import { formatDuration } from "@/lib/utils";
import { parseClockTime } from "@/lib/time/clock";
import { toast } from "sonner";
import {
  discardTimer,
  startTimer,
  stopTimer,
  type TimerActionState,
} from "@/server/actions/timers";

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
type ActiveTimer = {
  id: string;
  projectId: string;
  project: string;
  color: string;
  description: string | null;
  status: "running" | "paused";
  startedAt: Date;
  pausedAt: Date | null;
  accumulatedSeconds: number;
};

export function TimerView({
  projects,
  entries,
  activeTimer,
}: {
  projects: Project[];
  entries: Entry[];
  activeTimer: ActiveTimer | null;
}) {
  const [state, formAction, pending] = useActionState<
    TimeEntryActionState,
    FormData
  >(createTimeEntry, {});
  const [billable, setBillable] = useState(true);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const total = entries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  useEffect(() => {
    if (!state.error) return;
    const occupied = state.occupied?.map((entry) => entry.time).join(", ");
    toast.error(state.error, {
      description: occupied ? `Already recorded: ${occupied}` : undefined,
      duration: 8000,
    });
  }, [state]);
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
    if (
      !Number.isFinite(breakMinutes) ||
      breakMinutes < 0 ||
      breakMinutes >= elapsed
    ) {
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
        title="Time tracker"
        description="Run a live timer or record completed work manually."
      />
      <TimerControls projects={projects} activeTimer={activeTimer} />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <form
          action={formAction}
          onSubmit={validateEntry}
          className="card overflow-hidden"
        >
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
                checked={billable}
                onChange={(event) => setBillable(event.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Billable time
            </label>
            {state.error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/25 bg-red-500/[.07] p-4"
              >
                <div className="flex gap-3">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">
                      {state.error}
                    </p>
                    {state.occupied?.length ? (
                      <>
                        <p className="muted mt-1 text-xs">
                          Already consumed hours on the selected day:
                        </p>
                        <div className="mt-3 grid gap-2">
                          {state.occupied.map((entry, index) => (
                            <div
                              key={`${entry.time}-${index}`}
                              className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs"
                            >
                              <b className="shrink-0">{entry.time}</b>
                              <span className="muted min-w-0 flex-1 truncate">
                                {entry.description}
                              </span>
                              <span className="muted shrink-0">
                                {formatDuration(entry.durationMinutes)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end border-t border-[var(--border)] bg-[var(--surface-2)] p-4">
            <button
              disabled={pending}
              className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              {pending ? "Saving…" : "Save time entry"}
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

function TimerControls({
  projects,
  activeTimer,
}: {
  projects: Project[];
  activeTimer: ActiveTimer | null;
}) {
  return activeTimer ? (
    <RunningTimer timer={activeTimer} />
  ) : (
    <StartTimerForm projects={projects} />
  );
}

function StartTimerForm({ projects }: { projects: Project[] }) {
  const [state, action, pending] = useActionState<TimerActionState, FormData>(
    startTimer,
    {},
  );
  return (
    <section className="card mb-5 overflow-hidden border-[color-mix(in_srgb,var(--accent)_30%,var(--border))]">
      <div className="border-b border-[var(--border)] p-5">
        <h2 className="section-title flex items-center gap-2">
          <Play size={16} className="text-[var(--accent)]" />
          Start a live timer
        </h2>
        <p className="muted mt-1 text-xs">
          Choose the project and describe the task before timing begins.
        </p>
      </div>
      <form
        action={action}
        className="grid gap-4 p-5 sm:grid-cols-[minmax(180px,.8fr)_minmax(240px,1.4fr)_auto]"
      >
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
          <label className="label">Task details</label>
          <input
            name="description"
            required
            minLength={1}
            maxLength={240}
            className="field"
            placeholder="What are you working on?"
          />
        </div>
        <button
          disabled={pending}
          className="btn btn-primary self-end disabled:opacity-60"
        >
          {pending ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <Play size={14} fill="currentColor" />
          )}
          {pending ? "Starting…" : "Start timer"}
        </button>
        {state.error && (
          <p role="alert" className="text-sm text-red-600 sm:col-span-3">
            {state.error}
          </p>
        )}
      </form>
    </section>
  );
}

function RunningTimer({ timer }: { timer: ActiveTimer }) {
  const [state, action, pending] = useActionState<TimerActionState, FormData>(
    stopTimer,
    {},
  );
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  useEffect(() => {
    if (timer.status !== "running") return;
    const interval = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [timer.status]);
  const liveSeconds =
    timer.status === "running"
      ? Math.max(
          0,
          Math.floor(
            (currentTime - new Date(timer.startedAt).getTime()) / 1000,
          ),
        )
      : 0;
  const seconds = timer.accumulatedSeconds + liveSeconds;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const display = [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
  return (
    <section className="card mb-5 overflow-hidden border-[color-mix(in_srgb,#10b981_45%,var(--border))]">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center md:p-6">
        <span className="timer-dot size-3 shrink-0 rounded-full bg-emerald-500" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold tracking-[.08em] text-emerald-600 uppercase">
            Timer running
          </p>
          <h2 className="mt-1 truncate text-lg font-bold">
            {timer.description || "Timed work"}
          </h2>
          <p className="muted mt-1 flex items-center gap-2 text-xs">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: timer.color }}
            />
            {timer.project} · started{" "}
            {new Intl.DateTimeFormat("en", {
              hour: "numeric",
              minute: "2-digit",
            }).format(new Date(timer.startedAt))}
          </p>
        </div>
        <output
          aria-label={`${display} elapsed`}
          className="font-mono text-3xl font-bold tracking-tight tabular-nums sm:text-4xl"
        >
          {display}
        </output>
        <form action={action}>
          <input type="hidden" name="timerId" value={timer.id} />
          <button
            disabled={pending}
            className="btn btn-primary bg-red-600 disabled:opacity-60"
          >
            {pending ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Square size={14} fill="currentColor" />
            )}
            {pending ? "Saving…" : "Stop & save"}
          </button>
        </form>
        <form action={discardTimer}>
          <input type="hidden" name="timerId" value={timer.id} />
          <button
            aria-label="Discard timer"
            title="Discard timer"
            className="btn icon-btn text-red-600"
            onClick={(event) => {
              if (!window.confirm("Discard this timer without saving it?"))
                event.preventDefault();
            }}
          >
            <Trash2 size={15} />
          </button>
        </form>
      </div>
      {state.error && (
        <p
          role="alert"
          className="border-t border-[var(--border)] bg-red-500/[.06] px-5 py-3 text-sm text-red-600"
        >
          {state.error}
        </p>
      )}
    </section>
  );
}
