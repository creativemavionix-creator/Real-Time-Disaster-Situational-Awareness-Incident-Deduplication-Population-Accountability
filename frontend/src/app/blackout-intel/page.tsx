"use client";

import React, { useEffect, useState } from "react";
import { fetchBlackoutRisks, AllBlackoutRisksResponse } from "@/lib/api";
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

  return (
    <div className="p-6 sm:p-10 lg:p-14 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="border-b border-[#E5E4DC] dark:border-[#232733] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono-data text-xs text-[#E11D48] dark:text-[#FB7185] font-bold uppercase tracking-wider">
            02 // SILENT BLACKOUT INTELLIGENCE
          </div>
          <h1 className="font-display-calm font-extrabold text-3xl sm:text-4xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
            Inferred Risk & Spatial Physics
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-[#5C6270] dark:text-[#9CA3AF] max-w-2xl leading-relaxed">
            Detecting isolated mountain sectors where silence does not mean safety. Calculates spatial physics inferred risk from epicenter proximity, steep slope terrain, and severed transportation bridges.
          </p>
        </div>

        <div className="font-mono-data text-xs text-[#5C6270] text-left md:text-right">
          EPICENTER: <strong className="text-[#E11D48] font-bold">M7.8 BARPAK, GORKHA</strong>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-mono-data text-[#E11D48]">
          [BLACKOUT_INTEL_ERROR]: {error}
        </div>
      )}

      {/* Main Grid: Priority Queue Left (7) + Physics Dossier Right (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Ranked Priority Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="font-mono-data text-xs text-[#5C6270] font-bold uppercase tracking-wider">
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
                  className={`surface-calm p-5 cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-[#2563EB] shadow-md"
                      : isHighRisk
                      ? "border-rose-300 dark:border-rose-900/60"
                      : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E4DC] dark:border-[#232733] pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12] flex items-center justify-center font-mono-data text-[10px] font-bold">
                        P{sector.recommended_recon_priority}
                      </span>
                      <span className="font-display-calm font-bold text-base text-[#111318] dark:text-[#F4F4F0]">
                        {sector.sector_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono-data text-xs">
                      {sector.is_in_blackout ? (
                        <span className="chip-critical">BLACKOUT</span>
                      ) : (
                        <span className="chip-safe">ACTIVE COMMS</span>
                      )}
                      <span className="chip-neutral">{sector.threat_tier.replace("_", " ")}</span>
                    </div>
                  </div>

                  <p className="font-body-prose text-xs sm:text-sm text-[#5C6270] dark:text-[#9CA3AF] mb-4 line-clamp-2">
                    {sector.risk_explanation}
                  </p>

                  <div className="grid grid-cols-3 gap-2 font-mono-data text-xs text-[#5C6270] dark:text-[#9CA3AF] pt-2 border-t border-[#E5E4DC] dark:border-[#232733]">
                    <div>
                      INFERRED RISK:{" "}
                      <strong className="text-[#E11D48] dark:text-[#FB7185] font-bold">
                        {sector.inferred_risk_score.toFixed(0)}%
                      </strong>
                    </div>
                    <div>
                      EPICENTER:{" "}
                      <strong className="text-[#111318] dark:text-[#F4F4F0]">
                        {sector.spatial_physics.epicenter_distance_km.toFixed(0)} km
                      </strong>
                    </div>
                    <div>
                      TERRAIN SLOPE:{" "}
                      <strong className="text-[#111318] dark:text-[#F4F4F0]">
                        {sector.spatial_physics.slope_gradient_degrees.toFixed(0)}°
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Spatial Physics Telemetry */}
        <div className="lg:col-span-5 surface-calm p-6 sm:p-8 space-y-6">
          {selectedSector ? (
            <div className="space-y-6 font-mono-data text-xs">
              <div>
                <div className="text-[11px] text-[#5C6270] uppercase tracking-wider mb-1">
                  SECTOR SPATIAL PHYSICS // {selectedSector.sector_id.toUpperCase()}
                </div>
                <h2 className="font-display-calm font-extrabold text-2xl sm:text-3xl text-[#111318] dark:text-[#F4F4F0]">
                  {selectedSector.sector_name}
                </h2>
              </div>

              {/* Inferred Risk Metric Card */}
              <div className="p-5 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#E11D48] dark:text-[#FB7185] uppercase font-bold block">
                    INFERRED HAZARD SCORE
                  </span>
                  <strong className="font-display-calm font-extrabold text-4xl text-[#E11D48] dark:text-[#FB7185]">
                    {selectedSector.inferred_risk_score.toFixed(0)}%
                  </strong>
                </div>
                <div className="text-right text-[#5C6270]">
                  <div>Silence Duration: <strong className="text-[#E11D48]">{selectedSector.silence_duration_hours ? `${selectedSector.silence_duration_hours.toFixed(1)}h` : "ACTIVE"}</strong></div>
                  <div>Landslide Risk: <strong>{(selectedSector.spatial_physics.landslide_susceptibility_index * 100).toFixed(0)}%</strong></div>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-4 rounded-xl bg-[#2563EB]/5 dark:bg-[#2563EB]/10 border-l-4 border-[#2563EB] text-xs font-body-prose">
                <span className="font-mono-data text-[10px] font-bold text-[#2563EB] dark:text-[#60A5FA] uppercase block mb-1">
                  TACTICAL RECON SORTIE:
                </span>
                <p className="font-semibold text-[#111318] dark:text-[#F4F4F0]">
                  {selectedSector.recommended_recon_priority === 1
                    ? "Immediate Aerial Helicopter SAR & Airborne Cellular Restorer deployment required."
                    : "Scheduled UAV photographic pass and secondary ground scout patrol."}
                </p>
              </div>

              {/* Spatial Factors Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#5C6270] uppercase">
                  SPATIAL ACCESS & TERRAIN FACTORS:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733]">
                    <span className="text-[#5C6270] block text-[10px]">EPICENTER DISTANCE</span>
                    <strong className="text-[#111318] dark:text-[#F4F4F0]">{selectedSector.spatial_physics.epicenter_distance_km.toFixed(1)} km</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733]">
                    <span className="text-[#5C6270] block text-[10px]">TERRAIN SLOPE</span>
                    <strong className="text-[#111318] dark:text-[#F4F4F0]">{selectedSector.spatial_physics.slope_gradient_degrees.toFixed(1)}°</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733]">
                    <span className="text-[#5C6270] block text-[10px]">ROAD IMPEDANCE</span>
                    <strong className="text-[#D97706] dark:text-[#FBBF24]">{(selectedSector.spatial_physics.road_access_impedance * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733]">
                    <span className="text-[#5C6270] block text-[10px]">CRITICAL BRIDGES</span>
                    <strong className={selectedSector.spatial_physics.critical_bridge_severed ? "text-[#E11D48]" : "text-[#059669]"}>
                      {selectedSector.spatial_physics.critical_bridge_severed ? "SEVERED" : "CLEAR"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Structural Fragility Index */}
              {selectedSector.spatial_physics.structural_fragility_index !== undefined && (
                <div className="p-4 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] space-y-2">
                  <div className="flex items-center justify-between font-bold uppercase text-[11px]">
                    <span>🏛️ 260K BUILDING CENSUS STRUCTURAL FRAGILITY</span>
                    <span className="text-[#E11D48] dark:text-[#FB7185]">
                      {selectedSector.spatial_physics.structural_fragility_index.toFixed(2)} SFI
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5C6270]">
                    <div>Mud-Stone Masonry: <strong className="text-[#111318] dark:text-[#F4F4F0]">{selectedSector.spatial_physics.masonry_ratio_pct || 65}%</strong></div>
                    <div>Engineered Concrete: <strong className="text-[#111318] dark:text-[#F4F4F0]">{selectedSector.spatial_physics.concrete_ratio_pct || 35}%</strong></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center font-mono-data text-xs text-[#5C6270]">
              SELECT A SECTOR TO INSPECT SPATIAL PHYSICS DOSSIER.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
