import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Great_Vibes } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: "Vibely — Find your vibe. Create real connections.",
    template: "%s · Vibely",
  },
  description:
    "Meet new people, join local events, and create real connections with Vibely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${greatVibes.variable} h-full`}>
      <body className="min-h-full bg-vibe-bg font-sans text-vibe-ink antialiased">{children}</body>
    </html>
  );
}
