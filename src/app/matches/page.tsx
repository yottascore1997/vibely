import Link from "next/link";
import SiteLayout from "@/components/site/SiteLayout";
import PageHero from "@/components/site/PageHero";
import { PROFILES } from "@/lib/site-data";

export default function MatchesPage() {
  return (
    <SiteLayout>
      <PageHero
        kicker="Matches"
        title="Your connections"
        subtitle="Matches and likes in one place — open a chat or keep discovering."
        ctaHref="/discover"
        ctaLabel="Keep discovering"
      />

      <section className="site-wrap">
        <div className="mb-6 flex gap-2">
          <span className="vibe-gradient rounded-full px-4 py-2 text-sm font-bold text-white">
            Matches ({PROFILES.length})
          </span>
          <span className="rounded-full bg-[#fce7f3] px-4 py-2 text-sm font-bold text-pink-600">Likes (8)</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROFILES.map((p) => (
            <article
              key={p.id}
              className="overflow-hidden rounded-3xl border border-vibe-border bg-vibe-card shadow-[var(--shadow)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} className="h-56 w-full object-cover" />
              <div className="p-5">
                <h2 className="font-display text-xl font-extrabold">
                  {p.name}, {p.age}
                </h2>
                <p className="mt-1 text-sm text-vibe-muted">{p.city}</p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href="/chats"
                    className="vibe-gradient flex-1 rounded-2xl py-2.5 text-center text-sm font-bold text-white"
                  >
                    Message
                  </Link>
                  <Link
                    href="/discover"
                    className="rounded-2xl border border-vibe-border bg-white px-4 py-2.5 text-sm font-bold"
                  >
                    View
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
