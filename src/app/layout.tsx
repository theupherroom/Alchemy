import type { Metadata } from "next";
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://alchemy.theupherroom.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "alchemy — mission first. identity at the meeting.",
    template: "%s",
  },
  description:
    "A bias-blind strategic partnership platform. Meet other mission-driven leaders behind an alias. The first time names appear is at the meeting itself. A tool of The UpHer Room.",
  applicationName: "alchemy",
  keywords: [
    "strategic partnerships",
    "women-owned business",
    "mission-driven",
    "anonymous networking",
    "The UpHer Room",
  ],
  authors: [{ name: "The UpHer Room Inc." }],
  openGraph: {
    title: "alchemy",
    description: "Mission first. Identity at the meeting.",
    siteName: "alchemy",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "alchemy",
    description: "Mission first. Identity at the meeting.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
