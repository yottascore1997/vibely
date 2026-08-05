import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncHangoutLifecycle } from "@/lib/hangout-lifecycle";

/** Request to join a hangout — host must approve. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const { id } = await params;
    await syncHangoutLifecycle(id);

    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const rawRemark =
      typeof body?.remark === "string"
        ? body.remark
        : typeof body?.note === "string"
          ? body.note
          : "";
    const joinRemark = rawRemark.trim().slice(0, 200) || null;

    const hangout = await prisma.hangout.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (!hangout) return error("Plan not found", 404);
    if (hangout.status === "CANCELLED") return error("This plan was cancelled", 400);
    if (hangout.status === "COMPLETED") return error("This plan has ended", 400);
    if (hangout.status === "FULL") return error("Plan is full", 400);
    if (hangout.creatorId === userId) {
      return error("You are already the host of this plan", 400);
    }

    // Friends-only: only matches can request
    if (hangout.isPrivate || hangout.visibility === "FRIENDS") {
      const match = await prisma.match.findFirst({
        where: {
          OR: [
            { user1Id: userId, user2Id: hangout.creatorId },
            { user1Id: hangout.creatorId, user2Id: userId },
          ],
        },
      });
      if (!match) {
        return error("Friends-only plan — match with the host first", 403);
      }
    }

    const existing = hangout.participants.find(
      (p: { userId: string }) => p.userId === userId
    );

    if (existing?.status === "ACCEPTED") {
      return success({
        message: "Already joined",
        status: "accepted",
        going: hangout.participants.filter(
          (p: { status: string }) => p.status === "ACCEPTED"
        ).length,
      });
    }

    if (existing?.status === "PENDING") {
      return success({
        message: "Request already pending",
        status: "pending",
        going: hangout.participants.filter(
          (p: { status: string }) => p.status === "ACCEPTED"
        ).length,
      });
    }

    const acceptedCount = hangout.participants.filter(
      (p: { status: string }) => p.status === "ACCEPTED"
    ).length;
    if (acceptedCount >= hangout.maxParticipants) {
      await prisma.hangout.update({ where: { id }, data: { status: "FULL" } });
      return error("Plan is full", 400);
    }

    if (existing?.status === "REJECTED") {
      await prisma.participant.update({
        where: { id: existing.id },
        data: { status: "PENDING", rejectRemark: joinRemark },
      });
    } else {
      await prisma.participant.create({
        data: {
          hangoutId: id,
          userId,
          status: "PENDING",
          rejectRemark: joinRemark,
        },
      });
    }

    return success({
      message: "Join request sent to host",
      status: "pending",
      going: acceptedCount,
    });
  } catch (e) {
    console.error("Join hangout error:", e);
    return error("Could not join plan", 500);
  }
}
