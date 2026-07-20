import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const userId = auth.userId;

  try {
    const jarItems = await prisma.jarItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return success(jarItems);
  } catch (err) {
    console.error("Fetch jar items error:", err);
    return error("Failed to fetch jar items", 500);
  }
}
