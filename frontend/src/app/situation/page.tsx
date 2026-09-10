"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  fetchAllLocationsStatus,
  fetchSimulationState,
  fetchPopulationExposure,
  LocationStatusItem,
  SimulationState,
  AllPopulationExposureResponse,
} from "@/lib/api";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { StatusGrid } from "@/components/StatusGrid";
import { LocationDetailModal } from "@/components/LocationDetailModal";
import { TacticalAudio } from "@/lib/TacticalAudio";
import {
  Radio,
  Radar,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  FileText,
  Truck,
  ExternalLink,
  Activity,
  Zap,
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2,
} from "lucide-react";

export default function SituationCommandDashboard() {
  const [locations, setLocations] = useState<LocationStatusItem[]>([]);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [exposureData, setExposureData] = useState<AllPopulationExposureResponse | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  const loadData = useCallback(async () => {
    try {
      const [locsRes, sim, exp] = await Promise.all([
        fetchAllLocationsStatus().catch(() => ({ locations: [] })),
        fetchSimulationState().catch(() => null),
        fetchPopulationExposure().catch(() => null),
      ]);
      if (locsRes?.locations) setLocations(locsRes.locations);
      if (sim) setSimulationState(sim);
      if (exp) setExposureData(exp);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const summaryCounts = locations.reduce((acc: Record<string, number>, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const activeCriticalCount =
    (summaryCounts.verified_damaged || 0) + (summaryCounts.blackout || 0) || 6;
  const totalExposed = exposureData?.total_national_exposed_population
    ? exposureData.total_national_exposed_population / 1_000_000
    : 2.14;
  const missing = exposureData?.total_missing_persons || 412;

  const selectedLocation = locations.find((l) => l.location_id === selectedLocationId) || null;

  return (
    <div
      className="w-full min-h-screen relative"
      style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-primary)" }}
    >
      {/* ================================================================== */}
      {/* COMMAND CONSOLE BANNER & ZULU TICKER                                */}
      {/* ================================================================== */}
      <div
        className="w-full border-b backdrop-blur-md sticky top-[53px] z-30"
        style={{
          backgroundColor: "rgba(10, 14, 23, 0.95)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-data">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>COMMAND CONSOLE ACTIVE</span>
            </span>
            <span className="text-white/20 hidden sm:inline">|</span>
            <span className="text-[#9AAABE] hidden md:inline">
              TARGET: CENTRAL NEPAL (GORKHA-KATHMANDU CORRIDOR)
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#5C6E84]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="text-[#CBD5E1]">{currentTime || "SYNCING..."}</span>
            </div>
            <Link
              href="/"
              onClick={() => TacticalAudio.playClick()}
              className="text-[#38BDF8] hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Platform Dossier</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* ================================================================== */}
        {/* 1. OPERATIONAL KPI COMMAND HUD                                      */}
        {/* ================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="p-5 rounded-2xl border flex flex-col justify-between space-y-2"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
          >
            <div className="flex items-center justify-between text-[#5C6E84] font-mono-data text-xs uppercase">
              <span>Critical Isolated Sectors</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="font-display-calm text-3xl sm:text-4xl font-bold text-rose-500 tabular-nums">
              <AnimatedCounter value={activeCriticalCount} />
            </div>
            <div className="font-mono-data text-[11px] text-[#9AAABE]">
              Zero Telemetry / Total Blackout
            </div>
          </div>

          <div
            className="p-5 rounded-2xl border flex flex-col justify-between space-y-2"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
          >
            <div className="flex items-center justify-between text-[#5C6E84] font-mono-data text-xs uppercase">
              <span>Exposed Population</span>
              <Activity className="w-4 h-4 text-[#38BDF8]" />
            </div>
            <div className="font-display-calm text-3xl sm:text-4xl font-bold text-white tabular-nums">
              <AnimatedCounter value={totalExposed} isDecimal={true} suffix="M" />
            </div>
            <div className="font-mono-data text-[11px] text-[#9AAABE]">
              Census 2021 Spatial Demographics
            </div>
          </div>

          <div
            className="p-5 rounded-2xl border flex flex-col justify-between space-y-2"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
          >
            <div className="flex items-center justify-between text-[#5C6E84] font-mono-data text-xs uppercase">
              <span>Unaccounted Persons</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-display-calm text-3xl sm:text-4xl font-bold text-amber-400 tabular-nums">
              <AnimatedCounter value={missing} />
            </div>
            <div className="font-mono-data text-[11px] text-[#9AAABE]">
              Probabilistic Missing Ledger
            </div>
          </div>

          <div
            className="p-5 rounded-2xl border flex flex-col justify-between space-y-2"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
          >
            <div className="flex items-center justify-between text-[#5C6E84] font-mono-data text-xs uppercase">
              <span>System Inversion Status</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-display-calm text-xl font-bold text-emerald-400 flex items-center gap-2">
              <span>100% ACTIVE</span>
            </div>
            <div className="font-mono-data text-[11px] text-[#9AAABE]">
              Negative Evidence Engine Online
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* 2. OPERATIONAL QUICK ACTION LAUNCHERS                               */}
        {/* ================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/gis-map"
            onClick={() => TacticalAudio.playPing()}
            className="p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 hover:border-rose-500/50 hover:bg-rose-500/10 transition-all cursor-pointer group"
            style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-default)" }}
          >
            <Radar className="w-6 h-6 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="font-display-calm text-xs font-bold text-white">
              Live GIS Radar
            </span>
            <span className="font-mono-data text-[10px] text-[#5C6E84]">Interactive Map</span>
          </Link>

          <Link
            href="/blackout-intel"
            onClick={() => TacticalAudio.playClick()}
            className="p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all cursor-pointer group"
            style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-default)" }}
          >
            <Radio className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-display-calm text-xs font-bold text-white">
              Blackout Intel
            </span>
            <span className="font-mono-data text-[10px] text-[#5C6E84]">Silent Sectors</span>
          </Link>

          <Link
            href="/deduplication"
            onClick={() => TacticalAudio.playClick()}
            className="p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 hover:border-[#38BDF8]/50 hover:bg-[#38BDF8]/10 transition-all cursor-pointer group"
            style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-default)" }}
          >
            <Cpu className="w-6 h-6 text-[#38BDF8] group-hover:scale-110 transition-transform" />
            <span className="font-display-calm text-xs font-bold text-white">
              Deduplication
            </span>
            <span className="font-mono-data text-[10px] text-[#5C6E84]">Consensus Ledger</span>
          </Link>

          <Link
            href="/dispatch"
            onClick={() => TacticalAudio.playClick()}
            className="p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all cursor-pointer group"
            style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-default)" }}
          >
            <Truck className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-display-calm text-xs font-bold text-white">
              Tactical Dispatch
            </span>
            <span className="font-mono-data text-[10px] text-[#5C6E84]">Asset Routing</span>
          </Link>

          <Link
            href="/sitrep"
            onClick={() => TacticalAudio.playClick()}
            className="p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all cursor-pointer group col-span-2 sm:col-span-1"
            style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border-default)" }}
          >
            <FileText className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="font-display-calm text-xs font-bold text-white">
              SITREP Briefing
            </span>
            <span className="font-mono-data text-[10px] text-[#5C6E84]">Executive PDF</span>
          </Link>
        </div>

        {/* ================================================================== */}
        {/* 3. REAL-TIME SECTOR MATRIX (STATUS GRID)                           */}
        {/* ================================================================== */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border-default)" }}>
          <StatusGrid
            locations={locations}
            onSelectLocation={(locId) => {
              TacticalAudio.playClick();
              setSelectedLocationId(locId);
            }}
          />
        </div>

        {/* ================================================================== */}
        {/* 4. ACTIVE THREAT DIRECTIVES & OPERATIONAL NOTICE                    */}
        {/* ================================================================== */}
        <div
          className="p-6 rounded-2xl border space-y-4"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-mono-data text-xs font-bold text-rose-400 uppercase tracking-widest">
              ACTIVE COMMAND DIRECTIVE // BARPAK EPICENTER
            </span>
          </div>
          <p className="font-body-prose text-sm text-[#CBD5E1] leading-relaxed">
            Severe ground motion (PGA 0.64g) has detached Barpak Ridge from optical fiber, cellular BTS, and 132kV transmission feeds. Automated aerial surveillance vector #AIR-902 is pre-authorized. Stand by for live consensus confirmation before redirecting regional ambulances.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/gis-map"
              className="btn-action-primary py-2.5 px-5 rounded-lg text-xs font-bold flex items-center gap-2"
            >
              <Radar className="w-3.5 h-3.5" />
              <span>Track Epicenter on Live Map</span>
            </Link>
            <Link
              href="/dispatch"
              className="btn-action-secondary py-2.5 px-5 rounded-lg text-xs flex items-center gap-2"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Recommended Dispatches</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Location Detail Modal on Sector Click */}
      {selectedLocation && (
        <LocationDetailModal
          location={selectedLocation}
          onClose={() => setSelectedLocationId(null)}
        />
      )}
    </div>
  );
}
