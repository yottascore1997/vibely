import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { refreshSeatStatus, syncHangoutLifecycle } from "@/lib/hangout-lifecycle";

/** Host accepts or rejects a join request. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const hostId = auth.userId;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const targetUserId = body.userId as string | undefined;
    const accept = body.accept === true || body.accept === "true";
    const remark = typeof body.remark === "string" ? body.remark.trim() : "";

    if (!targetUserId) return error("userId required");

    await syncHangoutLifecycle(id);

    const hangout = await prisma.hangout.findUnique({
      where: { id },
      include: { participants: true },
    });
    if (!hangout) return error("Plan not found", 404);
    if (hangout.creatorId !== hostId) {
      return error("Only the host can respond to requests", 403);
    }
    if (hangout.status === "CANCELLED" || hangout.status === "COMPLETED") {
      return error("This plan is no longer active", 400);
    }

    const membership = hangout.participants.find(
      (p: { userId: string }) => p.userId === targetUserId
    );
    if (!membership) return error("No join request from this user", 404);
    if (membership.status === "ACCEPTED" && accept) {
      return success({ message: "Already accepted", status: "accepted" });
    }
    if (membership.status !== "PENDING" && membership.status !== "REJECTED") {
      if (!accept && membership.status === "ACCEPTED") {
        // treat as kick-via-reject not allowed here
        return error("User is already accepted — use remove instead", 400);
      }
    }

    if (accept) {
      const accepted = hangout.participants.filter(
        (p: { status: string }) => p.status === "ACCEPTED"
      ).length;
      if (accepted >= hangout.maxParticipants || hangout.status === "FULL") {
        return error("Plan is full", 400);
      }

      await prisma.participant.update({
        where: { id: membership.id },
        data: { status: "ACCEPTED", rejectRemark: null },
      });
      await refreshSeatStatus(id);

      return success({
        message: "Request accepted",
        status: "accepted",
        going: accepted + 1,
      });
    }

    await prisma.participant.update({
      where: { id: membership.id },
      data: {
        status: "REJECTED",
        rejectRemark: remark || "Host declined your request",
      },
    });

    return success({
      message: "Request rejected",
      status: "rejected",
      remark: remark || "Host declined your request",
    });
  } catch (e) {
    console.error("Respond hangout error:", e);
    return error("Could not respond to request", 500);
  }
}
