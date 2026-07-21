import Link from "next/link";
import SiteLayout from "@/components/site/SiteLayout";
import PageHero from "@/components/site/PageHero";
import { HANGOUTS } from "@/lib/site-data";

export default function HangoutPage() {
  return (
    <SiteLayout>
      <PageHero
        kicker="Hangout"
        title="Plans happening near you"
        subtitle="Coffee, movies, sports — join in minutes or create your own plan for tonight."
        ctaHref="/hangout#create"
        ctaLabel="Create a plan"
      />

      <section className="site-wrap">
        <div className="flex flex-wrap gap-2">
          {["All", "Near You", "Today", "This Week"].map((f, i) => (
            <span
              key={f}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                i === 0 ? "bg-vibe-ink text-white" : "border border-vibe-border bg-white text-vibe-muted"
              }`}
            >
              {f}
            </span>
          ))}
        </div>
      </section>

      <section className="site-wrap grid gap-5 pb-16 md:grid-cols-2 lg:grid-cols-3">
        {HANGOUTS.map((h) => (
          <article
            key={h.id}
            className="overflow-hidden rounded-3xl border border-vibe-border bg-vibe-card shadow-[var(--shadow)]"
          >
            <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${h.image})` }} />
            <div className="p-5">
              <span className="rounded-full bg-[#ede7ff] px-2.5 py-1 text-[11px] font-bold text-vibe-purple">
                {h.tag}
              </span>
              <h2 className="font-display mt-3 text-xl font-bold">{h.title}</h2>
              <p className="mt-1 text-sm text-vibe-muted">{h.place}</p>
              <p className="mt-2 text-xs font-semibold text-vibe-faint">
                {h.time} · {h.going}/{h.slots} going
              </p>
              <button
                type="button"
                className="vibe-gradient mt-4 w-full rounded-2xl py-3 text-sm font-bold text-white"
              >
                Join hangout
              </button>
            </div>
          </article>
        ))}
      </section>

      <section id="create" className="site-wrap">
        <div className="rounded-[2rem] border border-vibe-border bg-gradient-to-br from-white to-[#f3e8ff] p-8 shadow-[var(--shadow)] sm:p-10">
          <h2 className="font-display text-2xl font-extrabold">Create a hangout plan</h2>
          <p className="mt-2 max-w-xl text-sm text-vibe-muted">
            Pick a vibe, set a place & time, invite people — your plan shows up on the map and in Hangout.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full bg-vibe-ink px-6 py-3 text-sm font-bold text-white"
          >
            Sign in to create
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
