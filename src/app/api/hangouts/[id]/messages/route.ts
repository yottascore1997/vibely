import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const resolvedParams = "then" in params ? await params : params;
    const hangoutId = resolvedParams.id;

    if (!hangoutId) {
      return error("hangoutId parameter is required");
    }

    // Verify hangout exists
    const hangout = await prisma.hangout.findUnique({
      where: { id: hangoutId }
    });

    if (!hangout) {
      return error("Hangout not found", 404);
    }

    const messages = await prisma.groupMessage.findMany({
      where: { hangoutId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            name: true,
            profile: {
              select: {
                avatarUrl: true,
              }
            }
          }
        }
      }
    });

    const formatted = messages.map((m: any) => ({
      id: m.id,
      text: m.content,
      sentAt: m.createdAt.toISOString(),
      senderId: m.senderId,
      senderName: m.sender.name,
      senderAvatar: m.sender.profile?.avatarUrl || null,
    }));

    return success(formatted);
  } catch (err: any) {
    console.error("GET hangout messages error:", err);
    return error("Failed to load group messages");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const resolvedParams = "then" in params ? await params : params;
    const hangoutId = resolvedParams.id;
    const body = await request.json();

    if (!hangoutId || !body.content?.trim()) {
      return error("hangoutId and message content are required");
    }

    const hangout = await prisma.hangout.findUnique({
      where: { id: hangoutId },
      include: { participants: { select: { userId: true } } },
    });

    if (!hangout) {
      return error("Hangout not found", 404);
    }

    const isCreator = hangout.creatorId === auth.userId;
    const isParticipant = hangout.participants.some((p) => p.userId === auth.userId);

    if (!isCreator && !isParticipant) {
      return error("You are not a participant in this hangout", 403);
    }

    const message = await prisma.groupMessage.create({
      data: {
        hangoutId,
        senderId: auth.userId,
        content: body.content.trim(),
      },
      include: {
        sender: {
          select: {
            name: true,
            profile: { select: { avatarUrl: true } },
          },
        },
      },
    });

    const formatted = {
      id: message.id,
      text: message.content,
      sentAt: message.createdAt.toISOString(),
      senderId: message.senderId,
      senderName: message.sender.name,
      senderAvatar: message.sender.profile?.avatarUrl || null,
    };

    return success(formatted, 201);
  } catch (err: any) {
    console.error("POST hangout message error:", err);
    return error("Failed to send group message");
  }
}
