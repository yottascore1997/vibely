import { success, error } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { estimateDistanceKm } from "@/lib/match-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) return error("userId is required");

  try {
    const me = await prisma.profile.findUnique({ where: { userId }, select: { city: true } });

    const [incoming, mySwipes] = await Promise.all([
      prisma.swipe.findMany({
        where: {
          receiverId: userId,
          action: { in: ["LIKE", "SUPER_LIKE"] },
        },
        include: {
          sender: {
            include: {
              profile: {
                include: {
                  photos: { orderBy: { order: "asc" }, take: 1 },
                  interests: { include: { interest: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.swipe.findMany({
        where: { senderId: userId },
        select: { receiverId: true },
      }),
    ]);

    const swipedSet = new Set(mySwipes.map((s) => s.receiverId));

    const list = incoming
      .filter((s) => !swipedSet.has(s.senderId) && s.sender.profile)
      .map((s) => {
        const p = s.sender.profile!;
        return {
          id: s.senderId,
          name: s.sender.name,
          age: p.age,
          bio: p.bio,
          city: p.city,
          distance: estimateDistanceKm(me?.city, p.city),
          isVerified: p.isVerified,
          isOnline: p.isOnline,
          avatarUrl: p.avatarUrl || p.photos[0]?.url,
          action: s.action,
          likedAt: s.createdAt.toISOString(),
        };
      });

    return success({ count: list.length, likes: list });
  } catch {
    return success({ count: 0, likes: [] });
  }
}
