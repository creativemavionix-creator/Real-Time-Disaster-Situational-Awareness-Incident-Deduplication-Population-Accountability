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
    <section id="situation-matrix" className="p-6 sm:p-10 lg:p-14 border-b border-[#EDEDE8]/10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 mb-8 border-b border-[#EDEDE8]/10">
        <div>
          <span className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest block mb-1">
            REGIONAL STATUS // 8 MONITORED SECTORS
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#EDEDE8]">
            SITUATION MATRIX
          </h2>
          <p className="font-body-prose text-sm text-[#EDEDE8]/70 mt-1 max-w-2xl">
            Real-time status calculated from fused field reports, verified medical intake logs, and spatial physics inferences.
          </p>
        </div>

        <div className="text-xs font-mono-data text-[#EDEDE8]/50 text-left sm:text-right">
          SELECT ANY SECTOR TO INSPECT EVIDENCE & RAW LOGS →
        </div>
      </div>

      {/* 8-Sector Refined Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

  // Derive human-readable recommended action based on status
  const getRecommendedAction = (status: LocationStatusType, name: string) => {
    switch (status) {
      case "verified_damaged":
        return "Deploy Urban SAR + Emergency Medical Triage";
      case "blackout":
        return "Deploy Aerial Reconnaissance + Satellite Comms";
      case "unverified":
        return "Dispatch First-Responder Reconnaissance Unit";
      case "verified_safe":
        return "Maintain Standing Monitoring & Logistics Hub";
      default:
        return "Assess Field Situation";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={onSelect}
      className={`surface-card p-6 flex flex-col justify-between cursor-pointer group focus-visible:outline-2 focus-visible:outline-[#FFB800] ${
        location.status === "verified_damaged" || location.status === "blackout"
          ? "hover:border-[#E5484D]/50"
          : "hover:border-[#EDEDE8]/30"
      }`}
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
        {/* Top Meta: Sector ID */}
        <div className="flex items-center justify-between text-xs font-mono-data text-[#EDEDE8]/50 pb-2 border-b border-[#EDEDE8]/10 mb-4">
          <span>SECTOR 0{index + 1}</span>
          <span className="uppercase text-[#EDEDE8]/70 font-semibold">{location.location_id}</span>
        </div>

        {/* Sector Name */}
        <h3 className="font-display text-2xl font-bold text-[#EDEDE8] group-hover:text-[#FFB800] transition-colors mb-3">
          {location.location_name}
        </h3>

        {/* Status Badge */}
        <div
          className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-mono-data font-bold tracking-wide uppercase mb-4 border"
          style={{
            borderColor: statusConfig.color,
            backgroundColor: `${statusConfig.color}15`,
            color: statusConfig.color,
          }}
        >
          <span className="w-1.5 h-1.5" style={{ backgroundColor: statusConfig.color }} />
          <span>{statusConfig.label}</span>
        </div>

        {/* Plain Language Situation Explanation */}
        <p className="font-body-prose text-xs text-[#EDEDE8]/80 line-clamp-2 mb-4 leading-relaxed">
          {location.status_reason}
        </p>

        {/* Operational Recommended Action (Level 3) */}
        <div className="bg-[#EDEDE8]/3 border-l-2 border-[#FFB800] p-2.5 mb-4 text-xs font-body-prose">
          <span className="font-mono-data text-[10px] text-[#FFB800] uppercase font-bold block mb-0.5">
            RECOMMENDED ACTION:
          </span>
          <span className="text-[#EDEDE8]/90">
            {getRecommendedAction(location.status, location.location_name)}
          </span>
        </div>
      </div>

      {/* Footer Details / Metrics */}
      <div className="pt-4 border-t border-[#EDEDE8]/10 text-xs font-mono-data">
        <div className="flex items-center justify-between text-[#EDEDE8]/60 mb-2">
          <span>INCIDENT CLUSTERS:</span>
          <strong className="text-[#EDEDE8]">{location.incident_cluster_count}</strong>
        </div>

        {/* Analysis Mode Progressive Exposure */}
        {isAnalysis && (
          <div className="mt-2 pt-2 border-t border-[#EDEDE8]/10 space-y-1 text-[11px] text-[#EDEDE8]/50">
            <div className="flex justify-between">
              <span>CONFIDENCE:</span>
              <strong className="text-[#3FB950]">{(location.confidence_score * 100).toFixed(0)}%</strong>
            </div>
            <div className="flex justify-between">
              <span>COORDINATES:</span>
              <span>{location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E</span>
            </div>
            <div className="flex justify-between">
              <span>SILENCE DURATION:</span>
              <span>{location.silence_duration_hours ? `${location.silence_duration_hours.toFixed(1)}h` : "ACTIVE"}</span>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-[#FFB800] text-xs group-hover:translate-x-0.5 transition-transform">
          <span className="font-bold">INSPECT EVIDENCE</span>
          <span>→</span>
        </div>
      </div>
    </motion.div>
  );
}

function getStatusConfig(status: LocationStatusType): { label: string; color: string } {
  switch (status) {
    case "verified_safe":
      return { label: "VERIFIED SAFE", color: "#3FB950" };
    case "verified_damaged":
      return { label: "VERIFIED CRITICAL", color: "#E5484D" };
    case "blackout":
      return { label: "CRITICAL BLACKOUT", color: "#E5484D" };
    case "unverified":
    default:
      return { label: "UNVERIFIED REPORT", color: "#FFB800" };
  }
}
