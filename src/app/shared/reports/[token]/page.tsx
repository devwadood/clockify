import type { Metadata } from "next";
import Link from "next/link";
import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import { Download, LockKeyhole } from "lucide-react";
import { getDb } from "@/db";
import { publicReportLinks } from "@/db/schema";
import { getReportData } from "@/lib/reports/data";
import { TRACKER_WEBSITE_LABEL, TRACKER_WEBSITE_URL } from "@/lib/brand";
import { hashToken } from "@/lib/security/tokens";
import { formatDuration } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/logo";
export const metadata: Metadata = {
  title: "Shared time report",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function SharedReport({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const db = getDb();
  const [link] = await db
    .select({
      id: publicReportLinks.id,
      reportId: publicReportLinks.reportId,
      downloadEnabled: publicReportLinks.downloadEnabled,
    })
    .from(publicReportLinks)
    .where(
      and(
        eq(publicReportLinks.tokenHash, hashToken(token)),
        isNull(publicReportLinks.revokedAt),
        or(
          isNull(publicReportLinks.expiresAt),
          gt(publicReportLinks.expiresAt, new Date()),
        ),
      ),
    )
    .limit(1);
  if (!link) return <Unavailable />;
  const data = await getReportData(link.reportId);
  if (!data) return <Unavailable />;
  await db
    .update(publicReportLinks)
    .set({
      viewCount: sql`${publicReportLinks.viewCount}+1`,
      lastViewedAt: new Date(),
    })
    .where(eq(publicReportLinks.id, link.id));
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
    <PublicFrame>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold text-[var(--accent)] uppercase">
            Time report
          </p>
          <h1 className="mt-2 text-3xl font-bold">{data.report.title}</h1>
          <p className="muted mt-2 text-sm">
            {data.report.projectName ?? "All projects"} ·{" "}
            {data.filters.from ?? "All time"} – {data.filters.to ?? "Present"}
          </p>
        </div>
        {link.downloadEnabled && (
          <Link
            href={`/api/shared/reports/${token}/pdf`}
            className="btn btn-primary sm:ml-auto"
          >
            <Download size={15} />
            Download PDF
          </Link>
        )}
      </div>
      <div className="card p-6">
        <div className="grid grid-cols-2 gap-4 border-b border-[var(--border)] pb-6 sm:grid-cols-4">
          {[
            ["Total hours", formatDuration(data.summary.totalMinutes)],
            ["Billable", formatDuration(data.summary.billableMinutes)],
            ["Non-billable", formatDuration(data.summary.nonBillableMinutes)],
            ["Amount", amountLabel],
          ].map((x) => (
            <div key={x[0]}>
              <p className="muted text-xs">{x[0]}</p>
              <b className="mt-2 block text-xl">{x[1]}</b>
            </div>
          ))}
        </div>
        <h2 className="mt-6 text-sm font-bold">Time entries</h2>
        <div className="mt-3 divide-y divide-[var(--border)]">
          {data.entries.map((entry) => (
            <div key={entry.id} className="flex gap-3 py-4 text-sm">
              <div className="min-w-0 flex-1">
                <b className="block truncate">{entry.description}</b>
                <p className="muted mt-1 text-xs">
                  {entry.date} · {entry.project} · {entry.member}
                </p>
              </div>
              <span className="font-semibold">
                {formatDuration(entry.durationMinutes)}
              </span>
            </div>
          ))}
          {!data.entries.length && (
            <p className="muted py-8 text-center text-sm">
              No entries match this report.
            </p>
          )}
        </div>
      </div>
      <p className="muted mt-5 text-center text-xs">
        Report reference:{" "}
        <a
          href={TRACKER_WEBSITE_URL}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[var(--accent)] hover:underline"
        >
          {TRACKER_WEBSITE_LABEL}
        </a>
      </p>
    </PublicFrame>
  );
}
function Unavailable() {
  return (
    <PublicFrame>
      <div className="mx-auto max-w-md py-24 text-center">
        <LockKeyhole className="mx-auto" />
        <h1 className="mt-5 text-xl font-bold">Report unavailable</h1>
        <p className="muted mt-2 text-sm">
          This link is invalid, expired, or has been revoked.
        </p>
      </div>
    </PublicFrame>
  );
}
function PublicFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-5">
          <a href={TRACKER_WEBSITE_URL} aria-label="Visit Tracker website">
            <BrandLogo />
          </a>
          <span className="muted ml-auto text-xs">Secure shared report</span>
        </div>
      </header>
      <div className="mx-auto max-w-5xl p-5 py-10">{children}</div>
    </main>
  );
}
