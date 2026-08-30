"use client";

import React, { useEffect, useState } from "react";
import {
  fetchDispatchDashboard,
  assignMission,
  DispatchDashboardResponse,
  TacticalDispatchRecommendation,
} from "@/lib/api";
import { useViewMode } from "@/context/ViewModeContext";

export default function DispatchPage() {
  const [data, setData] = useState<DispatchDashboardResponse | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [justification, setJustification] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAnalysis } = useViewMode();

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

  return (
    <div className="p-6 sm:p-10 lg:p-14 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="prism-badge-cyan">
            <span>03</span>
            <span>//</span>
            <span>TACTICAL DISPATCH & RESOURCE ALLOCATION</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            Tactical Resource Dispatch Queue
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Priority-ranked tactical dispatch queue allocating scarce Urban SAR Battalions, Air Ambulances, Hydraulic Excavators, and Field Hospitals where risk and population exposure are highest.
          </p>
        </div>

        <div className="font-mono text-xs text-slate-500 text-left md:text-right">
          ACTIVE MISSIONS: <strong className="text-cyan-600 dark:text-cyan-400 font-bold text-sm">{data?.active_missions_count || 0}</strong>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 rounded-2xl font-mono text-xs text-rose-700 dark:text-rose-300">
          [DISPATCH_ERROR]: {error}
        </div>
      )}

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border font-mono text-xs ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
          }`}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Ranked Priority Queue (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="font-mono text-xs text-slate-500 font-bold uppercase tracking-wider">
            PRIORITY DEPLOYMENT QUEUE // 8 SECTORS
          </div>

          <div className="space-y-3">
            {data?.recommendations.map((rec, rIdx) => {
              const isSelected = selectedRec?.target_sector_id === rec.target_sector_id;
              const isTopPriority = rIdx < 2;

              return (
                <div
                  key={rec.target_sector_id}
                  onClick={() => setSelectedSectorId(rec.target_sector_id)}
                  className={`prism-card p-5 cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-[#0088A9] shadow-md"
                      : isTopPriority
                      ? "border-rose-300 dark:border-rose-900/60"
                      : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
                          rIdx === 0
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                            : rIdx === 1
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        RANK #{rIdx + 1}
                      </span>
                      <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                        {rec.target_sector_name}
                      </h3>
                    </div>

                    <div className="font-mono text-xs text-slate-500">
                      PRIORITY SCORE: <strong className="text-base text-cyan-700 dark:text-cyan-400 font-bold">{rec.priority_score.toFixed(1)}</strong>
                    </div>
                  </div>

                  <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-3">
                    {rec.rationale}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                    <div>
                      RECOMMENDED: <strong className="text-slate-900 dark:text-white uppercase">{rec.recommended_unit_types.join(", ").replace(/_/g, " ")}</strong>
                    </div>

                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                      {rec.assigned_missions_count} ACTIVE MISSIONS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Mission Dispatch Console (5 Columns) */}
        <div className="lg:col-span-5 prism-card p-6 space-y-6">
          <div>
            <div className="prism-badge-cyan mb-1.5">
              <span>TACTICAL AUTHORIZATION CONSOLE</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
              Deploy to {selectedRec?.target_sector_name || "Select Sector"}
            </h2>
            <div className="text-xs font-mono text-slate-500 mt-1">
              RECOMMENDED ASSETS: <strong className="text-cyan-700 dark:text-cyan-400 uppercase">{selectedRec?.recommended_unit_types.join(", ").replace(/_/g, " ")}</strong>
            </div>
          </div>

          {selectedRec ? (
            <form onSubmit={handleDispatch} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">SELECT SPECIALIZED RESOURCE UNIT *</label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {data?.resource_units
                    .filter((u) => u.status === "available")
                    .map((unit) => (
                      <div
                        key={unit.id}
                        onClick={() => setSelectedUnitId(unit.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          selectedUnitId === unit.id
                            ? "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/40 text-slate-900 dark:text-white shadow-xs"
                            : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-400 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{unit.unit_code}</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase">AVAILABLE</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{unit.unit_name}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Base: {unit.home_base} • Capacity: {unit.capacity}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">TACTICAL DIRECTIVE & JUSTIFICATION *</label>
                <textarea
                  rows={3}
                  required
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="e.g. Immediate structural rescue at collapsed commercial block..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-body-prose text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isDeploying || !selectedUnitId || !justification.trim()}
                className="w-full btn-primary-cyan text-xs py-3.5 tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {isDeploying ? "AUTHORIZING MISSION..." : "AUTHORIZE DISPATCH [↵]"}
              </button>
            </form>
          ) : (
            <div className="py-16 text-center font-mono text-xs text-slate-400">
              SELECT A TARGET SECTOR TO INITIALIZE DISPATCH AUTHORIZATION.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
