import { success, error } from "@/lib/api-response";
import { signToken, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * TEMP (pre-prod): any valid Indian mobile + OTP 123456 → login/register.
 * Firebase SMS is disabled on the app until production.
 * When going live: remove/restrict this route and turn Firebase OTP back on.
 */
const DEV_OTP = "123456";

function cleanDigits(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function toE164Like(digits: string) {
  const last10 = digits.slice(-10);
  if (last10.length === 10) return `+91${last10}`;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("+")) return digits;
  return `+${digits}`;
}

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}

/**
 * POST /api/auth/dev-otp
 * Body: { phone: string, otp: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phoneRaw = String(body?.phone || "").trim();
    const otp = String(body?.otp || "").trim();

    if (!phoneRaw || !otp) {
      return error("phone and otp are required", 400);
    }

    const digits = cleanDigits(phoneRaw);
    const last10 = digits.slice(-10);

    if (last10.length !== 10) {
      return error("Enter a valid 10-digit mobile number", 400);
    }

    if (otp !== DEV_OTP) {
      return error("Invalid OTP. Use 123456 for now.", 401);
    }

    const phone = toE164Like(last10);
    const firebaseUid = `dev_${last10}`;

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          { phone: last10 },
          { phone: `+91${last10}` },
          { email: `phone_${last10}@hangora.auth` },
          { email: `phone_${last10}_dummy@hangora.auth` },
          { firebaseUid },
        ],
      },
      include: { profile: true },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const email = `phone_${last10}@hangora.auth`;
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      const finalEmail = existingEmail
        ? `phone_${last10}_dummy@hangora.auth`
        : email;
      const passwordHash = await hashPassword(
        crypto.randomBytes(32).toString("hex")
      );

      try {
        user = await prisma.user.create({
          data: {
            email: finalEmail,
            passwordHash,
            name: `User ${last10.slice(-4)}`,
            phone,
            firebaseUid,
            profile: { create: {} },
          },
          include: { profile: true },
        });
      } catch (createErr) {
        console.warn("Dev OTP create with firebaseUid failed, retrying without:", createErr);
        user = await prisma.user.create({
          data: {
            email: finalEmail,
            passwordHash,
            name: `User ${last10.slice(-4)}`,
            phone,
            profile: { create: {} },
          },
          include: { profile: true },
        });
      }
    } else {
      try {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            phone: user.phone || phone,
            firebaseUid: (user as any).firebaseUid || firebaseUid,
          },
          include: { profile: true },
        });
      } catch {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { phone: user.phone || phone },
          include: { profile: true },
        });
      }
    }

    const token = signToken(user.id, user.email);

    return success({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        onboardingDone: user.profile?.onboardingDone ?? false,
      },
      isNewUser: isNewUser || !user.profile?.onboardingDone,
      dummy: true,
      note: "TEMP auth: OTP 123456 for all numbers. Switch to Firebase before production.",
    });
  } catch (err) {
    console.error("Dev OTP auth error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return error(`Login failed: ${msg}`, 500);
  }
}
