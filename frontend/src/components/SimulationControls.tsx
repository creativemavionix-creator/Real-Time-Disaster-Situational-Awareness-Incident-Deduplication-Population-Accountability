"use client";

import React from "react";
import { SimulationState } from "@/lib/api";

interface SimulationControlsProps {
  simulationState: SimulationState | null;
  summaryCounts: {
    verified_safe?: number;
    verified_damaged?: number;
    unverified?: number;
    blackout?: number;
    [key: string]: number | undefined;
  };
  isLoading: boolean;
  autoPoll: boolean;
  onToggleAutoPoll: () => void;
  onAdvanceHours: (hours: number) => void;
  onReset: () => void;
  onSeed: () => void;
}

export function SimulationControls({
  simulationState,
  summaryCounts,
  isLoading,
  autoPoll,
  onToggleAutoPoll,
  onAdvanceHours,
  onReset,
  onSeed,
}: SimulationControlsProps) {
  const elapsed = simulationState ? simulationState.elapsed_hours : 0;
  const simTime = simulationState ? simulationState.simulated_time : "";

  return (
    <div className="sticky top-[58px] z-40 bg-[#FAF9F5]/90 dark:bg-[#0C0E12]/90 backdrop-blur-md border-b border-[#E5E4DC] dark:border-[#232733] px-4 sm:px-6 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Left: Replay Clock & Counts */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono-data text-xs">
          <div className="bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12] px-3 py-1 rounded-lg font-bold flex items-center gap-2 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-ping" />
            <span>TIMELINE:</span>
            <span>T+{elapsed.toFixed(1)}h / 24.0h</span>
          </div>

          <div className="text-[11px] text-[#5C6270] dark:text-[#9CA3AF] hidden xl:block">
            SIMULATED: <strong>{simTime ? new Date(simTime).toISOString().replace(".000Z", "Z") : "2026-08-30T06:00:00Z"}</strong>
          </div>

          {/* Counts Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="chip-safe text-[10px]">
              SAFE: {summaryCounts.verified_safe ?? 0}
            </span>
            <span className="chip-critical text-[10px]">
              DAMAGED: {summaryCounts.verified_damaged ?? 0}
            </span>
            <span className="chip-warning text-[10px]">
              UNVERIFIED: {summaryCounts.unverified ?? 0}
            </span>
            <span className="chip-neutral text-[10px]">
              BLACKOUT: {summaryCounts.blackout ?? 0}
            </span>
          </div>
        </div>

        {/* Right: Simulation Step & Reset Actions */}
        <div className="flex flex-wrap items-center gap-2 font-mono-data text-xs">
          <button
            onClick={() => onAdvanceHours(1.0)}
            disabled={isLoading}
            className="btn-action-secondary text-xs py-1.5 px-3 disabled:opacity-50 cursor-pointer"
            title="Advance simulated time by 1 hour"
          >
            +1.0H STEP
          </button>

          <button
            onClick={() => onAdvanceHours(4.0)}
            disabled={isLoading}
            className="btn-action-secondary text-xs py-1.5 px-3 disabled:opacity-50 cursor-pointer"
            title="Advance simulated time by 4 hours"
          >
            +4.0H JUMP
          </button>

          <button
            onClick={onReset}
            disabled={isLoading}
            className="text-[#5C6270] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#F4F4F0] px-2.5 py-1.5 text-xs uppercase cursor-pointer"
            title="Reset replay clock back to disaster start T0"
          >
            RESET T0
          </button>

          <button
            onClick={onSeed}
            disabled={isLoading}
            className="text-[#2563EB] dark:text-[#60A5FA] hover:underline px-2.5 py-1.5 text-xs font-bold uppercase cursor-pointer"
            title="Seed 100 realistic central Nepal crisis reports"
          >
            RE-SEED
          </button>

          <button
            onClick={onToggleAutoPoll}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border cursor-pointer ${
              autoPoll
                ? "bg-[#059669]/10 border-[#059669]/30 text-[#059669] dark:text-[#34D399]"
                : "border-[#E5E4DC] dark:border-[#232733] text-[#5C6270]"
            }`}
          >
            {autoPoll ? "POLLING 4s" : "PAUSED"}
          </button>
        </div>
      </div>
    </div>
  );
}
