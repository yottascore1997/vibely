/** After match: one opener allowed; other must reply within 24h or match auto-deletes. */

export const MATCH_REPLY_WINDOW_MS = 24 * 60 * 60 * 1000;

export type MatchMessageLite = {
  senderId: string;
  createdAt: Date;
};

export type ChatGate = {
  unlocked: boolean;
  canSend: boolean;
  waitingForOther: boolean;
  mustSendOpener: boolean;
  expired: boolean;
  expiresAt: string | null;
  reason: string | null;
};

export function evaluateChatGate(params: {
  userId: string;
  matchedAt: Date;
  messages: MatchMessageLite[];
  now?: Date;
}): ChatGate {
  const now = params.now ?? new Date();
  const sorted = [...params.messages].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );
  const senders = new Set(sorted.map((m) => m.senderId));

  if (senders.size >= 2) {
    return {
      unlocked: true,
      canSend: true,
      waitingForOther: false,
      mustSendOpener: false,
      expired: false,
      expiresAt: null,
      reason: null,
    };
  }

  if (sorted.length === 0) {
    const expiresAt = new Date(params.matchedAt.getTime() + MATCH_REPLY_WINDOW_MS);
    const expired = now.getTime() > expiresAt.getTime();
    return {
      unlocked: false,
      canSend: !expired,
      waitingForOther: false,
      mustSendOpener: !expired,
      expired,
      expiresAt: expiresAt.toISOString(),
      reason: expired
        ? "Match expired — no message was sent within 24 hours"
        : "Send one hello — they have 24 hours to reply",
    };
  }

  const first = sorted[0];
  const openerId = first.senderId;
  const expiresAt = new Date(first.createdAt.getTime() + MATCH_REPLY_WINDOW_MS);
  const expired = now.getTime() > expiresAt.getTime();
  const iAmOpener = params.userId === openerId;

  if (expired) {
    return {
      unlocked: false,
      canSend: false,
      waitingForOther: false,
      mustSendOpener: false,
      expired: true,
      expiresAt: expiresAt.toISOString(),
      reason: "Match expired — no reply within 24 hours",
    };
  }

  if (iAmOpener) {
    return {
      unlocked: false,
      canSend: false,
      waitingForOther: true,
      mustSendOpener: false,
      expired: false,
      expiresAt: expiresAt.toISOString(),
      reason: "Waiting for their reply (24h) — then chat unlocks",
    };
  }

  return {
    unlocked: false,
    canSend: true,
    waitingForOther: false,
    mustSendOpener: false,
    expired: false,
    expiresAt: expiresAt.toISOString(),
    reason: "Reply to unlock the chat — or match expires in 24h",
  };
}

export async function deleteMatchById(prisma: {
  match: { delete: (args: { where: { id: string } }) => Promise<unknown> };
}, matchId: string) {
  await prisma.match.delete({ where: { id: matchId } });
}
