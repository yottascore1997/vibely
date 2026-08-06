import { NextRequest } from "next/server";
import { SocialEnergy } from "@prisma/client";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ENERGY_VALUES = new Set<string>(Object.values(SocialEnergy));

function parseEnergy(raw: unknown): SocialEnergy {
  if (typeof raw === "string" && ENERGY_VALUES.has(raw)) {
    return raw as SocialEnergy;
  }
  return SocialEnergy.LESSGO;
}

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
  const energy = parseEnergy(body.energy);
  const freeNow = body.freeNow as boolean | undefined;
  const freeUntil = body.freeUntil as string | undefined;
  // Accept both activityName and legacy `activity` from Spot screens
  const activityName = (body.activityName || body.activity) as string | undefined;
  const timeLabel = body.timeLabel as string | undefined;
  const notifyMatches = body.notifyMatches !== false;

  try {
    const prev = await prisma.socialStatus.findUnique({ where: { userId } });

    const status = await prisma.socialStatus.upsert({
      where: { userId },
      update: {
        energy,
        freeNow: freeNow ?? energy === SocialEnergy.LESSGO,
        freeUntil: freeUntil ? new Date(freeUntil) : null,
        activityName: activityName ?? undefined,
        timeLabel: timeLabel ?? undefined,
      },
      create: {
        userId,
        energy,
        freeNow: freeNow ?? energy === SocialEnergy.LESSGO,
        freeUntil: freeUntil ? new Date(freeUntil) : null,
        activityName: activityName || null,
        timeLabel: timeLabel || null,
      },
      include: {
        user: { include: { profile: true } },
      },
    });

    const becameLessgo =
      energy === SocialEnergy.LESSGO &&
      status.freeNow &&
      prev?.energy !== SocialEnergy.LESSGO;

    if (notifyMatches && becameLessgo) {
      const me = status.user;
      const matches = await prisma.match.findMany({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
        take: 40,
      });
      const otherIds = matches
        .map((m) => (m.user1Id === userId ? m.user2Id : m.user1Id))
        .filter(Boolean);

      if (otherIds.length > 0) {
        const label =
          activityName ||
          status.activityName ||
          "free to hang";
        await prisma.notification.createMany({
          data: otherIds.map((oid) => ({
            userId: oid,
            title: `${me.name.split(" ")[0]} is Lessgo ⚡`,
            message: `${me.name.split(" ")[0]} is ${label}. Ping them for a hang!`,
            type: "ENERGY_LESSGO",
          })),
        });
      }
    }

    return success(status);
  } catch (err) {
    console.error("Social status update error:", err);
    return error("Failed to update social status", 500);
  }
}
