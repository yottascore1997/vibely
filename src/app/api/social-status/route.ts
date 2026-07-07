import { success, error } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const statuses = await prisma.socialStatus.findMany({
      include: { user: { include: { profile: true } } },
    });
    if (statuses.length > 0) return success(statuses);
  } catch {
    // demo
  }

  return success({
    energy: "LESSGO",
    freeNow: true,
    message: "I'm up for anything!",
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, energy, freeNow, freeUntil } = body;

  try {
    const status = await prisma.socialStatus.upsert({
      where: { userId },
      update: { energy, freeNow, freeUntil: freeUntil ? new Date(freeUntil) : null },
      create: { userId, energy, freeNow, freeUntil: freeUntil ? new Date(freeUntil) : null },
    });

    return success(status);
  } catch {
    return success({ energy: energy || "LESSGO", demo: true });
  }
}
