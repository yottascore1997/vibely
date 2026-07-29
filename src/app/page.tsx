"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Apple,
  Play,
  Heart,
  Coffee,
  Plane,
  Clapperboard,
  Dumbbell,
  UtensilsCrossed,
  Gamepad2,
  BookOpen,
  Mountain,
  Footprints,
  Camera,
  ShieldCheck,
  Lock,
  MapPinned,
  EyeOff,
  Star,
  Users,
  Handshake,
  Binoculars,
  Check,
} from "lucide-react";
import SiteLayout from "@/components/site/SiteLayout";

const fade = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const FLOAT_ICONS = [
  { icon: Coffee, color: "from-amber-400 to-orange-500", pos: "left-2 top-16 float-a", size: "h-14 w-14" },
  { icon: Plane, color: "from-sky-400 to-blue-500", pos: "right-4 top-10 float-b", size: "h-14 w-14" },
  { icon: Clapperboard, color: "from-violet-400 to-purple-600", pos: "left-0 bottom-28 float-c", size: "h-12 w-12" },
  { icon: Dumbbell, color: "from-rose-400 to-pink-500", pos: "right-0 bottom-24 float-a", size: "h-12 w-12" },
  { icon: Camera, color: "from-fuchsia-400 to-pink-500", pos: "right-8 top-1/2 float-b", size: "h-11 w-11" },
  { icon: UtensilsCrossed, color: "from-lime-400 to-green-500", pos: "left-6 top-1/2 float-c", size: "h-11 w-11" },
];

const ACTIVITIES = [
  { icon: Coffee, label: "Coffee Date", tint: "bg-amber-50 text-amber-600" },
  { icon: Plane, label: "Travel Buddy", tint: "bg-sky-50 text-sky-600" },
  { icon: Clapperboard, label: "Movie Night", tint: "bg-violet-50 text-violet-600" },
  { icon: Dumbbell, label: "Gym Partner", tint: "bg-rose-50 text-rose-600" },
  { icon: UtensilsCrossed, label: "Food Explorer", tint: "bg-orange-50 text-orange-600" },
  { icon: Gamepad2, label: "Gaming", tint: "bg-indigo-50 text-indigo-600" },
  { icon: BookOpen, label: "Study Partner", tint: "bg-emerald-50 text-emerald-600" },
  { icon: Mountain, label: "Weekend Trips", tint: "bg-teal-50 text-teal-600" },
  { icon: Footprints, label: "Walking Buddy", tint: "bg-pink-50 text-pink-600" },
  { icon: Camera, label: "Photography", tint: "bg-fuchsia-50 text-fuchsia-600" },
];

const STEPS = [
  {
    n: "01",
    title: "Discover",
    desc: "Find people nearby who match your vibe and interests.",
    icon: Binoculars,
  },
  {
    n: "02",
    title: "Connect",
    desc: "Send a request and start chatting instantly.",
    icon: Users,
  },
  {
    n: "03",
    title: "Meet",
    desc: "Plan, meet up, and create real moments.",
    icon: Handshake,
  },
];

const STATS = [
  { value: "100K+", label: "Members" },
  { value: "500K+", label: "Meetups" },
  { value: "120+", label: "Cities" },
  { value: "98%", label: "Positive" },
];

const SAFETY = [
  { icon: ShieldCheck, title: "Verified Profiles", desc: "Real people, real photos." },
  { icon: MapPinned, title: "Location Control", desc: "Share only when you want." },
  { icon: Lock, title: "Secure Chat", desc: "Private & encrypted messaging." },
  { icon: EyeOff, title: "Privacy First", desc: "You own your data always." },
];

const REVIEWS = [
  {
    quote: "Met my travel buddy for Goa in two days. Hangora just works.",
    name: "Priya S.",
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
  },
  {
    quote: "Coffee hangouts every weekend. Feels safe and genuine.",
    name: "Arjun M.",
    city: "Bangalore",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
  },
  {
    quote: "Finally an app for real plans, not endless swiping.",
    name: "Sana K.",
    city: "Delhi",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
  },
];

const NEARBY = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80",
];

const PHONE_PROFILES = [
  {
    name: "Aanya, 24",
    tag: "Coffee",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  },
  {
    name: "Rohan, 26",
    tag: "Travel",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  },
];

export default function HomePage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden pb-10 pt-10 lg:pb-16 lg:pt-14">
        <div className="site-wrap grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <motion.div initial="hidden" animate="show" variants={fade} custom={0}>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3.5 py-1.5 text-xs font-bold text-vibe-purple shadow-sm">
              <Heart className="h-3.5 w-3.5 fill-vibe-purple" />
              Meet. Connect. Hangout.
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.12] tracking-tight text-[#1a1030] sm:text-5xl lg:text-[3.4rem]">
              Meet <span className="grad-text">Real People.</span>
              <br />
              Create <span className="grad-text">Real Moments.</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] font-medium leading-relaxed text-[#6b6280]">
              Find people nearby for coffee, travel, movies, gym and more — then turn chats into real hangouts.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth"
                className="purple-gradient inline-flex items-center rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[var(--shadow-purple)] transition hover:scale-[1.03]"
              >
                Download App
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border-2 border-violet-200 bg-white px-6 py-3.5 text-sm font-bold text-[#1a1030] transition hover:border-violet-400"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-vibe-purple">
                  <Play className="h-3 w-3 fill-current" />
                </span>
                Explore Hangora
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href="/auth"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1a1030] px-4 py-2.5 text-xs font-bold text-white"
              >
                <Apple className="h-3.5 w-3.5" /> App Store
              </a>
              <a
                href="/auth"
                className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-xs font-bold text-[#1a1030]"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> Google Play
              </a>
            </div>
          </motion.div>

          {/* Phone + floating icons */}
          <motion.div
            className="relative mx-auto h-[520px] w-full max-w-md"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            {FLOAT_ICONS.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.color + f.pos}
                  className={`absolute z-20 ${f.pos} ${f.size} ${f.size.includes("14") ? "" : ""}`}
                >
                  <div
                    className={`icon-3d ${f.size} bg-gradient-to-br ${f.color} text-white shadow-lg`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                </div>
              );
            })}

            <div className="absolute bottom-6 left-1/2 h-8 w-[70%] -translate-x-1/2 rounded-[100%] bg-violet-400/30 blur-2xl" />
            <div className="absolute left-1/2 top-8 z-10 w-[230px] -translate-x-1/2 sm:w-[250px]">
              <div className="phone-frame">
                <div className="phone-notch" />
                <div className="overflow-hidden rounded-[28px] bg-[#faf8ff]">
                  <div className="flex items-center justify-between px-4 pb-2 pt-3">
                    <p className="text-xs font-extrabold text-[#1a1030]">Nearby</p>
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-vibe-purple">
                      Live
                    </span>
                  </div>
                  <div className="space-y-2.5 px-3 pb-4">
                    {PHONE_PROFILES.map((p) => (
                      <div key={p.name} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt="" className="h-28 w-full object-cover" />
                        <div className="flex items-center justify-between px-3 py-2">
                          <div>
                            <p className="text-xs font-extrabold text-[#1a1030]">{p.name}</p>
                            <p className="text-[10px] font-semibold text-vibe-purple">{p.tag}</p>
                          </div>
                          <span className="purple-gradient flex h-7 w-7 items-center justify-center rounded-full text-white">
                            <Heart className="h-3 w-3 fill-white" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PEOPLE AROUND YOU */}
      <section id="features" className="site-wrap py-14 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fade}
          className="text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1a1030] sm:text-4xl">
            People Around You <span className="grad-text">Right Now.</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fade}
          custom={1}
          className="relative mt-10 overflow-hidden rounded-[32px] map-glow p-6 sm:p-10"
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(167,139,250,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.35) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <svg className="absolute inset-0 h-full w-full opacity-40" aria-hidden>
            <line x1="20%" y1="35%" x2="45%" y2="50%" stroke="#c4b5fd" strokeWidth="2" />
            <line x1="45%" y1="50%" x2="70%" y2="30%" stroke="#f0abfc" strokeWidth="2" />
            <line x1="45%" y1="50%" x2="75%" y2="65%" stroke="#a78bfa" strokeWidth="2" />
            <line x1="20%" y1="35%" x2="30%" y2="70%" stroke="#ddd6fe" strokeWidth="2" />
          </svg>

          <div className="relative mx-auto flex h-[280px] max-w-3xl items-center justify-center sm:h-[320px]">
            {[
              { top: "18%", left: "18%" },
              { top: "22%", left: "68%" },
              { top: "48%", left: "42%" },
              { top: "62%", left: "22%" },
              { top: "58%", left: "72%" },
            ].map((pos, i) => (
              <div
                key={NEARBY[i]}
                className="absolute"
                style={{ top: pos.top, left: pos.left }}
              >
                <span className="absolute -inset-2 animate-ping rounded-full bg-violet-400/30" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={NEARBY[i]}
                  alt=""
                  className="relative h-12 w-12 rounded-full border-2 border-white object-cover shadow-lg sm:h-14 sm:w-14"
                />
              </div>
            ))}

            <div className="glass absolute bottom-2 left-2 max-w-[240px] rounded-2xl p-3 shadow-xl sm:left-6 sm:bottom-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={NEARBY[0]}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-[#1a1030]">Wants coffee ☕</p>
                  <p className="text-[11px] font-semibold text-vibe-purple">1.2 km away</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ACTIVITIES */}
      <section className="bg-white/60 py-14 sm:py-20">
        <div className="site-wrap">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1a1030] sm:text-4xl">
              What Do You Feel Like <span className="grad-text">Today?</span>
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
            {ACTIVITIES.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.button
                  key={a.label}
                  type="button"
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={fade}
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="soft-card flex flex-col items-center gap-3 px-3 py-5"
                >
                  <span className={`icon-3d h-14 w-14 ${a.tint}`}>
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <span className="text-center text-xs font-bold text-[#1a1030] sm:text-sm">
                    {a.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="site-wrap py-14 sm:py-20">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1a1030] sm:text-4xl">
            How <span className="grad-text">Hangora</span> Works
          </h2>
        </div>

        <div className="relative mt-12 grid gap-8 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-8 hidden h-0.5 bg-gradient-to-r from-violet-200 via-fuchsia-200 to-violet-200 md:block" />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.n}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fade}
                className="relative text-center"
              >
                <div className="purple-gradient mx-auto flex h-14 w-14 items-center justify-center rounded-full text-sm font-extrabold text-white shadow-[var(--shadow-purple)]">
                  {s.n}
                </div>
                <div className="icon-3d mx-auto mt-5 h-20 w-20 text-vibe-purple">
                  <Icon className="h-9 w-9" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-xl font-extrabold text-[#1a1030]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6b6280]">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* STATS */}
      <section className="cta-banner py-10 text-white shadow-[var(--shadow-purple)]">
        <div className="site-wrap grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm font-semibold text-violet-100">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SAFETY */}
      <section id="safety" className="site-wrap py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1a1030] sm:text-4xl">
              We&apos;ve Got Your <span className="grad-text">Back.</span>
            </h2>
            <ul className="mt-8 space-y-4">
              {SAFETY.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.li
                    key={item.title}
                    custom={i}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={fade}
                    className="soft-card flex items-start gap-4 p-4"
                  >
                    <span className="icon-3d h-12 w-12 shrink-0 text-vibe-purple">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-extrabold text-[#1a1030]">{item.title}</p>
                      <p className="mt-0.5 text-sm text-[#6b6280]">{item.desc}</p>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fade}
            className="relative mx-auto flex h-[340px] w-full max-w-md items-center justify-center"
          >
            <div className="absolute h-56 w-56 rounded-full bg-violet-300/40 blur-3xl" />
            <div className="purple-gradient relative flex h-48 w-48 items-center justify-center rounded-[40px] shadow-[var(--shadow-purple)] rotate-6">
              <ShieldCheck className="h-24 w-24 text-white" strokeWidth={1.5} />
              <span className="absolute -bottom-3 -right-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-vibe-purple shadow-lg">
                <Check className="h-7 w-7" strokeWidth={3} />
              </span>
            </div>
            <span className="icon-3d absolute left-6 top-8 h-12 w-12 float-a text-vibe-purple">
              <Lock className="h-5 w-5" />
            </span>
            <span className="icon-3d absolute right-8 bottom-10 h-12 w-12 float-b text-vibe-purple">
              <MapPinned className="h-5 w-5" />
            </span>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="stories" className="bg-white/70 py-14 sm:py-20">
        <div className="site-wrap">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1a1030] sm:text-4xl">
              What Our Community <span className="grad-text">Says.</span>
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <motion.article
                key={r.name}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fade}
                className="soft-card p-6"
              >
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm font-medium leading-relaxed text-[#3d3554]">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.image}
                    alt={r.name}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-violet-200"
                  />
                  <div>
                    <p className="text-sm font-extrabold text-[#1a1030]">{r.name}</p>
                    <p className="text-xs font-semibold text-vibe-purple">{r.city}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="site-wrap py-14 sm:py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fade}
          className="cta-banner relative overflow-hidden rounded-[36px] px-6 py-12 text-white sm:px-12"
        >
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_auto_1fr]">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Download Hangora & Start Your Journey.
              </h2>
              <div className="mt-6 flex flex-wrap gap-2">
                <a
                  href="/auth"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#1a1030]"
                >
                  <Apple className="h-3.5 w-3.5" /> App Store
                </a>
                <a
                  href="/auth"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-bold text-white"
                >
                  <Play className="h-3.5 w-3.5 fill-current" /> Google Play
                </a>
              </div>
            </div>

            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl bg-white p-3 shadow-xl">
              <div
                className="h-full w-full rounded-lg"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg,#1a1030 0 2px,transparent 2px 4px), repeating-linear-gradient(90deg,#1a1030 0 2px,transparent 2px 4px)",
                  backgroundSize: "8px 8px",
                }}
                aria-label="QR code"
              />
            </div>

            <div className="relative mx-auto hidden h-48 w-56 lg:block">
              <div className="phone-frame absolute left-0 top-4 w-28 rotate-[-8deg] scale-90">
                <div className="overflow-hidden rounded-[22px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=80"
                    alt=""
                    className="aspect-[9/16] w-full object-cover"
                  />
                </div>
              </div>
              <div className="phone-frame absolute right-0 top-0 w-28 rotate-[8deg]">
                <div className="overflow-hidden rounded-[22px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80"
                    alt=""
                    className="aspect-[9/16] w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </SiteLayout>
  );
}
