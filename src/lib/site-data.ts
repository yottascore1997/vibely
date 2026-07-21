export const NAV_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/hangout", label: "Hangout" },
  { href: "/events", label: "Events" },
  { href: "/map", label: "Map" },
  { href: "/travel", label: "Travel" },
  { href: "/friends", label: "Friends" },
  { href: "/chats", label: "Chats" },
] as const;

export const FEATURES = [
  {
    id: "discover",
    title: "Discover",
    href: "/discover",
    emoji: "💖",
    blurb: "Swipe, match, and start real conversations with people near you.",
    colors: ["#ec4899", "#f43f5e"],
  },
  {
    id: "hangout",
    title: "Hangout",
    href: "/hangout",
    emoji: "☕",
    blurb: "Join coffee, movies, sports — plans happening tonight in your city.",
    colors: ["#8b5cf6", "#a855f7"],
  },
  {
    id: "events",
    title: "Events",
    href: "/events",
    emoji: "📅",
    blurb: "Browse curated hangouts and spontaneous events near you.",
    colors: ["#d4af37", "#b8860b"],
  },
  {
    id: "map",
    title: "Events Map",
    href: "/map",
    emoji: "🗺️",
    blurb: "See live plans on a city map — zoom, pan, tap to join.",
    colors: ["#14b8a6", "#0d9488"],
  },
  {
    id: "friends",
    title: "Friends",
    href: "/friends",
    emoji: "🤝",
    blurb: "Share your energy — Lessgo, Maybe, or Off grid — and invite friends.",
    colors: ["#22c55e", "#16a34a"],
  },
  {
    id: "travel",
    title: "Travel",
    href: "/travel",
    emoji: "✈️",
    blurb: "Find travel partners and trip vibes for your next city hop.",
    colors: ["#3b82f6", "#2563eb"],
  },
  {
    id: "chats",
    title: "Chats",
    href: "/chats",
    emoji: "💬",
    blurb: "DMs and hangout groups — coordinate plans in one inbox.",
    colors: ["#8b5cf6", "#ec4899"],
  },
  {
    id: "matches",
    title: "Matches",
    href: "/matches",
    emoji: "✨",
    blurb: "Your matches and likes in one premium place.",
    colors: ["#ec4899", "#8b5cf6"],
  },
] as const;

export const HANGOUTS = [
  {
    id: "1",
    title: "Sunset Coffee Walk",
    place: "Civil Lines, Nagpur",
    time: "Today · 5:30 PM",
    going: 4,
    slots: 6,
    tag: "Coffee",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
  },
  {
    id: "2",
    title: "Indie Movie Night",
    place: "PVR, Mumbai",
    time: "Tomorrow · 8:00 PM",
    going: 3,
    slots: 5,
    tag: "Movie",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
  },
  {
    id: "3",
    title: "Badminton Doubles",
    place: "Decathlon, Pune",
    time: "Sat · 7:00 AM",
    going: 2,
    slots: 4,
    tag: "Sports",
    image:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
  },
];

export const EVENTS = [
  {
    id: "e1",
    title: "Rooftop Acoustic Evening",
    city: "Bangalore",
    time: "Tonight · 7 PM",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&q=80",
  },
  {
    id: "e2",
    title: "Street Food Trail",
    city: "Delhi",
    time: "Sun · 6 PM",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&q=80",
  },
  {
    id: "e3",
    title: "Lake Cycle Meetup",
    city: "Hyderabad",
    time: "Sat · 6 AM",
    image:
      "https://images.unsplash.com/photo-1541625601330-45acd7276d19?w=900&q=80",
  },
];

export const PROFILES = [
  {
    id: "p1",
    name: "Aanya",
    age: 24,
    city: "Mumbai",
    bio: "Coffee first, plans later. Always down for a sunset walk.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
    tags: ["Coffee", "Art", "Travel"],
  },
  {
    id: "p2",
    name: "Kabir",
    age: 27,
    city: "Pune",
    bio: "Weekend rides & rooftop music. Looking for real hangouts.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
    tags: ["Bike", "Music", "Food"],
  },
  {
    id: "p3",
    name: "Meher",
    age: 25,
    city: "Bangalore",
    bio: "Design nerd. Weekend markets & indie cafés.",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
    tags: ["Design", "Markets", "Tea"],
  },
];

export const CHATS = [
  {
    id: "c1",
    name: "Aanya",
    preview: "That café sounded perfect — 5:30?",
    time: "2m",
    unread: 2,
    online: true,
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  },
  {
    id: "c2",
    name: "Hangout · Movie Crew",
    preview: "Kabir: Seats booked 🍿",
    time: "18m",
    unread: 0,
    online: false,
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&q=80",
  },
  {
    id: "c3",
    name: "Meher",
    preview: "You: See you at the market!",
    time: "1h",
    unread: 0,
    online: true,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80",
  },
];

export const TRAVELS = [
  {
    id: "t1",
    title: "Goa Weekend Escape",
    dates: "Aug 22–24",
    seats: "2 open",
    image:
      "https://images.unsplash.com/photo-1512343879784-a96011150577?w=900&q=80",
  },
  {
    id: "t2",
    title: "Manali Road Trip",
    dates: "Sep 5–9",
    seats: "3 open",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
  },
];
