"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Radar,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Layers,
  Cpu,
  Users,
  Truck,
  MapPin,
  Flame,
  Waves,
  Mountain,
  Activity,
  Wind,
  PhoneCall,
  Zap,
  Server,
  FileText,
  Sparkles,
  BookOpen,
  Database,
  Terminal,
  LogIn,
  Compass,
  ChevronDown,
  Radio,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { TacticalAudio } from "@/lib/TacticalAudio";
import {
  fetchAllLocationsStatus,
  fetchSimulationState,
  fetchPopulationExposure,
  LocationStatusItem,
  SimulationState,
  AllPopulationExposureResponse,
} from "@/lib/api";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { StickyStackFallacy } from "@/components/StickyStackFallacy";
import { MultiHazardPhysicsShowcase } from "@/components/MultiHazardPhysicsShowcase";
import { BayesianEntropyChamber } from "@/components/BayesianEntropyChamber";
import { KineticTelemetryRibbon } from "@/components/KineticTelemetryRibbon";

interface DossierSectionMeta {
  id: string;
  code: string;
  label: string;
  shortLabel: string;
}

const DOSSIER_SECTIONS: DossierSectionMeta[] = [
  { id: "dossier-overview", code: "01", label: "Platform Overview", shortLabel: "Overview" },
  { id: "dossier-doctrine", code: "02", label: "The Core Doctrine", shortLabel: "Doctrine" },
  { id: "dossier-fallacy", code: "03", label: "Silent Zone Fallacy", shortLabel: "Fallacy" },
  { id: "dossier-capabilities", code: "04", label: "Six Engines & Physics", shortLabel: "Engines" },
  { id: "dossier-telemetry", code: "05", label: "Lifeline Matrix", shortLabel: "Telemetry" },
  { id: "dossier-bayesian", code: "06", label: "Bayesian Reasoning", shortLabel: "Bayesian" },
  { id: "dossier-archetypes", code: "07", label: "Disaster Archetypes", shortLabel: "Archetypes" },
  { id: "dossier-scenario", code: "08", label: "Barpak Counterfactual", shortLabel: "Barpak" },
  { id: "dossier-provenance", code: "09", label: "Data Provenance", shortLabel: "Data" },
  { id: "dossier-glossary", code: "10", label: "Operational Glossary", shortLabel: "Glossary" },
  { id: "dossier-brief", code: "11", label: "Executive Brief", shortLabel: "Brief" },
];

const LIFELINE_DATA = [
  {
    icon: PhoneCall,
    label: "Mobile Cellular BTS",
    iconColor: "var(--status-intel-text)",
    baseline: "48 Towers (100%)",
    expected: "47 Towers (98.5%)",
    observed: "0 Towers (0.0%)",
    deficit: "-100%",
    status: "OUTAGE",
    statusClass: "chip-critical",
  },
  {
    icon: Zap,
    label: "Electricity Substation",
    iconColor: "var(--status-warning-text)",
    baseline: "18.5 MW Load",
    expected: "19.2 MW Expected",
    observed: "0.0 MW (Trip)",
    deficit: "-100%",
    status: "GRID_TRIP",
    statusClass: "chip-critical",
  },
  {
    icon: Server,
    label: "Optical Fiber Backbone",
    iconColor: "var(--status-blackout-text)",
    baseline: "1,200 Mbps Flow",
    expected: "1,150 Mbps Expected",
    observed: "0 Mbps (Cut)",
    deficit: "-100%",
    status: "FIBER_CUT",
    statusClass: "chip-critical",
  },
  {
    icon: Compass,
    label: "Highway Passability",
    iconColor: "var(--status-ok-text)",
    baseline: "98% Arterial Open",
    expected: "95% Clear Weather",
    observed: "0% (Choked)",
    deficit: "-100%",
    status: "ROAD_CHOKE",
    statusClass: "chip-critical",
  },
];

const MATH_FOUNDATIONS = [
  {
    index: "01",
    label: "Diurnal Baseline Curve",
    sublabel: "Signal Model",
    colorClass: "text-[color:var(--accent)]",
    textClass: "text-rose-300",
    formula: "A(t) = BaseRate · [0.15 + 0.85 · sin²(π(h−4)/24)] · f_day(d)",
    body: "Establishes expected call volume per sector at hour h and weekday d, grounding expected reality before detecting silent zones.",
  },
  {
    index: "02",
    label: "Negative Evidence Gap",
    sublabel: "Z-Score Metric",
    colorClass: "text-[color:var(--amber-500)]",
    textClass: "text-amber-300",
    formula: "Z = (Observed − ExpectedMean) / max(0.1, σ_expected)",
    body: "Flags critical communication blackouts (Z ≤ −2.0 or Observed=0) when an active population unexpectedly goes silent.",
  },
  {
    index: "03",
    label: "Bayesian Belief Updating",
    sublabel: "Log-Sum-Exp Softmax",
    colorClass: "text-[color:var(--status-ok-text)]",
    textClass: "text-emerald-300",
    formula: "log P(Hᵢ|E) = log P(Hᵢ) + Σ w_eff,j · Λ(Hᵢ, eⱼ)",
    body: "Dynamically updates posterior beliefs across 5 physical hypotheses without mathematical numerical underflow.",
  },
  {
    index: "04",
    label: "Shannon Information Gain",
    sublabel: "Active Verification",
    colorClass: "text-[color:var(--status-intel-text)]",
    textClass: "text-blue-300",
    formula: "ΔH(a) = H(P) − E[H(P|O_a)]  ·  H(P) = −Σ P(Hᵢ)·log₂P(Hᵢ)",
    body: "Ranks candidate drone, radar, and patrol reconnaissance actions to maximize uncertainty entropy reduction per sortie dollar.",
  },
];

// Reusable scroll-reveal wrapper using IntersectionObserver
function RevealOnScroll({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Animated radar ring component for hero
function RadarPulse({ size = 320 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Static grid circles */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: `${(i / 4) * size}px`,
            height: `${(i / 4) * size}px`,
            borderColor: `rgba(232,16,58,${0.06 + i * 0.02})`,
          }}
        />
      ))}
      {/* Crosshair lines */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 right-0 h-px" style={{ backgroundColor: "rgba(232,16,58,0.08)" }} />
        <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ backgroundColor: "rgba(232,16,58,0.08)" }} />
      </div>
      {/* Sweeping scan line */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{ animation: "radar-sweep 4s linear infinite" }}
      >
        <div
          className="absolute top-1/2 left-1/2 w-1/2 origin-left"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, rgba(232,16,58,0.8) 0%, transparent 100%)",
            transform: "translateY(-50%)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: 0,
            left: "50%",
            width: "50%",
            height: "100%",
            background:
              "conic-gradient(from 0deg at 0 50%, rgba(232,16,58,0.15) 0deg, transparent 60deg)",
            transformOrigin: "0 50%",
          }}
        />
      </div>
      {/* Center dot */}
      <div className="relative z-10 w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/60 animate-pulse" />
      {/* Blip dots */}
      {[
        { x: "30%", y: "25%", color: "var(--status-critical)", size: 5 },
        { x: "65%", y: "45%", color: "var(--status-warning)", size: 4 },
        { x: "20%", y: "60%", color: "var(--status-critical)", size: 6 },
        { x: "75%", y: "70%", color: "var(--status-intel)", size: 3 },
        { x: "55%", y: "20%", color: "var(--status-ok)", size: 4 },
      ].map((blip, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-pulse"
          style={{
            left: blip.x,
            top: blip.y,
            width: blip.size,
            height: blip.size,
            backgroundColor: blip.color,
            boxShadow: `0 0 6px 2px ${blip.color}`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: "2.5s",
          }}
        />
      ))}
    </div>
  );
}

// Minimal section label — not an eyebrow, just a structural index marker
function SectionIndex({ code, color = "var(--fg-tertiary)" }: { code: string; color?: string }) {
  return (
    <span
      className="font-mono-data"
      style={{
        fontSize: "0.6875rem",
        letterSpacing: "0.12em",
        color,
        opacity: 0.6,
      }}
    >
      {code}
    </span>
  );
}

export default function ContinuousDossierLandingPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("dossier-overview");
  const isClickScrolling = useRef(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Live telemetry data states migrated from situation/overview
  const [locations, setLocations] = useState<LocationStatusItem[]>([]);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [exposureData, setExposureData] = useState<AllPopulationExposureResponse | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [locsRes, sim, exp] = await Promise.all([
        fetchAllLocationsStatus().catch(() => ({ locations: [] })),
        fetchSimulationState().catch(() => null),
        fetchPopulationExposure().catch(() => null),
      ]);
      if (locsRes?.locations) setLocations(locsRes.locations);
      if (sim) setSimulationState(sim);
      if (exp) setExposureData(exp);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [loadData]);

  const summaryCounts = locations.reduce((acc: Record<string, number>, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const activeCriticalCount =
    (summaryCounts.verified_damaged || 0) + (summaryCounts.blackout || 0) || 6;
  const totalExposed = exposureData?.total_national_exposed_population
    ? exposureData.total_national_exposed_population / 1_000_000
    : 2.14;
  const missing = exposureData?.total_missing_persons || 412;

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      if (isClickScrolling.current) return;
      const scrollPosition = window.scrollY + 180;
      let currentSection = DOSSIER_SECTIONS[0].id;
      for (const section of DOSSIER_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) currentSection = section.id;
        }
      }
      setActiveSection((prev) => (prev !== currentSection ? currentSection : prev));

      // Progress bar
      if (progressRef.current) {
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
        progressRef.current.style.width = `${progress}%`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    TacticalAudio.playClick();
    isClickScrolling.current = true;
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 110;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - topOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setTimeout(() => { isClickScrolling.current = false; }, 700);
    } else {
      isClickScrolling.current = false;
    }
  };

  const activeIdx = DOSSIER_SECTIONS.findIndex((s) => s.id === activeSection);

  return (
    <div
      className="w-full min-h-screen relative selection:bg-rose-500 selection:text-white"
      style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-primary)" }}
    >
      {/* Reading progress bar — thin crimson line at very top */}
      <div
        className="fixed top-0 left-0 z-[100] h-[2px] pointer-events-none"
        style={{ backgroundColor: "var(--bg-void)", width: "100%" }}
      >
        <div
          ref={progressRef}
          className="h-full transition-none"
          style={{ backgroundColor: "var(--accent)", width: "0%" }}
        />
      </div>

      {/* ================================================================== */}
      {/* COMPACT DOSSIER SCROLL-SPY SUBNAV                                  */}
      {/* ================================================================== */}
      <div
        className="sticky top-[53px] z-40 w-full"
        style={{
          backgroundColor: "rgba(8, 11, 15, 0.96)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-faint)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: "none" }}>
            {/* Dossier label */}
            <span
              className="font-mono-data shrink-0 mr-4 hidden sm:block"
              style={{ fontSize: "0.6rem", letterSpacing: "0.18em", color: "var(--fg-disabled)", textTransform: "uppercase" }}
            >
              DSR
            </span>

            {DOSSIER_SECTIONS.map((sec, i) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className="relative shrink-0 flex items-center gap-1.5 cursor-pointer"
                  style={{
                    padding: "12px 14px",
                    borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                    color: isActive ? "var(--fg-primary)" : "var(--fg-tertiary)",
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                >
                  <span
                    className="font-mono-data"
                    style={{ fontSize: "0.55rem", letterSpacing: "0.08em", opacity: 0.5 }}
                  >
                    {sec.code}
                  </span>
                  <span
                    className="font-display-calm font-medium"
                    style={{ fontSize: "0.7rem", letterSpacing: "0.01em", whiteSpace: "nowrap" }}
                  >
                    {sec.shortLabel}
                  </span>
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 w-1 h-1 rounded-full -translate-x-1/2 translate-y-1/2"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                  )}
                </button>
              );
            })}

            {/* Section progress fraction — far right */}
            <div className="ml-auto pl-4 shrink-0 hidden md:flex items-center gap-2">
              <span className="font-mono-data text-[10px] tabular-nums" style={{ color: "var(--fg-disabled)" }}>
                {String(activeIdx + 1).padStart(2, "0")}/{String(DOSSIER_SECTIONS.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 01. ASYMMETRIC HERO — FULL VIEWPORT, SPLIT LAYOUT                   */}
      {/* ================================================================== */}
      <section
        id="dossier-overview"
        className="relative overflow-hidden"
        style={{ minHeight: "100dvh", backgroundColor: "var(--bg-base)" }}
      >
        {/* Background: subtle coordinate grid */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Crimson atmospheric glow */}
        <div
          aria-hidden
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: "60vw",
            height: "70vh",
            background: "radial-gradient(ellipse at top right, rgba(232,16,58,0.12) 0%, transparent 65%)",
          }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-0 pointer-events-none"
          style={{
            width: "40vw",
            height: "50vh",
            background: "radial-gradient(ellipse at bottom left, rgba(56,189,248,0.05) 0%, transparent 60%)",
          }}
        />

        {/* Main hero grid: left text / right radar */}
        <div
          className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-12"
          style={{ minHeight: "100dvh", display: "grid", alignContent: "center", gap: "2rem" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-center">
            {/* LEFT: Display typography + CTAs */}
            <div className="space-y-8">
              {/* Status indicator — not an eyebrow, inline with brand mark */}
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-mono-data" style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: "var(--accent)", textTransform: "uppercase" }}>
                  PRATYAKSH-Ω (प्रत्यक्ष)
                </span>
                <span style={{ color: "var(--border-subtle)" }}>·</span>
                <span className="font-mono-data hidden sm:inline" style={{ fontSize: "0.65rem", color: "var(--fg-tertiary)" }}>
                  Direct Empirical Perception
                </span>
              </div>

              {/* Display headline — kinetic 3-line reveal */}
              <div>
                <h1
                  className="font-display-calm font-bold"
                  style={{
                    fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)",
                    lineHeight: "var(--lh-tight)",
                    letterSpacing: "var(--ls-hero)",
                    color: "var(--fg-primary)",
                    fontOpticalSizing: "auto",
                    fontFeatureSettings: '"kern" 1, "liga" 1, "ss01" 1',
                  }}
                >
                  {/* Line 1 */}
                  <span
                    className="block overflow-hidden"
                    style={{ lineHeight: "inherit", paddingBottom: "0.04em" }}
                  >
                    <span
                      className="anim-reveal-line"
                      style={{ animationDelay: "80ms" }}
                    >
                      Autonomous
                    </span>
                  </span>
                  {/* Line 2 */}
                  <span
                    className="block overflow-hidden"
                    style={{ lineHeight: "inherit", paddingBottom: "0.04em" }}
                  >
                    <span
                      className="anim-reveal-line"
                      style={{ animationDelay: "200ms" }}
                    >
                      Disaster Reality
                    </span>
                  </span>
                  {/* Line 3 — accent word with char flicker */}
                  <span
                    className="block overflow-hidden"
                    style={{ lineHeight: "inherit" }}
                  >
                    <span
                      className="anim-reveal-line"
                      style={{ animationDelay: "330ms", color: "var(--accent)" }}
                    >
                      <span className="anim-char-flicker">Reconstruction.</span>
                    </span>
                  </span>
                </h1>
              </div>

              {/* Subtext — staggered lead text with proper measure + text-wrap: pretty */}
              <p
                className="font-body-prose anim-fade-left"
                style={{
                  fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
                  color: "var(--fg-secondary)",
                  maxWidth: "52ch",
                  lineHeight: "var(--lh-body)",
                  textWrap: "pretty",
                  animationDelay: "480ms",
                  fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
                }}
              >
                A multi-agency crisis intelligence platform that illuminates silent, severed disaster zones — directing emergency assets where communications have been completely annihilated.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {user ? (
                  <Link
                    href="/situation"
                    onClick={() => TacticalAudio.playPing()}
                    className="btn-action-primary flex items-center gap-2.5"
                    style={{ padding: "0.7rem 1.6rem", fontSize: "0.8125rem" }}
                  >
                    <Radar className="w-4 h-4" />
                    <span>Enter Operational Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/auth"
                    onClick={() => TacticalAudio.playPing()}
                    className="btn-action-primary flex items-center gap-2.5"
                    style={{ padding: "0.7rem 1.6rem", fontSize: "0.8125rem" }}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In & Launch</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                <button
                  onClick={() => scrollToSection("dossier-doctrine")}
                  className="btn-action-secondary flex items-center gap-2"
                  style={{ padding: "0.7rem 1.4rem", fontSize: "0.8125rem" }}
                >
                  <span>Read Dossier</span>
                  <ChevronDown className="w-4 h-4" style={{ color: "var(--status-intel-text)" }} />
                </button>
              </div>

              {/* Live KPI strip — 3 metrics, horizontal bar */}
              <div
                className="grid grid-cols-3 gap-px overflow-hidden"
                style={{
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--border-faint)",
                }}
              >
                {[
                  {
                    label: "Critical Sectors",
                    value: <AnimatedCounter value={activeCriticalCount} />,
                    color: "var(--status-critical-text)",
                    sublabel: "Active Blackout",
                  },
                  {
                    label: "Exposed Population",
                    value: <AnimatedCounter value={totalExposed} isDecimal suffix="M" />,
                    color: "var(--fg-primary)",
                    sublabel: "8 Districts, Nepal",
                  },
                  {
                    label: "Unaccounted Persons",
                    value: <AnimatedCounter value={missing} />,
                    color: "var(--amber-400)",
                    sublabel: "Probabilistic Ledger",
                  },
                ].map((kpi, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-0.5 bg-[#0d121b]"
                    style={{ padding: "clamp(0.75rem, 1.5vw, 1.1rem)" }}
                  >
                    <span
                      className="font-mono-data"
                      style={{ fontSize: "0.6rem", color: "var(--fg-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em" }}
                    >
                      {kpi.label}
                    </span>
                    <span
                      className="font-display-calm font-bold tabular-nums"
                      style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: kpi.color, lineHeight: 1.1 }}
                    >
                      {kpi.value}
                    </span>
                    <span className="font-mono-data" style={{ fontSize: "0.65rem", color: "var(--fg-secondary)" }}>
                      {kpi.sublabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Radar visualization + operational status */}
            <div className="hidden lg:flex flex-col items-center gap-6">
              <div className="relative">
                <RadarPulse size={340} />
                {/* Operational overlay card */}
                <div
                  className="absolute -bottom-4 -right-4 surface-glass rounded-xl p-3 min-w-[160px]"
                  style={{ border: "1px solid var(--border-default)" }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono-data text-[10px] text-emerald-400 uppercase tracking-wider">Active Scan</span>
                  </div>
                  <div className="font-mono-data text-[10px] text-[#5C6E84] space-y-0.5">
                    <div className="flex justify-between gap-3">
                      <span>Sectors</span>
                      <span className="text-white">7 / 7</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>BTS Down</span>
                      <span className="text-rose-400">48 / 48</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Confidence</span>
                      <span className="text-amber-400">94.1%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mission classification block */}
              <div
                className="w-full rounded-xl p-4 font-mono-data text-[10px] leading-relaxed"
                style={{
                  border: "1px solid var(--border-faint)",
                  backgroundColor: "rgba(13, 18, 27, 0.6)",
                  color: "var(--fg-tertiary)",
                }}
              >
                <div className="text-rose-400 mb-2 font-bold tracking-wider uppercase">Classification</div>
                <div>PRATYAKSH-Ω / DSR v4.2</div>
                <div>UNRESTRICTED PUBLIC DOSSIER</div>
                <div className="mt-1 pt-1" style={{ borderTop: "1px solid var(--border-faint)" }}>
                  <span className="text-emerald-400">COVERAGE:</span> Gorkha · Lamjung ·
                  <br />
                  Rasuwa · Sindhupalchok · Dolakha
                </div>
              </div>
            </div>
          </div>

          {/* Scroll cue — bottom of hero */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer opacity-50 hover:opacity-80 transition-opacity"
            onClick={() => scrollToSection("dossier-doctrine")}
          >
            <span className="font-mono-data" style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--fg-tertiary)", textTransform: "uppercase" }}>
              Scroll
            </span>
            <div
              className="w-px h-12"
              style={{
                background: "linear-gradient(to bottom, var(--fg-tertiary), transparent)",
              }}
            />
          </div>
        </div>
      </section>

      {/* Streaming Live Telemetry Ribbon */}
      <KineticTelemetryRibbon />

      {/* ================================================================== */}
      {/* 02. THE CORE DOCTRINE — Editorial blockquote layout                 */}
      {/* ================================================================== */}
      <section
        id="dossier-doctrine"
        className="py-24 px-6 sm:px-12 lg:px-20 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Asymmetric composition: index left, content right offset */}
          <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr] gap-8 lg:gap-16">
            <div className="hidden lg:flex flex-col items-center pt-2">
              <SectionIndex code="02" color="var(--accent)" />
              <div className="w-px flex-1 mt-3" style={{ backgroundColor: "var(--border-faint)", minHeight: "120px" }} />
            </div>

            <div className="space-y-12">
              <RevealOnScroll>
                <h2
                  className="font-display-calm font-bold"
                  style={{
                    fontSize: "clamp(1.75rem, 4vw, 3.25rem)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                    color: "var(--fg-primary)",
                  }}
                >
                  The Core Doctrine:<br />
                  <em style={{ fontStyle: "italic", color: "var(--fg-secondary)", fontWeight: 500 }}>
                    Silence is not safety.
                  </em>
                </h2>
              </RevealOnScroll>

              <RevealOnScroll delay={100}>
                <blockquote
                  className="relative font-quote-display"
                  style={{
                    fontSize: "clamp(1.05rem, 2vw, 1.3rem)",
                    color: "var(--fg-secondary)",
                    lineHeight: 1.65,
                    paddingLeft: "2rem",
                    borderLeft: "2px solid var(--accent)",
                    maxWidth: "70ch",
                  }}
                >
                  &ldquo;In catastrophic terrain, the absence of distress signals is not evidence of safety. It is direct, empirical evidence that observation channels have been completely severed.&rdquo;
                </blockquote>
              </RevealOnScroll>

              <RevealOnScroll delay={200}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      num: "01",
                      title: "The Reporting Bias Trap",
                      color: "var(--accent)",
                      body: "When catastrophe strikes, traditional command centres direct emergency resources to wherever the phone is ringing. Urban centres with superficial damage dominate radio frequencies, while rural epicenters with 100% infrastructure collapse remain completely silent.",
                    },
                    {
                      num: "02",
                      title: "The Epistemological Inversion",
                      color: "var(--status-intel)",
                      body: "PRATYAKSH-Ω treats silence as high-entropy data. By pairing seismic models with real-time cellular, electrical, and fiber telemetry, the system calculates a Lifeline Deficit. When deficit reaches 100%, catastrophic blackout is declared.",
                    },
                  ].map((card) => (
                    <div
                      key={card.num}
                      className="p-6 rounded-xl border space-y-3 transition-colors"
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        borderColor: "var(--border-default)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center font-mono-data font-bold text-[11px]"
                          style={{ backgroundColor: `${card.color}18`, border: `1px solid ${card.color}40`, color: card.color }}
                        >
                          {card.num}
                        </div>
                        <h3
                          className="font-display-calm font-semibold"
                          style={{ fontSize: "0.9375rem", color: "var(--fg-primary)" }}
                        >
                          {card.title}
                        </h3>
                      </div>
                      <p className="font-body-prose" style={{ fontSize: "0.8125rem", color: "var(--fg-secondary)" }}>
                        {card.body}
                      </p>
                    </div>
                  ))}
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 03. SILENT ZONE FALLACY — Full-bleed interactive stack              */}
      {/* ================================================================== */}
      <section id="dossier-fallacy" className="border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <StickyStackFallacy />
      </section>

      {/* ================================================================== */}
      {/* 04. SIX AUTONOMOUS ENGINES — Numbered horizontal list + simulator   */}
      {/* ================================================================== */}
      <section
        id="dossier-capabilities"
        className="py-24 px-6 sm:px-12 lg:px-20 border-b"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        <div className="max-w-6xl mx-auto space-y-14">
          <RevealOnScroll>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="mb-3">
                  <SectionIndex code="04" />
                </div>
                <h2
                  className="font-display-calm font-bold"
                  style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.08 }}
                >
                  Six Autonomous Engines
                </h2>
              </div>
              <p
                className="font-body-prose"
                style={{ fontSize: "0.875rem", maxWidth: "45ch", color: "var(--fg-secondary)", lineHeight: 1.7, flexShrink: 0 }}
              >
                From raw seismic wave arrivals to tactical helicopter dispatch vectors — an end-to-end multi-agency chain in under 35 minutes.
              </p>
            </div>
          </RevealOnScroll>

          {/* Engine list — numbered dividers, not cards */}
          <div className="divide-y" style={{ borderColor: "var(--border-faint)" }}>
            {[
              {
                icon: Layers,
                code: "ENGINE 01",
                title: "Live GIS Cartography",
                desc: "Leaflet vector radar cartography tracking 7 target sectors, fault slip isolines, and real-time lifeline status overlays.",
                accent: "var(--status-intel)",
              },
              {
                icon: Cpu,
                code: "ENGINE 02",
                title: "Graph Deduplication",
                desc: "Cosine similarity and connected-components clustering reconcile redundant multi-agency dispatch reports into unified ground truth.",
                accent: "var(--status-ok)",
              },
              {
                icon: Radio,
                code: "ENGINE 03",
                title: "Blackout Intelligence",
                desc: "Detects complete telemetry extinction across mobile BTS, electrical grids, and optical fiber backbones in silent sectors.",
                accent: "var(--status-critical)",
              },
              {
                icon: Sparkles,
                code: "ENGINE 04",
                title: "Bayesian Reconstruction",
                desc: "Combines prior physical vulnerability with sparse sensor evidence to reconstruct ground truth damage distribution.",
                accent: "var(--status-blackout)",
              },
              {
                icon: Users,
                code: "ENGINE 05",
                title: "Population Exposure",
                desc: "Integrates CBS Nepal 2021 census data with Ward-level palika boundary polygons to calculate trapped demographic counts.",
                accent: "var(--amber-400)",
              },
              {
                icon: Truck,
                code: "ENGINE 06",
                title: "Prioritized Dispatch",
                desc: "Calculates utility-maximizing tactical dispatch vectors for heavy SAR, medical airlifts, and water purification units.",
                accent: "var(--accent)",
              },
            ].map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <RevealOnScroll key={idx} delay={idx * 50}>
                  <div
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-6 py-5 group cursor-default"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        backgroundColor: `${cap.accent}14`,
                        border: `1px solid ${cap.accent}30`,
                      }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: cap.accent, width: 18, height: 18 }} />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span
                        className="font-mono-data block"
                        style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: "var(--fg-tertiary)", textTransform: "uppercase" }}
                      >
                        {cap.code}
                      </span>
                      <h3
                        className="font-display-calm font-semibold"
                        style={{ fontSize: "0.9375rem", color: "var(--fg-primary)" }}
                      >
                        {cap.title}
                      </h3>
                      <p
                        className="font-body-prose"
                        style={{ fontSize: "0.8rem", color: "var(--fg-secondary)", maxWidth: "none" }}
                      >
                        {cap.desc}
                      </p>
                    </div>
                    <ArrowRight
                      className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: cap.accent }}
                    />
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>

          {/* Interactive Multi-Hazard Physics Showcase */}
          <RevealOnScroll delay={100}>
            <div>
              <div
                className="font-mono-data flex items-center gap-2 mb-5"
                style={{ fontSize: "0.7rem", color: "var(--status-intel-text)", textTransform: "uppercase", letterSpacing: "0.1em" }}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Interactive Multi-Hazard Physics Simulator</span>
              </div>
              <MultiHazardPhysicsShowcase />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 05. LIFELINE TELEMETRY MATRIX                                       */}
      {/* ================================================================== */}
      <section
        id="dossier-telemetry"
        className="py-24 px-6 sm:px-12 lg:px-20 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-6xl mx-auto space-y-10">
          <RevealOnScroll>
            <div>
              <SectionIndex code="05" />
              <h2
                className="font-display-calm font-bold mt-3"
                style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.08 }}
              >
                Expected vs. Observed Reality
              </h2>
              <p
                className="font-body-prose mt-4"
                style={{ fontSize: "0.875rem", color: "var(--fg-secondary)", maxWidth: "60ch", lineHeight: 1.7 }}
              >
                Continuous multi-sensor audits compare historical diurnal baselines with observed telemetry to detect negative evidence gaps (Z ≤ −2.0).
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={150}>
            <div
              className="overflow-hidden rounded-xl border"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-default)",
                boxShadow: "0 24px 48px -16px rgba(0,0,0,0.6)",
              }}
            >
              <div
                className="flex flex-wrap items-center justify-between gap-4 font-mono-data p-4 border-b text-[11px]"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "rgba(0,0,0,0.3)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span style={{ color: "var(--fg-tertiary)", textTransform: "uppercase" }}>Sample Audit Sector:</span>
                  <strong className="text-white">Gorkha (Barpak Ridge Epicenter)</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--fg-tertiary)" }}>Silent Zone Risk:</span>
                  <span className="chip-critical">9.4 / 10.0 CRITICAL_BLACKOUT</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono-data text-xs">
                  <thead
                    className="border-b text-[11px] uppercase tracking-wider bg-black/20"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--fg-tertiary)" }}
                  >
                    <tr>
                      {["Lifeline Vector", "Historical Baseline", "Expected Reality", "Observed Evidence", "Deficit", "Status"].map((h) => (
                        <th key={h} className="p-3.5 font-normal">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5" style={{ color: "var(--fg-primary)" }}>
                    {LIFELINE_DATA.map((row, i) => {
                      const Icon = row.icon;
                      return (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3.5 font-semibold flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: row.iconColor }} />
                            <span>{row.label}</span>
                          </td>
                          <td className="p-3.5" style={{ color: "var(--fg-secondary)" }}>{row.baseline}</td>
                          <td className="p-3.5" style={{ color: "var(--fg-secondary)" }}>{row.expected}</td>
                          <td className="p-3.5 font-bold" style={{ color: "var(--status-critical-text)" }}>{row.observed}</td>
                          <td className="p-3.5 font-bold text-right" style={{ color: "var(--status-critical-text)" }}>{row.deficit}</td>
                          <td className="p-3.5 text-right">
                            <span className={row.statusClass}>{row.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 06. BAYESIAN ENTROPY CHAMBER & MATH                                 */}
      {/* ================================================================== */}
      <section
        id="dossier-bayesian"
        className="py-24 px-6 sm:px-12 lg:px-20 border-b"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <RevealOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end">
              <div>
                <SectionIndex code="06" color="var(--status-intel-text)" />
                <h2
                  className="font-display-calm font-bold mt-3"
                  style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.08 }}
                >
                  Deterministic Mathematical Rigor
                </h2>
              </div>
              <p
                className="font-body-prose"
                style={{ fontSize: "0.8125rem", color: "var(--fg-secondary)", maxWidth: "38ch", lineHeight: 1.7 }}
              >
                Every disaster inference is traceable to first-principles formulas rather than black-box guesses.
              </p>
            </div>
          </RevealOnScroll>

          {/* Interactive Bayesian Chamber */}
          <RevealOnScroll delay={100}>
            <BayesianEntropyChamber />
          </RevealOnScroll>

          {/* Mathematical Formulations Grid */}
          <RevealOnScroll delay={150}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4">
              {MATH_FOUNDATIONS.map((f) => (
                <div
                  key={f.index}
                  className="p-5 rounded-xl border space-y-3"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-default)",
                  }}
                >
                  <div className="flex items-center justify-between font-mono-data text-[11px] uppercase tracking-wider">
                    <span className={f.colorClass}>{f.label}</span>
                    <span style={{ color: "var(--fg-tertiary)" }}>{f.sublabel}</span>
                  </div>
                  <div
                    className="font-mono-data text-[11px] p-3 rounded-lg text-center leading-relaxed"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <span className={f.textClass}>{f.formula}</span>
                  </div>
                  <p
                    className="font-body-prose"
                    style={{ fontSize: "0.8rem", color: "var(--fg-secondary)", maxWidth: "none" }}
                  >
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 07. DISASTER ARCHETYPES — Editorial accordion-style rows            */}
      {/* ================================================================== */}
      <section
        id="dossier-archetypes"
        className="py-24 px-6 sm:px-12 lg:px-20 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <RevealOnScroll>
            <div>
              <SectionIndex code="07" color="var(--amber-400)" />
              <h2
                className="font-display-calm font-bold mt-3"
                style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.08 }}
              >
                Five Disaster Archetypes
              </h2>
              <p
                className="font-body-prose mt-4"
                style={{ fontSize: "0.875rem", color: "var(--fg-secondary)", maxWidth: "58ch", lineHeight: 1.7 }}
              >
                PRATYAKSH-Ω models distinct physical failure dynamics across the Himalayan orogenic belt and south-Asian river basins.
              </p>
            </div>
          </RevealOnScroll>

          <div className="space-y-0 divide-y" style={{ borderColor: "var(--border-faint)" }}>
            {[
              {
                icon: Activity,
                title: "M7.8+ Megathrust Earthquake",
                location: "Central Nepal Main Himalayan Thrust (MHT)",
                mechanism: "Rupture velocity 3.1 km/s propagating eastward along the decollement. Severe hanging-wall acceleration (PGA > 0.6g) causes total masonry shearing in ridge settlements.",
                epistemology: "Instantaneous BTS power decapitation creates false negative calm in mountain epicenters while capital phone networks jam with non-critical traffic.",
                accentColor: "var(--status-critical)",
              },
              {
                icon: Mountain,
                title: "Monsoon Landslide Dam-Burst",
                location: "Trisuli & Bhotekoshi High Relief Gorges",
                mechanism: "Saturated slope failure deposits > 2M m³ debris blocking river channels. Subsequent hydraulic overtopping produces catastrophic flash wavefront traveling 45 km/h downstream.",
                epistemology: "Upstream gauges die when swept away. Silence downstream is misinterpreted as clear passage until the flood crest obliterates bridge spans.",
                accentColor: "var(--status-warning)",
              },
              {
                icon: Waves,
                title: "Glacial Lake Outburst Flood (GLOF)",
                location: "Imja & Tsho Rolpa Moraine Complexes",
                mechanism: "Moraine dam failure triggered by ice avalanche into terminal lake. Sudden discharge of 30M m³ glacial water carries high boulder bedload through narrow valley choke points.",
                epistemology: "Alpine weather stations freeze or lose telemetry. Absence of telemetry from 4,500m moraine ridge indicates terminal breach, not normal sub-zero quiescent state.",
                accentColor: "var(--status-intel)",
              },
              {
                icon: Wind,
                title: "Dense Urban Basin Liquefaction",
                location: "Kathmandu Valley Lacustrine Sediments",
                mechanism: "Pore pressure build-up in soft ancient lakebed sands causes total loss of shear strength. Heavy RC frame buildings sink asymmetrically with massive utility rupture.",
                epistemology: "Hyper-concentrated citizen reports saturate emergency 112 lines, distracting command authority from complete radio silence in adjoining rural districts.",
                accentColor: "var(--amber-400)",
              },
              {
                icon: Zap,
                title: "Grid Blackout & Telemetry Decapitation",
                location: "Central Nepal Transmission Spine",
                mechanism: "Substation busbar tripping cascades across 132kV regional grid within 400ms. Optical ground wire (OPGW) fiber severed at river crossing towers.",
                epistemology: "Simultaneous loss of cellular BTS, SCADA grid, and municipal water pressure constitutes negative evidence proof of catastrophic territorial detachment.",
                accentColor: "var(--status-blackout-text)",
              },
            ].map((arch, idx) => {
              const Icon = arch.icon;
              return (
                <RevealOnScroll key={idx} delay={idx * 60}>
                  <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 py-7 group">
                    {/* Left: Icon + title + location */}
                    <div className="space-y-2">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${arch.accentColor}18`, border: `1px solid ${arch.accentColor}35` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: arch.accentColor }} />
                      </div>
                      <h3
                        className="font-display-calm font-semibold"
                        style={{ fontSize: "0.9375rem", color: "var(--fg-primary)", lineHeight: 1.3 }}
                      >
                        {arch.title}
                      </h3>
                      <span
                        className="font-mono-data block"
                        style={{ fontSize: "0.65rem", color: "var(--status-intel-text)", letterSpacing: "0.04em" }}
                      >
                        {arch.location}
                      </span>
                    </div>
                    {/* Right: Two text blocks */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <p
                          className="font-mono-data uppercase mb-1.5"
                          style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: "var(--fg-tertiary)" }}
                        >
                          Physical Dynamics
                        </p>
                        <p className="font-body-prose" style={{ fontSize: "0.8125rem", color: "var(--fg-primary)", maxWidth: "none", lineHeight: 1.65 }}>
                          {arch.mechanism}
                        </p>
                      </div>
                      <div>
                        <p
                          className="font-mono-data uppercase mb-1.5"
                          style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: "var(--status-critical-text)" }}
                        >
                          Epistemological Failure Mode
                        </p>
                        <p className="font-body-prose" style={{ fontSize: "0.8125rem", color: "var(--fg-secondary)", maxWidth: "none", lineHeight: 1.65 }}>
                          {arch.epistemology}
                        </p>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 08. BARPAK COUNTERFACTUAL — Before/after comparison                */}
      {/* ================================================================== */}
      <section
        id="dossier-scenario"
        className="py-24 px-6 sm:px-12 lg:px-20 border-b"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        <div className="max-w-6xl mx-auto space-y-12">
          <RevealOnScroll>
            <div>
              <SectionIndex code="08" />
              <h2
                className="font-display-calm font-bold mt-3"
                style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.08 }}
              >
                The Barpak 2015 Counterfactual
              </h2>
              <p
                className="font-body-prose mt-4"
                style={{ fontSize: "0.875rem", color: "var(--fg-secondary)", maxWidth: "65ch", lineHeight: 1.7 }}
              >
                On 25 April 2015, the M7.8 Gorkha earthquake struck. Because Barpak village was at the epicenter, all communications died instantly. The capital sent rescue teams south and east where phones were ringing. Barpak waited 72 hours in total silence.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={120}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                className="p-6 rounded-xl border space-y-5"
                style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
              >
                <div className="flex items-center gap-2 font-mono-data text-xs font-bold uppercase" style={{ color: "var(--status-critical-text)" }}>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Conventional Response (2015 Reality)</span>
                </div>
                <ul className="space-y-3 font-mono-data text-xs" style={{ color: "var(--fg-secondary)" }}>
                  {[
                    { time: "T+0h", text: "Shaking stops. 48/48 BTS towers down in Gorkha. No 112 calls reach police." },
                    { time: "T+6h", text: "Kathmandu media covers collapsed perimeter walls in capital. Resources deployed locally." },
                    { time: "T+24h", text: "Rumors of rural damage surface. No confirmed coordinates available." },
                    { time: "T+72h", text: "First army patrol walks into Barpak on foot. 1,200 perished under rubble.", crit: true },
                  ].map((item) => (
                    <li key={item.time} className="flex items-start gap-2">
                      <span className="font-bold shrink-0" style={{ color: item.crit ? "var(--status-critical-text)" : "var(--fg-primary)" }}>
                        {item.time}:
                      </span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="p-6 rounded-xl border space-y-5"
                style={{ backgroundColor: "var(--bg-surface)", borderColor: "rgba(16, 185, 129, 0.35)" }}
              >
                <div className="flex items-center gap-2 font-mono-data text-xs font-bold uppercase" style={{ color: "var(--status-ok-text)" }}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>PRATYAKSH-Ω Autonomous Inversion</span>
                </div>
                <ul className="space-y-3 font-mono-data text-xs" style={{ color: "var(--fg-primary)" }}>
                  {[
                    { time: "T+02m", text: "USGS Shakemap overlay registers VII+ intensity over Gorkha district." },
                    { time: "T+05m", text: "Lifeline Deficit Engine detects 0/48 expected BTS heartbeats. Deficit flag = 100%." },
                    { time: "T+18m", text: "Bayesian inference calculates 94% probability of catastrophic structural collapse." },
                    { time: "T+35m", text: "Automated tactical helicopter dispatch order routed to Pokhara base for direct Barpak airdrop." },
                  ].map((item) => (
                    <li key={item.time} className="flex items-start gap-2">
                      <span className="font-bold shrink-0" style={{ color: "var(--status-ok-text)" }}>{item.time}:</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 09. DATA PROVENANCE                                                 */}
      {/* ================================================================== */}
      <section
        id="dossier-provenance"
        className="py-24 px-6 sm:px-12 lg:px-20 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-6xl mx-auto space-y-10">
          <RevealOnScroll>
            <div>
              <SectionIndex code="09" color="var(--status-intel-text)" />
              <h2
                className="font-display-calm font-bold mt-3"
                style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.08 }}
              >
                Data Provenance & Telemetry
              </h2>
              <p
                className="font-body-prose mt-4"
                style={{ fontSize: "0.875rem", color: "var(--fg-secondary)", maxWidth: "55ch", lineHeight: 1.7 }}
              >
                PRATYAKSH-Ω ingests authoritative multi-agency data streams with rigorous epistemological weighting.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={120}>
            <div
              className="rounded-xl border overflow-hidden font-mono-data text-xs"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr
                      className="border-b uppercase tracking-wider bg-black/20"
                      style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--fg-tertiary)", fontSize: "0.65rem" }}
                    >
                      <th className="p-4 font-normal">Telemetry Stream</th>
                      <th className="p-4 font-normal">Provider Agency</th>
                      <th className="p-4 font-normal">Update Cadence</th>
                      <th className="p-4 font-normal">Inference Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5" style={{ color: "var(--fg-primary)" }}>
                    {[
                      { stream: "USGS Shakemap (PGA, MMI)", agency: "US Geological Survey / Global Seismograph", cadence: "Immediate (Event-Driven)", weight: "Primary Prior (0.92)" },
                      { stream: "Cellular BTS Tower Ping", agency: "Nepal Telecom (NTC) / Ncell SCADA", cadence: "60 Seconds Synchronous", weight: "Negative Evidence (0.95)" },
                      { stream: "High-Voltage SCADA Feeder", agency: "Nepal Electricity Authority (NEA)", cadence: "100 ms Telemetry Stream", weight: "Direct Proof (0.88)" },
                      { stream: "Ward Population & Demographics", agency: "Central Bureau of Statistics (CBS Nepal 2021)", cadence: "Static Baseline Decennial", weight: "Exposure Denominator" },
                      { stream: "OpenStreetMap Infrastructure", agency: "Kathmandu Living Labs (KLL) / OSM", cadence: "Hourly Mirror Sync", weight: "Spatial Topology (0.80)" },
                      { stream: "Multi-Agency Citizen 112/100", agency: "Nepal Police / Red Cross / Army HQ", cadence: "Asynchronous Ingestion", weight: "Graph Deduplicated (0.65)" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-bold" style={{ color: "var(--fg-primary)" }}>{row.stream}</td>
                        <td className="p-4" style={{ color: "var(--status-intel-text)" }}>{row.agency}</td>
                        <td className="p-4" style={{ color: "var(--status-ok-text)" }}>{row.cadence}</td>
                        <td className="p-4 font-bold" style={{ color: "var(--status-critical-text)" }}>{row.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 10. OPERATIONAL GLOSSARY — Two-column definition grid               */}
      {/* ================================================================== */}
      <section
        id="dossier-glossary"
        className="py-24 px-6 sm:px-12 lg:px-20 border-b"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        <div className="max-w-6xl mx-auto space-y-10">
          <RevealOnScroll>
            <div>
              <SectionIndex code="10" color="var(--status-ok-text)" />
              <h2
                className="font-display-calm font-bold mt-3"
                style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.08 }}
              >
                Operational Terminology
              </h2>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { term: "Negative Evidence", def: "Inference derived from the definitive absence of expected physical, cellular, or human signals following a confirmed hazard shockwave." },
                { term: "Reporting Bias Trap", def: "The systemic allocation error wherein emergency responders flood resources to loud, surviving peripheries while silent epicenters remain abandoned." },
                { term: "Lifeline Deficit", def: "Mathematical difference between expected sensor heartbeats (BTS, SCADA, fiber) and observed reality. Deficit = (Expected - Observed) / Expected." },
                { term: "Entropy Decapitation", def: "The rapid collapse of communication infrastructure resulting in total information void across an entire administrative sector." },
                { term: "Epistemological Weight", def: "Calculated reliability scalar (0.0 to 1.0) assigned to each sensor stream based on agency calibration, latency, and physical tamper-resistance." },
                { term: "Consensus Ledger", def: "A single, verified ground-truth record produced by clustering redundant, noisy multi-agency dispatches via cosine similarity graph fusion." },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border space-y-2 transition-colors"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-default)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                >
                  <div
                    className="font-mono-data font-bold"
                    style={{ fontSize: "0.8125rem", color: "var(--status-intel-text)" }}
                  >
                    {item.term}
                  </div>
                  <p
                    className="font-body-prose"
                    style={{ fontSize: "0.8rem", color: "var(--fg-secondary)", maxWidth: "none", lineHeight: 1.65 }}
                  >
                    {item.def}
                  </p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 11. EXECUTIVE BRIEF — Full-bleed CTA                               */}
      {/* ================================================================== */}
      <section id="dossier-brief" className="py-24 px-6 sm:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <RevealOnScroll>
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-default)",
              }}
            >
              {/* Header bar */}
              <div
                className="flex flex-wrap items-center justify-between gap-4 border-b p-5 font-mono-data text-[11px]"
                style={{ borderColor: "var(--border-subtle)", color: "var(--fg-tertiary)" }}
              >
                <div>CLASSIFICATION: UNRESTRICTED PUBLIC DOSSIER</div>
                <div>DATE: SEPTEMBER 2026</div>
                <div>AUTH: PRATYAKSH-Ω EXECUTIVE COUNCIL</div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                <div>
                  <SectionIndex code="11" />
                  <h2
                    className="font-display-calm font-bold mt-3"
                    style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.75rem)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
                  >
                    Executive Briefing & Deployment Mandate
                  </h2>
                </div>

                <p
                  className="font-body-prose"
                  style={{ fontSize: "0.9375rem", color: "var(--fg-primary)", maxWidth: "none", lineHeight: 1.7 }}
                >
                  Disaster relief missions repeatedly succumb to the cognitive illusion that surviving urban centers require the bulk of immediate search and rescue. In the 2015 Gorkha earthquake, 82% of international air sorties hovered over Kathmandu valley during the golden 72 hours, while mountain villages with 95% total collapse waited days for first contact.
                </p>

                <p
                  className="font-body-prose"
                  style={{ fontSize: "0.875rem", color: "var(--fg-secondary)", maxWidth: "none", lineHeight: 1.7 }}
                >
                  PRATYAKSH-Ω eliminates this blind spot. By automating the reconciliation of physical hazard shock with multi-agency telecommunications extinction, the platform produces actionable tactical dispatch orders within 35 minutes of initial seismic rupture.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  {user ? (
                    <Link
                      href="/situation"
                      onClick={() => TacticalAudio.playPing()}
                      className="btn-action-primary flex items-center gap-2"
                      style={{ padding: "0.75rem 1.75rem", fontSize: "0.8125rem" }}
                    >
                      <Radar className="w-4 h-4" />
                      <span>Launch Mission Command Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link
                      href="/auth"
                      onClick={() => TacticalAudio.playPing()}
                      className="btn-action-primary flex items-center gap-2"
                      style={{ padding: "0.75rem 1.75rem", fontSize: "0.8125rem" }}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Access Command Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
