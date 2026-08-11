import { and, eq, gt, isNull, or } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import { getDb } from "@/db";
import { publicReportLinks } from "@/db/schema";
import { getReportData } from "@/lib/reports/data";
import { ReportPdf } from "@/lib/reports/pdf";
import { hashToken } from "@/lib/security/tokens";

export const runtime = "nodejs";
export async function GET(_:Request,{params}:{params:Promise<{token:string}>}) {
  const token = (await params).token;
  const [link] = await getDb().select({reportId:publicReportLinks.reportId}).from(publicReportLinks).where(and(eq(publicReportLinks.tokenHash,hashToken(token)),isNull(publicReportLinks.revokedAt),eq(publicReportLinks.downloadEnabled,true),or(isNull(publicReportLinks.expiresAt),gt(publicReportLinks.expiresAt,new Date())))).limit(1);
  if (!link) return new Response("Report unavailable",{status:404});
  const data = await getReportData(link.reportId);
  if (!data) return new Response("Report unavailable",{status:404});
  const buffer = await renderToBuffer(<ReportPdf data={data}/>);
  return new Response(new Uint8Array(buffer),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${data.report.title.replace(/[^a-z0-9]+/gi,"-").toLowerCase()}.pdf"`,"Cache-Control":"private, no-store"}});
}
