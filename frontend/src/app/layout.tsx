import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import { ViewModeProvider } from "@/context/ViewModeContext";

/**
 * TYPOGRAPHY SYSTEM — PRATYAKSH-O
 *
 * Display/Headline: Plus Jakarta Sans
 *   - Geometric grotesque with military authority feel
 *   - Used: display hero, section headlines, card titles, labels, buttons
 *   - NOT for body prose, NOT for data/codes
 *
 * Body/Prose: DM Sans
 *   - Neutral, legible, distinct from headlines
 *   - Used: all paragraph body text, descriptions
 *   - NOT for data values, NOT for headlines
 *
 * Data/Mono: JetBrains Mono
 *   - Used STRICTLY for: telemetry values, coordinates, status codes,
 *     mathematical formulas, eyebrow labels
 *   - NOT for headlines, NOT for body prose, NOT for button labels
 *
 * Serif (Newsreader): Accent only
 *   - Used exclusively for the hero manifesto quote
 *   - Justified by the editorial/manifesto brief context
 */

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PRATYAKSH-O — Autonomous Negative Evidence Intelligence & Disaster Reality Reconstruction",
  description:
    "Autonomous disaster reality reconstruction analyzing negative evidence, silence, and information gaps across Central Nepal.",
  keywords: ["disaster awareness", "population accountability", "negative evidence", "crisis command"],
};

import { CinematicNoise } from "@/components/CinematicNoise";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import "lenis/dist/lenis.css";

import { Footer } from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${newsreader.variable} dark min-h-screen antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://server.arcgisonline.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://server.arcgisonline.com" />
        <link rel="dns-prefetch" href="https://basemaps.cartocdn.com" />
        <link rel="dns-prefetch" href="https://tile.opentopomap.org" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-primary)" }}
      >
        <ThemeProvider>
          <ViewModeProvider>
            <SmoothScrollProvider>
              <CinematicNoise />
              <Navbar />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
            </SmoothScrollProvider>
          </ViewModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
