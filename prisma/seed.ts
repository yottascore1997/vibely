import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // 1. Clear database completely
  console.log("Clearing database...");
  await prisma.notification.deleteMany();
  await prisma.jarItem.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.hangout.deleteMany();
  await prisma.socialStatus.deleteMany();
  await prisma.vibe.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.userInterest.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.activity.deleteMany();

  // 2. Create seed interests & activities
  const interests = [
    { name: "Coffee", icon: "cafe", color: "#8B5E3C" },
    { name: "Travel", icon: "airplane", color: "#3B82F6" },
    { name: "Music", icon: "musical-notes", color: "#8B5CF6" },
  ];
  for (const interest of interests) {
    await prisma.interest.create({ data: interest });
  }

  const activities = [
    { name: "Coffee", icon: "cafe", color: "#8B5E3C", peopleCount: 0 },
    { name: "Food", icon: "pizza", color: "#F97316", peopleCount: 0 },
  ];
  for (const activity of activities) {
    await prisma.activity.create({ data: activity });
  }

  // 3. Create users
  const passwordHash = await bcrypt.hash("Mayur12@!", 10);

  const users = [
    {
      email: "mayur@example.com",
      name: "Mayur",
      profile: {
        bio: "Building cool apps and looking for fun hangouts!",
        age: 25,
        gender: "MALE" as const,
        city: "Nagpur",
        country: "India",
        isVerified: true,
        isOnline: true,
        isPremium: true,
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
        interests: ["Coffee"],
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
        isVerified: true,
        isOnline: true,
        avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
        interests: ["Coffee", "Music"],
      },
    },
  ];

  const createdUsers: Record<string, string> = {};

  for (const userData of users) {
    const user = await prisma.user.create({
      data: {
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
        jarItems: {
          create: userData.name === "Mayur" ? [
            {
              title: "First Coffee Vibe",
              description: "Sent Sneha a coffee vibe to break the ice! ☕",
              type: "VIBE",
              meta: "Sneha • Coffee ☕",
              imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&fit=crop",
            },
            {
              title: "Pizza Hangout at Sitabuldi",
              description: "Joined a spontaneous group hangout for Pizza! 🍕 Great conversations.",
              type: "PLAN",
              meta: "Group Hangout • Pizza 🍕",
              imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&fit=crop",
            },
            {
              title: "Vibe Match Streak!",
              description: "Talking for 7 days straight! Level up 🔥",
              type: "STREAK",
              meta: "7 Days Streak 🔥",
              imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&fit=crop",
            },
          ] : [
            {
              title: "Vibe Match Streak!",
              description: "Talking for 7 days straight! Level up 🔥",
              type: "STREAK",
              meta: "7 Days Streak 🔥",
              imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&fit=crop",
            }
          ]
        },
      },
    });

    createdUsers[user.name] = user.id;
    console.log(`Created user: ${user.name} (${user.id})`);
  }

  const snehaId = createdUsers["Sneha"];
  const mayurId = createdUsers["Mayur"];

  if (snehaId && mayurId) {
    const coffeeActivity = await prisma.activity.findFirst({ where: { name: "Coffee" } });
    const foodActivity = await prisma.activity.findFirst({ where: { name: "Food" } });

    const plan1 = await prisma.hangout.create({
      data: {
        title: "☕ Morning Coffee at Starbucks",
        description: "Let's connect for a morning filter coffee and talk about startups/tech!",
        location: "Dharampeth, Nagpur",
        creatorId: snehaId,
        activityId: coffeeActivity?.id,
        scheduledAt: new Date(Date.now() + 4 * 3600000),
        maxParticipants: 4,
        status: "OPEN",
        imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&fit=crop",
        participants: {
          create: [
            { userId: snehaId }
          ]
        }
      }
    });
    console.log(`Created hangout plan: ${plan1.title}`);

    const plan2 = await prisma.hangout.create({
      data: {
        title: "🍕 Weekend Pizza Party",
        description: "Pizza party this Sunday evening! Fun vibes and board games.",
        location: "Sitabuldi, Nagpur",
        creatorId: snehaId,
        activityId: foodActivity?.id,
        scheduledAt: new Date(Date.now() + 2 * 24 * 3600000),
        maxParticipants: 6,
        status: "OPEN",
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&fit=crop",
        participants: {
          create: [
            { userId: snehaId }
          ]
        }
      }
    });
    console.log(`Created hangout plan: ${plan2.title}`);
  }

  console.log("Database cleared and clean seed inserted!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
