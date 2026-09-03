"use client";

import React, { useEffect, useState } from "react";
import {
  fetchAllLocationsStatus,
  fetchSimulationState,
  fetchGisTelemetry,
  fetchPopulationExposure,
  fetchSectorPalikas,
  LocationStatusItem,
  SimulationState,
  GisSectorTelemetry,
  AllPopulationExposureResponse,
  SectorPalikaBreakdown,
  advanceSimulation,
  resetSimulation,
  H3HexagonItem,
  DisasterCategory,
  ScenarioPreset,
  fetchScenarioPresets,
  loadScenarioPreset,
  switchDisasterType,
  fetchPropagationPath,
} from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import InteractiveVectorMap from "@/components/InteractiveVectorMap";
import MapLayerControl, { MapLayerVisibility } from "@/components/MapLayerControl";
import SectorOperationsDrawer from "@/components/SectorOperationsDrawer";
import DisasterScenarioControlBar from "@/components/DisasterScenarioControlBar";
import { FloatingCommandBar } from "@/components/FloatingCommandBar";
import { SectorDetailPanel } from "@/components/SectorDetailPanel";
import { useViewMode } from "@/context/ViewModeContext";

export default function GisMapPage() {
  const [locations, setLocations] = useState<LocationStatusItem[]>([]);
  const [gisSectors, setGisSectors] = useState<GisSectorTelemetry[]>([]);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [exposureData, setExposureData] = useState<AllPopulationExposureResponse | null>(null);

  // Multi-Disaster & Preset State
  const [activeDisasterType, setActiveDisasterType] = useState<DisasterCategory>("earthquake");
  const [activePresetId, setActivePresetId] = useState<string>("gorkha_earthquake");
  const [presets, setPresets] = useState<ScenarioPreset[]>([]);
  const [activeWavefrontName, setActiveWavefrontName] = useState<string>("");

  const [selectedSectorId, setSelectedSectorId] = useState<string>("gorkha");
  const [selectedHexagon, setSelectedHexagon] = useState<H3HexagonItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [inspectedLocation, setInspectedLocation] = useState<LocationStatusItem | null>(null);

  // Tactical Layer Controls
  const [mapLayers, setMapLayers] = useState<MapLayerVisibility>({
    showH3Grid: true,
    showHazardOverlays: true,
    showPropagationPath: true,
    showSilentHalos: true,
    showCorridors: true,
    showSatelliteLayer: true,
    baseMapStyle: "opentopo",
  });

  // Palikas Modal State
  const [selectedSectorForPalikas, setSelectedSectorForPalikas] = useState<string | null>(null);
  const [palikaData, setPalikaData] = useState<SectorPalikaBreakdown | null>(null);
  const [loadingPalikas, setLoadingPalikas] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const { isAnalysis } = useViewMode();

  const loadData = async () => {
    try {
      const [locsRes, sim, gis, exp, presetsRes, propRes] = await Promise.all([
        fetchAllLocationsStatus(),
        fetchSimulationState(),
        fetchGisTelemetry(),
        fetchPopulationExposure(),
        fetchScenarioPresets().catch(() => null),
        fetchPropagationPath(activeDisasterType).catch(() => null),
      ]);

      setLocations(locsRes.locations);
      setSimulationState(sim);
      setGisSectors(gis.sectors);
      setExposureData(exp);

      if (presetsRes) {
        setPresets(presetsRes.presets);
        if (presetsRes.active_preset_id) setActivePresetId(presetsRes.active_preset_id);
        if (presetsRes.active_disaster_type) setActiveDisasterType(presetsRes.active_disaster_type);
      }
      if (propRes?.active_wavefront) {
        setActiveWavefrontName(propRes.active_wavefront.name);
      }

      setInspectedLocation((prev) => {
        if (!prev) return null;
        const updated = locsRes.locations.find((l) => l.location_id === prev.location_id);
        return updated || prev;
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [activeDisasterType]);

  const handleAdvanceHours = async (hours: number) => {
    setIsLoading(true);
    try {
      await advanceSimulation(hours);
      await loadData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDisaster = async (dType: DisasterCategory) => {
    setIsLoading(true);
    try {
      setActiveDisasterType(dType);
      await switchDisasterType(dType, true);
      await loadData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = async (presetId: string) => {
    setIsLoading(true);
    try {
      setActivePresetId(presetId);
      const matched = presets.find((p) => p.preset_id === presetId);
      if (matched) {
        setActiveDisasterType(matched.disaster_type);
        if (matched.initial_affected_sectors.length > 0) {
          setSelectedSectorId(matched.initial_affected_sectors[0]);
        }
      }
      await loadScenarioPreset(presetId, true);
      await loadData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSimulation = async () => {
    setIsLoading(true);
    try {
      await resetSimulation();
      await loadData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPalikas = async (sId: string) => {
    setSelectedSectorForPalikas(sId);
    setLoadingPalikas(true);
    try {
      const data = await fetchSectorPalikas(sId);
      setPalikaData(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingPalikas(false);
    }
  };

  const handleSelectSector = (sId: string) => {
    setSelectedSectorId(sId);
    setIsDrawerOpen(true);
  };

  const activeSector = gisSectors.find(
    (s) => s.sector_id.toLowerCase() === selectedSectorId.toLowerCase()
  ) || gisSectors[0];

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
    <div className="flex-1 w-full h-full relative overflow-hidden bg-[#090B0E] flex flex-col">
      {/* 0. Top Interactive Disaster Scenario & Timeline Control Bar */}
      <DisasterScenarioControlBar
        simulationState={simulationState}
        activeDisasterType={activeDisasterType}
        presets={presets}
        activePresetId={activePresetId}
        activeWavefrontName={activeWavefrontName}
        onSelectDisaster={handleSelectDisaster}
        onSelectPreset={handleSelectPreset}
        onAdvanceHours={handleAdvanceHours}
        onResetSimulation={handleResetSimulation}
        isLoading={isLoading}
      />

      <div className="flex-1 w-full h-full relative overflow-hidden">
        {/* 1. Full-Screen Interactive Operations Map */}
        <InteractiveVectorMap
          sectors={gisSectors}
          selectedSectorId={selectedSectorId}
          onSelectSector={handleSelectSector}
          onSelectHexagon={(hex) => {
            setSelectedHexagon(hex);
            setSelectedSectorId(hex.sector_id);
            setIsDrawerOpen(true);
          }}
          layerVisibility={mapLayers}
          disasterType={activeDisasterType}
          simTime={simulationState?.current_simulated_time}
        />

      {/* 2. Floating Layer Controls (Top Left) */}
      <div className="absolute top-6 left-6 z-40">
        <MapLayerControl
          layers={mapLayers}
          onChangeLayers={(newLayers) => setMapLayers(newLayers)}
        />
      </div>

      {/* 3. Floating Top Command Bar (Clock, Metrics & Time Step) */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-full max-w-4xl px-4"
      >
        <FloatingCommandBar
          simulationState={simulationState}
          activeCriticalCount={activeCriticalCount || 0}
          totalExposedMillion={(exposureData?.total_national_exposed_population || 0) / 1000000}
          worstSectorName={worstSector?.location_name || "Unknown"}
          onAdvanceHours={handleAdvanceHours}
          isLoading={isLoading}
        />
      </motion.div>

      {/* 4. Slide-out Sector Operations Drawer (Right) */}
      <AnimatePresence>
        {isDrawerOpen && activeSector && (
          <SectorOperationsDrawer
            sector={activeSector}
            location={activeLocation}
            selectedHexagon={selectedHexagon}
            onClose={() => setIsDrawerOpen(false)}
            onRefreshData={loadData}
            onOpenPalikas={handleOpenPalikas}
          />
        )}
      </AnimatePresence>

      {/* 5. Trigger Button to Re-Open Drawer if Closed */}
      {!isDrawerOpen && activeSector && (
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="absolute top-24 right-6 z-40 px-4 py-2 rounded-xl bg-[#0C0E12]/90 backdrop-blur-xl border border-white/15 text-xs text-[#60A5FA] font-bold shadow-2xl hover:bg-[#12161F] cursor-pointer transition-all flex items-center gap-2"
        >
          <span>Open Sector Dossier ({activeSector.sector_name})</span>
        </button>
      )}

      {/* Secondary Evidence Dossier Panel (if inspected) */}
      <SectorDetailPanel
        location={inspectedLocation}
        onClose={() => setInspectedLocation(null)}
        isAnalysis={isAnalysis}
        onOpenPalikas={handleOpenPalikas}
      />

      {/* Modal: Census Data */}
      {selectedSectorForPalikas && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-[#090B0E]/80 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-[#10131A] border border-white/10 p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6">
              <div>
                <div className="font-mono-data text-[10px] text-[#94A3B8] uppercase tracking-[0.2em] mb-2">
                  NSO NEPAL 2021 CENSUS BASELINE
                </div>
                <h3 className="font-display-calm font-medium text-3xl text-[#F3F4F6]">
                  {palikaData?.sector_name || selectedSectorForPalikas} Municipalities
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedSectorForPalikas(null);
                  setPalikaData(null);
                }}
                className="text-[#64748B] hover:text-white font-mono-data text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {loadingPalikas ? (
              <div className="p-12 text-center font-mono-data text-xs text-[#94A3B8] uppercase tracking-[0.2em] animate-pulse">
                Loading Records...
              </div>
            ) : palikaData ? (
              <div className="space-y-8 font-mono-data text-xs text-[#94A3B8]">
                <div className="grid grid-cols-4 gap-px bg-white/10 border border-white/10">
                  <div className="bg-[#10131A] p-4">
                    <div className="text-[9px] uppercase tracking-[0.2em] mb-2">Total Palikas</div>
                    <div className="text-xl text-white">{palikaData.total_palikas}</div>
                  </div>
                  <div className="bg-[#10131A] p-4">
                    <div className="text-[9px] uppercase tracking-[0.2em] mb-2">Households</div>
                    <div className="text-xl text-white">{palikaData.total_households.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#10131A] p-4">
                    <div className="text-[9px] uppercase tracking-[0.2em] mb-2">Male</div>
                    <div className="text-xl text-white">{palikaData.male_population.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#10131A] p-4">
                    <div className="text-[9px] uppercase tracking-[0.2em] mb-2">Female</div>
                    <div className="text-xl text-white">{palikaData.female_population.toLocaleString()}</div>
                  </div>
                </div>

                <div className="border border-white/10 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-white/10 text-[9px] uppercase tracking-[0.2em]">
                      <tr>
                        <th className="p-4 font-normal">Code</th>
                        <th className="p-4 font-normal">Municipality</th>
                        <th className="p-4 font-normal text-right">Households</th>
                        <th className="p-4 font-normal text-right">Population</th>
                        <th className="p-4 font-normal text-right text-[#059669]">Shelters Req</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[11px]">
                      {palikaData.palikas.map((p) => (
                        <tr key={p.local_level_id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">{p.local_level_id}</td>
                          <td className="p-4 text-white">{p.local_level_name}</td>
                          <td className="p-4 text-right">{p.households.toLocaleString()}</td>
                          <td className="p-4 text-right text-white">{p.total_population.toLocaleString()}</td>
                          <td className="p-4 text-right text-[#059669]">
                            {p.estimated_tents_needed.toLocaleString()}
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
    </div>
  );
}
