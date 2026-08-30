"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  fetchAllLocationsStatus,
  fetchSimulationState,
  fetchPopulationExposure,
  LocationStatusItem,
  SimulationState,
  AllPopulationExposureResponse,
} from "@/lib/api";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ChevronDown, Radio, Users, ShieldAlert, Satellite, Layers, Database, Radar, Network, FileText, MapPin } from "lucide-react";

const fadeUpVars: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 80, damping: 20 } }
};

const staggerContainerVars: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

export default function OverviewPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [locations, setLocations] = useState<LocationStatusItem[]>([]);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [exposureData, setExposureData] = useState<AllPopulationExposureResponse | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const loadData = async () => {
    try {
      const [locsRes, sim, exp] = await Promise.all([
        fetchAllLocationsStatus(),
        fetchSimulationState(),
        fetchPopulationExposure(),
      ]);
      setLocations(locsRes.locations);
      setSimulationState(sim);
      setExposureData(exp);
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

  return (
    <div ref={containerRef} className="w-full bg-[#090B0E] relative overflow-hidden text-[#F3F4F6]">
      {/* Parallax Background Glow */}
      <motion.div 
        style={{ y: isMounted ? bgY : "0%" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-[#E11D48]/5 rounded-full blur-[120px] pointer-events-none z-0"
      />

      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 z-10">
        <motion.div variants={staggerContainerVars} initial="hidden" animate="show" className="max-w-5xl w-full space-y-20">
          <div className="space-y-6 text-center">
            <motion.div variants={fadeUpVars} className="font-mono-data text-xs text-[#E11D48] tracking-[0.4em] uppercase flex items-center justify-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
              System Active &bull; T+{simulationState?.elapsed_hours || 0} Hours Elapsed
            </motion.div>
            
            <motion.h1 variants={fadeUpVars} className="font-display-calm font-medium text-6xl sm:text-8xl tracking-tight text-white">
              PRATYAKSH-Ω
            </motion.h1>
            
            <motion.p variants={fadeUpVars} className="font-body-prose text-[#94A3B8] max-w-2xl mx-auto text-xl pt-4 italic">
              "Chaos outside. Clarity inside."
            </motion.p>
          </div>

          <motion.div variants={fadeUpVars} className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(255,255,255,0.02)]">
            <div className="bg-[#0C0E12]/80 backdrop-blur-xl p-10 flex flex-col gap-3 group transition-colors hover:bg-[#10131A]">
              <span className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em] group-hover:text-[#94A3B8] transition-colors">Critical Sectors</span>
              <span className="font-display-calm text-6xl text-[#E11D48] tracking-tighter">
                <AnimatedCounter value={activeCriticalCount} />
              </span>
            </div>
            <div className="bg-[#0C0E12]/80 backdrop-blur-xl p-10 flex flex-col gap-3 group transition-colors hover:bg-[#10131A]">
              <span className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em] group-hover:text-[#94A3B8] transition-colors">Exposed Population</span>
              <span className="font-display-calm text-6xl text-[#F3F4F6] tracking-tighter">
                <AnimatedCounter value={totalExposed} isDecimal={true} suffix="M" />
              </span>
            </div>
            <div className="bg-[#0C0E12]/80 backdrop-blur-xl p-10 flex flex-col gap-3 group transition-colors hover:bg-[#10131A]">
              <span className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em] group-hover:text-[#94A3B8] transition-colors">Unaccounted Persons</span>
              <span className="font-display-calm text-6xl text-[#D97706] tracking-tighter">
                <AnimatedCounter value={missing} />
              </span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#64748B]"
        >
          <span className="font-mono-data text-[10px] uppercase tracking-[0.2em]">Scroll to Decode</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </section>

      {/* SECTION 2: THE PROBLEM */}
      <section className="relative min-h-screen flex items-center justify-center p-6 sm:p-12 z-10 border-t border-white/5">
        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-100px" }} 
          variants={staggerContainerVars} 
          className="max-w-4xl w-full text-center space-y-12"
        >
          <motion.h2 variants={fadeUpVars} className="font-display-calm text-4xl sm:text-6xl text-[#E11D48]">
            The Information Fog
          </motion.h2>
          <motion.div variants={fadeUpVars} className="font-serif text-2xl sm:text-4xl leading-relaxed text-[#94A3B8] space-y-8">
            <p>During catastrophic events, emergency operations are paralyzed not by a lack of data, but by <span className="text-[#F3F4F6]">massive noise and contradiction</span>.</p>
            <p>Hundreds of citizen reports conflict with hospital triage feeds. The <span className="text-[#F3F4F6]">Silent Zone Fallacy</span> leads dispatchers to mistake a total absence of reports for safety, when it actually indicates a severed mountain community.</p>
            <p><strong className="text-white">PRATYAKSH-Ω</strong> acts as an autonomous reality reconstruction engine, turning chaotic, duplicated disaster signals into verified rescue priorities.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 3: CORE ENGINES BENTO GRID */}
      <section className="relative min-h-screen flex items-center justify-center p-6 sm:p-12 z-10 border-t border-white/5">
        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-100px" }} 
          variants={staggerContainerVars} 
          className="max-w-6xl w-full space-y-16"
        >
          <div className="text-center space-y-4">
            <motion.h2 variants={fadeUpVars} className="font-display-calm text-4xl sm:text-5xl">
              4 Core Intelligence Engines
            </motion.h2>
            <motion.p variants={fadeUpVars} className="font-mono-data text-xs tracking-[0.2em] text-[#64748B] uppercase">
              How the platform synthesizes truth
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={fadeUpVars} className="group p-8 rounded-3xl bg-[#0C0E12]/80 backdrop-blur-md border border-white/5 hover:border-white/10 hover:bg-[#10131A] transition-all">
              <Network className="w-8 h-8 text-[#E11D48] mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="font-display-calm text-2xl mb-3">Triage & Deduplication Engine</h3>
              <p className="font-body-prose text-[#94A3B8] leading-relaxed">
                Groups spatial reports within a 200m aperture. Applies continuous exponential confidence decay{" "}
                <span className="font-mono-data px-2 py-0.5 rounded bg-white/10 text-rose-300 text-xs inline-flex items-center font-bold">
                  C<sub>t</sub> = C<sub>0</sub> &middot; e<sup>-&lambda;t</sup>
                </span>{" "}
                to flag stale records requiring ground re-verification.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVars} className="group p-8 rounded-3xl bg-[#0C0E12]/80 backdrop-blur-md border border-white/5 hover:border-white/10 hover:bg-[#10131A] transition-all">
              <Radio className="w-8 h-8 text-[#94A3B8] mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="font-display-calm text-2xl mb-3">Silent Zone Risk Estimator</h3>
              <p className="font-body-prose text-[#94A3B8] leading-relaxed">
                Computes the Silent Sector Exposure Metric{" "}
                <span className="font-mono-data px-2 py-0.5 rounded bg-white/10 text-amber-300 text-xs inline-flex items-center font-bold">
                  E<sub>cell</sub> = Pop<sub>cell</sub> &middot; (1 - e<sup>-t/&tau;</sup>)
                </span>{" "}
                across Uber H3 hexagonal grid cells to identify cut-off communities that have gone dark, triggering UAV reconnaissance.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVars} className="group p-8 rounded-3xl bg-[#0C0E12]/80 backdrop-blur-md border border-white/5 hover:border-white/10 hover:bg-[#10131A] transition-all">
              <Users className="w-8 h-8 text-[#D97706] mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="font-display-calm text-2xl mb-3">Dynamic Population Ledger</h3>
              <p className="font-body-prose text-[#94A3B8] leading-relaxed">
                Executes hybrid entity resolution{" "}
                <span className="font-mono-data px-2 py-0.5 rounded bg-white/10 text-emerald-300 text-xs inline-flex items-center font-bold">
                  Score = 0.55&middot;JW + 0.25&middot;Cos + 0.20&middot;Age
                </span>{" "}
                to reconcile missing person reports against shelter and hospital intake check-ins.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVars} className="group p-8 rounded-3xl bg-[#0C0E12]/80 backdrop-blur-md border border-white/5 hover:border-white/10 hover:bg-[#10131A] transition-all">
              <Satellite className="w-8 h-8 text-[#059669] mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="font-display-calm text-2xl mb-3">RESQ-SIGHT Ground Truth</h3>
              <p className="font-body-prose text-[#94A3B8] leading-relaxed">
                Calibrates reliability against 260,601 NRA building damage survey records, UNOSAT satellite damage vectors (WorldView-2), and Copernicus Sentinel-1 SAR interferometric coherence.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3.5: OPERATIONAL ARCHITECTURE */}
      <section className="relative min-h-screen flex items-center justify-center p-6 sm:p-12 z-10 border-t border-white/5 bg-[#0C0E12]/50">
        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-100px" }} 
          variants={staggerContainerVars} 
          className="max-w-6xl w-full space-y-16"
        >
          <div className="text-center space-y-4">
            <motion.h2 variants={fadeUpVars} className="font-display-calm text-4xl sm:text-5xl">
              Operational Command Architecture
            </motion.h2>
            <motion.p variants={fadeUpVars} className="font-mono-data text-xs tracking-[0.2em] text-[#64748B] uppercase">
              How responders interact with intelligence
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
            {/* The 4 Pillars */}
            <motion.div variants={fadeUpVars} className="space-y-8">
              <h3 className="font-mono-data text-[#F3F4F6] text-[10px] tracking-[0.2em] uppercase border-b border-white/10 pb-4">
                The 4 Command Pillars
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-start group">
                  <div className="p-3 bg-[#E11D48]/10 rounded-lg group-hover:bg-[#E11D48]/20 transition-colors">
                    <Radar className="w-5 h-5 text-[#E11D48]" />
                  </div>
                  <div>
                    <h4 className="font-display-calm text-xl text-[#F3F4F6] mb-1">01 Situation</h4>
                    <p className="font-body-prose text-[#94A3B8] text-sm">Real-time GIS vector cartography and global mission KPIs.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start group">
                  <div className="p-3 bg-[#D97706]/10 rounded-lg group-hover:bg-[#D97706]/20 transition-colors">
                    <Layers className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <div>
                    <h4 className="font-display-calm text-xl text-[#F3F4F6] mb-1">02 Intelligence</h4>
                    <p className="font-body-prose text-[#94A3B8] text-sm">Deep-dive ledgers for deduplication consensus, blackout risks, scientific evidence, and missing persons.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start group">
                  <div className="p-3 bg-[#059669]/10 rounded-lg group-hover:bg-[#059669]/20 transition-colors">
                    <Network className="w-5 h-5 text-[#059669]" />
                  </div>
                  <div>
                    <h4 className="font-display-calm text-xl text-[#F3F4F6] mb-1">03 Response</h4>
                    <p className="font-body-prose text-[#94A3B8] text-sm">Tactical dispatch queues for deploying prioritized search and rescue units.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start group">
                  <div className="p-3 bg-[#2563EB]/10 rounded-lg group-hover:bg-[#2563EB]/20 transition-colors">
                    <FileText className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div>
                    <h4 className="font-display-calm text-xl text-[#F3F4F6] mb-1">04 Report</h4>
                    <p className="font-body-prose text-[#94A3B8] text-sm">Automated UN OCHA standard situation reports (SITREP) generated from AI context.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* The 8 Sectors Context */}
            <motion.div variants={fadeUpVars} className="space-y-8 bg-white/5 p-8 rounded-3xl border border-white/5">
              <h3 className="font-mono-data text-[#F3F4F6] text-[10px] tracking-[0.2em] uppercase border-b border-white/10 pb-4 flex items-center justify-between">
                <span>The Nepal Context</span>
                <MapPin className="w-4 h-4 text-[#64748B]" />
              </h3>
              
              <div className="space-y-4 font-body-prose text-[#94A3B8] text-[15px] leading-relaxed">
                <p>
                  <strong>PRATYAKSH-Ω</strong> is calibrated against the extreme challenges of the <strong>2015 Gorkha Earthquake (M7.8)</strong> in Central Nepal, which devastated mountain topography and crippled rural communications.
                </p>
                <p>
                  The platform continuously monitors <strong>8 high-risk geographic sectors</strong> encompassing over 1.5 million exposed citizens:
                </p>
                
                <ul className="grid grid-cols-2 gap-y-2 pt-4">
                  {['Gorkha (Epicenter)', 'Sindhupalchok', 'Kathmandu Valley', 'Bhaktapur', 'Rasuwa', 'Nuwakot', 'Dolakha', 'Sindhuli'].map((sector) => (
                    <li key={sector} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#E11D48] rounded-full" />
                      <span className="font-display-calm">{sector}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3.8: MATHEMATICAL & SCIENTIFIC FORMULATIONS */}
      <section className="relative py-28 flex items-center justify-center p-6 sm:p-12 z-10 border-t border-white/5 bg-[#090B0E]">
        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-100px" }} 
          variants={staggerContainerVars} 
          className="max-w-6xl w-full space-y-16"
        >
          <div className="text-center space-y-4">
            <motion.h2 variants={fadeUpVars} className="font-display-calm text-4xl sm:text-5xl text-white">
              First-Principles Mathematical Foundations
            </motion.h2>
            <motion.p variants={fadeUpVars} className="font-mono-data text-xs tracking-[0.2em] text-[#64748B] uppercase">
              Deterministic thermodynamic & epistemic reasoning equations
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Equation 1 */}
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

            {/* Equation 2 */}
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

            {/* Equation 3 */}
            <motion.div variants={fadeUpVars} className="p-8 rounded-3xl bg-[#0C0E12]/90 border border-white/10 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono-data uppercase tracking-wider text-[#059669]">
                <span>03 Bayesian Belief Updating</span>
                <span>Log-Sum-Exp Softmax</span>
              </div>
              <div className="p-4 rounded-xl bg-black/60 border border-white/5 font-mono-data text-sm text-emerald-300 text-center">
                log P(H<sub>i</sub> | E) = log P(H<sub>i</sub>) + &sum; w<sub>eff,j</sub> &middot; &Lambda;(H<sub>i</sub>, e<sub>j</sub>)
              </div>
              <p className="font-body-prose text-xs text-[#94A3B8] leading-relaxed">
                Dynamically updates posterior beliefs across 5 physical hypotheses (Safe, Comms Down, Isolated, Evacuated, Disaster).
              </p>
            </motion.div>

            {/* Equation 4 */}
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

      {/* SECTION 4: TECH STACK */}
      <section className="relative py-32 flex items-center justify-center p-6 sm:p-12 z-10 border-t border-white/5 bg-[#0C0E12]/30">
        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-100px" }} 
          variants={staggerContainerVars} 
          className="max-w-5xl w-full text-center space-y-16"
        >
          <motion.h2 variants={fadeUpVars} className="font-mono-data text-xs tracking-[0.2em] text-[#64748B] uppercase">
            Powered By
          </motion.h2>

          <motion.div variants={fadeUpVars} className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div className="space-y-4 bg-white/[0.02] p-8 rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors">
              <h3 className="font-mono-data text-[#E11D48] text-[10px] tracking-[0.2em] uppercase mb-6 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]"></span>Core Architecture</h3>
              <ul className="space-y-3 font-display-calm text-xl text-[#94A3B8]">
                <li className="hover:text-white transition-colors">FastAPI 0.115 Engine</li>
                <li className="hover:text-white transition-colors">Next.js 16 (Turbopack)</li>
                <li className="hover:text-white transition-colors">Framer Motion Physics</li>
                <li className="hover:text-white transition-colors">SQLite & SQLAlchemy</li>
              </ul>
            </div>

            <div className="space-y-4 bg-white/[0.02] p-8 rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors">
              <h3 className="font-mono-data text-[#D97706] text-[10px] tracking-[0.2em] uppercase mb-6 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>AI & Machine Learning</h3>
              <ul className="space-y-3 font-display-calm text-xl text-[#94A3B8]">
                <li className="hover:text-white transition-colors">Dense Sentence Embeddings</li>
                <li className="hover:text-white transition-colors">Devanagari Named Entity Recognition (NER)</li>
                <li className="hover:text-white transition-colors">Hybrid Jaro-Winkler Entity Resolution</li>
                <li className="hover:text-white transition-colors">Bayesian Spatial Inferences</li>
              </ul>
            </div>

            <div className="space-y-4 bg-white/[0.02] p-8 rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors">
              <h3 className="font-mono-data text-[#059669] text-[10px] tracking-[0.2em] uppercase mb-6 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>Geospatial & Satellite</h3>
              <ul className="space-y-3 font-display-calm text-xl text-[#94A3B8]">
                <li className="hover:text-white transition-colors">Uber H3 Hexagonal Grid (Res 8)</li>
                <li className="hover:text-white transition-colors">Copernicus Sentinel-1 SAR</li>
                <li className="hover:text-white transition-colors">UNOSAT Orbital Damage Vectors</li>
                <li className="hover:text-white transition-colors">260k NRA Empirical Ground Truth</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 5: CTA */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center p-6 sm:p-12 z-10 border-t border-white/5">
        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-100px" }} 
          variants={staggerContainerVars} 
          className="max-w-2xl w-full text-center space-y-10"
        >
          <motion.h2 variants={fadeUpVars} className="font-display-calm text-5xl sm:text-6xl text-[#F3F4F6]">
            Enter the Command Matrix
          </motion.h2>
          
          <motion.div variants={fadeUpVars} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Link href="/gis-map" className="px-10 py-5 bg-[#E11D48] text-white font-mono-data text-[11px] uppercase tracking-[0.2em] hover:bg-[#BE123C] transition-all rounded-xl shadow-[0_0_40px_rgba(225,29,72,0.3)] hover:shadow-[0_0_60px_rgba(225,29,72,0.5)] hover:-translate-y-1 flex items-center gap-3">
              <Radar className="w-4 h-4" />
              Launch Live Map
            </Link>
            <Link href="/deduplication" className="px-10 py-5 border border-white/10 bg-white/5 text-[#F3F4F6] font-mono-data text-[11px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all rounded-xl hover:-translate-y-1 flex items-center gap-3">
              <Layers className="w-4 h-4" />
              Unified Truth Ledger
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
