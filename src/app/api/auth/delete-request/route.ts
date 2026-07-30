import { success, error } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email ? String(body.email).trim().toLowerCase() : "";
    const phone = body.phone ? String(body.phone).trim() : "";
    const reason = body.reason ? String(body.reason).trim() : "";

    if (!email && !phone) {
      return error("Please provide either your registered Email or Phone number.", 400);
    }

    // Check if user exists in DB with this email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phone ? { phone } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (user) {
      // Cascade delete user data directly
      await prisma.user.delete({
        where: { id: user.id },
      });

      return success({
        message: "Your account and all associated personal data have been successfully deleted.",
        deleted: true,
      });
    }

    // If user is not found directly, return a clear success message acknowledging receipt for processing
    return success({
      message:
        "Your data deletion request has been received. If an account matches the provided details, all associated data will be removed within 24 hours.",
      deleted: false,
    });
  } catch (err) {
    console.error("Delete request error:", err);
    return error(err instanceof Error ? err.message : "Failed to process data deletion request", 500);
  }
}
