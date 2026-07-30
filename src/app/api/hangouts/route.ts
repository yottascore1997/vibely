import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncHangoutLifecycle } from "@/lib/hangout-lifecycle";

type ParticipantRow = {
  userId: string;
  status?: string;
  rejectRemark?: string | null;
  user: {
    id: string;
    name: string;
    profile: { avatarUrl: string | null } | null;
  };
};

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
  visibility?: string;
  isPrivate?: boolean;
  activity: { name: string } | null;
  participants: ParticipantRow[];
  creator: { id: string; name: string; profile: { avatarUrl: string | null } | null };
}) {
  const scheduled = new Date(h.scheduledAt);
  const now = new Date();
  const diffMs = scheduled.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);

  let badge = "Today";
  if (h.status === "COMPLETED") badge = "Done";
  else if (h.status === "CANCELLED") badge = "Cancelled";
  else if (h.status === "FULL") badge = "Full";
  else if (diffMin < 0) badge = "Live";
  else if (diffMin <= 60) badge = "Soon";
  else if (diffMin > 24 * 60) badge = "This Week";

  const accepted = h.participants.filter(
    (p) => !p.status || p.status === "ACCEPTED"
  );
  const pending = h.participants.filter((p) => p.status === "PENDING");

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
    timeLabel:
      h.status === "COMPLETED"
        ? "Ended"
        : h.status === "CANCELLED"
          ? "Cancelled"
          : diffMin <= 0
            ? "Now"
            : diffMin < 60
              ? `in ${diffMin} min`
              : scheduled.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
    maxParticipants: h.maxParticipants,
    going: accepted.length,
    status: h.status,
    kind: h.kind,
    visibility: h.visibility || (h.isPrivate ? "FRIENDS" : "PUBLIC"),
    isPrivate: h.isPrivate ?? h.visibility === "FRIENDS",
    imageUrl: h.imageUrl,
    activity: h.activity?.name,
    badge,
    creatorId: h.creatorId,
    creatorName: h.creator.name,
    creatorAvatar: h.creator.profile?.avatarUrl,
    participants: accepted.map((p) => ({
      id: p.userId,
      name: p.user.name,
      avatarUrl: p.user.profile?.avatarUrl,
      status: "ACCEPTED",
    })),
    requests: pending.map((p) => ({
      id: p.userId,
      name: p.user.name,
      avatarUrl: p.user.profile?.avatarUrl,
      status: "PENDING",
    })),
    myParticipationStatus: undefined as string | undefined,
  };
}

function withMyStatus(
  plan: ReturnType<typeof formatPlan>,
  hangout: { participants: ParticipantRow[] },
  userId: string | null
) {
  if (!userId) return plan;
  const mine = hangout.participants.find((p) => p.userId === userId);
  return {
    ...plan,
    myParticipationStatus: mine?.status || null,
    rejectRemark: mine?.rejectRemark || null,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all";
  const mine = searchParams.get("mine") === "true";
  const city = searchParams.get("city");
  const kind = searchParams.get("kind");
  const auth = getAuthUser(request);
  const userId = auth?.userId ?? null;

  if (mine && !auth) return unauthorized();

  try {
    await syncHangoutLifecycle();

    let whereClause: any = {};

    if (kind && ["HANGOUT", "EVENT", "TRAVEL"].includes(kind)) {
      whereClause.kind = kind;
    }

    if (mine && userId) {
      whereClause.OR = [
        { creatorId: userId },
        { participants: { some: { userId } } },
      ];
    } else {
      // Public feed: hide ended / cancelled
      whereClause.status = { in: ["OPEN", "FULL"] };

      let targetCity = city;
      if (!targetCity && userId) {
        const userProfile = await prisma.profile.findUnique({
          where: { userId },
          select: { city: true },
        });
        if (userProfile?.city) targetCity = userProfile.city;
      }

      if (targetCity && kind !== "TRAVEL") {
        whereClause.creator = {
          profile: { city: targetCity },
        };
      }
    }

    let matchedUserIds: string[] = [];
    if (userId) {
      const matches = await prisma.match.findMany({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
        select: { user1Id: true, user2Id: true },
      });
      matchedUserIds = matches.map((m: { user1Id: string; user2Id: string }) =>
        m.user1Id === userId ? m.user2Id : m.user1Id
      );
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

    let list = hangouts.map((h: Parameters<typeof formatPlan>[0]) =>
      withMyStatus(formatPlan(h), h, userId)
    );

    const visParam = (
      searchParams.get("visibility") ||
      searchParams.get("audience") ||
      ""
    ).toLowerCase();

    list = list.filter((p) => {
      const isCreator = p.creatorId === userId;
      const isAccepted = p.participants.some((pt) => pt.id === userId);
      const isPending = p.requests?.some((r) => r.id === userId);
      const isMatchedFriend = matchedUserIds.includes(p.creatorId);

      if (p.isPrivate || p.visibility === "FRIENDS") {
        if (!isCreator && !isAccepted && !isPending && !isMatchedFriend) {
          return false;
        }
      }

      if (visParam === "public") {
        return !p.isPrivate && p.visibility !== "FRIENDS";
      }
      if (visParam === "friends" || visParam === "friends_only") {
        return p.isPrivate || p.visibility === "FRIENDS";
      }

      return true;
    });

    if (!mine && userId && !kind) {
      list = list.filter((p) => p.creatorId !== userId);
    }
    if (filter === "today") {
      list = list.filter(
        (p) => p.badge === "Today" || p.badge === "Soon" || p.badge === "Live"
      );
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
      visibility,
      isPrivate,
    } = body;

    if (!title || !scheduledAt) {
      return error("Title and time are required");
    }

    const hangoutKind =
      kind && ["HANGOUT", "EVENT", "TRAVEL"].includes(kind) ? kind : "HANGOUT";
    const isPrivateBool =
      isPrivate === true || visibility === "FRIENDS" || visibility === "FRIENDS_ONLY";
    const visibilityStr = isPrivateBool ? "FRIENDS" : "PUBLIC";

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
        visibility: visibilityStr,
        isPrivate: isPrivateBool,
        status: "OPEN",
        participants: {
          create: { userId: creatorId, status: "ACCEPTED" },
        },
      },
      include: {
        activity: true,
        participants: { include: { user: { include: { profile: true } } } },
        creator: { include: { profile: true } },
      },
    });

    return success(withMyStatus(formatPlan(hangout), hangout, creatorId), 201);
  } catch (e) {
    console.error("Create hangout error:", e);
    return error("Could not create plan", 500);
  }
}
