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

  // Fetch incidents only when the specific sector id changes
  useEffect(() => {
    if (!location?.location_id) {
      setIncidents([]);
      return;
    }

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

    return () => {
      isMounted = false;
    };
  }, [location?.location_id]);

  // Global ESC key listener
  useEffect(() => {
    if (!location) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [location, onClose]);

  const getRecommendedAction = () => {
    if (!location) return "Assess Field Situation.";
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
      {location && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-[500] flex justify-end bg-black/70 backdrop-blur-xs cursor-pointer"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="w-full max-w-xl h-full bg-[#0C0E12]/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-[#F3F4F6] cursor-default"
          >
            {/* Panel Header */}
            <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-start justify-between gap-4">
              <div>
                <div className="font-mono-data text-[10px] text-[#94A3B8] uppercase tracking-[0.25em] mb-1">
                  SECTOR INSPECTION // {location.location_id.toUpperCase()}
                </div>
                <h2 className="font-display-calm font-medium text-3xl text-white">
                  {location.location_name}
                </h2>
              </div>

              <button
                onClick={onClose}
                type="button"
                className="px-3 py-1.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-xs font-mono-data text-[#94A3B8] hover:text-white cursor-pointer transition-all flex items-center gap-2"
                title="Close panel (Esc)"
              >
                <span>ESC</span>
                <span className="text-white font-bold">✕</span>
              </button>
            </div>

            {/* Panel Scrollable Body (4-Layer Progressive Hierarchy) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {/* LAYER 1: SUMMARY */}
              <div className="space-y-3">
                <div className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em]">
                  1. EXECUTIVE STATUS
                </div>
                <div className="grid grid-cols-3 gap-3 font-mono-data text-xs">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[9px] text-[#64748B] block uppercase tracking-wider mb-1">STATUS</span>
                    <strong className="text-sm font-bold text-[#E11D48] uppercase">
                      {location.status.replace("_", " ")}
                    </strong>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[9px] text-[#64748B] block uppercase tracking-wider mb-1">CONFIDENCE</span>
                    <strong className="text-sm font-bold text-[#059669]">
                      {(location.confidence_score * 100).toFixed(0)}%
                    </strong>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[9px] text-[#64748B] block uppercase tracking-wider mb-1">RAW REPORTS</span>
                    <strong className="text-sm font-bold text-white">{location.report_count}</strong>
                  </div>
                </div>
              </div>

              {/* LAYER 2: EXPLANATION */}
              <div className="space-y-2">
                <div className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em]">
                  2. SITUATIONAL EXPLANATION
                </div>
                <p className="font-body-prose text-sm text-[#94A3B8] p-4 rounded-xl bg-white/[0.02] border border-white/5 leading-relaxed">
                  {location.status_reason}
                </p>
              </div>

              {/* LAYER 3: ACTION */}
              <div className="space-y-2">
                <div className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em]">
                  3. RECOMMENDED OPERATIONAL DIRECTIVE
                </div>
                <div className="p-4 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/30 text-sm font-body-prose text-white">
                  <strong>{getRecommendedAction()}</strong>
                </div>
              </div>

              {/* LAYER 4: SHOW ME THE EVIDENCE (Progressive Accordions) */}
              <div className="space-y-3 pt-2">
                <div className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em] flex items-center justify-between">
                  <span>4. EVIDENCE DOSSIER & CLUSTERS ({incidents.length})</span>
                  {onOpenPalikas && (
                    <button
                      onClick={() => onOpenPalikas(location.location_id)}
                      type="button"
                      className="text-[10px] text-[#60A5FA] hover:text-white font-bold tracking-wider hover:underline cursor-pointer"
                    >
                      [VIEW 2021 CENSUS PALIKAS →]
                    </button>
                  )}
                </div>

                {isLoading && (
                  <div className="py-8 text-center font-mono-data text-xs text-[#94A3B8] animate-pulse">
                    [SCORING EVIDENCE & DEDUPLICATING INCIDENTS...]
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-[#FB7185] font-mono-data">
                    {error}
                  </div>
                )}

                {!isLoading && incidents.length === 0 && (
                  <div className="p-6 text-center text-xs font-mono-data text-[#64748B] bg-white/[0.02] border border-white/5 rounded-xl">
                    NO INCIDENTS RECORDED AT CURRENT SIMULATION TIMELINE.
                  </div>
                )}

                <div className="space-y-3">
                  {incidents.map((cluster) => {
                    const isExpanded = expandedCluster === cluster.cluster_id;

                    return (
                      <div
                        key={cluster.cluster_id}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                          <div className="flex items-center gap-2 font-mono-data text-xs">
                            <span className="font-bold text-white">CLUSTER #{cluster.cluster_id}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-[#94A3B8]">
                              {cluster.damage_type}
                            </span>
                            {cluster.casualty_estimate !== null && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-[#E11D48]/20 text-[#FB7185] font-bold">
                                {cluster.casualty_estimate} CASUALTIES
                              </span>
                            )}
                          </div>

                          <div className="font-mono-data text-xs text-[#34D399] font-bold">
                            {(cluster.confidence_score * 100).toFixed(0)}% CONFIDENCE
                          </div>
                        </div>

                        <blockquote className="font-body-prose text-xs sm:text-sm text-[#94A3B8] italic">
                          &ldquo;{cluster.representative_text}&rdquo;
                        </blockquote>

                        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono-data text-[#64748B] pt-1">
                          <div className="flex gap-3">
                            {Object.entries(cluster.sources_breakdown).map(([src, count]) => (
                              <span key={src} className="uppercase">
                                {src}: <strong className="text-white">{String(count)}</strong>
                              </span>
                            ))}
                          </div>

                          {cluster.reports && cluster.reports.length > 0 && (
                            <button
                              onClick={() => setExpandedCluster(isExpanded ? null : cluster.cluster_id)}
                              type="button"
                              className="text-[#60A5FA] hover:text-white font-bold hover:underline cursor-pointer"
                            >
                              {isExpanded ? "HIDE RAW LOGS" : `VIEW ${cluster.reports.length} RAW LOGS`}
                            </button>
                          )}
                        </div>

                        {/* Contributing Raw Reports */}
                        {isExpanded && cluster.reports && (
                          <div className="mt-3 space-y-2 pt-2 border-t border-white/5">
                            {cluster.reports.map((rep: ReportItem, idx: number) => (
                              <div
                                key={`${rep.id}-${idx}`}
                                className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono-data text-xs space-y-1"
                              >
                                <div className="flex justify-between text-[10px] text-[#64748B]">
                                  <span className="font-bold uppercase text-[#F3F4F6]">{rep.source_type}</span>
                                  <span>{new Date(rep.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="font-body-prose text-xs text-[#94A3B8]">
                                  {rep.raw_text}
                                </p>
                                {isAnalysis && rep.score_breakdown && (
                                  <div className="text-[10px] text-[#64748B] pt-1 border-t border-white/5 flex justify-between">
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
      )}
    </AnimatePresence>
  );
}
