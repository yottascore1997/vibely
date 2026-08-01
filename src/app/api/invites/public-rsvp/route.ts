import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emitChatEvent } from "@/lib/chat-emit";

export const dynamic = "force-dynamic";

function guestEmailFrom(phone: string | null | undefined, inviteCode: string) {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length >= 8) return `wa_${digits}@hangora.guest`;
  return `wa_${inviteCode.toLowerCase()}@hangora.guest`;
}

async function resolveHangoutId(invite: {
  id: string;
  hangoutId: string | null;
  senderId: string;
  activityName: string;
}): Promise<string | null> {
  if (invite.hangoutId) {
    const linked = await prisma.hangout.findUnique({
      where: { id: invite.hangoutId },
      select: { id: true, status: true },
    });
    if (linked && linked.status !== "CANCELLED") return linked.id;
  }

  // Prefer recent plan whose title mentions the activity
  const byTitle = await prisma.hangout.findFirst({
    where: {
      creatorId: invite.senderId,
      status: { in: ["OPEN", "FULL"] },
      title: { contains: invite.activityName },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (byTitle) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { hangoutId: byTitle.id },
    });
    return byTitle.id;
  }

  // Last resort: newest open plan by this host
  const latest = await prisma.hangout.findFirst({
    where: {
      creatorId: invite.senderId,
      status: { in: ["OPEN", "FULL"] },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (latest) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { hangoutId: latest.id },
    });
    return latest.id;
  }

  return null;
}

async function ensureWhatsAppGuestOnHangout(opts: {
  hangoutId: string;
  inviteId: string;
  inviteCode: string;
  senderId: string;
  guestName: string;
  guestPhone: string | null;
}): Promise<{ guestUserId: string; alreadyMember: boolean }> {
  const { hangoutId, inviteId, inviteCode, senderId, guestName, guestPhone } = opts;
  const email = guestEmailFrom(guestPhone, inviteCode);

  let guest = await prisma.user.findUnique({ where: { email } });
  if (!guest) {
    const passwordHash = await hashPassword(
      `guest_${inviteCode}_${Date.now()}_${Math.random()}`
    );
    try {
      guest = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: guestName,
          phone: guestPhone,
          profile: {
            create: {
              firstName: guestName.split(" ")[0] || "Guest",
              bio: "Joined via WhatsApp invite",
            },
          },
        },
      });
    } catch (profileErr) {
      console.warn("Guest create with profile failed, retrying bare user:", profileErr);
      guest = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: guestName,
          phone: guestPhone,
        },
      });
    }
  } else {
    await prisma.user.update({
      where: { id: guest.id },
      data: {
        name: guestName || guest.name,
        phone: guestPhone || guest.phone,
      },
    });
  }

  await prisma.invite.update({
    where: { id: inviteId },
    data: { receiverId: guest.id, hangoutId },
  });

  const already = await prisma.participant.findUnique({
    where: { hangoutId_userId: { hangoutId, userId: guest.id } },
  });

  let alreadyMember = false;
  if (!already) {
    await prisma.participant.create({
      data: {
        hangoutId,
        userId: guest.id,
        status: "ACCEPTED",
      },
    });
  } else {
    alreadyMember = already.status === "ACCEPTED";
    if (already.status !== "ACCEPTED") {
      await prisma.participant.update({
        where: { id: already.id },
        data: { status: "ACCEPTED", rejectRemark: null },
      });
      alreadyMember = false;
    }
  }

  // Announce only on first successful join
  if (!alreadyMember) {
    try {
      const chatContent = `👋 ${guestName} is coming via WhatsApp — added to the group & VibeSplit.`;
      const groupMsg = await prisma.groupMessage.create({
        data: {
          hangoutId,
          senderId,
          content: chatContent,
        },
        include: {
          sender: {
            select: {
              name: true,
              profile: { select: { avatarUrl: true } },
            },
          },
        },
      });
      await emitChatEvent("new_message", hangoutId, {
        id: groupMsg.id,
        text: groupMsg.content,
        sentAt: groupMsg.createdAt.toISOString(),
        senderId: groupMsg.senderId,
        senderName: groupMsg.sender.name,
        senderAvatar: groupMsg.sender.profile?.avatarUrl || null,
        matchId: hangoutId,
        isGroup: true,
        isRead: false,
      });
    } catch (chatErr) {
      console.warn("Could not post guest join chat:", chatErr);
    }
  }

  return { guestUserId: guest.id, alreadyMember };
}

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

    const dbStatus = String(status).toUpperCase();
    if (dbStatus !== "ACCEPTED" && dbStatus !== "REJECTED") {
      return error("Status must be accepted or rejected", 400);
    }

    const existing = await prisma.invite.findUnique({
      where: { inviteCode },
    });

    if (!existing) {
      return error("Invite not found", 404);
    }

    const guestName = (name || existing.inviteeName || "WhatsApp Guest").trim();
    const guestPhone = (phone || existing.inviteePhone || null)?.toString().trim() || null;

    const updated = await prisma.invite.update({
      where: { inviteCode },
      data: {
        status: dbStatus,
        inviteeName: guestName,
        inviteePhone: guestPhone,
        isWebRsvp: true,
      },
    });

    let guestUserId: string | null = null;
    let hangoutId: string | null = null;
    let addedToPlan = false;
    let alreadyMember = false;
    let failReason: string | null = null;

    if (dbStatus === "ACCEPTED") {
      try {
        hangoutId = await resolveHangoutId(updated);
        if (!hangoutId) {
          failReason =
            "No open plan found for this host. Create the plan first, then share WhatsApp invite from Create Plan.";
          console.error("[public-rsvp]", failReason, {
            inviteId: updated.id,
            senderId: updated.senderId,
          });
        } else {
          const result = await ensureWhatsAppGuestOnHangout({
            hangoutId,
            inviteId: updated.id,
            inviteCode,
            senderId: updated.senderId,
            guestName,
            guestPhone,
          });
          guestUserId = result.guestUserId;
          alreadyMember = result.alreadyMember;
          addedToPlan = true;
        }
      } catch (guestErr: any) {
        failReason = guestErr?.message || "Failed to add guest to plan";
        console.error("[public-rsvp] guest join failed:", guestErr);
      }
    }

    try {
      await prisma.notification.create({
        data: {
          userId: updated.senderId,
          title:
            dbStatus === "ACCEPTED"
              ? addedToPlan
                ? alreadyMember
                  ? "Guest already on your plan"
                  : "Going! 🎉 Added to your plan"
                : "Going! 🎉 (plan link missing)"
              : "Can't make it 😢",
          message:
            dbStatus === "ACCEPTED"
              ? addedToPlan
                ? `${guestName} said I'm coming for ${updated.activityName} ${updated.activityEmoji} — on your group & VibeSplit.`
                : `${guestName} said I'm coming, but no open plan was linked. Open Create Plan → WhatsApp invite again.`
              : `${guestName} responded to your ${updated.activityName} ${updated.activityEmoji} invite.`,
          type: "INVITE_RESPONSE",
        },
      });
    } catch (notifErr) {
      console.warn("Could not create notification:", notifErr);
    }

    return success({
      id: updated.id,
      inviteCode: updated.inviteCode,
      status: dbStatus.toLowerCase(),
      inviteeName: guestName,
      isWebRsvp: true,
      hangoutId,
      guestUserId,
      addedToPlan,
      alreadyMember,
      failReason,
    });
  } catch (err) {
    console.error("Public RSVP error:", err);
    return error("Failed to submit RSVP", 500);
  }
}
