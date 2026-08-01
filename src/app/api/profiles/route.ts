import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estimateDistanceKm } from "@/lib/match-utils";

function computeVibeMatch(opts: {
  myInterests: string[];
  theirInterests: string[];
  distance: number;
  isVerified: boolean;
  freeNow: boolean;
}): number {
  const mine = new Set(opts.myInterests.map((i) => i.toLowerCase().trim()).filter(Boolean));
  const theirs = opts.theirInterests.map((i) => i.toLowerCase().trim()).filter(Boolean);
  const shared = theirs.filter((i) => mine.has(i)).length;

  let score: number;
  if (mine.size === 0 && theirs.length === 0) {
    // No interests — soft distance-only score (not marketed as deep compatibility)
    const d = opts.distance ?? 25;
    score = d <= 2 ? 78 : d <= 5 ? 74 : d <= 10 ? 70 : d <= 20 ? 66 : 62;
  } else if (mine.size === 0) {
    score = 60 + Math.min(20, theirs.length * 2);
  } else {
    const overlapRatio = shared / Math.max(Math.min(mine.size, 6), 1);
    score = 52 + Math.round(Math.min(1, overlapRatio) * 38);
    score += Math.min(8, shared * 2);
  }

  if (opts.distance <= 5) score += 4;
  else if (opts.distance <= 15) score += 2;
  if (opts.isVerified) score += 3;
  if (opts.freeNow) score += 2;

  return Math.min(99, Math.max(48, score));
}

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
    lastSeenAt: Date | null;
    avatarUrl: string | null;
    user: {
      id: string;
      name: string;
      socialStatus?: {
        energy: string;
        freeNow: boolean;
        activityName: string | null;
        timeLabel: string | null;
      } | null;
    };
    photos: { url: string }[];
    interests: { interest: { name: string; color: string | null; icon: string | null } }[];
  },
  myCity?: string | null,
  myLat?: number | null,
  myLng?: number | null,
  mode?: string,
  myInterestNames: string[] = []
) {
  const distance = estimateDistanceKm(myCity, p.city, myLat, myLng, p.latitude, p.longitude);
  const theirInterestNames = p.interests.map(
    (ui: { interest: { name: string } }) => ui.interest.name
  );
  const freeNow = !!p.user.socialStatus?.freeNow;
  const sharedInterests = theirInterestNames.filter((n) =>
    myInterestNames.some((m) => m.toLowerCase() === n.toLowerCase())
  );

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
    lastSeenAt: p.lastSeenAt ? new Date(p.lastSeenAt).toISOString() : null,
    vibeMatch: computeVibeMatch({
      myInterests: myInterestNames,
      theirInterests: theirInterestNames,
      distance: distance ?? 25,
      isVerified: p.isVerified,
      freeNow,
    }),
    sharedInterestCount: sharedInterests.length,
    avatarUrl: p.avatarUrl || p.photos[0]?.url,
    photos: p.photos.map((ph: { url: string }) => ph.url),
    interests: p.interests.map((ui: {
      interest: { name: string; color: string | null; icon: string | null };
    }) => ({
      name: ui.interest.name,
      color: ui.interest.color,
      icon: ui.interest.icon,
    })),
    mode,
    socialStatus: p.user.socialStatus
      ? {
          energy: p.user.socialStatus.energy,
          freeNow: p.user.socialStatus.freeNow,
          activityName: p.user.socialStatus.activityName,
          timeLabel: p.user.socialStatus.timeLabel,
        }
      : null,
    energy: p.user.socialStatus?.energy || "MAYBE",
    freeNow,
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
      interests: { interest: { name: string } }[];
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
          interests: { include: { interest: { select: { name: true } } } },
        },
      });
    }

    const myInterestNames =
      myProfile?.interests.map((i) => i.interest.name) || [];
    const myCity = city || myProfile?.city;
    const myLat = myProfile?.latitude;
    const myLng = myProfile?.longitude;
    const hasMyGps =
      myLat != null && myLng != null && Number.isFinite(myLat) && Number.isFinite(myLng);
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

    let excludeIds: string[] = userId ? [userId] : [];
    if (!nearbyMode && userId) {
      const swipedIds = (
        await prisma.swipe.findMany({
          where: { senderId: userId },
          select: { receiverId: true },
        })
      ).map((s: { receiverId: string }) => s.receiverId);

      const matchedIds = (
        await prisma.match.findMany({
          where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
          select: { user1Id: true, user2Id: true },
        })
      ).map((m: { user1Id: string; user2Id: string }) =>
        m.user1Id === userId ? m.user2Id : m.user1Id
      );

      excludeIds = [...new Set([userId, ...swipedIds, ...matchedIds])];
    }

    // lookingFor is JSON-stringified array — do NOT include null (was dumping unset into both modes)
    const lookingForClause =
      mode === "friends"
        ? {
            OR: [
              { lookingFor: { contains: "FRIEND" } },
              { lookingFor: { contains: "NETWORK" } },
            ],
          }
        : mode === "dating"
          ? {
              OR: [
                { lookingFor: { contains: "LONG_TERM" } },
                { lookingFor: { contains: "CASUAL" } },
                { lookingFor: { contains: "MARRIAGE" } },
              ],
            }
          : null;

    const ageClause = {
      OR: [{ age: null }, { age: { gte: minAge, lte: maxAge } }],
    };

    const geoFilters: object[] =
      hasMyGps && maxDistance > 0
        ? (() => {
            const latDelta = maxDistance / 111;
            const cosLat = Math.cos((myLat! * Math.PI) / 180);
            const lngDelta =
              maxDistance / (111 * (Math.abs(cosLat) < 0.01 ? 0.01 : Math.abs(cosLat)));
            return [
              { latitude: { gte: myLat! - latDelta, lte: myLat! + latDelta } },
              { longitude: { gte: myLng! - lngDelta, lte: myLng! + lngDelta } },
            ];
          })()
        : [{ latitude: { not: null } }, { longitude: { not: null } }];

    const andClause: object[] = [
      ...geoFilters,
      ageClause,
      ...(lookingForClause && !nearbyMode ? [lookingForClause] : []),
    ];

    const baseWhere = {
      userId: { notIn: excludeIds },
      ...(!hasMyGps && myCity && !nearbyMode ? { city: myCity } : {}),
      ...(!nearbyMode ? genderFilter : {}),
      AND: andClause,
    };

    const profiles = await prisma.profile.findMany({
      where: baseWhere,
      take: Math.max(limit * 5, 80),
      include: {
        user: { select: { id: true, name: true, socialStatus: true } },
        photos: { orderBy: { order: "asc" } },
        interests: { include: { interest: true } },
      },
    });

    type ProfileRow = Parameters<typeof formatProfile>[0];

    let formatted = profiles
      .map((p: ProfileRow) =>
        formatProfile(p, myCity, myLat, myLng, mode, myInterestNames)
      )
      .filter((p: { distance: number }) => p.distance <= maxDistance)
      .sort(
        (a: { distance: number; freeNow?: boolean }, b: { distance: number; freeNow?: boolean }) => {
          // Free-now people float slightly up, then by distance
          if (!!a.freeNow !== !!b.freeNow) return a.freeNow ? -1 : 1;
          return a.distance - b.distance;
        }
      )
      .slice(0, limit);

    if (formatted.length === 0 && hasMyGps) {
      const nearby = await prisma.profile.findMany({
        where: {
          userId: { notIn: excludeIds },
          latitude: { not: null },
          longitude: { not: null },
          ...(!nearbyMode ? genderFilter : {}),
          AND: [ageClause, ...(lookingForClause && !nearbyMode ? [lookingForClause] : [])],
        },
        take: Math.max(limit * 4, 60),
        include: {
          user: { select: { id: true, name: true, socialStatus: true } },
          photos: { orderBy: { order: "asc" } },
          interests: { include: { interest: true } },
        },
      });
      formatted = nearby
        .map((p: ProfileRow) =>
          formatProfile(p, myCity, myLat, myLng, mode, myInterestNames)
        )
        .filter((p: { distance: number }) => p.distance <= maxDistance)
        .sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance)
        .slice(0, limit);
    }

    // If mode filter is too strict (many profiles have unset lookingFor), soften once
    if (formatted.length === 0 && hasMyGps && lookingForClause && !nearbyMode) {
      const soft = await prisma.profile.findMany({
        where: {
          userId: { notIn: excludeIds },
          latitude: { not: null },
          longitude: { not: null },
          ...genderFilter,
          AND: [ageClause],
        },
        take: Math.max(limit * 4, 60),
        include: {
          user: { select: { id: true, name: true, socialStatus: true } },
          photos: { orderBy: { order: "asc" } },
          interests: { include: { interest: true } },
        },
      });
      formatted = soft
        .map((p: ProfileRow) =>
          formatProfile(p, myCity, myLat, myLng, mode, myInterestNames)
        )
        .filter((p: { distance: number }) => p.distance <= maxDistance)
        .sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance)
        .slice(0, limit);
    }

    return success(formatted);
  } catch (err) {
    console.error("Fetch profiles error:", err);
    return error("Failed to fetch profiles", 500);
  }
}
