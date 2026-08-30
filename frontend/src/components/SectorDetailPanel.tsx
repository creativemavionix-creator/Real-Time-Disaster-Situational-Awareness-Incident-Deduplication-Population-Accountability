"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IncidentClusterItem,
  LocationStatusItem,
  ReportItem,
  fetchLocationIncidents,
} from "@/lib/api";

interface SectorDetailPanelProps {
  location: LocationStatusItem | null;
  onClose: () => void;
  isAnalysis: boolean;
  onOpenPalikas?: (sectorId: string) => void;
}

export function SectorDetailPanel({
  location,
  onClose,
  isAnalysis,
  onOpenPalikas,
}: SectorDetailPanelProps) {
  const [incidents, setIncidents] = useState<IncidentClusterItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCluster, setExpandedCluster] = useState<number | null>(null);

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

  const getRecommendedAction = () => {
    switch (location.status) {
      case "verified_damaged":
        return "Deploy Urban SAR Heavy Battalion + Emergency Mobile Field Hospital.";
      case "blackout":
        return "Deploy High-Altitude UAV Aerial Reconnaissance + Satellite Comms Restorer.";
      case "unverified":
        return "Dispatch APF First-Responder Reconnaissance Patrol.";
      case "verified_safe":
        return "Maintain Staging Logistics Hub & Standing Monitoring.";
      default:
        return "Assess Field Situation.";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/40 dark:bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="w-full max-w-xl h-full bg-[#FAF9F5] dark:bg-[#0C0E12] border-l border-[#E5E4DC] dark:border-[#232733] shadow-2xl flex flex-col overflow-hidden text-[#111318] dark:text-[#F4F4F0]"
        >
          {/* Panel Header */}
          <div className="p-6 border-b border-[#E5E4DC] dark:border-[#232733] bg-[#F2F0E8]/50 dark:bg-[#13161D]/50 flex items-start justify-between gap-4">
            <div>
              <div className="font-mono-data text-[11px] text-[#5C6270] dark:text-[#9CA3AF] uppercase tracking-wider mb-1">
                SECTOR INSPECTION // {location.location_id.toUpperCase()}
              </div>
              <h2 className="font-display-calm font-extrabold text-2xl sm:text-3xl text-[#111318] dark:text-[#F4F4F0]">
                {location.location_name}
              </h2>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-lg border border-[#E5E4DC] dark:border-[#232733] text-xs font-mono-data text-[#5C6270] hover:text-[#111318] dark:hover:text-[#F4F4F0] cursor-pointer transition-colors"
            >
              [ESC ✕]
            </button>
          </div>

          {/* Panel Scrollable Body (4-Layer Progressive Hierarchy) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* LAYER 1: SUMMARY */}
            <div className="space-y-3">
              <div className="font-mono-data text-[10px] font-bold text-[#5C6270] dark:text-[#9CA3AF] uppercase tracking-wider">
                1. EXECUTIVE STATUS
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono-data text-xs">
                <div className="p-3 surface-calm">
                  <span className="text-[10px] text-[#5C6270] dark:text-[#9CA3AF] block uppercase">STATUS</span>
                  <strong className="text-sm font-bold text-[#E11D48] dark:text-[#FB7185] uppercase">
                    {location.status.replace("_", " ")}
                  </strong>
                </div>

                <div className="p-3 surface-calm">
                  <span className="text-[10px] text-[#5C6270] dark:text-[#9CA3AF] block uppercase">CONFIDENCE</span>
                  <strong className="text-sm font-bold text-[#059669] dark:text-[#34D399]">
                    {(location.confidence_score * 100).toFixed(0)}%
                  </strong>
                </div>

                <div className="p-3 surface-calm">
                  <span className="text-[10px] text-[#5C6270] dark:text-[#9CA3AF] block uppercase">RAW REPORTS</span>
                  <strong className="text-sm font-bold">{location.report_count}</strong>
                </div>
              </div>
            </div>

            {/* LAYER 2: EXPLANATION */}
            <div className="space-y-2">
              <div className="font-mono-data text-[10px] font-bold text-[#5C6270] dark:text-[#9CA3AF] uppercase tracking-wider">
                2. SITUATIONAL EXPLANATION
              </div>
              <p className="font-body-prose text-sm text-[#111318] dark:text-[#F4F4F0] p-4 rounded-xl bg-[#F2F0E8]/70 dark:bg-[#13161D]/70 border border-[#E5E4DC] dark:border-[#232733] leading-relaxed">
                {location.status_reason}
              </p>
            </div>

            {/* LAYER 3: ACTION */}
            <div className="space-y-2">
              <div className="font-mono-data text-[10px] font-bold text-[#5C6270] dark:text-[#9CA3AF] uppercase tracking-wider">
                3. RECOMMENDED OPERATIONAL DIRECTIVE
              </div>
              <div className="p-4 rounded-xl bg-[#2563EB]/5 dark:bg-[#2563EB]/10 border-l-4 border-[#2563EB] text-sm font-body-prose text-[#111318] dark:text-[#F4F4F0]">
                <strong>{getRecommendedAction()}</strong>
              </div>
            </div>

            {/* LAYER 4: SHOW ME THE EVIDENCE (Progressive Accordions) */}
            <div className="space-y-3 pt-2">
              <div className="font-mono-data text-[10px] font-bold text-[#5C6270] dark:text-[#9CA3AF] uppercase tracking-wider flex items-center justify-between">
                <span>4. EVIDENCE DOSSIER & CLUSTERS ({incidents.length})</span>
                {onOpenPalikas && (
                  <button
                    onClick={() => onOpenPalikas(location.location_id)}
                    type="button"
                    className="text-[10px] text-[#2563EB] dark:text-[#60A5FA] font-bold hover:underline cursor-pointer"
                  >
                    [VIEW 2021 CENSUS PALIKAS →]
                  </button>
                )}
              </div>

              {isLoading && (
                <div className="py-8 text-center font-mono-data text-xs text-[#5C6270] animate-pulse">
                  [SCORING EVIDENCE & DEDUPLICATING INCIDENTS...]
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-[#E11D48] font-mono-data">
                  {error}
                </div>
              )}

              {!isLoading && incidents.length === 0 && (
                <div className="p-6 text-center text-xs font-mono-data text-[#5C6270] surface-calm">
                  NO INCIDENTS RECORDED AT CURRENT SIMULATION TIMELINE.
                </div>
              )}

              <div className="space-y-3">
                {incidents.map((cluster) => {
                  const isExpanded = expandedCluster === cluster.cluster_id;

                  return (
                    <div
                      key={cluster.cluster_id}
                      className="surface-calm p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E4DC] dark:border-[#232733] pb-2.5">
                        <div className="flex items-center gap-2 font-mono-data text-xs">
                          <span className="font-bold">CLUSTER #{cluster.cluster_id}</span>
                          <span className="chip-neutral">{cluster.damage_type}</span>
                          {cluster.casualty_estimate !== null && (
                            <span className="chip-critical">{cluster.casualty_estimate} CASUALTIES</span>
                          )}
                        </div>

                        <div className="font-mono-data text-xs text-[#059669] dark:text-[#34D399] font-bold">
                          {(cluster.confidence_score * 100).toFixed(0)}% CONFIDENCE
                        </div>
                      </div>

                      <blockquote className="font-body-prose text-xs sm:text-sm text-[#111318] dark:text-[#F4F4F0] italic">
                        &ldquo;{cluster.representative_text}&rdquo;
                      </blockquote>

                      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono-data text-[#5C6270] dark:text-[#9CA3AF] pt-1">
                        <div className="flex gap-2">
                          {Object.entries(cluster.sources_breakdown).map(([src, count]) => (
                            <span key={src} className="uppercase">
                              {src}: <strong>{String(count)}</strong>
                            </span>
                          ))}
                        </div>

                        {cluster.reports && cluster.reports.length > 0 && (
                          <button
                            onClick={() => setExpandedCluster(isExpanded ? null : cluster.cluster_id)}
                            type="button"
                            className="text-[#2563EB] dark:text-[#60A5FA] font-bold hover:underline cursor-pointer"
                          >
                            {isExpanded ? "HIDE RAW LOGS" : `VIEW ${cluster.reports.length} RAW LOGS`}
                          </button>
                        )}
                      </div>

                      {/* Contributing Raw Reports */}
                      {isExpanded && cluster.reports && (
                        <div className="mt-3 space-y-2 pt-2 border-t border-[#E5E4DC] dark:border-[#232733]">
                          {cluster.reports.map((rep: ReportItem, idx: number) => (
                            <div
                              key={`${rep.id}-${idx}`}
                              className="p-3 rounded-lg bg-[#F2F0E8]/50 dark:bg-[#13161D]/50 border border-[#E5E4DC] dark:border-[#232733] font-mono-data text-xs space-y-1"
                            >
                              <div className="flex justify-between text-[10px] text-[#5C6270]">
                                <span className="font-bold uppercase text-[#111318] dark:text-[#F4F4F0]">{rep.source_type}</span>
                                <span>{new Date(rep.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="font-body-prose text-xs text-[#111318] dark:text-[#F4F4F0]">
                                {rep.raw_text}
                              </p>
                              {isAnalysis && rep.score_breakdown && (
                                <div className="text-[10px] text-[#5C6270] pt-1 border-t border-[#E5E4DC]/50 dark:border-[#232733]/50 flex justify-between">
                                  <span>SCORE: {rep.score_breakdown.effective_score?.toFixed(2)}</span>
                                  <span>TRUST WEIGHT: {rep.score_breakdown.source_trust_weight}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
