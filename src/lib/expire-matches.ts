import { prisma } from "./prisma";
import { evaluateChatGate } from "./match-chat-rules";

/** Delete matches that never got a two-way reply within the 24h window. */
export async function expireStaleMatches(forUserId?: string): Promise<string[]> {
  const where = forUserId
    ? { OR: [{ user1Id: forUserId }, { user2Id: forUserId }] }
    : {};

  const matches = await prisma.match.findMany({
    where,
    include: {
      messages: {
        select: { senderId: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const removedOtherIds: string[] = [];

  for (const match of matches) {
    const probeUser = forUserId || match.user1Id;
    const gate = evaluateChatGate({
      userId: probeUser,
      matchedAt: match.matchedAt,
      messages: match.messages,
    });

    if (!gate.expired) continue;

    await prisma.match.delete({ where: { id: match.id } });
    if (forUserId) {
      const otherId = match.user1Id === forUserId ? match.user2Id : match.user1Id;
      removedOtherIds.push(otherId);
    }
  }

  return removedOtherIds;
}
