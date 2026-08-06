import { toNextJsHandler } from "better-auth/next-js";

async function handle(request: Request) {
  if (!process.env.DATABASE_URL) return Response.json({ error: "Authentication service is not configured" }, { status: 503 });
  const { auth } = await import("@/lib/auth/auth");
  const handlers = toNextJsHandler(auth);
  return request.method === "GET" ? handlers.GET(request) : handlers.POST(request);
}
export const GET = handle;
export const POST = handle;
