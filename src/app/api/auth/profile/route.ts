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

    const profileData = {
      firstName: body.firstName || undefined,
      bio: body.bio || undefined,
      dateOfBirth: dob,
      age: dob ? calcAge(dob) : undefined,
      gender: body.gender || undefined,
      interestedIn: body.interestedIn || undefined,
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
      minAge: body.minAge ? Number(body.minAge) : undefined,
      maxAge: body.maxAge ? Number(body.maxAge) : undefined,
      maxDistance: body.maxDistance ? Number(body.maxDistance) : undefined,
      genderPreference: body.genderPreference || undefined,
      lookingFor: body.lookingFor ? JSON.stringify(body.lookingFor) : undefined,
      avatarUrl: body.avatarUrl || undefined,
      city: body.city || undefined,
      onboardingDone: true,
    };

    if (body.firstName) {
      await prisma.user.update({
        where: { id: authUser.userId },
        data: { name: body.firstName },
      });
    }

    const profile = await prisma.profile.upsert({
      where: { userId: authUser.userId },
      update: profileData,
      create: { userId: authUser.userId, ...profileData },
    });

    if (body.interests?.length) {
      await prisma.userInterest.deleteMany({ where: { profileId: profile.id } });
      for (const name of body.interests) {
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
      },
    });
    if (!user) return error("User not found", 404);
    return success(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    return error("Failed to fetch profile", 500);
  }
}
