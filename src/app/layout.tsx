import type { Metadata } from "next";
import { Outfit, Syne, Great_Vibes } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: "Hangora — Meet. Hang. Belong.",
    template: "%s · Hangora",
  },
  description:
    "Hangora helps you meet people nearby, join spontaneous hangouts, and turn vibes into real plans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${syne.variable} ${greatVibes.variable} h-full`}
    >
      <body className="min-h-full bg-vibe-bg font-sans text-vibe-ink antialiased">{children}</body>
    </html>
  );
}
