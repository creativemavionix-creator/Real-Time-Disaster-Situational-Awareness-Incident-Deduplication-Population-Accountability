"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IncidentClusterItem,
  LocationStatusItem,
  fetchLocationIncidents,
} from "@/lib/api";

interface LocationDetailModalProps {
  location: LocationStatusItem | null;
  onClose: () => void;
}

export function LocationDetailModal({ location, onClose }: LocationDetailModalProps) {
  const [incidents, setIncidents] = useState<IncidentClusterItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0A0A0A]/85 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-5xl max-h-[90vh] bg-[#0A0A0A] border-heavy-rule flex flex-col overflow-hidden text-[#EDEDE8]"
        >
          {/* Modal Header Bar */}
          <div className="flex items-center justify-between p-6 border-b-rule bg-[#0A0A0A]">
            <div>
              <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
                SECTOR INCIDENT DOSSIER // [{location.location_id.toUpperCase()}]
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-[#EDEDE8]">
                {location.location_name}
              </h2>
              <div className="font-mono-data text-xs text-[#EDEDE8]/60 mt-1">
                COORDINATES: {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E | TOTAL REPORTS: {location.report_count}
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] hover:text-[#0A0A0A] px-4 py-2 font-mono-data text-sm font-bold uppercase transition-colors border-2 border-[#0A0A0A] active:translate-x-0.5 active:translate-y-0.5"
            >
              CLOSE [ESC]
            </button>
          </div>

          {/* Modal Content Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 divide-y-4 divide-[#EDEDE8]/20">
            {/* Status Summary Banner */}
            <div className="pt-2">
              <div className="flex flex-wrap items-center justify-between gap-4 font-mono-data text-xs bg-[#EDEDE8]/5 border-2 border-[#EDEDE8]/30 p-4">
                <div>
                  <span className="text-[#EDEDE8]/60">SITUATION STATUS: </span>
                  <strong className="text-[#FFB800] uppercase font-bold">{location.status.replace("_", " ")}</strong>
                </div>
                <div>
                  <span className="text-[#EDEDE8]/60">CONFIDENCE: </span>
                  <strong className="text-[#EDEDE8]">{Math.round(location.confidence_score * 100)}%</strong>
                </div>
                <div>
                  <span className="text-[#EDEDE8]/60">SILENCE DURATION: </span>
                  <strong className="text-[#EDEDE8]">{location.silence_duration_hours !== null ? `${location.silence_duration_hours.toFixed(1)}h` : "NONE"}</strong>
                </div>
              </div>
              <p className="font-body-prose text-sm text-[#EDEDE8]/90 mt-3 italic">
                {location.status_reason}
              </p>
            </div>

            {/* Incidents Section */}
            <div className="pt-6">
              <div className="flex items-center justify-between font-mono-data text-xs mb-4">
                <span className="font-bold text-[#FFB800] uppercase">
                  DEDUPLICATED INCIDENT CLUSTERS ({incidents.length})
                </span>
                <span className="text-[#EDEDE8]/60">
                  COSINE THRESHOLD: ≥0.75 SIMILARITY
                </span>
              </div>

              {isLoading && (
                <div className="font-mono-data text-sm text-[#FFB800] p-8 border-2 border-[#EDEDE8]/20 text-center animate-pulse">
                  FUSING EMBEDDINGS AND FETCHING INCIDENT CLUSTERS...
                </div>
              )}

              {error && (
                <div className="font-mono-data text-sm text-[#E5484D] p-4 border-2 border-[#E5484D] bg-[#E5484D]/10">
                  ERROR: {error}
                </div>
              )}

              {!isLoading && incidents.length === 0 && (
                <div className="font-mono-data text-sm text-[#EDEDE8]/60 p-8 border-2 border-[#EDEDE8]/20 text-center">
                  NO INCIDENT REPORTS RECORDED FOR THIS SECTOR AT CURRENT SIMULATED TIME.
                </div>
              )}

              {/* Cluster Cards */}
              <div className="space-y-6">
                {incidents.map((cluster) => (
                  <div
                    key={cluster.cluster_id}
                    className="border-4 border-[#EDEDE8] bg-[#0A0A0A] p-5 space-y-4"
                  >
                    {/* Cluster Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#EDEDE8]/20 pb-3 font-mono-data text-xs">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#FFB800] text-[#0A0A0A] px-2 py-0.5 font-bold">
                          CLUSTER #{cluster.cluster_id}
                        </span>
                        <span className="border border-[#EDEDE8] px-2 py-0.5 text-[#EDEDE8] uppercase">
                          TAG: {cluster.damage_type}
                        </span>
                        {cluster.casualty_estimate !== null && (
                          <span className="bg-[#E5484D] text-[#EDEDE8] px-2 py-0.5 font-bold">
                            EST. CASUALTIES: {cluster.casualty_estimate}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span>CLUSTER CONFIDENCE: <strong className="text-[#3FB950] font-bold">{(cluster.confidence_score * 100).toFixed(1)}%</strong></span>
                        <span className="text-[#EDEDE8]/50 ml-2">({cluster.report_count} REPORTS)</span>
                      </div>
                    </div>

                    {/* Representative Text */}
                    <div>
                      <span className="font-mono-data text-[10px] text-[#FFB800] uppercase font-bold block mb-1">
                        REPRESENTATIVE CONSENSUS REPORT:
                      </span>
                      <blockquote className="font-body-prose text-base sm:text-lg text-[#EDEDE8] bg-[#EDEDE8]/5 p-3 border-l-4 border-[#FFB800]">
                        &quot;{cluster.representative_text}&quot;
                      </blockquote>
                    </div>

                    {/* Sources Breakdown */}
                    <div className="flex flex-wrap items-center gap-2 font-mono-data text-xs">
                      <span className="text-[#EDEDE8]/60">SOURCES:</span>
                      {Object.entries(cluster.sources_breakdown).map(([source, count]) => (
                        <span
                          key={source}
                          className="bg-[#EDEDE8]/10 border border-[#EDEDE8]/30 px-2 py-0.5 text-[#EDEDE8] uppercase"
                        >
                          {source}: {count}
                        </span>
                      ))}
                    </div>

                    {/* Contributing Reports Accordion / List */}
                    {cluster.reports && cluster.reports.length > 0 && (
                      <div className="border-t-2 border-[#EDEDE8]/10 pt-3">
                        <span className="font-mono-data text-[10px] text-[#EDEDE8]/60 uppercase font-bold block mb-2">
                          CONTRIBUTING RAW REPORTS & TRANSPARENT SCORING FORMULAS ({cluster.reports.length}):
                        </span>
                        <div className="space-y-3">
                          {cluster.reports.map((rep) => (
                            <div
                              key={rep.id}
                              className="bg-[#EDEDE8]/5 p-3 border border-[#EDEDE8]/20 font-mono-data text-xs space-y-2"
                            >
                              <div className="flex justify-between text-[#EDEDE8]/60">
                                <span>REPORT #{rep.id} // SOURCE: <strong className="text-[#FFB800] uppercase">{rep.source_type}</strong></span>
                                <span>TIMESTAMP: {new Date(rep.timestamp).toLocaleTimeString()}</span>
                              </div>

                              <p className="font-body-prose text-sm text-[#EDEDE8]">
                                &quot;{rep.raw_text}&quot;
                              </p>

                              {/* Explainable Factor Breakdown */}
                              {rep.score_breakdown && (
                                <div className="bg-[#0A0A0A] p-2 border border-[#EDEDE8]/30 text-[11px] text-[#EDEDE8]/80 space-y-1">
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#FFB800]">
                                    <span>Source Trust: {rep.score_breakdown.source_trust_weight.toFixed(2)}</span>
                                    <span>Coord Bonus: +{rep.score_breakdown.has_coordinates_bonus.toFixed(2)}</span>
                                    <span>Corroboration: +{rep.score_breakdown.corroboration_bonus.toFixed(2)}</span>
                                    <span>Decay: x{rep.score_breakdown.staleness_decay.toFixed(2)}</span>
                                    <span>Effective: <strong>{rep.score_breakdown.effective_score.toFixed(3)}</strong></span>
                                  </div>
                                  <div className="text-[10px] text-[#EDEDE8]/50 truncate">
                                    {rep.score_breakdown.formula_explanation}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t-rule bg-[#0A0A0A] flex justify-end">
            <button
              onClick={onClose}
              className="bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] px-6 py-2.5 font-mono-data text-xs font-bold uppercase transition-colors border-2 border-[#0A0A0A]"
            >
              DONE [CLOSE]
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
