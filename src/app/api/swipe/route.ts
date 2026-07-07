import { success, error } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { pairUserIds } from "@/lib/match-utils";

export async function POST(request: Request) {
  const body = await request.json();
  const { senderId, receiverId, action = "PASS" } = body;

  if (!senderId || !receiverId || !action) {
    return error("senderId, receiverId and action are required");
  }

  if (senderId === receiverId) return error("Cannot swipe on yourself");

  try {
    const swipe = await prisma.swipe.upsert({
      where: { senderId_receiverId: { senderId, receiverId } },
      update: { action },
      create: { senderId, receiverId, action },
    });

    let isMatch = false;
    let match = null;

    if (action === "LIKE" || action === "SUPER_LIKE") {
      const reciprocal = await prisma.swipe.findFirst({
        where: {
          senderId: receiverId,
          receiverId: senderId,
          action: { in: ["LIKE", "SUPER_LIKE"] },
        },
      });

      if (reciprocal) {
        isMatch = true;
        const [user1Id, user2Id] = pairUserIds(senderId, receiverId);
        match = await prisma.match.upsert({
          where: { user1Id_user2Id: { user1Id, user2Id } },
          update: {},
          create: { user1Id, user2Id },
        });
      }
    }

    return success({ swipe, isMatch, match });
  } catch {
    const isMatch = (action === "LIKE" || action === "SUPER_LIKE") && Math.random() > 0.55;
    return success({ isMatch, demo: true });
  }
}
