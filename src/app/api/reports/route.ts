import { NextRequest } from "next/server";
import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const REASONS = new Set([
  "spam",
  "harassment",
  "inappropriate",
  "fake",
  "underage",
  "other",
]);

/** POST — report a user */
export async function POST(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) return unauthorized();

  try {
    const body = await request.json();
    const reportedId = String(body.userId || body.reportedId || "").trim();
    const reasonRaw = String(body.reason || "other").toLowerCase().trim();
    const reason = REASONS.has(reasonRaw) ? reasonRaw : "other";
    const details =
      typeof body.details === "string" ? body.details.trim().slice(0, 1000) : undefined;

    if (!reportedId) return error("userId is required", 400);
    if (reportedId === auth.userId) return error("Cannot report yourself", 400);

    const target = await prisma.user.findUnique({
      where: { id: reportedId },
      select: { id: true },
    });
    if (!target) return error("User not found", 404);

    const report = await prisma.report.create({
      data: {
        reporterId: auth.userId,
        reportedId,
        reason,
        details: details || null,
      },
    });

    // Also create in-app notification for ops (stored on reporter for now as receipt)
    try {
      await prisma.notification.create({
        data: {
          userId: auth.userId,
          title: "Report received",
          message: "Thanks — our team will review this profile.",
          type: "REPORT_RECEIVED",
        },
      });
    } catch {
      /* soft */
    }

    return success({ id: report.id, reported: true }, 201);
  } catch (err) {
    console.error("Report error:", err);
    return error("Failed to submit report", 500);
  }
}
