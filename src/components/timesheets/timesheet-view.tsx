import Link from "next/link";
import {
  CalendarDays,
  ChevronDown,
  Filter,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DeleteTimeEntryButton } from "@/components/timesheets/delete-time-entry-button";
import { formatDuration } from "@/lib/utils";
import { updateTimeEntry } from "@/server/actions/time-entries";
import type { TimesheetFilters } from "./timesheet-page";

export type TimesheetEntry = {
  id: string;
  projectId: string;
  date: string;
  description: string;
  project: string;
  client: string | null;
  color: string;
  timezone: string;
  startedAt: Date;
  endedAt: Date;
  breakMinutes: number;
  durationMinutes: number;
  billable: boolean;
  status: string;
};
export function TimesheetView({
  entries,
  projects,
  filters,
}: {
  entries: TimesheetEntry[];
  projects: { id: string; name: string; client: string | null }[];
  filters: TimesheetFilters;
}) {
  const timeValue = (date: Date, timeZone: string) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(date);
  const clients = [
    ...new Set(
      projects
        .map((project) => project.client)
        .filter((client): client is string => Boolean(client)),
    ),
  ].sort();
  const activeFilters = Object.values(filters).filter(Boolean).length;
  const totalMinutes = entries.reduce(
    (sum, entry) => sum + entry.durationMinutes,
    0,
  );
  const billableMinutes = entries
    .filter((entry) => entry.billable)
    .reduce((sum, entry) => sum + entry.durationMinutes, 0);
  return (
    <>
      <PageHeader
        title="Timesheets"
        description="Review and organize your logged time."
        actions={
          <Link className="btn btn-primary" href="/timer">
            <Plus size={15} />
            Add time
          </Link>
        }
      />
      <details className="card group mb-5 overflow-hidden">
        <summary className="flex cursor-pointer list-none items-center gap-3 border-b border-transparent p-4 transition hover:bg-[var(--surface-2)] group-open:border-[var(--border)] md:px-5 [&::-webkit-details-marker]:hidden">
          <span className="grid size-9 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <Filter size={16} />
          </span>
          <div>
            <h2 className="section-title">Filter time entries</h2>
            <p className="muted mt-0.5 text-xs">
              Narrow entries by period, working time, project, client, duration,
              and status.
            </p>
          </div>
          <span className="ml-auto flex items-center gap-3">
            {activeFilters > 0 && (
              <span className="badge">{activeFilters} active</span>
            )}
            <ChevronDown
              size={17}
              className="muted transition-transform group-open:rotate-180"
            />
          </span>
        </summary>
        <form
          action="/timesheets"
          method="get"
          className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 md:p-5"
        >
          <div className="sm:col-span-2">
            <label className="label">Search description</label>
            <div className="relative">
              <Search
                size={15}
                className="muted pointer-events-none absolute top-3.5 left-3"
              />
              <input
                name="search"
                defaultValue={filters.search}
                maxLength={120}
                className="field field-leading"
                placeholder="Search recorded work…"
              />
            </div>
          </div>
          <div>
            <label className="label">From date</label>
            <input
              name="from"
              type="date"
              defaultValue={filters.from}
              className="field"
            />
          </div>
          <div>
            <label className="label">To date</label>
            <input
              name="to"
              type="date"
              defaultValue={filters.to}
              min={filters.from || undefined}
              className="field"
            />
          </div>
          <div>
            <label className="label">Started after</label>
            <input
              name="fromTime"
              type="time"
              step="60"
              defaultValue={filters.fromTime}
              className="field"
            />
          </div>
          <div>
            <label className="label">Ended before</label>
            <input
              name="toTime"
              type="time"
              step="60"
              defaultValue={filters.toTime}
              className="field"
            />
          </div>
          <div>
            <label className="label">Project</label>
            <select
              name="projectId"
              defaultValue={filters.projectId}
              className="field"
            >
              <option value="">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Client</label>
            <select
              name="client"
              defaultValue={filters.client}
              className="field"
            >
              <option value="">All clients</option>
              {clients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Minimum hours</label>
            <input
              name="minHours"
              type="number"
              min="0"
              max="24"
              step="0.25"
              defaultValue={filters.minHours}
              className="field"
              placeholder="0"
            />
          </div>
          <div>
            <label className="label">Maximum hours</label>
            <input
              name="maxHours"
              type="number"
              min="0"
              max="24"
              step="0.25"
              defaultValue={filters.maxHours}
              className="field"
              placeholder="24"
            />
          </div>
          <div>
            <label className="label">Billing</label>
            <select
              name="billable"
              defaultValue={filters.billable}
              className="field"
            >
              <option value="">Any</option>
              <option value="yes">Billable</option>
              <option value="no">Non-billable</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              name="status"
              defaultValue={filters.status}
              className="field"
            >
              <option value="">Any status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4 xl:col-span-6">
            <button className="btn btn-primary">
              <Filter size={14} />
              Apply filters
            </button>
            {activeFilters > 0 && (
              <Link href="/timesheets" className="btn">
                <RotateCcw size={14} />
                Clear all
              </Link>
            )}
          </div>
        </form>
      </details>
      <section className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="muted text-xs">Matching entries</p>
          <p className="mt-2 text-xl font-bold">{entries.length}</p>
        </div>
        <div className="card p-4">
          <p className="muted text-xs">Filtered hours</p>
          <p className="mt-2 text-xl font-bold">
            {formatDuration(totalMinutes)}
          </p>
        </div>
        <div className="card p-4">
          <p className="muted text-xs">Billable hours</p>
          <p className="mt-2 text-xl font-bold">
            {formatDuration(billableMinutes)}
          </p>
        </div>
      </section>
      {!entries.length ? (
        <section className="card grid min-h-[400px] place-items-center p-6 text-center">
          <div className="max-w-sm">
            <CalendarDays className="mx-auto text-[var(--accent)]" />
            <h2 className="mt-5 text-xl font-bold">
              {activeFilters
                ? "No entries match these filters"
                : "Your timesheet is empty"}
            </h2>
            <p className="muted mt-2 text-sm">
              {activeFilters
                ? "Adjust or clear the filters to see more recorded time."
                : "Once you record your first entry, it will appear here for review."}
            </p>
            {activeFilters > 0 && (
              <Link href="/timesheets" className="btn mt-5">
                <RotateCcw size={14} />
                Clear filters
              </Link>
            )}
          </div>
        </section>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <details key={entry.id} className="card group overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center gap-4 p-4">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: entry.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {entry.description}
                  </p>
                  <p className="muted mt-1 text-xs">
                    {entry.date} · {entry.project}
                    {entry.client ? ` · ${entry.client}` : ""} ·{" "}
                    {timeValue(entry.startedAt, entry.timezone)}–
                    {timeValue(entry.endedAt, entry.timezone)}
                  </p>
                </div>
                <b className="text-sm">
                  {formatDuration(entry.durationMinutes)}
                </b>
                <span className="badge capitalize">{entry.status}</span>
                <Pencil size={15} className="muted" />
              </summary>
              <form
                action={updateTimeEntry}
                className="grid gap-4 border-t border-[var(--border)] bg-[var(--surface-2)] p-4 sm:grid-cols-2 lg:grid-cols-6"
              >
                <input type="hidden" name="entryId" value={entry.id} />
                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <input
                    name="description"
                    required
                    maxLength={240}
                    defaultValue={entry.description}
                    className="field"
                  />
                </div>
                <div>
                  <label className="label">Project</label>
                  <select
                    name="projectId"
                    defaultValue={entry.projectId}
                    className="field"
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Date</label>
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={entry.date}
                    className="field"
                  />
                </div>
                <div>
                  <label className="label">Start</label>
                  <input
                    name="start"
                    type="time"
                    required
                    defaultValue={timeValue(entry.startedAt, entry.timezone)}
                    className="field"
                  />
                </div>
                <div>
                  <label className="label">End</label>
                  <input
                    name="end"
                    type="time"
                    required
                    defaultValue={timeValue(entry.endedAt, entry.timezone)}
                    className="field"
                  />
                </div>
                <div>
                  <label className="label">Break, min</label>
                  <input
                    name="breakMinutes"
                    type="number"
                    min="0"
                    max="600"
                    required
                    defaultValue={entry.breakMinutes}
                    className="field"
                  />
                </div>
                <label className="flex items-center gap-2 self-end pb-3 text-xs">
                  <input
                    name="billable"
                    type="checkbox"
                    defaultChecked={entry.billable}
                    className="size-4 accent-[var(--accent)]"
                  />
                  Billable
                </label>
                <button className="btn btn-primary self-end">
                  <Save size={14} />
                  Save changes
                </button>
                <DeleteTimeEntryButton />
              </form>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
