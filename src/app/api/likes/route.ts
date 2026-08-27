import { NextRequest } from "next/server";
import { success } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estimateDistanceKm } from "@/lib/match-utils";

export async function GET(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const me = await prisma.profile.findUnique({
      where: { userId },
      select: { city: true, latitude: true, longitude: true },
    });

    const [incoming, mySwipes, blocks] = await Promise.all([
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
      prisma.block.findMany({
        where: {
          OR: [{ blockerId: userId }, { blockedId: userId }],
        },
        select: { blockerId: true, blockedId: true },
      }),
    ]);

    type IncomingLike = {
      senderId: string;
      action: string;
      createdAt: Date;
      sender: {
        name: string;
        profile: {
          age: number | null;
          bio: string | null;
          city: string | null;
          latitude: number | null;
          longitude: number | null;
          isVerified: boolean;
          isOnline: boolean;
          isPaused?: boolean;
          avatarUrl: string | null;
          photos: { url: string }[];
        } | null;
      };
    };

    const swipedSet = new Set(mySwipes.map((s: { receiverId: string }) => s.receiverId));
    const blockedSet = new Set(
      blocks.map((b) => (b.blockerId === userId ? b.blockedId : b.blockerId))
    );

    const list = incoming
      .filter(
        (s: IncomingLike) =>
          !swipedSet.has(s.senderId) &&
          !blockedSet.has(s.senderId) &&
          s.sender.profile &&
          !s.sender.profile.isPaused
      )
      .map((s: IncomingLike) => {
        const p = s.sender.profile!;
        return {
          id: s.senderId,
          name: s.sender.name,
          age: p.age,
          bio: p.bio,
          city: p.city,
          distance: estimateDistanceKm(
            me?.city,
            p.city,
            me?.latitude,
            me?.longitude,
            p.latitude,
            p.longitude
          ),
          isVerified: p.isVerified,
          isOnline: p.isOnline,
          avatarUrl: p.avatarUrl || p.photos[0]?.url,
          action: s.action,
          isSuperLike: s.action === "SUPER_LIKE",
          likedAt: s.createdAt.toISOString(),
        };
      })
      // Super likes float to the top
      .sort((a: { isSuperLike?: boolean; likedAt: string }, b: { isSuperLike?: boolean; likedAt: string }) => {
        if (!!a.isSuperLike !== !!b.isSuperLike) return a.isSuperLike ? -1 : 1;
        return new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime();
      });

    return success({ count: list.length, likes: list });
  } catch {
    return success({ count: 0, likes: [] });
  }
}
