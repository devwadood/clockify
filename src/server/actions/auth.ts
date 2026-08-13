"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const { auth } = await import("@/lib/auth/auth");
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
