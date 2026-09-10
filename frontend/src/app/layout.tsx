import type { Metadata } from "next";
import { Space_Grotesk, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import { ViewModeProvider } from "@/context/ViewModeContext";

/**
 * MISSION-CRITICAL COMMAND TYPOGRAPHY SYSTEM — PRATYAKSH-Ω
 *
 * 1. Display / Command Headings: Space Grotesk
 *    - Rigorous geometric grotesk with defense/aerospace authority
 *    - Custom tracking: -0.035em display, text-wrap: balance
 *    - Used for: hero titles, section headlines, operational badges
 *
 * 2. Body / Operational Prose: Geist
 *    - Swiss-modern technical grotesk designed for deep legibility
 *    - Optical sizing auto, line-height 1.625, measure capped at 65ch
 *    - Used for: all narrative copy, descriptions, explanatory notes
 *
 * 3. Telemetry & Data Systems: Geist Mono
 *    - Strict tabular figures (tabular-nums), uniform character widths
 *    - Used STRICTLY for: coordinates, seismic amplitudes, timestamps,
 *      telemetry deficit ratios, Bayesian probabilities
 */

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PRATYAKSH-Ω — Autonomous Negative Evidence Intelligence & Disaster Reality Reconstruction",
  description:
    "Autonomous disaster reality reconstruction analyzing negative evidence, silence, and information gaps across Central Nepal.",
  keywords: ["disaster awareness", "population accountability", "negative evidence", "crisis command"],
};

import { CinematicNoise } from "@/components/CinematicNoise";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import "lenis/dist/lenis.css";

import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${geist.variable} ${geistMono.variable} dark min-h-screen antialiased`}
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
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  );
}
