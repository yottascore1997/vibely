import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const interests = [
    { name: "Coffee", icon: "cafe", color: "#8B5E3C" },
    { name: "Travel", icon: "airplane", color: "#3B82F6" },
    { name: "Music", icon: "musical-notes", color: "#8B5CF6" },
    { name: "Photography", icon: "camera", color: "#10B981" },
    { name: "Cricket", icon: "baseball", color: "#22C55E" },
    { name: "Gym", icon: "barbell", color: "#EF4444" },
    { name: "Movie", icon: "film", color: "#6366F1" },
    { name: "Food", icon: "pizza", color: "#F97316" },
  ];

  for (const interest of interests) {
    await prisma.interest.upsert({
      where: { name: interest.name },
      update: interest,
      create: interest,
    });
  }

  const activities = [
    { name: "Coffee", icon: "cafe", color: "#8B5E3C", peopleCount: 12 },
    { name: "Food", icon: "pizza", color: "#F97316", peopleCount: 8 },
    { name: "Movie", icon: "film", color: "#6366F1", peopleCount: 15 },
    { name: "Sports", icon: "tennisball", color: "#22C55E", peopleCount: 6 },
    { name: "Bike Ride", icon: "bicycle", color: "#3B82F6", peopleCount: 4 },
  ];

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { name: activity.name },
      update: activity,
      create: activity,
    });
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const users = [
    {
      email: "riya@example.com",
      name: "Riya Sharma",
      profile: {
        bio: "Looking for someone who's up for good conversations, spontaneous plans and creating amazing memories! ✨",
        age: 24,
        gender: "FEMALE" as const,
        city: "Pune",
        country: "India",
        jobTitle: "Designer",
        company: "Creatix Studios",
        education: "Symbiosis College, Pune",
        isVerified: true,
        isOnline: true,
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
        interests: ["Coffee", "Travel", "Music", "Photography"],
      },
    },
    {
      email: "sneha@example.com",
      name: "Sneha",
      profile: {
        bio: "Coffee lover & weekend explorer ☕",
        age: 24,
        gender: "FEMALE" as const,
        city: "Nagpur",
        country: "India",
        jobTitle: "Marketing",
        company: "Startup Hub",
        education: "NIT Nagpur",
        isVerified: true,
        isOnline: true,
        avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
        interests: ["Coffee", "Music", "Travel"],
      },
    },
    {
      email: "mayur@example.com",
      name: "Mayur",
      profile: {
        bio: "Building cool apps and looking for fun hangouts!",
        age: 25,
        gender: "MALE" as const,
        city: "Nagpur",
        country: "India",
        isVerified: false,
        isOnline: true,
        isPremium: true,
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
        interests: ["Coffee", "Cricket", "Movie"],
      },
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        passwordHash,
        profile: {
          create: {
            bio: userData.profile.bio,
            age: userData.profile.age,
            gender: userData.profile.gender,
            city: userData.profile.city,
            country: userData.profile.country,
            jobTitle: userData.profile.jobTitle,
            company: userData.profile.company,
            education: userData.profile.education,
            isVerified: userData.profile.isVerified,
            isOnline: userData.profile.isOnline,
            isPremium: userData.profile.isPremium || false,
            avatarUrl: userData.profile.avatarUrl,
            interests: {
              create: await Promise.all(
                userData.profile.interests.map(async (name) => {
                  const interest = await prisma.interest.findUnique({ where: { name } });
                  return { interestId: interest!.id };
                })
              ),
            },
            photos: {
              create: [{ url: userData.profile.avatarUrl, order: 0 }],
            },
          },
        },
        socialStatus: {
          create: { energy: "LESSGO", freeNow: true },
        },
      },
    });

    console.log(`Created user: ${user.name}`);
  }

  const sneha = await prisma.user.findUnique({ where: { email: "sneha@example.com" } });
  const mayur = await prisma.user.findUnique({ where: { email: "mayur@example.com" } });
  if (sneha && mayur) {
    await prisma.swipe.upsert({
      where: { senderId_receiverId: { senderId: sneha.id, receiverId: mayur.id } },
      update: { action: "LIKE" },
      create: { senderId: sneha.id, receiverId: mayur.id, action: "LIKE" },
    });
    console.log("Seed: Sneha already liked Mayur (test mutual match on like back)");
  }

  console.log("Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
