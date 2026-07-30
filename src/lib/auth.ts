import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { error } from "./api-response";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;

  // Next.js evaluates route modules during `next build` with NODE_ENV=production.
  // Don't crash the build when JWT_SECRET is only provided at runtime.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return "build-time-placeholder";
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }

  console.warn(
    "[auth] JWT_SECRET is not set; using insecure dev-secret-key. Set JWT_SECRET before deploying."
  );
  return "dev-secret-key";
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, getJwtSecret(), { expiresIn: "30d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret()) as { userId: string; email: string };
  } catch {
    return null;
  }
}

export function getAuthUser(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return verifyToken(auth.slice(7));
}

export function unauthorized() {
  return error("Unauthorized", 401);
}

export function calcAge(dob: Date) {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}
