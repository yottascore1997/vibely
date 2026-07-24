import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estimateDistanceKm } from "@/lib/match-utils";

function formatProfile(
  p: {
    userId: string;
    age: number | null;
    bio: string | null;
    jobTitle: string | null;
    company: string | null;
    education: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    isVerified: boolean;
    isOnline: boolean;
    avatarUrl: string | null;
    user: { id: string; name: string };
    photos: { url: string }[];
    interests: { interest: { name: string; color: string | null; icon: string | null } }[];
  },
  myCity?: string | null,
  myLat?: number | null,
  myLng?: number | null,
  mode?: string
) {
  const distance = estimateDistanceKm(myCity, p.city, myLat, myLng, p.latitude, p.longitude);
  return {
    id: p.userId,
    name: p.user.name,
    age: p.age,
    bio: p.bio,
    jobTitle: p.jobTitle,
    company: p.company,
    education: p.education,
    city: p.city,
    distance,
    isVerified: p.isVerified,
    isOnline: p.isOnline,
    vibeMatch: (() => {
      // Deterministic score from distance + verification (not random)
      const d = distance ?? 10;
      const base = d <= 2 ? 96 : d <= 5 ? 92 : d <= 10 ? 88 : d <= 20 ? 84 : 80;
      return Math.min(99, base + (p.isVerified ? 2 : 0) + (p.isOnline ? 1 : 0));
    })(),
    avatarUrl: p.avatarUrl || p.photos[0]?.url,
    photos: p.photos.map((ph) => ph.url),
    interests: p.interests.map((ui) => ({
      name: ui.interest.name,
      color: ui.interest.color,
      icon: ui.interest.icon,
    })),
    mode,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "dating";
  const city = searchParams.get("city");
  const limit = Number(searchParams.get("limit") || 20);
  const nearbyMode = searchParams.get("nearby") === "1" || searchParams.get("nearby") === "true";
  const maxKmParam = searchParams.get("maxKm");
  const auth = getAuthUser(request);
  const userId = auth?.userId ?? searchParams.get("userId");

  try {
    let myProfile: {
      city: string | null;
      latitude: number | null;
      longitude: number | null;
      maxDistance: number | null;
      minAge: number | null;
      maxAge: number | null;
      genderPreference: string | null;
    } | null = null;

    if (userId) {
      myProfile = await prisma.profile.findUnique({
        where: { userId },
        select: {
          city: true,
          latitude: true,
          longitude: true,
          maxDistance: true,
          minAge: true,
          maxAge: true,
          genderPreference: true,
        },
      });
    }

    const myCity = city || myProfile?.city;
    const maxDistance = maxKmParam
      ? Number(maxKmParam)
      : nearbyMode
        ? 10
        : myProfile?.maxDistance ?? 25;
    const minAge = myProfile?.minAge ?? 18;
    const maxAge = myProfile?.maxAge ?? 60;
    const genderPref = (myProfile?.genderPreference || "").toUpperCase();
    const genderFilter =
      genderPref === "MEN" || genderPref === "MALE"
        ? { gender: "MALE" as const }
        : genderPref === "WOMEN" || genderPref === "FEMALE"
          ? { gender: "FEMALE" as const }
          : {};

    // Nearby finder shows everyone in radius (except self); discover still hides swiped/matched
    let excludeIds: string[] = userId ? [userId] : [];
    if (!nearbyMode && userId) {
      const swipedIds = (
        await prisma.swipe.findMany({
          where: { senderId: userId },
          select: { receiverId: true },
        })
      ).map((s) => s.receiverId);

      const matchedIds = (
        await prisma.match.findMany({
          where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
          select: { user1Id: true, user2Id: true },
        })
      ).map((m) => (m.user1Id === userId ? m.user2Id : m.user1Id));

      excludeIds = [...new Set([userId, ...swipedIds, ...matchedIds])];
    }

    // lookingFor is JSON-stringified array e.g. ["FRIENDSHIP","CASUAL"]
    const lookingForClause =
      mode === "friends"
        ? {
            OR: [
              { lookingFor: { contains: "FRIEND" } },
              { lookingFor: { contains: "NETWORK" } },
              { lookingFor: null },
            ],
          }
        : mode === "dating"
          ? {
              OR: [
                { lookingFor: { contains: "LONG_TERM" } },
                { lookingFor: { contains: "CASUAL" } },
                { lookingFor: { contains: "MARRIAGE" } },
                { lookingFor: null },
              ],
            }
          : null;

    const ageClause = {
      OR: [{ age: null }, { age: { gte: minAge, lte: maxAge } }],
    };

    const baseWhere = {
      userId: { notIn: excludeIds },
      ...(myCity && !nearbyMode ? { city: myCity } : {}),
      ...(!nearbyMode ? genderFilter : {}),
      AND: lookingForClause && !nearbyMode ? [lookingForClause, ageClause] : [ageClause],
    };

    const profiles = await prisma.profile.findMany({
      where: baseWhere,
      take: Math.max(limit * 3, 60),
      include: {
        user: { select: { id: true, name: true } },
        photos: { orderBy: { order: "asc" } },
        interests: { include: { interest: true } },
      },
    });

    let formatted = profiles
      .map((p) =>
        formatProfile(p, myCity, myProfile?.latitude, myProfile?.longitude, mode)
      )
      .filter((p) => p.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    if (formatted.length === 0 && myCity) {
      const nearby = await prisma.profile.findMany({
        where: {
          userId: { notIn: excludeIds },
          ...(!nearbyMode ? genderFilter : {}),
          AND: [ageClause],
        },
        take: Math.max(limit * 2, 40),
        include: {
          user: { select: { id: true, name: true } },
          photos: { orderBy: { order: "asc" } },
          interests: { include: { interest: true } },
        },
      });
      formatted = nearby
        .map((p) => formatProfile(p, myCity, myProfile?.latitude, myProfile?.longitude, mode))
        .filter((p) => p.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
    }

    if (formatted.length > 0) return success(formatted);
  } catch (err) {
    console.error("Fetch profiles error:", err);
    return error("Failed to fetch profiles", 500);
  }

  return success([]);
}
