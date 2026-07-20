import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const body = await request.json();
    const { inviteId, status } = body;

    if (!inviteId || !status) {
      return error("inviteId and status are required", 400);
    }

    const dbStatus = status.toUpperCase();
    if (dbStatus !== "ACCEPTED" && dbStatus !== "REJECTED") {
      return error("Invalid status (must be accepted or rejected)", 400);
    }

    const existing = await prisma.invite.findUnique({ where: { id: inviteId } });
    if (!existing) {
      return error("Invite not found", 404);
    }
    if (existing.receiverId !== userId) {
      return error("Forbidden", 403);
    }

    const invite = await prisma.invite.update({
      where: { id: inviteId },
      data: { status: dbStatus },
    });

    return success({
      id: invite.id,
      status: invite.status.toLowerCase(),
    });
  } catch (err) {
    console.error("Respond invite error:", err);
    return error("Failed to update invite status", 500);
  }
}
