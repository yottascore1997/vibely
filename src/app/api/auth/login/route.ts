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
    const msg = err instanceof Error ? err.message : String(err);
    const isDb =
      /P1001|P1000|P1017|Can't reach|ECONNREFUSED|ETIMEDOUT|prisma|mysql|database|Pool|connect/i.test(
        msg
      );

    // One soft retry — Railway MySQL / pool can flake on cold start
    if (isDb) {
      try {
        await new Promise((r) => setTimeout(r, 800));
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
      } catch (retryErr) {
        console.error("Login retry error:", retryErr);
      }
    }

    return error(
      isDb
        ? "Database error. MySQL check karo — Railway DATABASE_URL / MySQL service."
        : "Login failed. Please try again.",
      500
    );
  }
}
