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
  imageUrl?: string;
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
    const fileName = `${crypto.randomUUID()}.${extensions[photo.type]}`;
    let imageUrl: string;
    if (
      process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN)
    ) {
      const blob = await put(`avatars/${safeUserId}/${fileName}`, photo, {
        access: "public",
        contentType: photo.type,
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      });
      imageUrl = blob.url;
    } else if (process.env.NODE_ENV !== "production") {
      const [{ mkdir, writeFile }, path] = await Promise.all([
        import("node:fs/promises"),
        import("node:path"),
      ]);
      const relativeDirectory = path.join("uploads", "avatars", safeUserId);
      const directory = path.join(process.cwd(), "public", relativeDirectory);
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, fileName), bytes);
      imageUrl = `/${relativeDirectory.split(path.sep).join("/")}/${fileName}`;
    } else {
      return {
        error:
          "Profile photo storage is not configured. Add BLOB_READ_WRITE_TOKEN to the deployment environment.",
      };
    }
    const db = getDb();
    await db
      .update(users)
      .set({ image: imageUrl, updatedAt: new Date() })
      .where(eq(users.id, current.id));
    await db.insert(auditLogs).values({
      actorId: current.id,
      action: "profile.photo-updated",
      targetType: "user",
      targetId: current.id,
    });
    revalidatePath("/", "layout");
    revalidatePath("/settings/profile");
    return { success: "Profile photo uploaded successfully.", imageUrl };
  } catch (error) {
    console.error("Profile photo upload failed", error);
    const configuredToken = process.env.BLOB_READ_WRITE_TOKEN;
    const detail =
      error instanceof Error && error.message
        ? configuredToken
          ? error.message
              .replaceAll(configuredToken, "[redacted]")
              .slice(0, 240)
          : error.message.slice(0, 240)
        : "Unknown storage error";
    return {
      error: `Upload failed: ${detail}`,
    };
  }
}
