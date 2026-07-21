"use client";

import { useState } from "react";
import SiteLayout from "@/components/site/SiteLayout";
import PageHero from "@/components/site/PageHero";
import { CHATS } from "@/lib/site-data";

const STATUSES = [
  { id: "lessgo", title: "Lessgo", color: "#16a34a", soft: "#dcfce7" },
  { id: "maybe", title: "Maybe", color: "#ca8a04", soft: "#fef9c3" },
  { id: "off", title: "Off grid", color: "#dc2626", soft: "#fee2e2" },
] as const;

export default function ChatsPage() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]["id"]>("lessgo");
  const [tab, setTab] = useState<"dms" | "hangouts">("dms");

  return (
    <SiteLayout>
      <PageHero
        kicker="Inbox"
        title="Messages & live status"
        subtitle="Direct DMs, hangout groups, and your energy — all in one premium inbox."
      />

      <section className="site-wrap space-y-6 pb-16">
        {/* Enhanced Live Status */}
        <div className="overflow-hidden rounded-[2rem] border border-vibe-border bg-vibe-card shadow-[var(--shadow)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-vibe-border px-5 py-4">
            <div>
              <p className="font-display text-lg font-extrabold">Live Status</p>
              <p className="text-sm text-vibe-muted">Tell friends if you&apos;re free right now</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Online now
            </span>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
            {STATUSES.map((s) => {
              const on = status === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(s.id)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    on ? "border-transparent shadow-md" : "border-vibe-border bg-white/70"
                  }`}
                  style={on ? { background: s.soft, boxShadow: `0 10px 28px ${s.color}22` } : undefined}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="h-10 w-10 rounded-full"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, white, ${s.color})`,
                        boxShadow: on ? `0 0 0 3px ${s.color}33` : undefined,
                      }}
                    />
                    <span>
                      <span className="block font-display text-base font-bold" style={{ color: s.color }}>
                        {s.title}
                      </span>
                      <span className="text-xs text-vibe-muted">
                        {s.id === "lessgo" ? "Free to hang" : s.id === "maybe" ? "Ask first" : "Do not disturb"}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Online people strip */}
        <div className="rounded-[2rem] border border-vibe-border bg-vibe-card p-5 shadow-[var(--shadow)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-extrabold">Online Status</p>
              <p className="text-sm text-vibe-muted">People active right now</p>
            </div>
            <span className="text-xs font-bold text-vibe-purple">{CHATS.filter((c) => c.online).length} live</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {CHATS.map((c) => (
              <div key={c.id} className="flex w-16 shrink-0 flex-col items-center gap-2">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-purple-300"
                  />
                  {c.online ? (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                  ) : null}
                </div>
                <span className="w-full truncate text-center text-[11px] font-semibold text-vibe-ink">
                  {c.name.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs + threads */}
        <div className="overflow-hidden rounded-[2rem] border border-vibe-border bg-vibe-card shadow-[var(--shadow)]">
          <div className="flex gap-2 border-b border-vibe-border p-3">
            {(
              [
                { key: "dms", label: "Direct DMs" },
                { key: "hangouts", label: "Hangouts" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold ${
                  tab === t.key ? "vibe-gradient text-white" : "bg-[#f3e8ff] text-vibe-purple"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <ul>
            {CHATS.filter((c) => (tab === "hangouts" ? c.name.includes("Hangout") : !c.name.includes("Hangout"))).map(
              (c, i, arr) => (
                <li
                  key={c.id}
                  className={`flex items-center gap-3 px-4 py-4 ${i < arr.length - 1 ? "border-b border-vibe-border" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt="" className="h-12 w-12 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-display font-bold">{c.name}</p>
                      <span className="text-[11px] font-semibold text-vibe-faint">{c.time}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-vibe-muted">{c.preview}</p>
                  </div>
                  {c.unread > 0 ? (
                    <span className="vibe-gradient flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white">
                      {c.unread}
                    </span>
                  ) : null}
                </li>
              )
            )}
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
}
