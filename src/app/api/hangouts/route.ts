import { success, error } from "@/lib/api-response";
import { mockHangouts } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

function formatPlan(h: {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  distance: number | null;
  scheduledAt: Date;
  maxParticipants: number;
  status: string;
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
    distance: h.distance ?? 2.5,
    scheduledAt: h.scheduledAt,
    time: scheduled.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
    timeLabel: diffMin <= 0 ? "Now" : diffMin < 60 ? `in ${diffMin} min` : scheduled.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
    maxParticipants: h.maxParticipants,
    going: h.participants.length,
    status: h.status,
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all";
  const userId = searchParams.get("userId");
  const mine = searchParams.get("mine") === "true";

  try {
    const hangouts = await prisma.hangout.findMany({
      where: mine && userId ? { creatorId: userId } : undefined,
      include: {
        activity: true,
        participants: { include: { user: { include: { profile: true } } } },
        creator: { include: { profile: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    if (hangouts.length > 0 || mine) {
      let list = hangouts.map(formatPlan);
      if (!mine && userId) {
        list = list.filter((p) => p.creatorId !== userId);
      }
      if (filter === "today") {
        list = list.filter((p) => p.badge === "Today" || p.badge === "Soon" || p.badge === "Live");
      }
      return success(list);
    }
  } catch {
    // fallback below
  }

  const filtered =
    filter === "today"
      ? mockHangouts.filter((h) => h.badge === "Today")
      : mockHangouts;

  return success(filtered);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      location,
      scheduledAt,
      maxParticipants,
      creatorId,
      activity,
      imageUrl,
      distance,
    } = body;

    if (!title || !scheduledAt || !creatorId) {
      return error("Title, time and creator are required");
    }

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
        location: location || null,
        scheduledAt: new Date(scheduledAt),
        maxParticipants: maxParticipants || 8,
        creatorId,
        activityId,
        imageUrl,
        distance: distance ?? 1.2,
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
