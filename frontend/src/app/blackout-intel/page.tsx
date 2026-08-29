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
  const [selectedSector, setSelectedSector] = useState<BlackoutRiskAssessment | null>(null);
  const [showFormula, setShowFormula] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAnalysis } = useViewMode();

  const loadData = async () => {
    try {
      const res = await fetchBlackoutRisks();
      setData(res);
      if (!selectedSector && res.assessments.length > 0) {
        setSelectedSector(res.assessments[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load blackout intelligence");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return "#E5484D";
    if (priority === 2) return "#FFB800";
    return "#3FB950";
  };

  return (
    <div className="p-6 sm:p-10 lg:p-14 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="border-b border-[#EDEDE8]/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
            02 // SILENT BLACKOUT INTELLIGENCE
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#EDEDE8]">
            WHERE CAN WE NOT SEE CLEARLY?
          </h1>
          <p className="font-body-prose text-sm text-[#EDEDE8]/70 mt-1 max-w-2xl leading-relaxed">
            Detecting isolated mountain sectors where silence does not mean safety. Calculates spatial physics inferred risk from epicenter proximity, steep slope terrain, and severed transportation bridges.
          </p>
        </div>

        <div className="font-mono-data text-xs text-[#EDEDE8]/60 text-left md:text-right">
          EPICENTER: <strong className="text-[#FFB800]">M7.8 BARPAK, GORKHA</strong>
        </div>
      </div>

      {error && (
        <div className="bg-[#E5484D]/10 border border-[#E5484D] p-4 font-mono-data text-xs text-[#E5484D]">
          [BLACKOUT_INTEL_ERROR]: {error}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Ranked Recon Priority Cards (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="font-mono-data text-xs text-[#EDEDE8]/70 font-bold uppercase tracking-wider">
            RECONNAISSANCE PRIORITY QUEUE // 8 SECTORS
          </div>

          <div className="space-y-3">
            {data?.assessments.map((sector) => {
              const isSelected = selectedSector?.sector_id === sector.sector_id;
              const isHighRisk = sector.inferred_risk_score > 60 || sector.recommended_recon_priority === 1;

              return (
                <div
                  key={sector.sector_id}
                  onClick={() => setSelectedSector(sector)}
                  className={`surface-card p-5 cursor-pointer transition-all ${
                    isSelected
                      ? "surface-card-active shadow-md"
                      : isHighRisk
                      ? "surface-card-critical"
                      : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EDEDE8]/10 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 font-mono-data text-xs font-bold border"
                        style={{
                          borderColor: getPriorityColor(sector.recommended_recon_priority),
                          color: getPriorityColor(sector.recommended_recon_priority),
                        }}
                      >
                        PRIORITY #{sector.recommended_recon_priority}
                      </span>
                      <h3 className="font-display text-lg font-bold text-[#EDEDE8]">
                        {sector.sector_name}
                      </h3>
                    </div>

                    <div className="font-mono-data text-xs">
                      INFERRED RISK:{" "}
                      <strong
                        className="text-base font-bold"
                        style={{ color: getPriorityColor(sector.recommended_recon_priority) }}
                      >
                        {sector.inferred_risk_score.toFixed(1)} / 100
                      </strong>
                    </div>
                  </div>

                  <p className="font-body-prose text-xs sm:text-sm text-[#EDEDE8]/80 mb-3">
                    {sector.risk_explanation}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-xs font-mono-data text-[#EDEDE8]/60">
                    <div className="flex items-center gap-3">
                      <span>{sector.spatial_physics.epicenter_distance_km.toFixed(0)} km to Epicenter</span>
                      <span>•</span>
                      <span>{sector.spatial_physics.slope_gradient_degrees}° Slope</span>
                    </div>

                    <span className="text-[#FFB800] font-bold">
                      {sector.spatial_physics.critical_bridge_severed ? "⚠ BRIDGE SEVERED (+15% PENALTY)" : "BRIDGES INTACT"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Spatial Physics Risk Inspector (5 Columns) */}
        <div className="lg:col-span-5 surface-card p-6 space-y-6">
          {selectedSector ? (
            <div className="space-y-6">
              <div>
                <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
                  SECTOR RISK DOSSIER
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#EDEDE8]">
                  {selectedSector.sector_name}
                </h2>
                <div className="text-xs font-mono-data text-[#EDEDE8]/60 mt-1">
                  RECON PRIORITY RANK: <strong className="text-[#FFB800]">#{selectedSector.recommended_recon_priority} OF 8</strong>
                </div>
              </div>

              {/* Inferred Risk Score Metric */}
              <div className="bg-[#EDEDE8]/3 p-4 border border-[#EDEDE8]/10 space-y-2">
                <div className="flex justify-between items-end font-mono-data">
                  <span className="text-xs text-[#EDEDE8]/60 uppercase">INFERRED RISK SCORE:</span>
                  <strong
                    className="text-3xl font-bold"
                    style={{ color: getPriorityColor(selectedSector.recommended_recon_priority) }}
                  >
                    {selectedSector.inferred_risk_score.toFixed(1)} <span className="text-xs text-[#EDEDE8]/40">/ 100</span>
                  </strong>
                </div>
                <div className="w-full bg-[#0A0A0A] h-2 border border-[#EDEDE8]/20">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${Math.min(100, selectedSector.inferred_risk_score)}%`,
                      backgroundColor: getPriorityColor(selectedSector.recommended_recon_priority),
                    }}
                  />
                </div>
              </div>

              {/* Plain Language Reasoning (Level 2) */}
              <div className="space-y-2">
                <span className="font-mono-data text-[10px] text-[#EDEDE8]/50 uppercase font-bold block">
                  PHYSICAL HAZARD PROFILE:
                </span>
                <p className="font-body-prose text-xs sm:text-sm text-[#EDEDE8] leading-relaxed bg-[#EDEDE8]/2 p-3 border-l-2 border-[#FFB800]">
                  {selectedSector.risk_explanation}
                </p>
              </div>

              {/* Recommended Action (Level 3) */}
              <div className="bg-[#EDEDE8]/3 border-l-2 border-[#FFB800] p-4 text-xs font-body-prose">
                <span className="font-mono-data text-[10px] text-[#FFB800] uppercase font-bold block mb-1">
                  RECOMMENDED ACTION:
                </span>
                <p className="text-[#EDEDE8] text-sm font-medium">
                  {selectedSector.inferred_risk_score > 70
                    ? "Immediate Aerial Reconnaissance (MI-17) + Deploy Satellite Cell-on-Wheels"
                    : selectedSector.inferred_risk_score > 40
                    ? "Dispatch Highway Heavy Excavator & Ground APF Survey Team"
                    : "Secondary Reconnaissance & Remote Monitoring"}
                </p>
              </div>

              {/* Progressive Disclosure: Mathematical Formula Breakdown (Level 4/5) */}
              <div className="pt-3 border-t border-[#EDEDE8]/10 space-y-3 font-mono-data text-xs">
                <button
                  onClick={() => setShowFormula(!showFormula)}
                  className="text-[#FFB800] text-xs font-bold hover:underline flex items-center justify-between w-full cursor-pointer"
                >
                  <span>{showFormula ? "▼ HIDE" : "► VIEW"} SPATIAL PHYSICS CALCULATION</span>
                  <span className="text-[#EDEDE8]/40 text-[10px]">
                    {showFormula ? "COLLAPSE" : "EXPAND"}
                  </span>
                </button>

                {(showFormula || isAnalysis) && (
                  <div className="space-y-2 p-3 bg-[#EDEDE8]/3 border border-[#EDEDE8]/10 text-[11px] text-[#EDEDE8]/80 animate-fade-in">
                    <div className="flex justify-between">
                      <span className="text-[#EDEDE8]/60">EPICENTER DISTANCE:</span>
                      <strong className="text-[#EDEDE8]">{selectedSector.spatial_physics.epicenter_distance_km.toFixed(1)} km</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#EDEDE8]/60">TERRAIN SLOPE:</span>
                      <strong className="text-[#EDEDE8]">{selectedSector.spatial_physics.slope_gradient_degrees}° gradient</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#EDEDE8]/60">ROAD CUT SEVERANCE:</span>
                      <strong className="text-[#FFB800]">
                        {selectedSector.spatial_physics.critical_bridge_severed ? "SEVERED (+15%)" : "INTACT"}
                      </strong>
                    </div>
                    <div className="text-[10px] text-[#EDEDE8]/50 pt-2 border-t border-[#EDEDE8]/10">
                      Formula: (E_hazard * 40) + (S_slope * 30) + (I_road * 30) * 1.15
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="font-mono-data text-xs text-[#EDEDE8]/50">
              Select a sector to view spatial physics risk details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
