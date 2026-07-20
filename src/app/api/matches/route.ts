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
      avatarUrl: string | null;
      isVerified: boolean;
      isOnline: boolean;
      photos: { url: string }[];
      interests: { interest: { name: string; color: string | null } }[];
    } | null;
  },
  myCity?: string | null,
  matchedAt?: Date
) {
  const p = other.profile;
  return {
    id: other.id,
    name: other.name,
    age: p?.age,
    bio: p?.bio,
    city: p?.city,
    distance: estimateDistanceKm(myCity, p?.city),
    isVerified: p?.isVerified,
    isOnline: p?.isOnline,
    avatarUrl: p?.avatarUrl || p?.photos[0]?.url,
    interests: p?.interests.map((i) => ({ name: i.interest.name, color: i.interest.color || "#8A56FF" })) || [],
    matchedAt: matchedAt?.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    // Drop matches that never got a reply within 24h
    await expireStaleMatches(userId);

    const me = await prisma.profile.findUnique({ where: { userId }, select: { city: true } });

    const matches = await prisma.match.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      orderBy: { matchedAt: "desc" },
    });

    if (matches.length === 0) return success([]);

    const otherIds = matches.map((m) => (m.user1Id === userId ? m.user2Id : m.user1Id));
    const users = await prisma.user.findMany({
      where: { id: { in: otherIds } },
      include: {
        profile: {
          include: {
            photos: { orderBy: { order: "asc" }, take: 1 },
            interests: { include: { interest: true } },
          },
        },
      },
    });

    const byId = new Map(users.map((u) => [u.id, u]));
    const list = matches
      .map((m) => {
        const otherId = m.user1Id === userId ? m.user2Id : m.user1Id;
        const other = byId.get(otherId);
        if (!other?.profile) return null;
        return formatMatch(other, me?.city, m.matchedAt);
      })
      .filter(Boolean);

    return success(list);
  } catch {
    return success([]);
  }
}
