import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import { ViewModeProvider } from "@/context/ViewModeContext";

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "PRATYAKSH-Ω — Autonomous Negative Evidence Intelligence & Disaster Reality Reconstruction",
  description: "Autonomous disaster reality reconstruction analyzing negative evidence, silence, and information gaps across Central Nepal.",
};

import { CinematicNoise } from "@/components/CinematicNoise";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} ${inter.variable} dark h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#090B0E] text-[#F3F4F6]"
      >
        <ThemeProvider>
          <ViewModeProvider>
            <CinematicNoise />
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </ViewModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
