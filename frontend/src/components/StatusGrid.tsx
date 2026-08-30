"use client";

import React from "react";
import { motion } from "framer-motion";
import { LocationStatusItem, LocationStatusType } from "@/lib/api";
import { useViewMode } from "@/context/ViewModeContext";

interface StatusGridProps {
  locations: LocationStatusItem[];
  onSelectLocation: (locationId: string) => void;
}

export function StatusGrid({ locations, onSelectLocation }: StatusGridProps) {
  const { isAnalysis } = useViewMode();

  return (
    <section id="situation-matrix" className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 mb-8 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="prism-badge-cyan mb-2">
            <span>📡</span>
            <span>REGIONAL TELEMETRY // 8 MONITORED SECTORS</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            Live Central Nepal Situation Matrix
          </h2>
          <p className="font-body-prose text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Real-time sector status calculated from fused citizen reports, verified hospital triage intake, and spatial physics damage inferences.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          SELECT ANY SECTOR CARD TO INSPECT EVIDENCE DOSSIER →
        </div>
      </div>

      {/* 8-Sector Refined Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {locations.map((loc, idx) => (
          <LocationCard
            key={`${loc.location_id}-${idx}`}
            location={loc}
            index={idx}
            isAnalysis={isAnalysis}
            onSelect={() => onSelectLocation(loc.location_id)}
          />
        ))}
      </div>
    </section>
  );
}

interface LocationCardProps {
  location: LocationStatusItem;
  index: number;
  isAnalysis: boolean;
  onSelect: () => void;
}

function LocationCard({ location, index, isAnalysis, onSelect }: LocationCardProps) {
  const statusConfig = getStatusConfig(location.status);

  const getRecommendedAction = (status: LocationStatusType) => {
    switch (status) {
      case "verified_damaged":
        return "Deploy Urban SAR + Medical Trauma Column";
      case "blackout":
        return "Deploy High-Altitude UAV & Satellite Comms";
      case "unverified":
        return "Dispatch APF Reconnaissance Patrol";
      case "verified_safe":
        return "Maintain Staging Logistics Hub";
      default:
        return "Assess Field Telemetry";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={onSelect}
      className="prism-card p-6 flex flex-col justify-between cursor-pointer group"
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div>
        {/* Top Meta */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 dark:text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
          <span>SECTOR 0{index + 1}</span>
          <span className="uppercase font-semibold text-slate-600 dark:text-slate-400">{location.location_id}</span>
        </div>

        {/* Sector Name */}
        <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors mb-2.5">
          {location.location_name}
        </h3>

        {/* Status Pill Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3.5 border ${statusConfig.badgeClass}`}
        >
          <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />
          <span>{statusConfig.label}</span>
        </div>

        {/* Status Reason */}
        <p className="font-body-prose text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {location.status_reason}
        </p>

        {/* Recommended Action */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-l-3 border-[#0088A9] mb-4 text-xs font-body-prose">
          <span className="font-mono text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase block mb-0.5">
            RECOMMENDED ACTION:
          </span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">
            {getRecommendedAction(location.status)}
          </span>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 font-mono text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-between mb-2">
          <span>INCIDENT CLUSTERS:</span>
          <strong className="text-slate-800 dark:text-slate-200 font-bold">{location.incident_cluster_count}</strong>
        </div>

        {isAnalysis && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>CONFIDENCE:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{(location.confidence_score * 100).toFixed(0)}%</strong>
            </div>
            <div className="flex justify-between">
              <span>COORDINATES:</span>
              <span>{location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E</span>
            </div>
          </div>
        )}

        <div className="mt-2.5 flex items-center justify-between text-cyan-600 dark:text-cyan-400 text-xs font-bold group-hover:translate-x-1 transition-transform">
          <span>INSPECT DOSSIER</span>
          <span>→</span>
        </div>
      </div>
    </motion.div>
  );
}

function getStatusConfig(status: LocationStatusType): { label: string; badgeClass: string; dotClass: string } {
  switch (status) {
    case "verified_safe":
      return {
        label: "VERIFIED SAFE",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        dotClass: "bg-emerald-500",
      };
    case "verified_damaged":
      return {
        label: "VERIFIED CRITICAL",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
        dotClass: "bg-rose-500 animate-pulse",
      };
    case "blackout":
      return {
        label: "CRITICAL BLACKOUT",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
        dotClass: "bg-purple-500 animate-pulse",
      };
    case "unverified":
    default:
      return {
        label: "UNVERIFIED REPORT",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        dotClass: "bg-amber-500",
      };
  }
}
