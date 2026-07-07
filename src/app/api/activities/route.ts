import { success } from "@/lib/api-response";
import { mockActivities } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({ orderBy: { peopleCount: "desc" } });
    if (activities.length > 0) return success(activities);
  } catch {
    // use mock
  }
  return success(mockActivities);
}
