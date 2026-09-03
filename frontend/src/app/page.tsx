"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  fetchAllLocationsStatus,
  fetchSimulationState,
  fetchPopulationExposure,
  LocationStatusItem,
  SimulationState,
  AllPopulationExposureResponse,
} from "@/lib/api";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import {
  Radio,
  Radar,
  PhoneCall,
  Server,
  Compass,
  FileText,
  Volume2,
  VolumeX,
  Zap,
  ArrowRight,
} from "lucide-react";
import { StickyStackFallacy } from "@/components/StickyStackFallacy";
import { MultiHazardPhysicsShowcase } from "@/components/MultiHazardPhysicsShowcase";
import { BayesianEntropyChamber } from "@/components/BayesianEntropyChamber";
import { KineticTelemetryRibbon } from "@/components/KineticTelemetryRibbon";
import { TacticalAudio } from "@/lib/TacticalAudio";

/* ── Scroll-reveal hook (IntersectionObserver, no window.scroll) ── */
function useRevealOnScroll() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          obs.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── Stagger child variants ── */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 90, damping: 22 },
  },
};

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

export default function OverviewPage() {
  const [locations, setLocations] = useState<LocationStatusItem[]>([]);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [exposureData, setExposureData] = useState<AllPopulationExposureResponse | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  // Parallax transforms — GPU-only (translateY)
  const rawGlowY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const glowY = useSpring(rawGlowY, { stiffness: 80, damping: 30 });
  const rawHeroY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroY = useSpring(rawHeroY, { stiffness: 80, damping: 30 });

  // Reveal refs
  const telemetryReveal = useRevealOnScroll();
  const mathReveal = useRevealOnScroll();
  const ctaReveal = useRevealOnScroll();

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
    setAudioEnabled(TacticalAudio.getEnabled());
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [loadData]);

  const toggleAudio = () => {
    const newState = TacticalAudio.toggle();
    setAudioEnabled(newState);
  };

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

  return (
    <div
      className="w-full relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-primary)" }}
    >
      {/* ================================================================== */}
      {/* SECTION 1: HERO — CINEMATIC                                         */}
      {/* ================================================================== */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex flex-col justify-between overflow-hidden"
        style={{ padding: "0 clamp(1.5rem, 5vw, 4rem)" }}
      >
        {/* Ambient parallax glow — GPU translateY only */}
        <motion.div
          style={{
            y: glowY,
            background:
              "radial-gradient(ellipse at center, rgba(232,16,58,0.07) 0%, rgba(232,16,58,0.02) 45%, transparent 70%)",
            filter: "blur(60px)",
          }}
          aria-hidden
          className="absolute top-[-10%] left-[5%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full pointer-events-none z-0"
        />

        {/* Tactical dot grid */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none z-0 bg-tactical-dots opacity-70"
        />
        {/* Vertical fade to void */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: "linear-gradient(to bottom, transparent 55%, var(--bg-void) 100%)",
          }}
        />

        {/* Coordinates — decorative, desktop only */}
        <div
          aria-hidden
          className="absolute top-6 left-6 font-mono-data select-none hidden xl:block"
          style={{ fontSize: "var(--text-2xs)", color: "rgba(255,255,255,0.15)", letterSpacing: "0.05em" }}
        >
          28°13&apos;N, 84°45&apos;E // GORKHA SEISMIC ZONE
        </div>
        <div
          aria-hidden
          className="absolute top-6 right-6 font-mono-data select-none hidden xl:block"
          style={{ fontSize: "var(--text-2xs)", color: "rgba(255,255,255,0.15)", letterSpacing: "0.05em" }}
        >
          NEGATIVE EVIDENCE RECONSTRUCTION — ACTIVE
        </div>

        {/* Top bar */}
        <div
          className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-6"
        >
          <div
            className="flex items-center gap-3 font-mono-data rounded-full backdrop-blur-xl"
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--fg-secondary)",
              padding: "0.4rem 0.875rem",
              background: "rgba(10,13,18,0.80)",
              border: "1px solid var(--border-default)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>SYSTEM ACTIVE</span>
            <span style={{ color: "var(--border-default)" }}>|</span>
            <span>
              T+{simulationState?.elapsed_hours?.toFixed(1) ?? "4.0"}H
            </span>
            <span style={{ color: "var(--border-default)" }}>|</span>
            <span
              className="truncate max-w-[16rem] sm:max-w-sm"
              style={{ color: "var(--fg-primary)" }}
            >
              {simulationState?.disaster_display_name ?? "M7.8 Central Nepal Seismic Rupture"}
            </span>
          </div>

          <button
            onClick={toggleAudio}
            type="button"
            className="flex items-center gap-2 rounded-full font-mono-data backdrop-blur-xl transition-all cursor-pointer"
            style={{
              fontSize: "var(--text-xs)",
              padding: "0.4rem 0.875rem",
              background: audioEnabled ? "rgba(232,16,58,0.12)" : "rgba(255,255,255,0.04)",
              border: audioEnabled ? "1px solid var(--accent-border)" : "1px solid var(--border-subtle)",
              color: audioEnabled ? "var(--fg-primary)" : "var(--fg-tertiary)",
            }}
          >
            {audioEnabled ? (
              <Volume2 className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span>{audioEnabled ? "AUDIO ON" : "AUDIO MUTED"}</span>
          </button>
        </div>

        {/* Hero narrative core */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          style={{ y: heroY }}
          className="relative z-10 max-w-6xl w-full mx-auto py-16 space-y-8"
        >
          {/* Eyebrow — only 1 on the hero, none for next 2 sections */}
          <motion.div variants={fadeUp} className="type-eyebrow flex items-center gap-2">
            <span
              className="w-5 h-px"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span>Autonomous Disaster Reality Reconstruction</span>
          </motion.div>

          {/* Display title — massive, left-aligned */}
          <motion.h1
            variants={fadeUp}
            className="font-display-calm"
            style={{
              fontSize: "var(--text-hero)",
              fontWeight: 800,
              letterSpacing: "var(--ls-tight)",
              lineHeight: "var(--lh-tight)",
              color: "var(--fg-primary)",
              textWrap: "balance",
            }}
          >
            PRATYAKSH
            <span style={{ color: "var(--accent)" }}>-Ω</span>
          </motion.h1>

          {/* Manifesto quote — serif used deliberately (single justified instance) */}
          <motion.blockquote
            variants={fadeUp}
            className="font-serif-editorial"
            style={{
              fontSize: "clamp(1.125rem, 2.2vw, 1.5rem)",
              color: "var(--fg-secondary)",
              fontStyle: "italic",
              lineHeight: 1.55,
              maxWidth: "52ch",
              borderLeft: "2px solid var(--accent-border)",
              paddingLeft: "1.5rem",
              margin: 0,
            }}
          >
            &ldquo;Silence is not safety. In catastrophic terrain, absence of evidence is merely
            evidence of broken observation channels.&rdquo;
          </motion.blockquote>

          {/* Technical description */}
          <motion.p
            variants={fadeUp}
            className="type-body"
            style={{ maxWidth: "58ch" }}
          >
            Reconstructing hidden disaster realities across high-risk Himalayan valleys through
            negative evidence intelligence, physical signal baseline modeling, and Bayesian
            epistemic updating.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/gis-map"
              onClick={() => TacticalAudio.playPing()}
              className="btn-action-primary flex items-center gap-3"
              style={{ padding: "0.75rem 1.75rem", fontSize: "var(--text-xs)" }}
            >
              <Radar className="w-4 h-4" />
              <span>Launch Live GIS Console</span>
            </Link>

            <Link
              href="/hypotheses"
              onClick={() => TacticalAudio.playClick()}
              className="btn-action-secondary flex items-center gap-2.5"
              style={{ padding: "0.75rem 1.5rem", fontSize: "var(--text-xs)" }}
            >
              <Compass className="w-4 h-4" style={{ color: "var(--status-intel-text)" }} />
              <span>Bayesian Reasoning</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* KPI strip — floating glass HUD */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.6 }}
          className="relative z-10 max-w-6xl w-full mx-auto mb-8"
        >
          <div
            className="grid grid-cols-1 sm:grid-cols-3 overflow-hidden"
            style={{
              background: "rgba(10,13,18,0.75)",
              backdropFilter: "blur(24px) saturate(160%)",
              WebkitBackdropFilter: "blur(24px) saturate(160%)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-2xl)",
              boxShadow: "0 24px 48px -16px rgba(0,0,0,0.7)",
              gap: "1px",
            }}
          >
            {/* KPI 1: Critical sectors */}
            <div
              className="flex flex-col gap-2 transition-colors group"
              style={{
                background: "rgba(10,13,18,0.85)",
                padding: "clamp(1.25rem, 2.5vw, 2rem)",
              }}
            >
              <span
                className="font-mono-data uppercase"
                style={{
                  fontSize: "var(--text-2xs)",
                  letterSpacing: "var(--ls-wider)",
                  color: "var(--fg-tertiary)",
                }}
              >
                Critical Isolated Sectors
              </span>
              <span
                className="font-display-calm tabular-nums"
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  fontWeight: 700,
                  letterSpacing: "var(--ls-tight)",
                  color: "var(--accent)",
                  lineHeight: 1,
                }}
              >
                <AnimatedCounter value={activeCriticalCount} />
              </span>
              <span
                className="font-mono-data"
                style={{ fontSize: "var(--text-2xs)", color: "var(--fg-tertiary)" }}
              >
                Severed Telemetry / Damaged
              </span>
            </div>

            {/* KPI 2: Exposed population */}
            <div
              className="flex flex-col gap-2 transition-colors"
              style={{
                background: "rgba(10,13,18,0.85)",
                padding: "clamp(1.25rem, 2.5vw, 2rem)",
                borderLeft: "1px solid var(--border-faint)",
                borderRight: "1px solid var(--border-faint)",
              }}
            >
              <span
                className="font-mono-data uppercase"
                style={{
                  fontSize: "var(--text-2xs)",
                  letterSpacing: "var(--ls-wider)",
                  color: "var(--fg-tertiary)",
                }}
              >
                Exposed Population (Census 2021)
              </span>
              <span
                className="font-display-calm tabular-nums"
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  fontWeight: 700,
                  letterSpacing: "var(--ls-tight)",
                  color: "var(--fg-primary)",
                  lineHeight: 1,
                }}
              >
                <AnimatedCounter value={totalExposed} isDecimal={true} suffix="M" />
              </span>
              <span
                className="font-mono-data"
                style={{ fontSize: "var(--text-2xs)", color: "var(--fg-tertiary)" }}
              >
                Across 8 Monitored Districts
              </span>
            </div>

            {/* KPI 3: Unaccounted */}
            <div
              className="flex flex-col gap-2 transition-colors"
              style={{
                background: "rgba(10,13,18,0.85)",
                padding: "clamp(1.25rem, 2.5vw, 2rem)",
              }}
            >
              <span
                className="font-mono-data uppercase"
                style={{
                  fontSize: "var(--text-2xs)",
                  letterSpacing: "var(--ls-wider)",
                  color: "var(--fg-tertiary)",
                }}
              >
                Unaccounted Persons
              </span>
              <span
                className="font-display-calm tabular-nums"
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  fontWeight: 700,
                  letterSpacing: "var(--ls-tight)",
                  color: "var(--status-warning-text)",
                  lineHeight: 1,
                }}
              >
                <AnimatedCounter value={missing} />
              </span>
              <span
                className="font-mono-data"
                style={{ fontSize: "var(--text-2xs)", color: "var(--fg-tertiary)" }}
              >
                Probabilistic Missing Ledger
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Telemetry marquee */}
      <KineticTelemetryRibbon />

      {/* ================================================================== */}
      {/* SECTION 2: STICKY STACK FALLACY (no eyebrow — section 1 used it)   */}
      {/* ================================================================== */}
      <StickyStackFallacy />

      {/* ================================================================== */}
      {/* SECTION 3: MULTI-HAZARD PHYSICS ENGINE                              */}
      {/* ================================================================== */}
      <MultiHazardPhysicsShowcase />

      {/* ================================================================== */}
      {/* SECTION 4: LIFELINE TELEMETRY MATRIX                                */}
      {/* Eyebrow appears here (3rd section = ratio ok)                       */}
      {/* ================================================================== */}
      <section
        ref={telemetryReveal as React.RefObject<HTMLElement>}
        className="reveal-section relative z-10"
        style={{
          padding: "clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem)",
          borderTop: "1px solid var(--border-faint)",
          backgroundColor: "var(--bg-void)",
        }}
      >
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section header — eyebrow + headline only, no redundant body beneath */}
          <div className="space-y-4">
            <div className="type-eyebrow flex items-center gap-2">
              <Radio className="w-3.5 h-3.5" />
              <span>04 // Lifeline Telemetry Matrix</span>
            </div>
            <h2
              className="font-display-calm"
              style={{
                fontSize: "clamp(2rem, 4vw, var(--text-4xl))",
                fontWeight: 600,
                letterSpacing: "var(--ls-snug)",
                lineHeight: "var(--lh-heading)",
                color: "var(--fg-primary)",
              }}
            >
              Expected vs Observed Reality
            </h2>
            <p className="type-body-sm" style={{ maxWidth: "55ch" }}>
              Continuous multi-sensor audits compare historical diurnal baselines with observed
              telemetry to detect negative evidence gaps (Z ≤ −2.0).
            </p>
          </div>

          {/* Table panel */}
          <div
            className="overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-2xl)",
              boxShadow: "0 24px 48px -16px rgba(0,0,0,0.6)",
            }}
          >
            {/* Panel header */}
            <div
              className="flex flex-wrap items-center justify-between gap-4 font-mono-data"
              style={{
                padding: "0.875rem 1.5rem",
                background: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid var(--border-faint)",
                fontSize: "var(--text-xs)",
              }}
            >
              <div className="flex items-center gap-3">
                <span style={{ color: "var(--fg-tertiary)", textTransform: "uppercase" }}>
                  Sample Audit Sector:
                </span>
                <strong style={{ color: "var(--fg-primary)", fontSize: "var(--text-sm)" }}>
                  Gorkha (Barpak Ridge)
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: "var(--fg-tertiary)" }}>Silent Zone Risk:</span>
                <span className="chip-critical">9.4 / 10.0 CRITICAL_BLACKOUT</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono-data" style={{ fontSize: "var(--text-xs)" }}>
                <thead
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    borderBottom: "1px solid var(--border-faint)",
                    color: "var(--fg-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: "var(--ls-wider)",
                    fontSize: "var(--text-2xs)",
                  }}
                >
                  <tr>
                    {["Lifeline Vector", "Historical Baseline", "Expected Reality", "Observed Evidence", "Deficit", "Status"].map((h) => (
                      <th key={h} className="font-normal" style={{ padding: "0.75rem 1rem" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LIFELINE_DATA.map((row, i) => {
                    const Icon = row.icon;
                    return (
                      <tr
                        key={i}
                        className="transition-colors hover:bg-white/[0.02]"
                        style={{ borderTop: "1px solid var(--border-faint)" }}
                      >
                        <td
                          className="font-semibold flex items-center gap-2.5"
                          style={{ padding: "1rem", color: "var(--fg-primary)" }}
                        >
                          <Icon className="w-4 h-4 shrink-0" style={{ color: row.iconColor }} />
                          <span>{row.label}</span>
                        </td>
                        <td style={{ padding: "1rem", color: "var(--fg-secondary)" }}>{row.baseline}</td>
                        <td style={{ padding: "1rem", color: "var(--fg-secondary)" }}>{row.expected}</td>
                        <td
                          className="font-bold"
                          style={{ padding: "1rem", color: "var(--status-critical-text)" }}
                        >
                          {row.observed}
                        </td>
                        <td
                          className="font-bold"
                          style={{ padding: "1rem", color: "var(--status-critical-text)", textAlign: "right" }}
                        >
                          {row.deficit}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          <span className={row.statusClass}>{row.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION 5: BAYESIAN ENTROPY CHAMBER                                 */}
      {/* ================================================================== */}
      <BayesianEntropyChamber />

      {/* ================================================================== */}
      {/* SECTION 6: MATHEMATICAL FOUNDATIONS                                 */}
      {/* Layout redesigned: 2-col feature tiles, not 4 identical cards      */}
      {/* No eyebrow — used one in section 4 already, next one is CTA         */}
      {/* ================================================================== */}
      <section
        ref={mathReveal as React.RefObject<HTMLElement>}
        className="reveal-section relative z-10"
        style={{
          padding: "clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem)",
          borderTop: "1px solid var(--border-faint)",
          backgroundColor: "var(--bg-recessed)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header — left-aligned for asymmetry (not centered like hero) */}
          <div className="max-w-2xl space-y-4 mb-16">
            <h2
              className="font-display-calm"
              style={{
                fontSize: "clamp(2rem, 4vw, var(--text-4xl))",
                fontWeight: 600,
                letterSpacing: "var(--ls-snug)",
                lineHeight: "var(--lh-heading)",
                color: "var(--fg-primary)",
              }}
            >
              Deterministic Mathematical Rigor
            </h2>
            <p className="type-body-sm">
              Every inference is traceable to first-principles formulas rather than black-box
              guesses.
            </p>
          </div>

          {/* Feature grid — 2-col with one large feature + 3 compact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {MATH_FOUNDATIONS.map((f, idx) => {
              const isLarge = idx === 0;
              return (
                <motion.div
                  key={f.index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={isLarge ? "lg:row-span-2" : ""}
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-xl)",
                    padding: isLarge ? "2.5rem" : "1.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div
                    className="flex items-center justify-between font-mono-data uppercase"
                    style={{
                      fontSize: "var(--text-2xs)",
                      letterSpacing: "var(--ls-wider)",
                    }}
                  >
                    <span className={f.colorClass}>{f.label}</span>
                    <span style={{ color: "var(--fg-tertiary)" }}>{f.sublabel}</span>
                  </div>

                  {/* Formula */}
                  <div
                    className="font-mono-data text-center"
                    style={{
                      background: "rgba(0,0,0,0.45)",
                      border: "1px solid var(--border-faint)",
                      borderRadius: "var(--radius-md)",
                      padding: isLarge ? "1.25rem 1rem" : "0.875rem 1rem",
                      fontSize: isLarge ? "var(--text-sm)" : "var(--text-xs)",
                      color: f.textClass,
                      lineHeight: 1.6,
                    }}
                  >
                    {f.formula}
                  </div>

                  <p
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--fg-secondary)",
                      lineHeight: "var(--lh-body)",
                      margin: 0,
                      fontFamily: "var(--font-body), -apple-system, sans-serif",
                    }}
                  >
                    {f.body}
                  </p>

                  {isLarge && (
                    <div
                      className="font-mono-data flex items-center gap-2 mt-auto pt-4"
                      style={{
                        fontSize: "var(--text-2xs)",
                        color: "var(--fg-tertiary)",
                        borderTop: "1px solid var(--border-faint)",
                        paddingTop: "1rem",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: "var(--status-ok)" }}
                      />
                      <span>BASELINE SIGNAL MODEL ACTIVE</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION 7: COMMAND PORTAL GATEWAY                                   */}
      {/* Eyebrow here (7th section, last one) — asymmetric layout            */}
      {/* ================================================================== */}
      <section
        ref={ctaReveal as React.RefObject<HTMLElement>}
        className="reveal-section relative z-10 overflow-hidden"
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          padding: "clamp(4rem, 8vw, 8rem) clamp(1.5rem, 5vw, 4rem)",
          borderTop: "1px solid var(--border-faint)",
        }}
      >
        {/* Background ambient glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 60% 50%, rgba(232,16,58,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-6xl mx-auto w-full relative z-10">
          {/* Asymmetric layout: left heavy text, right CTA cluster */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-center">
            <div className="space-y-6 max-w-2xl">
              <div className="type-eyebrow flex items-center gap-2">
                <span
                  className="w-5 h-px"
                  style={{ backgroundColor: "var(--accent)" }}
                />
                <span>// Operational Readiness</span>
              </div>

              <h2
                className="font-display-calm"
                style={{
                  fontSize: "clamp(2.25rem, 5vw, 4rem)",
                  fontWeight: 700,
                  letterSpacing: "var(--ls-tight)",
                  lineHeight: "var(--lh-heading)",
                  color: "var(--fg-primary)",
                }}
              >
                Enter the Tactical Console
              </h2>

              <p className="type-body" style={{ maxWidth: "50ch" }}>
                Transition from public overview to active incident command. Inspect H3 hexagonal
                microgrids, simulate multi-hazard wavefronts, and authorize drone reconnaissance.
              </p>
            </div>

            {/* CTA cluster — stacked, right-aligned */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:min-w-[220px]">
              <Link
                href="/gis-map"
                onClick={() => TacticalAudio.playPing()}
                className="btn-action-primary flex items-center justify-center gap-3 w-full"
                style={{ padding: "0.875rem 1.75rem" }}
              >
                <Radar className="w-4 h-4 shrink-0" />
                <span>Launch Live GIS Console</span>
              </Link>

              <Link
                href="/sitrep"
                onClick={() => TacticalAudio.playClick()}
                className="btn-action-secondary flex items-center justify-center gap-3 w-full"
                style={{ padding: "0.875rem 1.75rem" }}
              >
                <FileText className="w-4 h-4 shrink-0" style={{ color: "var(--status-intel-text)" }} />
                <span>View Executive SITREP</span>
              </Link>

              {/* Subtle sub-link */}
              <Link
                href="/hypotheses"
                className="flex items-center justify-center gap-2 text-center transition-colors"
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--fg-tertiary)",
                  fontFamily: "var(--font-display), sans-serif",
                  letterSpacing: "var(--ls-wide)",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  padding: "0.5rem",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg-secondary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-tertiary)")}
              >
                <span>Explore Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
