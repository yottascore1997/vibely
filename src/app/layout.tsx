import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
<<<<<<< HEAD
    default: "Hangora — Find your vibe. Create real connections.",
    template: "%s · Hangora",
  },
  description:
    "Meet new people, join local events, and create real connections with Hangora.",
=======
    default: "Hangora — Meet Real People. Create Real Moments.",
    template: "%s · Hangora",
  },
  description:
    "Find people nearby for coffee, travel, movies, gym and more. Meet real people. Create real moments.",
>>>>>>> d5f0b647e653ab5fcc1a6e0e71a516d1b5d5e807
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
