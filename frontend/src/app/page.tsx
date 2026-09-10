"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Radar,
  Radio,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
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
  ChevronRight,
  Sparkles,
  BookOpen,
  Database,
  Terminal,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { TacticalAudio } from "@/lib/TacticalAudio";

interface DossierSectionMeta {
  id: string;
  code: string;
  label: string;
  shortLabel: string;
}

const DOSSIER_SECTIONS: DossierSectionMeta[] = [
  { id: "dossier-overview", code: "01", label: "Platform Information", shortLabel: "Platform Info" },
  { id: "dossier-doctrine", code: "02", label: "The Core Doctrine", shortLabel: "Doctrine" },
  { id: "dossier-capabilities", code: "03", label: "Six Capabilities", shortLabel: "Capabilities" },
  { id: "dossier-archetypes", code: "04", label: "Disaster Archetypes", shortLabel: "Archetypes" },
  { id: "dossier-scenario", code: "05", label: "Barpak Counterfactual", shortLabel: "Barpak Case" },
  { id: "dossier-provenance", code: "06", label: "Data Provenance", shortLabel: "Data Matrix" },
  { id: "dossier-glossary", code: "07", label: "Operational Glossary", shortLabel: "Glossary" },
  { id: "dossier-brief", code: "08", label: "Executive Brief", shortLabel: "Executive Brief" },
];

export default function ContinuousDossierLandingPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("dossier-overview");
  const isClickScrolling = useRef(false);

  // Auto-select next part when scrolling automatically (Scroll-Spy)
  useEffect(() => {
    const handleScroll = () => {
      if (isClickScrolling.current) return;

      const scrollPosition = window.scrollY + 180; // Offset for sticky headers
      let currentSection = DOSSIER_SECTIONS[0].id;

      for (const section of DOSSIER_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            currentSection = section.id;
          }
        }
      }

      setActiveSection((prev) => (prev !== currentSection ? currentSection : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    TacticalAudio.playClick();
    isClickScrolling.current = true;
    setActiveSection(id);

    const el = document.getElementById(id);
    if (el) {
      const topOffset = 110; // Clearance for fixed navbar + subnav
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setTimeout(() => {
        isClickScrolling.current = false;
      }, 700);
    } else {
      isClickScrolling.current = false;
    }
  };

  return (
    <div
      className="w-full min-h-screen relative selection:bg-rose-500 selection:text-white"
      style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-primary)" }}
    >
      {/* ================================================================== */}
      {/* STICKY DOSSIER AUTO-SCROLL-SPY SUBNAV                               */}
      {/* ================================================================== */}
      <div
        className="sticky top-[53px] z-40 w-full backdrop-blur-md border-b transition-all"
        style={{
          backgroundColor: "rgba(6, 8, 13, 0.92)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="hidden sm:inline font-mono-data text-[11px] uppercase tracking-wider text-[#5C6E84] shrink-0 mr-1">
              DOSSIER:
            </span>
            {DOSSIER_SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono-data text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-rose-500/20 text-white border border-rose-500/50 shadow-sm shadow-rose-950/40 font-bold"
                      : "text-[#9AAABE] hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span
                    className={`text-[10px] ${
                      isActive ? "text-rose-400 font-bold" : "text-[#5C6E84]"
                    }`}
                  >
                    {sec.code}
                  </span>
                  <span>{sec.shortLabel}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 1. DOSSIER OVERVIEW / HERO                                         */}
      {/* ================================================================== */}
      <section
        id="dossier-overview"
        className="relative pt-16 pb-20 px-6 sm:px-12 lg:px-20 border-b overflow-hidden"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        <div
          aria-hidden
          className="absolute top-0 right-0 w-[700px] h-[700px] pointer-events-none opacity-25"
          style={{
            background: "radial-gradient(circle, rgba(232,16,58,0.25) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-mono-data text-xs uppercase tracking-widest text-rose-400 font-bold">
              SYSTEM DOSSIER &bull; PRATYAKSH-Ω (प्रत्यक्ष)
            </span>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="font-mono-data text-xs text-[#5C6E84]">
              Sanskrit: Direct, Empirical Perception of Reality
            </span>
          </div>

          <h1
            className="font-display-calm font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.06]"
            style={{ textWrap: "balance" }}
          >
            Autonomous Disaster Reality Reconstruction
          </h1>

          <p
            className="font-body-prose text-lg sm:text-xl text-[#9AAABE] max-w-[65ch] leading-relaxed"
            style={{ textWrap: "pretty" }}
          >
            PRATYAKSH-Ω is a multi-agency crisis intelligence platform that illuminates silent, severed disaster zones. By reconciling physical hazard shock with lifeline telemetry, it inverts the classic reporting bias and directs emergency assets where communications have been completely annihilated.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            {user ? (
              <Link
                href="/situation"
                onClick={() => TacticalAudio.playPing()}
                className="btn-action-primary flex items-center gap-3 py-4 px-8 rounded-2xl text-sm sm:text-base font-bold shadow-xl shadow-rose-900/30 cursor-pointer"
              >
                <Radar className="w-5 h-5 text-white" />
                <span>Enter Operational Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/auth"
                onClick={() => TacticalAudio.playPing()}
                className="btn-action-primary flex items-center gap-3 py-4 px-8 rounded-2xl text-sm sm:text-base font-bold shadow-xl shadow-rose-900/30 cursor-pointer"
              >
                <LogIn className="w-5 h-5 text-white" />
                <span>Sign In & Launch Platform</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}

            <button
              onClick={() => scrollToSection("dossier-doctrine")}
              className="btn-action-secondary flex items-center gap-2 py-4 px-6 rounded-2xl text-xs sm:text-sm cursor-pointer"
            >
              <span>Scroll System Dossier</span>
              <ChevronRight className="w-4 h-4 text-[#38BDF8]" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 font-mono-data text-xs">
            <div>
              <div className="text-[#5C6E84] uppercase tracking-wider text-[10px]">Target Corridor</div>
              <div className="text-white font-bold text-sm mt-0.5">Central Nepal</div>
            </div>
            <div>
              <div className="text-[#5C6E84] uppercase tracking-wider text-[10px]">Telemetry Rate</div>
              <div className="text-emerald-400 font-bold text-sm mt-0.5">10 Hz Synchronous</div>
            </div>
            <div>
              <div className="text-[#5C6E84] uppercase tracking-wider text-[10px]">Silent Sector Latency</div>
              <div className="text-amber-400 font-bold text-sm mt-0.5">&lt; 18 Minutes</div>
            </div>
            <div>
              <div className="text-[#5C6E84] uppercase tracking-wider text-[10px]">Lifeline Deficit</div>
              <div className="text-rose-400 font-bold text-sm mt-0.5">Negative Evidence</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 2. THE CORE DOCTRINE                                               */}
      {/* ================================================================== */}
      <section
        id="dossier-doctrine"
        className="py-20 px-6 sm:px-12 lg:px-20 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-mono-data text-xs uppercase tracking-widest text-rose-400 font-bold">
                PART 02 // OPERATIONAL PHILOSOPHY
              </span>
            </div>
            <h2
              className="font-display-calm font-extrabold text-3xl sm:text-5xl text-white tracking-tight"
              style={{ textWrap: "balance" }}
            >
              The Core Doctrine: Silence is Not Safety.
            </h2>
          </div>

          <blockquote
            className="font-quote-display italic text-xl sm:text-2xl text-[#CBD5E1] border-l-2 pl-6 my-6 leading-relaxed"
            style={{ borderColor: "var(--accent)" }}
          >
            &ldquo;In catastrophic terrain, the absence of distress signals is not evidence of safety. It is direct, empirical evidence that observation channels have been completely severed.&rdquo;
          </blockquote>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className="p-6 rounded-2xl border space-y-4"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xs">
                  01
                </div>
                <h3 className="font-display-calm font-bold text-lg text-white">
                  The Reporting Bias Trap
                </h3>
              </div>
              <p className="font-body-prose text-sm text-[#9AAABE] leading-relaxed">
                When a catastrophic event strikes, traditional command centres direct emergency resources to wherever the phone is ringing. Urban centres with superficial damage dominate the radio frequencies, while rural epicenters with 100% infrastructure collapse remain completely silent.
              </p>
            </div>

            <div
              className="p-6 rounded-2xl border space-y-4"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] font-bold text-xs">
                  02
                </div>
                <h3 className="font-display-calm font-bold text-lg text-white">
                  The Epistemological Inversion
                </h3>
              </div>
              <p className="font-body-prose text-sm text-[#9AAABE] leading-relaxed">
                PRATYAKSH-Ω treats silence as high-entropy data. By pairing seismic and physical hazard models with real-time cellular, electrical, and fiber telemetry, the system calculates a Lifeline Deficit: expected reports minus observed reports. When deficit reaches 100%, catastrophic blackout is declared.
              </p>
            </div>
          </div>

          <div
            className="p-6 rounded-2xl border font-mono-data text-xs space-y-3"
            style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-subtle)" }}
          >
            <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
              Mathematical Representation of Negative Evidence
            </div>
            <div className="text-[#CBD5E1] bg-black/40 p-4 rounded-xl overflow-x-auto text-sm border border-white/5">
              P(Catastrophe | Total Silence) = [ P(Total Silence | Catastrophe) &times; P(Catastrophe) ] &divide; P(Total Silence) &rarr; 0.978 (Barpak Epicenter)
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 3. SIX PLATFORM CAPABILITIES                                       */}
      {/* ================================================================== */}
      <section
        id="dossier-capabilities"
        className="py-20 px-6 sm:px-12 lg:px-20 border-b"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono-data text-xs uppercase tracking-widest text-emerald-400 font-bold">
                PART 03 // ARCHITECTURAL PIPELINE
              </span>
            </div>
            <h2 className="font-display-calm font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              Six Autonomous Engines
            </h2>
            <p className="font-body-prose text-base sm:text-lg text-[#9AAABE] max-w-3xl">
              From raw seismic wave arrivals to tactical helicopter dispatch vectors, PRATYAKSH-Ω executes an end-to-end multi-agency analytical chain in under 35 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                code: "ENGINE 01",
                title: "Live GIS Cartography",
                desc: "Leaflet vector radar cartography tracking 7 target sectors, fault slip isolines, and real-time lifeline status overlays.",
              },
              {
                icon: Cpu,
                code: "ENGINE 02",
                title: "Graph Deduplication",
                desc: "Cosine similarity and connected-components clustering reconcile redundant multi-agency dispatch reports into unified ground truth.",
              },
              {
                icon: Radio,
                code: "ENGINE 03",
                title: "Blackout Intelligence",
                desc: "Detects complete telemetry extinction across mobile BTS, electrical grids, and optical fiber backbones in silent sectors.",
              },
              {
                icon: Sparkles,
                code: "ENGINE 04",
                title: "Bayesian Reconstruction",
                desc: "Combines prior physical vulnerability with sparse sensor evidence to reconstruct ground truth damage distribution.",
              },
              {
                icon: Users,
                code: "ENGINE 05",
                title: "Population Exposure",
                desc: "Integrates CBS Nepal 2021 census data with Ward-level palika boundary polygons to calculate trapped demographic counts.",
              },
              {
                icon: Truck,
                code: "ENGINE 06",
                title: "Prioritized Dispatch",
                desc: "Calculates utility-maximizing tactical dispatch vectors for heavy SAR, medical airlifts, and water purification units.",
              },
            ].map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border space-y-3 transition-all hover:border-white/30"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-default)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-data text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                      {cap.code}
                    </span>
                    <Icon className="w-5 h-5 text-[#38BDF8]" />
                  </div>
                  <h3 className="font-display-calm font-bold text-lg text-white">
                    {cap.title}
                  </h3>
                  <p className="font-body-prose text-xs text-[#9AAABE] leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 4. DISASTER ARCHETYPES                                             */}
      {/* ================================================================== */}
      <section
        id="dossier-archetypes"
        className="py-20 px-6 sm:px-12 lg:px-20 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-mono-data text-xs uppercase tracking-widest text-amber-400 font-bold">
                PART 04 // PHYSICAL PROFILES
              </span>
            </div>
            <h2 className="font-display-calm font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              Five Disaster Archetypes
            </h2>
            <p className="font-body-prose text-base sm:text-lg text-[#9AAABE] max-w-3xl">
              PRATYAKSH-Ω models distinct physical failure dynamics across the Himalayan orogenic belt and south-Asian river basins.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: Activity,
                title: "M7.8+ Megathrust Earthquake",
                location: "Central Nepal Main Himalayan Thrust (MHT)",
                signature: "P-wave onset &rarr; Peak ground acceleration 0.8g &rarr; 95% BTS tower collapse.",
                telemetry: "Total electrical grid trip within 4 seconds; optical fiber severed along highway tunnels.",
              },
              {
                icon: Waves,
                title: "Glacial Lake Outburst Flood (GLOF)",
                location: "Tsho Rolpa / Imja Tsho High Himalaya",
                signature: "Moraine wall breach &rarr; 8,000 m³/s surge &rarr; river valley swept down to bedrock.",
                telemetry: "Hydrological gauges register sudden anomalous crest followed by permanent transmission loss.",
              },
              {
                icon: Mountain,
                title: "Mass Landslide & Slope Liquefaction",
                location: "Jure / Sunkoshi Ridge Corridors",
                signature: "Monsoonal saturation &rarr; valley damming &rarr; arterial highway disconnection.",
                telemetry: "Physical access cut off; cellular antennas intact but isolated from backhaul exchange.",
              },
              {
                icon: Wind,
                title: "Urban Basin Monsoonal Inundation",
                location: "Kathmandu Valley / Bagmati-Bishnumati Confluence",
                signature: "Extreme precipitation &rarr; low-lying drainage choke &rarr; ground-level substation flooding.",
                telemetry: "High volume of 112 calls from elevated structures; power outage in lower basements.",
              },
              {
                icon: Flame,
                title: "Multi-Front Wildland-Urban Firestorm",
                location: "Shivapuri Foothills & Dense Informal Settlements",
                signature: "Dry season gale &rarr; crown fire transition &rarr; rapid structural ignition.",
                telemetry: "Dense thermal IR anomaly detected from Copernicus satellites; air quality sensors saturate.",
              },
            ].map((arch, idx) => {
              const Icon = arch.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border space-y-3"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-default)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display-calm font-bold text-lg text-white">
                          {arch.title}
                        </h3>
                        <p className="font-mono-data text-xs text-[#5C6E84]">{arch.location}</p>
                      </div>
                    </div>
                    <span className="font-mono-data text-xs text-[#9AAABE]">PROFILE 0{idx + 1}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-mono-data text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[#5C6E84] block text-[10px] uppercase">Sensory Signature:</span>
                      <span className="text-[#CBD5E1] mt-0.5 block">{arch.signature}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[#5C6E84] block text-[10px] uppercase">Lifeline Dynamics:</span>
                      <span className="text-rose-400 mt-0.5 block">{arch.telemetry}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 5. BARPAK COUNTERFACTUAL SCENARIO                                  */}
      {/* ================================================================== */}
      <section
        id="dossier-scenario"
        className="py-20 px-6 sm:px-12 lg:px-20 border-b"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-mono-data text-xs uppercase tracking-widest text-rose-400 font-bold">
                PART 05 // HISTORICAL VALIDATION
              </span>
            </div>
            <h2 className="font-display-calm font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              The Barpak 2015 Counterfactual
            </h2>
            <p className="font-body-prose text-base sm:text-lg text-[#9AAABE] max-w-3xl">
              On 25 April 2015, the M7.8 Gorkha earthquake struck. Because Barpak village was at the epicenter, all communications died instantly. The capital sent rescue teams south and east where phones were ringing. Barpak waited 72 hours in total silence.
            </p>
          </div>

          {/* Timeline Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div
              className="p-6 rounded-2xl border space-y-4"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
            >
              <div className="flex items-center gap-2 text-rose-400 font-mono-data text-xs font-bold uppercase">
                <ShieldAlert className="w-4 h-4" />
                <span>Conventional Response (2015 Reality)</span>
              </div>
              <ul className="space-y-3 font-mono-data text-xs text-[#9AAABE]">
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold shrink-0">T+0h:</span>
                  <span>Shaking stops. 48/48 BTS towers down in Gorkha. No 112 calls reach police.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold shrink-0">T+6h:</span>
                  <span>Kathmandu media covers collapsed perimeter walls in capital. Resources deployed locally.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold shrink-0">T+24h:</span>
                  <span>Rumors of rural damage surface. No confirmed coordinates available.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0">T+72h:</span>
                  <span>First army patrol walks into Barpak on foot. 1,200 perished under rubble.</span>
                </li>
              </ul>
            </div>

            <div
              className="p-6 rounded-2xl border space-y-4"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "rgba(16, 185, 129, 0.4)",
              }}
            >
              <div className="flex items-center gap-2 text-emerald-400 font-mono-data text-xs font-bold uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>PRATYAKSH-Ω Autonomous Inversion</span>
              </div>
              <ul className="space-y-3 font-mono-data text-xs text-[#CBD5E1]">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">T+02m:</span>
                  <span>USGS Shakemap overlay registers VII+ intensity over Gorkha district.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">T+05m:</span>
                  <span>Lifeline Deficit Engine detects 0/48 expected BTS heartbeats. Deficit flag = 100%.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">T+18m:</span>
                  <span>Bayesian inference calculates 94% probability of catastrophic structural collapse.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">T+35m:</span>
                  <span>Automated tactical helicopter dispatch order routed to Pokhara base for direct Barpak airdrop.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 6. DATA PROVENANCE                                                 */}
      {/* ================================================================== */}
      <section
        id="dossier-provenance"
        className="py-20 px-6 sm:px-12 lg:px-20 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
              <span className="font-mono-data text-xs uppercase tracking-widest text-[#38BDF8] font-bold">
                PART 06 // DATA MATRIX
              </span>
            </div>
            <h2 className="font-display-calm font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              Data Provenance & Telemetry
            </h2>
            <p className="font-body-prose text-base sm:text-lg text-[#9AAABE] max-w-3xl">
              PRATYAKSH-Ω ingests authoritative multi-agency data streams with rigorous epistemological weighting.
            </p>
          </div>

          <div
            className="rounded-2xl border overflow-hidden font-mono-data text-xs"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[#5C6E84] text-[11px] uppercase tracking-wider bg-black/20">
                    <th className="p-4">Telemetry Stream</th>
                    <th className="p-4">Provider Agency</th>
                    <th className="p-4">Update Cadence</th>
                    <th className="p-4">Inference Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[#CBD5E1]">
                  <tr>
                    <td className="p-4 font-bold text-white">USGS ShakeMap & GeoNet</td>
                    <td className="p-4 text-[#9AAABE]">USGS / National Seismological Centre</td>
                    <td className="p-4 text-emerald-400">T+90 seconds</td>
                    <td className="p-4 font-bold text-rose-400">0.95 (Primary Hazard Prior)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white">Cellular BTS Tower Status</td>
                    <td className="p-4 text-[#9AAABE]">Nepal Telecom & Ncell Operations</td>
                    <td className="p-4 text-emerald-400">10-second polling</td>
                    <td className="p-4 font-bold text-[#38BDF8]">0.88 (Negative Evidence)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white">Grid Substation Telemetry</td>
                    <td className="p-4 text-[#9AAABE]">Nepal Electricity Authority (NEA)</td>
                    <td className="p-4 text-emerald-400">1-second SCADA</td>
                    <td className="p-4 font-bold text-[#38BDF8]">0.85 (Lifeline Vitality)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white">Copernicus Sentinel-1 SAR</td>
                    <td className="p-4 text-[#9AAABE]">European Space Agency (ESA)</td>
                    <td className="p-4 text-amber-400">12-hour orbit pass</td>
                    <td className="p-4 font-bold text-emerald-400">0.92 (Coherence Damage)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-white">CBS 2021 National Census</td>
                    <td className="p-4 text-[#9AAABE]">Central Bureau of Statistics Nepal</td>
                    <td className="p-4 text-[#5C6E84]">Static Decennial Baseline</td>
                    <td className="p-4 font-bold text-[#9AAABE]">0.99 (Vulnerability Weight)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 7. OPERATIONAL GLOSSARY                                            */}
      {/* ================================================================== */}
      <section
        id="dossier-glossary"
        className="py-20 px-6 sm:px-12 lg:px-20 border-b"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="font-mono-data text-xs uppercase tracking-widest text-purple-400 font-bold">
                PART 07 // TERMINOLOGY
              </span>
            </div>
            <h2 className="font-display-calm font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              Operational Glossary
            </h2>
            <p className="font-body-prose text-base sm:text-lg text-[#9AAABE] max-w-3xl">
              Plain-language definitions designed for cross-disciplinary interoperability among military, civil defense, and scientific personnel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                term: "Negative Evidence",
                def: "Information derived from what has NOT occurred. In PRATYAKSH-Ω, the complete cessation of expected telemetry is treated as strong proof of systemic physical annihilation.",
              },
              {
                term: "Lifeline Deficit",
                def: "The quantitative gap between the nominal baseline of active municipal infrastructure (power, cell, water) and observed live telemetry in a designated disaster sector.",
              },
              {
                term: "Bayesian Reality Reconstruction",
                def: "The statistical process of synthesizing physical physics priors with real-time observation updates to arrive at an uncontaminated posterior belief of catastrophe severity.",
              },
              {
                term: "Reporting Bias Fallacy",
                def: "The systematic operational error wherein emergency relief is monopolized by surviving communication hubs while silenced epicenters suffer complete neglect.",
              },
              {
                term: "Palika Vulnerability Coefficient",
                def: "A demographic composite metric fusing elderly, pediatric, and impoverished citizen ratios with structural mud-and-stone masonry prevalence.",
              },
              {
                term: "Consensus Ledger",
                def: "A graph-deduplicated ledger of validated crisis incidents stripped of duplicate 112 citizen calls and fragmented radio dispatches.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border space-y-2"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-default)",
                }}
              >
                <div className="font-mono-data text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-purple-400">#</span>
                  <span>{item.term}</span>
                </div>
                <p className="font-body-prose text-xs text-[#9AAABE] leading-relaxed">
                  {item.def}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 8. EXECUTIVE BRIEF & LAUNCH ACTION                                */}
      {/* ================================================================== */}
      <section
        id="dossier-brief"
        className="py-24 px-6 sm:px-12 lg:px-20 relative overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(232,16,58,0.2) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono-data text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>PART 08 // READY FOR CRISIS OPERATORS</span>
          </div>

          <h2 className="font-display-calm font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Authorize Clearance. Enter Operational Console.
          </h2>

          <p className="font-body-prose text-base sm:text-lg text-[#9AAABE] max-w-2xl mx-auto leading-relaxed">
            Gain immediate access to Live GIS Vector Maps, Bayesian Reality Reconstruction, Multi-Agency Incident Consensus, and Autonomous Tactical Dispatch.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {user ? (
              <Link
                href="/situation"
                onClick={() => TacticalAudio.playPing()}
                className="btn-action-primary flex items-center gap-3 py-4 px-8 rounded-2xl text-base font-bold shadow-2xl shadow-rose-900/40 cursor-pointer"
              >
                <Radar className="w-5 h-5 text-white" />
                <span>Enter Operational Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/auth"
                onClick={() => TacticalAudio.playPing()}
                className="btn-action-primary flex items-center gap-3 py-4 px-8 rounded-2xl text-base font-bold shadow-2xl shadow-rose-900/40 cursor-pointer"
              >
                <LogIn className="w-5 h-5 text-white" />
                <span>Sign In / Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}

            <button
              onClick={() => scrollToSection("dossier-overview")}
              className="btn-action-secondary flex items-center gap-2 py-4 px-6 rounded-2xl text-sm cursor-pointer"
            >
              <span>Back to Top (Dossier 01)</span>
            </button>
          </div>

          <div className="pt-8 font-mono-data text-xs text-[#5C6E84]">
            PRATYAKSH-Ω &bull; Central Nepal Disaster Resilience Consortium &bull; Classified Operational Protocol
          </div>
        </div>
      </section>
    </div>
  );
}
