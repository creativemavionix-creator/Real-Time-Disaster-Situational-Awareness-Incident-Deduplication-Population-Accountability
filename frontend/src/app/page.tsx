"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  API_BASE_URL,
  LocationStatusItem,
  SimulationState,
  fetchAllLocationsStatus,
  fetchSimulationState,
  advanceSimulation,
  resetSimulation,
  seedDatabase,
} from "@/lib/api";
import { HeroFog } from "@/components/HeroFog";
import { CriticalFailureModes } from "@/components/CriticalFailureModes";
import { HistoricalCaseStudies } from "@/components/HistoricalCaseStudies";
import { NegativeEvidenceSimulator } from "@/components/NegativeEvidenceSimulator";
import { AlgorithmicFoundations } from "@/components/AlgorithmicFoundations";
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
      setBackendError(err.message || `Cannot connect to backend at ${API_BASE_URL}`);
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
    }, 3000);
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
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col selection:bg-[#0088A9] selection:text-white transition-colors duration-200">
      {/* Backend Offline Warning Banner */}
      {backendError && (
        <div className="bg-rose-600 text-white px-4 py-2 font-mono text-xs font-bold text-center flex items-center justify-center gap-3">
          <span>[ALERT: BACKEND DISCONNECTED]</span>
          <span>{backendError}</span>
          <button
            onClick={refreshData}
            className="underline hover:text-amber-200 cursor-pointer"
          >
            [RETRY NOW]
          </button>
        </div>
      )}

      {/* 1. Hero Section matching Screenshot 1 */}
      <div className="prism-hero-bg">
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
      </div>

      {/* 2. Critical Failure Modes Section matching Screenshot 4 */}
      <CriticalFailureModes />

      {/* 3. Negative-Evidence Intelligence Simulator matching Screenshot 3 */}
      <NegativeEvidenceSimulator />

      {/* 4. Real-World Nepal Disaster Case Studies matching Screenshot 2 */}
      <HistoricalCaseStudies />

      {/* 5. Mathematical Methodology & Axioms matching Screenshot 5 */}
      <AlgorithmicFoundations />

      {/* 6. Sticky Simulation Controls Bar */}
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

      {/* 7. Live 8-Sector Situation Matrix Grid */}
      <StatusGrid
        locations={locationsStatus}
        onSelectLocation={(id) => setSelectedLocationId(id)}
      />

      {/* 8. Live Report Injection Drawer */}
      <ReportInjectionForm onReportInjected={refreshData} />

      {/* 9. Pipeline Architecture & Reference Drawer */}
      <SystemArchitecture />

      {/* 10. Location Detail Modal / Incident Dossier */}
      <LocationDetailModal
        location={selectedLocation}
        onClose={() => setSelectedLocationId(null)}
      />

      {/* Modern Editorial Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 p-8 sm:px-14 font-mono text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#090D16] transition-colors">
        <div>
          <span className="text-slate-900 dark:text-white font-extrabold text-sm">
            Project PRISM
          </span>
          <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Post-disaster Real-time Intelligence & Situational Mapping
          </span>
        </div>
        <div className="flex gap-4 text-xs font-semibold">
          <a
            href={`${API_BASE_URL}/docs`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-cyan-600 dark:hover:text-cyan-400 underline"
          >
            [API SWAGGER]
          </a>
          <a
            href={`${API_BASE_URL}/redoc`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-cyan-600 dark:hover:text-cyan-400 underline"
          >
            [REDOC]
          </a>
        </div>
      </footer>
    </div>
  );
}
