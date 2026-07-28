import { success, error } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.profile.findMany({
      where: { isOnline: true },
      take: 20,
      include: { user: { select: { id: true, name: true } } },
    });

    return success(
      users.map((u) => ({
        id: u.userId,
        name: u.user.name,
        avatarUrl: u.avatarUrl,
        isOnline: u.isOnline,
      }))
    );
  } catch (err) {
    console.error("Fetch online users error:", err);
    return error("Failed to fetch online users", 500);
  }
}
