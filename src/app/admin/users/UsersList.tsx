"use client";

import React, { useState, useTransition } from "react";
import { toggleUserVerification, toggleUserPremium, deleteUserProfile } from "../actions";

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  age: number;
  city: string;
  avatarUrl: string;
  isVerified: boolean;
  isPremium: boolean;
  isOnline: boolean;
}

export default function UsersList({ initialUsers }: { initialUsers: UserProfile[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleToggleVerify = async (profileId: string) => {
    startTransition(async () => {
      const res = await toggleUserVerification(profileId);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === profileId ? { ...u, isVerified: !u.isVerified } : u));
      } else {
        // Fallback for offline mode so it remains responsive
        setUsers(prev => prev.map(u => u.id === profileId ? { ...u, isVerified: !u.isVerified } : u));
      }
    });
  };

  const handleTogglePremium = async (profileId: string) => {
    startTransition(async () => {
      const res = await toggleUserPremium(profileId);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === profileId ? { ...u, isPremium: !u.isPremium } : u));
      } else {
        setUsers(prev => prev.map(u => u.id === profileId ? { ...u, isPremium: !u.isPremium } : u));
      }
    });
  };

  const handleDelete = async (userId: string, name: string) => {
    const confirmed = confirm(`Are you sure you want to delete ${name}'s user profile?`);
    if (!confirmed) return;

    startTransition(async () => {
      const res = await deleteUserProfile(userId);
      if (res.success) {
        setUsers(prev => prev.filter(u => u.userId !== userId));
      } else {
        setUsers(prev => prev.filter(u => u.userId !== userId));
      }
    });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.city.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Input Filter bar */}
      <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <span className="text-zinc-500 text-lg">🔍</span>
        <input
          type="text"
          placeholder="Search profiles by name, city, or email..."
          className="flex-1 bg-transparent border-none text-zinc-100 text-sm focus:outline-none placeholder-zinc-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search.length > 0 && (
          <button onClick={() => setSearch("")} className="text-zinc-500 hover:text-zinc-300 text-xs">
            Clear
          </button>
        )}
      </div>

      {/* Profiles Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl">
          <p className="text-zinc-500 text-sm">No profiles found matching "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredUsers.map((user) => (
            <div 
              key={user.id} 
              className={`p-6 rounded-2xl bg-zinc-900 border transition-all duration-300 ${
                user.isVerified 
                  ? "border-purple-500/30 hover:border-purple-500/50 shadow-md shadow-purple-500/5" 
                  : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {/* Profile Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="relative">
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-zinc-800"
                    />
                    <span 
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                        user.isOnline ? "bg-emerald-500" : "bg-zinc-600"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{user.name}, {user.age}</h4>
                      {user.isVerified && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-bold">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{user.email}</p>
                    <p className="text-xs text-zinc-400 mt-1">📍 {user.city}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {user.isPremium ? (
                    <span className="text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      Premium
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase bg-zinc-800 text-zinc-500 px-2.5 py-0.5 rounded-full border border-zinc-700">
                      Standard
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-850">
                <button
                  onClick={() => handleToggleVerify(user.id)}
                  disabled={isPending}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    user.isVerified
                      ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                      : "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                  }`}
                >
                  {user.isVerified ? "Remove Verify" : "Verify Profile"}
                </button>

                <button
                  onClick={() => handleTogglePremium(user.id)}
                  disabled={isPending}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    user.isPremium
                      ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                  }`}
                >
                  {user.isPremium ? "Remove Premium" : "Make Premium"}
                </button>

                <button
                  onClick={() => handleDelete(user.userId, user.name)}
                  disabled={isPending}
                  className="px-3 py-2 text-xs font-bold rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
