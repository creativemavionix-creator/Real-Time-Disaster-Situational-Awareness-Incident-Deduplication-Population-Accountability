"use client";

import React, { useEffect, useState } from "react";
import {
  fetchDispatchDashboard,
  assignMission,
  DispatchDashboardResponse,
  TacticalDispatchRecommendation,
} from "@/lib/api";

export default function DispatchPage() {
  const [data, setData] = useState<DispatchDashboardResponse | null>(null);
  const [selectedRec, setSelectedRec] = useState<TacticalDispatchRecommendation | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [justification, setJustification] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchDispatchDashboard();
      setData(res);
      if (!selectedRec && res.recommendations.length > 0) {
        setSelectedRec(res.recommendations[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dispatch telemetry");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRec || !selectedUnitId || !justification.trim()) return;

    setIsDeploying(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const mission = await assignMission({
        target_location_id: selectedRec.target_sector_id,
        assigned_unit_id: selectedUnitId,
        justification: justification.trim(),
      });

      setSuccessMsg(`Mission ${mission.mission_code} authorized: Unit deployed to ${selectedRec.target_sector_name}!`);
      setJustification("");
      setSelectedUnitId(null);
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to dispatch unit");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="border-b-4 border-[#EDEDE8] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
            CAPABILITY 05 // TACTICAL RESOURCE DISPATCH
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-[#EDEDE8]">
            TACTICAL DISPATCH ENGINE
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-[#EDEDE8]/70 mt-1 max-w-2xl">
            Automated priority allocation engine for deploying scarce Search & Rescue (SAR) heavy battalions, MI-17 air ambulances, and hydraulic clearing machinery to high-risk zones.
          </p>
        </div>

        <div className="flex gap-4 font-mono-data text-xs">
          <div className="border-2 border-[#3FB950] p-3 bg-[#3FB950]/10">
            <span className="text-[10px] text-[#3FB950] block font-bold">AVAILABLE ASSETS</span>
            <strong className="text-xl text-[#EDEDE8]">{data?.available_units_count || 0} UNITS</strong>
          </div>
          <div className="border-2 border-[#FFB800] p-3 bg-[#FFB800]/10">
            <span className="text-[10px] text-[#FFB800] block font-bold">ACTIVE MISSIONS</span>
            <strong className="text-xl text-[#EDEDE8]">{data?.active_missions_count || 0} DEPLOYED</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-[#E5484D]/10 border-2 border-[#E5484D] p-4 font-mono-data text-xs text-[#E5484D]">
          [DISPATCH_ERROR]: {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-[#3FB950]/10 border-2 border-[#3FB950] p-4 font-mono-data text-xs text-[#3FB950]">
          ✓ {successMsg}
        </div>
      )}

      {/* Main Grid: Priority Deployment Queue (7 Cols) & Dispatch Console (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Priority Recommendation Queue (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-2">
            PRIORITY RANKED DEPLOYMENT QUEUE:
          </div>

          {data?.recommendations.map((rec, index) => {
            const isSelected = selectedRec?.target_sector_id === rec.target_sector_id;

            return (
              <div
                key={rec.target_sector_id}
                onClick={() => setSelectedRec(rec)}
                className={`border-4 p-5 cursor-pointer transition-all select-none ${
                  isSelected
                    ? "border-[#FFB800] bg-[#EDEDE8]/10 shadow-2xl scale-[1.01]"
                    : "border-[#EDEDE8] bg-[#0A0A0A] hover:border-[#EDEDE8]/80"
                }`}
              >
                <div className="flex items-center justify-between border-b-2 border-[#EDEDE8]/20 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono-data text-xs font-bold text-[#FFB800]">
                      #{index + 1} PRIORITY
                    </span>
                    <h3 className="font-display text-xl font-bold uppercase text-[#EDEDE8]">
                      {rec.target_sector_name}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#EDEDE8]/60 font-mono-data block">SCORE</span>
                    <strong className="font-mono-data text-lg text-[#E5484D] font-bold">
                      {rec.priority_score} / 100
                    </strong>
                  </div>
                </div>

                <p className="font-body-prose text-xs text-[#EDEDE8]/80 mb-3">
                  {rec.rationale}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EDEDE8]/20 pt-3 font-mono-data text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#EDEDE8]/60">RECOMMENDED ASSETS:</span>
                    <div className="flex gap-1">
                      {rec.recommended_unit_types.map((t) => (
                        <span key={t} className="px-1.5 py-0.2 bg-[#EDEDE8]/10 border border-[#EDEDE8]/30 uppercase text-[9px]">
                          {t.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    ASSIGNED: <strong className="text-[#FFB800]">{rec.assigned_missions_count}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Mission Dispatch Console (5 Cols) */}
        <div className="lg:col-span-5 border-4 border-[#EDEDE8] p-6 bg-[#0A0A0A] space-y-6">
          <div className="border-b-2 border-[#EDEDE8]/30 pb-3">
            <span className="font-mono-data text-[10px] text-[#FFB800] uppercase font-bold tracking-widest block mb-1">
              MISSION DISPATCH CONSOLE
            </span>
            <h3 className="font-display text-2xl font-black uppercase text-[#EDEDE8]">
              DEPLOY ASSET TO {selectedRec?.target_sector_name.toUpperCase()}
            </h3>
          </div>

          {selectedRec ? (
            <form onSubmit={handleDispatch} className="space-y-4 font-mono-data text-xs">
              <div>
                <label className="block text-[#EDEDE8]/70 mb-1">SELECT SPECIALIZED RESOURCE UNIT *</label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {data?.resource_units
                    .filter((u) => u.status === "available")
                    .map((unit) => (
                      <div
                        key={unit.id}
                        onClick={() => setSelectedUnitId(unit.id)}
                        className={`p-3 border-2 cursor-pointer transition-colors ${
                          selectedUnitId === unit.id
                            ? "border-[#FFB800] bg-[#FFB800]/10 text-[#EDEDE8]"
                            : "border-[#EDEDE8]/30 bg-[#0A0A0A] hover:border-[#EDEDE8] text-[#EDEDE8]/80"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{unit.unit_code}</span>
                          <span className="text-[10px] text-[#3FB950] uppercase">AVAILABLE</span>
                        </div>
                        <div className="text-xs text-[#EDEDE8] mt-0.5">{unit.unit_name}</div>
                        <div className="text-[10px] text-[#EDEDE8]/60 mt-1">
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
                  className="w-full bg-[#0A0A0A] border-2 border-[#EDEDE8] p-3 text-[#EDEDE8] font-mono-data text-xs focus:border-[#FFB800] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isDeploying || !selectedUnitId || !justification.trim()}
                className="w-full bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] p-4 font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] disabled:opacity-50"
              >
                {isDeploying ? "AUTHORIZING MISSION..." : "AUTHORIZE DISPATCH [↵]"}
              </button>
            </form>
          ) : (
            <p className="font-mono-data text-xs text-[#EDEDE8]/50">
              Select a target sector to open dispatch controls.
            </p>
          )}

          {/* Active Missions Log */}
          <div className="border-t-2 border-[#EDEDE8]/20 pt-4 space-y-3 font-mono-data text-xs">
            <span className="text-[#FFB800] font-bold block uppercase text-[10px]">
              RECENT DEPLOYMENT MISSIONS:
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data?.active_missions.map((m, idx) => (
                <div key={`${m.mission_code}-${idx}`} className="p-2.5 border border-[#EDEDE8]/20 bg-[#EDEDE8]/5 text-[11px]">
                  <div className="flex justify-between font-bold text-[#EDEDE8]">
                    <span>{m.mission_code}</span>
                    <span className="text-[#FFB800] uppercase">{m.status}</span>
                  </div>
                  <div className="text-[10px] text-[#EDEDE8]/70 mt-0.5">
                    Target: {m.target_location_name} • Unit: {m.assigned_unit_name}
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
