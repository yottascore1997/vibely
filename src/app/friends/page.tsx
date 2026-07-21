"use client";

import { useState } from "react";
import SiteLayout from "@/components/site/SiteLayout";
import PageHero from "@/components/site/PageHero";

const STATUSES = [
  {
    id: "lessgo",
    title: "Lessgo",
    sub: "I'm up for anything",
    colors: ["#E6FDEE", "#4ADE80", "#16A34A"],
    text: "#16a34a",
  },
  {
    id: "maybe",
    title: "Maybe",
    sub: "Not sure yet",
    colors: ["#FFFDEB", "#FDE047", "#CA8A04"],
    text: "#ca8a04",
  },
  {
    id: "off",
    title: "Off grid",
    sub: "Need my space",
    colors: ["#FFEFEF", "#F87171", "#DC2626"],
    text: "#dc2626",
  },
] as const;

const ACTIVITIES = ["Coffee ☕", "Food 🍕", "Movie 🎬", "Sports 🏸", "Drinks 🍸", "Walk 🚶"];

export default function FriendsPage() {
  const [active, setActive] = useState<(typeof STATUSES)[number]["id"]>("lessgo");

  return (
    <SiteLayout>
      <PageHero
        kicker="Friends"
        title="Share your live energy"
        subtitle="Set Lessgo / Maybe / Off grid, pick an activity, and invite friends to hang out now."
      />

      <section className="site-wrap">
        <div className="rounded-[2rem] border border-vibe-border bg-vibe-card p-6 shadow-[var(--shadow)] sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-extrabold">Live Status</h2>
              <p className="mt-1 text-sm text-vibe-muted">Tell people if you&apos;re free</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Online
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STATUSES.map((s) => {
              const on = active === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(s.id)}
                  className={`rounded-3xl border p-5 text-center transition ${
                    on ? "border-transparent shadow-lg" : "border-vibe-border bg-white/60"
                  }`}
                  style={
                    on
                      ? {
                          background: `linear-gradient(180deg, ${s.colors[0]}, white)`,
                          boxShadow: `0 12px 30px ${s.text}33`,
                        }
                      : undefined
                  }
                >
                  <span
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                    style={{
                      background: `linear-gradient(145deg, ${s.colors[0]}, ${s.colors[1]}, ${s.colors[2]})`,
                      boxShadow: on ? `0 0 0 4px ${s.text}33` : undefined,
                    }}
                  />
                  <p className="mt-4 font-display text-lg font-bold" style={{ color: s.text }}>
                    {s.title}
                  </p>
                  <p className="mt-1 text-xs text-vibe-muted">{s.sub}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-vibe-faint">Quick activities</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ACTIVITIES.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-vibe-border bg-white px-4 py-2 text-sm font-semibold text-vibe-ink"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
