"use client";

import { useState } from "react";
import { CheckSquare2, FileBarChart, MinusSquare } from "lucide-react";
import { generateReport } from "@/server/actions/reports";

type Project = {
  id: string;
  name: string;
  client: string | null;
  role: "owner" | "admin" | "member";
};

export function ReportBuilderForm({
  projects,
  today,
  monthStart,
}: {
  projects: Project[];
  today: string;
  monthStart: string;
}) {
  const [scope, setScope] = useState<"organization" | "selected">(
    "organization",
  );
  const [chosen, setChosen] = useState<Set<string>>(() => new Set());
  const toggle = (id: string) =>
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <form action={generateReport} className="card max-w-3xl overflow-hidden">
      <div className="grid gap-5 p-5 md:p-6">
        <div>
          <label className="label">Report title</label>
          <input
            name="title"
            required
            minLength={2}
            maxLength={120}
            className="field"
            placeholder="e.g. Organization monthly summary"
          />
        </div>
        <fieldset>
          <legend className="label">Report scope</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`cursor-pointer rounded-xl border p-4 transition ${scope === "organization" ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)]"}`}
            >
              <input
                type="radio"
                name="scope"
                value="organization"
                checked={scope === "organization"}
                onChange={() => setScope("organization")}
                className="sr-only"
              />
              <b className="flex items-center gap-2 text-sm">
                <CheckSquare2 size={16} />
                Organization level
              </b>
              <span className="muted mt-1 block text-xs">
                Include every accessible project, with team hours where your
                role permits.
              </span>
            </label>
            <label
              className={`cursor-pointer rounded-xl border p-4 transition ${scope === "selected" ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)]"}`}
            >
              <input
                type="radio"
                name="scope"
                value="selected"
                checked={scope === "selected"}
                onChange={() => setScope("selected")}
                className="sr-only"
              />
              <b className="flex items-center gap-2 text-sm">
                <MinusSquare size={16} />
                Selected projects
              </b>
              <span className="muted mt-1 block text-xs">
                Build one combined report from two or more chosen projects.
              </span>
            </label>
          </div>
        </fieldset>
        <div className="rounded-xl border border-[var(--border)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <b className="text-sm">
              {scope === "organization"
                ? "Exclude projects"
                : "Include projects"}
            </b>
            <p className="muted mt-1 text-xs">
              {scope === "organization"
                ? "Leave all unchecked to include the complete organization scope."
                : "Select every project that should appear in this report."}
            </p>
          </div>
          <div className="grid gap-1 p-2 sm:grid-cols-2">
            {projects.map((project) => (
              <label
                key={project.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-2.5 hover:bg-[var(--surface-2)]"
              >
                <input
                  name={
                    scope === "organization"
                      ? "excludedProjectIds"
                      : "projectIds"
                  }
                  value={project.id}
                  type="checkbox"
                  checked={chosen.has(project.id)}
                  onChange={() => toggle(project.id)}
                  className="size-4 accent-[var(--accent)]"
                />
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-xs">{project.name}</b>
                  <span className="muted block truncate text-[11px]">
                    {project.client ?? "No client"} · {project.role}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">From</label>
            <input
              name="from"
              required
              defaultValue={monthStart}
              max={today}
              className="field"
              type="date"
            />
          </div>
          <div>
            <label className="label">To</label>
            <input
              name="to"
              required
              defaultValue={today}
              max={today}
              className="field"
              type="date"
            />
          </div>
        </div>
        <div>
          <label className="label">Billable</label>
          <select name="billable" className="field">
            <option value="any">All time</option>
            <option value="yes">Billable only</option>
            <option value="no">Non-billable only</option>
          </select>
        </div>
        <div>
          <label className="label">Group entries</label>
          <select name="groupBy" className="field" defaultValue="project">
            <option value="project">Group by project with subtotals</option>
            <option value="none">No grouping</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end border-t border-[var(--border)] bg-[var(--surface-2)] p-4">
        <button
          disabled={
            (scope === "selected" && !chosen.size) ||
            (scope === "organization" && chosen.size === projects.length)
          }
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileBarChart size={15} />
          Generate report
        </button>
      </div>
    </form>
  );
}
