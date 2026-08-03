import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  beats,
  createSettle,
  isValidMove,
  parseSettleData,
  sanitizeSettleForUser,
  type SettleData,
  type SettleMove,
} from "@/lib/invite-settle";

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
  if (d.getTime() < now.getTime() - 5 * 60 * 1000) d.setDate(d.getDate() + 1);
  return d;
}

function otherPlayer(invite: { senderId: string; receiverId: string | null }, userId: string) {
  if (invite.senderId === userId) return invite.receiverId;
  if (invite.receiverId === userId) return invite.senderId;
  return null;
}

async function finalizeHang(
  invite: {
    id: string;
    senderId: string;
    receiverId: string | null;
    hangoutId: string | null;
    timeLabel: string | null;
    hangout?: { scheduledAt: Date } | null;
  },
  activityName: string,
  activityEmoji: string
) {
  let hangoutId: string | null = invite.hangoutId;
  let scheduledAt: string | null = invite.hangout?.scheduledAt?.toISOString() || null;
  const receiverId = invite.receiverId!;

  if (hangoutId) {
    await prisma.participant.upsert({
      where: { hangoutId_userId: { hangoutId, userId: receiverId } },
      create: { hangoutId, userId: receiverId, status: "ACCEPTED" },
      update: { status: "ACCEPTED" },
    });
    const h = await prisma.hangout.findUnique({ where: { id: hangoutId } });
    scheduledAt = h?.scheduledAt?.toISOString() || scheduledAt;
  } else {
    const when = parseInviteTime(invite.timeLabel);
    const hangout = await prisma.hangout.create({
      data: {
        title: `${activityEmoji} ${activityName}`,
        description: `Settled via RPS · ${invite.timeLabel || "Soon"}`,
        scheduledAt: when,
        maxParticipants: 4,
        creatorId: invite.senderId,
        kind: "HANGOUT",
        visibility: "FRIENDS",
        isPrivate: true,
        status: "OPEN",
        participants: {
          create: [
            { userId: invite.senderId, status: "ACCEPTED" },
            { userId: receiverId, status: "ACCEPTED" },
          ],
        },
      },
    });
    hangoutId = hangout.id;
    scheduledAt = hangout.scheduledAt.toISOString();
  }

  await prisma.invite.update({
    where: { id: invite.id },
    data: {
      status: "ACCEPTED",
      hangoutId: hangoutId || undefined,
      activityName,
      activityEmoji,
    },
  });

  return { hangoutId, scheduledAt };
}

function settleView(
  data: SettleData,
  userId: string,
  invite: { senderId: string; receiverId: string | null }
) {
  const oid = otherPlayer(invite, userId);
  if (!oid) return data;
  return sanitizeSettleForUser(data, userId, oid);
}

export async function GET(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;
  const inviteId = request.nextUrl.searchParams.get("inviteId");
  if (!inviteId) return error("inviteId required", 400);

  const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
  if (!invite) return error("Invite not found", 404);
  if (invite.senderId !== userId && invite.receiverId !== userId) {
    return error("Forbidden", 403);
  }

  const data = parseSettleData(invite.settleData);
  if (!data) return success({ settle: null });
  return success({ settle: settleView(data, userId, invite) });
}

export async function POST(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const body = await request.json();
    const { inviteId, action, move } = body as {
      inviteId?: string;
      action?: string;
      move?: string;
    };

    if (!inviteId || !action) return error("inviteId and action required", 400);

    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: {
        hangout: true,
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });

    if (!invite) return error("Invite not found", 404);
    if (invite.senderId !== userId && invite.receiverId !== userId) {
      return error("Forbidden", 403);
    }
    if (!invite.receiverId) return error("Invalid invite", 400);
    if (invite.status !== "PENDING") {
      const existing = parseSettleData(invite.settleData);
      if (invite.status === "ACCEPTED" && existing?.status === "done") {
        return success({
          settle: settleView(existing, userId, invite),
          hangoutId: invite.hangoutId,
          status: "accepted",
        });
      }
      return error("Invite already responded", 400);
    }
    if (!invite.isCounter) return error("Settle only for counter invites", 400);

    const parent = invite.parentInviteId
      ? await prisma.invite.findUnique({ where: { id: invite.parentInviteId } })
      : null;

    // Counter sender owns invite.activity*; receiver owns parent activity
    const counterAct = {
      name: invite.activityName,
      emoji: invite.activityEmoji,
      ownerId: invite.senderId,
    };
    const originalAct = {
      name: parent?.activityName || invite.activityName,
      emoji: parent?.activityEmoji || invite.activityEmoji,
      ownerId: invite.receiverId,
    };

    /* ── Start best-of-3 ── */
    if (action === "start") {
      let data = parseSettleData(invite.settleData);
      if (!data || data.status !== "playing") {
        data = createSettle(userId, invite.senderId, invite.receiverId);
        await prisma.invite.update({
          where: { id: inviteId },
          data: { settleData: JSON.stringify(data) },
        });
        const otherId = otherPlayer(invite, userId)!;
        const starterName =
          userId === invite.senderId
            ? invite.sender.name
            : invite.receiver?.name || "Someone";
        await notify(
          otherId,
          "Play to settle! 👊",
          `${starterName} wants best of 3 — winner picks the hang`,
          "INVITE_SETTLE"
        );
      }
      return success({ settle: settleView(data, userId, invite) });
    }

    /* ── Submit move ── */
    if (action === "move") {
      if (!isValidMove(move)) return error("Invalid move", 400);
      let data = parseSettleData(invite.settleData);
      if (!data || data.status !== "playing") {
        return error("Settle not started — call start first", 400);
      }

      const cur =
        data.rounds.find((r) => r.round === data!.currentRound) ||
        data.rounds[data.rounds.length - 1];
      if (!cur || cur.resolved) return error("Round already resolved", 400);
      if (cur.moves[userId]) return error("You already played this round", 400);

      cur.moves[userId] = move as SettleMove;

      const aId = invite.senderId;
      const bId = invite.receiverId;
      const aMove = cur.moves[aId];
      const bMove = cur.moves[bId];
      let lastReveal: {
        my: SettleMove;
        their: SettleMove;
        draw: boolean;
        youWonRound: boolean | null;
      } | null = null;

      if (aMove && bMove) {
        const result = beats(aMove, bMove);
        const myM = userId === aId ? aMove : bMove;
        const theirM = userId === aId ? bMove : aMove;
        lastReveal = {
          my: myM,
          their: theirM,
          draw: result === "draw",
          youWonRound:
            result === "draw"
              ? null
              : (result === "win" && userId === aId) ||
                  (result === "lose" && userId === bId)
                ? true
                : false,
        };

        if (result === "draw") {
          // Redo same round — clear moves
          cur.moves[aId] = null;
          cur.moves[bId] = null;
          cur.winnerId = null;
          cur.resolved = false;
        } else {
          const roundWinner = result === "win" ? aId : bId;
          cur.winnerId = roundWinner;
          cur.resolved = true;
          data.scores[roundWinner] = (data.scores[roundWinner] || 0) + 1;

          const aScore = data.scores[aId] || 0;
          const bScore = data.scores[bId] || 0;

          // Best of 3: first to 2 wins
          if (aScore >= 2 || bScore >= 2) {
            const winnerId = aScore >= 2 ? aId : bId;
            const winAct =
              winnerId === counterAct.ownerId
                ? { name: counterAct.name, emoji: counterAct.emoji }
                : { name: originalAct.name, emoji: originalAct.emoji };

            data.status = "done";
            data.winnerId = winnerId;
            data.winningActivity = winAct;

            const fin = await finalizeHang(invite, winAct.name, winAct.emoji);
            data.hangoutId = fin.hangoutId;

            await prisma.invite.update({
              where: { id: inviteId },
              data: { settleData: JSON.stringify(data) },
            });

            const winnerName =
              winnerId === invite.senderId
                ? invite.sender.name
                : invite.receiver?.name || "Someone";
            await notify(
              aId === winnerId ? bId : aId,
              "Settle decided! ✨",
              `${winnerName} won — it's ${winAct.emoji} ${winAct.name}`,
              "INVITE_SETTLE_DONE"
            );
            await notify(
              winnerId,
              "You won the settle! 🏆",
              `Plan locked: ${winAct.emoji} ${winAct.name}`,
              "INVITE_SETTLE_DONE"
            );

            return success({
              settle: settleView(data, userId, invite),
              lastReveal,
              hangoutId: fin.hangoutId,
              scheduledAt: fin.scheduledAt,
              status: "accepted",
              activityName: winAct.name,
              activityEmoji: winAct.emoji,
              timeLabel: invite.timeLabel,
            });
          }

          // Next round
          const next = data.currentRound + 1;
          data.currentRound = next;
          data.rounds.push({
            round: next,
            moves: { [aId]: null, [bId]: null },
            winnerId: null,
            resolved: false,
          });
        }
      }

      await prisma.invite.update({
        where: { id: inviteId },
        data: { settleData: JSON.stringify(data) },
      });

      return success({
        settle: settleView(data, userId, invite),
        ...(lastReveal ? { lastReveal } : {}),
      });
    }

    return error("Invalid action (start | move)", 400);
  } catch (err) {
    console.error("Settle invite error:", err);
    return error("Failed to settle", 500);
  }
}
