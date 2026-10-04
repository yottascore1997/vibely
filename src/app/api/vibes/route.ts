import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emitChatEvent } from "@/lib/chat-emit";

export async function GET(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const vibes = await prisma.vibe.findMany({
      where: { receiverId: userId },
      include: {
        sender: { include: { profile: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return success(vibes);
  } catch (err) {
    console.error("Fetch vibes error:", err);
    return error("Failed to fetch vibes", 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const senderId = auth.userId;

  try {
    const body = await request.json();
    const { receiverId, vibeType, message } = body;

    if (!receiverId || !vibeType) {
      return error("receiverId and vibeType are required");
    }

    const [sender, vibe] = await Promise.all([
      prisma.user.findUnique({
        where: { id: senderId },
        include: { profile: true },
      }),
      prisma.vibe.create({
        data: { senderId, receiverId, vibeType, message },
      }),
    ]);

    const senderName = sender?.name || "Someone";
    const senderAvatar = sender?.profile?.avatarUrl;

    try {
      await prisma.notification.create({
        data: {
          userId: receiverId,
          title: "New Vibe ✨",
          message: `${senderName} sent you a vibe: ${vibeType}`,
          type: "VIBE_RECEIVED",
        },
      });

      await emitChatEvent("notification:new", receiverId, {
        id: `vibe-${vibe.id}`,
        type: "invite",
        titleUser: senderName,
        titleAction: "sent you a vibe",
        titleHighlight: vibeType.replace(/_/g, " "),
        subtitle: "just now",
        user: {
          name: senderName,
          avatar: senderAvatar,
          badgeIcon: "flame",
          badgeColor: "#F59E0B",
        },
        isHighlighted: true,
        highlightColor: "#F59E0B",
        isRead: false,
        buttonText: "Open",
        route: "/hangout",
      });

      if (vibeType.includes("invite") || vibeType.includes("hangout")) {
        await emitChatEvent("hangout:invite", receiverId, {
          id: vibe.id,
          inviteId: vibe.id,
          senderId,
          senderName,
          senderAvatar,
          category: "chai",
          activityName: "Chai",
          activityEmoji: "☕",
          location: "CHAYOS, GALLERIA",
          time: "6 PM TODAY",
          timeLabel: "6 PM TODAY",
        });
      }
    } catch (e) {
      console.warn("[POST /api/vibes] notification/socket warning:", e);
    }

    return success(vibe, 201);
  } catch (err) {
    console.error("Send vibe error:", err);
    return error("Failed to send vibe", 500);
  }
}

