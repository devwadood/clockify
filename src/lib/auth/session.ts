import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getCurrentSession() {
  const requestHeaders = await headers();
  if (!process.env.DATABASE_URL) return null;
  const { auth } = await import("./auth");
  return auth.api.getSession({ headers: requestHeaders });
}

export async function requireUser() {
  const session = await getCurrentSession();
  if (!session?.user) redirect("/login");
  return session.user;
}
