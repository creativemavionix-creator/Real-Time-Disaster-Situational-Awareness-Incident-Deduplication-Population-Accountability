"use client";

import React, { useEffect, useState } from "react";
import { fetchUnifiedTruth, UnifiedTruthResponse, UnifiedTruthRecord } from "@/lib/api";
import { useViewMode } from "@/context/ViewModeContext";

export default function DeduplicationPage() {
  const [truthData, setTruthData] = useState<UnifiedTruthResponse | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);
  const [filterDisputedOnly, setFilterDisputedOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAnalysis } = useViewMode();

  const loadData = async () => {
    try {
      const res = await fetchUnifiedTruth();
      setTruthData(res);
      setSelectedClusterId((prev) => {
        if (prev && res.unified_records.some((r) => r.cluster_id === prev)) {
          return prev;
        }
        return res.unified_records[0]?.cluster_id || null;
      });
    } catch (err: any) {
      setError(err.message || "Failed to load unified truth ledger");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredRecords =
    truthData?.unified_records.filter((r) => (filterDisputedOnly ? r.has_conflicts : true)) || [];

  const selectedRecord =
    truthData?.unified_records.find((r) => r.cluster_id === selectedClusterId) ||
    truthData?.unified_records[0] ||
    null;

  return (
    <div className="p-6 sm:p-10 lg:p-14 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="border-b border-[#E5E4DC] dark:border-[#232733] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono-data text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
            02 // UNIFIED TRUTH & ENTITY RESOLUTION
          </div>
          <h1 className="font-display-calm font-extrabold text-3xl sm:text-4xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
            Incident Consensus Ledger
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-[#5C6270] dark:text-[#9CA3AF] max-w-2xl leading-relaxed">
            Reconciles overlapping, exaggerated, or conflicting field logs across police channels, hospital emergency triage rosters, and crowdsourced civilian SMS.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2 font-mono-data text-xs">
          <button
            onClick={() => setFilterDisputedOnly(!filterDisputedOnly)}
            type="button"
            className={`px-3.5 py-1.5 rounded-lg font-semibold border transition-all cursor-pointer ${
              filterDisputedOnly
                ? "bg-[#D97706]/10 border-[#D97706] text-[#D97706] dark:text-[#FBBF24]"
                : "border-[#E5E4DC] dark:border-[#232733] text-[#5C6270] hover:text-[#111318] dark:hover:text-[#F4F4F0]"
            }`}
          >
            {filterDisputedOnly ? "SHOWING CONFLICTS ONLY" : "SHOW ALL CLUSTERS"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-mono-data text-[#E11D48]">
          [UNIFIED_TRUTH_ERROR]: {error}
        </div>
      )}

      {/* Main Grid: Clusters Left (7) + Detailed Breakdown Right (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cluster Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="font-mono-data text-xs text-[#5C6270] font-bold uppercase tracking-wider flex items-center justify-between">
            <span>RESOLVED CLUSTERS // {filteredRecords.length} TOTAL</span>
            <span>SIMULATED: {truthData?.simulated_time ? new Date(truthData.simulated_time).toLocaleTimeString() : ""}</span>
          </div>

          <div className="space-y-3">
            {filteredRecords.map((cluster) => {
              const isSelected = selectedRecord?.cluster_id === cluster.cluster_id;

              return (
                <div
                  key={cluster.cluster_id}
                  onClick={() => setSelectedClusterId(cluster.cluster_id)}
                  className={`surface-calm p-5 cursor-pointer transition-all ${
                    isSelected ? "ring-2 ring-[#2563EB] shadow-md" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E4DC] dark:border-[#232733] pb-3 mb-3">
                    <div className="flex items-center gap-2 font-mono-data text-xs">
                      <span className="font-bold text-sm text-[#111318] dark:text-[#F4F4F0]">
                        CLUSTER #{cluster.cluster_id}
                      </span>
                      <span className="chip-neutral">{cluster.consensus_damage_type}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono-data text-xs">
                      {cluster.has_conflicts ? (
                        <span className="chip-warning">CONFLICT DETECTED</span>
                      ) : (
                        <span className="chip-safe">CONSENSUS</span>
                      )}
                      <span className="font-bold text-[#059669] dark:text-[#34D399]">
                        {(cluster.confidence_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <blockquote className="font-body-prose text-xs sm:text-sm text-[#111318] dark:text-[#F4F4F0] italic mb-3">
                    &ldquo;{cluster.representative_truth_text}&rdquo;
                  </blockquote>

                  <div className="flex flex-wrap items-center justify-between font-mono-data text-xs text-[#5C6270] dark:text-[#9CA3AF] pt-2 border-t border-[#E5E4DC] dark:border-[#232733]">
                    <div>
                      SECTOR: <strong className="text-[#111318] dark:text-[#F4F4F0] uppercase">{cluster.sector_name}</strong>
                    </div>
                    <div>
                      CASUALTY ESTIMATE: <strong className="text-[#E11D48] dark:text-[#FB7185]">{cluster.unified_casualty_estimate}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: In-Depth Resolution Dossier */}
        <div className="lg:col-span-5 surface-calm p-6 sm:p-8 space-y-6">
          {selectedRecord ? (
            <div className="space-y-6 font-mono-data text-xs">
              <div>
                <div className="text-[11px] text-[#5C6270] uppercase tracking-wider mb-1">
                  RESOLUTION DOSSIER // CLUSTER #{selectedRecord.cluster_id}
                </div>
                <h2 className="font-display-calm font-extrabold text-2xl text-[#111318] dark:text-[#F4F4F0]">
                  {selectedRecord.sector_name}
                </h2>
              </div>

              {/* Dispute Range */}
              <div className="p-4 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] space-y-2">
                <span className="text-[10px] text-[#5C6270] uppercase font-bold block">
                  RECONCILED CASUALTY DISPUTE RANGE:
                </span>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-display-calm font-extrabold text-[#E11D48] dark:text-[#FB7185]">
                    {selectedRecord.unified_casualty_estimate} Casualties
                  </div>
                  <div className="text-xs text-[#5C6270]">
                    Spread: [{selectedRecord.casualty_dispute_range[0]} — {selectedRecord.casualty_dispute_range[1]}]
                  </div>
                </div>
                <p className="font-body-prose text-xs text-[#5C6270] dark:text-[#9CA3AF]">
                  {selectedRecord.conflict_summary}
                </p>
              </div>

              {/* Multi-Agency Report Breakdown Table */}
              <div className="space-y-2">
                <span className="text-[10px] text-[#5C6270] uppercase font-bold block">
                  CONTRIBUTING AGENCY LOGS:
                </span>
                <div className="rounded-xl border border-[#E5E4DC] dark:border-[#232733] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F2F0E8] dark:bg-[#13161D] border-b border-[#E5E4DC] dark:border-[#232733] text-[#5C6270] text-[10px] uppercase font-bold">
                      <tr>
                        <th className="p-2.5">AGENCY</th>
                        <th className="p-2.5">REPORTS</th>
                        <th className="p-2.5">CLAIMED CASUALTIES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E4DC] dark:divide-[#232733]">
                      {selectedRecord.agency_breakdown.map((agency, aIdx) => (
                        <tr key={`${agency.source_type}-${aIdx}`}>
                          <td className="p-2.5 uppercase font-bold text-[#111318] dark:text-[#F4F4F0]">
                            {agency.source_type}
                          </td>
                          <td className="p-2.5">{agency.report_count}</td>
                          <td className="p-2.5 font-bold text-[#E11D48] dark:text-[#FB7185]">
                            {agency.consensus_claim ?? (agency.casualty_claims && agency.casualty_claims.length > 0 ? agency.casualty_claims.join(", ") : "N/A")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center font-mono-data text-xs text-[#5C6270]">
              SELECT AN INCIDENT CLUSTER TO INSPECT.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
