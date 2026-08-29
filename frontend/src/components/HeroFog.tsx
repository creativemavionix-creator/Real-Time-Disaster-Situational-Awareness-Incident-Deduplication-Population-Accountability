"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

interface HeroFogProps {
  elapsedHours: number;
  simulatedTime: string;
  totalReports: number;
  onExploreClick: () => void;
}

export function HeroFog({
  elapsedHours,
  simulatedTime,
  totalReports,
  onExploreClick,
}: HeroFogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll-based fog lift
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Calculate fog clearance based on both scroll and simulated time progress (0h to 24h)
  const timeClarityFactor = Math.min(1, Math.max(0, elapsedHours / 24.0)); // 0.0 at T0, 1.0 at T24h
  
  // Transform scroll progress to blur & opacity
  const scrollBlur = useTransform(scrollYProgress, [0, 0.7], [18, 0]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.85], [0.85, 0]);

  // Combined fog styling
  const effectiveBlur = shouldReduceMotion ? 0 : scrollBlur;
  const effectiveOpacity = shouldReduceMotion ? 0.3 : scrollOpacity;

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex flex-col justify-between p-6 md:p-12 border-b-rule bg-[#0A0A0A] overflow-hidden"
    >
      {/* Top Telemetry Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-[#EDEDE8] pb-4 font-mono-data text-xs md:text-sm text-[#EDEDE8]">
        <div className="flex items-center gap-3">
          <span className="inline-block w-3 h-3 bg-[#FFB800] animate-pulse" />
          <span className="font-bold tracking-wider">DEFCON // SITUATION ROOM</span>
          <span className="text-[#EDEDE8]/60">| REGION: CENTRAL NEPAL (8 SECTORS)</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-right">
          <span>SIM_TIME: <strong className="text-[#FFB800]">{simulatedTime ? new Date(simulatedTime).toUTCString() : "2026-08-30 06:00:00 UTC"}</strong></span>
          <span>ELAPSED: <strong className="text-[#FFB800]">{elapsedHours.toFixed(1)}h / 24.0h</strong></span>
          <span>REPORTS_INGESTED: <strong className="text-[#EDEDE8]">{totalReports}</strong></span>
        </div>
      </div>

      {/* Main Asymmetric Hero Headline */}
      <div className="relative my-auto py-12 z-10">
        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-block bg-[#FFB800] text-[#0A0A0A] px-3 py-1 font-mono-data text-xs font-bold uppercase tracking-widest mb-4">
              CRITICAL FIRST 24-HOUR FUSION PIPELINE
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] text-[#EDEDE8] uppercase select-none"
          >
            POST-DISASTER<br />
            <span className="text-transparent stroke-text hover:text-[#EDEDE8] transition-colors duration-300" style={{ WebkitTextStroke: "3px #EDEDE8" }}>
              INFORMATION
            </span><br />
            FOG
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="font-body-prose text-lg sm:text-2xl text-[#EDEDE8]/90 max-w-3xl mt-8 leading-snug"
          >
            Authorities receive fragmented, duplicated, and contradictory reports from citizens, police, hospitals, and social media. This system cuts through the uncertainty—fusing embeddings, corroborating incident clusters, and identifying communication blackouts.
          </motion.p>
        </div>
      </div>

      {/* Signature Fog & Noise Overlay Layer */}
      <motion.div
        style={{
          backdropFilter: `blur(${scrollBlur}px)`,
          opacity: effectiveOpacity,
        }}
        className="pointer-events-none absolute inset-0 z-20 bg-noise bg-[#0A0A0A]/40 transition-opacity duration-500"
      >
        <div className="absolute top-6 right-6 font-mono-data text-xs text-[#FFB800] bg-[#0A0A0A] border-2 border-[#FFB800] px-3 py-1">
          FOG DENSITY: {Math.max(0, Math.round((1 - timeClarityFactor) * 100))}% (LIFTS AS TIME/SCROLL ADVANCES)
        </div>
      </motion.div>

      {/* Bottom Action & Scroll Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t-4 border-[#EDEDE8] pt-4 z-30 font-mono-data text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[#FFB800] font-bold">STATUS ENGINE:</span>
          <span className="text-[#EDEDE8]">AGGREGATING 8 FIXED GAZEPTEER CENTROIDS</span>
        </div>

        <button
          onClick={onExploreClick}
          className="bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] hover:text-[#0A0A0A] px-6 py-3 font-bold uppercase tracking-wider transition-colors duration-150 border-2 border-[#0A0A0A] active:translate-x-1 active:translate-y-1"
        >
          VIEW LIVE SITUATION MATRIX [↓]
        </button>
      </div>
    </section>
  );
}
