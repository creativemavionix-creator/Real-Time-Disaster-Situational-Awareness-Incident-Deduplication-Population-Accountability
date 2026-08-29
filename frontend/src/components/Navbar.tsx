"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  code: string;
  href: string;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  { code: "01", label: "OVERVIEW", href: "/", description: "Situation Matrix & Replay" },
  { code: "02", label: "GIS MATRIX", href: "/gis-map", description: "Spatial Telemetry & Heatmap" },
  { code: "03", label: "UNIFIED TRUTH", href: "/deduplication", description: "Multi-Agency Deduplication" },
  { code: "04", label: "BLACKOUT INTEL", href: "/blackout-intel", description: "Spatial Physics Risk" },
  { code: "05", label: "POPULATION", href: "/population", description: "Exposure & Missing Persons" },
  { code: "06", label: "TACTICAL DISPATCH", href: "/dispatch", description: "Resource Allocation Engine" },
  { code: "07", label: "SITREP GEN", href: "/sitrep", description: "24h Official Report" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A] border-b-rule select-none">
      {/* Top Telemetry Status Bar */}
      <div className="bg-[#EDEDE8] text-[#0A0A0A] px-4 py-1 flex items-center justify-between text-[11px] font-mono-data font-bold tracking-wider">
        <div className="flex items-center gap-3">
          <span className="bg-[#E5484D] text-[#EDEDE8] px-1.5 py-0.2 animate-pulse">
            LIVE // OP-LEVEL: ALPHA
          </span>
          <span className="hidden sm:inline">CENTRAL NEPAL SEISMIC SEQUENCE // M7.8 PROTOCOL</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#0A0A0A]">8 SECTORS ACTIVE</span>
          <span className="text-[#0A0A0A]/60 hidden md:inline">NEOC CRISIS COMMAND</span>
        </div>
      </div>

      {/* Main Branding & Navigation Row */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between border-b-2 border-[#EDEDE8]/20 bg-[#0A0A0A]">
        {/* Brand Lockup */}
        <Link
          href="/"
          className="p-4 flex items-center gap-3 border-b-2 lg:border-b-0 lg:border-r-4 border-[#EDEDE8] hover:bg-[#EDEDE8]/5 transition-colors"
        >
          <div className="w-4 h-4 bg-[#FFB800]" />
          <div>
            <div className="font-display text-lg sm:text-xl font-black uppercase tracking-tight text-[#EDEDE8]">
              DISASTER // INFORMATION FOG
            </div>
            <div className="font-mono-data text-[10px] text-[#FFB800] uppercase tracking-widest font-bold">
              NATIONAL SITUATIONAL AWARENESS PLATFORM
            </div>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-stretch overflow-x-auto divide-x-2 divide-[#EDEDE8]/20 text-xs font-mono-data scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-3 sm:px-4 sm:py-3.5 flex flex-col justify-center whitespace-nowrap transition-colors border-b-4 ${
                  isActive
                    ? "bg-[#EDEDE8] text-[#0A0A0A] border-[#FFB800] font-bold shadow-none"
                    : "text-[#EDEDE8]/80 hover:text-[#EDEDE8] hover:bg-[#EDEDE8]/10 border-transparent"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] ${isActive ? "text-[#0A0A0A]/60" : "text-[#FFB800]"}`}>
                    [{item.code}]
                  </span>
                  <span className="font-bold tracking-wider">{item.label}</span>
                </div>
                <span className={`text-[9px] hidden xl:block ${isActive ? "text-[#0A0A0A]/70" : "text-[#EDEDE8]/50"}`}>
                  {item.description}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
