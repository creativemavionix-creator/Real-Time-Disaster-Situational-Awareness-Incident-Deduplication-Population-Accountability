"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CinematicIntroProps {
  elapsedHours: number;
  totalReports: number;
  activeCriticalCount: number;
  onEnterMatrix: () => void;
}

export function CinematicIntro({
  elapsedHours,
  totalReports,
  activeCriticalCount,
  onEnterMatrix,
}: CinematicIntroProps) {
  const [stage, setStage] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Stage 0: Initial dark fog & quote (0s)
    // Stage 1: Headline & Crisis metadata (1.5s)
    // Stage 2: Resolution into live map (3.5s)
    const t1 = setTimeout(() => setStage(1), 1200);
    const t2 = setTimeout(() => setStage(2), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleSkip = () => {
    setIsDismissed(true);
    onEnterMatrix();
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-between p-6 sm:p-12 lg:p-16 border-b border-[#E5E4DC] dark:border-[#232733] overflow-hidden">
      {/* Top Editorial Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 font-mono-data text-xs text-[#5C6270] dark:text-[#9CA3AF] z-20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
          <span className="text-[#111318] dark:text-[#F4F4F0] font-bold">DISASTER EVENT: CENTRAL NEPAL M7.8 SEQUENCE</span>
        </div>

        <div className="flex items-center gap-6">
          <div>TIMELINE: <strong className="text-[#111318] dark:text-[#F4F4F0]">T+{elapsedHours.toFixed(1)}h</strong></div>
          <div className="hidden sm:inline">REPORTS FUSED: <strong className="text-[#111318] dark:text-[#F4F4F0]">{totalReports}</strong></div>
        </div>
      </div>

      {/* Center Cinematic Typography */}
      <div className="my-auto py-12 max-w-4xl z-20 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="font-serif-editorial text-lg sm:text-2xl text-[#5C6270] dark:text-[#9CA3AF] italic">
            &ldquo;When the ground cannot be reached, information becomes the first response.&rdquo;
          </div>

          <h1 className="font-display-calm font-extrabold text-4xl sm:text-6xl md:text-7xl text-[#111318] dark:text-[#F4F4F0] tracking-tight leading-[1.05]">
            Post-Disaster<br />
            <span className="text-[#2563EB] dark:text-[#60A5FA]">Information Fog</span>
          </h1>

          <p className="font-body-prose text-base sm:text-xl text-[#5C6270] dark:text-[#9CA3AF] max-w-2xl leading-relaxed">
            In the initial hours of a disaster, emergency authorities face fragmented, conflicting reports and complete silence from cut-off mountain ridges. Project PRISM reconstructs ground reality through negative-evidence spatial inference and multi-agency consensus.
          </p>

          {/* Calm Status Indicator */}
          <div className="pt-2 flex items-center gap-3 font-mono-data text-xs sm:text-sm">
            <span className="chip-critical">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
              <span>{activeCriticalCount} OF 8 SECTORS REQUIRE ATTENTION</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Action & Fast Path */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#E5E4DC] dark:border-[#232733] z-20">
        <div className="font-mono-data text-xs text-[#5C6270] dark:text-[#9CA3AF]">
          8 STRATEGIC SECTORS MONITORED • BAYESIAN NEGATIVE-EVIDENCE PIPELINE
        </div>

        <button
          onClick={handleSkip}
          type="button"
          className="btn-action-primary text-xs py-2.5 px-5 cursor-pointer flex items-center gap-2 group"
        >
          <span>ENTER COMMAND MATRIX</span>
          <span className="transition-transform group-hover:translate-y-0.5">↓</span>
        </button>
      </div>
    </section>
  );
}
