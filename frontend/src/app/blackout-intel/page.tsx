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
  Search,
  Filter,
  Send,
  CheckCircle2,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { TacticalAudio } from "@/lib/TacticalAudio";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"risk" | "distance" | "priority">("risk");
  const [dispatchedSectors, setDispatchedSectors] = useState<string[]>([]);

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

  const handleDispatchSortie = (sectorId: string) => {
    if (!dispatchedSectors.includes(sectorId)) {
      setDispatchedSectors((prev) => [...prev, sectorId]);
      TacticalAudio.playPing();
    }
  };

  const filteredAndSortedAssessments = (data?.assessments || [])
    .filter((a) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.sector_name.toLowerCase().includes(q) ||
        a.sector_id.toLowerCase().includes(q) ||
        a.threat_tier.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "risk") {
        return b.inferred_risk_score - a.inferred_risk_score;
      } else if (sortBy === "distance") {
        return a.spatial_physics.epicenter_distance_km - b.spatial_physics.epicenter_distance_km;
      } else {
        return a.recommended_recon_priority - b.recommended_recon_priority;
      }
    });

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

      {/* Instant Search & Risk Sorting Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-[#0C0E12] border border-white/10 font-mono-data text-xs">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#64748B] ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search district e.g. Gorkha, Dhunche, Sindhupalchok..."
            className="w-full bg-transparent border-none text-white text-xs placeholder:text-[#64748B] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[#64748B] hover:text-white px-2 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" />
            SORT:
          </span>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                setSortBy("risk");
                TacticalAudio.playClick();
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                sortBy === "risk"
                  ? "bg-[#E11D48] text-white font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              Inferred Risk
            </button>
            <button
              onClick={() => {
                setSortBy("distance");
                TacticalAudio.playClick();
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                sortBy === "distance"
                  ? "bg-white/20 text-white font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              Distance
            </button>
            <button
              onClick={() => {
                setSortBy("priority");
                TacticalAudio.playClick();
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                sortBy === "priority"
                  ? "bg-white/20 text-white font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              Priority
            </button>
          </div>
        </div>
      </div>

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
            <span>
              RECONNAISSANCE PRIORITY QUEUE // {filteredAndSortedAssessments.length} SECTORS
            </span>
            <span className="text-[#94A3B8]">
              {sortBy === "risk"
                ? "SORTED BY INFERRED RISK"
                : sortBy === "distance"
                ? "SORTED BY EPICENTER PROXIMITY"
                : "SORTED BY RECON PRIORITY"}
            </span>
          </div>

          <div className="space-y-3">
            {filteredAndSortedAssessments.map((sector) => {
              const isSelected = selectedSector?.sector_id === sector.sector_id;
              const isHighRisk = sector.inferred_risk_score > 60 || sector.recommended_recon_priority === 1;
              const isDispatched = dispatchedSectors.includes(sector.sector_id);

              return (
                <motion.div
                  variants={itemVars}
                  key={sector.sector_id}
                  onClick={() => {
                    setSelectedSectorId(sector.sector_id);
                    TacticalAudio.playClick();
                  }}
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
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono-data text-xs font-bold ${
                          sector.recommended_recon_priority === 1
                            ? "bg-[#E11D48] text-white shadow-sm shadow-[#E11D48]/50"
                            : "bg-white/10 text-[#94A3B8]"
                        }`}
                      >
                        P{sector.recommended_recon_priority}
                      </span>
                      <span className="font-display-calm font-medium text-lg text-white">
                        {sector.sector_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono-data text-xs">
                      {isDispatched ? (
                        <span className="chip-safe">
                          <CheckCircle2 className="w-3 h-3 text-[#34D399]" />
                          <span>UAV AIRBORNE</span>
                        </span>
                      ) : sector.is_in_blackout ? (
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

        {/* Right Column: Spatial Physics Telemetry & Mountain Profile */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#0C0E12]/95 border border-white/10 space-y-6 sticky top-24 shadow-2xl">
          {selectedSector ? (
            <div className="space-y-6 font-mono-data text-xs">
              <div className="border-b border-white/10 pb-4 flex justify-between items-start">
                <div>
                  <div className="text-[10px] text-[#64748B] uppercase tracking-[0.2em] mb-1">
                    SECTOR SPATIAL PHYSICS DOSSIER
                  </div>
                  <h2 className="font-display-calm font-medium text-2xl sm:text-3xl text-white">
                    {selectedSector.sector_name}
                  </h2>
                </div>
                {dispatchedSectors.includes(selectedSector.sector_id) && (
                  <span className="chip-safe text-[10px]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>SORTIE TASKED</span>
                  </span>
                )}
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
                    Silence:{" "}
                    <strong className="text-[#FB7185]">
                      {selectedSector.silence_duration_hours
                        ? `${selectedSector.silence_duration_hours.toFixed(1)}h`
                        : "ACTIVE"}
                    </strong>
                  </div>
                  <div>
                    Slide Index:{" "}
                    <strong className="text-white">
                      {(selectedSector.spatial_physics.landslide_susceptibility_index * 100).toFixed(0)}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Interactive Mountain Elevation RF Signal Shadow Profile */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-[#64748B] uppercase">
                  <span>MOUNTAIN RF SHADOW PROFILE</span>
                  <span className="text-rose-400 font-bold">LINE-OF-SIGHT BLOCKED</span>
                </div>

                {/* SVG Terrain Cross-Section */}
                <div className="relative w-full h-28 bg-[#090B0E] rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
                  <svg viewBox="0 0 320 100" className="w-full h-full">
                    {/* Sky Gradient */}
                    <defs>
                      <linearGradient id="rfShadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#E11D48" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#E11D48" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Mountain Ridge Profile (Kathmandu -> Shivapuri Peak -> Barpak Gorge) */}
                    <path
                      d="M 0,75 Q 60,70 100,55 Q 160,20 180,25 Q 220,50 260,85 L 320,85 L 320,100 L 0,100 Z"
                      fill="#171B24"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="1"
                    />

                    {/* RF Microwave Ray from Kathmandu Tower */}
                    <line
                      x1="30"
                      y1="68"
                      x2="175"
                      y2="24"
                      stroke="#3B82F6"
                      strokeWidth="1.5"
                      strokeDasharray="4, 3"
                    />

                    {/* RF Shadow Blocked Cone */}
                    <polygon
                      points="175,24 320,55 320,85 260,85 175,24"
                      fill="url(#rfShadowGrad)"
                    />

                    {/* Kathmandu Transmit Tower */}
                    <circle cx="30" cy="68" r="3" fill="#60A5FA" />
                    <text x="15" y="60" fill="#94A3B8" fontSize="7" fontFamily="monospace">
                      KTM (1,400m)
                    </text>

                    {/* Peak Obstacle */}
                    <circle cx="175" cy="24" r="2" fill="#F59E0B" />
                    <text x="145" y="18" fill="#F59E0B" fontSize="7" fontFamily="monospace">
                      Ridge (3,400m)
                    </text>

                    {/* Barpak Target in Shadow */}
                    <circle cx="270" cy="85" r="3" fill="#E11D48" />
                    <text x="245" y="96" fill="#FB7185" fontSize="7" fontFamily="monospace">
                      Barpak (Shadow)
                    </text>
                  </svg>
                </div>
                <div className="text-[10px] text-[#64748B] flex justify-between">
                  <span>Microwave line-of-sight severed by 3,400m ridge</span>
                  <span className="text-[#FB7185] font-bold">100% DEAD ZONE</span>
                </div>
              </div>

              {/* Recommended Tactical Recon Sortie */}
              <div className="p-4 rounded-xl bg-blue-500/10 border-l-4 border-[#3B82F6] text-xs space-y-2">
                <span className="font-mono-data text-[10px] font-bold text-[#60A5FA] uppercase flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  TACTICAL RECON SORTIE DIRECTIVE:
                </span>
                <p className="font-body-prose text-xs text-white leading-relaxed">
                  {selectedSector.recommended_recon_priority === 1
                    ? "Immediate Aerial Helicopter SAR & Airborne Cellular Restorer deployment required. Ground arterial route blocked."
                    : "Scheduled UAV photographic pass and secondary ground scout patrol."}
                </p>

                {/* Instant Drone Recon Button */}
                <button
                  type="button"
                  onClick={() => handleDispatchSortie(selectedSector.sector_id)}
                  className={`w-full mt-2 py-2 px-3 rounded-lg font-mono-data text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                    dispatchedSectors.includes(selectedSector.sector_id)
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold"
                      : "bg-[#E11D48] border-[#E11D48] text-white hover:bg-[#BE123C] font-bold shadow-md shadow-[#E11D48]/30"
                  }`}
                >
                  {dispatchedSectors.includes(selectedSector.sector_id) ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Recon Sortie Scheduled (ETA: 18 Min)</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Authorize Autonomous UAV Recon</span>
                    </>
                  )}
                </button>
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
                  onClick={() => TacticalAudio.playPing()}
                  className="btn-action-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 flex-1 justify-center cursor-pointer"
                >
                  <Radar className="w-3.5 h-3.5" />
                  <span>Inspect On Map</span>
                </Link>

                <Link
                  href={`/hypotheses`}
                  onClick={() => TacticalAudio.playClick()}
                  className="btn-action-secondary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 flex-1 justify-center cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>Bayesian Ledger</span>
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
