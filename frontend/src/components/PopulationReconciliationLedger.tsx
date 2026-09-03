"use client";

import React, { useEffect, useState } from "react";
import {
  fetchReconciliationLedger,
  confirmReconciliationMatch,
  ReconciliationLedgerResponse,
} from "@/lib/api";
import { Users, CheckCircle2, AlertCircle, Eye, GitMerge, FileText } from "lucide-react";

export function PopulationReconciliationLedger() {
  const [data, setData] = useState<ReconciliationLedgerResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"split_view" | "auto_matches" | "review_queue">("split_view");
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchReconciliationLedger();
      setData(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirm = async (missingId: number, checkinId: number) => {
    try {
      await confirmReconciliationMatch(missingId, checkinId);
      setFeedback("✓ Record successfully reconciled and marked located!");
      await loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(`[ERROR]: ${err.message}`);
    }
  };

  if (!data) return null;

  return (
    <div className="surface-calm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="font-mono-data text-[10px] text-[#34D399] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <GitMerge className="w-3.5 h-3.5" />
            <span>06 // PROBABILISTIC ENTITY RESOLUTION</span>
          </div>
          <h2 className="font-display-calm font-medium text-2xl sm:text-3xl text-white">
            Missing vs. Found Reconciliation Ledger
          </h2>
          <p className="font-body-prose text-xs text-[#94A3B8] mt-1">
            Hybrid matching combining Jaro-Winkler phonetic similarity, attribute cosine token overlap, and age delta scoring.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 font-mono-data text-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("split_view")}
            className={`px-3.5 py-1.5 rounded-lg font-semibold cursor-pointer transition-all border ${
              activeTab === "split_view"
                ? "bg-white/10 text-white border-white/20 shadow-sm"
                : "text-[#94A3B8] border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            Split-View Tables
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("auto_matches")}
            className={`px-3.5 py-1.5 rounded-lg font-semibold cursor-pointer transition-all border ${
              activeTab === "auto_matches"
                ? "bg-emerald-500/20 text-[#34D399] border-emerald-500/40 shadow-sm"
                : "text-[#94A3B8] border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            Auto-Matches ({data.auto_matched_count})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("review_queue")}
            className={`px-3.5 py-1.5 rounded-lg font-semibold cursor-pointer transition-all border ${
              activeTab === "review_queue"
                ? "bg-amber-500/20 text-[#FBBF24] border-amber-500/40 shadow-sm"
                : "text-[#94A3B8] border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            Review Queue ({data.suggested_review_count})
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono-data text-[#34D399]">
          {feedback}
        </div>
      )}

      {/* VIEW 1: Split-View Tables */}
      {activeTab === "split_view" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono-data text-xs">
          {/* Left Table: Missing Ledger */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[#94A3B8] font-bold text-xs uppercase border-b border-white/10 pb-2">
              <span>Missing Inquiries Ledger ({data.missing_records.length})</span>
              <span className="text-[10px] text-[#64748B]">Family Inquiries</span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {data.missing_records.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 hover:border-white/15 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-white text-sm font-display-calm">{m.full_name}</strong>
                    <span className={m.status === "located_safe" ? "chip-safe text-[10px]" : m.status === "hospitalized" ? "chip-warning text-[10px]" : "chip-critical text-[10px]"}>
                      {m.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#94A3B8]">
                    Sector: <strong className="uppercase text-[#60A5FA]">{m.last_known_location_name || m.last_known_location_id}</strong> &bull; Age: {m.age || "?"} &bull; {m.gender || "Unknown"}
                  </div>
                  {m.physical_description && (
                    <div className="text-[10px] text-[#64748B] italic truncate">
                      &ldquo;{m.physical_description}&rdquo;
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Table: Found Shelter & Hospital Intake Ledger */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[#94A3B8] font-bold text-xs uppercase border-b border-white/10 pb-2">
              <span>Shelter &amp; Hospital Intake Ledger ({data.found_checkins.length})</span>
              <span className="text-[10px] text-[#64748B]">Field Check-ins</span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {data.found_checkins.map((c) => (
                <div
                  key={c.checkin_id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 hover:border-white/15 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-white text-sm font-display-calm">{c.person_name}</strong>
                    <span className="chip-safe text-[10px]">{c.health_status.replace("_", " ")}</span>
                  </div>

                  <div className="text-[11px] text-[#94A3B8]">
                    Facility: <strong className="text-white">{c.facility_name}</strong> &bull; Age: {c.age || "?"}
                  </div>
                  {c.identifying_features && (
                    <div className="text-[10px] text-[#64748B] italic truncate">
                      &ldquo;{c.identifying_features}&rdquo;
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Auto-Matches (> 0.85) */}
      {activeTab === "auto_matches" && (
        <div className="space-y-3 font-mono-data text-xs">
          <div className="text-[#94A3B8] font-bold uppercase tracking-wider">
            High-Confidence Matches (Score &ge; 0.85)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.auto_reconciled_matches.map((m, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 border-l-4 border-l-[#059669]"
              >
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="font-bold text-xs text-[#34D399]">
                    Auto-Reconciled ({(m.match_score * 100).toFixed(0)}% Match)
                  </span>
                  <span className="tag-provenance tag-derived">[DERIVED] JARO-WINKLER</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#64748B] block">Missing Record:</span>
                    <strong className="text-white">{m.missing_name}</strong> ({m.missing_age}y)
                    <div className="text-[10px] text-[#94A3B8] italic mt-0.5">&ldquo;{m.missing_desc}&rdquo;</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#64748B] block">Found Intake:</span>
                    <strong className="text-[#34D399]">{m.found_name}</strong> ({m.found_age}y)
                    <div className="text-[10px] text-white font-bold mt-0.5">{m.found_facility}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: Suggested Review Queue (0.65 - 0.84) */}
      {activeTab === "review_queue" && (
        <div className="space-y-3 font-mono-data text-xs">
          <div className="text-[#94A3B8] font-bold uppercase tracking-wider">
            Operator Review Queue (Match Score 0.65 &ndash; 0.84)
          </div>

          <div className="space-y-3">
            {data.suggested_matches_queue.map((m, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-[#D97706]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#FBBF24]">
                      Suggested Match ({(m.match_score * 100).toFixed(0)}% Similarity)
                    </span>
                    <span className="tag-provenance tag-simulated">[CANDIDATE]</span>
                  </div>

                  <div className="text-xs text-white">
                    Missing: <strong>{m.missing_name}</strong> ({m.missing_age}y) &harr; Found: <strong>{m.found_name}</strong> ({m.found_age}y) at <strong>{m.found_facility}</strong>
                  </div>

                  <div className="text-[10px] text-[#94A3B8]">
                    Notes: Missing in {m.missing_sector.toUpperCase()} &bull; &ldquo;{m.missing_desc}&rdquo; vs &ldquo;{m.found_desc}&rdquo;
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleConfirm(m.missing_person_id, m.checkin_id)}
                  className="btn-action-primary text-xs py-2 px-4 whitespace-nowrap cursor-pointer self-start sm:self-auto"
                >
                  Confirm Match
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
