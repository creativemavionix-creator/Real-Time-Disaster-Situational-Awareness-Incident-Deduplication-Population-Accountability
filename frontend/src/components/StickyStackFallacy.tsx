"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { TacticalAudio } from "@/lib/TacticalAudio";

export function StickyStackFallacy() {
  const [activeStage, setActiveStage] = useState<0 | 1 | 2>(0);
  const [realityComparisonMode, setRealityComparisonMode] = useState<"naive" | "pratyaksh">("pratyaksh");

  const STAGES = [
    {
      id: 0,
      code: "STAGE 01",
      title: "The Urban Telemetry Illusion",
      subtitle: "Kathmandu Valley (High Signal Density)",
      tag: "URBAN CONGESTION",
      tagColor: "chip-neutral",
    },
    {
      id: 1,
      code: "STAGE 02",
      title: "The Mountain Ridge Silence",
      subtitle: "Barpak Epicenter Ridge (Gorkha)",
      tag: "CRITICAL BLACKOUT",
      tagColor: "chip-critical",
    },
    {
      id: 2,
      code: "STAGE 03",
      title: "PRATYAKSH-Ω Reality Reconstruction",
      subtitle: "Negative Evidence Gap: Z = -5.82σ",
      tag: "EPISTEMIC TRUTH",
      tagColor: "chip-radar",
    },
  ];

  const handleStageSelect = (idx: 0 | 1 | 2) => {
    setActiveStage(idx);
    TacticalAudio.playClick();
  };

  const handleNext = () => {
    const next = (activeStage + 1) as 0 | 1 | 2;
    if (next <= 2) {
      setActiveStage(next);
      TacticalAudio.playClick();
    }
  };

  const handlePrev = () => {
    const prev = (activeStage - 1) as 0 | 1 | 2;
    if (prev >= 0) {
      setActiveStage(prev);
      TacticalAudio.playClick();
    }
  };

  return (
    <section className="relative py-24 p-4 sm:p-8 lg:p-16 bg-[#090B0E] border-t border-white/5">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="font-mono-data text-xs text-[#E11D48] tracking-[0.25em] uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
              <span>01 // THE EPISTEMOLOGICAL FAILURE</span>
            </div>
            <h2 className="font-display-calm text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight font-medium">
              The Silent Zone Fallacy
            </h2>
            <p className="font-quote-display italic text-base sm:text-lg text-[#94A3B8] max-w-2xl pb-1">
              &ldquo;Silence is not safety. In catastrophic terrain, absence of evidence is merely evidence of broken observation channels.&rdquo;
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-3 font-mono-data text-xs text-[#64748B]">
            <span className="text-[10px] tracking-widest uppercase">PARADIGM PHASE:</span>
            <span className="text-white font-bold">{`0${activeStage + 1} / 03`}</span>
          </div>
        </div>

        {/* 3-Step Horizon Stepper Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STAGES.map((s) => {
            const isActive = activeStage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleStageSelect(s.id as 0 | 1 | 2)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isActive
                    ? "bg-[#0C0E12] border-white/30 shadow-xl ring-1 ring-white/20"
                    : "bg-white/[0.02] border-white/5 hover:border-white/15 text-[#94A3B8] hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between font-mono-data text-xs">
                  <span className={isActive ? "text-[#E11D48] font-bold" : "text-[#64748B]"}>
                    {s.code}
                  </span>
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${s.tagColor}`}>
                    {s.tag}
                  </span>
                </div>
                <div>
                  <div className="font-display-calm font-medium text-sm text-white">{s.title}</div>
                  <div className="text-[11px] text-[#64748B] font-mono-data mt-0.5">{s.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Card Rendered Exclusively (AnimatePresence mode="wait" Prevents Overlap) */}
        <div className="relative w-full min-h-[420px]">
          <AnimatePresence mode="wait">
            {activeStage === 0 && (
              <motion.div
                key="stage-0"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-3xl bg-[#0C0E12] border border-white/15 p-6 sm:p-10 space-y-8 shadow-2xl"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="space-y-1">
                    <span className="font-mono-data text-[10px] text-[#60A5FA] tracking-widest uppercase">
                      STAGE 01 &bull; URBAN VALLEY CONGESTION
                    </span>
                    <h3 className="font-display-calm text-2xl sm:text-3xl text-white font-medium">
                      The Noise Trap: Kathmandu Valley Core
                    </h3>
                  </div>
                  <span className="chip-neutral text-xs">High Signal Density</span>
                </div>

                <p className="font-body-prose text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
                  Immediately following seismic rupture, connected urban citizens flooded emergency dispatch with duplicate social media posts and calls regarding non-structural cosmetic drywall cracks.
                </p>

                <p className="font-body-prose text-sm text-[#9AAABE] max-w-3xl leading-relaxed">
                  Immediately following the rupture, connected urban citizens flooded emergency dispatch with calls regarding minor cosmetic plaster cracks and perimeter wall tremors.
                </p>

                {/* Asymmetric editorial split instead of 3 uniform bordered cards */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left: Unboxed dominant telemetry numbers */}
                  <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                    <div className="flex items-center justify-between font-mono-data text-xs border-b border-white/10 pb-3">
                      <span className="text-[#5C6E84] uppercase tracking-wider">Observed Signal Flooding</span>
                      <span className="text-[#38BDF8] font-bold">Backhaul 100% Operational</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-mono-data text-[10px] text-[#9AAABE] uppercase">Emergency Calls</div>
                        <div className="font-display-calm text-3xl sm:text-4xl font-bold text-white tabular-nums">4,820<span className="text-xs text-[#5C6E84] font-normal">/hr</span></div>
                        <div className="font-body-prose text-[11px] text-[#5C6E84] mt-1">Cosmetic drywall & panic traffic</div>
                      </div>
                      <div>
                        <div className="font-mono-data text-[10px] text-[#9AAABE] uppercase">Social Media Telemetry</div>
                        <div className="font-display-calm text-3xl sm:text-4xl font-bold text-white tabular-nums">38,400+</div>
                        <div className="font-body-prose text-[11px] text-[#5C6E84] mt-1">High-bandwidth urban uploads</div>
                      </div>
                    </div>
                    <div className="font-mono-data text-[11px] text-[#5C6E84] pt-2 border-t border-white/5">
                      Signal saturation created an illusion of epicentral ground zero within Kathmandu Valley.
                    </div>
                  </div>

                  {/* Right: Dominant Critical Misallocation Alert (Red / Life-Safety) */}
                  <div className="lg:col-span-5 p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-2 font-mono-data text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      CRITICAL DISPATCH MISALLOCATION
                    </div>
                    <div>
                      <div className="font-display-calm text-4xl sm:text-5xl font-black text-rose-200 tracking-tight">
                        82% FLEET
                      </div>
                      <div className="font-mono-data text-xs text-rose-300 font-bold uppercase mt-1">
                        Diverted Away from Actual Epicenter
                      </div>
                    </div>
                    <p className="font-body-prose text-xs text-rose-200/80 leading-relaxed">
                      Conventional CAD systems prioritized dispatch queues by raw volume, sending ambulances to non-structural incidents while the true epicenter remained unserved.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between font-mono-data text-xs">
                  <span className="text-[#5C6E84]">Conventional dashboards mistake volume for severity.</span>
                  <button
                    onClick={handleNext}
                    className="btn-action-primary text-xs py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <span>Inspect Mountain Silence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {activeStage === 1 && (
              <motion.div
                key="stage-1"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-3xl bg-[#0D1117] border border-rose-500/30 p-6 sm:p-10 space-y-8 shadow-2xl"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="space-y-1">
                    <span className="font-mono-data text-[10px] text-[#E11D48] tracking-widest uppercase flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      STAGE 02 &bull; HIGH MOUNTAIN DECAPITATION
                    </span>
                    <h3 className="font-display-calm text-2xl sm:text-3xl text-white font-medium">
                      The Fatal Void: Barpak Epicenter Ridge
                    </h3>
                  </div>
                  <span className="chip-critical text-xs">Total Telecom Blackout</span>
                </div>

                <p className="font-body-prose text-sm text-[#9AAABE] max-w-3xl leading-relaxed">
                  28km away at the epicenter, stone-masonry homes collapsed completely. But because BTS backup batteries drained and transmission pylons severed, <strong className="text-white">zero communications could escape the gorge</strong>.
                </p>

                {/* Asymmetric contrast display */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-6 p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                    <div className="font-mono-data text-[10px] text-[#5C6E84] uppercase tracking-wider">
                      Ground Physical Shock
                    </div>
                    <div className="font-display-calm text-3xl font-bold text-white">
                      MMI IX <span className="text-rose-400 text-lg font-mono-data font-normal">(PGA &gt; 0.48g)</span>
                    </div>
                    <p className="font-body-prose text-xs text-[#9AAABE] leading-relaxed">
                      Catastrophic shaking crushed non-reinforced adobe masonry. 92% of residential structures experienced instantaneous collapse.
                    </p>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="font-mono-data text-[10px] text-rose-400 uppercase tracking-wider">
                        Observed Signal Influx
                      </div>
                      <div className="font-display-calm text-4xl font-extrabold text-rose-300">
                        0 CALLS &bull; 0 POSTS
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-rose-900/30 border border-rose-500/20 font-mono-data text-xs text-rose-200">
                      <strong>LEGACY CAD VERDICT:</strong> Flagged as Nominal / No Action Required due to zero incoming distress calls.
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between font-mono-data text-xs">
                  <button
                    onClick={handlePrev}
                    className="text-[#9AAABE] hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Urban Trap</span>
                  </button>

                  <button
                    onClick={handleNext}
                    className="btn-action-primary text-xs py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <span>Observe PRATYAKSH-Ω Resolution</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {activeStage === 2 && (
              <motion.div
                key="stage-2"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-3xl bg-[#090B0E] border border-[#E11D48]/50 p-6 sm:p-10 space-y-8 shadow-[0_0_50px_rgba(225,29,72,0.15)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="space-y-1">
                    <span className="font-mono-data text-[10px] text-[#E11D48] tracking-widest uppercase flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-ping" />
                      STAGE 03 &bull; BAYESIAN REALITY RECONSTRUCTION
                    </span>
                    <h3 className="font-display-calm text-2xl sm:text-3xl text-white font-medium">
                      Negative Evidence Gap: Z = -5.82&sigma;
                    </h3>
                  </div>

                  {/* Paradigm Comparison Mode Switcher */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 font-mono-data text-xs">
                    <button
                      onClick={() => {
                        setRealityComparisonMode("naive");
                        TacticalAudio.playClick();
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        realityComparisonMode === "naive"
                          ? "bg-white/15 text-white font-bold"
                          : "text-[#64748B] hover:text-white"
                      }`}
                    >
                      Legacy Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setRealityComparisonMode("pratyaksh");
                        TacticalAudio.playClick();
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        realityComparisonMode === "pratyaksh"
                          ? "bg-[#E11D48] text-white font-bold shadow-md shadow-[#E11D48]/30"
                          : "text-[#64748B] hover:text-white"
                      }`}
                    >
                      PRATYAKSH-Ω
                    </button>
                  </div>
                </div>

                {realityComparisonMode === "pratyaksh" ? (
                  <div className="space-y-6">
                    <p className="font-body-prose text-sm text-[#CBD5E1] leading-relaxed">
                      PRATYAKSH-Ω queries the diurnal population baseline for Barpak at 11:56 AM (48.5 expected calls/hr). Detecting 0.0 observed calls, the system flags an extreme negative evidence deviation (Z = -5.82&sigma;) and automatically triggers autonomous aerial reconnaissance.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono-data text-xs">
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                        <span className="text-[#64748B] uppercase">Expected Signal</span>
                        <div className="text-xl font-bold text-[#60A5FA]">48.5 Calls/hr</div>
                        <span className="text-[10px] text-[#94A3B8]">Diurnal Census baseline</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                        <span className="text-[#64748B] uppercase">Observed Signal</span>
                        <div className="text-xl font-bold text-[#FB7185]">0.0 Calls (-100%)</div>
                        <span className="text-[10px] text-[#94A3B8]">Severed backhaul confirmed</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                        <span className="text-[#64748B] uppercase">Bayesian State</span>
                        <div className="text-xl font-bold text-rose-400">H5: CATASTROPHIC</div>
                        <span className="text-[10px] text-[#94A3B8]">Posterior: 58% (Dominant)</span>
                      </div>
                      <div className="p-4 rounded-xl bg-[#059669]/10 border border-[#059669]/20 space-y-1">
                        <span className="text-[#34D399] uppercase">Autonomous Action</span>
                        <div className="text-sm font-bold text-white">DISPATCH VTOL UAV</div>
                        <span className="text-[10px] text-[#34D399]">Aerial reconnaissance tasked</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 font-mono-data text-xs text-[#94A3B8] space-y-3">
                    <div className="text-emerald-400 font-bold text-sm">
                      LEGACY DASHBOARD: ALL CLEAR (ZERO REPORTS RECEIVED)
                    </div>
                    <p className="leading-relaxed">
                      Conventional disaster platforms calculate priority strictly by report volume. Because Barpak telecommunications were annihilated, zero reports arrived. Naive dashboards assigned zero rescue missions to Barpak for 36 hours while 14,000 residents remained trapped under collapsed timber and masonry.
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10 flex items-center justify-between font-mono-data text-xs">
                  <button
                    onClick={handlePrev}
                    className="text-[#94A3B8] hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Mountain Silence</span>
                  </button>

                  <div className="flex items-center gap-2 text-[#34D399]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Negative evidence gap resolves urban bias automatically</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
