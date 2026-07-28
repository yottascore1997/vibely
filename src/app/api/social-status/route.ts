import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");
    const fetchAll = searchParams.get("all") === "true";

    if (targetUserId) {
      const status = await prisma.socialStatus.findUnique({
        where: { userId: targetUserId },
        include: { user: { include: { profile: true } } },
      });
      return success(status);
    }

    if (auth && !fetchAll && !searchParams.has("userId")) {
      const mine = await prisma.socialStatus.findUnique({
        where: { userId: auth.userId },
        include: { user: { include: { profile: true } } },
      });
      if (mine) return success(mine);
    }

    const statuses = await prisma.socialStatus.findMany({
      include: { user: { include: { profile: true } } },
      take: 100,
    });
    return success(statuses);
  } catch (err) {
    console.error("Social status fetch error:", err);
    return error("Failed to fetch social status", 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  const body = await request.json();
  const { energy, freeNow, freeUntil, activityName, timeLabel } = body;

  try {
    const status = await prisma.socialStatus.upsert({
      where: { userId },
      update: {
        energy: energy || "LESSGO",
        freeNow: freeNow ?? (energy === "LESSGO"),
        freeUntil: freeUntil ? new Date(freeUntil) : null,
        activityName: activityName ?? undefined,
        timeLabel: timeLabel ?? undefined,
      },
      create: {
        userId,
        energy: energy || "LESSGO",
        freeNow: freeNow ?? (energy === "LESSGO"),
        freeUntil: freeUntil ? new Date(freeUntil) : null,
        activityName: activityName || null,
        timeLabel: timeLabel || null,
      },
      include: {
        user: { include: { profile: true } },
      },
    });

    return success(status);
  } catch (err) {
    console.error("Social status update error:", err);
    return error("Failed to update social status", 500);
  }
}
