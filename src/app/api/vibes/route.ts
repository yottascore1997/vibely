import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const vibes = await prisma.vibe.findMany({
      where: { receiverId: userId },
      include: {
        sender: { include: { profile: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return success(vibes);
  } catch (err) {
    console.error("Fetch vibes error:", err);
    return error("Failed to fetch vibes", 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const senderId = auth.userId;

  try {
    const body = await request.json();
    const { receiverId, vibeType, message } = body;

    if (!receiverId || !vibeType) {
      return error("receiverId and vibeType are required");
    }

    const vibe = await prisma.vibe.create({
      data: { senderId, receiverId, vibeType, message },
    });

    return success(vibe, 201);
  } catch (err) {
    console.error("Send vibe error:", err);
    return error("Failed to send vibe", 500);
  }
}
