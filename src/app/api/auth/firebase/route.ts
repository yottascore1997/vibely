import { success, error } from "@/lib/api-response";
import { signToken, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function normalizePhone(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "");
  return digits || null;
}

function phoneEmail(phone: string) {
  const clean = phone.replace(/[^\d]/g, "");
  return `phone_${clean}@hangora.auth`;
}

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}

/**
 * POST /api/auth/firebase
 * Body: { idToken: string, name?: string }
 *
 * Client completes Firebase phone OTP, then sends the Firebase ID token here.
 * We verify it, upsert the Hangora user by phone/firebaseUid, return our JWT.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idToken = String(body?.idToken || "").trim();
    const displayName = String(body?.name || "").trim();

    if (!idToken) {
      return error("idToken is required", 400);
    }

    const admin = getFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(idToken);

    const firebaseUid = decoded.uid;
    const phone = normalizePhone(decoded.phone_number || null);

    if (!phone) {
      return error("Phone number missing on Firebase token. Use phone OTP login.", 400);
    }

    // Prefer existing account by firebaseUid, then by phone
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ firebaseUid }, { phone }],
      },
      include: { profile: true },
    });

    if (!user) {
      const email = phoneEmail(phone);
      // Avoid collision if placeholder email somehow exists
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      const finalEmail = existingEmail
        ? `phone_${cleanDigits(phone)}_${firebaseUid.slice(0, 6)}@hangora.auth`
        : email;

      const passwordHash = await hashPassword(crypto.randomBytes(32).toString("hex"));
      const name =
        displayName ||
        `User ${cleanDigits(phone).slice(-4)}`;

      user = await prisma.user.create({
        data: {
          email: finalEmail,
          passwordHash,
          name,
          phone,
          firebaseUid,
          profile: { create: {} },
        },
        include: { profile: true },
      });
    } else {
      // Link / refresh firebase + phone
      const patch: {
        firebaseUid?: string;
        phone?: string;
        name?: string;
      } = {};
      if (!user.firebaseUid) patch.firebaseUid = firebaseUid;
      if (!user.phone) patch.phone = phone;
      if (displayName && (!user.name || /^User\s+\d+$/i.test(user.name))) {
        patch.name = displayName;
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: patch,
        include: { profile: true },
      });
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
    });
  } catch (err) {
    console.error("Firebase auth error:", err);
    const msg = err instanceof Error ? err.message : String(err);

    if (/Firebase Admin not configured/i.test(msg)) {
      return error(
        "Server Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT on Railway.",
        500
      );
    }
    if (/auth\/id-token|Decoding Firebase|Token expired|invalid/i.test(msg)) {
      return error("Invalid or expired OTP session. Please try again.", 401);
    }

    return error("Phone login failed. Please try again.", 500);
  }
}

function cleanDigits(phone: string) {
  return phone.replace(/[^\d]/g, "");
}
