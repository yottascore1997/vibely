import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Unmatch — delete the match between auth user and :id (other user id) */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const resolvedParams = "then" in params ? await params : params;
    const otherUserId = resolvedParams.id;
    if (!otherUserId) return error("Other user id required", 400);

    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: userId },
        ],
      },
    });

    if (!match) return error("Match not found", 404);

    await prisma.match.delete({ where: { id: match.id } });
    return success({ unmatched: true, otherUserId });
  } catch (err) {
    console.error("Unmatch error:", err);
    return error("Failed to unmatch", 500);
  }
}
