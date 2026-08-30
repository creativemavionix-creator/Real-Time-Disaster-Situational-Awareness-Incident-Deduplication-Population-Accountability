"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { fetchGisTelemetry, GisFeatureCollection, GisSectorTelemetry } from "@/lib/api";
import { useViewMode } from "@/context/ViewModeContext";

const InteractiveVectorMap = dynamic(
  () => import("@/components/InteractiveVectorMap"),
  { ssr: false, loading: () => <div className="h-[520px] bg-[#0A0A0A] border border-[#EDEDE8]/15 flex items-center justify-center font-mono-data text-xs text-[#EDEDE8]/50">INITIALIZING LEAFLET VECTOR CARTOGRAPHY...</div> }
);

export default function GisMapPage() {
  const [data, setData] = useState<GisFeatureCollection | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<"severity" | "epicenter" | "isolation">("severity");
  const [mapViewMode, setMapViewMode] = useState<"vector" | "radar">("vector");
  const [showEvidence, setShowEvidence] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAnalysis } = useViewMode();

  const loadData = async () => {
    try {
      const res = await fetchGisTelemetry();
      setData(res);
      setSelectedSectorId((prev) => {
        if (prev && res.sectors.some((s) => s.sector_id === prev)) {
          return prev;
        }
        return res.sectors[0]?.sector_id || null;
      });
    } catch (err: any) {
      setError(err.message || "Failed to load GIS telemetry");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const selectedSector =
    data?.sectors.find((s) => s.sector_id === selectedSectorId) ||
    data?.sectors[0] ||
    null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified_safe":
        return "#3FB950";
      case "verified_damaged":
      case "blackout":
        return "#E5484D";
      default:
        return "#FFB800";
    }
  };

  const getRecommendedAction = (sector: GisSectorTelemetry) => {
    if (sector.status === "verified_damaged") {
      return "Deploy Urban SAR Heavy Battalion + Emergency Field Hospital";
    } else if (sector.status === "blackout" || sector.isolation_index > 0.7) {
      return "Deploy MI-17 Aerial Reconnaissance + Satellite Comms Restoration";
    } else if (sector.status === "unverified") {
      return "Dispatch APF First-Responder Reconnaissance Patrol";
    } else {
      return "Maintain Standing Monitoring & Staging Logistics Hub";
    }
  };

  return (
    <div className="p-6 sm:p-10 lg:p-14 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header: WHAT IS HAPPENING */}
      <div className="border-b border-[#EDEDE8]/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
            01 // SITUATION MAP
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#EDEDE8]">
            WHERE IS THE PROBLEM?
          </h1>
          <p className="font-body-prose text-sm text-[#EDEDE8]/70 mt-1 max-w-2xl leading-relaxed">
            Real-time geospatial radar tracking earthquake epicenter impact, road isolation impedance, and critical population centers across Central Nepal.
          </p>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-2 font-mono-data text-xs">
          <span className="text-[#EDEDE8]/50 text-[11px] uppercase mr-1">OVERLAY:</span>
          {(["severity", "epicenter", "isolation"] as const).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-3 py-1.5 font-medium uppercase border transition-all cursor-pointer ${
                activeLayer === layer
                  ? "bg-[#EDEDE8] text-[#0A0A0A] border-[#EDEDE8] font-bold"
                  : "bg-transparent text-[#EDEDE8]/70 border-[#EDEDE8]/20 hover:border-[#EDEDE8]/40"
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-[#E5484D]/10 border border-[#E5484D] p-4 font-mono-data text-xs text-[#E5484D]">
          [GIS_TELEMETRY_ERROR]: {error}
        </div>
      )}

      {/* Main Map & Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Visual Map Canvas (7 Columns) */}
        <div className="lg:col-span-7 surface-card p-6 relative space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-[#EDEDE8]/10 pb-3 gap-2 font-mono-data text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FFB800] inline-block" />
              <span className="font-bold text-[#EDEDE8]">
                {mapViewMode === "vector" ? "HDX UN OCHA VECTOR MAP" : "SPATIAL RADAR HUD"} // 8 SECTORS
              </span>
            </div>

            {/* Dual Mode Switcher */}
            <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 border border-[#EDEDE8]/20">
              <button
                onClick={() => setMapViewMode("vector")}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  mapViewMode === "vector"
                    ? "bg-[#FFB800] text-[#0A0A0A]"
                    : "text-[#EDEDE8]/60 hover:text-[#EDEDE8]"
                }`}
              >
                🗺️ Vector Map
              </button>
              <button
                onClick={() => setMapViewMode("radar")}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  mapViewMode === "radar"
                    ? "bg-[#FFB800] text-[#0A0A0A]"
                    : "text-[#EDEDE8]/60 hover:text-[#EDEDE8]"
                }`}
              >
                📡 Radar HUD
              </button>
            </div>
          </div>

          {/* Map Display (Vector vs Radar) */}
          {mapViewMode === "vector" ? (
            <InteractiveVectorMap
              sectors={data?.sectors || []}
              selectedSectorId={selectedSectorId}
              onSelectSector={setSelectedSectorId}
              activeLayer={activeLayer}
            />
          ) : (
            <div className="relative aspect-[4/3] bg-[#0A0A0A] border border-[#EDEDE8]/15 p-6 overflow-hidden flex flex-col justify-between">
              {/* Subtle Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 pointer-events-none">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="border border-[#EDEDE8]" />
                ))}
              </div>

              {/* Epicenter Target Mark */}
              <div
                className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: "15%", top: "35%" }}
              >
                <div className="w-8 h-8 rounded-full border border-[#E5484D] opacity-40 animate-ping absolute inset-0" />
                <div className="w-3 h-3 bg-[#E5484D] flex items-center justify-center font-mono-data text-[8px] text-[#EDEDE8] font-bold">
                  ✕
                </div>
                <span className="absolute left-4 top-0 whitespace-nowrap font-mono-data text-[9px] text-[#E5484D] font-bold bg-[#0A0A0A]/90 px-1 border border-[#E5484D]/40">
                  M7.8 EPICENTER
                </span>
              </div>

              {/* Render 8 Sector Pins */}
              <div className="relative w-full h-full">
                {data?.sectors.map((sector, idx) => {
                  const normX = ((sector.longitude - 84.5) / 1.7) * 85 + 5;
                  const normY = (1 - (sector.latitude - 27.2) / 1.0) * 85 + 5;
                  const isSelected = selectedSector?.sector_id === sector.sector_id;
                  const color = getStatusColor(sector.status);

                  return (
                    <button
                      key={`${sector.sector_id}-${idx}`}
                      onClick={() => setSelectedSectorId(sector.sector_id)}
                      style={{ left: `${normX}%`, top: `${normY}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 border transition-all select-none text-left cursor-pointer ${
                        isSelected
                          ? "bg-[#EDEDE8] text-[#0A0A0A] border-[#FFB800] z-30 shadow-lg scale-105"
                          : "bg-[#0A0A0A]/90 text-[#EDEDE8] border-[#EDEDE8]/20 hover:border-[#EDEDE8] z-20"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-mono-data text-[10px] font-bold">
                        <span className="w-1.5 h-1.5" style={{ backgroundColor: color }} />
                        <span className="uppercase">{sector.sector_name}</span>
                      </div>

                      <div
                        className={`text-[9px] font-mono-data mt-0.5 ${
                          isSelected ? "text-[#0A0A0A]/70" : "text-[#EDEDE8]/60"
                        }`}
                      >
                        {activeLayer === "severity" && `Sev: ${sector.severity_index.toFixed(1)}/10`}
                        {activeLayer === "epicenter" && `${sector.distance_to_epicenter_km.toFixed(0)} km`}
                        {activeLayer === "isolation" && `${(sector.isolation_index * 100).toFixed(0)}% cut`}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Radar Footer */}
              <div className="flex justify-between items-center text-[10px] font-mono-data text-[#EDEDE8]/40 border-t border-[#EDEDE8]/10 pt-2 z-10">
                <span>LAT: 27.2°N - 28.2°N</span>
                <span>LON: 84.5°E - 86.2°E</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Sector Inspector Panel (5 Columns) */}
        <div className="lg:col-span-5 surface-card p-6 space-y-6">
          {selectedSector ? (
            <div className="space-y-6">
              {/* Sector Title & Status */}
              <div>
                <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
                  SECTOR TELEMETRY DOSSIER
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#EDEDE8]">
                  {selectedSector.sector_name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="px-2.5 py-0.5 font-mono-data text-xs font-bold border uppercase"
                    style={{
                      borderColor: getStatusColor(selectedSector.status),
                      color: getStatusColor(selectedSector.status),
                      backgroundColor: `${getStatusColor(selectedSector.status)}15`,
                    }}
                  >
                    {selectedSector.status.replace("_", " ")}
                  </span>
                  <span className="text-xs font-mono-data text-[#EDEDE8]/50">
                    THREAT: {selectedSector.threat_tier}
                  </span>
                </div>
              </div>

              {/* Human Impact Summary */}
              <div className="grid grid-cols-2 gap-3 font-mono-data text-xs">
                <div className="bg-[#EDEDE8]/3 p-3 border border-[#EDEDE8]/10">
                  <span className="text-[#EDEDE8]/50 text-[10px] block uppercase">EST. CASUALTIES</span>
                  <strong className="text-[#E5484D] text-lg font-bold">
                    {selectedSector.estimated_casualties}
                  </strong>
                </div>
                <div className="bg-[#EDEDE8]/3 p-3 border border-[#EDEDE8]/10">
                  <span className="text-[#EDEDE8]/50 text-[10px] block uppercase">ROAD ISOLATION</span>
                  <strong className="text-[#FFB800] text-lg font-bold">
                    {(selectedSector.isolation_index * 100).toFixed(0)}%
                  </strong>
                </div>
              </div>

              {/* Satellite Orbital Cross-Check Badge */}
              {selectedSector.satellite_corroborated && (
                <div className="bg-[#0A0A0A] border border-[#3FB950]/30 p-3.5 space-y-1.5 font-mono-data text-xs">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#3FB950] font-bold uppercase flex items-center gap-1.5">
                      <span>🛰️ SATELLITE ORBITAL CROSS-CHECK</span>
                    </span>
                    <span className="px-2 py-0.5 bg-[#3FB950]/15 text-[#3FB950] font-bold">
                      CONFIRMED
                    </span>
                  </div>
                  <div className="text-[11px] text-[#EDEDE8]/80">
                    SENSOR: <strong className="text-[#EDEDE8]">{selectedSector.satellite_sensor || "UNOSAT UNITAR / Sentinel-1 SAR"}</strong>
                  </div>
                </div>
              )}

              {/* Operational Recommended Action (Level 3) */}
              <div className="bg-[#EDEDE8]/3 border-l-2 border-[#FFB800] p-4 text-xs font-body-prose">
                <span className="font-mono-data text-[10px] text-[#FFB800] uppercase font-bold block mb-1">
                  RECOMMENDED ACTION:
                </span>
                <p className="text-[#EDEDE8] text-sm font-medium">
                  {getRecommendedAction(selectedSector)}
                </p>
              </div>

              {/* Progressive Disclosure: Why This Risk? */}
              <div className="pt-2 border-t border-[#EDEDE8]/10 space-y-3 font-mono-data text-xs">
                <button
                  onClick={() => setShowEvidence(!showEvidence)}
                  className="text-[#FFB800] text-xs font-bold hover:underline flex items-center justify-between w-full cursor-pointer"
                >
                  <span>{showEvidence ? "▼ HIDE" : "► VIEW"} WHY THIS RISK?</span>
                  <span className="text-[#EDEDE8]/40 text-[10px]">
                    {showEvidence ? "COLLAPSE" : "EXPAND"}
                  </span>
                </button>

                {(showEvidence || isAnalysis) && (
                  <div className="space-y-2 p-3 bg-[#EDEDE8]/3 border border-[#EDEDE8]/10 text-[11px] text-[#EDEDE8]/80 animate-fade-in">
                    <div className="flex justify-between">
                      <span className="text-[#EDEDE8]/60">EPICENTER DISTANCE:</span>
                      <strong className="text-[#EDEDE8]">
                        {selectedSector.distance_to_epicenter_km.toFixed(1)} km
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#EDEDE8]/60">SEVERITY INDEX:</span>
                      <strong className="text-[#FFB800]">
                        {selectedSector.severity_index.toFixed(1)} / 10.0
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#EDEDE8]/60">ACTIVE INCIDENT CLUSTERS:</span>
                      <strong className="text-[#EDEDE8]">
                        {selectedSector.active_incidents_count}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#EDEDE8]/60">COORDINATES:</span>
                      <span>
                        {selectedSector.latitude.toFixed(4)}°N, {selectedSector.longitude.toFixed(4)}°E
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="font-mono-data text-xs text-[#EDEDE8]/50">
              Click a sector pin on the radar map to view telemetry.
            </p>
          )}
        </div>
      </div>

      {/* Comprehensive Sector Ledger Table */}
      <div className="surface-card p-6 sm:p-8">
        <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-3">
          SECTOR TELEMETRY LEDGER // ALL 8 REGIONS
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-data text-xs border-collapse">
            <thead>
              <tr className="bg-[#EDEDE8]/5 border-b border-[#EDEDE8]/15 text-[#EDEDE8]">
                <th className="p-3">SECTOR</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">SEVERITY</th>
                <th className="p-3">EPICENTER DIST</th>
                <th className="p-3">ISOLATION</th>
                <th className="p-3">EST. CASUALTIES</th>
                <th className="p-3">CLUSTERS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEDE8]/10">
              {data?.sectors.map((s, idx) => (
                <tr
                  key={`${s.sector_id}-${idx}`}
                  onClick={() => setSelectedSectorId(s.sector_id)}
                  className={`hover:bg-[#EDEDE8]/5 cursor-pointer transition-colors ${
                    selectedSector?.sector_id === s.sector_id ? "bg-[#EDEDE8]/10 font-bold" : ""
                  }`}
                >
                  <td className="p-3 uppercase font-bold text-[#EDEDE8]">{s.sector_name}</td>
                  <td className="p-3">
                    <span
                      className="px-2 py-0.5 border text-[10px] font-bold uppercase"
                      style={{
                        borderColor: getStatusColor(s.status),
                        color: getStatusColor(s.status),
                      }}
                    >
                      {s.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3 text-[#FFB800]">{s.severity_index.toFixed(1)}/10</td>
                  <td className="p-3">{s.distance_to_epicenter_km.toFixed(0)} km</td>
                  <td className="p-3">{(s.isolation_index * 100).toFixed(0)}%</td>
                  <td className="p-3 text-[#E5484D]">{s.estimated_casualties}</td>
                  <td className="p-3">{s.active_incidents_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
