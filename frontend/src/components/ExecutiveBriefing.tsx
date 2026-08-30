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
    <section className="border-b border-[#E5E4DC] dark:border-[#232733] bg-[#FAF9F5] dark:bg-[#0C0E12] px-6 sm:px-12 lg:px-16 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Operational Context Tag */}
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono-data text-xs text-[#5C6270] dark:text-[#9CA3AF]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-ping" />
            <strong className="text-[#111318] dark:text-[#F4F4F0] uppercase tracking-wider">
              DISASTER BRIEFING: CENTRAL NEPAL M7.8 SEQUENCE
            </strong>
          </div>

          <div className="flex items-center gap-6">
            <div>TIMELINE: <strong className="text-[#111318] dark:text-[#F4F4F0]">T+{elapsed.toFixed(1)}h Post-Rupture</strong></div>
            <div className="hidden sm:inline">EPICENTER: <strong className="text-[#E11D48] dark:text-[#FB7185]">Barpak, Gorkha (28.00°N, 84.63°E)</strong></div>
          </div>
        </div>

        {/* Big Editorial Headline */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <h1 className="font-display-calm font-extrabold text-3xl sm:text-5xl text-[#111318] dark:text-[#F4F4F0] tracking-tight leading-tight">
              Central Nepal Earthquake
            </h1>
            <p className="font-body-prose text-base sm:text-lg text-[#5C6270] dark:text-[#9CA3AF] leading-relaxed">
              Severe seismic shaking across 8 districts. Ground access disrupted along Trisuli and Melamchi corridors. Inferred high casualty risk in silent epicentral mountain ridges.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3 font-mono-data text-xs self-start lg:self-auto">
            <Link
              href="/sitrep"
              className="btn-action-primary py-2.5 px-5 flex items-center gap-2"
            >
              <span>FULL SITREP BRIEFING</span>
              <span>→</span>
            </Link>
            <Link
              href="/dispatch"
              className="btn-action-secondary py-2.5 px-4"
            >
              <span>TACTICAL QUEUE</span>
            </Link>
          </div>
        </div>

        {/* 4 Quiet Key Indicator Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 font-mono-data text-xs">
          <div className="surface-calm p-4 space-y-1">
            <span className="text-[10px] text-[#5C6270] uppercase font-bold block">WORST IMPACT ZONE</span>
            <strong className="text-base text-[#E11D48] dark:text-[#FB7185] font-extrabold block truncate">
              {worstSectorName}
            </strong>
            <span className="text-[10px] text-[#5C6270]">Highest priority deployment</span>
          </div>

          <div className="surface-calm p-4 space-y-1">
            <span className="text-[10px] text-[#5C6270] uppercase font-bold block">SECTORS AT RISK</span>
            <strong className="text-base text-[#D97706] dark:text-[#FBBF24] font-extrabold block">
              {activeCriticalCount} of 8 Sectors
            </strong>
            <span className="text-[10px] text-[#5C6270]">Require field action</span>
          </div>

          <div className="surface-calm p-4 space-y-1">
            <span className="text-[10px] text-[#5C6270] uppercase font-bold block">EXPOSED POPULATION</span>
            <strong className="text-base text-[#111318] dark:text-[#F4F4F0] font-extrabold block">
              {totalExposedMillion.toFixed(2)}M Citizens
            </strong>
            <span className="text-[10px] text-[#5C6270]">2021 Census + Commuters</span>
          </div>

          <div className="surface-calm p-4 space-y-1">
            <span className="text-[10px] text-[#5C6270] uppercase font-bold block">UNACCOUNTED CASES</span>
            <strong className="text-base text-[#E11D48] dark:text-[#FB7185] font-extrabold block">
              {unaccountedCount} Missing
            </strong>
            <span className="text-[10px] text-[#5C6270]">Family registry claims</span>
          </div>
        </div>
      </div>
    </section>
  );
}
