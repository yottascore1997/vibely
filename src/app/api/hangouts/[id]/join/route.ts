import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    if (hangout.participants.some((p) => p.userId === userId)) {
      return success({ message: "Already joined", going: hangout.participants.length });
    }
    if (hangout.participants.length >= hangout.maxParticipants) {
      return error("Plan is full");
    }

    await prisma.participant.create({ data: { hangoutId: id, userId } });

    const updated = await prisma.hangout.findUnique({
      where: { id },
      include: {
        participants: { include: { user: { include: { profile: true } } } },
      },
    });

    return success({
      message: "Joined successfully",
      going: updated?.participants.length ?? hangout.participants.length + 1,
    });
  } catch (e) {
    console.error("Join hangout error:", e);
    return error("Could not join plan", 500);
  }
}
