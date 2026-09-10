"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Radar,
  Radio,
  Cpu,
  Users,
  Truck,
  FileText,
  Activity,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  MapPin,
  Flame,
  PhoneCall,
  Zap,
  Server,
  Compass,
} from "lucide-react";
import { TacticalAudio } from "@/lib/TacticalAudio";

export interface TourStep {
  id: string;
  code: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  keyMetric: { label: string; value: string; color: string };
  secondaryMetric: { label: string; value: string; color: string };
  targetRoute: string;
  routeLabel: string;
  icon: React.ElementType;
  visualType:
    | "doctrine"
    | "gis"
    | "dedup"
    | "blackout"
    | "bayesian"
    | "population"
    | "dispatch"
    | "sitrep";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "step-doctrine",
    code: "PHASE 01",
    badge: "DOCTRINE // INVERSION",
    title: "Silence is Not Safety",
    subtitle: "Negative Evidence Intelligence & The Reporting Bias Trap",
    description:
      "Conventional crisis centers rush aid to where phones are ringing. When catastrophic physical shock severs all telecommunications, surviving cities dominate communications while epicenters lie in total extinction. PRATYAKSH-Ω inverts this bias: silence is treated as high-entropy proof of destruction.",
    keyMetric: { label: "Epistemological Mode", value: "Negative Evidence", color: "text-rose-400" },
    secondaryMetric: { label: "Reporting Bias Inversion", value: "100% Corrected", color: "text-emerald-400" },
    targetRoute: "/situation",
    routeLabel: "View Situation Overview",
    icon: ShieldAlert,
    visualType: "doctrine",
  },
  {
    id: "step-gis",
    code: "PHASE 02",
    badge: "CARTOGRAPHY // RADAR",
    title: "Live GIS Vector Cartography",
    subtitle: "Real-Time Geospatial Radar Across Central Nepal",
    description:
      "Dynamic interactive geospatial intelligence mapping 7 critical Himalayan palikas, USGS Shakemap seismic intensity contours, fault slip isolines, and real-time municipal lifeline overlays. Switch base maps from dark tactical satellite to topological terrain instantly.",
    keyMetric: { label: "Target Corridor", value: "Central Nepal (7 Palikas)", color: "text-[#38BDF8]" },
    secondaryMetric: { label: "Vector Cartography", value: "Sub-Second Refresh", color: "text-emerald-400" },
    targetRoute: "/gis-map",
    routeLabel: "Launch Live GIS Map",
    icon: Radar,
    visualType: "gis",
  },
  {
    id: "step-dedup",
    code: "PHASE 03",
    badge: "CONSENSUS // GRAPH ENGINE",
    title: "Incident Deduplication Ledger",
    subtitle: "Cosine Similarity & Connected-Components Graph Fusion",
    description:
      "Multi-agency disaster response is paralyzed by duplicate, fragmented reporting across Police, Army, Red Cross, and 112 citizen hotlines. Our natural language cosine embeddings cluster and deduplicate hundreds of noisy dispatches into a single verified consensus ledger.",
    keyMetric: { label: "Raw Reports Ingested", value: "147 Dispatches", color: "text-[#9AAABE]" },
    secondaryMetric: { label: "Deduplicated Consensus", value: "23 Verified Incidents", color: "text-[#34D399]" },
    targetRoute: "/deduplication",
    routeLabel: "Inspect Consensus Ledger",
    icon: Cpu,
    visualType: "dedup",
  },
  {
    id: "step-blackout",
    code: "PHASE 04",
    badge: "TELEMETRY // EXTINCTION",
    title: "Blackout Intel & Silent Sectors",
    subtitle: "Autonomous Detection of Severed Municipal Lifelines",
    description:
      "When a severe earthquake or landslide strikes, communications die. Blackout Intel continuously monitors 3 lifeline arteries: Cellular BTS Heartbeats, Electrical Grid Substation Loads, and Optical Fiber Flow. When expected heartbeats drop to zero, an emergency blackout alarm is raised.",
    keyMetric: { label: "Barpak BTS Outage", value: "0/48 Towers Active (100% Deficit)", color: "text-rose-400" },
    secondaryMetric: { label: "Substation SCADA Load", value: "0.0 MW (Trip State)", color: "text-amber-400" },
    targetRoute: "/blackout-intel",
    routeLabel: "Explore Blackout Intel",
    icon: Radio,
    visualType: "blackout",
  },
  {
    id: "step-bayesian",
    code: "PHASE 05",
    badge: "BAYESIAN // RECONSTRUCTION",
    title: "Bayesian Reality Reconstruction",
    subtitle: "PRATYAKSH-Ω Autonomous Damage Probability Inference",
    description:
      "Combining physical hazard models (USGS PGA > 0.8g, fault slip models) with observed lifeline extinction, our Bayesian engine computes the posterior probability of catastrophic structural collapse without requiring a single human telephone call from the disaster zone.",
    keyMetric: { label: "Posterior Catastrophe Belief", value: "94.2% Probability", color: "text-rose-400" },
    secondaryMetric: { label: "Bayesian Entropy", value: "Collapsed 2.84 → 0.18 bits", color: "text-[#38BDF8]" },
    targetRoute: "/hypotheses",
    routeLabel: "Open Bayesian Chamber",
    icon: Sparkles,
    visualType: "bayesian",
  },
  {
    id: "step-population",
    code: "PHASE 06",
    badge: "CENSUS // VULNERABILITY",
    title: "Population Exposure Analysis",
    subtitle: "CBS Nepal 2021 Census Fused with High-Hazard Footprints",
    description:
      "Disaster response must be humanitarian. PRATYAKSH-Ω intersects official CBS Nepal 2021 national census wards with physical damage footprints to calculate trapped demographic counts, focusing on elderly, pediatric, and unreinforced stone-masonry residential dwellings.",
    keyMetric: { label: "Exposed Population", value: "28,400 Citizens in Sector", color: "text-amber-400" },
    secondaryMetric: { label: "Mud/Stone Masonry Ratio", value: "88.6% High Vulnerability", color: "text-rose-400" },
    targetRoute: "/population",
    routeLabel: "View Population Exposure",
    icon: Users,
    visualType: "population",
  },
  {
    id: "step-dispatch",
    code: "PHASE 07",
    badge: "DISPATCH // OPTIMIZATION",
    title: "Tactical Rescue Dispatch",
    subtitle: "Utility-Maximizing Airborne & SAR Resource Routing",
    description:
      "Emergency rescue units are severely scarce. The Dispatch engine calculates the mathematical utility of assigning Heavy Urban SAR, Medical Field Trauma Units, Water Purification Plants, and Satellite Backhauls to sectors with highest life-saving probability.",
    keyMetric: { label: "Optimal Airlift", value: "Mi-17 Heavy SAR Airlift", color: "text-emerald-400" },
    secondaryMetric: { label: "Time to Dispatch", value: "T+35 min (Conventional: T+72h)", color: "text-[#38BDF8]" },
    targetRoute: "/dispatch",
    routeLabel: "Access Tactical Dispatch",
    icon: Truck,
    visualType: "dispatch",
  },
  {
    id: "step-sitrep",
    code: "PHASE 08",
    badge: "REPORTING // UN OCHA",
    title: "Standardized SITREP Briefing",
    subtitle: "Immediate Situation Report Generation & Command Distribution",
    description:
      "Generates standardized United Nations OCHA formatted Situation Reports in seconds. Aggregates all operational metrics, casualty forecasts, road accessibility matrices, and international aid logistics into a single actionable brief for multi-agency leadership.",
    keyMetric: { label: "Format Standard", value: "UN OCHA Flash SITREP", color: "text-white" },
    secondaryMetric: { label: "Operational Readiness", value: "100% Verified Ready", color: "text-emerald-400" },
    targetRoute: "/sitrep",
    routeLabel: "Generate SITREP Brief",
    icon: FileText,
    visualType: "sitrep",
  },
];

const AUTOPLAY_STEP_DURATION_SEC = 8;

export function CinematicTourModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const step = TOUR_STEPS[currentIdx];

  const handleNext = useCallback(() => {
    TacticalAudio.playClick();
    setProgress(0);
    setCurrentIdx((prev) => (prev + 1) % TOUR_STEPS.length);
  }, []);

  const handlePrev = useCallback(() => {
    TacticalAudio.playClick();
    setProgress(0);
    setCurrentIdx((prev) => (prev - 1 + TOUR_STEPS.length) % TOUR_STEPS.length);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Autoplay timer with progress bar
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = 100;
    const increment = 100 / ((AUTOPLAY_STEP_DURATION_SEC * 1000) / intervalMs);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying, handleNext]);

  if (!isOpen) return null;

  const navigateToModule = (route: string) => {
    TacticalAudio.playPing();
    onClose();
    router.push(route);
  };

  const StepIcon = step.icon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-300"
      style={{ backgroundColor: "rgba(3, 5, 8, 0.88)", backdropFilter: "blur(14px)" }}
    >
      {/* Background ambient radial aura */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[650px] pointer-events-none opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(232,16,58,0.3) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* Main Tour Container */}
      <div
        className="w-full max-w-5xl rounded-3xl border overflow-hidden relative z-10 shadow-2xl flex flex-col max-h-[92vh]"
        style={{
          backgroundColor: "rgba(10, 14, 23, 0.95)",
          borderColor: "var(--border-default)",
          boxShadow: "0 25px 60px -15px rgba(0,0,0,0.8), 0 0 40px rgba(232,16,58,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "rgba(15, 22, 35, 0.6)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono-data text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CINEMATIC TOUR</span>
            </div>
            <span className="text-white/20">|</span>
            <span className="font-mono-data text-xs text-[#5C6E84] hidden sm:inline">
              Step {currentIdx + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={() => {
                TacticalAudio.playClick();
                setIsPlaying(!isPlaying);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono-data text-xs transition-all cursor-pointer text-[#9AAABE] hover:text-white"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "rgba(255,255,255,0.03)" }}
              title="Toggle Auto-Advancing Tour"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3 text-rose-400" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline">Autoplay</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                TacticalAudio.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-[#9AAABE] hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/10"
              title="Close Tour (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar (Autoplay Indicator) */}
        <div className="w-full h-1 bg-white/5 relative shrink-0">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-100 ease-linear"
            style={{ width: isPlaying ? `${progress}%` : "0%" }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto flex-1">
          {/* Left Column: Narrative, Description & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-mono-data text-xs uppercase tracking-widest text-rose-400 font-bold">
                  {step.code} &bull; {step.badge}
                </span>
              </div>

              <h2
                className="font-display-calm font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight"
                style={{ textWrap: "balance" }}
              >
                {step.title}
              </h2>

              <div className="font-mono-data text-xs text-[#38BDF8] tracking-wide">
                {step.subtitle}
              </div>

              <p
                className="font-body-prose text-sm sm:text-base text-[#9AAABE] leading-relaxed max-w-[65ch]"
                style={{ textWrap: "pretty" }}
              >
                {step.description}
              </p>
            </div>

            {/* Live Metrics Showcase */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl border font-mono-data text-xs"
              style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", borderColor: "var(--border-subtle)" }}
            >
              <div className="p-2">
                <div className="text-[#5C6E84] text-[10px] uppercase tracking-wider">
                  {step.keyMetric.label}
                </div>
                <div className={`font-bold text-sm mt-1 ${step.keyMetric.color}`}>
                  {step.keyMetric.value}
                </div>
              </div>
              <div className="p-2 border-t sm:border-t-0 sm:border-l border-white/5">
                <div className="text-[#5C6E84] text-[10px] uppercase tracking-wider">
                  {step.secondaryMetric.label}
                </div>
                <div className={`font-bold text-sm mt-1 ${step.secondaryMetric.color}`}>
                  {step.secondaryMetric.value}
                </div>
              </div>
            </div>

            {/* Direct Jump CTA */}
            <div className="pt-2">
              <button
                onClick={() => navigateToModule(step.targetRoute)}
                className="btn-action-primary py-3 px-6 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <span>{step.routeLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Visual Stage / Tactical Diagram (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div
              className="w-full aspect-[4/3] rounded-2xl border p-5 relative overflow-hidden flex flex-col justify-between"
              style={{
                backgroundColor: "rgba(6, 8, 13, 0.9)",
                borderColor: "var(--border-default)",
                boxShadow: "inset 0 0 30px rgba(0,0,0,0.8)",
              }}
            >
              {/* Corner tactical tags */}
              <div className="flex items-center justify-between font-mono-data text-[10px] text-[#5C6E84] z-10">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>SIMULATION ACTIVE</span>
                </span>
                <span>SEC-{step.code.replace("PHASE ", "")}</span>
              </div>

              {/* Dynamic Interactive Mini-Visual Stage */}
              <div className="my-auto flex flex-col items-center justify-center text-center p-3 relative z-10">
                {step.visualType === "doctrine" && (
                  <div className="space-y-3 w-full">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div className="font-mono-data text-xs text-white font-bold">
                      INVERSION PROTOCOL
                    </div>
                    <div className="text-[11px] font-mono-data text-[#9AAABE] bg-black/40 p-2.5 rounded-lg border border-white/5">
                      P(Rupture | Silence) = 0.978
                      <div className="text-rose-400 text-[10px] mt-1">Silence ≠ Safety</div>
                    </div>
                  </div>
                )}

                {step.visualType === "gis" && (
                  <div className="space-y-3 w-full">
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-rose-500/30 animate-ping" />
                      <div className="absolute inset-2 rounded-full border border-cyan-500/40" />
                      <Radar className="w-8 h-8 text-[#38BDF8] animate-spin" style={{ animationDuration: "6s" }} />
                    </div>
                    <div className="font-mono-data text-[11px] text-[#CBD5E1]">
                      7 Central Nepal Sectors Monitored
                    </div>
                    <div className="text-[10px] font-mono-data text-emerald-400">
                      Coordinates: 28.2096° N, 84.6989° E
                    </div>
                  </div>
                )}

                {step.visualType === "dedup" && (
                  <div className="space-y-3 w-full">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div className="font-mono-data text-xs text-white font-bold">
                      147 Reports &rarr; 23 Incidents
                    </div>
                    <div className="text-[10px] font-mono-data text-[#34D399] bg-black/40 p-2 rounded-lg border border-white/5">
                      Cosine Sim Threshold: 0.82
                      <div className="text-[#5C6E84]">Zero Duplicate Helicopter Sorties</div>
                    </div>
                  </div>
                )}

                {step.visualType === "blackout" && (
                  <div className="space-y-2 w-full font-mono-data text-xs">
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex justify-between items-center">
                      <span>BTS Cellular:</span>
                      <span className="font-bold">0 / 48 (100% Outage)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex justify-between items-center">
                      <span>Power Substation:</span>
                      <span className="font-bold">0.0 MW (Tripped)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex justify-between items-center">
                      <span>Fiber Backbone:</span>
                      <span className="font-bold">Severed (0 Mbps)</span>
                    </div>
                  </div>
                )}

                {step.visualType === "bayesian" && (
                  <div className="space-y-3 w-full">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="font-mono-data text-xs text-white font-bold">
                      Posterior Probability: 94.2%
                    </div>
                    <div className="w-full bg-black/40 p-2 rounded-lg border border-white/5 font-mono-data text-[10px] text-[#CBD5E1]">
                      Entropy Collapse: 2.84 &rarr; 0.18 bits
                    </div>
                  </div>
                )}

                {step.visualType === "population" && (
                  <div className="space-y-3 w-full">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="font-mono-data text-xs text-white font-bold">
                      28,400 Citizens in Footprint
                    </div>
                    <div className="text-[10px] font-mono-data text-amber-400 bg-black/40 p-2 rounded-lg border border-white/5">
                      CBS Nepal Census 2021 Fused
                    </div>
                  </div>
                )}

                {step.visualType === "dispatch" && (
                  <div className="space-y-3 w-full">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div className="font-mono-data text-xs text-emerald-400 font-bold">
                      Mi-17 Air Vector Queued
                    </div>
                    <div className="text-[10px] font-mono-data text-[#9AAABE] bg-black/40 p-2 rounded-lg border border-white/5">
                      Route: Pokhara &rarr; Barpak High Ground
                    </div>
                  </div>
                )}

                {step.visualType === "sitrep" && (
                  <div className="space-y-3 w-full">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="font-mono-data text-xs text-white font-bold">
                      UN OCHA Flash SITREP Ready
                    </div>
                    <div className="text-[10px] font-mono-data text-[#38BDF8] bg-black/40 p-2 rounded-lg border border-white/5">
                      Export Standard: UN OCHA Formatted Brief
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom live ticker */}
              <div className="font-mono-data text-[10px] text-[#5C6E84] flex items-center justify-between border-t border-white/5 pt-2 z-10">
                <span>RADAR: SYNCHRONOUS</span>
                <span className="text-[#9AAABE]">{step.targetRoute}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Strip */}
        <div
          className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0"
          style={{ borderColor: "var(--border-subtle)", backgroundColor: "rgba(15, 22, 35, 0.8)" }}
        >
          {/* Step Pill Indicators */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {TOUR_STEPS.map((s, idx) => {
              const isActive = idx === currentIdx;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    TacticalAudio.playClick();
                    setCurrentIdx(idx);
                    setProgress(0);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? "w-8 bg-rose-500 shadow-sm shadow-rose-500/50"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  title={`${s.code}: ${s.title}`}
                />
              );
            })}
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="btn-action-secondary flex items-center gap-1 py-2 px-3.5 rounded-xl text-xs font-mono-data cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNext}
              className="btn-action-primary flex items-center gap-1 py-2 px-4 rounded-xl text-xs font-mono-data font-bold cursor-pointer"
            >
              <span>Next Phase</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
