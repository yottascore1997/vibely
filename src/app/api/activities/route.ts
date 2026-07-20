import { success, error } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({ orderBy: { peopleCount: "desc" } });
    return success(activities);
  } catch (err) {
    console.error("Fetch activities error:", err);
    return error("Failed to fetch activities", 500);
  }
}
