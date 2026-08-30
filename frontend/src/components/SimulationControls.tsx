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
    <div className="sticky top-[57px] z-40 bg-white/90 dark:bg-[#090D16]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Left: Replay Clock & Counts */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          <div className="bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
            <span>TIMELINE:</span>
            <span className="text-cyan-700 dark:text-cyan-300 font-bold">
              T+{elapsed.toFixed(1)}h / 24.0h
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden xl:block">
            SIMULATED: <strong>{simTime ? new Date(simTime).toISOString().replace(".000Z", "Z") : "2026-08-30T06:00:00Z"}</strong>
          </div>

          {/* Counts Badges */}
          <div className="flex flex-wrap items-center gap-1 text-[11px]">
            <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full font-semibold">
              SAFE: {summaryCounts.verified_safe ?? 0}
            </span>
            <span className="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 px-2.5 py-0.5 rounded-full font-semibold">
              DAMAGED: {summaryCounts.verified_damaged ?? 0}
            </span>
            <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-2.5 py-0.5 rounded-full font-semibold">
              UNVERIFIED: {summaryCounts.unverified ?? 0}
            </span>
            <span className="bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 px-2.5 py-0.5 rounded-full font-semibold">
              BLACKOUT: {summaryCounts.blackout ?? 0}
            </span>
          </div>
        </div>

        {/* Right: Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => onAdvanceHours(1.0)}
            disabled={isLoading}
            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-[#0088A9] hover:text-white px-3 py-1.5 rounded-full font-bold uppercase transition-all border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer shadow-xs"
            title="Advance simulated time by 1 hour"
          >
            +1.0H STEP
          </button>

          <button
            onClick={() => onAdvanceHours(4.0)}
            disabled={isLoading}
            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-[#0088A9] hover:text-white px-3 py-1.5 rounded-full font-bold uppercase transition-all border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer shadow-xs"
            title="Advance simulated time by 4 hours"
          >
            +4.0H JUMP
          </button>

          <button
            onClick={onReset}
            disabled={isLoading}
            className="bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-full uppercase transition-all border border-slate-200 dark:border-slate-700 disabled:opacity-50 cursor-pointer"
            title="Reset replay clock back to disaster start T0"
          >
            RESET T0
          </button>

          <button
            onClick={onSeed}
            disabled={isLoading}
            className="bg-transparent text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 px-3 py-1.5 rounded-full uppercase transition-all border border-cyan-200 dark:border-cyan-800 disabled:opacity-50 cursor-pointer"
            title="Re-seed synthetic dataset into database"
          >
            RE-SEED
          </button>

          <button
            onClick={onToggleAutoPoll}
            className={`px-3 py-1.5 rounded-full font-bold uppercase transition-all border cursor-pointer ${
              autoPoll
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-transparent text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            POLL: {autoPoll ? "LIVE" : "PAUSED"}
          </button>
        </div>

      </div>
    </div>
  );
}
