import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const [dbNotifs, pendingInvites] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.invite.findMany({
        where: { receiverId: userId, status: "PENDING" },
        include: { sender: { include: { profile: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    // Map DB notifications
    const items: any[] = dbNotifs.map((n) => {
      const isInvite = n.type.toLowerCase().includes("invite");

      let parsedSenderName: string | undefined = undefined;
      let parsedActivity: string | undefined = undefined;
      let parsedTime: string | undefined = undefined;

      // message format: `${sender.name} invited you for ${activityEmoji} ${activityName} · ${timeLabel}`
      if (n.message && n.message.includes(" invited you")) {
        const parts = n.message.split(" invited you");
        parsedSenderName = parts[0]?.trim();
        const rest = parts[1]?.trim() || "";
        if (rest.startsWith("for ")) {
          const actAndRemaining = rest.substring(4).split(" · ");
          parsedActivity = actAndRemaining[0]?.replace(/[^\w\s]/gi, "")?.trim();
          parsedTime = actAndRemaining[1]?.trim();
        }
      }

      return {
        id: n.id,
        type: isInvite ? "invite" : "reaction",
        titlePrefix: n.title,
        titleHighlight: n.message,
        titleUser: parsedSenderName,
        titleAction: parsedSenderName ? "invited you for" : undefined,
        subtitle: parsedTime ? `now · ${parsedTime}` : new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        user: parsedSenderName ? {
          name: parsedSenderName,
          badgeIcon: "people",
          badgeColor: "#22C55E",
        } : undefined,
        category: (parsedActivity || "chai").toLowerCase(),
        isRead: n.isRead,
        isHighlighted: !n.isRead,
        buttonText: isInvite ? "Open" : undefined,
        route: isInvite ? "/hangout" : undefined,
        inviteData: isInvite && parsedSenderName ? {
          planId: n.id,
          senderName: parsedSenderName,
          category: (parsedActivity || "chai").toLowerCase(),
          location: "CHAYOS, GALLERIA",
          time: parsedTime || "6 PM TODAY",
        } : undefined,
      };
    });

    // Ensure pending invites are at the top with full sender details
    for (const inv of pendingInvites) {
      const exists = items.some((item) => item.id.includes(inv.id) || (item.titleUser === inv.sender.name && item.type === "invite"));
      if (!exists) {
        items.unshift({
          id: `invite-${inv.id}`,
          type: "invite",
          titleUser: inv.sender.name,
          titleAction: "invited you for",
          titleHighlight: inv.activityName || "hangout",
          subtitle: `now · ${inv.timeLabel || "Today"}`,
          category: (inv.activityName || "chai").toLowerCase(),
          user: {
            name: inv.sender.name,
            avatar: inv.sender.profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
            badgeIcon: "people",
            badgeColor: "#22C55E",
          },
          isHighlighted: true,
          highlightColor: "#22C55E",
          isRead: false,
          buttonText: "Open",
          route: "/hangout",
          hangoutTitle: `Down for ${inv.activityEmoji} ${inv.activityName}?`,
          inviteData: {
            planId: inv.id,
            senderName: inv.sender.name,
            senderAvatar: inv.sender.profile?.avatarUrl,
            category: (inv.activityName || "chai").toLowerCase(),
            location: "CHAYOS, GALLERIA",
            time: inv.timeLabel || "6 PM TODAY",
          },
        });
      } else {
        const match = items.find((item) => item.id.includes(inv.id) || (item.titleUser === inv.sender.name && item.type === "invite"));
        if (match) {
          match.titleUser = inv.sender.name;
          match.user = {
            name: inv.sender.name,
            avatar: inv.sender.profile?.avatarUrl || match.user?.avatar,
            badgeIcon: "people",
            badgeColor: "#22C55E",
          };
          match.inviteData = {
            planId: inv.id,
            senderName: inv.sender.name,
            senderAvatar: inv.sender.profile?.avatarUrl,
            category: (inv.activityName || "chai").toLowerCase(),
            location: "CHAYOS, GALLERIA",
            time: inv.timeLabel || "6 PM TODAY",
          };
        }
      }
    }

    return success(items);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    return error("Failed to fetch notifications", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const body = await request.json().catch(() => ({}));
    if (body.markAll) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return success({ markedAll: true });
    }

    if (body.id) {
      const cleanId = String(body.id).replace(/^(notif-|invite-)/, "");
      await prisma.notification.updateMany({
        where: { id: cleanId, userId },
        data: { isRead: true },
      });
      return success({ markedId: body.id });
    }

    return error("id or markAll is required", 400);
  } catch (err) {
    console.error("Update notifications error:", err);
    return error("Failed to update notification", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return error("id query param required", 400);

    const cleanId = id.replace(/^(notif-|invite-)/, "");
    await prisma.notification.deleteMany({
      where: { id: cleanId, userId },
    });

    return success({ deleted: id });
  } catch (err) {
    console.error("Delete notification error:", err);
    return error("Failed to delete notification", 500);
  }
}
