import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pairUserIds } from "@/lib/match-utils";

export const dynamic = "force-dynamic";

async function removeMatchBetween(a: string, b: string) {
  const [user1Id, user2Id] = pairUserIds(a, b);
  await prisma.match.deleteMany({ where: { user1Id, user2Id } });
}

/** POST — block a user (also unmatches). GET — list blocked ids. */
export async function GET(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const rows = await prisma.block.findMany({
      where: { blockerId: auth.userId },
      select: { blockedId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return success(rows);
  } catch (err) {
    console.error("List blocks error:", err);
    return error("Failed to list blocks", 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const body = await request.json();
    const blockedId = String(body.userId || body.blockedId || "").trim();
    if (!blockedId) return error("userId is required", 400);
    if (blockedId === auth.userId) return error("Cannot block yourself", 400);

    const target = await prisma.user.findUnique({ where: { id: blockedId }, select: { id: true } });
    if (!target) return error("User not found", 404);

    await prisma.block.upsert({
      where: {
        blockerId_blockedId: { blockerId: auth.userId, blockedId },
      },
      create: { blockerId: auth.userId, blockedId },
      update: {},
    });

    // Soft: also remove reciprocal visibility via reverse block not required
    await removeMatchBetween(auth.userId, blockedId);
    await prisma.swipe.deleteMany({
      where: {
        OR: [
          { senderId: auth.userId, receiverId: blockedId },
          { senderId: blockedId, receiverId: auth.userId },
        ],
      },
    });

    return success({ blocked: true, userId: blockedId }, 201);
  } catch (err) {
    console.error("Block error:", err);
    return error("Failed to block user", 500);
  }
}

/** DELETE — unblock ?userId= */
export async function DELETE(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) return error("userId is required", 400);

    await prisma.block.deleteMany({
      where: { blockerId: auth.userId, blockedId: userId },
    });
    return success({ unblocked: true, userId });
  } catch (err) {
    console.error("Unblock error:", err);
    return error("Failed to unblock user", 500);
  }
}
