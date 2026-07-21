"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, Sun, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/events", label: "Events" },
  { href: "/matches", label: "Matches" },
  { href: "/chats", label: "Messages", badge: 3 },
  { href: "/friends", label: "Blog" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#07070b]/75 backdrop-blur-2xl">
      <div className="site-wrap flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="pink-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-[var(--shadow-pink)]">
            <Heart className="h-4 w-4 fill-white" strokeWidth={0} />
          </span>
          <span className="text-[22px] font-extrabold tracking-tight text-white">Vibely</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  active ? "text-vibe-pink" : "text-vibe-muted hover:text-white"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {link.label}
                  {link.badge ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-vibe-pink px-1 text-[10px] font-bold text-white">
                      {link.badge}
                    </span>
                  ) : null}
                </span>
                {active ? (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-vibe-pink"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth"
            className="pink-gradient hidden rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-pink)] sm:inline-flex"
          >
            Join Now
          </Link>
          <Link
            href="/auth"
            className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white sm:inline-flex"
          >
            Login
          </Link>
          <button
            type="button"
            aria-label="Theme"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-vibe-muted md:inline-flex"
          >
            <Sun className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/8 bg-[#0c0c12] lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-white hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2 pb-2">
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/15 py-2.5 text-center text-sm font-bold text-white"
                >
                  Login
                </Link>
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="pink-gradient rounded-full py-2.5 text-center text-sm font-bold text-white"
                >
                  Join Now
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
