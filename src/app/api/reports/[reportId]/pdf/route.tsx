import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentSession } from "@/lib/auth/session";
import { getReportData } from "@/lib/reports/data";
import { ReportPdf } from "@/lib/reports/pdf";

export const runtime = "nodejs";
export async function GET(_:Request,{params}:{params:Promise<{reportId:string}>}) {
  const session = await getCurrentSession();
  if (!session?.user) return new Response("Unauthorized",{status:401});
  const data = await getReportData((await params).reportId, session.user.id);
  if (!data) return new Response("Not found",{status:404});
  const buffer = await renderToBuffer(<ReportPdf data={data}/>);
  return new Response(new Uint8Array(buffer),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${data.report.title.replace(/[^a-z0-9]+/gi,"-").toLowerCase()}.pdf"`,"Cache-Control":"private, no-store"}});
}
