import Link from "next/link";
import SiteLayout from "@/components/site/SiteLayout";
import PageHero from "@/components/site/PageHero";
import { HANGOUTS } from "@/lib/site-data";

const PINS = [
  { top: "28%", left: "42%", emoji: "☕", label: "Coffee" },
  { top: "48%", left: "58%", emoji: "🎬", label: "Movie" },
  { top: "62%", left: "35%", emoji: "🏸", label: "Sports" },
  { top: "38%", left: "68%", emoji: "🍕", label: "Food" },
];

export default function MapPage() {
  return (
    <SiteLayout>
      <PageHero
        kicker="Events Map"
        title="See the city light up"
        subtitle="Live hangouts on a zoomable city map — tap a pin, join a plan, create yours."
        ctaHref="/hangout"
        ctaLabel="Browse hangouts"
      />

      <section className="site-wrap">
        <div className="overflow-hidden rounded-[2rem] border border-vibe-border bg-vibe-card shadow-[var(--shadow)]">
          <div className="flex flex-wrap items-center gap-2 border-b border-vibe-border px-4 py-3 sm:px-5">
            <span className="rounded-full bg-vibe-ink px-3 py-1.5 text-xs font-bold text-white">Events</span>
            <span className="rounded-full bg-[#ede7ff] px-3 py-1.5 text-xs font-bold text-vibe-purple">People</span>
            <span className="ml-auto text-xs font-semibold text-vibe-muted">Nagpur · Live</span>
          </div>

          <div
            className="relative h-[420px] bg-cover bg-center sm:h-[520px]"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1400&q=80)",
            }}
          >
            <div className="absolute inset-0 bg-[#eee9f8]/35" />
            {PINS.map((p) => (
              <div
                key={p.label}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ top: p.top, left: p.left }}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-purple-500 to-pink-500 text-lg shadow-lg">
                  {p.emoji}
                </span>
                <span className="mt-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-vibe-ink shadow">
                  {p.label}
                </span>
              </div>
            ))}
          </div>

          <div className="grid gap-3 border-t border-vibe-border p-4 sm:grid-cols-3 sm:p-5">
            {HANGOUTS.map((h) => (
              <Link
                key={h.id}
                href="/hangout"
                className="rounded-2xl border border-vibe-border bg-white/80 p-3 hover:bg-white"
              >
                <p className="font-display text-sm font-bold">{h.title}</p>
                <p className="mt-1 text-xs text-vibe-muted">{h.place}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
