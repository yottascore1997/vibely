import Link from "next/link";

export default function PageHero({
  kicker,
  title,
  subtitle,
  ctaHref,
  ctaLabel,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="site-wrap pb-8 pt-12 sm:pt-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-vibe-pink">{kicker}</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-vibe-muted">{subtitle}</p>
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className="pink-gradient mt-7 inline-flex rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-[var(--shadow-pink)]"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </section>
  );
}
