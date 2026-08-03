import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function notify(userId: string, title: string, message: string, type: string) {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type },
    });
  } catch {
    /* soft fail */
  }
}

/** Best-effort parse "6 PM · TODAY" / "Today 6 PM" / "Soon" → Date */
function parseInviteTime(timeLabel?: string | null): Date {
  const fallback = new Date(Date.now() + 60 * 60 * 1000);
  if (!timeLabel) return fallback;
  const raw = timeLabel.trim();
  const lower = raw.toLowerCase();

  const now = new Date();
  let dayOffset = 0;
  if (lower.includes("tomorrow")) dayOffset = 1;
  else if (lower.includes("today") || lower.includes("tonight")) dayOffset = 0;

  const m = raw.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (!m) return fallback;

  let hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3].toLowerCase();
  if (ap === "pm" && hour < 12) hour += 12;
  if (ap === "am" && hour === 12) hour = 0;

  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() < now.getTime() - 5 * 60 * 1000) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

export async function POST(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const body = await request.json();
    const {
      inviteId,
      status,
      activityName,
      activityEmoji,
      timeLabel,
    } = body;

    if (!inviteId || !status) {
      return error("inviteId and status are required", 400);
    }

    const action = String(status).toLowerCase();
    if (!["accepted", "rejected", "counter"].includes(action)) {
      return error("Invalid status (accepted | rejected | counter)", 400);
    }

    const existing = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: {
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } },
        hangout: true,
      },
    });

    if (!existing) return error("Invite not found", 404);
    const isParty =
      existing.receiverId === userId || existing.senderId === userId;
    if (!isParty) return error("Forbidden", 403);
    // Accept / counter: only the receiver. Reject: either party (e.g. mid-settle).
    if (action !== "rejected" && existing.receiverId !== userId) {
      return error("Forbidden", 403);
    }

    // Idempotent accept: client may retry after a flaky network response
    if (existing.status === "ACCEPTED" && action === "accepted") {
      return success({
        id: existing.id,
        status: "accepted",
        hangoutId: existing.hangoutId,
        scheduledAt: existing.hangout?.scheduledAt?.toISOString() || null,
        activityName: existing.activityName,
        activityEmoji: existing.activityEmoji,
        timeLabel: existing.timeLabel,
        partnerName: existing.sender.name,
        partnerAvatar: existing.sender.profile?.avatarUrl || null,
      });
    }

    if (existing.status !== "PENDING") {
      return error("Invite already responded", 400);
    }

    /* ── Counter offer ── */
    if (action === "counter") {
      if (!activityName || !activityEmoji) {
        return error("activityName and activityEmoji required for counter", 400);
      }

      const counterTime = timeLabel || existing.timeLabel || "Soon";

      const [updated, counterInvite] = await prisma.$transaction([
        prisma.invite.update({
          where: { id: inviteId },
          data: { status: "COUNTERED" },
        }),
        prisma.invite.create({
          data: {
            senderId: userId,
            receiverId: existing.senderId,
            hangoutId: existing.hangoutId || undefined,
            activityName,
            activityEmoji,
            timeLabel: counterTime,
            status: "PENDING",
            isCounter: true,
            parentInviteId: inviteId,
          },
          include: {
            sender: { include: { profile: true, socialStatus: true } },
            receiver: { include: { profile: true, socialStatus: true } },
          },
        }),
      ]);

      await notify(
        existing.senderId,
        "Counter offer 🔄",
        `${existing.receiver?.name || "Someone"} countered ${existing.activityEmoji} ${existing.activityName} with ${activityEmoji} ${activityName}`,
        "INVITE_COUNTER"
      );

      return success({
        id: updated.id,
        status: "countered",
        counterInvite: {
          id: counterInvite.id,
          activityName: counterInvite.activityName,
          activityEmoji: counterInvite.activityEmoji,
          timeLabel: counterInvite.timeLabel,
          status: "pending",
          isCounter: true,
          senderName: counterInvite.sender.name,
          recipientName: counterInvite.receiver?.name || "You",
        },
      });
    }

    /* ── Accept / Reject ── */
    const dbStatus = action === "accepted" ? "ACCEPTED" : "REJECTED";
    let hangoutId: string | null = existing.hangoutId;
    let scheduledAt: string | null = existing.hangout?.scheduledAt?.toISOString() || null;

    // RPS settle / override: allow accepting with a chosen winning activity
    const finalActivityName =
      action === "accepted" && activityName
        ? String(activityName)
        : existing.activityName;
    const finalActivityEmoji =
      action === "accepted" && activityEmoji
        ? String(activityEmoji)
        : existing.activityEmoji;

    if (action === "accepted") {
      if (hangoutId) {
        // Join existing plan — ensure receiver is ACCEPTED participant
        await prisma.participant.upsert({
          where: {
            hangoutId_userId: { hangoutId, userId },
          },
          create: { hangoutId, userId, status: "ACCEPTED" },
          update: { status: "ACCEPTED" },
        });
        const h = await prisma.hangout.findUnique({ where: { id: hangoutId } });
        scheduledAt = h?.scheduledAt?.toISOString() || scheduledAt;
      } else {
        const when = parseInviteTime(existing.timeLabel);
        const title = `${finalActivityEmoji} ${finalActivityName}`;
        const hangout = await prisma.hangout.create({
          data: {
            title,
            description: `Joined via invite · ${existing.timeLabel}`,
            scheduledAt: when,
            maxParticipants: 4,
            creatorId: existing.senderId,
            kind: "HANGOUT",
            visibility: "FRIENDS",
            isPrivate: true,
            status: "OPEN",
            participants: {
              create: [
                { userId: existing.senderId, status: "ACCEPTED" },
                { userId: userId, status: "ACCEPTED" },
              ],
            },
          },
        });
        hangoutId = hangout.id;
        scheduledAt = hangout.scheduledAt.toISOString();
      }
    }

    const invite = await prisma.invite.update({
      where: { id: inviteId },
      data: {
        status: dbStatus,
        ...(hangoutId ? { hangoutId } : {}),
        ...(action === "accepted" && activityName
          ? { activityName: finalActivityName, activityEmoji: finalActivityEmoji }
          : {}),
      },
    });

    if (action === "accepted") {
      await notify(
        existing.senderId,
        "Hang joined! ✨",
        `${existing.receiver?.name || "Someone"} joined your ${finalActivityEmoji} ${finalActivityName}`,
        "INVITE_ACCEPTED"
      );
    } else {
      const otherId =
        userId === existing.senderId
          ? existing.receiverId
          : existing.senderId;
      const actorName =
        userId === existing.senderId
          ? existing.sender.name
          : existing.receiver?.name || "Someone";
      if (otherId) {
        await notify(
          otherId,
          "Invite declined",
          `${actorName} declined ${existing.activityEmoji} ${existing.activityName}`,
          "INVITE_REJECTED"
        );
      }
    }

    return success({
      id: invite.id,
      status: invite.status.toLowerCase(),
      hangoutId,
      scheduledAt,
      activityName: finalActivityName,
      activityEmoji: finalActivityEmoji,
      timeLabel: existing.timeLabel,
      partnerName:
        action === "accepted"
          ? existing.sender.name
          : existing.receiver?.name || null,
      partnerAvatar:
        action === "accepted"
          ? existing.sender.profile?.avatarUrl || null
          : existing.receiver?.profile?.avatarUrl || null,
    });
  } catch (err) {
    console.error("Respond invite error:", err);
    return error("Failed to update invite status", 500);
  }
}
