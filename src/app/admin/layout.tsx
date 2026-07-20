import React from "react";
import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "./actions";

async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    redirect("/login");
  }

  const isConnected = await checkDatabaseConnection();

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              VIBEMATCH
            </span>
            <span className="px-2 py-0.5 text-xs font-bold bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
              Admin
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            📊 Dashboard Overview
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            👥 User Management
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-3">
          <form action={async () => {
            "use server";
            const cookiesManager = await cookies();
            cookiesManager.delete("admin_session");
            redirect("/login");
          }}>
            <button 
              type="submit" 
              className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-center cursor-pointer"
            >
              🚪 Logout Administrator
            </button>
          </form>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 border border-zinc-800/60">
            <span className="text-xs font-semibold text-zinc-400">Database Status:</span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"}`} />
              <span className={`text-xs font-bold ${isConnected ? "text-emerald-400" : "text-amber-400"}`}>
                {isConnected ? "Connected" : "Fallback Data"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-850 px-8 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md sticky top-0 z-50">
          <h1 className="text-base font-bold text-zinc-200">Moderator Dashboard</h1>
          {!isConnected && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="text-xs font-semibold text-amber-300">
                ⚠️ DB offline. Running on fallback mock datasets.
              </span>
            </div>
          )}
        </header>

        {/* Page children */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
