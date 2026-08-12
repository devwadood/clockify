import Link from "next/link";
import { Download, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getReportData } from "@/lib/reports/data";
import { formatDuration } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { createReportShareLink } from "@/server/actions/reports";

export async function ReportPage({ reportId }: { reportId: string }) {
  const current = await requireUser();
  const data = await getReportData(reportId, current.id);
  if (!data) notFound();
  const currency = data.report.currency ?? data.entries[0]?.currency ?? "USD";
  const amountLabel = Object.entries(data.summary.amounts).length
    ? Object.entries(data.summary.amounts)
        .map(([code, value]) =>
          new Intl.NumberFormat("en", {
            style: "currency",
            currency: code,
          }).format(value),
        )
        .join(" · ")
    : new Intl.NumberFormat("en", { style: "currency", currency }).format(0);
  return (
    <>
      <PageHeader
        title={data.report.title}
        description={`${data.report.projectName ?? "All projects"} · ${data.filters.from ?? "All time"} – ${data.filters.to ?? "Present"}`}
        actions={
          <Link
            href={`/api/reports/${reportId}/pdf`}
            className="btn btn-primary"
          >
            <Download size={14} />
            Download PDF
          </Link>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        <Stat
          label="Total hours"
          value={formatDuration(data.summary.totalMinutes)}
        />
        <Stat
          label="Billable"
          value={formatDuration(data.summary.billableMinutes)}
        />
        <Stat
          label="Non-billable"
          value={formatDuration(data.summary.nonBillableMinutes)}
        />
        <Stat label="Amount" value={amountLabel} />
      </div>
      <section className="card mb-5 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <h2 className="section-title">Share this report</h2>
            <p className="muted mt-1 text-xs">
              Create a secure, unguessable public link. The raw token is never
              stored.
            </p>
          </div>
          <form
            action={createReportShareLink}
            className="flex flex-wrap items-end gap-3"
          >
            <input type="hidden" name="reportId" value={reportId} />
            <div>
              <label className="label">Expires</label>
              <select name="expiresIn" className="field w-36">
                <option value="7">In 7 days</option>
                <option value="30">In 30 days</option>
                <option value="never">Never</option>
              </select>
            </div>
            <label className="mb-2 flex items-center gap-2 text-xs">
              <input
                name="downloadEnabled"
                type="checkbox"
                defaultChecked
                className="size-4 accent-[var(--accent)]"
              />
              Allow PDF
            </label>
            <button className="btn">
              <Share2 size={14} />
              Create link
            </button>
          </form>
        </div>
      </section>
      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="bg-[var(--surface-2)] text-[var(--muted)] uppercase">
              <tr>
                {[
                  "Date",
                  "Member",
                  "Project",
                  "Description",
                  "Time",
                  "Duration",
                  "Amount",
                  "Status",
                ].map((x) => (
                  <th key={x} className="px-4 py-3">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.entries.map((entry) => (
                <tr key={entry.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3">{entry.date}</td>
                  <td className="px-4 py-3">{entry.member}</td>
                  <td className="px-4 py-3">{entry.project}</td>
                  <td className="max-w-64 truncate px-4 py-3 font-semibold">
                    {entry.description}
                  </td>
                  <td className="muted px-4 py-3">
                    {new Intl.DateTimeFormat("en-GB", {
                      timeZone: entry.timezone,
                      hour: "2-digit",
                      minute: "2-digit",
                      hourCycle: "h23",
                    }).format(entry.startedAt)}
                    –
                    {new Intl.DateTimeFormat("en-GB", {
                      timeZone: entry.timezone,
                      hour: "2-digit",
                      minute: "2-digit",
                      hourCycle: "h23",
                    }).format(entry.endedAt)}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {formatDuration(entry.durationMinutes)}
                  </td>
                  <td className="px-4 py-3">
                    {entry.billable
                      ? new Intl.NumberFormat("en", {
                          style: "currency",
                          currency: entry.currency,
                        }).format(
                          (entry.durationMinutes / 60) *
                            Number(entry.hourlyRate ?? 0),
                        )
                      : "—"}
                  </td>
                  <td className="px-4 py-3 capitalize">{entry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.entries.length && (
          <p className="muted p-10 text-center text-sm">
            No time entries match these report filters.
          </p>
        )}
      </section>
    </>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="muted text-xs">{label}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}
