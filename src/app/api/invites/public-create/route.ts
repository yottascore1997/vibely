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
    const {
      activityName,
      activityEmoji,
      timeLabel,
      inviteeName,
      inviteePhone,
      hangoutId,
    } = body;

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

    // Optional: verify hangout belongs to sender
    let linkedHangoutId: string | null = null;
    if (hangoutId && typeof hangoutId === "string") {
      const hangout = await prisma.hangout.findUnique({ where: { id: hangoutId } });
      if (hangout && hangout.creatorId === senderId) {
        linkedHangoutId = hangout.id;
      }
    }

    const code =
      Math.random().toString(36).substring(2, 10) +
      Date.now().toString(36).substring(4);
    const invite = await prisma.invite.create({
      data: {
        inviteCode: code,
        senderId,
        hangoutId: linkedHangoutId,
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

    const publicWeb = (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      "https://www.hangora.app"
    ).replace(/\/+$/, "");

    // Prefer public Hangora domain so WhatsApp links always open the RSVP page
    let inviteUrl = `${publicWeb}/p/${invite.inviteCode}`;
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    if (/hangora\.app/i.test(host) && !/railway|localhost|127\.0\.0\.1/i.test(host)) {
      const protocol =
        host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
      inviteUrl = `${protocol}://${host.split(",")[0].trim()}/p/${invite.inviteCode}`;
    }

    const senderName = sender.profile?.firstName || sender.name || "A friend";
    const first = senderName.split(" ")[0] || "A friend";
    const place = ""; // location optional on this endpoint
    const shareMessage =
      `Hey! 👋\n\n` +
      `✨ *You're invited on Hangora*\n\n` +
      `${activityEmoji} *${activityName} Hangout*\n` +
      `🕐 ${timeLabel}${place}\n\n` +
      `${first} wants you to join this hang.\n\n` +
      `👉 Tap to view details & RSVP:\n${inviteUrl}\n\n` +
      `See you there 💫`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

    return success(
      {
        id: invite.id,
        inviteCode: invite.inviteCode,
        hangoutId: linkedHangoutId,
        inviteUrl,
        whatsappUrl,
        shareMessage,
        senderName,
        activityEmoji: invite.activityEmoji,
        activityName: invite.activityName,
        timeLabel: invite.timeLabel,
        status: "pending",
      },
      201
    );
  } catch (err) {
    console.error("Create public invite error:", err);
    return error("Failed to create public invite", 500);
  }
}
