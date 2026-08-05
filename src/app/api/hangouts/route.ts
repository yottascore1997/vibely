import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncHangoutLifecycle } from "@/lib/hangout-lifecycle";
import { haversineKm } from "@/lib/match-utils";

type ParticipantRow = {
  userId: string;
  status?: string;
  rejectRemark?: string | null;
  user: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    profile: { avatarUrl: string | null } | null;
  };
};

type CreatorRow = {
  id: string;
  name: string;
  profile: {
    avatarUrl: string | null;
    latitude?: number | null;
    longitude?: number | null;
    city?: string | null;
  } | null;
};

function formatPlan(
  h: {
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
    creator: CreatorRow;
  },
  viewer?: { latitude?: number | null; longitude?: number | null } | null
) {
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

  const planLat = h.latitude ?? h.creator?.profile?.latitude ?? null;
  const planLng = h.longitude ?? h.creator?.profile?.longitude ?? null;
  const vLat = viewer?.latitude ?? null;
  const vLng = viewer?.longitude ?? null;

  let distanceKm: number | null = null;
  if (
    vLat != null &&
    vLng != null &&
    planLat != null &&
    planLng != null &&
    Number.isFinite(vLat) &&
    Number.isFinite(vLng) &&
    Number.isFinite(planLat) &&
    Number.isFinite(planLng)
  ) {
    distanceKm = haversineKm(vLat, vLng, planLat, planLng);
  }

  return {
    id: h.id,
    title: h.title,
    description: h.description,
    location: h.location,
    destination: h.destination,
    latitude: planLat,
    longitude: planLng,
    distance: distanceKm ?? h.distance ?? null,
    scheduledAt: h.scheduledAt,
    endDate: h.endDate,
    time: scheduled.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
    timeLabel: (() => {
      if (h.status === "COMPLETED") return "Ended";
      if (h.status === "CANCELLED") return "Cancelled";
      if (diffMin <= 0) return "Now";
      if (diffMin < 60) return `in ${diffMin} min`;
      const now = new Date();
      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startThat = new Date(
        scheduled.getFullYear(),
        scheduled.getMonth(),
        scheduled.getDate()
      );
      const dayDiff = Math.round(
        (startThat.getTime() - startToday.getTime()) / 86400000
      );
      const clock = scheduled.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      });
      if (dayDiff === 0) return `Today · ${clock}`;
      if (dayDiff === 1) return `Tomorrow · ${clock}`;
      return `${scheduled.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })} · ${clock}`;
    })(),
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
      isWhatsAppGuest: Boolean(p.user.email?.endsWith("@hangora.guest")),
      phone: p.user.phone || null,
    })),
    requests: pending.map((p) => ({
      id: p.userId,
      name: p.user.name,
      avatarUrl: p.user.profile?.avatarUrl,
      status: "PENDING",
      /** While PENDING, rejectRemark stores the joiner's note */
      remark: p.rejectRemark || null,
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
  const maxKmParam = searchParams.get("maxKm");
  const nearbyMode =
    searchParams.get("nearby") === "1" || searchParams.get("nearby") === "true";
  const auth = getAuthUser(request);
  const userId = auth?.userId ?? null;

  if (mine && !auth) return unauthorized();

  try {
    await syncHangoutLifecycle();

    let viewer: {
      city: string | null;
      latitude: number | null;
      longitude: number | null;
      maxDistance: number | null;
    } | null = null;

    if (userId) {
      viewer = await prisma.profile.findUnique({
        where: { userId },
        select: {
          city: true,
          latitude: true,
          longitude: true,
          maxDistance: true,
        },
      });
    }

    const hasViewerGps =
      viewer?.latitude != null &&
      viewer?.longitude != null &&
      Number.isFinite(viewer.latitude) &&
      Number.isFinite(viewer.longitude);

    const maxDistance = maxKmParam
      ? Number(maxKmParam)
      : nearbyMode
        ? 10
        : viewer?.maxDistance ?? 50;

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
      whereClause.status = { in: ["OPEN", "FULL"] };

      if (hasViewerGps) {
        whereClause.OR = [
          { AND: [{ latitude: { not: null } }, { longitude: { not: null } }] },
          {
            creator: {
              profile: {
                AND: [{ latitude: { not: null } }, { longitude: { not: null } }],
              },
            },
          },
        ];
      } else {
        const targetCity = city || viewer?.city;
        if (targetCity && kind !== "TRAVEL") {
          whereClause.creator = {
            profile: { city: targetCity },
          };
        }
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
      take: 120,
    });

    let list = hangouts.map((h: Parameters<typeof formatPlan>[0]) =>
      withMyStatus(formatPlan(h, viewer), h, userId)
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

    if (hasViewerGps && !mine) {
      list = list
        .filter(
          (p) =>
            typeof p.distance === "number" &&
            Number.isFinite(p.distance) &&
            p.distance <= maxDistance
        )
        .sort(
          (a, b) =>
            (typeof a.distance === "number" ? a.distance : 9999) -
            (typeof b.distance === "number" ? b.distance : 9999)
        );
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
      inviteeId,
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

    const lat =
      typeof latitude === "number" && Number.isFinite(latitude) ? latitude : null;
    const lng =
      typeof longitude === "number" && Number.isFinite(longitude) ? longitude : null;

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
        distance: typeof distance === "number" ? distance : null,
        latitude: lat,
        longitude: lng,
        kind: hangoutKind,
        visibility: visibilityStr,
        isPrivate: isPrivateBool,
        status: "OPEN",
        participants: {
          create: [
            { userId: creatorId, status: "ACCEPTED" },
            ...(typeof inviteeId === "string" &&
            inviteeId &&
            inviteeId !== creatorId
              ? [{ userId: inviteeId as string, status: "ACCEPTED" as const }]
              : []),
          ],
        },
      },
      include: {
        activity: true,
        participants: { include: { user: { include: { profile: true } } } },
        creator: { include: { profile: true } },
      },
    });

    if (lat != null && lng != null) {
      try {
        await prisma.profile.update({
          where: { userId: creatorId },
          data: {
            latitude: lat,
            longitude: lng,
            ...(typeof location === "string" && location.trim()
              ? { city: location.split(",").pop()?.trim() || undefined }
              : {}),
          },
        });
      } catch {
        /* profile may not exist yet */
      }
    }

    const viewer = await prisma.profile.findUnique({
      where: { userId: creatorId },
      select: { latitude: true, longitude: true },
    });

    return success(withMyStatus(formatPlan(hangout, viewer), hangout, creatorId), 201);
  } catch (e) {
    console.error("Create hangout error:", e);
    return error("Could not create plan", 500);
  }
}
