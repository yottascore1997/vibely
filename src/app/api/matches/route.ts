import { NextRequest } from "next/server";
import { success } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estimateDistanceKm } from "@/lib/match-utils";
import { expireStaleMatches } from "@/lib/expire-matches";

function formatMatch(
  other: {
    id: string;
    name: string;
    profile: {
      age: number | null;
      bio: string | null;
      city: string | null;
      latitude: number | null;
      longitude: number | null;
      avatarUrl: string | null;
      isVerified: boolean;
      isOnline: boolean;
      lastSeenAt?: Date | null;
      photos: { url: string }[];
      interests: { interest: { name: string; color: string | null } }[];
    } | null;
    socialStatus?: {
      energy: string;
      freeNow: boolean;
      activityName: string | null;
      timeLabel: string | null;
    } | null;
  },
  me?: {
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null,
  matchedAt?: Date
) {
  const p = other.profile;
  return {
    id: other.id,
    name: other.name,
    age: p?.age,
    bio: p?.bio,
    city: p?.city,
    distance: estimateDistanceKm(
      me?.city,
      p?.city,
      me?.latitude,
      me?.longitude,
      p?.latitude,
      p?.longitude
    ),
    isVerified: p?.isVerified,
    isOnline: p?.isOnline,
    lastSeenAt: p?.lastSeenAt ? new Date(p.lastSeenAt).toISOString() : null,
    avatarUrl: p?.avatarUrl || p?.photos[0]?.url,
    interests: p?.interests.map((i: { interest: { name: string; color: string | null } }) => ({
      name: i.interest.name,
      color: i.interest.color || "#8A56FF",
    })) || [],
    matchedAt: matchedAt?.toISOString(),
    socialStatus: other.socialStatus
      ? {
          energy: other.socialStatus.energy,
          freeNow: other.socialStatus.freeNow,
          activityName: other.socialStatus.activityName,
          timeLabel: other.socialStatus.timeLabel,
        }
      : null,
    energy: other.socialStatus?.energy || "MAYBE",
    freeNow: other.socialStatus?.freeNow || false,
  };
}

export async function GET(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    // Drop matches that never got a reply within 24h
    await expireStaleMatches(userId);

    const me = await prisma.profile.findUnique({
      where: { userId },
      select: { city: true, latitude: true, longitude: true },
    });

    const matches = await prisma.match.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      orderBy: { matchedAt: "desc" },
    });

    if (matches.length === 0) return success([]);

    const otherIds = matches.map((m: { user1Id: string; user2Id: string }) =>
      m.user1Id === userId ? m.user2Id : m.user1Id
    );
    const users = await prisma.user.findMany({
      where: { id: { in: otherIds } },
      include: {
        socialStatus: true,
        profile: {
          include: {
            photos: { orderBy: { order: "asc" }, take: 1 },
            interests: { include: { interest: true } },
          },
        },
      },
    });

    type MatchUser = Parameters<typeof formatMatch>[0];

    const byId = new Map<string, MatchUser>(
      users.map((u: MatchUser) => [u.id, u])
    );
    const list = matches
      .map((m: { user1Id: string; user2Id: string; matchedAt: Date }) => {
        const otherId = m.user1Id === userId ? m.user2Id : m.user1Id;
        const other = byId.get(otherId);
        if (!other?.profile) return null;
        return formatMatch(other, me, m.matchedAt);
      })
      .filter(Boolean);

    return success(list);
  } catch {
    return success([]);
  }
}
