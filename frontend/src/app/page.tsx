"use client";

import React, { useEffect, useState } from "react";
import {
  fetchAllLocationsStatus,
  fetchSimulationState,
  fetchGisTelemetry,
  fetchPopulationExposure,
  fetchMissingPersons,
  fetchSectorPalikas,
  advanceSimulation,
  resetSimulation,
  seedDatabase,
  LocationStatusItem,
  SimulationState,
  GisSectorTelemetry,
  AllPopulationExposureResponse,
  MissingPersonItem,
  SectorPalikaBreakdown,
} from "@/lib/api";
import { useViewMode } from "@/context/ViewModeContext";
import { CinematicIntro } from "@/components/CinematicIntro";
import { EditorialMapStory } from "@/components/EditorialMapStory";
import { DeduplicationStory } from "@/components/DeduplicationStory";
import { BlackoutRiskStory } from "@/components/BlackoutRiskStory";
import { PopulationStory } from "@/components/PopulationStory";
import { TacticalDispatchStory } from "@/components/TacticalDispatchStory";
import { StatusGrid } from "@/components/StatusGrid";
import { SimulationControls } from "@/components/SimulationControls";
import { ReportInjectionForm } from "@/components/ReportInjectionForm";
import { SectorDetailPanel } from "@/components/SectorDetailPanel";
import { SystemArchitecture } from "@/components/SystemArchitecture";

export default function HomePage() {
  const [locations, setLocations] = useState<LocationStatusItem[]>([]);
  const [gisSectors, setGisSectors] = useState<GisSectorTelemetry[]>([]);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [exposureData, setExposureData] = useState<AllPopulationExposureResponse | null>(null);
  const [missingPersons, setMissingPersons] = useState<MissingPersonItem[]>([]);
  
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>("gorkha");
  const [inspectedLocation, setInspectedLocation] = useState<LocationStatusItem | null>(null);
  const [selectedSectorForPalikas, setSelectedSectorForPalikas] = useState<string | null>(null);
  const [palikaData, setPalikaData] = useState<SectorPalikaBreakdown | null>(null);
  const [loadingPalikas, setLoadingPalikas] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [autoPoll, setAutoPoll] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAnalysis } = useViewMode();

  const loadData = async () => {
    try {
      const [locsRes, sim, gis, exp, miss] = await Promise.all([
        fetchAllLocationsStatus(),
        fetchSimulationState(),
        fetchGisTelemetry(),
        fetchPopulationExposure(),
        fetchMissingPersons(),
      ]);

      setLocations(locsRes.locations);
      setSimulationState(sim);
      setGisSectors(gis.sectors);
      setExposureData(exp);
      setMissingPersons(miss);

      // Keep inspected location updated if open
      if (inspectedLocation) {
        const updated = locsRes.locations.find((l) => l.location_id === inspectedLocation.location_id);
        if (updated) setInspectedLocation(updated);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load live situation telemetry");
    }
  };

  useEffect(() => {
    loadData();
    if (!autoPoll) return;
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [autoPoll, inspectedLocation]);

  const handleAdvanceHours = async (hours: number) => {
    setIsLoading(true);
    try {
      await advanceSimulation(hours);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to advance simulation time");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await resetSimulation();
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to reset simulation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      await seedDatabase();
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to seed realistic reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDossier = (sectorId: string) => {
    const loc = locations.find((l) => l.location_id.toLowerCase() === sectorId.toLowerCase());
    if (loc) setInspectedLocation(loc);
  };

  const handleOpenPalikas = async (sId: string) => {
    setSelectedSectorForPalikas(sId);
    setLoadingPalikas(true);
    try {
      const data = await fetchSectorPalikas(sId);
      setPalikaData(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch municipal census demographics");
    } finally {
      setLoadingPalikas(false);
    }
  };

  const scrollToMatrix = () => {
    const el = document.getElementById("situation-matrix");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Summary counts for simulation timeline bar
  const summaryCounts = locations.reduce((acc: any, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const activeCriticalCount =
    (summaryCounts.verified_damaged || 0) +
    (summaryCounts.blackout || 0) +
    (summaryCounts.unverified || 0);

  return (
    <div className="flex flex-col min-h-screen">
      {/* SECTION 1: THE INFORMATION FOG (Cinematic Editorial Opening) */}
      <CinematicIntro
        elapsedHours={simulationState?.elapsed_hours || 12.0}
        totalReports={simulationState?.reports_visible_at_current_time || 84}
        activeCriticalCount={activeCriticalCount || 6}
        onEnterMatrix={scrollToMatrix}
      />

      {/* STICKY SIMULATION CONTROLS BAR */}
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

      {/* Global Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-4 w-full">
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-mono-data text-[#E11D48]">
            [TELEMETRY_SYNC_ERROR]: {error}
          </div>
        </div>
      )}

      {/* SECTION 2 & 3: THE SITUATION & WHERE IS THE RISK? (Map as Main Character) */}
      <EditorialMapStory
        sectors={gisSectors}
        locations={locations}
        selectedSectorId={selectedSectorId}
        onSelectSector={(sId) => setSelectedSectorId(sId)}
        onOpenDossier={handleOpenDossier}
      />

      {/* SECTION 4: WHAT DO WE ACTUALLY KNOW? (Unified Truth & Deduplication) */}
      <DeduplicationStory />

      {/* SECTION 5: WHAT CAN WE NOT SEE? (Silent Blackout Intelligence) */}
      <BlackoutRiskStory />

      {/* SECTION 6: WHO IS AFFECTED? (Population Exposure & Accountability) */}
      <PopulationStory
        totalExposedMillion={
          (exposureData?.total_national_exposed_population || 2920000) / 1000000
        }
        totalUnaccountedCount={missingPersons.length || 148}
        totalEvacuatedThousand={
          (exposureData?.sector_exposures.reduce(
            (acc, s) => acc + s.evacuated_population_estimate,
            0
          ) || 38000) / 1000
        }
      />

      {/* SECTION 7: WHAT SHOULD HAPPEN NEXT? (Tactical Resource Dispatch) */}
      <TacticalDispatchStory />

      {/* SECTION 8: OPERATIONAL COMMAND MATRIX & TEST SIGNAL CONSOLE */}
      <StatusGrid
        locations={locations}
        onSelectLocation={(locId) => handleOpenDossier(locId)}
      />

      {/* LIVE FIELD TEST SIGNAL INJECTION */}
      <ReportInjectionForm onReportInjected={loadData} />

      {/* PROGRESSIVE SYSTEM ARCHITECTURE & FORMULA SPECIFICATIONS */}
      <SystemArchitecture />

      {/* SLIDE-IN SECTOR EVIDENCE DOSSIER PANEL */}
      <SectorDetailPanel
        location={inspectedLocation}
        onClose={() => setInspectedLocation(null)}
        isAnalysis={isAnalysis}
        onOpenPalikas={handleOpenPalikas}
      />

      {/* 2021 CENSUS PALIKA DEMOGRAPHICS MODAL */}
      {selectedSectorForPalikas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="surface-elevated max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[#E5E4DC] dark:border-[#232733] pb-4">
              <div>
                <div className="font-mono-data text-xs text-[#D97706] dark:text-[#FBBF24] font-bold uppercase tracking-wider mb-1">
                  🏛️ NSO NEPAL 2021 CENSUS BASELINE
                </div>
                <h3 className="font-display-calm font-extrabold text-2xl sm:text-3xl uppercase text-[#111318] dark:text-[#F4F4F0]">
                  {palikaData?.sector_name || selectedSectorForPalikas} Municipalities
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedSectorForPalikas(null);
                  setPalikaData(null);
                }}
                className="p-2 rounded-lg border border-[#E5E4DC] dark:border-[#232733] font-mono-data text-xs text-[#5C6270] hover:text-[#111318] dark:hover:text-[#F4F4F0] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {loadingPalikas ? (
              <div className="p-12 text-center font-mono-data text-xs text-[#2563EB] animate-pulse">
                [LOADING_2021_CENSUS_PALIKA_RECORDS...]
              </div>
            ) : palikaData ? (
              <div className="space-y-6 font-mono-data text-xs">
                {/* Aggregate Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="surface-calm p-3.5">
                    <span className="text-[#5C6270] block text-[10px] uppercase font-bold">TOTAL PALIKAS</span>
                    <strong className="text-xl text-[#111318] dark:text-[#F4F4F0] font-bold">{palikaData.total_palikas}</strong>
                  </div>
                  <div className="surface-calm p-3.5">
                    <span className="text-[#5C6270] block text-[10px] uppercase font-bold">TOTAL HOUSEHOLDS</span>
                    <strong className="text-xl text-[#2563EB] dark:text-[#60A5FA] font-bold">{palikaData.total_households.toLocaleString()}</strong>
                  </div>
                  <div className="surface-calm p-3.5">
                    <span className="text-[#5C6270] block text-[10px] uppercase font-bold">MALE POPULATION</span>
                    <strong className="text-xl text-[#111318] dark:text-[#F4F4F0] font-bold">{palikaData.male_population.toLocaleString()}</strong>
                  </div>
                  <div className="surface-calm p-3.5">
                    <span className="text-[#5C6270] block text-[10px] uppercase font-bold">FEMALE POPULATION</span>
                    <strong className="text-xl text-[#111318] dark:text-[#F4F4F0] font-bold">{palikaData.female_population.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-[#E5E4DC] dark:border-[#232733] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F2F0E8] dark:bg-[#13161D] border-b border-[#E5E4DC] dark:border-[#232733] text-[#5C6270] text-[10px] uppercase font-bold">
                      <tr>
                        <th className="p-3">CODE</th>
                        <th className="p-3">MUNICIPALITY / PALIKA</th>
                        <th className="p-3 text-right">HOUSEHOLDS</th>
                        <th className="p-3 text-right">POPULATION</th>
                        <th className="p-3 text-right">SHELTER TENTS REQ.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E4DC] dark:divide-[#232733] text-[11px]">
                      {palikaData.palikas.map((p) => (
                        <tr key={p.local_level_id} className="hover:bg-[#F2F0E8]/50 dark:hover:bg-[#13161D]/50 transition-colors">
                          <td className="p-3 font-bold text-[#2563EB] dark:text-[#60A5FA]">{p.local_level_id}</td>
                          <td className="p-3 font-bold text-[#111318] dark:text-[#F4F4F0]">{p.local_level_name}</td>
                          <td className="p-3 text-right text-[#5C6270]">{p.households.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-[#111318] dark:text-[#F4F4F0]">{p.total_population.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-[#059669] dark:text-[#34D399]">
                            {p.estimated_tents_needed.toLocaleString()} TENTS
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
