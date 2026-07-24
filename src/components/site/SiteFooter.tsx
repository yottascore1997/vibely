"use client";

import Link from "next/link";
import { Heart, Apple, Play } from "lucide-react";

const socials = [
  {
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.4.4.6.2 1 .5 1.5 1 .4.4.7.9 1 1.5.2.5.4 1.2.4 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.4-.2.6-.5 1-1 1.5-.4.4-.9.7-1.5 1-.5.2-1.2.4-2.4.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.4-.4-.6-.2-1-.5-1.5-1-.4-.4-.7-.9-1-1.5-.2-.5-.4-1.2-.4-2.4C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.4.2-.6.5-1 1-1.5.4-.4.9-.7 1.5-1 .5-.2 1.2-.4 2.4-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.2 0-3.5 0-4.8.1-1 .1-1.6.2-1.9.4-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.2.4-.3.9-.4 1.9-.1 1.2-.1 1.6-.1 4.8s0 3.5.1 4.8c.1 1 .2 1.6.4 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.4.2.9.3 1.9.4 1.2.1 1.6.1 4.8.1s3.5 0 4.8-.1c1-.1 1.6-.2 1.9-.4.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.2-.4.3-.9.4-1.9.1-1.2.1-1.6.1-4.8s0-3.5-.1-4.8c-.1-1-.2-1.6-.4-1.9-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.4-.2-.9-.3-1.9-.4-1.3-.1-1.6-.1-4.8-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 8.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zm6.4-8.3a1.2 1.2 0 1 1-2.3 0 1.2 1.2 0 0 1 2.3 0z",
  },
  {
    label: "X",
    path: "M18.2 2H21l-6.6 7.5L22 22h-6.2l-4.9-6.4L5.3 22H2.5l7-8L2 2h6.4l4.4 5.8L18.2 2zm-1.1 18h1.7L7 3.9H5.2L17.1 20z",
  },
  {
    label: "YouTube",
    path: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.8 15.5v-7l6.3 3.5-6.3 3.5z",
  },
  {
    label: "Facebook",
    path: "M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z",
  },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-[#050508]">
      <div className="site-wrap py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1.6fr_1fr]">
          <div>
            <h3 className="text-xl font-extrabold text-white">Stay in the loop</h3>
            <p className="mt-2 text-sm text-vibe-muted">
              Get hangout ideas, event drops & vibe tips in your inbox.
            </p>
            <form className="mt-5 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-vibe-faint focus:border-vibe-pink"
              />
              <button
                type="submit"
                className="pink-gradient shrink-0 rounded-full px-5 py-3 text-sm font-bold text-white shadow-[var(--shadow-pink)]"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              {
                title: "Vibely",
                links: [
                  { href: "/discover", label: "About" },
                  { href: "/auth", label: "Careers" },
                  { href: "/matches", label: "Press" },
                ],
              },
              {
                title: "Support",
                links: [
                  { href: "/auth", label: "Help Center" },
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/terms", label: "Terms & Conditions" },
                ],
              },
              {
                title: "Explore",
                links: [
                  { href: "/events", label: "Events" },
                  { href: "/hangout", label: "Hangouts" },
                  { href: "/travel", label: "Travel" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-sm font-extrabold text-white">{col.title}</p>
                <ul className="mt-3 space-y-2 text-sm text-vibe-muted">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="hover:text-vibe-pink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-extrabold text-white">Follow us</p>
            <div className="mt-3 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-vibe-muted transition hover:border-vibe-pink/50 hover:text-vibe-pink"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
            <p className="mt-5 text-sm font-extrabold text-white">Download App</p>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white px-4 py-2.5 text-xs font-bold text-black"
              >
                <Play className="h-3.5 w-3.5 fill-black" /> Google Play
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white"
              >
                <Apple className="h-3.5 w-3.5" /> App Store
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8 py-5">
        <div className="site-wrap flex flex-col items-center justify-between gap-3 text-xs text-vibe-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Vibely. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-vibe-pink">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-vibe-pink">
              Terms & Conditions
            </Link>
            <p className="inline-flex items-center gap-1">
              Made with <Heart className="h-3 w-3 fill-vibe-pink text-vibe-pink" /> for real connections
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
