import type { getReportData } from "./data";
export type AwaitedReportData = NonNullable<Awaited<ReturnType<typeof getReportData>>>;
