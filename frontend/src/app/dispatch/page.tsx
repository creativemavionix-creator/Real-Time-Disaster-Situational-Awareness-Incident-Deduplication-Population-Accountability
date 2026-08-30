"use client";

import React, { useEffect, useState } from "react";
import {
  fetchDispatchDashboard,
  assignMission,
  DispatchDashboardResponse,
} from "@/lib/api";
import { useViewMode } from "@/context/ViewModeContext";

export default function DispatchPage() {
  const [data, setData] = useState<DispatchDashboardResponse | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [justification, setJustification] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
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
      <div className="border-b border-[#E5E4DC] dark:border-[#232733] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono-data text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
            03 // TACTICAL DISPATCH & RESOURCE ALLOCATION
          </div>
          <h1 className="font-display-calm font-extrabold text-3xl sm:text-4xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
            Tactical Resource Dispatch Queue
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-[#5C6270] dark:text-[#9CA3AF] max-w-2xl leading-relaxed">
            Priority-ranked tactical dispatch queue allocating scarce Urban SAR Battalions, Air Ambulances, Hydraulic Excavators, and Field Hospitals where risk and population exposure are highest.
          </p>
        </div>

        <div className="font-mono-data text-xs text-[#5C6270] text-left md:text-right">
          ACTIVE MISSIONS: <strong className="text-[#2563EB] dark:text-[#60A5FA] font-bold text-sm">{data?.active_missions_count || 0}</strong>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-mono-data text-[#E11D48]">
          [DISPATCH_ERROR]: {error}
        </div>
      )}

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border font-mono-data text-xs ${
            feedbackMsg.type === "success"
              ? "bg-[#059669]/10 border-[#059669]/30 text-[#059669] dark:text-[#34D399]"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-[#E11D48]"
          }`}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* Main Grid: Priority Queue Left (7) + Dispatch Console Right (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Ranked Priority Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="font-mono-data text-xs text-[#5C6270] font-bold uppercase tracking-wider">
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
                  className={`surface-calm p-5 cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-[#2563EB] shadow-md"
                      : isTopPriority
                      ? "border-rose-300 dark:border-rose-900/60"
                      : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E4DC] dark:border-[#232733] pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg font-mono-data text-xs font-bold ${
                          rIdx === 0
                            ? "bg-[#E11D48] text-[#FFFFFF]"
                            : rIdx === 1
                            ? "bg-[#D97706] text-[#FFFFFF]"
                            : "bg-[#F2F0E8] dark:bg-[#13161D] text-[#5C6270]"
                        }`}
                      >
                        RANK #{rIdx + 1}
                      </span>
                      <h3 className="font-display-calm font-extrabold text-lg text-[#111318] dark:text-[#F4F4F0]">
                        {rec.target_sector_name}
                      </h3>
                    </div>

                    <div className="font-mono-data text-xs text-[#5C6270]">
                      PRIORITY SCORE: <strong className="text-base text-[#2563EB] dark:text-[#60A5FA] font-bold">{rec.priority_score.toFixed(1)}</strong>
                    </div>
                  </div>

                  <p className="font-body-prose text-xs sm:text-sm text-[#5C6270] dark:text-[#9CA3AF] mb-3">
                    {rec.rationale}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-xs font-mono-data text-[#5C6270] dark:text-[#9CA3AF]">
                    <div>
                      RECOMMENDED: <strong className="text-[#111318] dark:text-[#F4F4F0] uppercase">{rec.recommended_unit_types.join(", ").replace(/_/g, " ")}</strong>
                    </div>

                    <span className="text-[#2563EB] dark:text-[#60A5FA] font-bold">
                      {rec.assigned_missions_count} ACTIVE MISSIONS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Mission Dispatch Console */}
        <div className="lg:col-span-5 surface-calm p-6 sm:p-8 space-y-6">
          <div>
            <div className="font-mono-data text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider mb-1">
              TACTICAL AUTHORIZATION CONSOLE
            </div>
            <h2 className="font-display-calm font-extrabold text-2xl text-[#111318] dark:text-[#F4F4F0]">
              Deploy to {selectedRec?.target_sector_name || "Select Sector"}
            </h2>
            <div className="text-xs font-mono-data text-[#5C6270] mt-1">
              RECOMMENDED ASSETS: <strong className="text-[#2563EB] dark:text-[#60A5FA] uppercase">{selectedRec?.recommended_unit_types.join(", ").replace(/_/g, " ")}</strong>
            </div>
          </div>

          {selectedRec ? (
            <form onSubmit={handleDispatch} className="space-y-4 font-mono-data text-xs">
              <div>
                <label className="block text-[#5C6270] font-bold mb-1.5">SELECT SPECIALIZED RESOURCE UNIT *</label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {data?.resource_units
                    .filter((u) => u.status === "available")
                    .map((unit) => (
                      <div
                        key={unit.id}
                        onClick={() => setSelectedUnitId(unit.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedUnitId === unit.id
                            ? "border-[#2563EB] bg-[#2563EB]/5 dark:bg-[#2563EB]/10 text-[#111318] dark:text-[#F4F4F0] shadow-xs"
                            : "border-[#E5E4DC] dark:border-[#232733] bg-[#FAF9F5] dark:bg-[#0C0E12] hover:border-[#94A3B8] text-[#5C6270] dark:text-[#9CA3AF]"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{unit.unit_code}</span>
                          <span className="text-[10px] text-[#059669] dark:text-[#34D399] uppercase">AVAILABLE</span>
                        </div>
                        <div className="text-xs font-bold text-[#111318] dark:text-[#F4F4F0] mt-0.5">{unit.unit_name}</div>
                        <div className="text-[10px] text-[#5C6270] mt-1">
                          Base: {unit.home_base} • Capacity: {unit.capacity}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-[#5C6270] font-bold mb-1.5">TACTICAL DIRECTIVE & JUSTIFICATION *</label>
                <textarea
                  rows={3}
                  required
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="e.g. Immediate structural rescue at collapsed commercial block..."
                  className="w-full bg-[#FAF9F5] dark:bg-[#0C0E12] border border-[#E5E4DC] dark:border-[#232733] rounded-lg p-3 text-[#111318] dark:text-[#F4F4F0] font-body-prose text-xs focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isDeploying || !selectedUnitId || !justification.trim()}
                className="w-full btn-action-primary text-xs py-3.5 tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {isDeploying ? "AUTHORIZING MISSION..." : "AUTHORIZE DISPATCH [↵]"}
              </button>
            </form>
          ) : (
            <div className="py-16 text-center font-mono-data text-xs text-[#5C6270]">
              SELECT A TARGET SECTOR TO INITIALIZE DISPATCH.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
