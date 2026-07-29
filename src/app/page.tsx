"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  MapPin,
  Heart,
  Users,
  Sparkles,
  MessageCircleHeart,
  CalendarHeart,
  Check,
  Quote,
  Crown,
  Shield,
  Zap,
} from "lucide-react";
import SiteLayout from "@/components/site/SiteLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const INTERESTS = [
  "Coffee runs",
  "Late-night walks",
  "Live music",
  "Weekend travel",
  "Gym buddies",
  "Food crawls",
  "Photo walks",
  "Game nights",
  "Rooftop hangs",
  "Sunrise cycles",
];

const HANGOUTS = [
  {
    title: "Neon Night Market",
    place: "Bandra, Mumbai",
    when: "Tonight · 8 PM",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&q=80",
  },
  {
    title: "Sunrise Cycle Crew",
    place: "Marine Drive",
    when: "Sun · 6 AM",
    image: "https://images.unsplash.com/photo-1541625601330-45acd7276d19?w=900&q=80",
  },
  {
    title: "Hidden Cafe Hop",
    place: "Koregaon Park",
    when: "Sat · 4 PM",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&q=80",
  },
];

const PEOPLE = [
  {
    name: "Aanya",
    age: 24,
    city: "Mumbai",
    vibe: "Spontaneous",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700&q=80",
  },
  {
    name: "Rohan",
    age: 26,
    city: "Pune",
    vibe: "Explorer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=700&q=80",
  },
  {
    name: "Meher",
    age: 24,
    city: "Bangalore",
    vibe: "Creative",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=700&q=80",
  },
  {
    name: "Kabir",
    age: 27,
    city: "Delhi",
    vibe: "Active",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=80",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Drop your vibe",
    desc: "Photos, interests, and the energy you bring into a room.",
    icon: Users,
  },
  {
    n: "02",
    title: "Find your circle",
    desc: "People and plans near you that actually match your mood.",
    icon: Sparkles,
  },
  {
    n: "03",
    title: "Spark a chat",
    desc: "Skip awkward openers — start with shared hangouts.",
    icon: MessageCircleHeart,
  },
  {
    n: "04",
    title: "Meet offline",
    desc: "Turn matches into nights you’ll remember.",
    icon: CalendarHeart,
  },
];

const REVIEWS = [
  {
    quote: "Joined a coffee hangout, left with a best friend. Hangora feels human.",
    name: "Priya S.",
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
  },
  {
    quote: "Every weekend now has a plan. No more doom-scrolling for company.",
    name: "Arjun M.",
    city: "Bangalore",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
  },
  {
    quote: "Premium showed me who liked me — clean, classy, worth it.",
    name: "Sana K.",
    city: "Delhi",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
  },
];

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.35]);

  return (
    <SiteLayout>
      {/* HERO — one composition, brand first */}
      <section ref={heroRef} className="relative min-h-[92vh] overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1800&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#06040f]/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#06040f]/40 via-[#06040f]/55 to-[#06040f]" />
          <div className="aurora absolute -inset-20 opacity-80" />
          <div className="hero-grid absolute inset-0" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="site-wrap relative flex min-h-[92vh] flex-col justify-end pb-16 pt-28 sm:pb-20 lg:justify-center lg:pb-24"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(3.5rem,12vw,9rem)] font-extrabold leading-[0.9] tracking-tight text-white"
          >
            Hangora
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-2xl font-display text-2xl font-bold leading-snug text-white/95 sm:text-3xl lg:text-4xl"
          >
            Meet. Hang. Belong.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="mt-4 max-w-md text-base font-medium leading-relaxed text-purple-100/80 sm:text-lg"
          >
            People nearby. Plans tonight. Real chemistry offline.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.34 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/auth"
              className="purple-gradient group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white shadow-[var(--shadow-purple)] transition hover:scale-[1.04]"
            >
              Start hanging
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how"
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-4 text-sm font-bold text-white transition hover:border-purple-400/50"
            >
              See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            className="mt-10 flex items-center gap-3 text-sm font-semibold text-purple-100/70"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-purple-400" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-purple-400" />
            </span>
            2.4k people hanging near you right now
          </motion.div>
        </motion.div>
      </section>

      {/* INTEREST MARQUEE */}
      <section className="relative overflow-hidden border-y border-white/8 bg-black/25 py-5">
        <div className="marquee-track flex gap-3">
          {[...INTERESTS, ...INTERESTS].map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="glass inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
            >
              <Zap className="h-3.5 w-3.5 text-vibe-purple" />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* HANGOUTS */}
      <section className="site-wrap py-16 sm:py-22">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="max-w-xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-vibe-purple">Live tonight</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Hangouts with a pulse
          </h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-vibe-muted sm:text-base">
            Spontaneous plans near you — no endless group chats required.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {HANGOUTS.map((h, i) => (
            <motion.article
              key={h.title}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              whileHover={{ y: -10 }}
              className="group relative min-h-[360px] overflow-hidden rounded-[28px] border border-purple-500/20"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={h.image}
                alt={h.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06040f] via-[#06040f]/35 to-transparent" />
              <div className="absolute left-4 top-4">
                <span className="purple-gradient rounded-full px-3 py-1 text-[11px] font-bold text-white">
                  {h.when}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-display text-xl font-extrabold text-white">{h.title}</h3>
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-purple-100/80">
                  <MapPin className="h-3 w-3 text-vibe-purple" /> {h.place}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* PEOPLE */}
      <section className="relative overflow-hidden border-y border-white/8 bg-[#0c0818]/90 py-16 sm:py-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[70%] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[100px]" />
        <div className="site-wrap relative">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-vibe-purple">Your city</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Faces with the same energy
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PEOPLE.map((p, i) => (
              <motion.article
                key={p.name}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                className="soft-card group relative overflow-hidden p-2.5"
              >
                <div className="relative overflow-hidden rounded-[22px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.name}
                    className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-16">
                    <p className="font-display text-lg font-extrabold text-white">
                      {p.name}, {p.age}
                    </p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-purple-100/80">
                      <MapPin className="h-3 w-3 text-vibe-purple" /> {p.city}
                    </p>
                  </div>
                  <span className="glass absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-purple-100">
                    {p.vibe}
                  </span>
                </div>
                <button
                  type="button"
                  className="purple-gradient absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-[var(--shadow-purple)] transition hover:scale-110"
                >
                  <Heart className="h-4 w-4 fill-white" />
                </button>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM */}
      <section className="site-wrap py-12 sm:py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="premium-glow relative overflow-hidden rounded-[36px] p-7 sm:p-12"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-purple-500/30 blur-3xl" />
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-300/30 bg-purple-400/15 px-3 py-1 text-[11px] font-bold text-purple-100">
                <Crown className="h-3.5 w-3.5" /> Hangora Plus
              </span>
              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                See who&apos;s into{" "}
                <span className="purple-text">your vibe</span>
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-vibe-muted sm:text-base">
                Unlimited likes, priority discovery, and filters that actually matter.
              </p>
              <Link
                href="/auth"
                className="purple-gradient mt-7 inline-flex rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[var(--shadow-purple)] transition hover:scale-[1.03]"
              >
                Unlock Plus
              </Link>
            </div>
            <ul className="space-y-3.5">
              {[
                "See who liked you",
                "Unlimited likes",
                "Advanced vibe filters",
                "Priority in Discover",
              ].map((f, i) => (
                <motion.li
                  key={f}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white"
                >
                  <span className="purple-gradient flex h-7 w-7 items-center justify-center rounded-full">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {f}
                </motion.li>
              ))}
              <li className="flex items-center gap-2 px-1 pt-1 text-xs font-semibold text-vibe-muted">
                <Shield className="h-3.5 w-3.5 text-vibe-purple" /> Verified profiles first
              </li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="site-wrap py-16 sm:py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            How <span className="purple-text">Hangora</span> works
          </h2>
          <p className="mt-3 text-sm font-medium text-vibe-muted">
            Four beats from lonely scroll to real plans
          </p>
        </div>

        <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-[10%] right-[10%] top-9 hidden h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent lg:block" />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.n}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative text-center"
              >
                <div className="purple-gradient mx-auto flex h-14 w-14 items-center justify-center rounded-full font-display text-sm font-extrabold text-white shadow-[var(--shadow-purple)]">
                  {s.n}
                </div>
                <div className="icon-tile mx-auto mt-5 h-16 w-16">
                  <Icon className="h-7 w-7" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 font-display text-lg font-extrabold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-vibe-muted">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* STORIES */}
      <section className="border-t border-white/8 bg-[#0c0818]/90 py-16 sm:py-20">
        <div className="site-wrap">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Stories from the circle
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <motion.article
                key={r.name}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="soft-card p-6"
              >
                <Quote className="h-7 w-7 text-vibe-purple" />
                <p className="mt-4 text-sm font-medium leading-relaxed text-white/90">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.image}
                    alt={r.name}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-purple-400/40"
                  />
                  <div>
                    <p className="text-sm font-extrabold text-white">{r.name}</p>
                    <p className="text-xs font-medium text-vibe-purple">{r.city}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-14 text-center"
          >
            <Link
              href="/auth"
              className="purple-gradient inline-flex items-center gap-2 rounded-full px-9 py-4 text-sm font-bold text-white shadow-[var(--shadow-purple)] transition hover:scale-[1.04]"
            >
              Join Hangora tonight
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
