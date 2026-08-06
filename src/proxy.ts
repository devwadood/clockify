import { NextRequest, NextResponse } from "next/server";
const privatePaths=["/dashboard","/timer","/timesheets","/projects","/reports","/team","/settings","/notifications"];
export function proxy(request:NextRequest){
  const response=NextResponse.next(); response.headers.set("Cache-Control","private, no-store");
  // Full database-backed validation is repeated in every server action and data query.
  // Proxy is deliberately limited to an optimistic cookie check for low latency.
  if(process.env.DATABASE_URL&&privatePaths.some(p=>request.nextUrl.pathname.startsWith(p))){
    const hasSession=request.cookies.getAll().some(c=>c.name.includes("better-auth.session_token"));
    if(!hasSession)return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(request.nextUrl.pathname)}`,request.url));
  }
  return response;
}
export const config={matcher:["/((?!api|_next/static|_next/image|favicon.ico).*)"]};
