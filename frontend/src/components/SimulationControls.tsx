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
    <div className="sticky top-0 z-40 bg-[#0A0A0A] border-b-rule p-4 md:px-8">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Left: Replay Clock & Timeline Status */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-[#EDEDE8] text-[#0A0A0A] px-4 py-2 font-mono-data text-sm font-bold flex items-center gap-2 border-2 border-[#EDEDE8]">
            <span className="inline-block w-2.5 h-2.5 bg-[#FFB800] animate-ping" />
            <span>REPLAY CLOCK:</span>
            <span className="text-[#0A0A0A] font-extrabold">
              T+{elapsed.toFixed(1)}h / 24.0h
            </span>
          </div>

          <div className="font-mono-data text-xs text-[#EDEDE8]/80 hidden sm:block">
            SIM_TIMESTAMP: <strong className="text-[#EDEDE8]">{simTime ? new Date(simTime).toISOString().replace(".000Z", "Z") : "2026-08-30T06:00:00Z"}</strong>
          </div>

          {/* Status Counts Badges */}
          <div className="flex flex-wrap items-center gap-2 font-mono-data text-xs">
            <span className="bg-[#3FB950]/20 text-[#3FB950] border-2 border-[#3FB950] px-2.5 py-1 font-bold">
              SAFE: {summaryCounts.verified_safe ?? 0}
            </span>
            <span className="bg-[#E5484D]/20 text-[#E5484D] border-2 border-[#E5484D] px-2.5 py-1 font-bold">
              DAMAGED: {summaryCounts.verified_damaged ?? 0}
            </span>
            <span className="bg-[#FFB800]/20 text-[#FFB800] border-2 border-[#FFB800] px-2.5 py-1 font-bold">
              UNVERIFIED: {summaryCounts.unverified ?? 0}
            </span>
            <span className="bg-[#E5484D]/20 text-[#E5484D] border-2 border-[#E5484D] px-2.5 py-1 font-bold">
              BLACKOUT: {summaryCounts.blackout ?? 0}
            </span>
          </div>
        </div>

        {/* Right: Simulation Replay Controls & Poll Toggle */}
        <div className="flex flex-wrap items-center gap-2 font-mono-data text-xs">
          <button
            onClick={() => onAdvanceHours(1.0)}
            disabled={isLoading}
            className="bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] hover:text-[#0A0A0A] px-3.5 py-2 font-bold uppercase transition-colors border-2 border-[#EDEDE8] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
            title="Advance simulated time by 1 hour"
          >
            +1.0H STEP
          </button>

          <button
            onClick={() => onAdvanceHours(4.0)}
            disabled={isLoading}
            className="bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] hover:text-[#0A0A0A] px-3.5 py-2 font-bold uppercase transition-colors border-2 border-[#EDEDE8] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
            title="Advance simulated time by 4 hours"
          >
            +4.0H JUMP
          </button>

          <button
            onClick={onReset}
            disabled={isLoading}
            className="bg-transparent text-[#EDEDE8] hover:bg-[#EDEDE8] hover:text-[#0A0A0A] px-3.5 py-2 font-bold uppercase transition-colors border-2 border-[#EDEDE8] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
            title="Reset replay clock back to disaster start T0"
          >
            RESET T0
          </button>

          <button
            onClick={onSeed}
            disabled={isLoading}
            className="bg-transparent text-[#FFB800] hover:bg-[#FFB800] hover:text-[#0A0A0A] px-3 py-2 font-bold uppercase transition-colors border-2 border-[#FFB800] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
            title="Re-seed synthetic dataset into database"
          >
            RE-SEED
          </button>

          <button
            onClick={onToggleAutoPoll}
            className={`px-3 py-2 font-bold uppercase transition-colors border-2 ${
              autoPoll
                ? "bg-[#3FB950] text-[#0A0A0A] border-[#3FB950]"
                : "bg-transparent text-[#EDEDE8]/60 border-[#EDEDE8]/40"
            }`}
          >
            POLLING: {autoPoll ? "LIVE (2.5s)" : "PAUSED"}
          </button>
        </div>

      </div>
    </div>
  );
}
