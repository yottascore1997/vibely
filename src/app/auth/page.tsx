"use client";

import Link from "next/link";
import SiteLayout from "@/components/site/SiteLayout";

export default function AuthPage() {
  return (
    <SiteLayout>
      <section className="site-wrap grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-vibe-purple">Get started</p>
          <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Join Vibely
          </h1>
          <p className="mt-4 max-w-md text-vibe-muted">
            Create your profile, set your vibe, and start discovering hangouts. Full auth connects to the same API as the mobile app.
          </p>
          <ul className="mt-6 space-y-2 text-sm font-medium text-vibe-ink">
            <li>✓ Discover & match</li>
            <li>✓ Join hangouts & events map</li>
            <li>✓ Chats, travel & friends energy</li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-vibe-border bg-vibe-card p-6 shadow-[var(--shadow)] sm:p-8">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-vibe-faint">Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                className="mt-1.5 w-full rounded-2xl border border-vibe-border bg-white px-4 py-3 text-sm outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-vibe-faint">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-2xl border border-vibe-border bg-white px-4 py-3 text-sm outline-none focus:border-purple-400"
              />
            </div>
            <Link
              href="/discover"
              className="vibe-gradient flex w-full items-center justify-center rounded-2xl py-3.5 text-sm font-bold text-white"
            >
              Continue to Vibely
            </Link>
          </form>
          <p className="mt-4 text-center text-xs text-vibe-faint">
            Admin portal?{" "}
            <Link href="/login" className="font-bold text-vibe-purple">
              Moderator login
            </Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
