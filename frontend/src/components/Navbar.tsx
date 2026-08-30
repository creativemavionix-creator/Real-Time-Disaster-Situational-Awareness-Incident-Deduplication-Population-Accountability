"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useViewMode } from "@/context/ViewModeContext";

export function Navbar() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const { isAnalysis, toggleMode } = useViewMode();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Live Map", href: "/gis-map" },
    { label: "Unified Truth", href: "/deduplication" },
    { label: "Blackout Intel", href: "/blackout-intel" },
    { label: "Population", href: "/population" },
    { label: "Dispatch", href: "/dispatch" },
    { label: "How It Works", href: "/#methodology" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-slate-950 dark:bg-slate-900 border border-slate-800 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <svg
              className="w-5 h-5 text-cyan-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
              <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
              <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
            </svg>
          </div>
          <div>
            <div className="font-display font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              PROJECT PRISM
              <span className="text-cyan-600 dark:text-cyan-400 text-xs font-mono">Ω</span>
            </div>
            <div className="font-mono text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase -mt-0.5">
              Disaster Intelligence & Situational Mapping
            </div>
          </div>
        </Link>

        {/* Center: Floating Pill Navigation */}
        <nav className="hidden lg:flex items-center bg-slate-100/90 dark:bg-slate-900/90 p-1 rounded-full border border-slate-200/80 dark:border-slate-800 shadow-inner">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions (Theme Toggle, SITREP Button, Explore CTA) */}
        <div className="flex items-center gap-2.5">
          {/* Dark / Light Mode Pill Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <>
                <span className="text-amber-400">☀️</span>
                <span className="hidden sm:inline text-[11px]">Light Mode</span>
              </>
            ) : (
              <>
                <span className="text-indigo-600 dark:text-indigo-400">🌙</span>
                <span className="hidden sm:inline text-[11px]">Dark Mode</span>
              </>
            )}
          </button>

          {/* SITREP Briefing Button */}
          <Link
            href="/sitrep"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 border border-cyan-200 dark:border-cyan-800 text-xs font-bold text-cyan-800 dark:text-cyan-300 transition-all shadow-xs"
          >
            <span className="text-cyan-600 dark:text-cyan-400">✨</span>
            <span>SITREP BRIEFING</span>
          </Link>

          {/* Primary Explore CTA */}
          <Link
            href="/gis-map"
            className="btn-primary-cyan text-xs py-1.5 px-4 shadow-sm"
          >
            <span>EXPLORE</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation Pill Bar */}
      <div className="lg:hidden px-4 pb-2.5 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#0088A9] text-white font-bold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
