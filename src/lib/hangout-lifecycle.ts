import { prisma } from "@/lib/prisma";

const COMPLETE_AFTER_MS = 3 * 60 * 60 * 1000; // 3h after scheduledAt if no endDate

/** Mark past hangouts COMPLETED and keep OPEN/FULL in sync with accepted seats. */
export async function syncHangoutLifecycle(hangoutId?: string) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - COMPLETE_AFTER_MS);

  const whereId = hangoutId ? { id: hangoutId } : {};

  await prisma.hangout.updateMany({
    where: {
      ...whereId,
      status: { in: ["OPEN", "FULL"] },
      OR: [
        { endDate: { lte: now } },
        { AND: [{ endDate: null }, { scheduledAt: { lte: cutoff } }] },
      ],
    },
    data: { status: "COMPLETED" },
  });

  if (hangoutId) {
    await refreshSeatStatus(hangoutId);
  }
}

export async function refreshSeatStatus(hangoutId: string) {
  const hangout = await prisma.hangout.findUnique({
    where: { id: hangoutId },
    include: { participants: true },
  });
  if (!hangout) return null;
  if (hangout.status === "CANCELLED" || hangout.status === "COMPLETED") {
    return hangout;
  }

  const accepted = hangout.participants.filter(
    (p: { status: string }) => p.status === "ACCEPTED"
  ).length;
  const next = accepted >= hangout.maxParticipants ? "FULL" : "OPEN";
  if (hangout.status !== next) {
    return prisma.hangout.update({
      where: { id: hangoutId },
      data: { status: next },
      include: { participants: true },
    });
  }
  return hangout;
}

export function acceptedCount(
  participants: { status?: string }[]
): number {
  return participants.filter((p) => !p.status || p.status === "ACCEPTED").length;
}
