"use client";

import React from "react";
import Link from "next/link";
import { SimulationState } from "@/lib/api";

interface ExecutiveBriefingProps {
  simulationState: SimulationState | null;
  activeCriticalCount: number;
  totalExposedMillion: number;
  unaccountedCount: number;
  worstSectorName: string;
}

export function ExecutiveBriefing({
  simulationState,
  activeCriticalCount,
  totalExposedMillion,
  unaccountedCount,
  worstSectorName,
}: ExecutiveBriefingProps) {
  const elapsed = simulationState?.elapsed_hours || 12.0;

  return (
    <section className="border-b border-[#E5E4DC] dark:border-[#232733] bg-[#FAF9F5] dark:bg-[#090B0E] px-6 sm:px-12 lg:px-16 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Context Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono-data text-xs text-[#64748B] dark:text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
            <span className="font-bold tracking-wide uppercase text-[11px] text-[#0F172A] dark:text-[#F3F4F6]">
              Central Nepal Seismic Sequence &bull; M7.8 Barpak Epicenter
            </span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <div>Timeline: <strong className="text-[#0F172A] dark:text-[#F3F4F6]">T+{elapsed.toFixed(1)}h Post-Rupture</strong></div>
            <div className="hidden sm:inline">Coordinates: <strong>28.00°N, 84.63°E</strong></div>
          </div>
        </div>

        {/* Big Editorial Headline */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <h1 className="font-display-calm font-extrabold text-3xl sm:text-5xl text-[#0F172A] dark:text-[#F3F4F6] tracking-tight leading-[1.1]">
              Central Nepal Earthquake
            </h1>
            <p className="font-body-prose text-base sm:text-lg text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Severe seismic shaking across 8 districts. Ground access disrupted along Trisuli and Melamchi river corridors. High inferred casualty risk in silent epicentral mountain ridges.
            </p>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-3 font-display-calm text-xs self-start lg:self-auto">
            <Link
              href="/sitrep"
              className="btn-action-primary py-3 px-6 flex items-center gap-2 text-xs"
            >
              <span>Read SITREP Briefing</span>
              <span>&rarr;</span>
            </Link>
            <Link
              href="/dispatch"
              className="btn-action-secondary py-3 px-5 text-xs"
            >
              <span>Tactical Queue</span>
            </Link>
          </div>
        </div>

        {/* Editorial Metric Strip (Breathable Negative Space with Line Dividers) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[#E5E4DC] dark:border-[#232733]">
          <div className="space-y-1">
            <span className="font-mono-data text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold tracking-wider block">
              Primary Critical Zone
            </span>
            <div className="font-display-calm font-extrabold text-2xl text-[#E11D48] dark:text-[#FB7185] truncate">
              {worstSectorName}
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Highest priority deployment
            </p>
          </div>

          <div className="space-y-1 md:border-l md:border-[#E5E4DC] md:dark:border-[#232733] md:pl-6">
            <span className="font-mono-data text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold tracking-wider block">
              Sectors at Risk
            </span>
            <div className="font-display-calm font-extrabold text-2xl text-[#D97706] dark:text-[#FBBF24]">
              {activeCriticalCount} of 8 Sectors
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Require field response
            </p>
          </div>

          <div className="space-y-1 sm:border-l sm:border-[#E5E4DC] sm:dark:border-[#232733] sm:pl-6">
            <span className="font-mono-data text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold tracking-wider block">
              Exposed Population
            </span>
            <div className="font-display-calm font-extrabold text-2xl text-[#0F172A] dark:text-[#F3F4F6]">
              {totalExposedMillion.toFixed(2)}M Citizens
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              2021 Census + Commuters
            </p>
          </div>

          <div className="space-y-1 md:border-l md:border-[#E5E4DC] md:dark:border-[#232733] md:pl-6">
            <span className="font-mono-data text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold tracking-wider block">
              Unaccounted Cases
            </span>
            <div className="font-display-calm font-extrabold text-2xl text-[#E11D48] dark:text-[#FB7185]">
              {unaccountedCount} Missing
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Family registry inquiries
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
