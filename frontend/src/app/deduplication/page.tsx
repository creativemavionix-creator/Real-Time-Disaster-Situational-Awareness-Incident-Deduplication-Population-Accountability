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
  const [selectedRecord, setSelectedRecord] = useState<UnifiedTruthRecord | null>(null);
  const [filterMode, setFilterMode] = useState<"ALL" | "DISPUTED" | "CORROBORATED">("ALL");
  const [showTechnicalEvidence, setShowTechnicalEvidence] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAnalysis } = useViewMode();

  const loadData = async () => {
    try {
      const res = await fetchUnifiedTruth();
      setData(res);
      if (!selectedRecord && res.unified_records.length > 0) {
        setSelectedRecord(res.unified_records[0]);
      }
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

  return (
    <div className="p-6 sm:p-10 lg:p-14 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="border-b border-[#EDEDE8]/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
            02 // INTELLIGENCE & VERIFICATION
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#EDEDE8]">
            WHAT CAN WE TRUST?
          </h1>
          <p className="font-body-prose text-sm text-[#EDEDE8]/70 mt-1 max-w-2xl leading-relaxed">
            Multi-agency deduplication resolving conflicting casualty estimates, structural damage claims, and social media rumors into a verified operational record.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 font-mono-data text-xs">
          {(["ALL", "DISPUTED", "CORROBORATED"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 uppercase font-medium border transition-all cursor-pointer ${
                filterMode === mode
                  ? "bg-[#EDEDE8] text-[#0A0A0A] border-[#EDEDE8] font-bold"
                  : "bg-transparent text-[#EDEDE8]/70 border-[#EDEDE8]/20 hover:border-[#EDEDE8]/40"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Top Trust KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-data text-xs">
        <div className="surface-card p-4">
          <span className="text-[#EDEDE8]/50 block text-[10px] uppercase">TOTAL FUSED CLUSTERS</span>
          <strong className="text-2xl text-[#EDEDE8] font-bold">{data?.total_clusters || 0}</strong>
        </div>
        <div className="surface-card p-4">
          <span className="text-[#3FB950] block text-[10px] uppercase font-bold">CONFIRMED CONSENSUS</span>
          <strong className="text-2xl text-[#3FB950] font-bold">{data?.corroborated_clusters_count || 0}</strong>
        </div>
        <div className="surface-card p-4">
          <span className="text-[#E5484D] block text-[10px] uppercase font-bold">DISPUTED / RUMORS DETECTED</span>
          <strong className="text-2xl text-[#E5484D] font-bold">{data?.disputed_clusters_count || 0}</strong>
        </div>
      </div>

      {error && (
        <div className="bg-[#E5484D]/10 border border-[#E5484D] p-4 font-mono-data text-xs text-[#E5484D]">
          [DEDUPLICATION_ERROR]: {error}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Cluster Stories List (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="surface-card p-8 text-center font-mono-data text-xs text-[#EDEDE8]/50">
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
                  onClick={() => setSelectedRecord(record)}
                  className={`surface-card p-5 cursor-pointer transition-all ${
                    isSelected
                      ? "surface-card-active shadow-md"
                      : isDisputed
                      ? "surface-card-critical"
                      : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EDEDE8]/10 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-data text-xs font-bold text-[#FFB800]">
                        #{record.cluster_id} // {record.sector_name.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 bg-[#EDEDE8]/5 border border-[#EDEDE8]/20 font-mono-data text-[10px] text-[#EDEDE8] uppercase">
                        {record.consensus_damage_type}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 font-mono-data text-[10px] font-bold border uppercase ${
                        record.verification_status === "CORROBORATED_TRUTH"
                          ? "border-[#3FB950] text-[#3FB950]"
                          : record.verification_status === "DISPUTED_CLAIMS"
                          ? "border-[#E5484D] text-[#E5484D] bg-[#E5484D]/10"
                          : "border-[#FFB800] text-[#FFB800]"
                      }`}
                    >
                      {record.verification_status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="font-body-prose text-sm text-[#EDEDE8] mb-3 line-clamp-2">
                    &quot;{record.representative_truth_text}&quot;
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-xs font-mono-data text-[#EDEDE8]/60">
                    <div className="flex items-center gap-3">
                      <span>{record.agency_breakdown.reduce((sum, a) => sum + a.report_count, 0)} SOURCES</span>
                      <span>•</span>
                      <span>
                        EST. CASUALTIES: <strong className="text-[#EDEDE8]">{record.unified_casualty_estimate ?? "NONE"}</strong>
                      </span>
                    </div>

                    <span className="text-[#3FB950] font-bold">
                      CONFIDENCE: {(record.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Dispute Resolver & Evidence Dossier (5 Columns) */}
        <div className="lg:col-span-5 surface-card p-6 space-y-6">
          {selectedRecord ? (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
                  DISPUTE RESOLUTION DOSSIER
                </div>
                <h2 className="font-display text-2xl font-bold text-[#EDEDE8]">
                  Cluster #{selectedRecord.cluster_id} // {selectedRecord.sector_name}
                </h2>
                <div className="text-xs font-mono-data text-[#EDEDE8]/60 mt-1">
                  DAMAGE TAG: <strong className="text-[#EDEDE8] uppercase">{selectedRecord.consensus_damage_type}</strong>
                </div>
              </div>

              {/* Verified Truth Statement */}
              <div>
                <span className="font-mono-data text-[10px] text-[#3FB950] font-bold uppercase block mb-1">
                  RECONCILED OPERATIONAL TRUTH:
                </span>
                <blockquote className="bg-[#EDEDE8]/3 p-4 border-l-2 border-[#3FB950] text-sm font-body-prose text-[#EDEDE8] leading-relaxed">
                  &quot;{selectedRecord.representative_truth_text}&quot;
                </blockquote>
              </div>

              {/* Conflict Analysis Callout */}
              {selectedRecord.has_conflicts ? (
                <div className="p-4 bg-[#E5484D]/10 border border-[#E5484D] space-y-2 font-mono-data text-xs">
                  <div className="flex items-center gap-2 text-[#E5484D] font-bold uppercase">
                    <span>⚠ CONFLICTING CASUALTY OR DAMAGE CLAIMS</span>
                  </div>
                  <p className="font-body-prose text-xs text-[#EDEDE8]/90">
                    {selectedRecord.conflict_summary}
                  </p>
                  <div className="text-[11px] text-[#EDEDE8]/60 pt-2 border-t border-[#E5484D]/30 flex justify-between">
                    <span>DISPUTE RANGE: [{selectedRecord.casualty_dispute_range[0]} - {selectedRecord.casualty_dispute_range[1]}]</span>
                    <span>RESOLVED CASUALTIES: <strong className="text-[#EDEDE8]">{selectedRecord.unified_casualty_estimate}</strong></span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#3FB950]/10 border border-[#3FB950] font-mono-data text-xs text-[#3FB950] space-y-1">
                  <div className="font-bold">✓ MULTI-AGENCY CONSENSUS ESTABLISHED</div>
                  <p className="font-body-prose text-xs text-[#EDEDE8]/80">
                    Reports from first responders, police, and hospitals corroborate this incident with no major disputes.
                  </p>
                </div>
              )}

              {/* Multi-Agency Source Breakdown */}
              <div className="space-y-2 font-mono-data text-xs">
                <span className="text-[#EDEDE8]/50 uppercase font-bold block text-[10px]">
                  REPORTING AGENCIES:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.agency_breakdown.map((agency) => (
                    <span
                      key={agency.source_type}
                      className="bg-[#EDEDE8]/5 border border-[#EDEDE8]/15 px-2.5 py-1 text-[#EDEDE8] text-[11px] uppercase"
                    >
                      {agency.source_type}: <strong className="text-[#FFB800]">{agency.report_count}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Progressive Disclosure: Technical Evidence & Similarity Matrix */}
              <div className="pt-3 border-t border-[#EDEDE8]/10 space-y-3 font-mono-data text-xs">
                <button
                  onClick={() => setShowTechnicalEvidence(!showTechnicalEvidence)}
                  className="text-[#FFB800] text-xs font-bold hover:underline flex items-center justify-between w-full cursor-pointer"
                >
                  <span>{showTechnicalEvidence ? "▼ HIDE" : "► VIEW"} AI EMBEDDINGS & SCORING EVIDENCE</span>
                  <span className="text-[#EDEDE8]/40 text-[10px]">
                    {showTechnicalEvidence ? "COLLAPSE" : "EXPAND"}
                  </span>
                </button>

                {(showTechnicalEvidence || isAnalysis) && (
                  <div className="space-y-3 p-3 bg-[#EDEDE8]/3 border border-[#EDEDE8]/10 text-[11px] text-[#EDEDE8]/80 animate-fade-in">
                    <div className="flex justify-between">
                      <span className="text-[#EDEDE8]/60">DENSE EMBEDDING MODEL:</span>
                      <strong className="text-[#EDEDE8]">all-MiniLM-L6-v2 (384-d)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#EDEDE8]/60">COSINE SIMILARITY THRESHOLD:</span>
                      <strong className="text-[#FFB800]">≥ 0.75 (Distance ≤ 0.25)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#EDEDE8]/60">RELIABILITY SCORE:</span>
                      <strong className="text-[#3FB950]">
                        {(selectedRecord.confidence_score * 100).toFixed(1)}%
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="font-mono-data text-xs text-[#EDEDE8]/50">
              Select an incident cluster to view multi-agency dispute analysis.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
