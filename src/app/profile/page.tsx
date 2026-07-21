import Link from "next/link";
import SiteLayout from "@/components/site/SiteLayout";
import PageHero from "@/components/site/PageHero";

export default function ProfilePage() {
  return (
    <SiteLayout>
      <PageHero
        kicker="Profile"
        title="Your Vibely identity"
        subtitle="Edit photos, interests, and preferences — the same profile that powers Discover & Hangout."
      />

      <section className="site-wrap grid gap-6 pb-16 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[2rem] border border-vibe-border bg-vibe-card p-6 text-center shadow-[var(--shadow)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"
            alt="You"
            className="mx-auto h-32 w-32 rounded-full object-cover ring-4 ring-purple-200"
          />
          <h2 className="font-display mt-4 text-2xl font-extrabold">Roshani</h2>
          <p className="text-sm text-vibe-muted">Nagpur · 24</p>
          <Link
            href="/login"
            className="vibe-gradient mt-5 inline-flex rounded-full px-5 py-2.5 text-sm font-bold text-white"
          >
            Edit profile
          </Link>
        </aside>

        <div className="space-y-4">
          {[
            { title: "About", body: "Coffee walks, indie music, weekend markets. Looking for real hangouts." },
            { title: "Interests", body: "Coffee · Art · Travel · Food · Movies" },
            { title: "Preferences", body: "Open to Dating & Friends · 5–25 km · Age 22–30" },
          ].map((b) => (
            <div key={b.title} className="rounded-3xl border border-vibe-border bg-vibe-card p-5 shadow-[var(--shadow)]">
              <h3 className="font-display text-lg font-bold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-vibe-muted">{b.body}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
