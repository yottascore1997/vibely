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

      if (action === "SUPER_LIKE") {
        try {
          const sender = await prisma.user.findUnique({
            where: { id: senderId },
            select: { name: true },
          });
          const first = sender?.name?.split(" ")[0] || "Someone";
          await prisma.notification.create({
            data: {
              userId: receiverId,
              title: "Super Like ⭐",
              message: `${first} super liked you — they really want to hang!`,
              type: "SUPER_LIKE",
            },
          });
        } catch (notifErr) {
          console.warn("SUPER_LIKE notification failed:", notifErr);
        }
      }
    }

    return success({ swipe, isMatch, match });
  } catch (err) {
    console.error("Swipe error:", err);
    return error("Failed to process swipe", 500);
  }
}

/** Undo last swipe (rewind). Removes swipe; drops match only if both sides had liked. */
export async function DELETE(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const senderId = auth.userId;

  try {
    const body = await request.json().catch(() => ({}));
    const receiverId = body?.receiverId as string | undefined;
    if (!receiverId) return error("receiverId is required");

    const existing = await prisma.swipe.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } },
    });
    if (!existing) return error("No swipe to undo", 404);

    const wasLike =
      existing.action === "LIKE" || existing.action === "SUPER_LIKE";

    await prisma.swipe.delete({
      where: { senderId_receiverId: { senderId, receiverId } },
    });

    let matchRemoved = false;
    if (wasLike) {
      const [user1Id, user2Id] = pairUserIds(senderId, receiverId);
      const match = await prisma.match.findUnique({
        where: { user1Id_user2Id: { user1Id, user2Id } },
      });
      if (match) {
        // Only remove match if the other person still has a like — otherwise keep
        // (rewinding our like should break the match)
        await prisma.match.delete({ where: { id: match.id } });
        matchRemoved = true;
      }
    }

    return success({ undone: true, matchRemoved, action: existing.action });
  } catch (err) {
    console.error("Swipe undo error:", err);
    return error("Failed to undo swipe", 500);
  }
}
