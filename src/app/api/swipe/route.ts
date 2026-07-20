import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pairUserIds } from "@/lib/match-utils";

export async function POST(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  const body = await request.json();
  const { receiverId, action = "PASS" } = body;
  const senderId = userId;

  if (!receiverId || !action) {
    return error("receiverId and action are required");
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
  } catch (err) {
    console.error("Swipe error:", err);
    return error("Failed to process swipe", 500);
  }
}
