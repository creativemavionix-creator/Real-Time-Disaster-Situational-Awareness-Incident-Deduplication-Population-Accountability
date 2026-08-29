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
    <div className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#EDEDE8]/10 p-4 sm:px-10 lg:px-14">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Left: Replay Clock & Timeline Status */}
        <div className="flex flex-wrap items-center gap-3 font-mono-data text-xs">
          <div className="bg-[#EDEDE8]/10 border border-[#EDEDE8]/20 text-[#EDEDE8] px-3.5 py-1.5 font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FFB800]" />
            <span>TIMELINE:</span>
            <span className="text-[#FFB800] font-bold">
              T+{elapsed.toFixed(1)}h / 24.0h
            </span>
          </div>

          <div className="text-[11px] text-[#EDEDE8]/60 hidden md:block">
            SIMULATED TIME: <strong className="text-[#EDEDE8]">{simTime ? new Date(simTime).toISOString().replace(".000Z", "Z") : "2026-08-30T06:00:00Z"}</strong>
          </div>

          {/* Status Counts Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="bg-[#3FB950]/10 text-[#3FB950] border border-[#3FB950]/30 px-2 py-0.5 font-medium">
              SAFE: {summaryCounts.verified_safe ?? 0}
            </span>
            <span className="bg-[#E5484D]/10 text-[#E5484D] border border-[#E5484D]/30 px-2 py-0.5 font-medium">
              DAMAGED: {summaryCounts.verified_damaged ?? 0}
            </span>
            <span className="bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/30 px-2 py-0.5 font-medium">
              UNVERIFIED: {summaryCounts.unverified ?? 0}
            </span>
            <span className="bg-[#E5484D]/10 text-[#E5484D] border border-[#E5484D]/30 px-2 py-0.5 font-medium">
              BLACKOUT: {summaryCounts.blackout ?? 0}
            </span>
          </div>
        </div>

        {/* Right: Simulation Replay Controls & Poll Toggle */}
        <div className="flex flex-wrap items-center gap-2 font-mono-data text-xs">
          <button
            onClick={() => onAdvanceHours(1.0)}
            disabled={isLoading}
            className="bg-[#EDEDE8]/10 text-[#EDEDE8] hover:bg-[#EDEDE8] hover:text-[#0A0A0A] px-3 py-1.5 font-bold uppercase transition-colors border border-[#EDEDE8]/20 disabled:opacity-50 cursor-pointer"
            title="Advance simulated time by 1 hour"
          >
            +1.0H STEP
          </button>

          <button
            onClick={() => onAdvanceHours(4.0)}
            disabled={isLoading}
            className="bg-[#EDEDE8]/10 text-[#EDEDE8] hover:bg-[#EDEDE8] hover:text-[#0A0A0A] px-3 py-1.5 font-bold uppercase transition-colors border border-[#EDEDE8]/20 disabled:opacity-50 cursor-pointer"
            title="Advance simulated time by 4 hours"
          >
            +4.0H JUMP
          </button>

          <button
            onClick={onReset}
            disabled={isLoading}
            className="bg-transparent text-[#EDEDE8]/70 hover:text-[#EDEDE8] hover:bg-[#EDEDE8]/10 px-3 py-1.5 uppercase transition-colors border border-[#EDEDE8]/20 disabled:opacity-50 cursor-pointer"
            title="Reset replay clock back to disaster start T0"
          >
            RESET T0
          </button>

          <button
            onClick={onSeed}
            disabled={isLoading}
            className="bg-transparent text-[#FFB800] hover:bg-[#FFB800]/10 px-3 py-1.5 uppercase transition-colors border border-[#FFB800]/30 disabled:opacity-50 cursor-pointer"
            title="Re-seed synthetic dataset into database"
          >
            RE-SEED
          </button>

          <button
            onClick={onToggleAutoPoll}
            className={`px-3 py-1.5 font-bold uppercase transition-colors border cursor-pointer ${
              autoPoll
                ? "bg-[#3FB950]/15 text-[#3FB950] border-[#3FB950]/40"
                : "bg-transparent text-[#EDEDE8]/40 border-[#EDEDE8]/20"
            }`}
          >
            POLL: {autoPoll ? "LIVE" : "PAUSED"}
          </button>
        </div>

      </div>
    </div>
  );
}
