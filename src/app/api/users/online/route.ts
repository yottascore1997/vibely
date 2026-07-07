import { success } from "@/lib/api-response";
import { mockOnlineUsers } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.profile.findMany({
      where: { isOnline: true },
      take: 20,
      include: { user: { select: { id: true, name: true } } },
    });

    if (users.length > 0) {
      return success(
        users.map((u) => ({
          id: u.userId,
          name: u.user.name,
          avatarUrl: u.avatarUrl,
          isOnline: u.isOnline,
        }))
      );
    }
  } catch {
    // use mock
  }

  return success({ users: mockOnlineUsers, count: 128 });
}
