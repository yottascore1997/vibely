import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return unauthorized();

  try {
    const body = await request.json();
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const city = typeof body.city === "string" && body.city.trim() ? body.city.trim() : undefined;

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return error("Valid latitude and longitude are required");
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return error("Coordinates out of range");
    }

    const data = {
      latitude,
      longitude,
      ...(city ? { city } : {}),
    };

    const profile = await prisma.profile.upsert({
      where: { userId: authUser.userId },
      update: data,
      create: { userId: authUser.userId, ...data },
      select: {
        latitude: true,
        longitude: true,
        city: true,
        maxDistance: true,
      },
    });

    return success({ profile, message: "Location updated" });
  } catch (err) {
    console.error("Location update error:", err);
    return error(err instanceof Error ? err.message : "Failed to update location", 500);
  }
}
