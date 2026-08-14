"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { userPreferences } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

export type ThemePreferenceState = {
  error?: string;
  success?: string;
};

export async function updateThemePreference(
  previousState: ThemePreferenceState,
  formData: FormData,
): Promise<ThemePreferenceState> {
  void previousState;
  const current = await requireUser();
  const parsed = z
    .enum(["system", "light", "dark"])
    .safeParse(formData.get("theme"));
  if (!parsed.success) return { error: "Choose a valid theme." };
  await getDb()
    .insert(userPreferences)
    .values({ userId: current.id, theme: parsed.data })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: { theme: parsed.data, updatedAt: new Date() },
    });
  revalidatePath("/", "layout");
  revalidatePath("/settings/preferences");
  return { success: "Theme updated." };
}
