"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchAllLocationsStatus,
  fetchSimulationState,
  fetchPopulationExposure,
  LocationStatusItem,
  SimulationState,
  AllPopulationExposureResponse,
} from "@/lib/api";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export default function OverviewPage() {
  const [locations, setLocations] = useState<LocationStatusItem[]>([]);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [exposureData, setExposureData] = useState<AllPopulationExposureResponse | null>(null);

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

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="flex-1 w-full bg-[#090B0E] flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="max-w-5xl w-full space-y-20 relative z-10"
      >
        <div className="space-y-6 text-center">
          <motion.div variants={itemVars} className="font-mono-data text-xs text-[#E11D48] tracking-[0.4em] uppercase flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
            System Active &bull; T+{simulationState?.elapsed_hours || 0} Hours Elapsed
          </motion.div>
          
          <motion.h1 variants={itemVars} className="font-display-calm font-medium text-5xl sm:text-7xl text-[#F3F4F6] tracking-tight">
            Central Nepal<br />Crisis Protocol
          </motion.h1>
          
          <motion.p variants={itemVars} className="font-body-prose text-[#94A3B8] max-w-2xl mx-auto text-lg pt-4">
            Autonomous disaster reality reconstruction analyzing evidence, uncertainty, silence, and information gaps across 8 strategic crisis zones.
          </motion.p>
        </div>

        <motion.div variants={itemVars} className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(255,255,255,0.03)]">
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

        <motion.div variants={itemVars} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
          <Link href="/gis-map" className="px-10 py-5 bg-[#F3F4F6] text-[#090B0E] font-mono-data text-[11px] uppercase tracking-[0.2em] hover:bg-white transition-all rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:-translate-y-1">
            Launch Live Map &rarr;
          </Link>
          <Link href="/sitrep" className="px-10 py-5 border border-white/10 text-[#F3F4F6] font-mono-data text-[11px] uppercase tracking-[0.2em] hover:bg-white/5 transition-all rounded-xl hover:-translate-y-1">
            Generate SITREP
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Decorative background glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E11D48]/5 rounded-full blur-[120px] pointer-events-none z-0"
      />
    </div>
  );
}
