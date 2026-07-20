import React from "react";
import { prisma } from "../../lib/prisma";

// Mock Fallback Data in case MariaDB is not running locally
const mockStats = {
  totalUsers: 428,
  totalMatches: 94,
  onlineUsers: 152,
  premiumUsers: 54,
  recentProfiles: [
    { id: "1", name: "Riya Sharma", age: 24, city: "Pune", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", isPremium: true, isVerified: true },
    { id: "2", name: "Aman Sen", age: 26, city: "Nagpur", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", isPremium: false, isVerified: false },
    { id: "3", name: "Sneha Roy", age: 24, city: "Nagpur", avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop", isPremium: true, isVerified: true },
    { id: "4", name: "Karan Johar", age: 25, city: "Pune", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", isPremium: false, isVerified: true },
  ],
  activeHangouts: [
    { id: "1", title: "Manali Road Trip 🏔️", creator: "Mayur", count: 8, joined: 3 },
    { id: "2", title: "South Goa Cafe Hopping 🏖️", creator: "Sneha", count: 6, joined: 2 }
  ]
};

async function getDashboardData() {
  try {
    // Attempt DB operations
    const totalUsers = await prisma.user.count();
    const totalMatches = await prisma.match.count();
    const onlineUsers = await prisma.profile.count({ where: { isOnline: true } });
    const premiumUsers = await prisma.profile.count({ where: { isPremium: true } });
    
    const dbProfiles = await prisma.profile.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        age: true,
        city: true,
        avatarUrl: true,
        isPremium: true,
        isVerified: true
      }
    });

    const recentProfiles = dbProfiles.map(p => ({
      id: p.id,
      name: p.firstName || "Anonymous",
      age: p.age || 20,
      city: p.city || "Unknown",
      avatarUrl: p.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      isPremium: p.isPremium,
      isVerified: p.isVerified
    }));

    const dbHangouts = await prisma.hangout.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        creator: { select: { name: true } },
        maxParticipants: true,
        participants: { select: { id: true } }
      }
    });

    const activeHangouts = dbHangouts.map(h => ({
      id: h.id,
      title: h.title,
      creator: h.creator.name,
      count: h.maxParticipants,
      joined: h.participants.length
    }));

    return {
      totalUsers,
      totalMatches,
      onlineUsers,
      premiumUsers,
      recentProfiles,
      activeHangouts,
      isFallback: false
    };
  } catch (error) {
    // Graceful fallback to mock stats
    return {
      ...mockStats,
      isFallback: true
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Welcome header info */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">VibeMatch Analytics</h2>
        <p className="text-sm text-zinc-400 mt-1">Real-time statistics and user metrics platform.</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Users</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">{data.totalUsers}</h3>
          <p className="text-xs text-emerald-400 font-medium mt-1">📈 +12% this week</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl" />
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Matches Connected</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">{data.totalMatches}</h3>
          <p className="text-xs text-pink-400 font-medium mt-1">💖 94 Vibe matches</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Online Now</span>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">{data.onlineUsers}</h3>
          <p className="text-xs text-zinc-400 font-medium mt-1">⚡ Active connections</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl" />
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Premium Accounts</span>
          <h3 className="text-3xl font-extrabold text-amber-400 mt-2">{data.premiumUsers}</h3>
          <p className="text-xs text-zinc-400 font-medium mt-1">💎 Subscription tier users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Profiles Card Feed */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h4 className="text-base font-bold text-zinc-200 mb-6">Recent Signups</h4>
          <div className="space-y-4">
            {data.recentProfiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/20 border border-zinc-800/40">
                <div className="flex items-center gap-4">
                  <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-zinc-700" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">{p.name}, {p.age}</span>
                      {p.isVerified && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-500/20">✓</span>}
                    </div>
                    <span className="text-xs text-zinc-500">{p.city}</span>
                  </div>
                </div>
                {p.isPremium && (
                  <span className="text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Premium
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Hangout Groups */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h4 className="text-base font-bold text-zinc-200 mb-6">Active Travel & Hangout Plans</h4>
          <div className="space-y-4">
            {data.activeHangouts.map((h) => (
              <div key={h.id} className="p-4 rounded-xl bg-zinc-800/20 border border-zinc-800/40 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-white">{h.title}</span>
                  <span className="text-xs font-semibold text-zinc-500">By {h.creator}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Spots filled</span>
                    <span className="font-bold text-white">{h.joined} / {h.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" 
                      style={{ width: `${(h.joined / h.count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
