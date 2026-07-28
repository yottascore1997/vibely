import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const senderId = auth.userId;

  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const { activityName, activityEmoji, timeLabel, inviteeName, inviteePhone } = body;

    if (!activityName || !activityEmoji || !timeLabel) {
      return error("activityName, activityEmoji, and timeLabel are required", 400);
    }

    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      include: { profile: true },
    });

    if (!sender) {
      return error("Sender not found", 404);
    }

    const code = Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(4);
    const invite = await prisma.invite.create({
      data: {
        inviteCode: code,
        senderId,
        activityName,
        activityEmoji,
        timeLabel,
        inviteeName: inviteeName || null,
        inviteePhone: inviteePhone || null,
        status: "PENDING",
      },
      include: {
        sender: { include: { profile: true } },
      },
    });

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") || host.includes("192.168.") ? "http" : "https";
    const inviteUrl = `${protocol}://${host}/p/${invite.inviteCode}`;

    const senderName = sender.profile?.firstName || sender.name || "A friend";
    const shareMessage = `Hey! ${senderName} invited you to go out for ${activityName} ${activityEmoji} on VibeMatch!\n\nTap link to view & RSVP: ${inviteUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

    return success({
      id: invite.id,
      inviteCode: invite.inviteCode,
      inviteUrl,
      whatsappUrl,
      shareMessage,
      senderName,
      activityEmoji: invite.activityEmoji,
      activityName: invite.activityName,
      timeLabel: invite.timeLabel,
      status: "pending",
    }, 201);
  } catch (err) {
    console.error("Create public invite error:", err);
    return error("Failed to create public invite", 500);
  }
}
