import { success, error } from "@/lib/api-response";
import { hashPassword, signToken } from "@/lib/auth";
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

  if (password.length < 6) {
    return error("Password must be at least 6 characters");
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return error("Email already registered", 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0],
        passwordHash,
        profile: { create: {} },
      },
      include: { profile: true },
    });

    const token = signToken(user.id, user.email);

    return success(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          onboardingDone: user.profile?.onboardingDone ?? false,
        },
      },
      201
    );
  } catch (err) {
    console.error("Register error:", err);
    return error("Database error. MySQL check karo.", 500);
  }
}
