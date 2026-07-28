import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code) {
      return error("Invite code is required", 400);
    }

    const invite = await prisma.invite.findUnique({
      where: { inviteCode: code },
      include: {
        sender: {
          include: { profile: true },
        },
        receiver: {
          include: { profile: true },
        },
      },
    });

    if (!invite) {
      return error("Invite not found or expired", 404);
    }

    const senderName = invite.sender.profile?.firstName || invite.sender.name || "A VibeMatch user";
    const senderAvatar = invite.sender.profile?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop";

    return success({
      id: invite.id,
      inviteCode: invite.inviteCode,
      senderName,
      senderAvatar,
      senderBio: invite.sender.profile?.bio || "Let's hang out!",
      senderCity: invite.sender.profile?.city || "Local",
      activityName: invite.activityName,
      activityEmoji: invite.activityEmoji,
      timeLabel: invite.timeLabel,
      status: invite.status.toLowerCase(),
      isWebRsvp: invite.isWebRsvp,
      inviteeName: invite.inviteeName,
      createdAt: invite.createdAt,
    });
  } catch (err) {
    console.error("Fetch public invite error:", err);
    return error("Failed to fetch invite details", 500);
  }
}
