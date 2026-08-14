import { AppShell } from "@/components/layout/app-shell";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { userPreferences } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const [preferences] = await getDb()
    .select({ theme: userPreferences.theme })
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id))
    .limit(1);
  const theme =
    preferences?.theme === "light" || preferences?.theme === "dark"
      ? preferences.theme
      : "system";
  return (
    <AppShell
      user={{ name: user.name, email: user.email, image: user.image ?? null }}
      theme={theme}
    >
      {children}
    </AppShell>
  );
}
