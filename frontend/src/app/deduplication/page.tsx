"use client";

import React, { useEffect, useState } from "react";
import { fetchUnifiedTruth, UnifiedTruthResponse, UnifiedTruthRecord } from "@/lib/api";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export default function DeduplicationPage() {
  const [truthData, setTruthData] = useState<UnifiedTruthResponse | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);
  const [filterDisputedOnly, setFilterDisputedOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="flex-1 w-full bg-[#090B0E] p-6 sm:p-10 lg:p-14 space-y-8 relative overflow-hidden">
      
      {/* Decorative background glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-[#2563EB]/5 rounded-full blur-[120px] pointer-events-none z-0"
      />

      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto w-full space-y-8 relative z-10"
      >
        {/* Page Header */}
        <motion.div variants={itemVars} className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="font-mono-data text-[10px] text-[#60A5FA] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              02 // UNIFIED TRUTH & ENTITY RESOLUTION
            </div>
            <h1 className="font-display-calm font-medium text-4xl sm:text-5xl text-[#F3F4F6] tracking-tight">
              Incident Consensus Ledger
            </h1>
            <p className="font-body-prose text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
              Reconciles overlapping, exaggerated, or conflicting field logs across police channels, hospital emergency triage rosters, and crowdsourced civilian SMS.
            </p>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-2 font-mono-data text-xs">
            <button
              onClick={() => setFilterDisputedOnly(!filterDisputedOnly)}
              type="button"
              className={`px-4 py-2 rounded-lg font-semibold border transition-all cursor-pointer ${
                filterDisputedOnly
                  ? "bg-[#D97706]/10 border-[#D97706] text-[#FBBF24] shadow-[0_0_20px_rgba(217,119,6,0.2)]"
                  : "border-white/10 text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-white/5"
              }`}
            >
              {filterDisputedOnly ? "SHOWING CONFLICTS ONLY" : "SHOW ALL CLUSTERS"}
            </button>
          </div>
        </motion.div>

        {error && (
          <motion.div variants={itemVars} className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-xs font-mono-data text-[#E11D48]">
            [UNIFIED_TRUTH_ERROR]: {error}
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cluster Cards */}
          <div className="lg:col-span-7 space-y-4">
            <motion.div variants={itemVars} className="font-mono-data text-[10px] text-[#64748B] font-bold uppercase tracking-[0.2em] flex items-center justify-between">
              <span>RESOLVED CLUSTERS // {filteredRecords.length} TOTAL</span>
              <span>SIMULATED: {truthData?.simulated_time ? new Date(truthData.simulated_time).toLocaleTimeString() : "00:00:00"}</span>
            </motion.div>

            <motion.div variants={containerVars} className="space-y-3">
              {filteredRecords.map((cluster) => {
                const isSelected = selectedRecord?.cluster_id === cluster.cluster_id;

                return (
                  <motion.div
                    variants={itemVars}
                    key={cluster.cluster_id}
                    onClick={() => setSelectedClusterId(cluster.cluster_id)}
                    className={`bg-[#0C0E12]/80 backdrop-blur-xl border rounded-2xl p-6 cursor-pointer transition-all hover:bg-[#10131A] ${
                      isSelected ? "border-[#2563EB] shadow-[0_0_30px_rgba(37,99,235,0.15)] scale-[1.01]" : "border-white/5"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-4 mb-4">
                      <div className="flex items-center gap-3 font-mono-data text-xs">
                        <span className="font-bold text-sm text-[#F3F4F6]">
                          CLUSTER #{cluster.cluster_id}
                        </span>
                        <span className="px-2 py-1 rounded bg-white/5 text-[#94A3B8] text-[10px]">{cluster.consensus_damage_type}</span>
                      </div>

                      <div className="flex items-center gap-3 font-mono-data text-xs">
                        {cluster.has_conflicts ? (
                          <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold tracking-wider">CONFLICT DETECTED</span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold tracking-wider">CONSENSUS</span>
                        )}
                        <span className="font-bold text-[#34D399]">
                          <AnimatedCounter value={cluster.confidence_score * 100} duration={1000} suffix="%" />
                        </span>
                      </div>
                    </div>

                    <blockquote className="font-body-prose text-sm text-[#F3F4F6] italic mb-4 leading-relaxed opacity-90">
                      &ldquo;{cluster.representative_truth_text}&rdquo;
                    </blockquote>

                    <div className="flex flex-wrap items-center justify-between font-mono-data text-[11px] text-[#94A3B8] pt-3 border-t border-white/5">
                      <div>
                        SECTOR: <strong className="text-[#F3F4F6] uppercase tracking-wider">{cluster.sector_name}</strong>
                      </div>
                      <div>
                        CASUALTY ESTIMATE: <strong className="text-[#FB7185] text-base"><AnimatedCounter value={cluster.unified_casualty_estimate || 0} duration={1000} /></strong>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Right Column: In-Depth Resolution Dossier */}
          <motion.div variants={itemVars} className="lg:col-span-5 bg-[#0C0E12]/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 space-y-8 sticky top-24 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            {selectedRecord ? (
              <div className="space-y-8 font-mono-data text-xs">
                <div>
                  <div className="text-[10px] text-[#64748B] uppercase tracking-[0.2em] mb-2">
                    RESOLUTION DOSSIER // CLUSTER #{selectedRecord.cluster_id}
                  </div>
                  <h2 className="font-display-calm font-medium text-3xl text-[#F3F4F6]">
                    {selectedRecord.sector_name}
                  </h2>
                </div>

                {/* Dispute Range */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-[0.2em] font-bold block">
                    RECONCILED CASUALTY RANGE
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-display-calm font-medium text-[#FB7185]">
                      <AnimatedCounter value={selectedRecord.unified_casualty_estimate || 0} duration={1500} />
                    </div>
                    <div className="text-xs text-[#64748B] bg-black/50 px-3 py-1.5 rounded-lg border border-white/5">
                      Spread: [{selectedRecord.casualty_dispute_range[0]} — {selectedRecord.casualty_dispute_range[1]}]
                    </div>
                  </div>
                  <p className="font-body-prose text-xs text-[#94A3B8] leading-relaxed border-t border-white/5 pt-4">
                    {selectedRecord.conflict_summary}
                  </p>
                </div>

                {/* Multi-Agency Report Breakdown Table */}
                <div className="space-y-3">
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-[0.2em] font-bold block">
                    CONTRIBUTING AGENCY LOGS
                  </span>
                  <div className="rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full text-left text-xs bg-black/20">
                      <thead className="bg-white/5 border-b border-white/10 text-[#64748B] text-[9px] uppercase tracking-[0.1em]">
                        <tr>
                          <th className="p-4 font-medium">AGENCY</th>
                          <th className="p-4 font-medium">REPORTS</th>
                          <th className="p-4 font-medium">CLAIMED CASUALTIES</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedRecord.agency_breakdown.map((agency, aIdx) => (
                          <tr key={`${agency.source_type}-${aIdx}`} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 uppercase font-bold text-[#F3F4F6]">
                              {agency.source_type}
                            </td>
                            <td className="p-4 font-mono-data text-[#94A3B8]">{agency.report_count}</td>
                            <td className="p-4 font-bold text-[#FB7185]">
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
              <div className="py-24 text-center font-mono-data text-[10px] uppercase tracking-[0.2em] text-[#64748B]">
                SELECT AN INCIDENT CLUSTER<br/>TO INSPECT DOSSIER.
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
