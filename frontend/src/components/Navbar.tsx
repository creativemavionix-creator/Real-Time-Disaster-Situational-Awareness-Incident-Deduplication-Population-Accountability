"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

interface NavPillar {
  id: string;
  code: string;
  label: string;
  primaryHref: string;
  subRoutes?: {
    label: string;
    href: string;
    description: string;
  }[];
}

const NAV_PILLARS: NavPillar[] = [
  {
    id: "situation",
    code: "01",
    label: "Situation",
    primaryHref: "/",
    subRoutes: [
      { label: "Overview", href: "/", description: "Executive briefing & crisis narrative" },
      { label: "Live Map", href: "/gis-map", description: "Geospatial radar & vector cartography" },
    ],
  },
  {
    id: "intelligence",
    code: "02",
    label: "Intelligence",
    primaryHref: "/deduplication",
    subRoutes: [
      { label: "Unified Truth", href: "/deduplication", description: "Reconciled multi-agency incident ledger" },
      { label: "Blackout Risk", href: "/blackout-intel", description: "Inferred risk in silent mountain sectors" },
      { label: "Population", href: "/population", description: "Exposed people & 2021 Census palikas" },
    ],
  },
  {
    id: "response",
    code: "03",
    label: "Response",
    primaryHref: "/dispatch",
    subRoutes: [
      { label: "Tactical Dispatch", href: "/dispatch", description: "Priority rescue & resource allocation" },
    ],
  },
  {
    id: "report",
    code: "04",
    label: "Report",
    primaryHref: "/sitrep",
    subRoutes: [
      { label: "SITREP Briefing", href: "/sitrep", description: "Standardized UN OCHA situational report" },
    ],
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const [activeHover, setActiveHover] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F5]/90 dark:bg-[#0C0E12]/90 backdrop-blur-md border-b border-[#E5E4DC] dark:border-[#232733] select-none transition-colors duration-200">
      {/* Top Ambient Operational Status Bar */}
      <div className="bg-[#F2F0E8]/80 dark:bg-[#13161D]/80 border-b border-[#E5E4DC]/60 dark:border-[#232733]/60 px-4 sm:px-8 py-1.5 flex items-center justify-between text-[11px] font-mono-data text-[#5C6270] dark:text-[#9CA3AF]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
            <span className="text-[#111318] dark:text-[#F4F4F0] font-bold tracking-wider">
              CENTRAL NEPAL CRISIS PROTOCOL
            </span>
          </div>
          <span className="text-[#E5E4DC] dark:text-[#232733] hidden md:inline">|</span>
          <span className="hidden md:inline">M7.8 Seismological Sequence</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span>STATUS:</span>
            <strong className="text-[#D97706] dark:text-[#FBBF24]">6/8 SECTORS ACTIVE</strong>
          </div>
          <span className="hidden sm:inline text-[#E5E4DC] dark:text-[#232733]">|</span>
          <span className="hidden sm:inline">NEOC CRISIS COMMAND</span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-6">
        {/* Brand Lockup */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12] flex items-center justify-center font-mono-data font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
            Ω
          </div>
          <div>
            <div className="font-display-calm font-bold text-base sm:text-lg text-[#111318] dark:text-[#F4F4F0] tracking-tight flex items-center gap-2">
              PROJECT PRISM
            </div>
            <div className="font-mono-data text-[10px] text-[#5C6270] dark:text-[#9CA3AF] tracking-wider uppercase -mt-0.5">
              Calm Crisis Intelligence
            </div>
          </div>
        </Link>

        {/* Center: 4 Primary Operational Pillars */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_PILLARS.map((pillar) => {
            const isPillarActive = pillar.subRoutes?.some((r) => r.href === pathname) || pillar.primaryHref === pathname;
            const hasMultiple = (pillar.subRoutes?.length || 0) > 1;

            return (
              <div
                key={pillar.id}
                className="relative"
                onMouseEnter={() => hasMultiple && setActiveHover(pillar.id)}
                onMouseLeave={() => setActiveHover(null)}
              >
                <Link
                  href={pillar.primaryHref}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                    isPillarActive
                      ? "bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12] shadow-xs"
                      : "text-[#5C6270] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#F4F4F0] hover:bg-[#F2F0E8] dark:hover:bg-[#1A1E27]"
                  }`}
                >
                  <span
                    className={`font-mono-data text-[10px] ${
                      isPillarActive
                        ? "text-[#FFFFFF]/70 dark:text-[#0C0E12]/70"
                        : "text-[#D97706] dark:text-[#FBBF24]"
                    }`}
                  >
                    {pillar.code}
                  </span>
                  <span>{pillar.label}</span>
                </Link>

                {/* Sub-routes Dropdown */}
                {hasMultiple && activeHover === pillar.id && (
                  <div className="absolute top-full left-0 pt-2 w-56 z-50">
                    <div className="surface-elevated p-2 shadow-2xl rounded-xl border border-white/10 bg-[#0C0E12]/95 backdrop-blur-xl space-y-1">
                    {pillar.subRoutes?.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setActiveHover(null)}
                          className={`block px-3 py-2 rounded-lg text-xs transition-colors ${
                            isSubActive
                              ? "bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12] font-bold"
                              : "text-[#5C6270] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#F4F4F0] hover:bg-[#F2F0E8] dark:hover:bg-[#1A1E27]"
                          }`}
                        >
                          <div className="font-semibold">{sub.label}</div>
                          <div className="text-[10px] text-[#5C6270] dark:text-[#9CA3AF] opacity-80 mt-0.5 font-mono-data">
                            {sub.description}
                          </div>
                        </Link>
                      );
                    })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right: Operational Actions & Mode Controls */}
        <div className="flex items-center gap-2.5">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-lg border border-[#E5E4DC] dark:border-[#232733] text-xs text-[#5C6270] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#F4F4F0] hover:bg-[#F2F0E8] dark:hover:bg-[#1A1E27] transition-all cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* Quick Situation Report Action */}
          <Link
            href="/sitrep"
            className="btn-action-primary text-xs py-1.5 px-3.5"
          >
            <span>SITREP</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Mobile Scrollable Pillar Tabs */}
      <div className="lg:hidden px-4 pb-2 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {NAV_PILLARS.map((pillar) => {
          const isPillarActive = pillar.subRoutes?.some((r) => r.href === pathname) || pillar.primaryHref === pathname;
          return (
            <Link
              key={pillar.id}
              href={pillar.primaryHref}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isPillarActive
                  ? "bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12]"
                  : "text-[#5C6270] dark:text-[#9CA3AF] hover:bg-[#F2F0E8] dark:hover:bg-[#1A1E27]"
              }`}
            >
              {pillar.code} {pillar.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
