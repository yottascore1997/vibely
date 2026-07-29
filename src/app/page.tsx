"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowUpRight,
  Coffee,
  Music2,
  Plane,
  Dumbbell,
  Camera,
  Utensils,
  Users,
  Sparkles,
  MessageCircle,
  MapPin,
  Heart,
  Crown,
  ShieldCheck,
  Flame,
} from "lucide-react";
import SiteLayout from "@/components/site/SiteLayout";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const VIBES = [
  { icon: Coffee, label: "Coffee" },
  { icon: Music2, label: "Music" },
  { icon: Plane, label: "Travel" },
  { icon: Dumbbell, label: "Gym" },
  { icon: Camera, label: "Shoot" },
  { icon: Utensils, label: "Food" },
];

const MOMENTS = [
  {
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&q=80",
    icon: Flame,
    tag: "Tonight",
  },
  {
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&q=80",
    icon: Music2,
    tag: "Live",
  },
  {
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&q=80",
    icon: Coffee,
    tag: "Cafe",
  },
];

const FACES = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
];

const FLOW = [
  { icon: Users, label: "Profile" },
  { icon: Sparkles, label: "Discover" },
  { icon: MessageCircle, label: "Chat" },
  { icon: MapPin, label: "Meet" },
];

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.25]);

  return (
    <SiteLayout>
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[88vh] overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1800&q=80"
            alt=""
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05030c]/30 via-[#05030c]/55 to-[#05030c]" />
          <div className="aurora absolute -inset-24" />
        </motion.div>

        <motion.div
          style={{ opacity }}
          className="site-wrap relative flex min-h-[88vh] flex-col items-center justify-center pb-20 pt-24 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="icon-orb relative mb-8 h-14 w-14"
          >
            <Sparkles className="h-5 w-5" />
            <span className="pulse-ring absolute inset-0 rounded-full bg-violet-400/30" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(4.5rem,16vw,10rem)] font-medium leading-[0.85] text-white"
          >
            Hangora
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-5 text-sm font-medium tracking-[0.35em] text-violet-200/70 uppercase"
          >
            Meet · Hang · Belong
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.55 }}
            className="mt-10 flex items-center gap-3"
          >
            <Link
              href="/auth"
              className="purple-gradient inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[var(--shadow-purple)] transition hover:scale-110"
              aria-label="Join Hangora"
            >
              <ArrowUpRight className="h-5 w-5" strokeWidth={2.25} />
            </Link>
            <Link
              href="/discover"
              className="glass inline-flex h-14 w-14 items-center justify-center rounded-full text-violet-200 transition hover:border-violet-400/40 hover:text-white"
              aria-label="Discover"
            >
              <Heart className="h-5 w-5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ICON VIBES */}
      <section className="site-wrap -mt-6 pb-8">
        <div className="glass flex flex-wrap items-center justify-center gap-3 rounded-[28px] px-4 py-5 sm:gap-5">
          {VIBES.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.button
                key={v.label}
                type="button"
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fade}
                whileHover={{ y: -4, scale: 1.05 }}
                className="flex flex-col items-center gap-2 px-2"
              >
                <span className="icon-orb h-12 w-12">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="text-[10px] font-semibold tracking-wide text-vibe-muted uppercase">
                  {v.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* VISUAL MOMENTS */}
      <section className="site-wrap py-14 sm:py-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-4xl font-medium text-white sm:text-5xl">Tonight</h2>
          <Link href="/hangout" className="icon-orb h-11 w-11 transition hover:scale-110" aria-label="All hangouts">
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {MOMENTS.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.article
                key={m.tag}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fade}
                whileHover={{ y: -8 }}
                className={`group relative overflow-hidden rounded-[32px] border border-white/8 ${
                  i === 0 ? "md:row-span-1 min-h-[420px]" : "min-h-[320px] md:min-h-[420px]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05030c] via-[#05030c]/20 to-transparent" />
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <span className="icon-orb h-10 w-10 backdrop-blur-md">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="glass rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide text-white uppercase">
                    {m.tag}
                  </span>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* FACES — image first */}
      <section className="relative overflow-hidden py-14 sm:py-20">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="site-wrap relative">
          <div className="mb-10 flex items-center justify-center gap-3">
            <span className="icon-orb h-10 w-10">
              <Users className="h-4 w-4" />
            </span>
            <h2 className="font-display text-4xl font-medium text-white sm:text-5xl">Near you</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {FACES.map((src, i) => (
              <motion.div
                key={src}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fade}
                whileHover={{ y: -6 }}
                className={`relative overflow-hidden rounded-[28px] border border-violet-400/15 ${
                  i % 2 === 1 ? "float-soft-delay mt-6 lg:mt-10" : "float-soft"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-[3/4] w-full object-cover" />
                <button
                  type="button"
                  className="purple-gradient absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-[var(--shadow-purple)] transition hover:scale-110"
                  aria-label="Like"
                >
                  <Heart className="h-4 w-4 fill-white" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FLOW — icons only titles */}
      <section id="how" className="site-wrap py-14 sm:py-20">
        <div className="mx-auto mb-12 flex max-w-xs flex-col items-center text-center">
          <span className="icon-orb mb-4 h-12 w-12">
            <Sparkles className="h-5 w-5" />
          </span>
          <h2 className="font-display text-4xl font-medium text-white sm:text-5xl">Flow</h2>
        </div>

        <div className="relative grid grid-cols-2 gap-6 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-[8%] right-[8%] top-8 hidden h-px bg-gradient-to-r from-transparent via-violet-500/35 to-transparent lg:block" />
          {FLOW.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.label}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fade}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div className="icon-orb relative h-16 w-16">
                  <Icon className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <p className="text-xs font-semibold tracking-[0.2em] text-vibe-muted uppercase">
                  {step.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* PLUS — minimal */}
      <section className="site-wrap pb-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fade}
          className="relative overflow-hidden rounded-[36px] border border-violet-400/20 bg-gradient-to-br from-[#160b2e] to-[#0a0614] px-6 py-12 text-center sm:px-12"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.25),transparent_55%)]" />
          <div className="relative flex flex-col items-center">
            <span className="icon-orb mb-5 h-14 w-14">
              <Crown className="h-5 w-5 text-violet-200" />
            </span>
            <h2 className="font-display text-4xl font-medium text-white sm:text-5xl">Plus</h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <span className="icon-orb h-12 w-12" title="Who liked you">
                <Heart className="h-4 w-4" />
              </span>
              <span className="icon-orb h-12 w-12" title="Priority">
                <Flame className="h-4 w-4" />
              </span>
              <span className="icon-orb h-12 w-12" title="Verified">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
            <Link
              href="/auth"
              className="purple-gradient mt-10 inline-flex h-14 items-center gap-2 rounded-full px-8 text-sm font-semibold tracking-wide text-white shadow-[var(--shadow-purple)] transition hover:scale-[1.03]"
            >
              Unlock
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </SiteLayout>
  );
}
