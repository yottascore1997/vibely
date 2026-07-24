import Link from "next/link";
import SiteLayout from "@/components/site/SiteLayout";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <SiteLayout>
      <article className="site-wrap py-12 sm:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-vibe-pink">Legal</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-vibe-muted">Last updated: {updated}</p>

        <div className="soft-card mt-10 space-y-8 p-6 text-sm leading-relaxed text-vibe-muted sm:p-10">
          {children}
        </div>

        <p className="mt-8 text-sm text-vibe-faint">
          Questions?{" "}
          <Link href="/auth" className="font-semibold text-vibe-pink hover:underline">
            Contact us
          </Link>{" "}
          ·{" "}
          <Link href="/privacy" className="hover:text-vibe-pink">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="hover:text-vibe-pink">
            Terms
          </Link>
        </p>
      </article>
    </SiteLayout>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-extrabold text-white">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
