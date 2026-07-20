import React from "react";
import { prisma } from "../../../lib/prisma";
import UsersList, { UserProfile } from "./UsersList";

// Fallback Mock Profiles in case database is offline
const mockUsers: UserProfile[] = [
  {
    id: "prof-1",
    userId: "user-1",
    name: "Riya Sharma",
    email: "riya@example.com",
    age: 24,
    city: "Pune",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=400&fit=crop",
    isVerified: true,
    isPremium: true,
    isOnline: true,
  },
  {
    id: "prof-2",
    userId: "user-2",
    name: "Sneha Kapoor",
    email: "sneha@example.com",
    age: 24,
    city: "Nagpur",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop",
    isVerified: true,
    isPremium: true,
    isOnline: true,
  },
  {
    id: "prof-3",
    userId: "user-3",
    name: "Aman Sen",
    email: "aman@example.com",
    age: 26,
    city: "Nagpur",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    isVerified: false,
    isPremium: false,
    isOnline: true,
  },
  {
    id: "prof-4",
    userId: "user-4",
    name: "Karan Johar",
    email: "karan@example.com",
    age: 25,
    city: "Pune",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop",
    isVerified: false,
    isPremium: false,
    isOnline: false,
  }
];

async function fetchUserProfiles(): Promise<UserProfile[]> {
  try {
    const dbProfiles = await prisma.profile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return dbProfiles.map((p) => ({
      id: p.id,
      userId: p.userId,
      name: p.firstName || p.user.name || "Anonymous",
      email: p.user.email,
      age: p.age || 20,
      city: p.city || "Unknown",
      avatarUrl: p.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      isVerified: p.isVerified,
      isPremium: p.isPremium,
      isOnline: p.isOnline,
    }));
  } catch (error) {
    console.warn("Prisma failed to fetch profiles, falling back to mock datasets:", error);
    return mockUsers;
  }
}

export default async function UserManagementPage() {
  const users = await fetchUserProfiles();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">User Management</h2>
        <p className="text-sm text-zinc-400 mt-1">Review active user signups, toggle premium membership tiers, and verify user profiles.</p>
      </div>

      <UsersList initialUsers={users} />
    </div>
  );
}
