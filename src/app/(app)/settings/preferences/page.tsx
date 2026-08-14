import { eq } from "drizzle-orm";
import { SettingsView } from "@/components/settings/settings-view";
import { getDb } from "@/db";
import { userPreferences } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

export default async function Page() {
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
  return <SettingsView user={user} theme={theme} />;
}
