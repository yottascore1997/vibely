import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatPlan(h: {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  destination: string | null;
  latitude: number | null;
  longitude: number | null;
  distance: number | null;
  scheduledAt: Date;
  endDate: Date | null;
  maxParticipants: number;
  status: string;
  kind: string;
  imageUrl: string | null;
  creatorId: string;
  activity: { name: string } | null;
  participants: { userId: string; user: { id: string; name: string; profile: { avatarUrl: string | null } | null } }[];
  creator: { id: string; name: string; profile: { avatarUrl: string | null } | null };
}) {
  const scheduled = new Date(h.scheduledAt);
  const now = new Date();
  const diffMs = scheduled.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);

  let badge = "Today";
  if (diffMin < 0) badge = "Live";
  else if (diffMin <= 60) badge = "Soon";
  else if (diffMin > 24 * 60) badge = "This Week";

  return {
    id: h.id,
    title: h.title,
    description: h.description,
    location: h.location,
    destination: h.destination,
    latitude: h.latitude,
    longitude: h.longitude,
    distance: h.distance ?? 2.5,
    scheduledAt: h.scheduledAt,
    endDate: h.endDate,
    time: scheduled.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
    timeLabel: diffMin <= 0 ? "Now" : diffMin < 60 ? `in ${diffMin} min` : scheduled.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
    maxParticipants: h.maxParticipants,
    going: h.participants.length,
    status: h.status,
    kind: h.kind,
    imageUrl: h.imageUrl,
    activity: h.activity?.name,
    badge,
    creatorId: h.creatorId,
    creatorName: h.creator.name,
    creatorAvatar: h.creator.profile?.avatarUrl,
    participants: h.participants.map((p) => ({
      id: p.userId,
      name: p.user.name,
      avatarUrl: p.user.profile?.avatarUrl,
    })),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all";
  const mine = searchParams.get("mine") === "true";
  const city = searchParams.get("city");
  const kind = searchParams.get("kind"); // HANGOUT | EVENT | TRAVEL
  const auth = getAuthUser(request);
  const userId = auth?.userId ?? null;

  if (mine && !auth) return unauthorized();

  try {
    let whereClause: any = {};

    if (kind && ["HANGOUT", "EVENT", "TRAVEL"].includes(kind)) {
      whereClause.kind = kind;
    }

    if (mine && userId) {
      whereClause.OR = [{ creatorId: userId }, { participants: { some: { userId } } }];
    } else {
      let targetCity = city;
      if (!targetCity && userId) {
        const userProfile = await prisma.profile.findUnique({
          where: { userId: userId },
          select: { city: true }
        });
        if (userProfile?.city) {
          targetCity = userProfile.city;
        }
      }

      if (targetCity && kind !== "TRAVEL") {
        whereClause.creator = {
          profile: {
            city: targetCity
          }
        };
      }
    }

    const hangouts = await prisma.hangout.findMany({
      where: whereClause,
      include: {
        activity: true,
        participants: { include: { user: { include: { profile: true } } } },
        creator: { include: { profile: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    let list = hangouts.map(formatPlan);
    if (!mine && userId && !kind) {
      list = list.filter((p) => p.creatorId !== userId);
    }
    if (filter === "today") {
      list = list.filter((p) => p.badge === "Today" || p.badge === "Soon" || p.badge === "Live");
    }
    return success(list);
  } catch (err) {
    console.error("Fetch hangouts error:", err);
    return error("Failed to fetch hangouts", 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const creatorId = auth.userId;

  try {
    const body = await request.json();
    const {
      title,
      description,
      location,
      destination,
      scheduledAt,
      endDate,
      maxParticipants,
      activity,
      imageUrl,
      distance,
      latitude,
      longitude,
      kind,
    } = body;

    if (!title || !scheduledAt) {
      return error("Title and time are required");
    }

    const hangoutKind =
      kind && ["HANGOUT", "EVENT", "TRAVEL"].includes(kind) ? kind : "HANGOUT";

    let activityId: string | undefined;
    if (activity) {
      const act = await prisma.activity.upsert({
        where: { name: activity },
        create: { name: activity, icon: "cafe", color: "#8A56FF", peopleCount: 1 },
        update: { peopleCount: { increment: 1 } },
      });
      activityId = act.id;
    }

    const hangout = await prisma.hangout.create({
      data: {
        title,
        description,
        location: location || destination || null,
        destination: destination || null,
        scheduledAt: new Date(scheduledAt),
        endDate: endDate ? new Date(endDate) : null,
        maxParticipants: maxParticipants || 8,
        creatorId,
        activityId,
        imageUrl,
        distance: distance ?? 1.2,
        latitude: typeof latitude === "number" ? latitude : null,
        longitude: typeof longitude === "number" ? longitude : null,
        kind: hangoutKind,
        participants: { create: { userId: creatorId } },
      },
      include: {
        activity: true,
        participants: { include: { user: { include: { profile: true } } } },
        creator: { include: { profile: true } },
      },
    });

    return success(formatPlan(hangout), 201);
  } catch (e) {
    console.error("Create hangout error:", e);
    return error("Could not create plan", 500);
  }
}
