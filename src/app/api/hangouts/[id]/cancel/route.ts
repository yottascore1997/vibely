import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Host cancels the entire hangout plan. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();
  const hostId = auth.userId;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const remark = typeof body.remark === "string" ? body.remark.trim() : "";

    const hangout = await prisma.hangout.findUnique({ where: { id } });
    if (!hangout) return error("Plan not found", 404);
    if (hangout.creatorId !== hostId) {
      return error("Only the host can cancel this plan", 403);
    }
    if (hangout.status === "CANCELLED") {
      return success({ message: "Already cancelled", status: "CANCELLED" });
    }
    if (hangout.status === "COMPLETED") {
      return error("Completed plans cannot be cancelled", 400);
    }

    await prisma.hangout.update({
      where: { id },
      data: {
        status: "CANCELLED",
        description: remark
          ? `${hangout.description || ""}\n[Cancelled: ${remark}]`.trim()
          : hangout.description,
      },
    });

    return success({ message: "Plan cancelled", status: "CANCELLED", remark: remark || null });
  } catch (e) {
    console.error("Cancel hangout error:", e);
    return error("Could not cancel plan", 500);
  }
}
