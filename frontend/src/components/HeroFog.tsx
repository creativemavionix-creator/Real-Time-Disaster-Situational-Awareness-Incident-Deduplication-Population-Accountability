"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const HeroMap = dynamic(
  () => import("./HeroMap").then((mod) => mod.HeroMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] sm:h-[480px] rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-mono text-slate-400">
        INITIALIZING GEOSPATIAL RADAR...
      </div>
    ),
  }
);

interface HeroFogProps {
  elapsedHours: number;
  simulatedTime: string;
  totalReports: number;
  activeCriticalCount?: number;
  onExploreClick: () => void;
}

export function HeroFog({
  elapsedHours,
  simulatedTime,
  totalReports,
  activeCriticalCount = 6,
  onExploreClick,
}: HeroFogProps) {
  return (
    <section className="relative w-full py-12 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        {/* Left Column: Mission Narrative & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/80 text-cyan-800 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider shadow-xs">
            <span className="text-cyan-600 dark:text-cyan-400">✨</span>
            <span>AUTONOMOUS DISASTER REALITY RECONSTRUCTION</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white leading-[1.1] tracking-tight">
            When Information Fails, Intelligence Must See Beyond It.
          </h1>

          {/* Subtitle */}
          <p className="font-body-prose text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            During the critical hours following a disaster, emergency authorities are overwhelmed with fragmented, contradictory, and incomplete reports. <strong className="text-slate-900 dark:text-white font-semibold">PRATYAKSH-Ω</strong> reconstructs the most probable ground reality by analyzing negative evidence, uncertainty, silence, and information gaps.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onExploreClick}
              type="button"
              className="btn-primary-cyan text-sm py-3 px-6 cursor-pointer"
            >
              <span>EXPLORE THE PLATFORM</span>
              <span>→</span>
            </button>

            <Link
              href="/sitrep"
              className="btn-secondary-glass text-sm py-3 px-6"
            >
              <span className="text-cyan-600 dark:text-cyan-400">✨</span>
              <span>SITREP BRIEFING</span>
            </Link>
          </div>

          {/* Live Status Indicators */}
          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>
                <strong className="text-slate-800 dark:text-slate-200 font-bold">{activeCriticalCount}/8 Sectors</strong> Active Crisis
              </span>
            </div>
            <div className="hidden sm:inline text-slate-300 dark:text-slate-700">•</div>
            <div>
              Elapsed: <strong className="text-slate-800 dark:text-slate-200 font-bold">T+{elapsedHours.toFixed(1)}h</strong>
            </div>
            <div className="hidden sm:inline text-slate-300 dark:text-slate-700">•</div>
            <div>
              Reports Fused: <strong className="text-slate-800 dark:text-slate-200 font-bold">{totalReports}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Hero Map Card */}
        <div className="lg:col-span-5 w-full">
          <HeroMap />
        </div>
      </div>
    </section>
  );
}
