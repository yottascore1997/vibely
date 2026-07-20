"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { createHash, timingSafeEqual } from "crypto";

const ADMIN_COOKIE = "admin_session";

function getAdminCreds() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "adminpassword123",
  };
}

function getAdminJwtSecret() {
  return process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || "dev-admin-secret";
}

function safeEqual(a: string, b: string) {
  const ah = createHash("sha256").update(a).digest();
  const bh = createHash("sha256").update(b).digest();
  return timingSafeEqual(ah, bh);
}

export async function toggleUserVerification(profileId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { isVerified: true },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    await prisma.profile.update({
      where: { id: profileId },
      data: { isVerified: !profile.isVerified },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Prisma error in toggleUserVerification:", error);
    return { success: false, error: "Database offline or prisma query error" };
  }
}

export async function toggleUserPremium(profileId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { isPremium: true },
    });

    if (!profile) {
      return { success: false, error: "Profile not found" };
    }

    await prisma.profile.update({
      where: { id: profileId },
      data: { isPremium: !profile.isPremium },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Prisma error in toggleUserPremium:", error);
    return { success: false, error: "Database offline or prisma query error" };
  }
}

export async function deleteUserProfile(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Prisma error in deleteUserProfile:", error);
    return { success: false, error: "Database offline or prisma query error" };
  }
}

export async function loginAdmin(username: string, password: string) {
  const creds = getAdminCreds();
  const userOk = safeEqual(username.trim(), creds.username);
  const passOk = safeEqual(password, creds.password);

  if (!userOk || !passOk) {
    return { success: false, error: "Invalid username or password" };
  }

  const token = jwt.sign(
    { role: "admin", sub: creds.username },
    getAdminJwtSecret(),
    { expiresIn: "1d" }
  );

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return { success: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect("/login");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (!token) return false;
    const payload = jwt.verify(token, getAdminJwtSecret()) as { role?: string };
    return payload?.role === "admin";
  } catch {
    return false;
  }
}
