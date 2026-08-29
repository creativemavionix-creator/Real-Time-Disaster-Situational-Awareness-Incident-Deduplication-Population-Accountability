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
  const [selectedRec, setSelectedRec] = useState<TacticalDispatchRecommendation | null>(null);
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
      if (!selectedRec && res.recommendations.length > 0) {
        setSelectedRec(res.recommendations[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load tactical dispatch data");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

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
      <div className="border-b border-[#EDEDE8]/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
            03 // TACTICAL DISPATCH & RESOURCE ALLOCATION
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#EDEDE8]">
            WHERE SHOULD WE RESPOND FIRST?
          </h1>
          <p className="font-body-prose text-sm text-[#EDEDE8]/70 mt-1 max-w-2xl leading-relaxed">
            Priority-ranked tactical dispatch queue allocating scarce Urban SAR Battalions, Air Ambulances, Hydraulic Excavators, and Field Hospitals where risk and population exposure are highest.
          </p>
        </div>

        <div className="font-mono-data text-xs text-[#EDEDE8]/60 text-left md:text-right">
          ACTIVE MISSIONS: <strong className="text-[#FFB800]">{data?.active_missions_count || 0}</strong>
        </div>
      </div>

      {error && (
        <div className="bg-[#E5484D]/10 border border-[#E5484D] p-4 font-mono-data text-xs text-[#E5484D]">
          [DISPATCH_ERROR]: {error}
        </div>
      )}

      {feedbackMsg && (
        <div
          className={`p-4 border font-mono-data text-xs ${
            feedbackMsg.type === "success"
              ? "bg-[#3FB950]/10 border-[#3FB950] text-[#3FB950]"
              : "bg-[#E5484D]/10 border-[#E5484D] text-[#E5484D]"
          }`}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Ranked Priority Queue (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="font-mono-data text-xs text-[#EDEDE8]/70 font-bold uppercase tracking-wider">
            PRIORITY DEPLOYMENT QUEUE // 8 SECTORS
          </div>

          <div className="space-y-3">
            {data?.recommendations.map((rec, rIdx) => {
              const isSelected = selectedRec?.target_sector_id === rec.target_sector_id;
              const isTopPriority = rIdx < 2;

              return (
                <div
                  key={rec.target_sector_id}
                  onClick={() => setSelectedRec(rec)}
                  className={`surface-card p-5 cursor-pointer transition-all ${
                    isSelected
                      ? "surface-card-active shadow-md"
                      : isTopPriority
                      ? "surface-card-critical"
                      : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EDEDE8]/10 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 font-mono-data text-xs font-bold border ${
                          rIdx === 0
                            ? "bg-[#E5484D]/10 border-[#E5484D] text-[#E5484D]"
                            : rIdx === 1
                            ? "bg-[#FFB800]/10 border-[#FFB800] text-[#FFB800]"
                            : "bg-[#EDEDE8]/5 border-[#EDEDE8]/20 text-[#EDEDE8]"
                        }`}
                      >
                        RANK #{rIdx + 1}
                      </span>
                      <h3 className="font-display text-lg font-bold text-[#EDEDE8]">
                        {rec.target_sector_name}
                      </h3>
                    </div>

                    <div className="font-mono-data text-xs">
                      PRIORITY SCORE: <strong className="text-base text-[#FFB800] font-bold">{rec.priority_score.toFixed(1)}</strong>
                    </div>
                  </div>

                  <p className="font-body-prose text-xs sm:text-sm text-[#EDEDE8]/80 mb-3">
                    {rec.rationale}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-xs font-mono-data text-[#EDEDE8]/60">
                    <div>
                      RECOMMENDED: <strong className="text-[#EDEDE8] uppercase">{rec.recommended_unit_types.join(", ").replace(/_/g, " ")}</strong>
                    </div>

                    <span className="text-[#FFB800] font-bold">
                      {rec.assigned_missions_count} ACTIVE MISSIONS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Mission Dispatch Console (5 Columns) */}
        <div className="lg:col-span-5 surface-card p-6 space-y-6">
          <div>
            <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
              TACTICAL AUTHORIZATION CONSOLE
            </div>
            <h2 className="font-display text-2xl font-bold text-[#EDEDE8]">
              Deploy to {selectedRec?.target_sector_name || "Select Sector"}
            </h2>
            <div className="text-xs font-mono-data text-[#EDEDE8]/60 mt-1">
              RECOMMENDED ASSETS: <strong className="text-[#FFB800] uppercase">{selectedRec?.recommended_unit_types.join(", ").replace(/_/g, " ")}</strong>
            </div>
          </div>

          {selectedRec ? (
            <form onSubmit={handleDispatch} className="space-y-4 font-mono-data text-xs">
              <div>
                <label className="block text-[#EDEDE8]/70 mb-1">SELECT SPECIALIZED RESOURCE UNIT *</label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {data?.resource_units
                    .filter((u) => u.status === "available")
                    .map((unit) => (
                      <div
                        key={unit.id}
                        onClick={() => setSelectedUnitId(unit.id)}
                        className={`p-3 border cursor-pointer transition-colors ${
                          selectedUnitId === unit.id
                            ? "border-[#FFB800] bg-[#FFB800]/10 text-[#EDEDE8]"
                            : "border-[#EDEDE8]/20 bg-[#0A0A0A] hover:border-[#EDEDE8]/40 text-[#EDEDE8]/80"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{unit.unit_code}</span>
                          <span className="text-[10px] text-[#3FB950] uppercase">AVAILABLE</span>
                        </div>
                        <div className="text-xs text-[#EDEDE8] mt-0.5">{unit.unit_name}</div>
                        <div className="text-[10px] text-[#EDEDE8]/50 mt-1">
                          Base: {unit.home_base} • Capacity: {unit.capacity}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-[#EDEDE8]/70 mb-1">TACTICAL DIRECTIVE & JUSTIFICATION *</label>
                <textarea
                  rows={3}
                  required
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="e.g. Immediate structural rescue at collapsed commercial block..."
                  className="w-full bg-[#0A0A0A] border border-[#EDEDE8]/30 p-3 text-[#EDEDE8] font-body-prose text-xs focus:border-[#FFB800] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isDeploying || !selectedUnitId || !justification.trim()}
                className="w-full bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] p-3.5 font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeploying ? "AUTHORIZING MISSION..." : "AUTHORIZE DISPATCH [↵]"}
              </button>
            </form>
          ) : (
            <p className="font-mono-data text-xs text-[#EDEDE8]/50">
              Select a target sector to open dispatch controls.
            </p>
          )}

          {/* Progressive Disclosure: Why This Priority? */}
          {selectedRec && (
            <div className="pt-3 border-t border-[#EDEDE8]/10 space-y-3 font-mono-data text-xs">
              <button
                onClick={() => setShowFormula(!showFormula)}
                className="text-[#FFB800] text-xs font-bold hover:underline flex items-center justify-between w-full cursor-pointer"
              >
                <span>{showFormula ? "▼ HIDE" : "► VIEW"} WHY THIS PRIORITY?</span>
                <span className="text-[#EDEDE8]/40 text-[10px]">
                  {showFormula ? "COLLAPSE" : "EXPAND"}
                </span>
              </button>

              {(showFormula || isAnalysis) && (
                <div className="space-y-2 p-3 bg-[#EDEDE8]/3 border border-[#EDEDE8]/10 text-[11px] text-[#EDEDE8]/80 animate-fade-in">
                  <div className="flex justify-between">
                    <span className="text-[#EDEDE8]/60">RAW PRIORITY SCORE:</span>
                    <strong className="text-[#FFB800]">{selectedRec.priority_score.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#EDEDE8]/60">ACTIVE MISSIONS DEPLOYED:</span>
                    <strong className="text-[#EDEDE8]">{selectedRec.assigned_missions_count}</strong>
                  </div>
                  <div className="text-[10px] text-[#EDEDE8]/50 pt-1 border-t border-[#EDEDE8]/10">
                    Formula: (ThreatRisk * log10(ExposedPop) * (1 + Isolation)) / (Missions + 1)
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Missions Log */}
          <div className="border-t border-[#EDEDE8]/10 pt-4 space-y-3 font-mono-data text-xs">
            <span className="text-[#EDEDE8]/50 font-bold block uppercase text-[10px]">
              RECENT DEPLOYMENT MISSIONS ({data?.active_missions.length || 0}):
            </span>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data?.active_missions.map((m, idx) => (
                <div key={`${m.mission_code}-${idx}`} className="p-2.5 border border-[#EDEDE8]/15 bg-[#EDEDE8]/2 text-[11px]">
                  <div className="flex justify-between font-bold text-[#EDEDE8]">
                    <span>{m.mission_code}</span>
                    <span className="text-[#FFB800] uppercase text-[10px]">{m.status}</span>
                  </div>
                  <div className="text-[10px] text-[#EDEDE8]/60 mt-0.5">
                    Target: {m.target_location_name || m.target_location_id} • Unit: {m.assigned_unit_name || `Unit #${m.assigned_unit_id}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
