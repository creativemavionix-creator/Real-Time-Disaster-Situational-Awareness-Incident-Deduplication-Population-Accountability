"use client";

import React, { useEffect, useState } from "react";
import {
  fetchUnifiedTruth,
  UnifiedTruthResponse,
  UnifiedTruthRecord,
} from "@/lib/api";
import { useViewMode } from "@/context/ViewModeContext";

export default function DeduplicationPage() {
  const [data, setData] = useState<UnifiedTruthResponse | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"ALL" | "DISPUTED" | "CORROBORATED">("ALL");
  const [showTechnicalEvidence, setShowTechnicalEvidence] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAnalysis } = useViewMode();

  const loadData = async () => {
    try {
      const res = await fetchUnifiedTruth();
      setData(res);
      setSelectedKey((prev) => {
        if (prev && res.unified_records.some((r) => `${r.sector_id}-${r.cluster_id}` === prev)) {
          return prev;
        }
        const first = res.unified_records[0];
        return first ? `${first.sector_id}-${first.cluster_id}` : null;
      });
    } catch (err: any) {
      setError(err.message || "Failed to load deduplicated unified truth");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredRecords = (data?.unified_records || []).filter((r) => {
    if (filterMode === "DISPUTED") return r.has_conflicts;
    if (filterMode === "CORROBORATED") return r.verification_status === "CORROBORATED_TRUTH";
    return true;
  });

  const selectedRecord =
    filteredRecords.find((r) => `${r.sector_id}-${r.cluster_id}` === selectedKey) ||
    data?.unified_records.find((r) => `${r.sector_id}-${r.cluster_id}` === selectedKey) ||
    filteredRecords[0] ||
    data?.unified_records[0] ||
    null;

  return (
    <div className="p-6 sm:p-10 lg:p-14 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="prism-badge-cyan">
            <span>02</span>
            <span>//</span>
            <span>INTELLIGENCE & VERIFICATION</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            Multi-Agency Deduplication & Unified Truth
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Multi-agency deduplication resolving conflicting casualty estimates, structural damage claims, and social media rumors into a verified operational record.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {(["ALL", "DISPUTED", "CORROBORATED"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3.5 py-1.5 rounded-full font-bold uppercase transition-all cursor-pointer border ${
                filterMode === mode
                  ? "bg-[#0088A9] text-white border-[#0088A9] shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Top Trust KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="prism-card p-5">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">TOTAL FUSED CLUSTERS</span>
          <strong className="text-3xl text-slate-900 dark:text-white font-extrabold">{data?.total_clusters || 0}</strong>
        </div>
        <div className="prism-card p-5">
          <span className="text-emerald-600 dark:text-emerald-400 block text-[10px] uppercase font-bold">CONFIRMED CONSENSUS</span>
          <strong className="text-3xl text-emerald-600 dark:text-emerald-400 font-extrabold">{data?.corroborated_clusters_count || 0}</strong>
        </div>
        <div className="prism-card p-5">
          <span className="text-rose-600 dark:text-rose-400 block text-[10px] uppercase font-bold">DISPUTED / RUMORS DETECTED</span>
          <strong className="text-3xl text-rose-600 dark:text-rose-400 font-extrabold">{data?.disputed_clusters_count || 0}</strong>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 rounded-2xl font-mono text-xs text-rose-700 dark:text-rose-300">
          [DEDUPLICATION_ERROR]: {error}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Cluster Stories List (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="prism-card p-8 text-center font-mono text-xs text-slate-400">
              NO INCIDENT CLUSTERS MATCH CURRENT FILTER.
            </div>
          ) : (
            filteredRecords.map((record, index) => {
              const isSelected =
                selectedRecord?.sector_id === record.sector_id &&
                selectedRecord?.cluster_id === record.cluster_id;
              const isDisputed = record.has_conflicts;

              return (
                <div
                  key={`${record.sector_id}-${record.cluster_id}-${index}`}
                  onClick={() => setSelectedKey(`${record.sector_id}-${record.cluster_id}`)}
                  className={`prism-card p-5 cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-[#0088A9] shadow-md"
                      : isDisputed
                      ? "border-rose-300 dark:border-rose-900/60"
                      : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-400">
                        #{record.cluster_id} // {record.sector_name.toUpperCase()}
                      </span>
                      <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full font-mono text-[10px] text-slate-700 dark:text-slate-300 uppercase">
                        {record.consensus_damage_type}
                      </span>
                      {record.satellite_corroborated && (
                        <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-full font-mono text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase flex items-center gap-1">
                          <span>🛰️ SATELLITE</span>
                        </span>
                      )}
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase border ${
                        record.verification_status === "CORROBORATED_TRUTH"
                          ? "border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-950/40"
                          : record.verification_status === "DISPUTED_CLAIMS"
                          ? "border-rose-200 text-rose-700 bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:bg-rose-950/40"
                          : "border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-950/40"
                      }`}
                    >
                      {record.verification_status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="font-body-prose text-sm text-slate-800 dark:text-slate-200 mb-3 line-clamp-2">
                    &quot;{record.representative_truth_text}&quot;
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>{record.agency_breakdown.reduce((sum, a) => sum + a.report_count, 0)} SOURCES</span>
                      <span>•</span>
                      <span>
                        EST. CASUALTIES: <strong className="text-slate-800 dark:text-slate-200">{record.unified_casualty_estimate ?? "NONE"}</strong>
                      </span>
                    </div>

                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      CONFIDENCE: {(record.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Dispute Resolver & Evidence Dossier (5 Columns) */}
        <div className="lg:col-span-5 prism-card p-6 space-y-6">
          {selectedRecord ? (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="prism-badge-cyan mb-1.5">
                  <span>DISPUTE RESOLUTION DOSSIER</span>
                </div>
                <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
                  Cluster #{selectedRecord.cluster_id} // {selectedRecord.sector_name}
                </h2>
                <div className="text-xs font-mono text-slate-500 mt-1">
                  DAMAGE TAG: <strong className="text-slate-800 dark:text-slate-200 uppercase">{selectedRecord.consensus_damage_type}</strong>
                </div>
              </div>

              {/* Verified Truth Statement */}
              <div>
                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block mb-1">
                  RECONCILED OPERATIONAL TRUTH:
                </span>
                <blockquote className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border-l-3 border-emerald-500 text-xs sm:text-sm font-body-prose text-slate-800 dark:text-slate-200 leading-relaxed">
                  &quot;{selectedRecord.representative_truth_text}&quot;
                </blockquote>
              </div>

              {/* Remote Sensing Satellite Evidence Dossier */}
              {selectedRecord.satellite_corroborated && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-bold uppercase text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span>🛰️ ORBITAL SATELLITE CROSS-VALIDATION</span>
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 rounded-full text-[10px]">
                      {selectedRecord.satellite_damage_points_count || 1} TARGETS
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    SENSOR: <strong className="text-slate-800 dark:text-slate-200">{selectedRecord.satellite_sensor_source || "UNOSAT UNITAR / Sentinel-1"}</strong>
                  </div>
                  <p className="font-body-prose text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    {selectedRecord.satellite_evidence_summary || "UNOSAT orbital mapping confirmed physical building collapse."}
                  </p>
                </div>
              )}

              {/* Conflict Analysis Callout */}
              {selectedRecord.has_conflicts ? (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold uppercase">
                    <span>⚠ CONFLICTING CASUALTY OR DAMAGE CLAIMS</span>
                  </div>
                  <p className="font-body-prose text-xs text-slate-700 dark:text-slate-300">
                    {selectedRecord.conflict_summary}
                  </p>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-rose-200 dark:border-rose-900/40 flex justify-between">
                    <span>DISPUTE RANGE: [{selectedRecord.casualty_dispute_range[0]} - {selectedRecord.casualty_dispute_range[1]}]</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">HOSPITAL LOG TRUSTED</span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 font-mono text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                  <span>✓ ZERO REPORTING CONFLICTS</span>
                  <span className="font-bold">AGENCY CONSENSUS ACHIEVED</span>
                </div>
              )}

              {/* Agency Breakdown Table */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                  AGENCY TELEMETRY SOURCES ({selectedRecord.agency_breakdown.length}):
                </span>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-mono text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        <th className="p-2.5">AGENCY</th>
                        <th className="p-2.5">COUNT</th>
                        <th className="p-2.5">CLAIMED CASUALTIES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedRecord.agency_breakdown.map((agency, aIdx) => (
                        <tr key={`${agency.source_type}-${aIdx}`}>
                          <td className="p-2.5 uppercase font-bold text-slate-800 dark:text-slate-200">
                            {agency.source_type}
                          </td>
                          <td className="p-2.5">{agency.report_count}</td>
                          <td className="p-2.5 font-bold text-rose-600 dark:text-rose-400">
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
            <div className="py-16 text-center font-mono text-xs text-slate-400">
              SELECT AN INCIDENT CLUSTER TO INSPECT RESOLUTION DOSSIER.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
