"use client";

import React, { useEffect, useState } from "react";
import {
  fetchBlackoutRisks,
  AllBlackoutRisksResponse,
  BlackoutRiskAssessment,
} from "@/lib/api";
import { useViewMode } from "@/context/ViewModeContext";

export default function BlackoutIntelPage() {
  const [data, setData] = useState<AllBlackoutRisksResponse | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAnalysis } = useViewMode();

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

  const selectedSector =
    data?.assessments.find((a) => a.sector_id === selectedSectorId) ||
    data?.assessments[0] ||
    null;

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return "#F43F5E";
    if (priority === 2) return "#F59E0B";
    return "#10B981";
  };

  return (
    <div className="p-6 sm:p-10 lg:p-14 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="prism-badge-cyan">
            <span>02</span>
            <span>//</span>
            <span>SILENT BLACKOUT INTELLIGENCE</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            Inferred Risk & Spatial Physics
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Detecting isolated mountain sectors where silence does not mean safety. Calculates spatial physics inferred risk from epicenter proximity, steep slope terrain, and severed transportation bridges.
          </p>
        </div>

        <div className="font-mono text-xs text-slate-500 text-left md:text-right">
          EPICENTER: <strong className="text-cyan-600 dark:text-cyan-400 font-bold">M7.8 BARPAK, GORKHA</strong>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 rounded-2xl font-mono text-xs text-rose-700 dark:text-rose-300">
          [BLACKOUT_INTEL_ERROR]: {error}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Ranked Recon Priority Cards (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="font-mono text-xs text-slate-500 font-bold uppercase tracking-wider">
            RECONNAISSANCE PRIORITY QUEUE // 8 SECTORS
          </div>

          <div className="space-y-3">
            {data?.assessments.map((sector) => {
              const isSelected = selectedSector?.sector_id === sector.sector_id;
              const isHighRisk = sector.inferred_risk_score > 60 || sector.recommended_recon_priority === 1;

              return (
                <div
                  key={sector.sector_id}
                  onClick={() => setSelectedSectorId(sector.sector_id)}
                  className={`prism-card p-5 cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-[#0088A9] shadow-md"
                      : isHighRisk
                      ? "border-rose-300 dark:border-rose-900/60"
                      : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: getPriorityColor(sector.recommended_recon_priority) }}
                      >
                        P{sector.recommended_recon_priority}
                      </span>
                      <span className="font-display font-bold text-base text-slate-900 dark:text-white">
                        {sector.sector_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      {sector.is_in_blackout ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold uppercase">
                          BLACKOUT
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                          ACTIVE COMMS
                        </span>
                      )}

                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 uppercase">
                        {sector.threat_tier.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                    {sector.risk_explanation}
                  </p>

                  <div className="grid grid-cols-3 gap-2 font-mono text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      INFERRED RISK:{" "}
                      <strong className="text-rose-600 dark:text-rose-400 font-bold">
                        {sector.inferred_risk_score.toFixed(0)}%
                      </strong>
                    </div>
                    <div>
                      EPICENTER:{" "}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {sector.spatial_physics.epicenter_distance_km.toFixed(0)} km
                      </strong>
                    </div>
                    <div>
                      TERRAIN SLOPE:{" "}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {sector.spatial_physics.slope_gradient_degrees.toFixed(0)}°
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Physics Factors & Satellite Telemetry (5 Columns) */}
        <div className="lg:col-span-5 prism-card p-6 space-y-6">
          {selectedSector ? (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="prism-badge-cyan mb-1.5">
                  <span>SECTOR SPATIAL PHYSICS</span>
                </div>
                <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
                  {selectedSector.sector_name}
                </h2>
                <div className="text-xs font-mono text-slate-500 mt-1">
                  THREAT TIER: <strong className="text-rose-600 dark:text-rose-400 font-bold">{selectedSector.threat_tier}</strong>
                </div>
              </div>

              {/* Inferred Risk Metric Card */}
              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-rose-700 dark:text-rose-400 uppercase font-bold block">
                    INFERRED HAZARD SCORE
                  </span>
                  <strong className="font-display font-extrabold text-4xl text-rose-600 dark:text-rose-400">
                    {selectedSector.inferred_risk_score.toFixed(0)}%
                  </strong>
                </div>
                <div className="font-mono text-xs text-right text-slate-600 dark:text-slate-400">
                  <div>Silence Duration: <strong className="text-rose-600">{selectedSector.silence_duration_hours ? `${selectedSector.silence_duration_hours.toFixed(1)}h` : "ACTIVE"}</strong></div>
                  <div>Landslide Risk: <strong>{(selectedSector.spatial_physics.landslide_susceptibility_index * 100).toFixed(0)}%</strong></div>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border-l-4 border-[#0088A9] text-xs">
                <span className="font-mono text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase block mb-1">
                  TACTICAL RECON SORTIE:
                </span>
                <p className="font-body-prose font-semibold text-slate-800 dark:text-slate-200">
                  {selectedSector.recommended_recon_priority === 1
                    ? "Immediate Aerial Helicopter SAR & Airborne Cellular Restorer deployment required."
                    : "Scheduled UAV photographic pass and secondary ground scout patrol."}
                </p>
              </div>

              {/* Spatial Physics Breakdown */}
              <div className="space-y-3">
                <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                  SPATIAL TERRAIN & ACCESS FACTORS:
                </span>
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">EPICENTER DISTANCE</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedSector.spatial_physics.epicenter_distance_km.toFixed(1)} km</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">TERRAIN SLOPE</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedSector.spatial_physics.slope_gradient_degrees.toFixed(1)}°</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">ROAD ACCESS IMPEDANCE</span>
                    <strong className="text-amber-600">{(selectedSector.spatial_physics.road_access_impedance * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">CRITICAL BRIDGES</span>
                    <strong className={selectedSector.spatial_physics.critical_bridge_severed ? "text-rose-600" : "text-emerald-600"}>
                      {selectedSector.spatial_physics.critical_bridge_severed ? "SEVERED" : "CLEAR"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Structural Building Fragility Prior Telemetry */}
              {selectedSector.spatial_physics.structural_fragility_index !== undefined && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px]">
                    <span>🏛️ 260K BUILDING CENSUS STRUCTURAL FRAGILITY</span>
                    <span className="text-rose-600 dark:text-rose-400">
                      {selectedSector.spatial_physics.structural_fragility_index.toFixed(2)} SFI
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <div>Mud-Stone Masonry: <strong className="text-slate-800 dark:text-slate-200">{selectedSector.spatial_physics.masonry_ratio_pct || 65}%</strong></div>
                    <div>Engineered Concrete: <strong className="text-slate-800 dark:text-slate-200">{selectedSector.spatial_physics.concrete_ratio_pct || 35}%</strong></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center font-mono text-xs text-slate-400">
              SELECT A SECTOR TO INSPECT SPATIAL PHYSICS DOSSIER.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
