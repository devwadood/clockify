import { TimesheetPage } from "@/components/timesheets/timesheet-page";
export const dynamic = "force-dynamic";
export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <TimesheetPage searchParams={searchParams} />;
}
