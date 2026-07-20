"use client";

import React, { useState, useTransition } from "react";
import { loginAdmin } from "../admin/actions";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    startTransition(async () => {
      const res = await loginAdmin(username, password);
      if (res.success) {
        // Successful login, redirect to admin panel dashboard
        window.location.href = "/admin";
      } else {
        setError(res.error || "Invalid credentials");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100 font-sans relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />

      {/* Card Wrapper */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-2xl relative z-10 mx-4 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              VIBEMATCH
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
              Portal
            </span>
          </div>
          <h2 className="text-lg font-bold text-zinc-300">Moderator Authorization</h2>
          <p className="text-xs text-zinc-500">Access administrative tools and matchmaking controls.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter administrator username"
              className="w-full px-4 py-3 rounded-xl bg-zinc-800/40 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-purple-500/50 transition-colors placeholder-zinc-650"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
              Secret Password
            </label>
            <input
              type="password"
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl bg-zinc-800/40 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-purple-500/50 transition-colors placeholder-zinc-650"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:from-purple-600 hover:to-pink-650 transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isPending ? "Authenticating Session..." : "Authorize Dashboard Access 🔑"}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-850/60 text-center">
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            Use credentials from server env (<code className="text-zinc-400">ADMIN_USERNAME</code> /{" "}
            <code className="text-zinc-400">ADMIN_PASSWORD</code>).
          </p>
        </div>

      </div>
    </div>
  );
}
