"use client";

import React, { useState } from "react";
import {
  DisasterCategory,
  ScenarioPreset,
  SimulationState,
} from "@/lib/api";
import {
  Activity,
  Waves,
  Wind,
  Mountain,
  Flame,
  Clock,
  RotateCcw,
  FastForward,
  Layers,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DisasterScenarioControlBarProps {
  simulationState: SimulationState | null;
  activeDisasterType: DisasterCategory;
  presets: ScenarioPreset[];
  activePresetId: string;
  activeWavefrontName?: string;
  onSelectDisaster: (disasterType: DisasterCategory) => void;
  onSelectPreset: (presetId: string) => void;
  onAdvanceHours: (hours: number) => void;
  onResetSimulation: () => void;
  isLoading: boolean;
}

const DISASTER_TABS: Array<{
  id: DisasterCategory;
  label: string;
  sublabel: string;
  icon: any;
  accentColor: string;
  badgeBg: string;
  borderColor: string;
}> = [
  {
    id: "earthquake",
    label: "Earthquake",
    sublabel: "M7.8 Seismic Thrust",
    icon: Activity,
    accentColor: "#EF4444",
    badgeBg: "rgba(239, 68, 68, 0.15)",
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  {
    id: "flash_flood",
    label: "Flash Flood",
    sublabel: "River Inundation",
    icon: Waves,
    accentColor: "#06B6D4",
    badgeBg: "rgba(6, 182, 212, 0.15)",
    borderColor: "rgba(6, 182, 212, 0.4)",
  },
  {
    id: "cyclone",
    label: "Cyclone & Gale",
    sublabel: "150 km/h Squall",
    icon: Wind,
    accentColor: "#8B5CF6",
    badgeBg: "rgba(139, 92, 246, 0.15)",
    borderColor: "rgba(139, 92, 246, 0.4)",
  },
  {
    id: "landslide",
    label: "Landslide",
    sublabel: "Debris Flow Choke",
    icon: Mountain,
    accentColor: "#F59E0B",
    badgeBg: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.4)",
  },
  {
    id: "urban_fire",
    label: "Urban Firestorm",
    sublabel: "Dense Core Blast",
    icon: Flame,
    accentColor: "#E11D48",
    badgeBg: "rgba(225, 29, 72, 0.15)",
    borderColor: "rgba(225, 29, 72, 0.4)",
  },
];

export default function DisasterScenarioControlBar({
  simulationState,
  activeDisasterType,
  presets,
  activePresetId,
  activeWavefrontName,
  onSelectDisaster,
  onSelectPreset,
  onAdvanceHours,
  onResetSimulation,
  isLoading,
}: DisasterScenarioControlBarProps) {
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);

  const activePreset = presets.find((p) => p.preset_id === activePresetId) || presets[0];
  const elapsed = simulationState?.elapsed_hours || 0;

  return (
    <div className="w-full bg-[#0C0E12]/95 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 shadow-2xl flex flex-col gap-2.5 select-none z-30">
      {/* Top Tier: Five Disaster Selectors & Preset Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Five Selectable Disaster Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mr-1.5 hidden sm:inline">
            DISASTER:
          </span>
          {DISASTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeDisasterType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectDisaster(tab.id)}
                disabled={isLoading}
                style={{
                  borderColor: isSelected ? tab.borderColor : "rgba(255,255,255,0.08)",
                  backgroundColor: isSelected ? tab.badgeBg : "rgba(255,255,255,0.02)",
                  boxShadow: isSelected ? `0 0 16px ${tab.badgeBg}` : "none",
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer text-left group ${
                  isSelected ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: isSelected ? tab.accentColor : "rgba(255,255,255,0.05)",
                    color: isSelected ? "#0C0E12" : tab.accentColor,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold leading-tight flex items-center gap-1">
                    {tab.label}
                    {isSelected && (
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-ping"
                        style={{ backgroundColor: tab.accentColor }}
                      />
                    )}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 leading-none">
                    {tab.sublabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Preset Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#141820] hover:bg-[#1A202C] border border-white/15 text-xs text-slate-200 font-semibold cursor-pointer shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-slate-400 font-normal">Scenario Preset:</span>
            <span className="text-white font-mono font-bold max-w-[160px] truncate">
              {activePreset?.title.split("(")[0] || "Custom Scenario"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isPresetDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-[#10141C] border border-white/20 rounded-xl shadow-2xl p-2 z-50 overflow-hidden"
              >
                <div className="px-2.5 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    OPERATIONAL SCENARIO PRESETS
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    5 PRESETS
                  </span>
                </div>

                <div className="space-y-1 max-h-72 overflow-y-auto scrollbar-thin">
                  {presets.map((preset) => {
                    const isPresetActive = preset.preset_id === activePresetId;
                    return (
                      <button
                        key={preset.preset_id}
                        type="button"
                        onClick={() => {
                          onSelectPreset(preset.preset_id);
                          setIsPresetDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isPresetActive
                            ? "bg-blue-600/15 border-blue-500/50 text-white"
                            : "bg-white/[0.02] border-transparent hover:bg-white/5 hover:border-white/10 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-white leading-tight">
                            {preset.title.split("(")[0]}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 uppercase">
                            {preset.disaster_type.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-1.5">
                          {preset.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                          <MapPin className="w-3 h-3 text-red-400" />
                          <span className="truncate">{preset.location_name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Tier: Timeline Scrubber & Active Wavefront Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
        {/* Timeline Indicator & Stage Progress */}
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#10131A] border border-white/10">
            <Clock className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
            <span className="text-[10px] font-mono text-slate-400">SIM TIME:</span>
            <span className="text-xs font-mono font-bold text-white">
              T+{elapsed.toFixed(1)}h
            </span>
          </div>

          {/* Timeline Stage Bar */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 px-0.5">
              <span>T0 (Origin)</span>
              <span>T+6h (Spread)</span>
              <span>T+12h (Blackout Peak)</span>
              <span>T+24h (Stabilization)</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (elapsed / 24.0) * 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Active Wavefront Callout */}
          {activeWavefrontName && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-slate-400">Front:</span>
              <strong className="text-white max-w-[150px] truncate">{activeWavefrontName}</strong>
            </div>
          )}
        </div>

        {/* Step Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onAdvanceHours(1.0)}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-mono font-semibold transition-all cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>+1 Hour</span>
          </button>

          <button
            type="button"
            onClick={() => onAdvanceHours(3.0)}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-mono font-semibold transition-all cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>+3 Hours</span>
          </button>

          <button
            type="button"
            onClick={onResetSimulation}
            disabled={isLoading}
            title="Reset Simulation Clock to T0"
            className="p-1.5 rounded-lg bg-[#141820] hover:bg-[#1C222E] border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
