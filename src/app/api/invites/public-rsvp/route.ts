import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const { inviteCode, name, phone, status } = body;

    if (!inviteCode || !status) {
      return error("inviteCode and status are required", 400);
    }

    const dbStatus = status.toUpperCase();
    if (dbStatus !== "ACCEPTED" && dbStatus !== "REJECTED") {
      return error("Status must be accepted or rejected", 400);
    }

    const existing = await prisma.invite.findUnique({
      where: { inviteCode },
    });

    if (!existing) {
      return error("Invite not found", 404);
    }

    const updated = await prisma.invite.update({
      where: { inviteCode },
      data: {
        status: dbStatus,
        inviteeName: name || existing.inviteeName || "Guest",
        inviteePhone: phone || existing.inviteePhone || null,
        isWebRsvp: true,
      },
      include: {
        sender: { include: { profile: true } },
      },
    });

    // Also notify sender if notification model exists
    try {
      await prisma.notification.create({
        data: {
          userId: updated.senderId,
          title: `RSVP Response: ${dbStatus === "ACCEPTED" ? "Going! 🎉" : "Can't make it 😢"}`,
          message: `${updated.inviteeName || "Someone"} responded to your ${updated.activityName} ${updated.activityEmoji} invite!`,
          type: "INVITE_RESPONSE",
        },
      });
    } catch (notifErr) {
      console.warn("Could not create notification:", notifErr);
    }

    return success({
      id: updated.id,
      inviteCode: updated.inviteCode,
      status: updated.status.toLowerCase(),
      inviteeName: updated.inviteeName,
      isWebRsvp: true,
    });
  } catch (err) {
    console.error("Public RSVP error:", err);
    return error("Failed to submit RSVP", 500);
  }
}
