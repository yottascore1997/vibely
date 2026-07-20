import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
