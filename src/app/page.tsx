"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Coffee,
  Clapperboard,
  Plane,
  UtensilsCrossed,
  Dumbbell,
  Music2,
  Camera,
  MapPin,
  Heart,
  Users,
  Sparkles,
  MessageCircleHeart,
  CalendarHeart,
  Check,
  Quote,
  Crown,
  Flame,
  Star,
  Shield,
} from "lucide-react";
import SiteLayout from "@/components/site/SiteLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.08,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const INTERESTS = [
  {
    icon: Coffee,
    label: "Coffee",
    count: "1.2K+",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=80",
  },
  {
    icon: Clapperboard,
    label: "Movies",
    count: "980+",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&q=80",
  },
  {
    icon: Plane,
    label: "Travel",
    count: "2.1K+",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&q=80",
  },
  {
    icon: UtensilsCrossed,
    label: "Dinner",
    count: "1.5K+",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80",
  },
  {
    icon: Dumbbell,
    label: "Gym",
    count: "760+",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=80",
  },
  {
    icon: Music2,
    label: "Music",
    count: "1.1K+",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80",
  },
  {
    icon: Camera,
    label: "Photos",
    count: "5K+",
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=200&q=80",
  },
];

const EVENTS = [
  {
    title: "Beach Bonfire Night",
    place: "Juhu Beach, Mumbai",
    meta: "Sat · 7:00 PM",
    going: "24 going",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",
  },
  {
    title: "Rooftop Acoustic",
    place: "Indiranagar, Bangalore",
    meta: "Tonight · 8:30 PM",
    going: "18 going",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&q=80",
  },
  {
    title: "Sunday Cycling Club",
    place: "Marine Drive, Mumbai",
    meta: "Sun · 6:00 AM",
    going: "31 going",
    image: "https://images.unsplash.com/photo-1541625601330-45acd7276d19?w=900&q=80",
  },
  {
    title: "Cafe Hop & Chat",
    place: "Koregaon Park, Pune",
    meta: "Fri · 5:00 PM",
    going: "12 going",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&q=80",
  },
];

const PEOPLE = [
  {
    name: "Rohan",
    age: 26,
    city: "Pune",
    tags: ["Travel", "Music"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=700&q=80",
  },
  {
    name: "Meher",
    age: 24,
    city: "Bangalore",
    tags: ["Art", "Coffee"],
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=700&q=80",
  },
  {
    name: "Kabir",
    age: 27,
    city: "Delhi",
    tags: ["Gym", "Food"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=80",
  },
  {
    name: "Aanya",
    age: 25,
    city: "Mumbai",
    tags: ["Movies", "Walks"],
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700&q=80",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Create Profile",
    desc: "Add photos, interests & your city vibe in minutes.",
    icon: Users,
  },
  {
    n: "02",
    title: "Discover People",
    desc: "Swipe through curated matches near you.",
    icon: Sparkles,
  },
  {
    n: "03",
    title: "Match & Chat",
    desc: "Start a conversation when the vibe is mutual.",
    icon: MessageCircleHeart,
  },
  {
    n: "04",
    title: "Meet Offline",
    desc: "Join hangouts and create real moments.",
    icon: CalendarHeart,
  },
];

const REVIEWS = [
  {
    quote: "I joined a coffee hangout and met my now-best friend. Vibely feels real, not fake.",
    name: "Priya S.",
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
  },
  {
    quote: "The events map is addictive. I found plans every weekend without awkward DMs.",
    name: "Arjun M.",
    city: "Bangalore",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
  },
  {
    quote: "Premium is worth it — seeing who liked me saved so much time. Clean and classy.",
    name: "Sana K.",
    city: "Delhi",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
  },
];

const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
];

const PERKS = [
  { icon: Flame, label: "Hot matches daily" },
  { icon: Shield, label: "Verified profiles" },
  { icon: Star, label: "Priority discovery" },
];

export default function HomePage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1516589178581-6cd1754035e0?w=1600&q=80"
            alt=""
            className="h-full w-full object-cover opacity-[0.12]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07070b] via-[#07070b]/85 to-[#07070b]" />
        </div>
        <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-vibe-pink/30 blur-[100px]" />
        <div className="pointer-events-none absolute -right-10 top-20 h-96 w-96 rounded-full bg-[#e8c547]/15 blur-[110px]" />

        <div className="site-wrap relative grid items-center gap-12 pb-16 pt-12 lg:grid-cols-2 lg:gap-16 lg:pb-24 lg:pt-16">
          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0}>
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold text-vibe-pink">
              <Sparkles className="h-3.5 w-3.5" />
              Meet people. Create memories.
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
              Find your vibe. Create real{" "}
              <span className="font-script pink-text text-5xl font-normal sm:text-6xl lg:text-7xl">
                connections
              </span>
              .
            </h1>

            <p className="mt-5 max-w-lg text-[15px] font-medium leading-relaxed text-vibe-muted sm:text-base">
              Discover amazing people nearby, join local events, and turn online matches into real-life hangouts.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth"
                className="pink-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[var(--shadow-pink)] transition hover:scale-[1.03]"
              >
                Join Vibely Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how"
                className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white transition hover:border-vibe-pink/40"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-vibe-pink/20 text-vibe-pink">
                  <Play className="h-3 w-3 fill-current" />
                </span>
                How it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {AVATARS.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="h-9 w-9 rounded-full border-2 border-[#07070b] object-cover"
                    />
                  ))}
                </div>
                <p className="text-sm font-semibold text-vibe-muted">
                  <span className="text-vibe-pink">20K+</span> already joined
                </p>
              </div>
              <div className="hidden h-8 w-px bg-white/10 sm:block" />
              <div className="flex gap-3">
                {PERKS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <span
                      key={p.label}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-vibe-muted"
                    >
                      <Icon className="h-3.5 w-3.5 text-vibe-gold" />
                      {p.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative mx-auto h-[440px] w-full max-w-md sm:h-[500px]"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="float-a absolute left-0 top-16 w-[42%] overflow-hidden rounded-[24px] border border-white/10 shadow-[var(--shadow)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80"
                alt=""
                className="aspect-[3/4] w-full object-cover"
              />
            </div>
            <div className="float-c absolute right-0 top-10 w-[42%] overflow-hidden rounded-[24px] border border-white/10 shadow-[var(--shadow)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&q=80"
                alt=""
                className="aspect-[3/4] w-full object-cover"
              />
            </div>
            <div className="float-b absolute left-1/2 top-0 z-10 w-[58%] -translate-x-1/2 overflow-hidden rounded-[28px] border-2 border-vibe-pink/40 shadow-[var(--shadow-pink)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700&q=80"
                alt="Ananya"
                className="aspect-[3/4] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-20 text-white">
                <p className="text-lg font-extrabold">Ananya, 24</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-white/85">
                  <MapPin className="h-3 w-3 text-vibe-pink" /> Mumbai
                </p>
              </div>
              <button
                type="button"
                className="pink-gradient absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg"
              >
                <Heart className="h-5 w-5 fill-white" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* INTERESTS */}
      <section className="border-y border-white/8 bg-black/30 py-8">
        <div className="site-wrap flex gap-3 overflow-x-auto pb-1">
          {INTERESTS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                type="button"
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -4, scale: 1.03 }}
                className="glass relative flex min-w-[132px] flex-1 shrink-0 flex-col items-center overflow-hidden rounded-2xl px-3 pb-4 pt-3"
              >
                <div className="relative mb-2 h-14 w-14 overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/35" />
                  <Icon className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" strokeWidth={2} />
                </div>
                <span className="text-sm font-bold text-white">{item.label}</span>
                <span className="mt-0.5 text-[11px] font-semibold text-vibe-pink">{item.count} people</span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* EVENTS */}
      <section className="site-wrap py-16 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-vibe-pink">Tonight & this week</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Popular Events Near You
            </h2>
          </div>
          <Link href="/events" className="hidden text-sm font-bold text-vibe-pink sm:inline-flex">
            View all events →
          </Link>
        </div>

        <div className="mt-8 flex gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
          {EVENTS.map((e, i) => (
            <motion.article
              key={e.title}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              className="relative min-w-[260px] overflow-hidden rounded-[28px] border border-white/10 shadow-[var(--shadow)] md:min-w-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.image} alt={e.title} className="h-80 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute left-3 top-3 flex gap-2">
                <span className="pink-gradient rounded-full px-2.5 py-1 text-[10px] font-bold text-white">
                  {e.going}
                </span>
                <span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                  {e.meta}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <h3 className="text-lg font-extrabold">{e.title}</h3>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-white/85">
                  <MapPin className="h-3 w-3 text-vibe-pink" /> {e.place}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* PEOPLE */}
      <section className="border-y border-white/8 bg-[#0c0c12]/80 py-16 sm:py-20">
        <div className="site-wrap">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-vibe-pink">Nearby vibes</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Discover Amazing People
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PEOPLE.map((p, i) => (
              <motion.article
                key={p.name}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                className="soft-card relative overflow-hidden p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} className="aspect-[4/5] w-full rounded-[20px] object-cover" />
                <div className="p-3 pt-4">
                  <h3 className="text-lg font-extrabold text-white">
                    {p.name}, {p.age}
                  </h3>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-vibe-muted">
                    <MapPin className="h-3 w-3 text-vibe-pink" /> {p.city}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-vibe-pink/30 bg-vibe-pink/10 px-2.5 py-1 text-[11px] font-bold text-vibe-pink"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="pink-gradient absolute bottom-6 right-5 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-[var(--shadow-pink)]"
                >
                  <Heart className="h-4 w-4 fill-white" />
                </button>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM */}
      <section className="site-wrap py-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="premium-glow relative overflow-hidden rounded-[32px] p-6 sm:p-10"
        >
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr_1fr]">
            <div>
              <span className="gold-gradient inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-black">
                <Crown className="h-3.5 w-3.5" /> Luxe Membership
              </span>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Vibely <span className="font-script text-4xl font-normal text-vibe-gold sm:text-5xl">Premium</span>
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-vibe-muted">
                Unlock unlimited likes, see who liked you, and get advanced filters for better matches.
              </p>
              <Link
                href="/auth"
                className="gold-gradient mt-6 inline-flex rounded-full px-6 py-3 text-sm font-bold text-black shadow-lg transition hover:scale-[1.03]"
              >
                Try Premium Now
              </Link>
            </div>

            <ul className="space-y-3">
              {["See who liked you", "Unlimited likes", "Advanced filters", "Priority in Discover"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm font-semibold text-white">
                  <span className="pink-gradient flex h-6 w-6 items-center justify-center rounded-full text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="relative mx-auto w-full max-w-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=700&q=80"
                alt="Couple"
                className="aspect-[4/3] w-full rounded-[24px] object-cover shadow-2xl ring-2 ring-vibe-pink/40"
              />
              <div className="glass absolute -bottom-3 left-4 right-4 rounded-2xl p-3">
                <p className="text-xs font-extrabold text-vibe-pink">It&apos;s a Match!</p>
                <p className="mt-0.5 text-[11px] text-vibe-muted">You and Aanya liked each other</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="site-wrap py-16 sm:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            How <span className="font-script pink-text text-4xl font-normal sm:text-5xl">Vibely</span> Works
          </h2>
          <p className="mt-2 text-sm font-medium text-vibe-muted">Four simple steps to real connections</p>
        </div>

        <div className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-10 hidden h-px border-t-2 border-dashed border-vibe-pink/30 lg:block" />
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
                <div className="pink-gradient mx-auto flex h-14 w-14 items-center justify-center rounded-full text-sm font-extrabold text-white shadow-[var(--shadow-pink)]">
                  {s.n}
                </div>
                <div className="icon-tile mx-auto mt-5 h-16 w-16">
                  <Icon className="h-7 w-7" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-vibe-muted">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-t border-white/8 bg-[#0c0c12]/80 py-16 sm:py-20">
        <div className="site-wrap">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              What People Are Saying
            </h2>
            <p className="mt-2 text-sm font-medium text-vibe-muted">Real stories from the Vibely community</p>
          </div>

          <div className="mt-10 flex gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
            {REVIEWS.map((r, i) => (
              <motion.article
                key={r.name}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="soft-card min-w-[280px] p-6 md:min-w-0"
              >
                <Quote className="h-7 w-7 text-vibe-pink" />
                <p className="mt-4 text-sm font-medium leading-relaxed text-white/90">&ldquo;{r.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.image}
                    alt={r.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-vibe-pink/40"
                  />
                  <div>
                    <p className="text-sm font-extrabold text-white">{r.name}</p>
                    <p className="text-xs font-medium text-vibe-pink">{r.city}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
