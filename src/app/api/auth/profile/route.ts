import { success, error } from "@/lib/api-response";
import { calcAge, getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return unauthorized();

  const body = await request.json();

  try {
    const dob = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    if (dob && isNaN(dob.getTime())) {
      return error("Invalid date of birth format");
    }
    if (dob) {
      const age = calcAge(dob);
      if (age < 18) return error("You must be 18 or older to use this app");
    }

    const languages =
      typeof body.languages === "string"
        ? body.languages
        : Array.isArray(body.languages)
          ? JSON.stringify(body.languages)
          : undefined;

    const GENDERS = new Set(["MALE", "FEMALE", "OTHER"]);
    const INTERESTED = new Set(["MEN", "WOMEN", "EVERYONE"]);

    const genderRaw = String(body.gender || "").toUpperCase();
    const interestedRaw = String(body.interestedIn || "").toUpperCase();

    const profileData = {
      firstName: body.firstName || undefined,
      bio: body.bio || undefined,
      dateOfBirth: dob || undefined,
      age: dob ? calcAge(dob) : undefined,
      gender: GENDERS.has(genderRaw) ? genderRaw : undefined,
      interestedIn: INTERESTED.has(interestedRaw) ? interestedRaw : undefined,
      pronouns: body.pronouns || undefined,
      jobTitle: body.occupation || body.jobTitle || undefined,
      company: body.company || undefined,
      education: body.education || undefined,
      college: body.college || undefined,
      height: body.height || undefined,
      languages,
      religion: body.religion || undefined,
      smoking: body.smoking || undefined,
      drinking: body.drinking || undefined,
      workout: body.workout || undefined,
      diet: body.diet || undefined,
      pets: body.pets || undefined,
      zodiac: body.zodiac || undefined,
      minAge: body.minAge != null ? Number(body.minAge) : undefined,
      maxAge: body.maxAge != null ? Number(body.maxAge) : undefined,
      maxDistance: body.maxDistance != null ? Number(body.maxDistance) : undefined,
      genderPreference: body.genderPreference || undefined,
      lookingFor: Array.isArray(body.lookingFor)
        ? JSON.stringify(body.lookingFor)
        : typeof body.lookingFor === "string"
          ? body.lookingFor
          : undefined,
      avatarUrl: body.avatarUrl || undefined,
      city: body.city || undefined,
      latitude:
        body.latitude != null && Number.isFinite(Number(body.latitude))
          ? Number(body.latitude)
          : undefined,
      longitude:
        body.longitude != null && Number.isFinite(Number(body.longitude))
          ? Number(body.longitude)
          : undefined,
      onboardingDone: body.onboardingDone === false ? false : true,
    };

    // Strip undefined so Prisma upsert doesn't choke on empty enums
    const clean = Object.fromEntries(
      Object.entries(profileData).filter(([, v]) => v !== undefined)
    );

    if (body.firstName) {
      await prisma.user.update({
        where: { id: authUser.userId },
        data: { name: body.firstName },
      });
    }

    const profile = await prisma.profile.upsert({
      where: { userId: authUser.userId },
      update: clean,
      create: { userId: authUser.userId, ...clean },
    });

    if (Array.isArray(body.interests) && body.interests.length) {
      await prisma.userInterest.deleteMany({ where: { profileId: profile.id } });
      for (const name of body.interests) {
        if (!name || typeof name !== "string") continue;
        const interest = await prisma.interest.upsert({
          where: { name },
          update: {},
          create: { name, color: "#8A56FF" },
        });
        await prisma.userInterest.create({
          data: { profileId: profile.id, interestId: interest.id },
        });
      }
    }

    const saved = await prisma.profile.findUnique({
      where: { userId: authUser.userId },
      include: { interests: { include: { interest: true } } },
    });

    return success({ profile: saved, message: "Profile saved successfully!" });
  } catch (err) {
    console.error("Profile save error:", err);
    return error(err instanceof Error ? err.message : "Failed to save profile", 500);
  }
}

export async function GET(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return unauthorized();

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: {
        profile: { include: { interests: { include: { interest: true } } } },
        socialStatus: true,
      },
    });
    if (!user) return error("User not found", 404);
    return success({
      ...user,
      onboardingDone: user.profile?.onboardingDone ?? false,
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    return error("Failed to fetch profile", 500);
  }
}
