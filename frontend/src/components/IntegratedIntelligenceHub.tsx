"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UnifiedTruthRecord,
  BlackoutRiskAssessment,
  MissingPersonItem,
  TacticalDispatchRecommendation,
} from "@/lib/api";

interface IntegratedIntelligenceHubProps {
  truthRecords: UnifiedTruthRecord[];
  blackoutAssessments: BlackoutRiskAssessment[];
  missingPersons: MissingPersonItem[];
  dispatchRecommendations: TacticalDispatchRecommendation[];
  onSelectSector: (sectorId: string) => void;
}

export function IntegratedIntelligenceHub({
  truthRecords,
  blackoutAssessments,
  missingPersons,
  dispatchRecommendations,
  onSelectSector,
}: IntegratedIntelligenceHubProps) {
  const [activeTab, setActiveTab] = useState<"truth" | "blackout" | "population" | "dispatch">("truth");

  const tabs = [
    { id: "truth", label: "01 RECONCILED INCIDENTS", count: truthRecords.length },
    { id: "blackout", label: "02 SILENT BLACKOUT INTEL", count: blackoutAssessments.filter(b => b.is_in_blackout).length },
    { id: "population", label: "03 MISSING PERSONS", count: missingPersons.length },
    { id: "dispatch", label: "04 PRIORITY DISPATCH", count: dispatchRecommendations.length },
  ];

  return (
    <section className="py-16 sm:py-24 border-b border-[#E5E4DC] dark:border-[#232733] px-6 sm:px-12 lg:px-16 bg-[#F2F0E8]/30 dark:bg-[#13161D]/30">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="font-mono-data text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
              OPERATIONAL INTELLIGENCE HUB
            </div>
            <h2 className="font-display-calm font-extrabold text-3xl sm:text-4xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
              Fused Multi-Agency Truth Stream
            </h2>
          </div>

          {/* Clean Tab Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none font-mono-data text-xs self-start md:self-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                type="button"
                className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === t.id
                    ? "bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12] shadow-xs"
                    : "surface-calm text-[#5C6270] hover:text-[#111318] dark:hover:text-[#F4F4F0]"
                }`}
              >
                <span>{t.label}</span>
                <span className="ml-1.5 opacity-60">({t.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Reconciled Incidents */}
        {activeTab === "truth" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono-data text-xs">
            {truthRecords.slice(0, 6).map((rec) => (
              <div
                key={rec.cluster_id}
                onClick={() => onSelectSector(rec.sector_id)}
                className="surface-calm p-5 space-y-3 cursor-pointer hover:border-[#2563EB] transition-colors"
              >
                <div className="flex justify-between items-center border-b border-[#E5E4DC] dark:border-[#232733] pb-2">
                  <span className="font-bold text-sm text-[#111318] dark:text-[#F4F4F0] uppercase">
                    {rec.sector_name}
                  </span>
                  <span className="chip-safe text-[10px]">
                    {(rec.confidence_score * 100).toFixed(0)}% CONFIDENCE
                  </span>
                </div>

                <p className="font-body-prose text-xs text-[#111318] dark:text-[#F4F4F0] line-clamp-3 italic">
                  &ldquo;{rec.representative_truth_text}&rdquo;
                </p>

                <div className="flex justify-between text-[11px] text-[#5C6270] pt-2 border-t border-[#E5E4DC] dark:border-[#232733]">
                  <span>Damage: <strong className="text-[#111318] dark:text-[#F4F4F0] uppercase">{rec.consensus_damage_type}</strong></span>
                  <span>Casualties: <strong className="text-[#E11D48] dark:text-[#FB7185]">{rec.unified_casualty_estimate}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Silent Blackout Intel */}
        {activeTab === "blackout" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono-data text-xs">
            {blackoutAssessments.map((sector) => (
              <div
                key={sector.sector_id}
                onClick={() => onSelectSector(sector.sector_id)}
                className="surface-calm p-5 space-y-3 cursor-pointer hover:border-[#E11D48] transition-colors"
              >
                <div className="flex justify-between items-center border-b border-[#E5E4DC] dark:border-[#232733] pb-2">
                  <span className="font-bold text-sm text-[#111318] dark:text-[#F4F4F0] uppercase">
                    {sector.sector_name}
                  </span>
                  <span className={sector.is_in_blackout ? "chip-critical text-[10px]" : "chip-safe text-[10px]"}>
                    {sector.is_in_blackout ? "TOTAL BLACKOUT" : "ACTIVE COMMS"}
                  </span>
                </div>

                <p className="font-body-prose text-xs text-[#5C6270] dark:text-[#9CA3AF] line-clamp-2">
                  {sector.risk_explanation}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5C6270] pt-2 border-t border-[#E5E4DC] dark:border-[#232733]">
                  <div>INFERRED RISK: <strong className="text-[#E11D48]">{sector.inferred_risk_score.toFixed(0)}%</strong></div>
                  <div>EPICENTER: <strong>{sector.spatial_physics.epicenter_distance_km.toFixed(0)} km</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Missing Persons */}
        {activeTab === "population" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono-data text-xs">
            {missingPersons.slice(0, 6).map((p, idx) => (
              <div
                key={`${p.id}-${idx}`}
                className="surface-calm p-5 space-y-3"
              >
                <div className="flex justify-between items-center border-b border-[#E5E4DC] dark:border-[#232733] pb-2">
                  <div>
                    <strong className="text-sm text-[#111318] dark:text-[#F4F4F0] block font-bold">{p.full_name}</strong>
                    <span className="text-[10px] text-[#5C6270]">{p.gender || "Unknown"}, {p.age ? `${p.age} yrs` : "Age Unspecified"}</span>
                  </div>
                  <span className="chip-critical text-[10px]">{p.status.replace("_", " ")}</span>
                </div>

                <div className="text-[11px] text-[#5C6270] dark:text-[#9CA3AF]">
                  LAST SECTOR: <strong className="text-[#111318] dark:text-[#F4F4F0] uppercase">{p.last_known_location_name || p.last_known_location_id}</strong>
                </div>

                <div className="pt-2 border-t border-[#E5E4DC] dark:border-[#232733] text-[10px] text-[#5C6270] flex justify-between">
                  <span>Reported by: {p.reported_by}</span>
                  <span>{new Date(p.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Tactical Dispatch Recommendations */}
        {activeTab === "dispatch" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono-data text-xs">
            {dispatchRecommendations.map((rec, rIdx) => (
              <div
                key={rec.target_sector_id}
                onClick={() => onSelectSector(rec.target_sector_id)}
                className="surface-calm p-5 space-y-3 cursor-pointer hover:border-[#2563EB] transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-[#E5E4DC] dark:border-[#232733] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12] px-2 py-0.5 rounded-lg">
                        RANK #{rIdx + 1}
                      </span>
                      <strong className="text-sm text-[#111318] dark:text-[#F4F4F0] uppercase">
                        {rec.target_sector_name}
                      </strong>
                    </div>
                    <span className="text-[#2563EB] dark:text-[#60A5FA] font-bold">
                      SCORE: {rec.priority_score.toFixed(1)}
                    </span>
                  </div>

                  <p className="font-body-prose text-xs text-[#5C6270] dark:text-[#9CA3AF]">
                    {rec.rationale}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5E4DC] dark:border-[#232733] flex items-center justify-between text-[11px]">
                  <span className="text-[#5C6270]">
                    ASSET: <strong className="text-[#111318] dark:text-[#F4F4F0] uppercase">{rec.recommended_unit_types.join(", ").replace(/_/g, " ")}</strong>
                  </span>
                  <Link
                    href={`/dispatch?sector=${rec.target_sector_id}`}
                    className="text-[#2563EB] dark:text-[#60A5FA] font-bold hover:underline"
                  >
                    AUTHORIZE →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
