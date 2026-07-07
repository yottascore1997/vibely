import { success, error } from "@/lib/api-response";
import { mockVibes } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return success(mockVibes);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { senderId, receiverId, vibeType, message } = body;

    if (!senderId || !receiverId || !vibeType) {
      return error("senderId, receiverId and vibeType are required");
    }

    const vibe = await prisma.vibe.create({
      data: { senderId, receiverId, vibeType, message },
    });

    return success(vibe, 201);
  } catch {
    return success({ message: "Vibe sent!", demo: true }, 201);
  }
}
