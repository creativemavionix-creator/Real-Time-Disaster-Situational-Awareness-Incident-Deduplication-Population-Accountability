"use client";

import React, { useEffect, useState } from "react";
import {
  fetchDispatchDashboard,
  assignMission,
  DispatchDashboardResponse,
} from "@/lib/api";
import { motion, Variants } from "framer-motion";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export default function DispatchPage() {
  const [data, setData] = useState<DispatchDashboardResponse | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [justification, setJustification] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchDispatchDashboard();
      setData(res);
      setSelectedSectorId((prev) => {
        if (prev && res.recommendations.some((r) => r.target_sector_id === prev)) {
          return prev;
        }
        return res.recommendations[0]?.target_sector_id || null;
      });
    } catch (err: any) {
      setError(err.message || "Failed to load tactical dispatch data");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const selectedRec =
    data?.recommendations.find((r) => r.target_sector_id === selectedSectorId) ||
    data?.recommendations[0] ||
    null;

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRec || !selectedUnitId || !justification.trim()) return;

    setIsDeploying(true);
    setFeedbackMsg(null);

    try {
      const res = await assignMission({
        target_location_id: selectedRec.target_sector_id,
        assigned_unit_id: selectedUnitId,
        justification: justification.trim(),
      });

      setFeedbackMsg({
        type: "success",
        text: `✓ Mission [${res.mission_code}] successfully authorized and dispatched to ${res.target_location_name || res.target_location_id}.`,
      });
      setJustification("");
      setSelectedUnitId(null);
      await loadData();
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: `[DISPATCH_ERROR]: ${err.message || "Failed to assign mission"}`,
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="flex-1 w-full p-6 sm:p-10 lg:p-14 space-y-8 relative overflow-hidden" style={{ backgroundColor: "var(--bg-void)" }}>
      
      {/* Decorative background glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none z-0"
        style={{ background: "var(--accent-subtle)" }}
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
            <div className="type-eyebrow">03 // Tactical Dispatch &amp; Resource Allocation</div>
            <h1 className="font-display-calm font-semibold tracking-tight" style={{ fontSize: "clamp(2rem, 4vw, var(--text-4xl))", color: "var(--fg-primary)", letterSpacing: "var(--ls-snug)" }}>
              Tactical Resource Dispatch
            </h1>
            <p className="type-body-sm" style={{ maxWidth: "55ch" }}>
              Priority-ranked tactical dispatch queue allocating scarce Urban SAR Battalions, Air Ambulances, and Field Hospitals where risk is highest.
            </p>
          </div>

          <div className="font-mono-data uppercase text-left md:text-right" style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--ls-wider)", color: "var(--fg-tertiary)" }}>
            Active Missions: <strong className="block mt-1 font-display-calm" style={{ fontSize: "var(--text-xl)", color: "var(--status-intel-text)" }}><AnimatedCounter value={data?.active_missions_count || 0} /></strong>
          </div>
        </motion.div>

        {error && (
          <motion.div variants={itemVars} className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-xs font-mono-data text-[#E11D48]">
            [DISPATCH_ERROR]: {error}
          </motion.div>
        )}

        {feedbackMsg && (
          <motion.div
            variants={itemVars}
            className="p-4 rounded-xl font-mono-data uppercase"
            style={{
              fontSize: "var(--text-xs)",
              letterSpacing: "var(--ls-wider)",
              background: feedbackMsg.type === "success" ? "var(--status-ok-bg)" : "var(--status-critical-bg)",
              border: feedbackMsg.type === "success" ? "1px solid var(--status-ok-border)" : "1px solid var(--status-critical-border)",
              color: feedbackMsg.type === "success" ? "var(--status-ok-text)" : "var(--status-critical-text)",
            }}
          >
            {feedbackMsg.text}
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Ranked Priority Queue */}
          <div className="lg:col-span-7 space-y-4">
            <motion.div variants={itemVars} className="font-mono-data text-[10px] text-[#64748B] font-bold uppercase tracking-[0.2em]">
              PRIORITY DEPLOYMENT QUEUE // 8 SECTORS
            </motion.div>

            <motion.div variants={containerVars} className="space-y-4">
              {data?.recommendations.map((rec, rIdx) => {
                const isSelected = selectedRec?.target_sector_id === rec.target_sector_id;
                const isTopPriority = rIdx < 2;

                return (
                  <motion.div
                    variants={itemVars}
                    key={rec.target_sector_id}
                    onClick={() => setSelectedSectorId(rec.target_sector_id)}
                    className="backdrop-blur-xl rounded-xl p-6 cursor-pointer transition-all"
                    style={{
                      background: "var(--bg-surface)",
                      border: isSelected ? "1px solid var(--status-intel)" : isTopPriority ? "1px solid var(--accent-border)" : "1px solid var(--border-subtle)",
                      boxShadow: isSelected ? "0 0 24px rgba(56,189,248,0.12)" : "none",
                      transform: isSelected ? "scale(1.01)" : "scale(1)",
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4" style={{ borderBottom: "1px solid var(--border-faint)" }}>
                      <div className="flex items-center gap-3">
                        <span
                          className="font-mono-data font-bold"
                          style={{
                            padding: "0.25rem 0.625rem",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "var(--text-2xs)",
                            letterSpacing: "var(--ls-wider)",
                            background: rIdx === 0 ? "var(--accent)" : rIdx === 1 ? "var(--status-warning-bg)" : "rgba(255,255,255,0.05)",
                            color: rIdx === 0 ? "#fff" : rIdx === 1 ? "var(--status-warning-text)" : "var(--fg-secondary)",
                            border: rIdx === 0 ? "none" : rIdx === 1 ? "1px solid var(--status-warning-border)" : "1px solid var(--border-subtle)",
                            boxShadow: rIdx === 0 ? "0 0 12px var(--accent-glow)" : "none",
                          }}
                        >
                          RANK #{rIdx + 1}
                        </span>
                        <h3 className="font-display-calm font-semibold" style={{ fontSize: "var(--text-xl)", color: "var(--fg-primary)" }}>
                          {rec.target_sector_name}
                        </h3>
                      </div>

                      <div className="font-mono-data uppercase flex flex-col items-end gap-1" style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--ls-wider)", color: "var(--fg-tertiary)" }}>
                        Priority Score
                        <strong className="font-display-calm" style={{ fontSize: "var(--text-xl)", color: "var(--status-intel-text)" }}><AnimatedCounter value={rec.priority_score} isDecimal={true} /></strong>
                      </div>
                    </div>

                    <p className="font-body-prose text-sm text-[#94A3B8] mb-4 leading-relaxed">
                      {rec.rationale}
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] font-mono-data tracking-wider uppercase text-[#94A3B8] bg-black/20 p-3 rounded-xl border border-white/5">
                      <div>
                        REC: <strong className="text-[#F3F4F6]">{rec.recommended_unit_types.join(", ").replace(/_/g, " ")}</strong>
                      </div>

                      <span className="text-[#60A5FA] font-bold">
                        {rec.assigned_missions_count} ACTIVE
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Right Column: Mission Dispatch Console */}
          <motion.div variants={itemVars} className="lg:col-span-5 bg-[#0C0E12]/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 space-y-8 sticky top-24 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div>
              <div className="font-mono-data text-[10px] text-[#60A5FA] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] animate-pulse" />
                AUTHORIZATION CONSOLE
              </div>
              <h2 className="font-display-calm font-medium text-3xl text-[#F3F4F6] leading-tight">
                Deploy to<br/>{selectedRec?.target_sector_name || "Select Sector"}
              </h2>
              <div className="text-[10px] tracking-[0.1em] font-mono-data text-[#94A3B8] mt-4 p-3 border border-white/5 bg-white/5 rounded-lg">
                REQUIRED ASSETS: <strong className="text-[#60A5FA] uppercase">{selectedRec?.recommended_unit_types.join(", ").replace(/_/g, " ")}</strong>
              </div>
            </div>

            {selectedRec ? (
              <form onSubmit={handleDispatch} className="space-y-6 font-mono-data text-xs">
                <div>
                  <label className="block text-[#94A3B8] text-[10px] tracking-[0.2em] uppercase mb-3">AVAILABLE RESOURCE UNITS *</label>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {data?.resource_units
                      .filter((u) => u.status === "available")
                      .map((unit) => (
                        <div
                          key={unit.id}
                          onClick={() => setSelectedUnitId(unit.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedUnitId === unit.id
                              ? "border-[#2563EB] bg-[#2563EB]/10 text-[#F3F4F6] shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                              : "border-white/10 bg-black/20 hover:border-white/30 text-[#94A3B8]"
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span className="tracking-wider">{unit.unit_code}</span>
                            <span className="text-[9px] text-[#34D399] tracking-[0.2em] uppercase bg-[#34D399]/10 px-2 py-1 rounded">AVAILABLE</span>
                          </div>
                          <div className="text-sm font-medium text-[#F3F4F6] mt-1 mb-2 font-display-calm tracking-wide">{unit.unit_name}</div>
                          <div className="text-[10px] text-[#64748B] flex items-center gap-2">
                            <span>Base: {unit.home_base}</span>
                            <span>&bull;</span>
                            <span>Cap: {unit.capacity}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#94A3B8] text-[10px] tracking-[0.2em] uppercase mb-3">TACTICAL JUSTIFICATION *</label>
                  <textarea
                    rows={3}
                    required
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="e.g. Immediate structural rescue at collapsed commercial block..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-[#F3F4F6] font-body-prose text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none transition-all placeholder:text-[#64748B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isDeploying || !selectedUnitId || !justification.trim()}
                  className={`w-full text-[11px] py-4 rounded-xl tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer ${
                    isDeploying || !selectedUnitId || !justification.trim()
                      ? "bg-white/5 text-[#64748B] border border-white/5 cursor-not-allowed"
                      : "bg-[#2563EB] text-white hover:bg-[#3B82F6] shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                  }`}
                >
                  {isDeploying ? "AUTHORIZING..." : "AUTHORIZE DISPATCH [↵]"}
                </button>
              </form>
            ) : (
              <div className="py-24 text-center font-mono-data text-[10px] uppercase tracking-[0.2em] text-[#64748B]">
                SELECT A TARGET SECTOR<br/>TO INITIALIZE DISPATCH.
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
