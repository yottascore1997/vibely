import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Host removes a participant */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const hostId = auth.userId;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const targetUserId = body.userId as string | undefined;
    if (!targetUserId) return error("userId required");

    const hangout = await prisma.hangout.findUnique({
      where: { id },
      include: { participants: true },
    });
    if (!hangout) return error("Plan not found", 404);
    if (hangout.creatorId !== hostId) return error("Only the host can remove people", 403);
    if (targetUserId === hostId) return error("Host cannot remove themselves", 400);

    const membership = hangout.participants.find((p) => p.userId === targetUserId);
    if (!membership) return error("User is not in this plan", 400);

    await prisma.participant.delete({ where: { id: membership.id } });

    return success({
      message: "Participant removed",
      going: hangout.participants.length - 1,
      remark: body.remark || null,
    });
  } catch (e) {
    console.error("Kick hangout error:", e);
    return error("Could not remove participant", 500);
  }
}
