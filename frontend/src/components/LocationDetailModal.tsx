"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IncidentClusterItem,
  LocationStatusItem,
  ReportItem,
  fetchLocationIncidents,
} from "@/lib/api";
import { useViewMode } from "@/context/ViewModeContext";

interface LocationDetailModalProps {
  location: LocationStatusItem | null;
  onClose: () => void;
}

export function LocationDetailModal({ location, onClose }: LocationDetailModalProps) {
  const [incidents, setIncidents] = useState<IncidentClusterItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedReports, setExpandedReports] = useState<Record<string, boolean>>({});
  const { isAnalysis } = useViewMode();

  useEffect(() => {
    if (!location) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchLocationIncidents(location.location_id)
      .then((data) => {
        if (isMounted) {
          setIncidents(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load incidents");
          setIsLoading(false);
        }
      });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      isMounted = false;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [location, onClose]);

  if (!location) return null;

  const toggleReportsAccordion = (clusterKey: string) => {
    setExpandedReports((prev) => ({
      ...prev,
      [clusterKey]: !prev[clusterKey],
    }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0A0A0A]/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl max-h-[90vh] bg-[#0A0A0A] border border-[#EDEDE8]/20 flex flex-col overflow-hidden text-[#EDEDE8] shadow-2xl"
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between p-6 border-b border-[#EDEDE8]/10 bg-[#EDEDE8]/2">
            <div>
              <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
                SECTOR INCIDENT DOSSIER // {location.location_id.toUpperCase()}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#EDEDE8]">
                {location.location_name}
              </h2>
              <p className="font-body-prose text-xs text-[#EDEDE8]/70 mt-1 max-w-xl">
                {location.status_reason}
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#EDEDE8]/10 hover:bg-[#EDEDE8] hover:text-[#0A0A0A] font-mono-data text-xs font-bold uppercase transition-colors border border-[#EDEDE8]/20 cursor-pointer"
            >
              CLOSE [ESC]
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* High-Level Status Metric Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-data text-xs">
              <div className="bg-[#EDEDE8]/3 p-3 border border-[#EDEDE8]/10">
                <span className="text-[#EDEDE8]/50 block text-[10px] uppercase">STATUS</span>
                <strong className="text-[#FFB800] font-bold uppercase">
                  {location.status.replace("_", " ")}
                </strong>
              </div>
              <div className="bg-[#EDEDE8]/3 p-3 border border-[#EDEDE8]/10">
                <span className="text-[#EDEDE8]/50 block text-[10px] uppercase">CONFIDENCE</span>
                <strong className="text-[#3FB950] font-bold">
                  {(location.confidence_score * 100).toFixed(0)}%
                </strong>
              </div>
              <div className="bg-[#EDEDE8]/3 p-3 border border-[#EDEDE8]/10">
                <span className="text-[#EDEDE8]/50 block text-[10px] uppercase">RAW REPORTS</span>
                <strong className="text-[#EDEDE8] font-bold">{location.report_count}</strong>
              </div>
              <div className="bg-[#EDEDE8]/3 p-3 border border-[#EDEDE8]/10">
                <span className="text-[#EDEDE8]/50 block text-[10px] uppercase">COORDINATES</span>
                <span className="text-[#EDEDE8]/80 text-[11px]">
                  {location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E
                </span>
              </div>
            </div>

            {isLoading && (
              <div className="py-12 text-center font-mono-data text-xs text-[#FFB800]">
                ANALYZING INCIDENT CLUSTERS & SCORING EVIDENCE...
              </div>
            )}

            {error && (
              <div className="p-4 bg-[#E5484D]/10 border border-[#E5484D] font-mono-data text-xs text-[#E5484D]">
                [DOSSIER_ERROR]: {error}
              </div>
            )}

            {!isLoading && !error && incidents.length === 0 && (
              <div className="p-8 text-center border border-[#EDEDE8]/15 font-mono-data text-xs text-[#EDEDE8]/50">
                NO INCIDENT REPORTS RECORDED FOR THIS SECTOR AT CURRENT SIMULATED TIME.
              </div>
            )}

            {/* Clusters List */}
            <div className="space-y-4">
              <div className="font-mono-data text-xs text-[#EDEDE8]/70 font-bold uppercase tracking-wider">
                CONFIRMED INCIDENT CLUSTERS ({incidents.length})
              </div>

              {incidents.map((cluster, cIdx) => {
                const clusterKey = `${cluster.location_id}-${cluster.cluster_id}-${cIdx}`;
                const isExpanded = !!expandedReports[clusterKey];

                return (
                  <div
                    key={clusterKey}
                    className="surface-card p-5 space-y-4 border border-[#EDEDE8]/15"
                  >
                    {/* Cluster Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EDEDE8]/10 pb-3">
                      <div className="flex items-center gap-2 font-mono-data text-xs">
                        <span className="bg-[#FFB800] text-[#0A0A0A] px-2 py-0.5 font-bold">
                          CLUSTER #{cluster.cluster_id}
                        </span>
                        <span className="border border-[#EDEDE8]/30 px-2 py-0.5 text-[#EDEDE8] uppercase text-[11px]">
                          TAG: {cluster.damage_type}
                        </span>
                        {cluster.casualty_estimate !== null && (
                          <span className="bg-[#E5484D] text-[#EDEDE8] px-2 py-0.5 font-bold text-[11px]">
                            EST. CASUALTIES: {cluster.casualty_estimate}
                          </span>
                        )}
                      </div>

                      <div className="font-mono-data text-xs text-[#EDEDE8]/70">
                        CONFIDENCE: <strong className="text-[#3FB950]">{(cluster.confidence_score * 100).toFixed(0)}%</strong>
                        <span className="ml-2 text-[#EDEDE8]/40">({cluster.report_count} reports)</span>
                      </div>
                    </div>

                    {/* Representative Text */}
                    <div>
                      <span className="font-mono-data text-[10px] text-[#FFB800] uppercase font-bold block mb-1">
                        CONSENSUS NARRATIVE:
                      </span>
                      <blockquote className="font-body-prose text-sm sm:text-base text-[#EDEDE8] bg-[#EDEDE8]/3 p-3 border-l-2 border-[#FFB800]">
                        &quot;{cluster.representative_text}&quot;
                      </blockquote>
                    </div>

                    {/* Sources Breakdown */}
                    <div className="flex flex-wrap items-center gap-2 font-mono-data text-xs">
                      <span className="text-[#EDEDE8]/50">SOURCES:</span>
                      {Object.entries(cluster.sources_breakdown).map(([source, count]) => (
                        <span
                          key={source}
                          className="bg-[#EDEDE8]/5 border border-[#EDEDE8]/20 px-2 py-0.5 text-[#EDEDE8]/90 uppercase text-[11px]"
                        >
                          {source}: {String(count)}
                        </span>
                      ))}
                    </div>

                    {/* Progressive Disclosure: Raw Contributing Reports */}
                    {cluster.reports && cluster.reports.length > 0 && (
                      <div className="pt-2 border-t border-[#EDEDE8]/10">
                        <button
                          onClick={() => toggleReportsAccordion(clusterKey)}
                          className="text-xs font-mono-data text-[#FFB800] hover:underline flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{isExpanded ? "▼ HIDE" : "► VIEW"} RAW CONTRIBUTING REPORTS ({cluster.reports.length})</span>
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2 font-mono-data text-xs">
                            {cluster.reports.map((rep: ReportItem, rIdx) => (
                              <div
                                key={`${rep.id}-${rIdx}`}
                                className="bg-[#EDEDE8]/3 p-3 border border-[#EDEDE8]/10 space-y-1.5"
                              >
                                <div className="flex justify-between text-[#EDEDE8]/60 text-[11px]">
                                  <span className="uppercase font-bold text-[#EDEDE8]">
                                    SOURCE: {rep.source_type}
                                  </span>
                                  <span>{new Date(rep.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="font-body-prose text-xs text-[#EDEDE8]/90">
                                  {rep.raw_text}
                                </p>
                                {isAnalysis && (
                                  <div className="text-[10px] text-[#EDEDE8]/50 pt-1 border-t border-[#EDEDE8]/5 flex justify-between">
                                    <span>SCORE: {rep.score_breakdown?.effective_score?.toFixed(2) ?? "N/A"}</span>
                                    <span>HAS COORDS: {rep.score_breakdown?.has_coordinates_bonus > 0 ? "YES (+0.10)" : "NO"}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
