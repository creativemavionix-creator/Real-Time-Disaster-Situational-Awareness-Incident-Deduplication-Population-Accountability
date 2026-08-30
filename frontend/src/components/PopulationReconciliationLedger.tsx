"use client";

import React, { useEffect, useState } from "react";
import {
  fetchReconciliationLedger,
  confirmReconciliationMatch,
  ReconciliationLedgerResponse,
} from "@/lib/api";

export function PopulationReconciliationLedger() {
  const [data, setData] = useState<ReconciliationLedgerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"split_view" | "auto_matches" | "review_queue">("split_view");

  const loadLedger = async () => {
    try {
      const res = await fetchReconciliationLedger();
      setData(res);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const handleConfirm = async (missingId: number, checkinId: number) => {
    try {
      await confirmReconciliationMatch(missingId, checkinId);
      setFeedback(`✓ Match confirmed. Victim status updated to 'Located Safe / Hospitalized'.`);
      await loadLedger();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 text-center font-mono-data text-xs text-[#5C6270] animate-pulse">
        [INITIALIZING_PROBABILISTIC_RECONCILIATION_LEDGER...]
      </div>
    );
  }

  return (
    <div className="surface-calm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E4DC] dark:border-[#232733] pb-4">
        <div>
          <div className="font-mono-data text-xs text-[#059669] dark:text-[#34D399] font-bold uppercase tracking-wider mb-1">
            03 // PROBABILISTIC ENTITY RESOLUTION
          </div>
          <h2 className="font-display-calm font-extrabold text-2xl sm:text-3xl text-[#111318] dark:text-[#F4F4F0]">
            Missing vs. Found Reconciliation Ledger
          </h2>
          <p className="font-body-prose text-xs text-[#5C6270] dark:text-[#9CA3AF] mt-1">
            Hybrid scoring combining Jaro-Winkler phonetic similarity, attribute cosine token overlap, and age delta penalty.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 font-mono-data text-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("split_view")}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
              activeTab === "split_view"
                ? "bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12]"
                : "surface-calm text-[#5C6270]"
            }`}
          >
            SPLIT-VIEW TABLES
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("auto_matches")}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
              activeTab === "auto_matches"
                ? "bg-[#059669] text-[#FFFFFF]"
                : "surface-calm text-[#5C6270]"
            }`}
          >
            ✓ AUTO-MATCHES ({data.auto_matched_count})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("review_queue")}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
              activeTab === "review_queue"
                ? "bg-[#D97706] text-[#FFFFFF]"
                : "surface-calm text-[#5C6270]"
            }`}
          >
            ⚠ REVIEW QUEUE ({data.suggested_review_count})
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-[#059669]/10 border border-[#059669]/30 text-xs font-mono-data text-[#059669] dark:text-[#34D399]">
          {feedback}
        </div>
      )}

      {/* VIEW 1: Split-View Tables */}
      {activeTab === "split_view" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono-data text-xs">
          {/* Left Table: Missing Ledger */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[#5C6270] font-bold uppercase border-b border-[#E5E4DC] dark:border-[#232733] pb-2">
              <span>MISSING INQUIRIES LEDGER ({data.missing_records.length})</span>
              <span className="text-[10px]">FAMILY & RESCUE REPORTS</span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {data.missing_records.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-[#111318] dark:text-[#F4F4F0] text-sm">{m.full_name}</strong>
                    <span className={m.status === "located_safe" ? "chip-safe" : m.status === "hospitalized" ? "chip-warning" : "chip-critical"}>
                      {m.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#5C6270]">
                    Sector: <strong className="uppercase text-[#2563EB] dark:text-[#60A5FA]">{m.last_known_location_name || m.last_known_location_id}</strong> | Age: {m.age || "?"} | {m.gender || "Unknown"}
                  </div>
                  {m.physical_description && (
                    <div className="text-[10px] text-[#5C6270] italic truncate">
                      &quot;{m.physical_description}&quot;
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Table: Found Shelter & Hospital Intake Ledger */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[#5C6270] font-bold uppercase border-b border-[#E5E4DC] dark:border-[#232733] pb-2">
              <span>SHELTER & HOSPITAL INTAKE LEDGER ({data.found_checkins.length})</span>
              <span className="text-[10px]">VERIFIED FIELD CHECK-INS</span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {data.found_checkins.map((c) => (
                <div
                  key={c.checkin_id}
                  className="p-3.5 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-[#111318] dark:text-[#F4F4F0] text-sm">{c.person_name}</strong>
                    <span className="chip-safe">{c.health_status.replace("_", " ")}</span>
                  </div>

                  <div className="text-[11px] text-[#5C6270]">
                    Facility: <strong className="text-[#111318] dark:text-[#F4F4F0]">{c.facility_name}</strong> | Age: {c.age || "?"}
                  </div>
                  {c.identifying_features && (
                    <div className="text-[10px] text-[#5C6270] italic truncate">
                      &quot;{c.identifying_features}&quot;
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
          <div className="text-[#5C6270] font-bold uppercase">
            HIGH-CONFIDENCE PROBABILISTIC MATCHES (MATCH SCORE &gt; 0.85)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.auto_reconciled_matches.map((m, idx) => (
              <div
                key={idx}
                className="surface-calm p-5 space-y-3 border-l-4 border-l-[#059669]"
              >
                <div className="flex justify-between items-center border-b border-[#E5E4DC] dark:border-[#232733] pb-2">
                  <span className="font-bold text-xs text-[#059669] dark:text-[#34D399]">
                    ✓ AUTO-RECONCILED ({(m.match_score * 100).toFixed(0)}% MATCH)
                  </span>
                  <span className="text-[10px] text-[#5C6270]">JARO-WINKLER + ATTR</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#5C6270] block">MISSING INQUIRY:</span>
                    <strong className="text-[#111318] dark:text-[#F4F4F0]">{m.missing_name}</strong> ({m.missing_age}y)
                    <div className="text-[10px] text-[#5C6270] italic mt-0.5">&quot;{m.missing_desc}&quot;</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#5C6270] block">FOUND INTAKE:</span>
                    <strong className="text-[#059669] dark:text-[#34D399]">{m.found_name}</strong> ({m.found_age}y)
                    <div className="text-[10px] text-[#111318] dark:text-[#F4F4F0] font-bold mt-0.5">{m.found_facility}</div>
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
          <div className="text-[#5C6270] font-bold uppercase">
            OPERATOR REVIEW QUEUE (MATCH SCORE 0.65 - 0.84)
          </div>

          <div className="space-y-3">
            {data.suggested_matches_queue.map((m, idx) => (
              <div
                key={idx}
                className="surface-calm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-[#D97706]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#D97706] dark:text-[#FBBF24]">
                      SUGGESTED MATCH ({(m.match_score * 100).toFixed(0)}% SIMILARITY)
                    </span>
                  </div>

                  <div className="text-xs text-[#111318] dark:text-[#F4F4F0]">
                    Missing: <strong>{m.missing_name}</strong> ({m.missing_age}y) ↔ Found: <strong>{m.found_name}</strong> ({m.found_age}y) at <strong>{m.found_facility}</strong>
                  </div>

                  <div className="text-[10px] text-[#5C6270]">
                    Notes: Missing in {m.missing_sector.toUpperCase()} • &quot;{m.missing_desc}&quot; vs &quot;{m.found_desc}&quot;
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleConfirm(m.missing_person_id, m.checkin_id)}
                  className="btn-action-primary text-xs py-2 px-4 whitespace-nowrap cursor-pointer self-start sm:self-auto"
                >
                  ✓ CONFIRM MATCH
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
