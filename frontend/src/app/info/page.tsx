"use client";

import React from "react";
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
} from "lucide-react";
import { TacticalAudio } from "@/lib/TacticalAudio";

export default function InfoPage() {
  return (
    <div
      className="w-full min-h-screen relative"
      style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-primary)" }}
    >
      {/* ================================================================== */}
      {/* 1. HERO — DEDICATED INFORMATION & PLATFORM LAUNCHPAD                 */}
      {/* ================================================================== */}
      <section
        className="relative pt-20 pb-24 px-6 sm:px-12 lg:px-20 border-b overflow-hidden"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        {/* Ambient atmospheric glow */}
        <div
          aria-hidden
          className="absolute top-0 right-0 w-[700px] h-[700px] pointer-events-none opacity-25"
          style={{
            background: "radial-gradient(circle, rgba(232,16,58,0.2) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          {/* Eyebrow badge */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-mono-data text-xs uppercase tracking-widest text-rose-400 font-bold">
              SYSTEM DOSSIER &bull; PRATYAKSH-Ω (प्रत्यक्ष)
            </span>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="font-mono-data text-xs text-[#5C6E84]">
              Sanskrit: Immediate, Direct Perception of Reality
            </span>
          </div>

          {/* Main Title */}
          <h1
            className="font-display-calm font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.06]"
          >
            Autonomous Disaster Reality Reconstruction
          </h1>

          {/* Subtitle */}
          <p className="font-body-prose text-lg sm:text-xl text-[#9AAABE] max-w-3xl leading-relaxed">
            PRATYAKSH-Ω is a multi-agency crisis intelligence platform that illuminates silent, severed disaster zones. By reconciling physical hazard shock with lifeline telemetry, it inverts the classic reporting bias and directs emergency assets where communications have been completely annihilated.
          </p>

          {/* Primary High-Visibility Launchpad Button */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/gis-map"
              onClick={() => TacticalAudio.playPing()}
              className="btn-action-primary flex items-center gap-3 py-4 px-8 rounded-2xl text-sm sm:text-base font-bold shadow-xl shadow-rose-900/30 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Radar className="w-5 h-5 text-white" />
              <span>Launch Live GIS Platform</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/brief"
              onClick={() => TacticalAudio.playClick()}
              className="btn-action-secondary flex items-center gap-2 py-4 px-6 rounded-2xl text-xs sm:text-sm cursor-pointer"
            >
              <span>Executive 1-Page Summary</span>
              <ExternalLink className="w-4 h-4 text-[#38BDF8]" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 font-mono-data text-xs">
            <div>
              <div className="text-[#5C6E84] uppercase tracking-wider text-[10px]">Target Corridor</div>
              <div className="text-white font-bold text-sm mt-0.5">Central Nepal</div>
              <div className="text-[11px] text-[#9AAABE]">8 Monitored Districts</div>
            </div>
            <div>
              <div className="text-[#5C6E84] uppercase tracking-wider text-[10px]">Population Census</div>
              <div className="text-white font-bold text-sm mt-0.5">2.30M Exposed</div>
              <div className="text-[11px] text-[#9AAABE]">CBS Nepal 2021 Data</div>
            </div>
            <div>
              <div className="text-[#5C6E84] uppercase tracking-wider text-[10px]">Core Innovation</div>
              <div className="text-rose-400 font-bold text-sm mt-0.5">Negative Evidence</div>
              <div className="text-[11px] text-rose-300/80">Silence is Not Safety</div>
            </div>
            <div>
              <div className="text-[#5C6E84] uppercase tracking-wider text-[10px]">Golden Window</div>
              <div className="text-emerald-400 font-bold text-sm mt-0.5">36h Preserved</div>
              <div className="text-[11px] text-emerald-400/80">Day 1 USAR Insertion</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 2. THE PROBLEM — THE REPORTING BIAS TRAP                            */}
      {/* ================================================================== */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto space-y-12">
        <div className="space-y-4">
          <div className="font-mono-data text-xs text-rose-400 font-bold uppercase tracking-widest">
            01 // THE SYSTEMIC CRISIS
          </div>
          <h2 className="font-display-calm text-3xl sm:text-5xl font-bold text-white tracking-tight">
            The Reporting Bias Trap
          </h2>
          <p className="font-body-prose text-base text-[#9AAABE] max-w-3xl leading-relaxed">
            In catastrophic disasters like the 2015 Gorkha earthquake, emergency dashboards suffer from a fatal fallacy: they listen only to the loud, leaving the truly destroyed in darkness.
          </p>
        </div>

        {/* Asymmetric comparison layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: What happens without PRATYAKSH */}
          <div className="lg:col-span-6 p-8 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-mono-data text-xs font-bold text-rose-400 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                Conventional CAD Systems
              </div>
              <h3 className="font-display-calm text-xl sm:text-2xl font-bold text-white">
                Vocal Urban Noise Dominance
              </h3>
              <p className="font-body-prose text-xs sm:text-sm text-rose-100/80 leading-relaxed">
                Connected citizens in Kathmandu flooded 911 lines with 4,820 calls/hr regarding minor plaster cracks and traffic panics. Dispatch software prioritized these high-volume urban tickets, diverting <strong>82% of all emergency fleets</strong> away from the actual epicenter.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-rose-900/40 border border-rose-500/30 font-mono-data text-xs text-rose-200">
              <strong>RESULT:</strong> Barpak epicenter generated 0 calls because all cell towers collapsed. Responders assumed &ldquo;no news is good news,&rdquo; taking 48 hours to discover total annihilation.
            </div>
          </div>

          {/* Right: What PRATYAKSH-Ω does */}
          <div className="lg:col-span-6 p-8 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-mono-data text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                PRATYAKSH-Ω Epistemic Core
              </div>
              <h3 className="font-display-calm text-xl sm:text-2xl font-bold text-white">
                Negative Evidence Detection
              </h3>
              <p className="font-body-prose text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                The platform knows Barpak has 14,000 residents and normally generates 48.5 calls/hr. When physical sensors register MMI IX shaking but communications abruptly drop to zero, it identifies an extreme negative evidence gap (Z = -5.82σ) and immediately flags a <strong>Critical Blackout</strong>.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-500/30 font-mono-data text-xs text-emerald-200">
              <strong>RESULT:</strong> Autonomous VTOL drone reconnaissance is launched at T+1.5h. Heavy search-and-rescue teams arrive on the ridge at T+3.0h, saving lives during the golden window.
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 3. THE DOCTRINE — SILENCE IS NOT SAFETY                             */}
      {/* ================================================================== */}
      <section
        className="py-16 px-6 sm:px-12 lg:px-20 border-y"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-recessed)" }}
      >
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <div className="font-mono-data text-xs text-rose-400 uppercase tracking-widest font-bold">
            02 // THE PHILOSOPHICAL FOUNDATION
          </div>
          <blockquote
            className="font-serif-editorial italic text-2xl sm:text-4xl text-white max-w-3xl mx-auto leading-relaxed"
          >
            &ldquo;Silence is not safety. In catastrophic terrain, absence of evidence is merely evidence of broken observation channels.&rdquo;
          </blockquote>
          <p className="font-body-prose text-sm sm:text-base text-[#9AAABE] max-w-2xl mx-auto leading-relaxed">
            In information theory and Bayesian reasoning, the non-occurrence of an expected signal carries definitive mathematical weight. When physical disaster strikes a populated zone and zero messages emerge, that silence is the scream of complete infrastructure decapitation.
          </p>
          <div className="pt-2">
            <Link
              href="/doctrine"
              onClick={() => TacticalAudio.playClick()}
              className="font-mono-data text-xs text-[#38BDF8] hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <span>Read the Full Doctrine Manifesto</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 4. THE SIX CORE CAPABILITIES                                        */}
      {/* ================================================================== */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto space-y-12">
        <div className="space-y-4">
          <div className="font-mono-data text-xs text-[#38BDF8] font-bold uppercase tracking-widest">
            03 // PLATFORM ENGINES
          </div>
          <h2 className="font-display-calm text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Six Core Operational Capabilities
          </h2>
          <p className="font-body-prose text-base text-[#9AAABE] max-w-3xl leading-relaxed">
            Engineered as six interconnected modules spanning physical simulation, semantic consensus, and tactical deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono-data text-xs">
          {/* Cap 1 */}
          <div className="p-6 rounded-2xl bg-[#111620] border border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-[#38BDF8] font-bold uppercase text-[10px] tracking-wider">
                01. GIS & WAVEFRONTS
              </div>
              <h3 className="font-display-calm text-lg font-bold text-white">
                Dynamic Hazard Physics
              </h3>
              <p className="font-body-prose text-xs text-[#9AAABE] leading-relaxed">
                Simulates real-time shockwave, flood surge, and landslide propagation over 3D terrain and H3 hexagonal microgrids.
              </p>
            </div>
            <Link href="/gis-map" className="text-[#38BDF8] hover:text-white flex items-center gap-1 text-[11px] pt-2">
              <span>Inspect GIS Map</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Cap 2 */}
          <div className="p-6 rounded-2xl bg-[#111620] border border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider">
                02. DEDUPLICATION
              </div>
              <h3 className="font-display-calm text-lg font-bold text-white">
                Incident Truth Ledger
              </h3>
              <p className="font-body-prose text-xs text-[#9AAABE] leading-relaxed">
                Clusters chaotic Nepali and English reports, reconciles conflicting casualty counts, and cross-validates against UNOSAT satellite points.
              </p>
            </div>
            <Link href="/deduplication" className="text-emerald-400 hover:text-white flex items-center gap-1 text-[11px] pt-2">
              <span>View Consensus Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Cap 3 */}
          <div className="p-6 rounded-2xl bg-[#111620] border border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-rose-400 font-bold uppercase text-[10px] tracking-wider">
                03. NEGATIVE EVIDENCE
              </div>
              <h3 className="font-display-calm text-lg font-bold text-white">
                Blackout Intelligence
              </h3>
              <p className="font-body-prose text-xs text-[#9AAABE] leading-relaxed">
                Calculates Silence Risk Indices (0-10) for sectors where phone towers, optical backhaul, and electrical grids have collapsed.
              </p>
            </div>
            <Link href="/blackout-intel" className="text-rose-400 hover:text-white flex items-center gap-1 text-[11px] pt-2">
              <span>Explore Blackout Intel</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Cap 4 */}
          <div className="p-6 rounded-2xl bg-[#111620] border border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-[#8B5CF6] font-bold uppercase text-[10px] tracking-wider">
                04. BAYESIAN INFERENCE
              </div>
              <h3 className="font-display-calm text-lg font-bold text-white">
                Reality Reconstruction
              </h3>
              <p className="font-body-prose text-xs text-[#9AAABE] leading-relaxed">
                Evaluates 5 competing hypotheses explaining why a sector went dark, tracking Shannon entropy to guide reconnaissance sorties.
              </p>
            </div>
            <Link href="/hypotheses" className="text-[#8B5CF6] hover:text-white flex items-center gap-1 text-[11px] pt-2">
              <span>Bayesian Engine</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Cap 5 */}
          <div className="p-6 rounded-2xl bg-[#111620] border border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-amber-400 font-bold uppercase text-[10px] tracking-wider">
                05. CENSUS ACCOUNTABILITY
              </div>
              <h3 className="font-display-calm text-lg font-bold text-white">
                Population Exposure
              </h3>
              <p className="font-body-prose text-xs text-[#9AAABE] leading-relaxed">
                Integrates CBS Nepal 2021 Census palika records with building fragility curves to quantify vulnerable demographics and track missing persons.
              </p>
            </div>
            <Link href="/population" className="text-amber-400 hover:text-white flex items-center gap-1 text-[11px] pt-2">
              <span>Census Roster</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Cap 6 */}
          <div className="p-6 rounded-2xl bg-[#111620] border border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-[#06B6D4] font-bold uppercase text-[10px] tracking-wider">
                06. TACTICAL DISPATCH
              </div>
              <h3 className="font-display-calm text-lg font-bold text-white">
                Resource Optimization
              </h3>
              <p className="font-body-prose text-xs text-[#9AAABE] leading-relaxed">
                Matches specialized Armed Police Force USAR squads, trauma surgical units, and heavy excavators to deficit-ranked sectors.
              </p>
            </div>
            <Link href="/dispatch" className="text-[#06B6D4] hover:text-white flex items-center gap-1 text-[11px] pt-2">
              <span>Dispatch Queue</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 5. CATASTROPHE ARCHETYPES                                          */}
      {/* ================================================================== */}
      <section
        className="py-20 px-6 sm:px-12 lg:px-20 border-t"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-3">
            <div className="font-mono-data text-xs text-rose-400 font-bold uppercase tracking-widest">
              04 // HAZARD DOMAINS
            </div>
            <h2 className="font-display-calm text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Supported Multi-Hazard Archetypes
            </h2>
            <p className="font-body-prose text-base text-[#9AAABE] max-w-2xl leading-relaxed">
              Disasters have distinct physical signatures. PRATYAKSH-Ω provides tailored physics models for 5 catastrophe classes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { name: "Seismic Rupture", icon: Activity, color: "#E11D48", benchmark: "M7.8 Gorkha" },
              { name: "Glacial Breach", icon: Waves, color: "#06B6D4", benchmark: "Melamchi GLOF" },
              { name: "Severe Gale", icon: Wind, color: "#3B82F6", benchmark: "Terai Cyclone" },
              { name: "Slope Failure", icon: Mountain, color: "#D97706", benchmark: "Rasuwa Landslide" },
              { name: "Core Conflagration", icon: Flame, color: "#F97316", benchmark: "Kathmandu Fire" },
            ].map((arch, idx) => {
              const ArchIcon = arch.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#111620] border border-white/10 space-y-3 flex flex-col justify-between"
                >
                  <ArchIcon className="w-6 h-6" style={{ color: arch.color }} />
                  <div>
                    <div className="font-display-calm text-sm font-bold text-white">{arch.name}</div>
                    <div className="font-mono-data text-[10px] text-[#5C6E84] mt-1">{arch.benchmark}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/disasters"
              onClick={() => TacticalAudio.playClick()}
              className="font-mono-data text-xs text-[#38BDF8] hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <span>Explore Detailed Hazard Profiles & Rescue Units</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 6. AUTHENTIC DATA PROVENANCE                                        */}
      {/* ================================================================== */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="font-mono-data text-xs text-emerald-400 font-bold uppercase tracking-widest">
            05 // EVIDENCE PROVENANCE
          </div>
          <h2 className="font-display-calm text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Grounded in Authentic Datasets
          </h2>
          <p className="font-body-prose text-base text-[#9AAABE] max-w-2xl leading-relaxed">
            Every inference, population figure, and casualty consensus is calibrated against real humanitarian evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono-data text-xs">
          <div className="p-6 rounded-2xl bg-[#111620] border border-white/10 space-y-2">
            <div className="text-[#38BDF8] font-bold uppercase text-[10px]">UNITAR / UNOSAT</div>
            <div className="font-display-calm text-base font-bold text-white">Satellite Damage Points</div>
            <p className="font-body-prose text-[11px] text-[#9AAABE] leading-relaxed">
              1,000+ optical satellite points classifying structural collapse across Central Nepal.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111620] border border-white/10 space-y-2">
            <div className="text-[#8B5CF6] font-bold uppercase text-[10px]">European Space Agency</div>
            <div className="font-display-calm text-base font-bold text-white">Copernicus Sentinel-1 SAR</div>
            <p className="font-body-prose text-[11px] text-[#9AAABE] leading-relaxed">
              Interferometric radar passes validating surface deformation through cloud cover.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111620] border border-white/10 space-y-2">
            <div className="text-emerald-400 font-bold uppercase text-[10px]">Govt of Nepal (CBS)</div>
            <div className="font-display-calm text-base font-bold text-white">2021 National Census</div>
            <p className="font-body-prose text-[11px] text-[#9AAABE] leading-relaxed">
              Official palika demographic enumeration, vulnerable age groups, and masonry typologies.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/data-sources"
            onClick={() => TacticalAudio.playClick()}
            className="font-mono-data text-xs text-[#38BDF8] hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <span>View Full Data Provenance Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 7. LAUNCHPAD — FINAL COMMAND PORTAL                                 */}
      {/* ================================================================== */}
      <section
        className="py-24 px-6 sm:px-12 lg:px-20 border-t"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-void)" }}
      >
        <div
          className="max-w-4xl mx-auto p-10 sm:p-16 rounded-3xl bg-[#0D1117] border border-rose-500/40 text-center space-y-8 shadow-[0_0_60px_rgba(225,29,72,0.15)] relative overflow-hidden"
        >
          {/* Subtle background radar ring */}
          <div
            aria-hidden
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-rose-500/20 pointer-events-none animate-ping opacity-25"
          />

          <div className="font-mono-data text-xs text-rose-400 font-bold uppercase tracking-widest">
            OPERATIONAL COMMAND READINESS
          </div>

          <h2 className="font-display-calm text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Enter the Live Tactical Console
          </h2>

          <p className="font-body-prose text-base text-[#CBD5E1] max-w-xl mx-auto leading-relaxed">
            Transition from information briefing to active crisis response. Inspect live H3 hex grids, simulate multi-hazard wavefronts, and authorize drone reconnaissance sorties.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/gis-map"
              onClick={() => TacticalAudio.playPing()}
              className="btn-action-primary flex items-center gap-3 py-4 px-8 rounded-2xl text-base font-bold shadow-xl shadow-rose-900/40 cursor-pointer transition-all hover:scale-[1.03]"
            >
              <Radar className="w-5 h-5 text-white" />
              <span>Launch Live GIS Platform</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/sitrep"
              onClick={() => TacticalAudio.playClick()}
              className="btn-action-secondary flex items-center gap-2 py-4 px-6 rounded-2xl text-xs sm:text-sm cursor-pointer"
            >
              <span>View Executive SITREP</span>
              <ExternalLink className="w-4 h-4 text-[#38BDF8]" />
            </Link>
          </div>

          <div className="font-mono-data text-[11px] text-[#5C6E84] pt-4">
            Central Nepal Crisis Protocol &bull; Render Docker Core &bull; Vercel Edge
          </div>
        </div>
      </section>
    </div>
  );
}
