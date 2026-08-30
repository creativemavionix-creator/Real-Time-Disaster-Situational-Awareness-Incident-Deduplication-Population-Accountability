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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 shadow-2xl"
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="space-y-1">
              <div className="prism-badge-cyan mb-1">
                <span>SECTOR DOSSIER</span>
                <span>//</span>
                <span>{location.location_id.toUpperCase()}</span>
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                {location.location_name}
              </h2>
              <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
                {location.status_reason}
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-mono text-xs font-bold uppercase rounded-full transition-all border border-slate-200 dark:border-slate-700 cursor-pointer text-slate-700 dark:text-slate-300"
            >
              CLOSE [ESC]
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Status Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">STATUS</span>
                <strong className="text-cyan-700 dark:text-cyan-400 font-bold uppercase text-sm">
                  {location.status.replace("_", " ")}
                </strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">CONFIDENCE</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  {(location.confidence_score * 100).toFixed(0)}%
                </strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">RAW REPORTS</span>
                <strong className="text-slate-800 dark:text-slate-200 font-bold text-sm">{location.report_count}</strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">COORDINATES</span>
                <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold">
                  {location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E
                </span>
              </div>
            </div>

            {isLoading && (
              <div className="py-12 text-center font-mono text-xs text-cyan-600 dark:text-cyan-400">
                ANALYZING INCIDENT CLUSTERS & SCORING EVIDENCE...
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 font-mono text-xs text-rose-700 dark:text-rose-300">
                [DOSSIER_ERROR]: {error}
              </div>
            )}

            {!isLoading && !error && incidents.length === 0 && (
              <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-400">
                NO INCIDENT REPORTS RECORDED FOR THIS SECTOR AT CURRENT SIMULATED TIME.
              </div>
            )}

            {/* Clusters List */}
            <div className="space-y-4">
              <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                CONFIRMED INCIDENT CLUSTERS ({incidents.length})
              </div>

              {incidents.map((cluster, cIdx) => {
                const clusterKey = `${cluster.location_id}-${cluster.cluster_id}-${cIdx}`;
                const isExpanded = !!expandedReports[clusterKey];

                return (
                  <div
                    key={clusterKey}
                    className="prism-card p-5 sm:p-6 space-y-4"
                  >
                    {/* Cluster Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                        <span className="bg-[#0088A9] text-white px-2.5 py-0.5 rounded-full font-bold">
                          CLUSTER #{cluster.cluster_id}
                        </span>
                        <span className="border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full text-slate-700 dark:text-slate-300 uppercase text-[11px]">
                          TAG: {cluster.damage_type}
                        </span>
                        {cluster.casualty_estimate !== null && (
                          <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                            EST. CASUALTIES: {cluster.casualty_estimate}
                          </span>
                        )}
                      </div>

                      <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        CONFIDENCE: <strong className="text-emerald-600 dark:text-emerald-400">{(cluster.confidence_score * 100).toFixed(0)}%</strong>
                        <span className="ml-2">({cluster.report_count} reports)</span>
                      </div>
                    </div>

                    {/* Representative Narrative */}
                    <div>
                      <span className="font-mono text-[10px] text-cyan-700 dark:text-cyan-400 uppercase font-bold block mb-1">
                        CONSENSUS NARRATIVE:
                      </span>
                      <blockquote className="font-body-prose text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border-l-3 border-[#0088A9]">
                        &quot;{cluster.representative_text}&quot;
                      </blockquote>
                    </div>

                    {/* Sources Breakdown */}
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400">SOURCES:</span>
                      {Object.entries(cluster.sources_breakdown).map(([source, count]) => (
                        <span
                          key={source}
                          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full text-slate-700 dark:text-slate-300 uppercase text-[11px]"
                        >
                          {source}: {String(count)}
                        </span>
                      ))}
                    </div>

                    {/* Contributing Reports Accordion */}
                    {cluster.reports && cluster.reports.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => toggleReportsAccordion(clusterKey)}
                          className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{isExpanded ? "▼ HIDE" : "► VIEW"} RAW CONTRIBUTING REPORTS ({cluster.reports.length})</span>
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2 font-mono text-xs">
                            {cluster.reports.map((rep: ReportItem, rIdx) => (
                              <div
                                key={`${rep.id}-${rIdx}`}
                                className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5"
                              >
                                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                                  <span className="uppercase font-bold text-slate-800 dark:text-slate-200">
                                    SOURCE: {rep.source_type}
                                  </span>
                                  <span>{new Date(rep.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="font-body-prose text-xs text-slate-700 dark:text-slate-300">
                                  {rep.raw_text}
                                </p>
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
