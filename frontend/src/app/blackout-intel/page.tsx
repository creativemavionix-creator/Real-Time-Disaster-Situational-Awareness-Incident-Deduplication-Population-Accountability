"use client";

import React, { useEffect, useState } from "react";
import { fetchBlackoutRisks, AllBlackoutRisksResponse, BlackoutRiskAssessment } from "@/lib/api";

export default function BlackoutIntelPage() {
  const [data, setData] = useState<AllBlackoutRisksResponse | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<BlackoutRiskAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchBlackoutRisks();
      setData(res);
      if (!selectedAssessment && res.assessments.length > 0) {
        // Prefer a blackout sector first, else first
        const bo = res.assessments.find((a) => a.is_in_blackout) || res.assessments[0];
        setSelectedAssessment(bo);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load blackout intelligence");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const getThreatColor = (tier: string) => {
    switch (tier) {
      case "CRITICAL_INFERRED":
        return "#E5484D";
      case "HIGH_INFERRED":
        return "#FFB800";
      case "VERIFIED_SAFE":
        return "#3FB950";
      default:
        return "#EDEDE8";
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="border-b-4 border-[#EDEDE8] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
            CAPABILITY 03 // SILENT BLACKOUT RISK INTELLIGENCE
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-[#EDEDE8]">
            BLACKOUT RISK ENGINE
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-[#EDEDE8]/70 mt-1 max-w-2xl">
            Calculates spatial physics Inferred Risk Scores for disconnected mountain districts so that severed communications are never mistakenly assumed to be "safe zones."
          </p>
        </div>

        <div className="flex gap-4 font-mono-data text-xs">
          <div className="border-2 border-[#E5484D] p-3 bg-[#E5484D]/10">
            <span className="text-[10px] text-[#E5484D] block font-bold">TOTAL BLACKOUT SECTORS</span>
            <strong className="text-xl text-[#EDEDE8]">{data?.blackout_sectors_count || 0} / 8</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-[#E5484D]/10 border-2 border-[#E5484D] p-4 font-mono-data text-xs text-[#E5484D]">
          [BLACKOUT_INTEL_ERROR]: {error}
        </div>
      )}

      {/* 8-Sector Spatial Risk Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.assessments.map((item) => {
          const isSelected = selectedAssessment?.sector_id === item.sector_id;
          const color = getThreatColor(item.threat_tier);

          return (
            <div
              key={item.sector_id}
              onClick={() => setSelectedAssessment(item)}
              className={`border-4 p-5 cursor-pointer transition-all select-none ${
                isSelected
                  ? "border-[#FFB800] bg-[#EDEDE8]/10 shadow-2xl scale-[1.02]"
                  : "border-[#EDEDE8] bg-[#0A0A0A] hover:border-[#EDEDE8]/80"
              }`}
            >
              <div className="flex items-center justify-between border-b-2 border-[#EDEDE8]/20 pb-2 mb-3">
                <span className="font-mono-data text-xs font-bold text-[#EDEDE8] uppercase">
                  {item.sector_name}
                </span>
                {item.is_in_blackout && (
                  <span className="px-1.5 py-0.5 bg-[#E5484D] text-[#EDEDE8] font-mono-data text-[9px] font-bold uppercase animate-pulse">
                    BLACKOUT
                  </span>
                )}
              </div>

              <div className="space-y-2 font-mono-data text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#EDEDE8]/60 text-[10px]">INFERRED RISK:</span>
                  <strong className="text-lg" style={{ color }}>
                    {item.inferred_risk_score} / 100
                  </strong>
                </div>

                <div className="h-2 w-full bg-[#EDEDE8]/10 border border-[#EDEDE8]/30">
                  <div
                    className="h-full"
                    style={{ width: `${item.inferred_risk_score}%`, backgroundColor: color }}
                  />
                </div>

                <div className="pt-2 text-[10px] space-y-1 text-[#EDEDE8]/70 border-t border-[#EDEDE8]/20">
                  <div className="flex justify-between">
                    <span>EPICENTER DIST:</span>
                    <strong className="text-[#EDEDE8]">{item.spatial_physics.epicenter_distance_km} km</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>SLOPE GRADIENT:</span>
                    <strong className="text-[#EDEDE8]">{item.spatial_physics.slope_gradient_degrees}°</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>BRIDGE SEVERED:</span>
                    <strong className={item.spatial_physics.critical_bridge_severed ? "text-[#E5484D]" : "text-[#3FB950]"}>
                      {item.spatial_physics.critical_bridge_severed ? "YES" : "NO"}
                    </strong>
                  </div>
                </div>

                <div className="pt-2">
                  <span
                    className="block text-center py-1 font-bold border text-[10px] uppercase"
                    style={{ borderColor: color, color }}
                  >
                    {item.threat_tier.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Spatial Physics Dissection Panel */}
      {selectedAssessment && (
        <div className="border-4 border-[#EDEDE8] p-6 md:p-8 bg-[#0A0A0A] space-y-6">
          <div className="border-b-4 border-[#EDEDE8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest block mb-1">
                SPATIAL PHYSICS & TOPOGRAPHIC HAZARD ANALYSIS
              </span>
              <h3 className="font-display text-2xl sm:text-4xl font-black uppercase text-[#EDEDE8]">
                {selectedAssessment.sector_name} SECTOR INFERRED HAZARD
              </h3>
            </div>
            <div className="flex items-center gap-3 font-mono-data text-xs">
              <span className="px-3 py-1.5 border-2 border-[#FFB800] bg-[#FFB800]/10 text-[#FFB800] font-bold">
                RECON PRIORITY: #{selectedAssessment.recommended_recon_priority}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono-data text-xs">
            {/* Factor 1: Epicenter Distance */}
            <div className="border-2 border-[#EDEDE8]/30 p-4 bg-[#EDEDE8]/5 space-y-2">
              <span className="text-[#FFB800] font-bold block uppercase">1. EPICENTER PROXIMITY</span>
              <div className="text-2xl font-bold text-[#EDEDE8]">
                {selectedAssessment.spatial_physics.epicenter_distance_km} KM
              </div>
              <p className="text-[11px] text-[#EDEDE8]/70">
                Calculated from Barpak, Gorkha (28.00°N, 84.63°E). Proximity Hazard Index:{" "}
                <strong className="text-[#FFB800]">
                  {(selectedAssessment.spatial_physics.epicenter_distance_hazard * 100).toFixed(1)}%
                </strong>
              </p>
            </div>

            {/* Factor 2: Terrain & Slope Gradient */}
            <div className="border-2 border-[#EDEDE8]/30 p-4 bg-[#EDEDE8]/5 space-y-2">
              <span className="text-[#FFB800] font-bold block uppercase">2. TERRAIN & SLOPE FAILURE</span>
              <div className="text-2xl font-bold text-[#EDEDE8]">
                {selectedAssessment.spatial_physics.slope_gradient_degrees}° SLOPE
              </div>
              <p className="text-[11px] text-[#EDEDE8]/70">
                Elevation: {selectedAssessment.spatial_physics.elevation_meters}m. Landslide Susceptibility:{" "}
                <strong className="text-[#E5484D]">
                  {(selectedAssessment.spatial_physics.landslide_susceptibility_index * 100).toFixed(0)}%
                </strong>
              </p>
            </div>

            {/* Factor 3: Transport & Bridge Access */}
            <div className="border-2 border-[#EDEDE8]/30 p-4 bg-[#EDEDE8]/5 space-y-2">
              <span className="text-[#FFB800] font-bold block uppercase">3. ROAD & BRIDGE SEVERANCE</span>
              <div className="text-2xl font-bold text-[#EDEDE8]">
                {selectedAssessment.spatial_physics.critical_bridge_severed ? "CUT OFF" : "CONNECTED"}
              </div>
              <p className="text-[11px] text-[#EDEDE8]/70">
                Ground transport impedance:{" "}
                <strong className="text-[#FFB800]">
                  {(selectedAssessment.spatial_physics.road_access_impedance * 100).toFixed(0)}%
                </strong>
                . Requires aerial SAR drop if bridge severed.
              </p>
            </div>
          </div>

          {/* Operational Risk Explanation */}
          <div className="p-4 border-2 border-[#EDEDE8] bg-[#EDEDE8]/5 font-mono-data text-xs space-y-2">
            <span className="text-[#FFB800] font-bold block uppercase">OPERATIONAL RECONNAISSANCE DIRECTIVE:</span>
            <p className="font-body-prose text-xs sm:text-sm text-[#EDEDE8]">
              {selectedAssessment.risk_explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
