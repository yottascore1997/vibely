import { success, error } from "@/lib/api-response";
import { signToken, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return error("Email and password are required");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return error("Invalid email or password", 401);
    }

    const token = signToken(user.id, user.email);

    return success({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboardingDone: user.profile?.onboardingDone ?? false,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return error("Database error. MySQL check karo.", 500);
  }
}
