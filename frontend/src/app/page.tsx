"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  fetchAllLocationsStatus,
  fetchSimulationState,
  fetchPopulationExposure,
  fetchScenarioPresets,
  LocationStatusItem,
  SimulationState,
  AllPopulationExposureResponse,
  ScenarioPreset,
} from "@/lib/api";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import {
  ChevronDown,
  Radio,
  Users,
  ShieldAlert,
  Satellite,
  Layers,
  Radar,
  Network,
  FileText,
  MapPin,
  Flame,
  Waves,
  Wind,
  Mountain,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  PhoneCall,
  Server,
  Compass,
} from "lucide-react";

const fadeUpVars: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 90, damping: 22 },
  },
};

const staggerContainerVars: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

// 5 Canonical Disaster Types for Interactive Showcase
const DISASTER_SHOWCASE = [
  {
    id: "earthquake",
    name: "Seismic Rupture",
    label: "Earthquake (M7.8)",
    icon: Activity,
    color: "#E11D48",
    bgClass: "bg-rose-500/10 border-rose-500/30 text-rose-400",
    epicenter: "Barpak, Gorkha Ridge",
    metric: "PGA > 0.48g",
    secondary: "Liquefaction, Valley Resonances, Landslides",
    lifelineImpact: "Masonry structural collapse, cellular tower shelter destruction, bridge shearing",
    tacticalAssets: "Heavy USAR, Hydraulic Shears, Acoustic Victim Locators, Air Medevac",
  },
  {
    id: "flash_flood",
    name: "Glacial & River Breach",
    label: "Flash Flood",
    icon: Waves,
    color: "#06B6D4",
    bgClass: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    epicenter: "Melamchi / Bhotekoshi Headwaters",
    metric: "Peak Discharge: 8,200 m³/s",
    secondary: "Riverbed Scouring, Mud Debris, Bridge Washouts",
    lifelineImpact: "Bridge pier scouring, bridge-hung fiber conduits torn, pump stations submerged",
    tacticalAssets: "Swiftwater Rescue Inflatables, Dewatering Pumps, Line Launchers",
  },
  {
    id: "cyclone",
    name: "Severe Gale & Storm Surge",
    label: "Cyclone / Gale",
    icon: Wind,
    color: "#3B82F6",
    bgClass: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    epicenter: "Southern Terai Foothills",
    metric: "Sustained: 150 km/h (Gusts 190 km/h)",
    secondary: "High-voltage transmission collapse, corrugated roof projectiles",
    lifelineImpact: "Transmission tower snapping, microwave dish misalignment, feeder line trips",
    tacticalAssets: "Heavy Tree Clearance Chainsaws, Portable Diesel Generators, Canvas Tarps",
  },
  {
    id: "landslide",
    name: "Valley Slope Failure",
    label: "Mountain Landslide",
    icon: Mountain,
    color: "#D97706",
    bgClass: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    epicenter: "Dhunche Mountain Pass, Rasuwa",
    metric: "Runout Volume: 3.8M m³",
    secondary: "River Damming (Outburst Flood Risk), Highway Burial",
    lifelineImpact: "Arterial highway buried, fiber spans snapped across gorges, water mains severed",
    tacticalAssets: "Heavy Tracked Excavators, Armored Front Loaders, Slope-Stability Radar",
  },
  {
    id: "urban_fire",
    name: "Dense Historic Core Conflagration",
    label: "Urban Firestorm",
    icon: Flame,
    color: "#F97316",
    bgClass: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    epicenter: "Asan / Indra Chowk Core, Kathmandu",
    metric: "Radiant Flux: 45 kW/m²",
    secondary: "Narrow Timber Alley Choking, Flashover Cascades, Toxic Plumes",
    lifelineImpact: "Overhead bundle incineration, substation transformer burns, alley impassability",
    tacticalAssets: "High-Pressure Foam Tenders, Narrow Attack Engines, SCBA Compressors",
  },
];

export default function OverviewPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [locations, setLocations] = useState<LocationStatusItem[]>([]);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [exposureData, setExposureData] = useState<AllPopulationExposureResponse | null>(null);
  const [presets, setPresets] = useState<ScenarioPreset[]>([]);
  const [activeDisasterIndex, setActiveDisasterIndex] = useState(0);
  const [realityComparisonMode, setRealityComparisonMode] = useState<"naive" | "pratyaksh">("pratyaksh");

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  const loadData = async () => {
    try {
      const [locsRes, sim, exp, presetsRes] = await Promise.all([
        fetchAllLocationsStatus(),
        fetchSimulationState(),
        fetchPopulationExposure(),
        fetchScenarioPresets().catch(() => null),
      ]);
      setLocations(locsRes.locations);
      setSimulationState(sim);
      setExposureData(exp);
      if (presetsRes) {
        setPresets(presetsRes.presets);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const summaryCounts = locations.reduce((acc: any, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const activeCriticalCount = (summaryCounts.verified_damaged || 0) + (summaryCounts.blackout || 0);
  const totalExposed = (exposureData?.total_national_exposed_population || 0) / 1000000;
  const missing = exposureData?.total_missing_persons || 0;
  const activeDisaster = DISASTER_SHOWCASE[activeDisasterIndex];

  return (
    <div ref={containerRef} className="w-full bg-[#090B0E] relative overflow-hidden text-[#F3F4F6] selection:bg-[#E11D48]/30 selection:text-white">
      {/* Ambient Parallax Radial Glow */}
      <motion.div
        style={{ y: isMounted ? bgY : "0%" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-[#E11D48]/5 rounded-full blur-[140px] pointer-events-none z-0"
      />

      {/* SECTION 1: HERO NARRATIVE */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center p-6 sm:p-12 z-10">
        <motion.div variants={staggerContainerVars} initial="hidden" animate="show" className="max-w-5xl w-full space-y-16">
          <div className="space-y-6 text-center">
            {/* Live Operational Ticker */}
            <motion.div
              variants={fadeUpVars}
              className="font-mono-data text-xs text-[#E11D48] tracking-[0.3em] uppercase flex items-center justify-center gap-3"
            >
              <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
              <span>
                SYSTEM ACTIVE &bull; T+{simulationState?.elapsed_hours?.toFixed(1) || "0.0"}H &bull;{" "}
                {simulationState?.disaster_display_name || "M7.8 Central Nepal Seismic Event"}
              </span>
            </motion.div>

            {/* Main Brand Title */}
            <motion.h1
              variants={fadeUpVars}
              className="font-display-calm font-medium text-6xl sm:text-8xl lg:text-9xl tracking-tight text-white"
            >
              PRATYAKSH-Ω
            </motion.h1>

            {/* Editorial Thesis */}
            <motion.p
              variants={fadeUpVars}
              className="font-serif-editorial text-xl sm:text-3xl text-[#94A3B8] max-w-3xl mx-auto italic font-normal leading-relaxed"
            >
              &ldquo;Silence is not safety. Absence of evidence is evidence of absence only when observation is guaranteed.&rdquo;
            </motion.p>

            {/* Subtitle Description */}
            <motion.p
              variants={fadeUpVars}
              className="font-body-prose text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto leading-relaxed pt-2"
            >
              Autonomous disaster reality reconstruction, negative evidence intelligence, and Bayesian epistemic updating for high-risk Himalayan topography.
            </motion.p>

            {/* Action CTAs */}
            <motion.div
              variants={fadeUpVars}
              className="flex flex-wrap items-center justify-center gap-4 pt-6"
            >
              <Link
                href="/gis-map"
                className="btn-action-primary text-xs py-3 px-6 rounded-xl flex items-center gap-2.5 shadow-lg shadow-[#E11D48]/25"
              >
                <Radar className="w-4 h-4" />
                <span>Launch GIS Command Console</span>
              </Link>

              <Link
                href="/hypotheses"
                className="btn-action-secondary text-xs py-3 px-6 rounded-xl flex items-center gap-2.5"
              >
                <Compass className="w-4 h-4 text-[#60A5FA]" />
                <span>Explore Bayesian Reasoning</span>
              </Link>
            </motion.div>
          </div>

          {/* Key Mission KPIs Strip */}
          <motion.div
            variants={fadeUpVars}
            className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl"
          >
            <div className="bg-[#0C0E12]/85 p-8 flex flex-col gap-2 group transition-colors hover:bg-[#10131A]">
              <span className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em] group-hover:text-[#94A3B8]">
                Critical Isolated Sectors
              </span>
              <span className="font-display-calm text-5xl sm:text-6xl text-[#E11D48] tracking-tighter">
                <AnimatedCounter value={activeCriticalCount} />
              </span>
              <span className="font-mono-data text-[10px] text-[#64748B]">Severed Telemetry / Damaged</span>
            </div>

            <div className="bg-[#0C0E12]/85 p-8 flex flex-col gap-2 group transition-colors hover:bg-[#10131A]">
              <span className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em] group-hover:text-[#94A3B8]">
                Exposed Population (Census 2021)
              </span>
              <span className="font-display-calm text-5xl sm:text-6xl text-[#F3F4F6] tracking-tighter">
                <AnimatedCounter value={totalExposed} isDecimal={true} suffix="M" />
              </span>
              <span className="font-mono-data text-[10px] text-[#64748B]">Across 8 Strategic Districts</span>
            </div>

            <div className="bg-[#0C0E12]/85 p-8 flex flex-col gap-2 group transition-colors hover:bg-[#10131A]">
              <span className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em] group-hover:text-[#94A3B8]">
                Unaccounted Persons
              </span>
              <span className="font-display-calm text-5xl sm:text-6xl text-[#D97706] tracking-tighter">
                <AnimatedCounter value={missing} />
              </span>
              <span className="font-mono-data text-[10px] text-[#64748B]">Pending Entity Resolution</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[#64748B]"
        >
          <span className="font-mono-data text-[10px] uppercase tracking-[0.25em]">Decode Reality</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </section>

      {/* SECTION 2: THE HIMALAYAN INFORMATION FOG */}
      <section className="relative py-28 p-6 sm:p-12 z-10 border-t border-white/5">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainerVars}
          className="max-w-5xl mx-auto space-y-12"
        >
          <div className="space-y-4">
            <motion.div variants={fadeUpVars} className="font-mono-data text-xs text-[#E11D48] tracking-[0.2em] uppercase">
              01 // The Epistemological Failure
            </motion.div>
            <motion.h2 variants={fadeUpVars} className="font-display-calm text-4xl sm:text-6xl text-white tracking-tight">
              The Silent Zone Fallacy
            </motion.h2>
          </div>

          <motion.div variants={fadeUpVars} className="grid grid-cols-1 md:grid-cols-2 gap-8 font-body-prose text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            <div className="space-y-4">
              <p>
                In catastrophic events across rugged mountain terrain, conventional disaster dashboards make a fatal mistake: they equate an absence of incoming emergency calls with safety.
              </p>
              <p>
                When a 7.8 magnitude earthquake strikes or a glacial lake breaches upstream, rural communities do not post to social media or place 911 calls. Their cellular base stations have lost backhaul power, transmission pylons have snapped, and arterial highways are choked by debris flows.
              </p>
            </div>
            <div className="space-y-4">
              <p>
                Meanwhile, unhurt citizens in connected urban valleys generate thousands of duplicate posts, drawing search-and-rescue (SAR) assets toward high connectivity rather than high physical need.
              </p>
              <p className="text-white font-medium">
                PRATYAKSH-Ω resolves this urban bias by calculating deterministic expected reality baselines: identifying where signals <span className="text-[#E11D48] underline">ought to be</span> but are mysteriously absent.
              </p>
            </div>
          </motion.div>

          {/* Interactive Comparison Card: Naive Dashboard vs PRATYAKSH-Ω */}
          <motion.div variants={fadeUpVars} className="p-8 rounded-3xl bg-[#0C0E12]/90 border border-white/10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em] block">
                  Interactive Paradigm Comparison
                </span>
                <h3 className="font-display-calm font-medium text-2xl text-white">
                  Barpak Epicenter Ridge (T+4 Hours Post-Seismic Rupture)
                </h3>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 font-mono-data text-xs">
                <button
                  onClick={() => setRealityComparisonMode("naive")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    realityComparisonMode === "naive"
                      ? "bg-white/10 text-white font-bold"
                      : "text-[#64748B] hover:text-white"
                  }`}
                >
                  Naive Dashboard
                </button>
                <button
                  onClick={() => setRealityComparisonMode("pratyaksh")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    realityComparisonMode === "pratyaksh"
                      ? "bg-[#E11D48] text-white font-bold shadow-md shadow-[#E11D48]/30"
                      : "text-[#64748B] hover:text-white"
                  }`}
                >
                  PRATYAKSH-Ω Reconstruction
                </button>
              </div>
            </div>

            {realityComparisonMode === "naive" ? (
              <div className="space-y-4 font-mono-data text-xs animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[#64748B] uppercase">Incoming 911 Calls</span>
                    <div className="text-2xl font-bold text-white">0 Calls</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[#64748B] uppercase">Social Media Activity</span>
                    <div className="text-2xl font-bold text-white">0 Posts</div>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <span className="text-emerald-400 uppercase">Automated Classification</span>
                    <div className="text-2xl font-bold text-emerald-400">STATUS: SAFE / CLEAR</div>
                  </div>
                </div>
                <p className="font-body-prose text-sm text-[#94A3B8] italic">
                  &ldquo;Standard dashboard assumes 0 signals = 0 casualties. Zero search-and-rescue sorties assigned. Fatal operational failure.&rdquo;
                </p>
              </div>
            ) : (
              <div className="space-y-4 font-mono-data text-xs animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[#64748B] uppercase">Expected Baseline</span>
                    <div className="text-xl font-bold text-[#60A5FA]">48.5 Calls/hr</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[#64748B] uppercase">Observed Reality</span>
                    <div className="text-xl font-bold text-[#E11D48]">0.0 Calls (100% Deficit)</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[#64748B] uppercase">Anomaly Deviation</span>
                    <div className="text-xl font-bold text-[#F59E0B]">Z = -5.82σ (Critical)</div>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                    <span className="text-rose-400 uppercase">Inferred Truth</span>
                    <div className="text-sm font-bold text-rose-300">H5: CATASTROPHIC IMPACT</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-body-prose text-xs text-[#94A3B8] leading-relaxed">
                  <strong className="text-white">PRATYAKSH-Ω Action Directive:</strong> Flags active telecommunication blackout. Initiates priority reconnaissance sortie (Autonomous VTOL UAV) to scan Barpak ridge, tasking Copernicus Sentinel-1 radar pass and allocating 4,500L emergency drinking water.
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 3: 5 DISASTER CATEGORIES & PHYSICS */}
      <section className="relative py-28 p-6 sm:p-12 z-10 border-t border-white/5 bg-[#0C0E12]/40">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainerVars}
          className="max-w-6xl mx-auto space-y-12"
        >
          <div className="text-center space-y-3">
            <motion.div variants={fadeUpVars} className="font-mono-data text-xs text-[#E11D48] tracking-[0.2em] uppercase">
              02 // Multi-Hazard Physics Engine
            </motion.div>
            <motion.h2 variants={fadeUpVars} className="font-display-calm text-4xl sm:text-6xl text-white tracking-tight">
              Five Selectable Disaster Profiles
            </motion.h2>
            <motion.p variants={fadeUpVars} className="font-body-prose text-sm text-[#94A3B8] max-w-xl mx-auto">
              Simulates distinct spatial propagation vectors, lifeline failure modes, and asset allocations across 5 catastrophe classes.
            </motion.p>
          </div>

          {/* Interactive Disaster Tabs */}
          <motion.div variants={fadeUpVars} className="flex flex-wrap justify-center gap-2">
            {DISASTER_SHOWCASE.map((d, idx) => {
              const IconComp = d.icon;
              const isActive = activeDisasterIndex === idx;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDisasterIndex(idx)}
                  className={`px-4 py-2.5 rounded-xl font-mono-data text-xs flex items-center gap-2.5 transition-all border cursor-pointer ${
                    isActive
                      ? "bg-white/10 text-white font-bold border-white/30 shadow-lg"
                      : "text-[#94A3B8] border-transparent hover:text-white hover:bg-white/5"
                  }`}
                >
                  <IconComp className="w-4 h-4" style={{ color: d.color }} />
                  <span>{d.label}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Selected Disaster Details Card */}
          <motion.div
            key={activeDisaster.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-3xl bg-[#090B0E] border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 shadow-2xl"
          >
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em] mb-1">
                  Active Hazard Profile
                </div>
                <h3 className="font-display-calm text-3xl font-medium text-white flex items-center gap-3">
                  <span>{activeDisaster.name}</span>
                </h3>
              </div>

              <div className="space-y-3 font-mono-data text-xs">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[#64748B] uppercase block">Epicenter / Ignition Zone</span>
                  <span className="text-white font-bold">{activeDisaster.epicenter}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[#64748B] uppercase block">Primary Physical Metric</span>
                  <span className="text-amber-400 font-bold">{activeDisaster.metric}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[#64748B] uppercase block">Cascading Multi-Hazards</span>
                  <span className="text-[#94A3B8]">{activeDisaster.secondary}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h4 className="font-mono-data text-[10px] text-[#E11D48] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Lifeline Failure Mechanism</span>
                  </h4>
                  <p className="font-body-prose text-sm text-[#F3F4F6] leading-relaxed">
                    {activeDisaster.lifelineImpact}
                  </p>
                </div>

                <div>
                  <h4 className="font-mono-data text-[10px] text-[#059669] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Recommended Tactical Units</span>
                  </h4>
                  <p className="font-mono-data text-xs text-[#34D399] leading-relaxed p-3.5 rounded-xl bg-[#059669]/10 border border-[#059669]/20">
                    {activeDisaster.tacticalAssets}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-white/10">
                <span className="font-mono-data text-[10px] text-[#64748B]">
                  Simulate live in GIS Console
                </span>
                <Link
                  href="/gis-map"
                  className="btn-action-primary text-xs py-2 px-4 rounded-lg flex items-center gap-2"
                >
                  <span>Simulate {activeDisaster.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 4: 4-LIFELINE TELEMETRY MATRIX */}
      <section className="relative py-28 p-6 sm:p-12 z-10 border-t border-white/5">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainerVars}
          className="max-w-5xl mx-auto space-y-12"
        >
          <div className="space-y-3">
            <motion.div variants={fadeUpVars} className="font-mono-data text-xs text-[#E11D48] tracking-[0.2em] uppercase">
              03 // Lifeline Telemetry Matrix
            </motion.div>
            <motion.h2 variants={fadeUpVars} className="font-display-calm text-4xl sm:text-6xl text-white tracking-tight">
              Expected vs Observed Reality
            </motion.h2>
            <motion.p variants={fadeUpVars} className="font-body-prose text-sm text-[#94A3B8] max-w-2xl">
              PRATYAKSH-Ω audits 4 concrete infrastructure vectors simultaneously, calculating deficit percentages and continuous Silent Zone Risk scores.
            </motion.p>
          </div>

          <motion.div variants={fadeUpVars} className="rounded-3xl bg-[#0C0E12]/90 border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 bg-white/[0.02] border-b border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono-data text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[#64748B] uppercase">SAMPLE SECTOR:</span>
                <strong className="text-white text-sm">Gorkha (Barpak Ridge)</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#64748B]">SILENT ZONE RISK:</span>
                <span className="chip-critical text-xs">9.4 / 10.0 (CRITICAL_BLACKOUT)</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono-data text-xs">
                <thead className="bg-black/30 border-b border-white/5 text-[#64748B] text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-normal">Lifeline Vector</th>
                    <th className="p-4 font-normal">Historical Baseline</th>
                    <th className="p-4 font-normal">Expected Reality</th>
                    <th className="p-4 font-normal">Observed Evidence</th>
                    <th className="p-4 font-normal text-right">Deficit</th>
                    <th className="p-4 font-normal text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-[#60A5FA]" />
                      <span>Mobile BTS Towers</span>
                    </td>
                    <td className="p-4 text-[#94A3B8]">48 Towers (100%)</td>
                    <td className="p-4 text-[#94A3B8]">47 Towers (98.5%)</td>
                    <td className="p-4 text-[#FB7185] font-bold">0 Towers (0.0%)</td>
                    <td className="p-4 text-right text-[#FB7185] font-bold">-100%</td>
                    <td className="p-4 text-right">
                      <span className="chip-critical">OUTAGE</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#FBBF24]" />
                      <span>Electricity Substation</span>
                    </td>
                    <td className="p-4 text-[#94A3B8]">18.5 MW Load</td>
                    <td className="p-4 text-[#94A3B8]">19.2 MW Load</td>
                    <td className="p-4 text-[#FB7185] font-bold">0.0 MW (Trip)</td>
                    <td className="p-4 text-right text-[#FB7185] font-bold">-100%</td>
                    <td className="p-4 text-right">
                      <span className="chip-critical">GRID_TRIP</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Server className="w-4 h-4 text-[#C084FC]" />
                      <span>Internet Fiber Backbone</span>
                    </td>
                    <td className="p-4 text-[#94A3B8]">1,200 Mbps Flow</td>
                    <td className="p-4 text-[#94A3B8]">1,150 Mbps Expected</td>
                    <td className="p-4 text-[#FB7185] font-bold">0 Mbps (100% Drop)</td>
                    <td className="p-4 text-right text-[#FB7185] font-bold">-100%</td>
                    <td className="p-4 text-right">
                      <span className="chip-critical">FIBER_CUT</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#34D399]" />
                      <span>Highway Passability</span>
                    </td>
                    <td className="p-4 text-[#94A3B8]">98% Arterial Open</td>
                    <td className="p-4 text-[#94A3B8]">95% Clear Weather</td>
                    <td className="p-4 text-[#FB7185] font-bold">0% (Landslide Choke)</td>
                    <td className="p-4 text-right text-[#FB7185] font-bold">-100%</td>
                    <td className="p-4 text-right">
                      <span className="chip-critical">ROAD_CHOKE</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 5: 5 CANONICAL HYPOTHESES */}
      <section className="relative py-28 p-6 sm:p-12 z-10 border-t border-white/5 bg-[#0C0E12]/40">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainerVars}
          className="max-w-6xl mx-auto space-y-12"
        >
          <div className="text-center space-y-3">
            <motion.div variants={fadeUpVars} className="font-mono-data text-xs text-[#E11D48] tracking-[0.2em] uppercase">
              04 // Epistemic Reasoning
            </motion.div>
            <motion.h2 variants={fadeUpVars} className="font-display-calm text-4xl sm:text-6xl text-white tracking-tight">
              The 5 Canonical Silent Zone Hypotheses
            </motion.h2>
            <motion.p variants={fadeUpVars} className="font-body-prose text-sm text-[#94A3B8] max-w-xl mx-auto">
              Mutually exclusive and collectively exhaustive physical states updated via numerically stabilized Log-Sum-Exp Bayesian calculus.
            </motion.p>
          </div>

          <motion.div variants={fadeUpVars} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { code: "H1", title: "Comms Failure", prob: "12%", desc: "BTS towers down, backhaul cut; physical damage remains moderate." },
              { code: "H2", title: "Infra Failure", prob: "18%", desc: "Access bridges sheared, mountain highways buried by slide debris." },
              { code: "H3", title: "Pop Movement", prob: "8%", desc: "Villages evacuated to open football grounds prior to telecom failure." },
              { code: "H4", title: "Sensor Failure", prob: "4%", desc: "IoT logger batteries dead; actual conditions stable and operable." },
              { code: "H5", title: "Severe Impact", prob: "58%", desc: "Widespread structural collapse, mass trapped casualties, silent isolation.", leading: true },
            ].map((hyp) => (
              <div
                key={hyp.code}
                className={`p-6 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                  hyp.leading
                    ? "bg-rose-500/10 border-rose-500/30 shadow-lg shadow-rose-500/10"
                    : "bg-[#090B0E] border-white/10"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono-data text-xs">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      hyp.leading ? "bg-[#E11D48] text-white" : "bg-white/10 text-[#94A3B8]"
                    }`}>
                      {hyp.code}
                    </span>
                    <span className={`text-base font-bold ${
                      hyp.leading ? "text-[#FB7185]" : "text-white"
                    }`}>
                      {hyp.prob}
                    </span>
                  </div>
                  <h4 className="font-display-calm font-medium text-lg text-white">
                    {hyp.title}
                  </h4>
                  <p className="font-body-prose text-xs text-[#94A3B8] leading-relaxed">
                    {hyp.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 font-mono-data text-[10px] text-[#64748B] flex items-center justify-between">
                  <span>Bayes State</span>
                  <span className={hyp.leading ? "text-rose-400 font-bold" : "text-[#94A3B8]"}>
                    {hyp.leading ? "DOMINANT" : "EVALUATED"}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUpVars} className="p-6 rounded-2xl bg-black/40 border border-white/5 font-mono-data text-xs text-[#94A3B8] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-[#60A5FA]" />
              <span>
                Active Verification minimizes Shannon Entropy: <strong className="text-white">H(P) = 1.82 bits &rarr; 0.35 bits</strong> after aerial reconnaissance.
              </span>
            </div>
            <Link
              href="/hypotheses"
              className="text-[#60A5FA] hover:text-white flex items-center gap-1.5 font-bold whitespace-nowrap"
            >
              <span>Inspect Hypotheses Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 6: MATHEMATICAL FOUNDATIONS */}
      <section className="relative py-28 p-6 sm:p-12 z-10 border-t border-white/5">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainerVars}
          className="max-w-6xl mx-auto space-y-12"
        >
          <div className="text-center space-y-3">
            <motion.div variants={fadeUpVars} className="font-mono-data text-xs text-[#E11D48] tracking-[0.2em] uppercase">
              05 // Scientific Rigor
            </motion.div>
            <motion.h2 variants={fadeUpVars} className="font-display-calm text-4xl sm:text-6xl text-white tracking-tight">
              Deterministic Mathematical Foundations
            </motion.h2>
            <motion.p variants={fadeUpVars} className="font-body-prose text-sm text-[#94A3B8] max-w-xl mx-auto">
              Every inference is traceable to first-principles formulas rather than opaque black-box guesses.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={fadeUpVars} className="p-8 rounded-3xl bg-[#0C0E12]/90 border border-white/10 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono-data uppercase tracking-wider text-[#E11D48]">
                <span>01 Diurnal Baseline Curve</span>
                <span>Signal Model</span>
              </div>
              <div className="p-4 rounded-xl bg-black/60 border border-white/5 font-mono-data text-sm text-rose-300 text-center">
                A(t) = BaseRate &middot; [0.15 + 0.85 &middot; sin<sup>2</sup>(&pi;(h-4)/24)] &middot; f<sub>day</sub>(d)
              </div>
              <p className="font-body-prose text-xs text-[#94A3B8] leading-relaxed">
                Establishes the expected call volume per sector at hour <em>h</em> and weekday <em>d</em> to ground expected reality before detecting silent zones.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVars} className="p-8 rounded-3xl bg-[#0C0E12]/90 border border-white/10 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono-data uppercase tracking-wider text-[#D97706]">
                <span>02 Negative Evidence Gap</span>
                <span>Z-Score Metric</span>
              </div>
              <div className="p-4 rounded-xl bg-black/60 border border-white/5 font-mono-data text-sm text-amber-300 text-center">
                Z = (Observed - ExpectedMean) / max(0.1, &sigma;<sub>expected</sub>)
              </div>
              <p className="font-body-prose text-xs text-[#94A3B8] leading-relaxed">
                Flags critical communication blackouts (<em>Z &le; -2.0</em> or <em>Observed=0</em>) when an active population unexpectedly goes silent.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVars} className="p-8 rounded-3xl bg-[#0C0E12]/90 border border-white/10 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono-data uppercase tracking-wider text-[#059669]">
                <span>03 Bayesian Belief Updating</span>
                <span>Log-Sum-Exp Softmax</span>
              </div>
              <div className="p-4 rounded-xl bg-black/60 border border-white/5 font-mono-data text-sm text-emerald-300 text-center">
                log P(H<sub>i</sub> | E) = log P(H<sub>i</sub>) + &sum; w<sub>eff,j</sub> &middot; &Lambda;(H<sub>i</sub>, e<sub>j</sub>)
              </div>
              <p className="font-body-prose text-xs text-[#94A3B8] leading-relaxed">
                Dynamically updates posterior beliefs across 5 physical hypotheses without mathematical numerical underflow.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVars} className="p-8 rounded-3xl bg-[#0C0E12]/90 border border-white/10 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono-data uppercase tracking-wider text-[#2563EB]">
                <span>04 Shannon Information Gain</span>
                <span>Active Verification</span>
              </div>
              <div className="p-4 rounded-xl bg-black/60 border border-white/5 font-mono-data text-sm text-blue-300 text-center">
                &Delta;&Eta;(a) = &Eta;(P) - E[&Eta;(P | O<sub>a</sub>)] &nbsp;&bull;&nbsp; &Eta;(P) = -&sum; P(H<sub>i</sub>) &middot; log<sub>2</sub>P(H<sub>i</sub>)
              </div>
              <p className="font-body-prose text-xs text-[#94A3B8] leading-relaxed">
                Ranks candidate drone, radar, and patrol reconnaissance actions to maximize uncertainty entropy reduction per sortie dollar.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 7: COMMAND LAUNCH PORTAL */}
      <section className="relative min-h-[75vh] flex flex-col items-center justify-center p-6 sm:p-12 z-10 border-t border-white/5 bg-gradient-to-b from-[#090B0E] to-[#040507]">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainerVars}
          className="max-w-3xl w-full text-center space-y-8"
        >
          <motion.div variants={fadeUpVars} className="font-mono-data text-xs text-[#E11D48] uppercase tracking-[0.3em]">
            // Operational Readiness
          </motion.div>

          <motion.h2 variants={fadeUpVars} className="font-display-calm text-5xl sm:text-7xl text-white tracking-tight">
            Enter the Tactical Console
          </motion.h2>

          <motion.p variants={fadeUpVars} className="font-body-prose text-sm sm:text-base text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
            Transition from public narrative to active incident management. Inspect H3 hexagonal microgrids, simulate multi-disaster scenarios, and authorize reconnaissance sorties.
          </motion.p>

          <motion.div variants={fadeUpVars} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/gis-map"
              className="w-full sm:w-auto px-8 py-4 bg-[#E11D48] text-white font-mono-data text-xs uppercase tracking-[0.2em] hover:bg-[#BE123C] transition-all rounded-xl shadow-[0_0_30px_rgba(225,29,72,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Radar className="w-4 h-4" />
              <span>Launch Live GIS Console</span>
            </Link>

            <Link
              href="/sitrep"
              className="w-full sm:w-auto px-8 py-4 border border-white/15 bg-white/5 text-white font-mono-data text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all rounded-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#60A5FA]" />
              <span>View Executive SITREP</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
