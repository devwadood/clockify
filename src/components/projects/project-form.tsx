"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { createProject } from "@/server/actions/projects";
import { PROJECT_COLORS } from "@/lib/projects/colors";
const currencies = [
  ["USD", "US Dollar"],
  ["PKR", "Pakistani Rupee"],
  ["INR", "Indian Rupee"],
  ["EUR", "Euro"],
  ["GBP", "British Pound"],
  ["AED", "UAE Dirham"],
];

export function ProjectForm() {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<string>(PROJECT_COLORS[0]);
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return (
    <>
      <button
        onClick={() => router.back()}
        className="muted mb-4 flex items-center gap-1 text-xs font-semibold hover:text-[var(--text)]"
      >
        <ArrowLeft size={14} />
        Back to projects
      </button>
      <PageHeader
        title="Create a project"
        description="Set up the basics now—you can refine permissions and approvals later."
      />
      <form
        action={createProject}
        className="card mx-auto max-w-3xl overflow-hidden"
      >
        <div className="border-b border-[var(--border)] p-5 md:p-7">
          <h2 className="section-title">Project details</h2>
          <p className="muted mt-1 text-xs">
            Fields marked with an asterisk are required.
          </p>
          <div className="mt-6 grid gap-5">
            <div>
              <label className="label">Project name *</label>
              <input
                name="name"
                required
                minLength={2}
                maxLength={100}
                className="field"
                placeholder="e.g. Website redesign"
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                maxLength={1000}
                className="field min-h-24 resize-y py-3"
                placeholder="A short summary of the work and its outcome…"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Client</label>
                <input
                  name="clientName"
                  maxLength={100}
                  className="field"
                  placeholder="Client or company name"
                />
              </div>
              <div>
                <label className="label">Project code</label>
                <input
                  name="code"
                  maxLength={30}
                  className="field"
                  placeholder="e.g. WEB-24"
                />
              </div>
            </div>
            <fieldset>
              <legend className="label">Project color</legend>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((color) => (
                  <label
                    key={color}
                    title={color}
                    className={`grid size-10 cursor-pointer place-items-center rounded-xl transition ${selectedColor === color ? "scale-105 ring-2 ring-[var(--text)] ring-offset-2 ring-offset-[var(--surface)]" : "hover:scale-105"}`}
                    style={{ backgroundColor: color }}
                  >
                    <input
                      value={color}
                      type="radio"
                      name="color"
                      checked={selectedColor === color}
                      onChange={() => setSelectedColor(color)}
                      className="sr-only"
                    />
                    <Check
                      size={17}
                      strokeWidth={3}
                      className={
                        selectedColor === color ? "text-white" : "opacity-0"
                      }
                    />
                  </label>
                ))}
              </div>
              <p className="muted mt-3 text-xs">
                Selected color:{" "}
                <span className="font-mono uppercase">{selectedColor}</span>
              </p>
            </fieldset>
          </div>
        </div>
        <div className="border-b border-[var(--border)] p-5 md:p-7">
          <h2 className="section-title">Billing & schedule</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Hourly rate</label>
              <div className="flex">
                <select
                  name="currency"
                  defaultValue="USD"
                  className="field w-36 rounded-r-none"
                >
                  {currencies.map(([code, name]) => (
                    <option key={code} value={code}>
                      {code} · {name}
                    </option>
                  ))}
                </select>
                <input
                  name="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  className="field rounded-l-none border-l-0"
                  placeholder="95.00"
                />
              </div>
            </div>
            <div>
              <label className="label">Project timezone *</label>
              <select name="timezone" required className="field">
                <option value="Asia/Karachi">Asia/Karachi (UTC+05:00)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (UTC+05:30)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
            <div>
              <label className="label">Start date *</label>
              <input
                name="startDate"
                required
                type="date"
                className="field"
                defaultValue={localToday}
              />
            </div>
            <div>
              <label className="label">End date</label>
              <input name="endDate" type="date" className="field" />
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-4">
              <input
                name="billable"
                defaultChecked
                type="checkbox"
                className="mt-0.5 size-4 accent-[var(--accent)]"
              />
              <span>
                <b className="block text-sm">Billable project</b>
                <span className="muted mt-1 block text-xs">
                  New time entries will be billable by default.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-4">
              <input
                name="approvalRequired"
                type="checkbox"
                className="mt-0.5 size-4 accent-[var(--accent)]"
              />
              <span>
                <b className="block text-sm">Require timesheet approval</b>
                <span className="muted mt-1 block text-xs">
                  Members submit weekly hours for review.
                </span>
              </span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 bg-[var(--surface-2)] p-4">
          <button type="button" className="btn" onClick={() => router.back()}>
            Cancel
          </button>
          <button className="btn btn-primary">
            Create project
            <ChevronRight size={15} />
          </button>
        </div>
      </form>
    </>
  );
}
