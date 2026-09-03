"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchBlackoutRisks, AllBlackoutRisksResponse, BlackoutRiskAssessment } from "@/lib/api";
import { motion, Variants } from "framer-motion";
import {
  Radio,
  ShieldAlert,
  Compass,
  Mountain,
  AlertTriangle,
  Building,
  ArrowRight,
  Radar,
  PhoneCall,
  Zap,
  Activity,
  Layers,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVars: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
};

export default function BlackoutIntelPage() {
  const [data, setData] = useState<AllBlackoutRisksResponse | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchBlackoutRisks();
      setData(res);
      setSelectedSectorId((prev) => {
        if (prev && res.assessments.some((a) => a.sector_id === prev)) {
          return prev;
        }
        return res.assessments[0]?.sector_id || null;
      });
    } catch (err: any) {
      setError(err.message || "Failed to load blackout intelligence");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const selectedSector: BlackoutRiskAssessment | null =
    data?.assessments.find((a) => a.sector_id === selectedSectorId) ||
    data?.assessments[0] ||
    null;

  return (
    <div className="flex-1 w-full bg-[#090B0E] p-4 sm:p-8 lg:p-12 space-y-8 max-w-7xl mx-auto text-[#F3F4F6]">
      {/* Header & Protocol Ticker */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono-data text-[10px] text-[#E11D48] font-bold uppercase tracking-[0.25em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
            02 // SILENT BLACKOUT INTELLIGENCE & SPATIAL PHYSICS
          </div>
          <h1 className="font-display-calm font-medium text-3xl sm:text-4xl text-white tracking-tight">
            Inferred Risk & Negative Evidence
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
            Quantifying physical catastrophe where telecommunication channels are severed. Spatial physics models derive inferred hazard from terrain slope, epicenter distance, and bridge integrity.
          </p>
        </div>

        <div className="font-mono-data text-xs text-[#64748B] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] uppercase block text-[#64748B]">EPICENTER REF:</span>
            <strong className="text-[#FB7185] font-bold">M7.8 BARPAK (GORKHA)</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-mono-data text-[#FB7185] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>[BLACKOUT_INTEL_ERROR]: {error}</span>
        </div>
      )}

      {/* Main Grid: Priority Queue Left (7) + Physics Dossier Right (5) */}
      <motion.div
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left Column: Ranked Priority Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="font-mono-data text-[10px] text-[#64748B] font-bold uppercase tracking-[0.2em] flex items-center justify-between">
            <span>RECONNAISSANCE PRIORITY QUEUE // {data?.assessments.length || 0} SECTORS</span>
            <span className="text-[#94A3B8]">RANKED BY INFERRED RISK</span>
          </div>

          <div className="space-y-3">
            {data?.assessments.map((sector) => {
              const isSelected = selectedSector?.sector_id === sector.sector_id;
              const isHighRisk = sector.inferred_risk_score > 60 || sector.recommended_recon_priority === 1;

              return (
                <motion.div
                  variants={itemVars}
                  key={sector.sector_id}
                  onClick={() => setSelectedSectorId(sector.sector_id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white/[0.06] border-[#3B82F6] shadow-[0_0_30px_rgba(59,130,246,0.15)] ring-1 ring-[#3B82F6]"
                      : isHighRisk
                      ? "bg-white/[0.02] border-rose-500/30 hover:border-rose-500/60"
                      : "bg-white/[0.02] border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono-data text-xs font-bold ${
                        sector.recommended_recon_priority === 1
                          ? "bg-[#E11D48] text-white shadow-sm shadow-[#E11D48]/50"
                          : "bg-white/10 text-[#94A3B8]"
                      }`}>
                        P{sector.recommended_recon_priority}
                      </span>
                      <span className="font-display-calm font-medium text-lg text-white">
                        {sector.sector_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono-data text-xs">
                      {sector.is_in_blackout ? (
                        <span className="chip-critical">
                          <Radio className="w-3 h-3 animate-pulse" />
                          <span>BLACKOUT</span>
                        </span>
                      ) : (
                        <span className="chip-safe">ACTIVE COMMS</span>
                      )}
                      <span className="chip-neutral text-[10px]">{sector.threat_tier.replace("_", " ")}</span>
                    </div>
                  </div>

                  <p className="font-body-prose text-xs text-[#94A3B8] mb-4 leading-relaxed line-clamp-2">
                    {sector.risk_explanation}
                  </p>

                  <div className="grid grid-cols-3 gap-2 font-mono-data text-xs pt-2 border-t border-white/5">
                    <div>
                      <span className="text-[10px] text-[#64748B] block">INFERRED RISK</span>
                      <strong className="text-[#FB7185] font-bold text-sm">
                        <AnimatedCounter value={sector.inferred_risk_score} suffix="%" />
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">EPICENTER DIST</span>
                      <strong className="text-white">
                        {sector.spatial_physics.epicenter_distance_km.toFixed(0)} km
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block">TERRAIN SLOPE</span>
                      <strong className="text-white">
                        {sector.spatial_physics.slope_gradient_degrees.toFixed(0)}°
                      </strong>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Spatial Physics Telemetry */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#0C0E12]/90 border border-white/10 space-y-6 sticky top-24 shadow-2xl">
          {selectedSector ? (
            <div className="space-y-6 font-mono-data text-xs">
              <div className="border-b border-white/10 pb-4">
                <div className="text-[10px] text-[#64748B] uppercase tracking-[0.2em] mb-1">
                  SECTOR SPATIAL PHYSICS DOSSIER
                </div>
                <h2 className="font-display-calm font-medium text-2xl sm:text-3xl text-white">
                  {selectedSector.sector_name}
                </h2>
              </div>

              {/* Inferred Hazard Score Badge */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#FB7185] uppercase font-bold tracking-wider block">
                    INFERRED HAZARD SCORE
                  </span>
                  <div className="font-display-calm font-medium text-4xl text-[#FB7185]">
                    <AnimatedCounter value={selectedSector.inferred_risk_score} suffix="%" />
                  </div>
                  <span className="tag-provenance tag-derived mt-1">[DERIVED] SPATIAL LOGIC</span>
                </div>
                <div className="text-right space-y-1 text-[#94A3B8]">
                  <div>
                    Silence: <strong className="text-[#FB7185]">{selectedSector.silence_duration_hours ? `${selectedSector.silence_duration_hours.toFixed(1)}h` : "ACTIVE"}</strong>
                  </div>
                  <div>
                    Slide Index: <strong className="text-white">{(selectedSector.spatial_physics.landslide_susceptibility_index * 100).toFixed(0)}%</strong>
                  </div>
                </div>
              </div>

              {/* Recommended Tactical Recon Sortie */}
              <div className="p-4 rounded-xl bg-blue-500/10 border-l-4 border-[#3B82F6] text-xs space-y-1">
                <span className="font-mono-data text-[10px] font-bold text-[#60A5FA] uppercase flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  TACTICAL RECON SORTIE DIRECTIVE:
                </span>
                <p className="font-body-prose text-xs text-white leading-relaxed">
                  {selectedSector.recommended_recon_priority === 1
                    ? "Immediate Aerial Helicopter SAR & Airborne Cellular Restorer deployment required. Ground arterial route blocked."
                    : "Scheduled UAV photographic pass and secondary ground scout patrol."}
                </p>
              </div>

              {/* Spatial Factors Breakdown Grid */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  SPATIAL ACCESS & TERRAIN FACTORS
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[#64748B] block text-[10px]">EPICENTER DISTANCE</span>
                    <strong className="text-white text-sm">{selectedSector.spatial_physics.epicenter_distance_km.toFixed(1)} km</strong>
                    <div className="tag-provenance tag-observed">[OBSERVED]</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[#64748B] block text-[10px]">TERRAIN SLOPE</span>
                    <strong className="text-white text-sm">{selectedSector.spatial_physics.slope_gradient_degrees.toFixed(1)}°</strong>
                    <div className="tag-provenance tag-observed">[OBSERVED]</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[#64748B] block text-[10px]">ROAD IMPEDANCE</span>
                    <strong className="text-amber-400 text-sm">{(selectedSector.spatial_physics.road_access_impedance * 100).toFixed(0)}%</strong>
                    <div className="tag-provenance tag-simulated">[SIMULATED]</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[#64748B] block text-[10px]">CRITICAL BRIDGES</span>
                    <strong className={`text-sm ${selectedSector.spatial_physics.critical_bridge_severed ? "text-[#FB7185]" : "text-[#34D399]"}`}>
                      {selectedSector.spatial_physics.critical_bridge_severed ? "SEVERED" : "CLEAR"}
                    </strong>
                    <div className="tag-provenance tag-observed">[OBSERVED]</div>
                  </div>
                </div>
              </div>

              {/* Structural Fragility Index (260K Survey) */}
              {selectedSector.spatial_physics.structural_fragility_index !== undefined && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between font-bold uppercase text-[11px]">
                    <span className="flex items-center gap-1.5 text-[#94A3B8]">
                      <Building className="w-3.5 h-3.5 text-[#60A5FA]" />
                      <span>260K BUILDING SURVEY FRAGILITY</span>
                    </span>
                    <span className="text-[#FB7185] font-mono-data">
                      {selectedSector.spatial_physics.structural_fragility_index.toFixed(2)} SFI
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#94A3B8]">
                    <div>Mud-Stone: <strong className="text-white">{selectedSector.spatial_physics.masonry_ratio_pct || 65}%</strong></div>
                    <div>RCC Concrete: <strong className="text-white">{selectedSector.spatial_physics.concrete_ratio_pct || 35}%</strong></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/10">
                <Link
                  href={`/gis-map`}
                  className="btn-action-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 flex-1 justify-center"
                >
                  <Radar className="w-3.5 h-3.5" />
                  <span>Inspect On Map</span>
                </Link>

                <Link
                  href={`/hypotheses`}
                  className="btn-action-secondary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 flex-1 justify-center"
                >
                  <Activity className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>Bayesian Hypothesis</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center font-mono-data text-xs text-[#64748B]">
              SELECT A SECTOR TO INSPECT SPATIAL PHYSICS DOSSIER.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
