import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateChatGate } from "@/lib/match-chat-rules";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const resolvedParams = "then" in params ? await params : params;
    const otherUserId = resolvedParams.id;

    if (!otherUserId) {
      return error("matchId parameter is required");
    }

    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: userId },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!match) {
      return success({
        messages: [],
        chatGate: {
          unlocked: false,
          canSend: false,
          waitingForOther: false,
          mustSendOpener: false,
          expired: true,
          expiresAt: null,
          reason: "Match not found or already expired",
        },
      });
    }

    const gate = evaluateChatGate({
      userId,
      matchedAt: match.matchedAt,
      messages: match.messages.map((m) => ({
        senderId: m.senderId,
        createdAt: m.createdAt,
      })),
    });

    if (gate.expired) {
      await prisma.match.delete({ where: { id: match.id } });
      return success({
        messages: [],
        chatGate: gate,
        removed: true,
      });
    }

    const formatted = match.messages.map((m) => ({
      id: m.id,
      text: m.content,
      sentAt: m.createdAt.toISOString(),
      senderId: m.senderId,
    }));

    return success({
      messages: formatted,
      chatGate: gate,
    });
  } catch (err: unknown) {
    console.error("GET messages error:", err);
    return error("Failed to load messages");
  }
}
