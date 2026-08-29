"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll-based fog lift
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const timeClarityFactor = Math.min(1, Math.max(0, elapsedHours / 24.0));
  const scrollBlur = useTransform(scrollYProgress, [0, 0.6], [12, 0]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.75], [0.6, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[85vh] flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-[#0A0A0A] border-b border-[#EDEDE8]/10 overflow-hidden"
    >
      {/* Top Operational Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 font-mono-data text-xs border-b border-[#EDEDE8]/10 z-30">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-[#FFB800]" />
          <span className="text-[#EDEDE8] font-bold tracking-wider uppercase">
            CENTRAL NEPAL CRISIS SEQUENCE
          </span>
          <span className="text-[#EDEDE8]/40">/</span>
          <span className="text-[#EDEDE8]/70">M7.8 EPICENTER PROTOCOL</span>
        </div>

        <div className="flex items-center gap-6 text-[#EDEDE8]/70">
          <div>
            ELAPSED: <strong className="text-[#FFB800]">{elapsedHours.toFixed(1)}h</strong> / 24.0h
          </div>
          <div>
            REPORTS FUSED: <strong className="text-[#EDEDE8]">{totalReports}</strong>
          </div>
        </div>
      </div>

      {/* Main Cinematic Editorial Center */}
      <div className="my-auto py-10 z-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EDEDE8]/5 border border-[#EDEDE8]/15 text-xs font-mono-data text-[#FFB800]">
            <span>M7.8 BARPAK SEISMIC EVENT</span>
            <span className="text-[#EDEDE8]/30">•</span>
            <span>T+{elapsedHours.toFixed(0)}H TIMELINE</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#EDEDE8] leading-[0.95]">
            INFORMATION FOG
          </h1>

          <p className="font-body-prose text-lg sm:text-2xl text-[#EDEDE8]/80 max-w-3xl leading-relaxed pt-2">
            In the initial 24 hours of a disaster, authorities face fragmented, conflicting reports.
            This command platform resolves multi-agency reports, calculates risk in silent blackout zones,
            and guides life-saving tactical resource deployment.
          </p>

          {/* Core Situation Callout */}
          <div className="pt-4 flex items-center gap-3 text-sm sm:text-base font-body-prose text-[#EDEDE8]">
            <span className="w-3 h-3 bg-[#E5484D] inline-block" />
            <span>
              <strong className="text-[#E5484D] font-bold">{activeCriticalCount} of 8 monitored sectors</strong> currently require immediate operational intervention.
            </span>
          </div>
        </motion.div>
      </div>

      {/* Signature Subtle Atmospheric Fog Overlay */}
      <motion.div
        style={{
          backdropFilter: shouldReduceMotion ? "none" : `blur(${scrollBlur}px)`,
          opacity: shouldReduceMotion ? 0.2 : scrollOpacity,
        }}
        className="pointer-events-none absolute inset-0 z-20 bg-noise bg-[#0A0A0A]/40 transition-opacity duration-500"
      >
        <div className="absolute top-8 right-8 font-mono-data text-[11px] text-[#EDEDE8]/60 bg-[#0A0A0A]/80 border border-[#EDEDE8]/15 px-3 py-1.5 backdrop-blur-sm">
          FOG CLEARANCE: <strong className="text-[#FFB800]">{Math.min(100, Math.round(timeClarityFactor * 100))}%</strong>
        </div>
      </motion.div>

      {/* Bottom Action Bar */}
      <div className="pt-6 border-t border-[#EDEDE8]/10 flex flex-wrap items-center justify-between gap-4 z-30">
        <div className="flex items-center gap-4 text-xs font-mono-data text-[#EDEDE8]/60">
          <span>8 STRATEGIC GAZEPTEER HUBS</span>
          <span>•</span>
          <span>AUTONOMOUS SEMANTIC FUSION</span>
        </div>

        <button
          onClick={onExploreClick}
          className="px-6 py-3 bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] font-mono-data text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 group cursor-pointer"
        >
          <span>VIEW LIVE SITUATION</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
    </section>
  );
}
