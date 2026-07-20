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
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const list = invites.map((inv: any) => ({
      id: inv.id,
      senderName: inv.sender.name,
      senderAvatar: inv.sender.profile?.avatarUrl,
      recipientName: inv.receiver.name,
      recipientAvatar: inv.receiver.profile?.avatarUrl,
      activityEmoji: inv.activityEmoji,
      activityName: inv.activityName,
      timeLabel: inv.timeLabel,
      status: inv.status.toLowerCase(), // "pending", "accepted", "rejected"
      type: inv.senderId === userId ? "sent" : "received",
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
    const { receiverId, activityName, activityEmoji, timeLabel } = body;

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

    const invite = await prisma.invite.create({
      data: {
        senderId,
        receiverId,
        activityName,
        activityEmoji,
        timeLabel,
        status: "PENDING",
      },
      include: {
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });

    return success({
      id: invite.id,
      senderName: invite.sender.name,
      senderAvatar: invite.sender.profile?.avatarUrl,
      recipientName: invite.receiver.name,
      recipientAvatar: invite.receiver.profile?.avatarUrl,
      activityEmoji: invite.activityEmoji,
      activityName: invite.activityName,
      timeLabel: invite.timeLabel,
      status: "pending",
      type: "sent",
    }, 201);
  } catch (err) {
    console.error("Create invite error:", err);
    return error("Failed to send invite", 500);
  }
}
