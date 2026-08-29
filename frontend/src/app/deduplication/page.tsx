"use client";

import React, { useEffect, useState } from "react";
import { fetchUnifiedTruth, UnifiedTruthResponse, UnifiedTruthRecord } from "@/lib/api";

export default function DeduplicationPage() {
  const [data, setData] = useState<UnifiedTruthResponse | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<UnifiedTruthRecord | null>(null);
  const [filter, setFilter] = useState<"ALL" | "CORROBORATED_TRUTH" | "DISPUTED_CLAIMS" | "UNVERIFIED_RUMOR">("ALL");
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchUnifiedTruth();
      setData(res);
      if (!selectedRecord && res.unified_records.length > 0) {
        setSelectedRecord(res.unified_records[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load deduplicated unified truth records");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredRecords = data?.unified_records.filter((r) => {
    if (filter === "ALL") return true;
    return r.verification_status === filter;
  }) || [];

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="border-b-4 border-[#EDEDE8] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
            CAPABILITY 02 // MULTI-AGENCY DEDUPLICATION
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-[#EDEDE8]">
            UNIFIED GROUND TRUTH
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-[#EDEDE8]/70 mt-1 max-w-2xl">
            Cross-references conflicting casualty claims and damage reports from Police radios, Hospital triage desks, Citizen SOS calls, and Social Media feeds into a single reconciled ground-truth consensus.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2 font-mono-data text-xs">
          {(["ALL", "CORROBORATED_TRUTH", "DISPUTED_CLAIMS", "UNVERIFIED_RUMOR"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 font-bold uppercase border-2 transition-colors ${
                filter === f
                  ? "bg-[#FFB800] text-[#0A0A0A] border-[#FFB800]"
                  : "bg-[#0A0A0A] text-[#EDEDE8] border-[#EDEDE8]/30 hover:border-[#EDEDE8]"
              }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-data text-xs">
        <div className="border-4 border-[#EDEDE8] p-4 bg-[#0A0A0A]">
          <span className="text-[#EDEDE8]/60 text-[10px] block">TOTAL FUSED CLUSTERS</span>
          <strong className="text-2xl text-[#EDEDE8] font-bold">{data?.total_clusters || 0}</strong>
        </div>
        <div className="border-4 border-[#3FB950] p-4 bg-[#3FB950]/5">
          <span className="text-[#3FB950] text-[10px] block font-bold">CORROBORATED MULTI-AGENCY TRUTH</span>
          <strong className="text-2xl text-[#3FB950] font-bold">{data?.corroborated_clusters_count || 0}</strong>
        </div>
        <div className="border-4 border-[#E5484D] p-4 bg-[#E5484D]/5">
          <span className="text-[#E5484D] text-[10px] block font-bold">DISPUTED / RUMOR CLUSTERS DETECTED</span>
          <strong className="text-2xl text-[#E5484D] font-bold">{data?.disputed_clusters_count || 0}</strong>
        </div>
      </div>

      {error && (
        <div className="bg-[#E5484D]/10 border-2 border-[#E5484D] p-4 font-mono-data text-xs text-[#E5484D]">
          [DEDUPLICATION_ERROR]: {error}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cluster List (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="border-4 border-[#EDEDE8]/30 p-8 text-center font-mono-data text-xs text-[#EDEDE8]/50">
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
                  className={`border-4 p-5 cursor-pointer transition-all select-none ${
                    isSelected
                      ? "border-[#FFB800] bg-[#EDEDE8]/10"
                      : isDisputed
                      ? "border-[#E5484D]/70 bg-[#0A0A0A] hover:border-[#E5484D]"
                      : "border-[#EDEDE8] bg-[#0A0A0A] hover:border-[#EDEDE8]/80"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#EDEDE8]/20 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-data text-xs font-bold text-[#FFB800]">
                        #{record.cluster_id} // {record.sector_name.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 bg-[#EDEDE8]/10 border border-[#EDEDE8]/30 font-mono-data text-[10px] text-[#EDEDE8] uppercase">
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

                  <p className="font-body-prose text-xs sm:text-sm text-[#EDEDE8] mb-4 line-clamp-2">
                    "{record.representative_truth_text}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 font-mono-data text-[11px] text-[#EDEDE8]/70 border-t border-[#EDEDE8]/20 pt-3">
                    <div>
                      UNIFIED CASUALTIES:{" "}
                      <strong className="text-[#E5484D]">{record.unified_casualty_estimate}</strong>
                      {record.has_conflicts && (
                        <span className="text-[10px] text-[#E5484D]/80 ml-1">
                          (Range: {record.casualty_dispute_range[0]} - {record.casualty_dispute_range[1]})
                        </span>
                      )}
                    </div>
                    <div>
                      CONFIDENCE:{" "}
                      <strong className="text-[#3FB950]">{(record.confidence_score * 100).toFixed(1)}%</strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Dispute Resolution Dossier (5 Columns) */}
        <div className="lg:col-span-5 border-4 border-[#EDEDE8] p-6 bg-[#0A0A0A] space-y-6">
          <div className="border-b-2 border-[#EDEDE8]/30 pb-3">
            <span className="font-mono-data text-[10px] text-[#FFB800] uppercase font-bold tracking-widest block mb-1">
              DISPUTE RESOLUTION DOSSIER
            </span>
            <h3 className="font-display text-2xl font-black uppercase text-[#EDEDE8]">
              CLUSTER #{selectedRecord?.cluster_id} DISSECTION
            </h3>
          </div>

          {selectedRecord ? (
            <div className="space-y-6 font-mono-data text-xs">
              {/* Conflict Status Banner */}
              {selectedRecord.has_conflicts ? (
                <div className="p-4 border-2 border-[#E5484D] bg-[#E5484D]/10 space-y-2">
                  <div className="text-[#E5484D] font-bold flex items-center gap-2">
                    <span>⚠ AGENCY CONFLICT DETECTED</span>
                  </div>
                  <p className="text-[#EDEDE8] text-[11px]">{selectedRecord.conflict_summary}</p>
                </div>
              ) : (
                <div className="p-4 border-2 border-[#3FB950] bg-[#3FB950]/10 space-y-1">
                  <div className="text-[#3FB950] font-bold">✓ MULTI-AGENCY CONSENSUS CONFIRMED</div>
                  <p className="text-[#EDEDE8] text-[11px]">All reporting channels corroborate the same ground truth facts.</p>
                </div>
              )}

              {/* Multi-Agency Breakdown Table */}
              <div>
                <span className="font-bold text-[#FFB800] uppercase block mb-2">
                  MULTI-SOURCE AGENCY CLAIMS & WEIGHTS:
                </span>
                <div className="border-2 border-[#EDEDE8]/30 divide-y divide-[#EDEDE8]/20">
                  {selectedRecord.agency_breakdown.map((agency) => (
                    <div key={agency.source_type} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <strong className="uppercase text-[#EDEDE8] block">{agency.source_type}</strong>
                        <span className="text-[10px] text-[#EDEDE8]/60">
                          {agency.report_count} report(s) • Trust Weight: {(agency.trust_weight * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-right font-bold">
                        <span className="text-[#EDEDE8]/60 text-[10px] block">CASUALTY CLAIM</span>
                        <span className="text-[#E5484D]">
                          {agency.consensus_claim !== null && agency.consensus_claim !== undefined
                            ? agency.consensus_claim
                            : "NONE"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unified Consensus Ground Truth */}
              <div className="border-2 border-[#EDEDE8] p-4 bg-[#EDEDE8]/5 space-y-2">
                <span className="text-[#FFB800] font-bold block uppercase">
                  UNIFIED RECONCILED TRUTH TEXT:
                </span>
                <p className="font-body-prose text-xs text-[#EDEDE8]">
                  "{selectedRecord.representative_truth_text}"
                </p>
                <div className="border-t border-[#EDEDE8]/20 pt-2 flex justify-between text-[11px] text-[#EDEDE8]/70">
                  <span>RESOLVED CASUALTIES: <strong className="text-[#EDEDE8]">{selectedRecord.unified_casualty_estimate}</strong></span>
                  <span>DAMAGE TAG: <strong className="text-[#EDEDE8] uppercase">{selectedRecord.consensus_damage_type}</strong></span>
                </div>
              </div>
            </div>
          ) : (
            <p className="font-mono-data text-xs text-[#EDEDE8]/50">
              Select an incident cluster to dissect agency dispute logs.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
