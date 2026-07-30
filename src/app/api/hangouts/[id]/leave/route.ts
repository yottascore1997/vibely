import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { refreshSeatStatus } from "@/lib/hangout-lifecycle";

/** Leave a hangout (participant) — cancels pending request or leaves accepted seat. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const { id } = await params;
    const hangout = await prisma.hangout.findUnique({
      where: { id },
      include: { participants: true },
    });
    if (!hangout) return error("Plan not found", 404);
    if (hangout.creatorId === userId) {
      return error("Host cannot leave — cancel the plan instead", 400);
    }

    const membership = hangout.participants.find(
      (p: { id: string; userId: string }) => p.userId === userId
    );
    if (!membership) return error("You are not in this plan", 400);

    await prisma.participant.delete({ where: { id: membership.id } });
    await refreshSeatStatus(id);

    const accepted = hangout.participants.filter(
      (p: { userId: string; status: string }) =>
        p.userId !== userId && p.status === "ACCEPTED"
    ).length;

    return success({
      message:
        membership.status === "PENDING"
          ? "Join request cancelled"
          : "Left plan",
      going: accepted,
    });
  } catch (e) {
    console.error("Leave hangout error:", e);
    return error("Could not leave plan", 500);
  }
}
