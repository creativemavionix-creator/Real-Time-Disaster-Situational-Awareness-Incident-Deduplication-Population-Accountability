import React from "react";
import { SimulationState } from "@/lib/api";

interface FloatingCommandBarProps {
  simulationState: SimulationState | null;
  activeCriticalCount: number;
  totalExposedMillion: number;
  worstSectorName: string;
  onAdvanceHours: (hours: number) => void;
  isLoading: boolean;
}

export function FloatingCommandBar({
  simulationState,
  activeCriticalCount,
  totalExposedMillion,
  worstSectorName,
  onAdvanceHours,
  isLoading
}: FloatingCommandBarProps) {
  return (
    <div className="pointer-events-auto flex items-center justify-between gap-8 px-8 py-5 backdrop-blur-3xl bg-[#0C0E12]/80 border border-white/10 rounded-2xl w-full shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-10">
        <div>
          <div className="font-mono-data text-[9px] text-[#64748B] uppercase tracking-[0.2em] mb-1">Time Elapsed</div>
          <div className="font-display-calm font-medium text-[15px] text-[#F3F4F6] tracking-tight">T+{simulationState?.elapsed_hours || 0} HOURS</div>
        </div>
        <div className="w-[1px] h-8 bg-white/10" />
        <div>
          <div className="font-mono-data text-[9px] text-[#64748B] uppercase tracking-[0.2em] mb-1">Critical Sectors</div>
          <div className="font-display-calm font-medium text-[15px] text-[#E11D48] flex items-center gap-2 tracking-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse" />
            {activeCriticalCount} ACTIVE
          </div>
        </div>
        <div className="w-[1px] h-8 bg-white/10" />
        <div>
          <div className="font-mono-data text-[9px] text-[#64748B] uppercase tracking-[0.2em] mb-1">Exposed Pop</div>
          <div className="font-display-calm font-medium text-[15px] text-[#F3F4F6] tracking-tight">{totalExposedMillion.toFixed(2)}M</div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button 
          onClick={() => onAdvanceHours(6)}
          disabled={isLoading}
          className="font-mono-data text-[10px] uppercase tracking-[0.15em] text-[#94A3B8] hover:text-[#F3F4F6] transition-colors cursor-pointer disabled:opacity-50"
        >
          Advance +6H
        </button>
      </div>
    </div>
  );
}
