"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it Works" },
  { href: "#safety", label: "Safety" },
  { href: "#stories", label: "Testimonials" },
  { href: "/hangout", label: "Blog" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100/80 bg-white/80 backdrop-blur-xl">
      <div className="site-wrap flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="purple-gradient flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow-[var(--shadow-purple)]">
            H
          </span>
<<<<<<< HEAD
          <span className="text-[22px] font-extrabold tracking-tight text-white">Hangora</span>
=======
          <span className="text-[22px] font-extrabold tracking-tight text-[#1a1030]">Hangora</span>
>>>>>>> d5f0b647e653ab5fcc1a6e0e71a516d1b5d5e807
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href || (link.href === "/" && pathname === "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  active ? "text-vibe-purple" : "text-[#6b6280] hover:text-[#1a1030]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth"
            className="purple-gradient hidden rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-purple)] transition hover:scale-[1.03] sm:inline-flex"
          >
            Download App
          </Link>
          <button
            type="button"
            aria-label="Menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-100 text-[#1a1030] lg:hidden"
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
            className="overflow-hidden border-t border-violet-100 bg-white lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-[#1a1030] hover:bg-violet-50"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                className="purple-gradient mt-2 rounded-full py-2.5 text-center text-sm font-bold text-white"
              >
                Download App
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
