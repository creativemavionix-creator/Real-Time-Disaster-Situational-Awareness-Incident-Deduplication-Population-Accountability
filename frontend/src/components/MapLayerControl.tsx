"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Eye,
  EyeOff,
  Radio,
  Activity,
  MapPin,
  Compass,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface MapLayerVisibility {
  showH3Grid: boolean;
  showHazardOverlays: boolean;
  showPropagationPath: boolean;
  showSilentHalos: boolean;
  showCorridors: boolean;
  showSatelliteLayer: boolean;
  baseMapStyle: "opentopo" | "satellite" | "dark";
}

interface MapLayerControlProps {
  layers: MapLayerVisibility;
  onChangeLayers: (newLayers: MapLayerVisibility) => void;
  className?: string;
}

export default function MapLayerControl({
  layers,
  onChangeLayers,
  className = "",
}: MapLayerControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const toggleLayer = (key: keyof Omit<MapLayerVisibility, "baseMapStyle">) => {
    onChangeLayers({
      ...layers,
      [key]: !layers[key],
    });
  };

  const setBaseMap = (style: "opentopo" | "satellite" | "dark") => {
    onChangeLayers({
      ...layers,
      baseMapStyle: style,
    });
  };

  return (
    <div className={`relative z-30 font-mono-data select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0C0E12]/85 backdrop-blur-xl border border-white/10 text-white text-xs hover:border-white/20 transition-all shadow-2xl cursor-pointer hover:bg-[#12161F]"
      >
        <Layers className="w-4 h-4 text-[#60A5FA]" />
        <span className="tracking-wider uppercase font-semibold">Map Layers</span>
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 opacity-60" /> : <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
      </button>

      {/* Dropdown Control Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute top-12 left-0 w-72 rounded-2xl bg-[#090B0E]/95 backdrop-blur-2xl border border-white/15 p-4 text-xs shadow-2xl text-[#F3F4F6] space-y-4"
          >
            {/* Basemap Switcher */}
            <div className="space-y-2">
              <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest flex items-center gap-1.5 font-bold">
                <Compass className="w-3 h-3 text-[#60A5FA]" />
                Basemap Relief
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5">
                <button
                  type="button"
                  onClick={() => setBaseMap("opentopo")}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    layers.baseMapStyle === "opentopo"
                      ? "bg-[#2563EB] text-white shadow-lg"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  Relief
                </button>
                <button
                  type="button"
                  onClick={() => setBaseMap("satellite")}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    layers.baseMapStyle === "satellite"
                      ? "bg-[#2563EB] text-white shadow-lg"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  Satellite
                </button>
                <button
                  type="button"
                  onClick={() => setBaseMap("dark")}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    layers.baseMapStyle === "dark"
                      ? "bg-[#2563EB] text-white shadow-lg"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  Obsidian
                </button>
              </div>
            </div>

            {/* Layer Toggles */}
            <div className="space-y-2">
              <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest flex items-center gap-1.5 font-bold">
                <Layers className="w-3 h-3 text-[#E11D48]" />
                Tactical Overlays
              </div>

              <div className="space-y-1.5">
                {/* H3 Hexagons */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]/60 border border-[#3B82F6]" />
                    <span className="text-[11px]">H3 Res-8 Hexagons</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layers.showH3Grid}
                    onChange={() => toggleLayer("showH3Grid")}
                    className="accent-[#3B82F6] cursor-pointer"
                  />
                </label>

                {/* Hazard Extent Overlays */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60 border border-[#EF4444]" />
                    <span className="text-[11px]">Physical Hazard Extent</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layers.showHazardOverlays}
                    onChange={() => toggleLayer("showHazardOverlays")}
                    className="accent-[#EF4444] cursor-pointer"
                  />
                </label>

                {/* Propagation Path */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-0.5 bg-[#F59E0B]" />
                    <span className="text-[11px]">Disaster Flow Vectors</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layers.showPropagationPath}
                    onChange={() => toggleLayer("showPropagationPath")}
                    className="accent-[#F59E0B] cursor-pointer"
                  />
                </label>

                {/* Silent Zone Halos */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
                    <span className="text-[11px]">Pulsing Silent Halos</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layers.showSilentHalos}
                    onChange={() => toggleLayer("showSilentHalos")}
                    className="accent-[#EF4444] cursor-pointer"
                  />
                </label>

                {/* Highway Lifelines */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-0.5 bg-[#FBBF24]" />
                    <span className="text-[11px]">Highway Lifeline Corridors</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layers.showCorridors}
                    onChange={() => toggleLayer("showCorridors")}
                    className="accent-[#FBBF24] cursor-pointer"
                  />
                </label>

                {/* UNOSAT Satellite Points */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E11D48] border border-white" />
                    <span className="text-[11px]">UNOSAT Damage Points</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layers.showSatelliteLayer}
                    onChange={() => toggleLayer("showSatelliteLayer")}
                    className="accent-[#E11D48] cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Toggle Map Legend */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowLegend(!showLegend)}
                className="w-full flex items-center justify-between py-1 text-[10px] text-[#60A5FA] hover:underline cursor-pointer"
              >
                <span>{showLegend ? "Hide Map Legend" : "Show Tactical Map Legend"}</span>
                <Info className="w-3 h-3" />
              </button>

              {showLegend && (
                <div className="mt-2 p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-2 text-[10px] text-[#94A3B8]">
                  <div className="font-bold text-white uppercase tracking-wider">Hazard Contours:</div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    <span>MMI VIII+ (Violent Collapse &gt;0.45g)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                    <span>MMI VII (Very Strong Structural 0.22-0.45g)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
                    <span>MMI VI (Moderate Alarming 0.10-0.22g)</span>
                  </div>
                  <div className="font-bold text-white uppercase tracking-wider pt-1 border-t border-white/5">
                    H3 Cells &amp; Silent Zones:
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444] animate-pulse" />
                    <span>Pulsing Crimson: Critical Silent Blackout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706]" />
                    <span>Amber: Degraded Telemetry / Moderate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#059669]" />
                    <span>Green: Monitored Operational / Safe</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
