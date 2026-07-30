"use client";

import Link from "next/link";
import { Apple, Play } from "lucide-react";

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
    <footer className="border-t border-violet-100 bg-white">
      <div className="site-wrap py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="purple-gradient flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold text-white">
                H
              </span>
              <span className="text-xl font-extrabold text-[#1a1030]">Hangora</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#6b6280]">
              Meet real people. Create real moments.
            </p>
            <div className="mt-4 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-100 bg-violet-50 text-[#6b6280] transition hover:border-violet-300 hover:text-vibe-purple"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: "Company",
              links: [
                { href: "/discover", label: "About" },
                { href: "/auth", label: "Careers" },
                { href: "/events", label: "Press" },
              ],
            },
            {
              title: "Support",
              links: [
                { href: "/auth", label: "Help Center" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/child-safety", label: "Child Safety" },
                { href: "/delete-account", label: "Delete Account" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-sm font-extrabold text-[#1a1030]">{col.title}</p>
              <ul className="mt-3 space-y-2 text-sm text-[#6b6280]">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-vibe-purple">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-sm font-extrabold text-[#1a1030]">Download</p>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a1030] px-4 py-2.5 text-xs font-bold text-white"
              >
                <Apple className="h-3.5 w-3.5" /> App Store
              </a>
              <a
                href="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-2.5 text-xs font-bold text-[#1a1030]"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> Google Play
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-violet-100 py-5">
        <div className="site-wrap flex flex-col items-center justify-between gap-2 text-xs text-[#9b93ad] sm:flex-row">
          <p>© {new Date().getFullYear()} Hangora. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-vibe-purple">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-vibe-purple">
              Terms & Conditions
            </Link>
            <Link href="/child-safety" className="hover:text-vibe-purple">
              Child Safety
            </Link>
            <Link href="/delete-account" className="hover:text-vibe-purple">
              Delete Account
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
