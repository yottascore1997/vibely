"use client";

import { useState } from "react";
import Link from "next/link";
import SiteLayout from "@/components/site/SiteLayout";
import PageHero from "@/components/site/PageHero";
import { PROFILES } from "@/lib/site-data";

export default function DiscoverPage() {
  const [index, setIndex] = useState(0);
  const profile = PROFILES[index % PROFILES.length];

  const next = () => setIndex((i) => (i + 1) % PROFILES.length);

  return (
    <SiteLayout>
      <PageHero
        kicker="Discover"
        title="Swipe. Match. Meet."
        subtitle="Find people for dating, friends, or everything in between — then turn matches into real hangouts."
      />

      <section className="site-wrap grid gap-8 pb-16 lg:grid-cols-[1fr_360px]">
        <div className="relative mx-auto w-full max-w-md">
          <div className="overflow-hidden rounded-[2rem] border border-vibe-border bg-vibe-card shadow-[var(--shadow)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.image} alt={profile.name} className="aspect-[3/4] w-full object-cover" />
            <div className="space-y-3 p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl font-extrabold">
                  {profile.name}, {profile.age}
                </h2>
                <span className="text-sm font-semibold text-vibe-muted">{profile.city}</span>
              </div>
              <p className="text-sm leading-relaxed text-vibe-muted">{profile.bio}</p>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((t) => (
                  <span key={t} className="rounded-full bg-[#ede7ff] px-3 py-1 text-xs font-bold text-vibe-purple">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={next}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-vibe-border bg-white text-xl shadow-md"
              aria-label="Pass"
            >
              ✕
            </button>
            <button
              type="button"
              onClick={next}
              className="vibe-gradient flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white shadow-lg shadow-pink-500/30"
              aria-label="Like"
            >
              ♥
            </button>
            <button
              type="button"
              onClick={next}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-vibe-border bg-white text-xl shadow-md"
              aria-label="Super like"
            >
              ★
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-vibe-border bg-vibe-card p-5 shadow-[var(--shadow)]">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-vibe-faint">Modes</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Dating", "Friends", "Everyone"].map((m, i) => (
                <span
                  key={m}
                  className={`rounded-full px-3 py-1.5 text-sm font-bold ${
                    i === 0 ? "vibe-gradient text-white" : "bg-[#ede7ff] text-vibe-purple"
                  }`}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-vibe-border bg-vibe-card p-5 shadow-[var(--shadow)]">
            <p className="font-display text-lg font-bold">Matched? Chat next.</p>
            <p className="mt-2 text-sm text-vibe-muted">
              After a match, send one hello — then unlock free chat when they reply.
            </p>
            <Link href="/chats" className="mt-4 inline-flex text-sm font-bold text-vibe-purple">
              Open inbox →
            </Link>
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}
