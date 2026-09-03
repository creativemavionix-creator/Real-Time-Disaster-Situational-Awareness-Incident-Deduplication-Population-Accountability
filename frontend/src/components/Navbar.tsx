"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, ShieldAlert, FileText, Activity, Menu, X, ChevronRight } from "lucide-react";

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
      { label: "Live GIS Map", href: "/gis-map", description: "Geospatial radar & vector cartography" },
    ],
  },
  {
    id: "intelligence",
    code: "02",
    label: "Intelligence",
    primaryHref: "/hypotheses",
    subRoutes: [
      { label: "Reality Reconstruction", href: "/hypotheses", description: "PRATYAKSH-Ω Bayesian inference & hypotheses" },
      { label: "Incident Consensus", href: "/deduplication", description: "Reconciled multi-agency incident ledger" },
      { label: "Blackout Risk", href: "/blackout-intel", description: "Inferred risk & spatial physics in silent sectors" },
      { label: "Population Exposure", href: "/population", description: "Demographic exposure & 2021 Census palikas" },
      { label: "Scientific Datasets", href: "/research-data", description: "RESQ-SIGHT ground truth & UNOSAT evidence" },
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
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0C0E12]/95 backdrop-blur-xl border-b border-white/10 select-none">
      {/* Top Ambient Operational Status Bar */}
      <div className="bg-[#090B0E] border-b border-white/5 px-4 sm:px-8 py-1 flex items-center justify-between text-[11px] font-mono-data text-[#94A3B8]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
            <span className="text-[#F3F4F6] font-bold tracking-wider">
              CENTRAL NEPAL CRISIS PROTOCOL
            </span>
          </div>
          <span className="text-white/20 hidden md:inline">|</span>
          <span className="hidden md:inline text-[#64748B]">Multi-Disaster Live Simulation Active</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B]">DOCTRINE:</span>
            <strong className="text-[#F59E0B]">SILENCE IS NOT SAFETY</strong>
          </div>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="hidden sm:inline text-[#94A3B8]">NEOC COMMAND</span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-6">
        {/* Brand Lockup */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E2433] to-[#12151D] border border-white/15 text-white flex items-center justify-center font-mono-data font-bold text-sm shadow-md group-hover:border-[#E11D48]/50 transition-all">
            Ω
          </div>
          <div>
            <div className="font-display-calm font-bold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
              PRATYAKSH-Ω
            </div>
            <div className="font-mono-data text-[10px] text-[#94A3B8] tracking-wider uppercase -mt-0.5">
              Negative Evidence Intelligence
            </div>
          </div>
        </Link>

        {/* Center: 4 Primary Operational Pillars */}
        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
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
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border ${
                    isPillarActive
                      ? "bg-white/10 text-white border-white/20 shadow-sm"
                      : "text-[#94A3B8] border-transparent hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`font-mono-data text-[10px] ${
                      isPillarActive ? "text-[#E11D48]" : "text-[#D97706]"
                    }`}
                  >
                    {pillar.code}
                  </span>
                  <span>{pillar.label}</span>
                </Link>

                {/* Sub-routes Dropdown */}
                {hasMultiple && activeHover === pillar.id && (
                  <div className="absolute top-full left-0 pt-2 w-64 z-50">
                    <div className="p-2 shadow-2xl rounded-2xl border border-white/15 bg-[#0C0E12]/98 backdrop-blur-2xl space-y-1">
                      {pillar.subRoutes?.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setActiveHover(null)}
                            className={`block px-3 py-2.5 rounded-xl text-xs transition-colors ${
                              isSubActive
                                ? "bg-white/10 text-white font-bold border border-white/15"
                                : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <div className="font-semibold text-white flex items-center justify-between">
                              <span>{sub.label}</span>
                              {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />}
                            </div>
                            <div className="text-[10px] text-[#64748B] mt-0.5 font-body-prose leading-snug">
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

        {/* Right: Operational Actions & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/gis-map"
            className="hidden sm:inline-flex btn-action-secondary text-xs py-1.5 px-3"
          >
            <Radio className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Live Map</span>
          </Link>

          <Link
            href="/sitrep"
            className="btn-action-primary text-xs py-1.5 px-3.5"
          >
            <span>SITREP</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 border border-white/10"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Expandable Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pb-4 pt-2 border-t border-white/10 bg-[#090B0E] space-y-4">
          {NAV_PILLARS.map((pillar) => (
            <div key={pillar.id} className="space-y-1.5">
              <div className="font-mono-data text-[10px] text-[#D97706] uppercase tracking-wider px-2">
                {pillar.code} // {pillar.label}
              </div>
              <div className="grid grid-cols-1 gap-1">
                {pillar.subRoutes?.map((sub) => {
                  const isSubActive = pathname === sub.href;
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isSubActive
                          ? "bg-white/10 text-white font-bold border border-white/15"
                          : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{sub.label}</span>
                      <span className="text-[10px] text-[#64748B] font-mono-data">
                        {sub.href}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
