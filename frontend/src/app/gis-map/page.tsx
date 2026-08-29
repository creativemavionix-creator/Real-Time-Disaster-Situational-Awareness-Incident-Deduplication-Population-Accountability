"use client";

import React, { useEffect, useState } from "react";
import { fetchGisTelemetry, GisFeatureCollection, GisSectorTelemetry } from "@/lib/api";

export default function GisMapPage() {
  const [data, setData] = useState<GisFeatureCollection | null>(null);
  const [selectedSector, setSelectedSector] = useState<GisSectorTelemetry | null>(null);
  const [activeLayer, setActiveLayer] = useState<"severity" | "epicenter" | "isolation">("severity");
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchGisTelemetry();
      setData(res);
      if (!selectedSector && res.sectors.length > 0) {
        setSelectedSector(res.sectors[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load GIS telemetry");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="border-b-4 border-[#EDEDE8] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
            CAPABILITY 01 // GEOSPATIAL TELEMETRY
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-[#EDEDE8]">
            SITUATIONAL GIS MATRIX
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-[#EDEDE8]/70 mt-1 max-w-2xl">
            Live geospatial satellite telemetry and hazard projection across 8 Central Nepal strategic sectors. Tracks epicenter proximity, road isolation index, and real-time casualty concentrations.
          </p>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-2 font-mono-data text-xs">
          <span className="text-[#EDEDE8]/60 text-[10px] uppercase font-bold mr-1">OVERLAY:</span>
          {(["severity", "epicenter", "isolation"] as const).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-3 py-1.5 font-bold uppercase border-2 transition-colors ${
                activeLayer === layer
                  ? "bg-[#FFB800] text-[#0A0A0A] border-[#FFB800]"
                  : "bg-[#0A0A0A] text-[#EDEDE8] border-[#EDEDE8]/30 hover:border-[#EDEDE8]"
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-[#E5484D]/10 border-2 border-[#E5484D] p-4 font-mono-data text-xs text-[#E5484D]">
          [GIS_TELEMETRY_ERROR]: {error}
        </div>
      )}

      {/* Main GIS Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visual Spatial Map Canvas (8 Columns) */}
        <div className="lg:col-span-8 border-4 border-[#EDEDE8] p-6 bg-[#0A0A0A] relative">
          <div className="flex items-center justify-between border-b-2 border-[#EDEDE8]/30 pb-3 mb-6 font-mono-data text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#FFB800] animate-ping inline-block" />
              <span className="font-bold text-[#EDEDE8]">SATELLITE POSITIONING RADAR // CENTRAL NEPAL</span>
            </div>
            <span className="text-[#EDEDE8]/60">EPICENTER: 28.00°N, 84.63°E [GORKHA]</span>
          </div>

          {/* Spatial Grid Representation */}
          <div className="relative aspect-[4/3] bg-[#0A0A0A] border-2 border-[#EDEDE8]/20 p-6 overflow-hidden flex flex-col justify-between">
            {/* Coordinate Grid Background Lines */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10 pointer-events-none">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="border border-[#EDEDE8]" />
              ))}
            </div>

            {/* Epicenter Hazard Rings */}
            <div className="absolute left-[20%] top-[30%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-[#E5484D]/30 rounded-full animate-ping pointer-events-none" />
            <div className="absolute left-[20%] top-[30%] -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-[#E5484D]/60 rounded-full pointer-events-none" />
            <div className="absolute left-[20%] top-[30%] -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#E5484D] font-mono-data text-[9px] text-[#E5484D] whitespace-nowrap">
              <span className="ml-4 font-bold bg-[#0A0A0A] px-1 border border-[#E5484D]">★ EPICENTER (M7.8)</span>
            </div>

            {/* Render 8 Sector Nodes Positioned Geographically */}
            <div className="relative w-full h-full">
              {data?.sectors.map((sector, idx) => {
                // Coordinate normalization for Nepal box: Lat 27.2 to 28.2, Lon 84.5 to 86.2
                const normX = ((sector.longitude - 84.5) / 1.7) * 85 + 5;
                const normY = (1 - (sector.latitude - 27.2) / 1.0) * 85 + 5;
                const isSelected = selectedSector?.sector_id === sector.sector_id;
                const color = getStatusColor(sector.status);

                return (
                  <button
                    key={`${sector.sector_id}-${idx}`}
                    onClick={() => setSelectedSector(sector)}
                    style={{ left: `${normX}%`, top: `${normY}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 border-2 transition-all select-none text-left ${
                      isSelected
                        ? "bg-[#EDEDE8] text-[#0A0A0A] border-[#FFB800] scale-110 z-20 shadow-2xl"
                        : "bg-[#0A0A0A] text-[#EDEDE8] border-[#EDEDE8]/40 hover:border-[#EDEDE8] z-10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-mono-data text-[10px] font-bold">
                      <span className="w-2 h-2" style={{ backgroundColor: color }} />
                      <span className="uppercase">{sector.sector_name}</span>
                    </div>

                    <div className="font-mono-data text-[9px] opacity-75 mt-0.5">
                      {activeLayer === "severity" && `SEV: ${sector.severity_index}/10`}
                      {activeLayer === "epicenter" && `DIST: ${sector.distance_to_epicenter_km}km`}
                      {activeLayer === "isolation" && `ISOL: ${(sector.isolation_index * 100).toFixed(0)}%`}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Scale & Telemetry Readout */}
            <div className="border-t border-[#EDEDE8]/20 pt-3 flex items-center justify-between font-mono-data text-[10px] text-[#EDEDE8]/60">
              <span>PROJECTION: WGS84 // UTM ZONE 45N</span>
              <span>GRID RESOLUTION: 10KM CELL</span>
              <span>SIMULATED TIME: {data?.simulated_time ? new Date(data.simulated_time).toLocaleTimeString() : "--"}</span>
            </div>
          </div>
        </div>

        {/* Selected Sector Telemetry Inspector (4 Columns) */}
        <div className="lg:col-span-4 border-4 border-[#EDEDE8] p-6 bg-[#0A0A0A] space-y-6">
          <div className="border-b-2 border-[#EDEDE8]/30 pb-3">
            <span className="font-mono-data text-[10px] text-[#FFB800] uppercase font-bold tracking-widest block mb-1">
              SECTOR TELEMETRY DOSSIER
            </span>
            <h3 className="font-display text-2xl font-black uppercase text-[#EDEDE8]">
              {selectedSector?.sector_name || "SELECT SECTOR"}
            </h3>
          </div>

          {selectedSector ? (
            <div className="space-y-4 font-mono-data text-xs">
              {/* Status Badge */}
              <div
                className="p-3 border-2 font-bold uppercase text-center"
                style={{
                  borderColor: getStatusColor(selectedSector.status),
                  color: selectedSector.status === "verified_safe" ? "#0A0A0A" : "#EDEDE8",
                  backgroundColor: selectedSector.status === "verified_safe" ? "#3FB950" : `${getStatusColor(selectedSector.status)}20`,
                }}
              >
                [ STATUS: {selectedSector.status.replace("_", " ")} ]
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 border border-[#EDEDE8]/20 bg-[#EDEDE8]/5">
                  <span className="text-[#EDEDE8]/60 text-[10px] block">LATITUDE</span>
                  <span className="font-bold">{selectedSector.latitude.toFixed(4)}°N</span>
                </div>
                <div className="p-2 border border-[#EDEDE8]/20 bg-[#EDEDE8]/5">
                  <span className="text-[#EDEDE8]/60 text-[10px] block">LONGITUDE</span>
                  <span className="font-bold">{selectedSector.longitude.toFixed(4)}°E</span>
                </div>
                <div className="p-2 border border-[#EDEDE8]/20 bg-[#EDEDE8]/5">
                  <span className="text-[#EDEDE8]/60 text-[10px] block">ELEVATION</span>
                  <span className="font-bold">{selectedSector.elevation_meters} M</span>
                </div>
                <div className="p-2 border border-[#EDEDE8]/20 bg-[#EDEDE8]/5">
                  <span className="text-[#EDEDE8]/60 text-[10px] block">EPICENTER DIST</span>
                  <span className="font-bold text-[#FFB800]">{selectedSector.distance_to_epicenter_km} KM</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>SEVERITY INDEX:</span>
                    <strong className="text-[#E5484D]">{selectedSector.severity_index} / 10.0</strong>
                  </div>
                  <div className="h-2 w-full bg-[#EDEDE8]/10 border border-[#EDEDE8]/30">
                    <div
                      className="h-full bg-[#E5484D]"
                      style={{ width: `${(selectedSector.severity_index / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>ROAD ISOLATION IMPEDANCE:</span>
                    <strong className="text-[#FFB800]">{(selectedSector.isolation_index * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="h-2 w-full bg-[#EDEDE8]/10 border border-[#EDEDE8]/30">
                    <div
                      className="h-full bg-[#FFB800]"
                      style={{ width: `${selectedSector.isolation_index * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 border border-[#EDEDE8]/20 bg-[#EDEDE8]/5 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#EDEDE8]/60">ACTIVE INCIDENTS:</span>
                    <strong>{selectedSector.active_incidents_count}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#EDEDE8]/60">EST. CASUALTIES:</span>
                    <strong className="text-[#E5484D]">{selectedSector.estimated_casualties}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#EDEDE8]/60">THREAT TIER:</span>
                    <strong className="text-[#FFB800]">{selectedSector.threat_tier}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="font-mono-data text-xs text-[#EDEDE8]/50">
              Click a sector pin on the radar map to view telemetry.
            </p>
          )}
        </div>
      </div>

      {/* Comprehensive Telemetry Table */}
      <div className="border-4 border-[#EDEDE8] p-6 bg-[#0A0A0A]">
        <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-3">
          SECTOR TELEMETRY LEDGER // ALL 8 REGIONS
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-data text-xs border-collapse">
            <thead>
              <tr className="bg-[#EDEDE8]/10 border-b-2 border-[#EDEDE8] text-[#EDEDE8]">
                <th className="p-3">SECTOR</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">SEVERITY</th>
                <th className="p-3">EPICENTER DIST</th>
                <th className="p-3">ISOLATION</th>
                <th className="p-3">CASUALTIES</th>
                <th className="p-3">INCIDENTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEDE8]/20">
              {data?.sectors.map((s, idx) => (
                <tr
                  key={`${s.sector_id}-${idx}`}
                  onClick={() => setSelectedSector(s)}
                  className={`hover:bg-[#EDEDE8]/10 cursor-pointer transition-colors ${
                    selectedSector?.sector_id === s.sector_id ? "bg-[#EDEDE8]/15 font-bold" : ""
                  }`}
                >
                  <td className="p-3 uppercase font-bold text-[#EDEDE8]">{s.sector_name}</td>
                  <td className="p-3">
                    <span
                      className="px-2 py-0.5 border text-[10px] font-bold uppercase"
                      style={{
                        borderColor: getStatusColor(s.status),
                        color: s.status === "verified_safe" ? "#0A0A0A" : getStatusColor(s.status),
                        backgroundColor: s.status === "verified_safe" ? "#3FB950" : "transparent",
                      }}
                    >
                      {s.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-[#E5484D]">{s.severity_index}/10</td>
                  <td className="p-3 text-[#FFB800]">{s.distance_to_epicenter_km} km</td>
                  <td className="p-3">{(s.isolation_index * 100).toFixed(0)}%</td>
                  <td className="p-3 text-[#E5484D] font-bold">{s.estimated_casualties}</td>
                  <td className="p-3 text-[#EDEDE8]">{s.active_incidents_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
