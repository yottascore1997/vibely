import { success, error } from "@/lib/api-response";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return unauthorized();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: authUser.userId },
    });

    if (!existingUser) {
      return error("User not found", 404);
    }

    // Deleting the user will trigger cascade deletion for profile, photos, matches, messages, hangouts, vibes, etc.
    await prisma.user.delete({
      where: { id: authUser.userId },
    });

    return success({ message: "Account and associated data deleted successfully." });
  } catch (err) {
    console.error("Delete account error:", err);
    return error(err instanceof Error ? err.message : "Failed to delete account", 500);
  }
}
