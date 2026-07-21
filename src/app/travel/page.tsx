import Link from "next/link";
import SiteLayout from "@/components/site/SiteLayout";
import PageHero from "@/components/site/PageHero";
import { TRAVELS } from "@/lib/site-data";

export default function TravelPage() {
  return (
    <SiteLayout>
      <PageHero
        kicker="Travel"
        title="Find your trip crew"
        subtitle="Weekend escapes, road trips, city hops — match with people going your way."
        ctaHref="/login"
        ctaLabel="Create travel plan"
      />

      <section className="site-wrap grid gap-6 pb-16 md:grid-cols-2">
        {TRAVELS.map((t) => (
          <article
            key={t.id}
            className="overflow-hidden rounded-[2rem] border border-vibe-border bg-vibe-card shadow-[var(--shadow)]"
          >
            <div className="h-56 bg-cover bg-center" style={{ backgroundImage: `url(${t.image})` }} />
            <div className="p-6">
              <h2 className="font-display text-2xl font-extrabold">{t.title}</h2>
              <p className="mt-2 text-sm text-vibe-muted">
                {t.dates} · {t.seats}
              </p>
              <Link
                href="/login"
                className="mt-5 inline-flex rounded-full bg-[#dbeafe] px-5 py-2.5 text-sm font-bold text-blue-700"
              >
                Request to join
              </Link>
            </div>
          </article>
        ))}
      </section>
    </SiteLayout>
  );
}
