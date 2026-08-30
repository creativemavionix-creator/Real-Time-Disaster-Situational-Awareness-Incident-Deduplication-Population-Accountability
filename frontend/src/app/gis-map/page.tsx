"use client";

import React, { useEffect, useState } from "react";
import { fetchGisTelemetry, GisFeatureCollection, GisSectorTelemetry } from "@/lib/api";
import InteractiveVectorMap from "@/components/InteractiveVectorMap";
import { useViewMode } from "@/context/ViewModeContext";

export default function GisMapPage() {
  const [gisData, setGisData] = useState<GisFeatureCollection | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>("gorkha");
  const [activeLayer, setActiveLayer] = useState<"severity" | "epicenter" | "isolation">("severity");
  const [error, setError] = useState<string | null>(null);
  const { isAnalysis } = useViewMode();

  const loadData = async () => {
    try {
      const res = await fetchGisTelemetry();
      setGisData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load GIS telemetry");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const selectedSector = gisData?.sectors.find(
    (s) => s.sector_id.toLowerCase() === selectedSectorId?.toLowerCase()
  ) || gisData?.sectors[0] || null;

  return (
    <div className="p-6 sm:p-10 lg:p-14 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="border-b border-[#E5E4DC] dark:border-[#232733] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono-data text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
            01 // GEOSPATIAL SITUATION RADAR
          </div>
          <h1 className="font-display-calm font-extrabold text-3xl sm:text-4xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
            Central Nepal Disaster Cartography
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-[#5C6270] dark:text-[#9CA3AF] max-w-2xl leading-relaxed">
            Vectorized territorial coverage across 8 strategic crisis zones. Fuses ground incident density, isolation impedance, and Copernicus Sentinel-1 orbital radar.
          </p>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-2 font-mono-data text-xs">
          <button
            onClick={() => setActiveLayer("severity")}
            type="button"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeLayer === "severity"
                ? "bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12]"
                : "text-[#5C6270] hover:bg-[#F2F0E8] dark:hover:bg-[#1A1E27]"
            }`}
          >
            DAMAGE SEVERITY
          </button>
          <button
            onClick={() => setActiveLayer("epicenter")}
            type="button"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeLayer === "epicenter"
                ? "bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12]"
                : "text-[#5C6270] hover:bg-[#F2F0E8] dark:hover:bg-[#1A1E27]"
            }`}
          >
            EPICENTER PROXIMITY
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-mono-data text-[#E11D48]">
          [GIS_SYNC_ERROR]: {error}
        </div>
      )}

      {/* Main Grid: Map Left (7) + Telemetry Right (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          <InteractiveVectorMap
            sectors={gisData?.sectors || []}
            selectedSectorId={selectedSectorId}
            onSelectSector={(sId) => setSelectedSectorId(sId)}
            activeLayer={activeLayer}
          />
        </div>

        <div className="lg:col-span-5 surface-calm p-6 sm:p-8 space-y-6">
          {selectedSector ? (
            <div className="space-y-6 font-mono-data text-xs">
              <div>
                <div className="text-[11px] text-[#5C6270] uppercase tracking-wider mb-1">
                  SECTOR TELEMETRY // {selectedSector.sector_id.toUpperCase()}
                </div>
                <h2 className="font-display-calm font-extrabold text-2xl sm:text-3xl text-[#111318] dark:text-[#F4F4F0]">
                  {selectedSector.sector_name}
                </h2>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733]">
                  <span className="text-[10px] text-[#5C6270] uppercase block">DAMAGE SEVERITY</span>
                  <strong className="text-xl text-[#E11D48] dark:text-[#FB7185] font-extrabold">
                    {selectedSector.severity_index.toFixed(1)}/10
                  </strong>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733]">
                  <span className="text-[10px] text-[#5C6270] uppercase block">CONFIDENCE SCORE</span>
                  <strong className="text-xl text-[#059669] dark:text-[#34D399] font-extrabold">
                    {(selectedSector.confidence_score * 100).toFixed(0)}%
                  </strong>
                </div>
              </div>

              {/* Spatial Factors */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#5C6270] uppercase">
                  PHYSICAL TERRAIN TELEMETRY:
                </span>
                <div className="p-4 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] space-y-2 text-[11px] text-[#5C6270] dark:text-[#9CA3AF]">
                  <div className="flex justify-between">
                    <span>Epicenter Distance:</span>
                    <strong className="text-[#111318] dark:text-[#F4F4F0]">{selectedSector.distance_to_epicenter_km.toFixed(1)} km</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Elevation:</span>
                    <strong className="text-[#111318] dark:text-[#F4F4F0]">{selectedSector.elevation_meters}m</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Road Access Isolation:</span>
                    <strong className="text-[#D97706] dark:text-[#FBBF24]">{(selectedSector.isolation_index * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Casualties:</span>
                    <strong className="text-[#E11D48] dark:text-[#FB7185]">{selectedSector.estimated_casualties}</strong>
                  </div>
                </div>
              </div>

              {/* Satellite Evidence */}
              {selectedSector.satellite_corroborated && (
                <div className="p-3.5 rounded-xl bg-[#059669]/10 border border-[#059669]/30 text-[#059669] dark:text-[#34D399] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>🛰️</span>
                    <span>SATELLITE SAR CORROBORATED: {selectedSector.satellite_sensor || "SENTINEL-1"}</span>
                  </div>
                  <div className="text-[11px] text-[#5C6270] dark:text-[#9CA3AF]">
                    Orbital synthetic aperture radar cross-validated ground collapse pattern.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center font-mono-data text-xs text-[#5C6270]">
              SELECT A SECTOR ON THE MAP TO INSPECT.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
