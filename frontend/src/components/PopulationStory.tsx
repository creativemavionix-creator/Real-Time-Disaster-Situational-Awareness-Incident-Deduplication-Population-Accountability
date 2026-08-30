"use client";

import React from "react";
import Link from "next/link";

interface PopulationStoryProps {
  totalExposedMillion: number;
  totalUnaccountedCount: number;
  totalEvacuatedThousand: number;
}

export function PopulationStory({
  totalExposedMillion,
  totalUnaccountedCount,
  totalEvacuatedThousand,
}: PopulationStoryProps) {
  return (
    <section className="py-16 sm:py-24 border-b border-[#E5E4DC] dark:border-[#232733] px-6 sm:px-12 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="font-mono-data text-xs text-[#059669] dark:text-[#34D399] font-bold uppercase tracking-wider">
              06 // POPULATION ACCOUNTABILITY
            </div>
            <h2 className="font-display-calm font-extrabold text-3xl sm:text-5xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
              Who Is Affected?
            </h2>
            <p className="font-body-prose text-sm sm:text-base text-[#5C6270] dark:text-[#9CA3AF] leading-relaxed">
              Static census maps fail during daytime earthquakes when commuters and tourists flood urban corridors. PRISM fuses the official 2021 NSO Nepal Census baseline with diurnal mobility flux.
            </p>
          </div>

          <Link
            href="/population"
            className="btn-action-secondary text-xs py-2.5 px-5 self-start md:self-auto"
          >
            <span>EXPLORE POPULATION REGISTRY</span>
            <span>→</span>
          </Link>
        </div>

        {/* Large Editorial Metric Displays */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono-data">
          <div className="surface-calm p-8 space-y-3">
            <span className="text-[11px] text-[#5C6270] dark:text-[#9CA3AF] uppercase font-bold tracking-wider block">
              REAL-TIME EXPOSED POPULATION
            </span>
            <div className="font-display-calm font-extrabold text-4xl sm:text-6xl text-[#111318] dark:text-[#F4F4F0]">
              {totalExposedMillion.toFixed(2)}M
            </div>
            <p className="font-body-prose text-xs text-[#5C6270] dark:text-[#9CA3AF] leading-relaxed">
              Adjusted for daytime work commuters and international trekker density across 8 disaster sectors.
            </p>
          </div>

          <div className="surface-calm p-8 space-y-3">
            <span className="text-[11px] text-[#E11D48] dark:text-[#FB7185] uppercase font-bold tracking-wider block">
              ACTIVE MISSING PERSONS
            </span>
            <div className="font-display-calm font-extrabold text-4xl sm:text-6xl text-[#E11D48] dark:text-[#FB7185]">
              {totalUnaccountedCount}
            </div>
            <p className="font-body-prose text-xs text-[#5C6270] dark:text-[#9CA3AF] leading-relaxed">
              Family-reported cases cross-referenced automatically against hospital intake rosters and morgue manifests.
            </p>
          </div>

          <div className="surface-calm p-8 space-y-3">
            <span className="text-[11px] text-[#059669] dark:text-[#34D399] uppercase font-bold tracking-wider block">
              SHELTERED & EVACUATED
            </span>
            <div className="font-display-calm font-extrabold text-4xl sm:text-6xl text-[#059669] dark:text-[#34D399]">
              {totalEvacuatedThousand.toFixed(0)}k
            </div>
            <p className="font-body-prose text-xs text-[#5C6270] dark:text-[#9CA3AF] leading-relaxed">
              Displaced citizens accounted for in designated open spaces (Tundikhel, Khula Manch, and rural relief camps).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
