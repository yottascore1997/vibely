import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const invites = await prisma.invite.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: { include: { profile: true, socialStatus: true } },
        receiver: { include: { profile: true, socialStatus: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const list = invites.map((inv: any) => ({
      id: inv.id,
      senderId: inv.senderId,
      receiverId: inv.receiverId,
      senderName: inv.sender.name,
      senderAvatar: inv.sender.profile?.avatarUrl,
      senderEnergy: inv.sender.socialStatus?.energy || "MAYBE",
      recipientName: inv.receiver?.name || inv.inviteeName || "Guest",
      recipientAvatar: inv.receiver?.profile?.avatarUrl || null,
      recipientEnergy: inv.receiver?.socialStatus?.energy || "MAYBE",
      activityEmoji: inv.activityEmoji,
      activityName: inv.activityName,
      timeLabel: inv.timeLabel,
      status: inv.status.toLowerCase(),
      type: inv.senderId === userId ? "sent" : "received",
      isCounter: !!inv.isCounter,
      parentInviteId: inv.parentInviteId || null,
      hangoutId: inv.hangoutId || null,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt || inv.createdAt,
    }));

    return success(list);
  } catch (err) {
    console.error("Fetch invites error:", err);
    return error("Failed to fetch invites", 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const senderId = auth.userId;

  try {
    const body = await request.json();
    const { receiverId, activityName, activityEmoji, timeLabel, hangoutId } = body;

    if (!receiverId || !activityName || !activityEmoji || !timeLabel) {
      return error("receiverId, activityName, activityEmoji, and timeLabel are required", 400);
    }

    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({
        where: { id: senderId },
        include: { profile: true },
      }),
      prisma.user.findUnique({
        where: { id: receiverId },
        include: { profile: true },
      }),
    ]);

    if (!sender) {
      return error("Sender not found. Please log in again.", 404);
    }

    if (!receiver) {
      return error("Receiver not found", 404);
    }

    if (hangoutId) {
      const hangout = await prisma.hangout.findUnique({ where: { id: hangoutId } });
      if (!hangout) return error("Hangout not found", 404);
      if (hangout.creatorId !== senderId) return error("Forbidden", 403);
    }

    const invite = await prisma.invite.create({
      data: {
        senderId,
        receiverId,
        activityName,
        activityEmoji,
        timeLabel,
        status: "PENDING",
        ...(hangoutId ? { hangoutId } : {}),
      },
      include: {
        sender: { include: { profile: true, socialStatus: true } },
        receiver: { include: { profile: true, socialStatus: true } },
      },
    });

    try {
      await prisma.notification.create({
        data: {
          userId: receiverId,
          title: "Join Hang? ✨",
          message: `${sender.name} invited you for ${activityEmoji} ${activityName} · ${timeLabel}`,
          type: "INVITE_RECEIVED",
        },
      });
    } catch {
      /* soft fail */
    }

    return success({
      id: invite.id,
      senderName: invite.sender.name,
      senderAvatar: invite.sender.profile?.avatarUrl,
      recipientName: invite.receiver?.name || invite.inviteeName || "Guest",
      recipientAvatar: invite.receiver?.profile?.avatarUrl || null,
      activityEmoji: invite.activityEmoji,
      activityName: invite.activityName,
      timeLabel: invite.timeLabel,
      status: "pending",
      type: "sent",
      isCounter: false,
      hangoutId: invite.hangoutId || null,
    }, 201);
  } catch (err) {
    console.error("Create invite error:", err);
    return error("Failed to send invite", 500);
  }
}
