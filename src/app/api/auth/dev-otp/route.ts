import { success, error } from "@/lib/api-response";
import { signToken, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/** Hardcoded demo login — only this number + OTP work here */
const DUMMY_PHONE_DIGITS = "9420413822";
const DUMMY_OTP = "123456";
const DUMMY_FIREBASE_UID = "dummy_9420413822";

function cleanDigits(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function toE164Like(digits: string) {
  if (digits.length === 10) return `+91${digits}`;
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
 * Dummy login for one fixed test number (no Firebase SMS).
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

    if (last10 !== DUMMY_PHONE_DIGITS || otp !== DUMMY_OTP) {
      return error("Invalid demo credentials", 401);
    }

    const phone = toE164Like(last10);

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          { phone: last10 },
          { email: `phone_${last10}@hangora.auth` },
          { email: `phone_${last10}_dummy@hangora.auth` },
        ],
      },
      include: { profile: true },
    });

    if (!user) {
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
            name: `Demo ${last10.slice(-4)}`,
            phone,
            firebaseUid: DUMMY_FIREBASE_UID,
            profile: { create: {} },
          },
          include: { profile: true },
        });
      } catch (createErr) {
        // Production DB may not have firebaseUid column yet
        console.warn("Dev OTP create with firebaseUid failed, retrying without:", createErr);
        user = await prisma.user.create({
          data: {
            email: finalEmail,
            passwordHash,
            name: `Demo ${last10.slice(-4)}`,
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
            firebaseUid: (user as any).firebaseUid || DUMMY_FIREBASE_UID,
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
      isNewUser: !user.profile?.onboardingDone,
      dummy: true,
    });
  } catch (err) {
    console.error("Dev OTP auth error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return error(`Demo login failed: ${msg}`, 500);
  }
}
