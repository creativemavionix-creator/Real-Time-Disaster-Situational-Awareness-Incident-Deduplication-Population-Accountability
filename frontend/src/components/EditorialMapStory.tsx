"use client";

import React, { useState } from "react";
import { GisSectorTelemetry, LocationStatusItem } from "@/lib/api";
import InteractiveVectorMap from "./InteractiveVectorMap";

interface EditorialMapStoryProps {
  sectors: GisSectorTelemetry[];
  locations: LocationStatusItem[];
  selectedSectorId: string | null;
  onSelectSector: (sectorId: string) => void;
  onOpenDossier: (sectorId: string) => void;
}

export function EditorialMapStory({
  sectors,
  locations,
  selectedSectorId,
  onSelectSector,
  onOpenDossier,
}: EditorialMapStoryProps) {
  const [activeLayer, setActiveLayer] = useState<"severity" | "epicenter" | "isolation">("severity");

  const currentSector = sectors.find(
    (s) => s.sector_id.toLowerCase() === selectedSectorId?.toLowerCase()
  ) || sectors[0];

  const currentLocation = locations.find(
    (l) => l.location_id.toLowerCase() === (selectedSectorId?.toLowerCase() || currentSector?.sector_id.toLowerCase())
  );

  return (
    <section id="map-story" className="py-16 sm:py-24 border-b border-[#E5E4DC] dark:border-[#232733] px-6 sm:px-12 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="font-mono-data text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
              02 & 03 // GEOSPATIAL INTELLIGENCE
            </div>
            <h2 className="font-display-calm font-extrabold text-3xl sm:text-5xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
              Where Is the Risk?
            </h2>
            <p className="font-body-prose text-sm sm:text-base text-[#5C6270] dark:text-[#9CA3AF] leading-relaxed">
              Central Nepal’s 8 disaster sectors visualized through multi-agency report density, inferred mountain damage, and satellite SAR cross-validation.
            </p>
          </div>

          {/* Layer Filter Pills */}
          <div className="flex items-center gap-2 font-mono-data text-xs self-start md:self-auto">
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
              EPICENTER DISTANCE
            </button>
          </div>
        </div>

        {/* Interactive Story Canvas: Map (Left 7) + Choreographed Inspector (Right 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Map Column */}
          <div className="lg:col-span-7 space-y-4">
            <InteractiveVectorMap
              sectors={sectors}
              selectedSectorId={selectedSectorId}
              onSelectSector={onSelectSector}
              activeLayer={activeLayer}
            />

            {/* Quick Sector Selector Carousel/Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {sectors.map((sec) => {
                const isSelected = sec.sector_id.toLowerCase() === selectedSectorId?.toLowerCase();
                return (
                  <button
                    key={sec.sector_id}
                    onClick={() => onSelectSector(sec.sector_id)}
                    type="button"
                    className={`px-3.5 py-1.5 rounded-lg font-mono-data text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12] shadow-xs"
                        : "surface-calm text-[#5C6270] hover:text-[#111318] dark:hover:text-[#F4F4F0]"
                    }`}
                  >
                    {sec.sector_name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Choreographed Context Inspector (4-Layer Progressive Model) */}
          <div className="lg:col-span-5 surface-calm p-6 sm:p-8 space-y-6">
            {currentSector ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between font-mono-data text-xs text-[#5C6270] mb-1">
                    <span>SECTOR TELEMETRY</span>
                    <span>{currentSector.sector_id.toUpperCase()}</span>
                  </div>
                  <h3 className="font-display-calm font-extrabold text-2xl sm:text-3xl text-[#111318] dark:text-[#F4F4F0]">
                    {currentSector.sector_name}
                  </h3>
                </div>

                {/* 1. Summary */}
                <div className="grid grid-cols-2 gap-3 font-mono-data text-xs">
                  <div className="p-3.5 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733]">
                    <span className="text-[10px] text-[#5C6270] uppercase block">DAMAGE SEVERITY</span>
                    <strong className="text-xl text-[#E11D48] dark:text-[#FB7185] font-extrabold">
                      {currentSector.severity_index.toFixed(1)}/10
                    </strong>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733]">
                    <span className="text-[10px] text-[#5C6270] uppercase block">CONFIDENCE SCORE</span>
                    <strong className="text-xl text-[#059669] dark:text-[#34D399] font-extrabold">
                      {(currentSector.confidence_score * 100).toFixed(0)}%
                    </strong>
                  </div>
                </div>

                {/* 2. Explanation */}
                <div className="space-y-1.5 font-mono-data text-xs">
                  <span className="text-[10px] font-bold text-[#5C6270] uppercase">
                    PHYSICAL TERRAIN & ACCESS FACTORS:
                  </span>
                  <div className="p-4 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] space-y-2 text-[11px] text-[#5C6270] dark:text-[#9CA3AF]">
                    <div className="flex justify-between">
                      <span>Epicenter Proximity:</span>
                      <strong className="text-[#111318] dark:text-[#F4F4F0]">{currentSector.distance_to_epicenter_km.toFixed(1)} km</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Elevation:</span>
                      <strong className="text-[#111318] dark:text-[#F4F4F0]">{currentSector.elevation_meters}m</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Access Road Impedance:</span>
                      <strong className="text-[#D97706] dark:text-[#FBBF24]">{(currentSector.isolation_index * 100).toFixed(0)}% Isolated</strong>
                    </div>
                  </div>
                </div>

                {/* Satellite Corroboration */}
                {currentSector.satellite_corroborated && (
                  <div className="p-3.5 rounded-xl bg-[#059669]/10 border border-[#059669]/30 text-xs font-mono-data text-[#059669] dark:text-[#34D399] flex items-center gap-2">
                    <span>🛰️</span>
                    <span>SATELLITE SAR CORROBORATED: {currentSector.satellite_sensor || "SENTINEL-1"}</span>
                  </div>
                )}

                {/* Action CTA */}
                <button
                  onClick={() => onOpenDossier(currentSector.sector_id)}
                  type="button"
                  className="w-full btn-action-primary py-3 text-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>INSPECT FULL EVIDENCE DOSSIER</span>
                  <span>→</span>
                </button>
              </div>
            ) : (
              <div className="py-16 text-center font-mono-data text-xs text-[#5C6270]">
                SELECT A SECTOR ON THE MAP TO INSPECT.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
