"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { fetchGisTelemetry, GisFeatureCollection, GisSectorTelemetry } from "@/lib/api";
import { useViewMode } from "@/context/ViewModeContext";

const InteractiveVectorMap = dynamic(
  () => import("@/components/InteractiveVectorMap"),
  { ssr: false, loading: () => <div className="h-[520px] bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-center font-mono text-xs text-slate-400">INITIALIZING LEAFLET VECTOR CARTOGRAPHY...</div> }
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
        return "#10B981";
      case "verified_damaged":
      case "blackout":
        return "#F43F5E";
      default:
        return "#F59E0B";
    }
  };

  const getRecommendedAction = (sector: GisSectorTelemetry) => {
    if (sector.status === "verified_damaged") {
      return "Deploy Urban SAR Heavy Battalion + Emergency Field Hospital";
    } else if (sector.status === "blackout" || sector.isolation_index > 0.7) {
      return "Deploy High-Altitude Reconnaissance + Satellite Comms Restoration";
    } else if (sector.status === "unverified") {
      return "Dispatch APF First-Responder Reconnaissance Patrol";
    } else {
      return "Maintain Standing Monitoring & Staging Logistics Hub";
    }
  };

  return (
    <div className="p-6 sm:p-10 lg:p-14 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="prism-badge-cyan">
            <span>01</span>
            <span>//</span>
            <span>SITUATION MAP</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            Geospatial Radar & Regional Telemetry
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Real-time geospatial radar tracking earthquake epicenter impact, road isolation impedance, and critical population centers across Central Nepal.
          </p>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 text-[11px] uppercase mr-1">OVERLAY:</span>
          {(["severity", "epicenter", "isolation"] as const).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-3.5 py-1.5 rounded-full font-bold uppercase transition-all cursor-pointer border ${
                activeLayer === layer
                  ? "bg-[#0088A9] text-white border-[#0088A9] shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 rounded-2xl font-mono text-xs text-rose-700 dark:text-rose-300">
          [GIS_TELEMETRY_ERROR]: {error}
        </div>
      )}

      {/* Main Map & Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Visual Map Canvas (7 Columns) */}
        <div className="lg:col-span-7 prism-card p-6 relative space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {mapViewMode === "vector" ? "HDX UN OCHA VECTOR MAP" : "SPATIAL RADAR HUD"} // 8 SECTORS
              </span>
            </div>

            {/* Dual Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setMapViewMode("vector")}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${
                  mapViewMode === "vector"
                    ? "bg-[#0088A9] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                🗺️ Vector Map
              </button>
              <button
                onClick={() => setMapViewMode("radar")}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${
                  mapViewMode === "radar"
                    ? "bg-[#0088A9] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
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
            <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl border border-slate-800 p-6 overflow-hidden flex flex-col justify-between text-white">
              {/* Subtle Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10 pointer-events-none">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="border border-slate-700" />
                ))}
              </div>

              {/* Epicenter Target Mark */}
              <div
                className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: "15%", top: "35%" }}
              >
                <div className="w-8 h-8 rounded-full border border-rose-500 opacity-50 animate-ping absolute inset-0" />
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center font-mono text-[9px] text-white font-bold">
                  ✕
                </div>
                <span className="absolute left-5 top-0 whitespace-nowrap font-mono text-[10px] text-rose-400 font-bold bg-slate-900/90 px-2 py-0.5 rounded-md border border-rose-500/40">
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
                      className={`absolute -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-xl border transition-all select-none text-left cursor-pointer ${
                        isSelected
                          ? "bg-white text-slate-900 border-cyan-500 z-30 shadow-xl scale-105"
                          : "bg-slate-900/90 text-white border-slate-700 hover:border-slate-500 z-20"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="uppercase">{sector.sector_name}</span>
                      </div>

                      <div
                        className={`text-[9.5px] font-mono mt-0.5 ${
                          isSelected ? "text-slate-600" : "text-slate-400"
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
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-2 z-10">
                <span>LAT: 27.2°N - 28.2°N</span>
                <span>LON: 84.5°E - 86.2°E</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Sector Inspector Panel (5 Columns) */}
        <div className="lg:col-span-5 prism-card p-6 space-y-6">
          {selectedSector ? (
            <div className="space-y-6">
              {/* Sector Title & Status */}
              <div>
                <div className="prism-badge-cyan mb-1.5">
                  <span>SECTOR TELEMETRY DOSSIER</span>
                </div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                  {selectedSector.sector_name}
                </h2>
                <div className="flex items-center gap-2 mt-2.5">
                  <span
                    className="px-3 py-1 rounded-full font-mono text-xs font-bold uppercase border"
                    style={{
                      borderColor: getStatusColor(selectedSector.status),
                      color: getStatusColor(selectedSector.status),
                      backgroundColor: `${getStatusColor(selectedSector.status)}15`,
                    }}
                  >
                    {selectedSector.status.replace("_", " ")}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    ID: {selectedSector.sector_id.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Action Directive */}
              <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border-l-4 border-[#0088A9] text-xs">
                <span className="font-mono text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase block mb-1">
                  OPERATIONAL DIRECTIVE:
                </span>
                <p className="font-body-prose font-semibold text-slate-800 dark:text-slate-200">
                  {getRecommendedAction(selectedSector)}
                </p>
              </div>

              {/* Critical Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">SEVERITY INDEX</span>
                  <strong className="text-lg text-rose-600 dark:text-rose-400 font-bold">
                    {selectedSector.severity_index.toFixed(1)} / 10.0
                  </strong>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">EPICENTER DISTANCE</span>
                  <strong className="text-lg text-slate-800 dark:text-slate-200 font-bold">
                    {selectedSector.distance_to_epicenter_km.toFixed(0)} km
                  </strong>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">ISOLATION IMPEDANCE</span>
                  <strong className="text-lg text-amber-600 dark:text-amber-400 font-bold">
                    {(selectedSector.isolation_index * 100).toFixed(0)}%
                  </strong>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">ESTIMATED CASUALTIES</span>
                  <strong className="text-lg text-rose-600 dark:text-rose-400 font-bold">
                    {selectedSector.estimated_casualties || 0}
                  </strong>
                </div>
              </div>

              {/* Satellite Evidence Corroboration Badge */}
              {selectedSector.satellite_corroborated && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl font-mono text-xs space-y-1">
                  <div className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                    <span>🛰️</span>
                    <span>SATELLITE CORROBORATED: {selectedSector.satellite_sensor || "COPERNICUS SENTINEL-1 SAR"}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 text-[11px]">
                    Orbital synthetic aperture radar cross-validated ground collapse pattern.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center font-mono text-xs text-slate-400">
              SELECT A SECTOR ON THE MAP TO INSPECT TELEMETRY.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
