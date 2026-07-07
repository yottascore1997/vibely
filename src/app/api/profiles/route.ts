import { success } from "@/lib/api-response";
import { mockProfiles } from "@/lib/mock-data";
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
    vibeMatch: Math.floor(Math.random() * 15) + 82,
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "dating";
  const userId = searchParams.get("userId");
  const city = searchParams.get("city");
  const limit = Number(searchParams.get("limit") || 20);

  try {
    let myProfile: {
      city: string | null;
      latitude: number | null;
      longitude: number | null;
      maxDistance: number | null;
    } | null = null;

    if (userId) {
      myProfile = await prisma.profile.findUnique({
        where: { userId },
        select: { city: true, latitude: true, longitude: true, maxDistance: true },
      });
    }

    const myCity = city || myProfile?.city;
    const maxDistance = myProfile?.maxDistance ?? 25;

    const swipedIds = userId
      ? (
          await prisma.swipe.findMany({
            where: { senderId: userId },
            select: { receiverId: true },
          })
        ).map((s) => s.receiverId)
      : [];

    const matchedIds = userId
      ? (
          await prisma.match.findMany({
            where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
            select: { user1Id: true, user2Id: true },
          })
        ).map((m) => (m.user1Id === userId ? m.user2Id : m.user1Id))
      : [];

    const excludeIds = [...new Set([...(userId ? [userId] : []), ...swipedIds, ...matchedIds])];

    const profiles = await prisma.profile.findMany({
      where: {
        userId: { notIn: excludeIds },
        ...(myCity ? { city: myCity } : {}),
      },
      take: limit * 2,
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
        where: { userId: { notIn: excludeIds } },
        take: limit,
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
  } catch {
    // fall through to mock
  }

  const myCity = city || "Nagpur";
  const filtered = mockProfiles
    .filter((p) => !userId || p.id !== userId)
    .map((p) => ({
      ...p,
      distance: estimateDistanceKm(myCity, p.city),
      mode,
    }))
    .filter((p) => p.city?.toLowerCase() === myCity.toLowerCase() || p.distance <= 25)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return success(filtered.length > 0 ? filtered : mockProfiles.slice(0, limit).map((p) => ({ ...p, mode })));
}
