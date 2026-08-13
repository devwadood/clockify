"use server";

import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { auditLogs, user as users } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

const MAX_PROFILE_PHOTO_SIZE = 2 * 1024 * 1024;
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type ProfilePhotoState = {
  error?: string;
  success?: string;
};

function hasValidImageSignature(type: string, bytes: Uint8Array) {
  if (type === "image/jpeg")
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png")
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (byte, index) => bytes[index] === byte,
    );
  if (type === "image/webp")
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  return false;
}

export async function uploadProfilePhoto(
  previousState: ProfilePhotoState,
  formData: FormData,
): Promise<ProfilePhotoState> {
  void previousState;
  const current = await requireUser();
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0)
    return { error: "Choose a profile photo to upload." };
  if (!extensions[photo.type])
    return { error: "Use a JPEG, PNG, or WebP image." };
  if (photo.size > MAX_PROFILE_PHOTO_SIZE)
    return { error: "Profile photos must be 2 MB or smaller." };
  const bytes = new Uint8Array(await photo.arrayBuffer());
  if (!hasValidImageSignature(photo.type, bytes))
    return { error: "The selected file is not a valid image." };

  try {
    const safeUserId = current.id.replace(/[^a-zA-Z0-9_-]/g, "-");
    const blob = await put(
      `avatars/${safeUserId}/${crypto.randomUUID()}.${extensions[photo.type]}`,
      photo,
      {
        access: "public",
        contentType: photo.type,
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      },
    );
    const db = getDb();
    await db
      .update(users)
      .set({ image: blob.url, updatedAt: new Date() })
      .where(eq(users.id, current.id));
    await db.insert(auditLogs).values({
      actorId: current.id,
      action: "profile.photo-updated",
      targetType: "user",
      targetId: current.id,
    });
    revalidatePath("/", "layout");
    revalidatePath("/settings/profile");
    return { success: "Profile photo updated." };
  } catch {
    return {
      error:
        "The photo could not be uploaded. Check that profile storage is configured.",
    };
  }
}
