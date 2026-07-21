import Link from "next/link";
import SiteLayout from "@/components/site/SiteLayout";
import PageHero from "@/components/site/PageHero";
import { EVENTS } from "@/lib/site-data";

export default function EventsPage() {
  return (
    <SiteLayout>
      <PageHero
        kicker="Events"
        title="Tonight’s hottest plans"
        subtitle="Browse curated events and spontaneous hangouts — then jump to the live map."
        ctaHref="/map"
        ctaLabel="Open Live Map"
      />

      <section className="site-wrap grid gap-6 pb-16 lg:grid-cols-3">
        {EVENTS.map((e) => (
          <article
            key={e.id}
            className="group relative min-h-[360px] overflow-hidden rounded-[2rem] border border-vibe-border shadow-[var(--shadow)]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${e.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">{e.city}</p>
              <h2 className="font-display mt-2 text-2xl font-extrabold">{e.title}</h2>
              <p className="mt-2 text-sm text-white/80">{e.time}</p>
              <Link
                href="/map"
                className="mt-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/25"
              >
                View on map
              </Link>
            </div>
          </article>
        ))}
      </section>
    </SiteLayout>
  );
}
