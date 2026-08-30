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
} from "@/lib/api";
import { motion } from "framer-motion";
import InteractiveVectorMap from "@/components/InteractiveVectorMap";
import { ActiveSectorDossier } from "@/components/ActiveSectorDossier";
import { FloatingCommandBar } from "@/components/FloatingCommandBar";
import { SectorDetailPanel } from "@/components/SectorDetailPanel";
import { useViewMode } from "@/context/ViewModeContext";

export default function GisMapPage() {
  const [locations, setLocations] = useState<LocationStatusItem[]>([]);
  const [gisSectors, setGisSectors] = useState<GisSectorTelemetry[]>([]);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [exposureData, setExposureData] = useState<AllPopulationExposureResponse | null>(null);

  const [selectedSectorId, setSelectedSectorId] = useState<string>("gorkha");
  const [inspectedLocation, setInspectedLocation] = useState<LocationStatusItem | null>(null);
  
  // Palikas Modal State
  const [selectedSectorForPalikas, setSelectedSectorForPalikas] = useState<string | null>(null);
  const [palikaData, setPalikaData] = useState<SectorPalikaBreakdown | null>(null);
  const [loadingPalikas, setLoadingPalikas] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const { isAnalysis } = useViewMode();

  const loadData = async () => {
    try {
      const [locsRes, sim, gis, exp] = await Promise.all([
        fetchAllLocationsStatus(),
        fetchSimulationState(),
        fetchGisTelemetry(),
        fetchPopulationExposure(),
      ]);

      setLocations(locsRes.locations);
      setSimulationState(sim);
      setGisSectors(gis.sectors);
      setExposureData(exp);

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
  }, []);

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
      {/* Absolute Background Map */}
      <InteractiveVectorMap
        sectors={gisSectors}
        selectedSectorId={selectedSectorId}
        onSelectSector={(sId) => setSelectedSectorId(sId)}
      />

      {/* Floating Top Bar (Command / Metrics) */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-full max-w-5xl px-4"
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

      {/* Floating Sidebar (Right) */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
        className="absolute top-[120px] right-6 bottom-6 z-40 pointer-events-none"
      >
        {activeSector && (
          <ActiveSectorDossier
            sector={activeSector}
            location={activeLocation}
            onOpenPalikas={handleOpenPalikas}
            onInspectEvidence={() => setInspectedLocation(activeLocation || null)}
          />
        )}
      </motion.div>

      {/* Slide-in Evidence Dossier (Secondary Analysis Layer) */}
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
  );
}
