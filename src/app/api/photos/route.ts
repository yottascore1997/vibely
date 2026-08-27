import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET — my gallery photos */
export async function GET(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: auth.userId },
      select: {
        id: true,
        avatarUrl: true,
        photos: { orderBy: { order: "asc" }, select: { id: true, url: true, order: true } },
      },
    });
    if (!profile) return error("Profile not found", 404);
    return success({
      avatarUrl: profile.avatarUrl,
      photos: profile.photos,
    });
  } catch (err) {
    console.error("Get photos error:", err);
    return error("Failed to load photos", 500);
  }
}

/**
 * POST — set full gallery.
 * body: { photos: string[] }  — URLs in display order (max 6). First becomes avatar.
 */
export async function POST(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const body = await request.json();
    const urls: string[] = Array.isArray(body.photos)
      ? body.photos.map((u: unknown) => String(u || "").trim()).filter(Boolean).slice(0, 6)
      : [];

    if (urls.length === 0) return error("At least one photo is required", 400);

    const profile = await prisma.profile.findUnique({
      where: { userId: auth.userId },
      select: { id: true },
    });
    if (!profile) return error("Profile not found", 404);

    await prisma.$transaction(async (tx) => {
      await tx.photo.deleteMany({ where: { profileId: profile.id } });
      await tx.photo.createMany({
        data: urls.map((url, order) => ({
          profileId: profile.id,
          url,
          order,
        })),
      });
      await tx.profile.update({
        where: { id: profile.id },
        data: { avatarUrl: urls[0] },
      });
    });

    const photos = await prisma.photo.findMany({
      where: { profileId: profile.id },
      orderBy: { order: "asc" },
      select: { id: true, url: true, order: true },
    });

    return success({ photos, avatarUrl: urls[0] });
  } catch (err) {
    console.error("Set photos error:", err);
    return error("Failed to save photos", 500);
  }
}
