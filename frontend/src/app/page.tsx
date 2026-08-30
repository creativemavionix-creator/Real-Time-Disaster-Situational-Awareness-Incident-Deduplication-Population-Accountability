"use client";

import React, { useEffect, useState } from "react";
import {
  fetchAllLocationsStatus,
  fetchSimulationState,
  fetchGisTelemetry,
  fetchPopulationExposure,
  fetchMissingPersons,
  fetchSectorPalikas,
  fetchUnifiedTruth,
  fetchBlackoutRisks,
  fetchDispatchDashboard,
  advanceSimulation,
  resetSimulation,
  seedDatabase,
  LocationStatusItem,
  SimulationState,
  GisSectorTelemetry,
  AllPopulationExposureResponse,
  MissingPersonItem,
  SectorPalikaBreakdown,
  UnifiedTruthRecord,
  BlackoutRiskAssessment,
  TacticalDispatchRecommendation,
} from "@/lib/api";
import { useViewMode } from "@/context/ViewModeContext";
import { CinematicIntro } from "@/components/CinematicIntro";
import { ExecutiveBriefing } from "@/components/ExecutiveBriefing";
import InteractiveVectorMap from "@/components/InteractiveVectorMap";
import { ActiveSectorDossier } from "@/components/ActiveSectorDossier";
import { DeduplicationStory } from "@/components/DeduplicationStory";
import { BeforeAfterShowcase } from "@/components/BeforeAfterShowcase";
import { BlackoutRiskStory } from "@/components/BlackoutRiskStory";
import { PopulationStory } from "@/components/PopulationStory";
import { PopulationReconciliationLedger } from "@/components/PopulationReconciliationLedger";
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
  const [truthRecords, setTruthRecords] = useState<UnifiedTruthRecord[]>([]);
  const [blackoutAssessments, setBlackoutAssessments] = useState<BlackoutRiskAssessment[]>([]);
  const [dispatchRecommendations, setDispatchRecommendations] = useState<TacticalDispatchRecommendation[]>([]);

  const [selectedSectorId, setSelectedSectorId] = useState<string>("gorkha");
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
      const [locsRes, sim, gis, exp, miss, truth, blackout, dispatch] = await Promise.all([
        fetchAllLocationsStatus(),
        fetchSimulationState(),
        fetchGisTelemetry(),
        fetchPopulationExposure(),
        fetchMissingPersons(),
        fetchUnifiedTruth(),
        fetchBlackoutRisks(),
        fetchDispatchDashboard(),
      ]);

      setLocations(locsRes.locations);
      setSimulationState(sim);
      setGisSectors(gis.sectors);
      setExposureData(exp);
      setMissingPersons(miss);
      setTruthRecords(truth.unified_records);
      setBlackoutAssessments(blackout.assessments);
      setDispatchRecommendations(dispatch.recommendations);

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
    setSelectedSectorId(sectorId);
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
    const el = document.getElementById("command-matrix");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Active sector telemetry objects
  const activeSector = gisSectors.find(
    (s) => s.sector_id.toLowerCase() === selectedSectorId.toLowerCase()
  ) || gisSectors[0] || {
    sector_id: "gorkha",
    sector_name: "Gorkha",
    status: "verified_damaged" as const,
    confidence_score: 0.94,
    severity_index: 9.2,
    threat_tier: "CRITICAL",
    latitude: 28.0,
    longitude: 84.63,
    elevation_meters: 1900,
    distance_to_epicenter_km: 0.0,
    active_incidents_count: 8,
    estimated_casualties: 149,
    isolation_index: 0.85,
    satellite_corroborated: true,
    satellite_sensor: "Sentinel-1 SAR",
  };

  const activeLocation = locations.find(
    (l) => l.location_id.toLowerCase() === selectedSectorId.toLowerCase()
  );

  const summaryCounts = locations.reduce((acc: any, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const activeCriticalCount =
    (summaryCounts.verified_damaged || 0) +
    (summaryCounts.blackout || 0) +
    (summaryCounts.unverified || 0);

  const worstSector = locations.find(
    (l) => l.status === "verified_damaged" || l.status === "blackout"
  ) || locations[0];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 01: THE INFORMATION FOG (Cinematic Dark Narrative Opening) */}
      <CinematicIntro
        elapsedHours={simulationState?.elapsed_hours || 12.0}
        totalReports={simulationState?.reports_visible_at_current_time || 84}
        activeCriticalCount={activeCriticalCount || 6}
        onEnterMatrix={scrollToMatrix}
      />

      {/* STICKY SIMULATION REPLAY TIMELINE CONTROLS */}
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

      {/* 02: THE SITUATION (Executive Briefing & Key Indicators) */}
      <ExecutiveBriefing
        simulationState={simulationState}
        activeCriticalCount={activeCriticalCount || 6}
        totalExposedMillion={
          (exposureData?.total_national_exposed_population || 2920000) / 1000000
        }
        unaccountedCount={missingPersons.length || 148}
        worstSectorName={worstSector?.location_name || "Gorkha (Epicenter)"}
      />

      {/* 03: WHERE IS THE RISK? (Spatial Cartography + Active Sector Action Dossier) */}
      <section className="py-12 sm:py-16 border-b border-[#E5E4DC] dark:border-[#232733] px-6 sm:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="font-mono-data text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
                03 // GEOSPATIAL CRISIS RADAR
              </div>
              <h2 className="font-display-calm font-extrabold text-2xl sm:text-4xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
                Where is the Risk?
              </h2>
            </div>

            <div className="font-mono-data text-xs text-[#5C6270]">
              SELECT A SECTOR OR ENABLE H3 MESH TO INSPECT RISK FACTORS
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (7): Vector Cartography with H3 Hexagonal Mesh */}
            <div className="lg:col-span-7 space-y-4">
              <InteractiveVectorMap
                sectors={gisSectors}
                selectedSectorId={selectedSectorId}
                onSelectSector={(sId) => handleOpenDossier(sId)}
              />

              {/* Horizontal 8-Sector Selector Carousel */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono-data text-xs">
                {gisSectors.map((sec) => {
                  const isSelected = sec.sector_id.toLowerCase() === selectedSectorId.toLowerCase();
                  return (
                    <button
                      key={sec.sector_id}
                      onClick={() => handleOpenDossier(sec.sector_id)}
                      type="button"
                      className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? "bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12] shadow-xs scale-102"
                          : "surface-calm text-[#5C6270] hover:text-[#111318] dark:hover:text-[#F4F4F0]"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          sec.status === "verified_damaged" || sec.status === "blackout"
                            ? "bg-[#E11D48]"
                            : sec.status === "verified_safe"
                            ? "bg-[#059669]"
                            : "bg-[#D97706]"
                        }`}
                      />
                      <span>{sec.sector_name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column (5): Active Sector Operational Action Dossier */}
            <div className="lg:col-span-5">
              <ActiveSectorDossier
                sector={activeSector}
                location={activeLocation}
                onOpenPalikas={handleOpenPalikas}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 04: WHAT DO WE ACTUALLY KNOW? (Multi-Agency Deduplication & Before/After Showcase) */}
      <DeduplicationStory />
      <BeforeAfterShowcase />

      {/* 05: WHAT CAN WE NOT SEE? (Silent Blackout Intelligence: No Reports ≠ No Danger) */}
      <BlackoutRiskStory />

      {/* 06: WHO IS AFFECTED? (Population Exposure & Probabilistic Missing vs Found Reconciliation) */}
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
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pb-12 w-full">
        <PopulationReconciliationLedger />
      </div>

      {/* 07: WHAT SHOULD HAPPEN NEXT? (Tactical Resource Dispatch Workflow) */}
      <TacticalDispatchStory />

      {/* 08: COMMAND CENTER (Live 8-Sector Operational Situation Matrix) */}
      <div id="command-matrix">
        <StatusGrid
          locations={locations}
          onSelectLocation={(locId) => handleOpenDossier(locId)}
        />
      </div>

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
