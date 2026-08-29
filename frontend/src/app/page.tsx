"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  AllLocationsStatusResponse,
  LocationStatusItem,
  SimulationState,
  fetchAllLocationsStatus,
  fetchSimulationState,
  advanceSimulation,
  resetSimulation,
  seedDatabase,
} from "@/lib/api";
import { HeroFog } from "@/components/HeroFog";
import { SimulationControls } from "@/components/SimulationControls";
import { StatusGrid } from "@/components/StatusGrid";
import { LocationDetailModal } from "@/components/LocationDetailModal";
import { ReportInjectionForm } from "@/components/ReportInjectionForm";
import { SystemArchitecture } from "@/components/SystemArchitecture";

export default function Home() {
  const [locationsStatus, setLocationsStatus] = useState<LocationStatusItem[]>([]);
  const [summaryCounts, setSummaryCounts] = useState<{ [key: string]: number | undefined }>({});
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoPoll, setAutoPoll] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Poll status & simulation state
  const refreshData = useCallback(async () => {
    try {
      const [statusRes, simRes] = await Promise.all([
        fetchAllLocationsStatus(),
        fetchSimulationState(),
      ]);

      setLocationsStatus(statusRes.locations || []);
      setSummaryCounts(statusRes.summary_counts || {});
      setSimulationState(simRes);
      setBackendError(null);
    } catch (err: any) {
      setBackendError(err.message || "Cannot connect to backend on http://localhost:8000");
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Interval polling
  useEffect(() => {
    if (!autoPoll) return;
    const interval = setInterval(() => {
      refreshData();
    }, 2500);
    return () => clearInterval(interval);
  }, [autoPoll, refreshData]);

  // Advance simulation clock
  const handleAdvanceHours = async (hours: number) => {
    setIsLoading(true);
    try {
      await advanceSimulation(hours, 0);
      await refreshData();
    } catch (err: any) {
      setBackendError(err.message || "Failed to advance simulation");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset simulation clock
  const handleReset = async () => {
    setIsLoading(true);
    try {
      await resetSimulation();
      await refreshData();
    } catch (err: any) {
      setBackendError(err.message || "Failed to reset simulation");
    } finally {
      setIsLoading(false);
    }
  };

  // Re-seed data
  const handleSeed = async () => {
    setIsLoading(true);
    try {
      await seedDatabase();
      await refreshData();
    } catch (err: any) {
      setBackendError(err.message || "Failed to seed database");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedLocation = locationsStatus.find(
    (l) => l.location_id === selectedLocationId
  ) || null;

  const activeCriticalCount = locationsStatus.filter(
    (l) => l.status === "verified_damaged" || l.status === "blackout" || l.status === "unverified"
  ).length || 6;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDE8] flex flex-col selection:bg-[#FFB800] selection:text-[#0A0A0A]">
      {/* Backend Offline Warning Banner */}
      {backendError && (
        <div className="bg-[#E5484D] text-[#EDEDE8] px-4 py-2 font-mono-data text-xs font-bold text-center flex items-center justify-center gap-2 border-b border-[#0A0A0A]">
          <span>[ALERT: BACKEND DISCONNECTED]</span>
          <span>{backendError}</span>
          <button
            onClick={refreshData}
            className="underline hover:text-[#FFB800] cursor-pointer"
          >
            [RETRY NOW]
          </button>
        </div>
      )}

      {/* 1. Hero with Signature Fog Lift & Clear Crisis Statement */}
      <HeroFog
        elapsedHours={simulationState?.elapsed_hours || 0}
        simulatedTime={simulationState?.simulated_time || ""}
        totalReports={simulationState?.total_reports_seeded || 0}
        activeCriticalCount={activeCriticalCount}
        onExploreClick={() => {
          const el = document.getElementById("situation-matrix");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* 2. Persistent Simulation Controls Bar */}
      <SimulationControls
        simulationState={simulationState}
        summaryCounts={summaryCounts}
        isLoading={isLoading}
        autoPoll={autoPoll}
        onToggleAutoPoll={() => setAutoPoll(!autoPoll)}
        onAdvanceHours={handleAdvanceHours}
        onReset={handleReset}
        onSeed={handleSeed}
      />

      {/* 3. Live 8-Sector Situation Matrix Grid (WHAT -> WHY -> ACTION) */}
      <StatusGrid
        locations={locationsStatus}
        onSelectLocation={(id) => setSelectedLocationId(id)}
      />

      {/* 4. Live Report Injection Drawer */}
      <ReportInjectionForm onReportInjected={refreshData} />

      {/* 5. Pipeline Architecture & Reference Drawer */}
      <SystemArchitecture />

      {/* 6. Location Detail Modal / Incident Dossier */}
      <LocationDetailModal
        location={selectedLocation}
        onClose={() => setSelectedLocationId(null)}
      />

      {/* Clean Minimal Editorial Footer */}
      <footer className="border-t border-[#EDEDE8]/10 p-8 sm:px-14 font-mono-data text-xs text-[#EDEDE8]/50 flex flex-wrap items-center justify-between gap-4 bg-[#0A0A0A]">
        <div>
          <span className="text-[#EDEDE8]/80 font-bold">POST-DISASTER // INFORMATION FOG</span>
          <span className="block text-[11px] text-[#EDEDE8]/40 mt-0.5">
            National Situational Awareness & Operational Crisis Command Platform
          </span>
        </div>
        <div className="flex gap-4 text-xs">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#FFB800] underline"
          >
            [API SWAGGER]
          </a>
          <a
            href="http://localhost:8000/redoc"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#FFB800] underline"
          >
            [REDOC]
          </a>
        </div>
      </footer>
    </div>
  );
}
