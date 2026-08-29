"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useViewMode } from "@/context/ViewModeContext";

interface NavPillar {
  id: string;
  code: string;
  label: string;
  subtitle: string;
  primaryHref: string;
  routes: {
    label: string;
    href: string;
    tagline: string;
  }[];
}

const NAV_PILLARS: NavPillar[] = [
  {
    id: "situation",
    code: "01",
    label: "SITUATION",
    subtitle: "What is happening?",
    primaryHref: "/",
    routes: [
      { label: "Overview", href: "/", tagline: "Critical crisis matrix & simulation" },
      { label: "Live Map", href: "/gis-map", tagline: "Spatial radar & regional telemetry" },
    ],
  },
  {
    id: "intelligence",
    code: "02",
    label: "INTELLIGENCE",
    subtitle: "What can we trust & see?",
    primaryHref: "/deduplication",
    routes: [
      { label: "Unified Truth", href: "/deduplication", tagline: "Resolved multi-agency reports" },
      { label: "Blackout Risk", href: "/blackout-intel", tagline: "Inferred risk in silent zones" },
      { label: "Population", href: "/population", tagline: "Exposed people & missing registry" },
    ],
  },
  {
    id: "response",
    code: "03",
    label: "RESPONSE",
    subtitle: "Where should we act?",
    primaryHref: "/dispatch",
    routes: [
      { label: "Tactical Dispatch", href: "/dispatch", tagline: "Priority rescue & resource queue" },
    ],
  },
  {
    id: "report",
    code: "04",
    label: "REPORT",
    subtitle: "Official situation report",
    primaryHref: "/sitrep",
    routes: [
      { label: "SITREP", href: "/sitrep", tagline: "UN OCHA standardized briefing" },
    ],
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { mode, toggleMode, isAnalysis } = useViewMode();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Find active pillar
  const currentPillar = NAV_PILLARS.find((pillar) =>
    pillar.routes.some((r) => r.href === pathname)
  ) || NAV_PILLARS[0];

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#EDEDE8]/15 select-none transition-all">
      {/* Top Operational Status Bar */}
      <div className="bg-[#EDEDE8]/5 border-b border-[#EDEDE8]/10 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono-data">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#E5484D] inline-block" />
            <span className="text-[#EDEDE8] font-bold tracking-wider">
              CENTRAL NEPAL CRISIS PROTOCOL
            </span>
          </div>
          <span className="text-[#EDEDE8]/40 hidden md:inline">•</span>
          <span className="text-[#EDEDE8]/70 hidden md:inline">M7.8 Seismological Sequence</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#EDEDE8]/50">STATUS:</span>
            <span className="text-[#FFB800] font-bold">6/8 SECTORS ACTIVE</span>
          </div>
          <span className="text-[#EDEDE8]/30 hidden sm:inline">|</span>
          <span className="text-[#EDEDE8]/60 hidden sm:inline">NEOC CRISIS COMMAND</span>
        </div>
      </div>

      {/* Main Header & Four Pillars */}
      <div className="px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EDEDE8]/10">
        {/* Brand Lockup */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-3.5 h-3.5 bg-[#FFB800] transition-transform group-hover:scale-110" />
          <div>
            <div className="font-display text-base sm:text-lg font-bold tracking-tight text-[#EDEDE8] flex items-center gap-2">
              POST-DISASTER <span className="text-[#EDEDE8]/40 font-light">//</span> INFORMATION FOG
            </div>
            <div className="font-mono-data text-[10px] text-[#FFB800] tracking-widest font-medium uppercase">
              National Situational Awareness Platform
            </div>
          </div>
        </Link>

        {/* Four Primary Navigation Pillars */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1">
          {NAV_PILLARS.map((pillar) => {
            const isPillarActive = pillar.routes.some((r) => r.href === pathname);
            const hasMultipleRoutes = pillar.routes.length > 1;

            return (
              <div
                key={pillar.id}
                className="relative"
                onMouseEnter={() => hasMultipleRoutes && setActiveDropdown(pillar.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={pillar.primaryHref}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs transition-all flex items-center gap-2 border ${
                    isPillarActive
                      ? "bg-[#EDEDE8] text-[#0A0A0A] border-[#EDEDE8] font-bold shadow-sm"
                      : "text-[#EDEDE8]/70 hover:text-[#EDEDE8] bg-transparent border-transparent hover:border-[#EDEDE8]/20 hover:bg-[#EDEDE8]/5"
                  }`}
                >
                  <span
                    className={`font-mono-data text-[10px] ${
                      isPillarActive ? "text-[#0A0A0A]/60" : "text-[#FFB800]"
                    }`}
                  >
                    {pillar.code}
                  </span>
                  <span className="tracking-wider">{pillar.label}</span>
                </Link>

                {/* Dropdown for multi-route pillars on hover */}
                {hasMultipleRoutes && activeDropdown === pillar.id && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-[#0A0A0A] border border-[#EDEDE8]/20 p-2 shadow-2xl z-50 space-y-1 animate-fade-in">
                    <div className="px-2 py-1 text-[10px] font-mono-data text-[#EDEDE8]/40 uppercase border-b border-[#EDEDE8]/10 mb-1">
                      {pillar.subtitle}
                    </div>
                    {pillar.routes.map((subRoute) => (
                      <Link
                        key={subRoute.href}
                        href={subRoute.href}
                        onClick={() => setActiveDropdown(null)}
                        className={`block px-2.5 py-1.5 text-xs transition-colors ${
                          pathname === subRoute.href
                            ? "bg-[#FFB800] text-[#0A0A0A] font-bold"
                            : "text-[#EDEDE8]/80 hover:text-[#EDEDE8] hover:bg-[#EDEDE8]/10"
                        }`}
                      >
                        <div className="font-medium">{subRoute.label}</div>
                        <div
                          className={`text-[10px] font-mono-data ${
                            pathname === subRoute.href ? "text-[#0A0A0A]/80" : "text-[#EDEDE8]/50"
                          }`}
                        >
                          {subRoute.tagline}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* View Mode Toggle: Command vs. Analysis */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMode}
            title={
              isAnalysis
                ? "Switch to Command Mode: Simple human-readable operational summaries"
                : "Switch to Analysis Mode: Reveal formulas, embeddings, source weights, and telemetry"
            }
            className={`px-3 py-1.5 text-xs font-mono-data border transition-all flex items-center gap-2 ${
              isAnalysis
                ? "bg-[#FFB800]/10 border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800]/20"
                : "bg-[#EDEDE8]/5 border-[#EDEDE8]/20 text-[#EDEDE8]/80 hover:border-[#EDEDE8]/40"
            }`}
          >
            <span className="text-[10px]">
              {isAnalysis ? "⚙" : "◉"}
            </span>
            <span className="font-bold uppercase tracking-wider">
              {isAnalysis ? "ANALYSIS MODE" : "COMMAND MODE"}
            </span>
          </button>
        </div>
      </div>

      {/* Contextual Sub-Route Pill Bar (when inside a multi-route pillar) */}
      {currentPillar.routes.length > 1 && (
        <div className="bg-[#EDEDE8]/3 px-4 sm:px-6 py-1.5 border-b border-[#EDEDE8]/10 flex items-center justify-between text-xs font-mono-data">
          <div className="flex items-center gap-3">
            <span className="text-[#FFB800] text-[10px] uppercase font-bold">
              {currentPillar.label} // {currentPillar.subtitle}
            </span>
            <span className="text-[#EDEDE8]/30">|</span>
            <div className="flex items-center gap-2">
              {currentPillar.routes.map((sub) => {
                const isCurrent = pathname === sub.href;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={`px-2 py-0.5 text-[11px] transition-colors border ${
                      isCurrent
                        ? "bg-[#EDEDE8]/20 border-[#EDEDE8] text-[#EDEDE8] font-bold"
                        : "border-transparent text-[#EDEDE8]/60 hover:text-[#EDEDE8]"
                    }`}
                  >
                    {sub.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="text-[10px] text-[#EDEDE8]/40 hidden lg:block">
            {isAnalysis
              ? "Exposing mathematical weights, dense embeddings & raw telemetry"
              : "Showing human-readable operational summaries"}
          </div>
        </div>
      )}
    </header>
  );
}
