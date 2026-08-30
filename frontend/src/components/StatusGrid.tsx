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
    <section id="situation-matrix" className="py-16 sm:py-24 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 mb-8 border-b border-[#E5E4DC] dark:border-[#232733]">
        <div className="space-y-2">
          <div className="font-mono-data text-xs text-[#D97706] dark:text-[#FBBF24] font-bold uppercase tracking-wider">
            08 // OPERATIONAL COMMAND MATRIX
          </div>
          <h2 className="font-display-calm font-extrabold text-3xl sm:text-5xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
            Central Nepal Sector Matrix
          </h2>
          <p className="font-body-prose text-sm sm:text-base text-[#5C6270] dark:text-[#9CA3AF] max-w-2xl leading-relaxed">
            Real-time status calculated from fused civilian logs, verified hospital triage intake, and spatial physics negative-evidence inference.
          </p>
        </div>

        <div className="font-mono-data text-xs text-[#5C6270] dark:text-[#9CA3AF]">
          CLICK ANY SECTOR TO INSPECT EVIDENCE DOSSIER →
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
        return "Deploy Heavy SAR + Emergency Trauma Unit";
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
      className="surface-calm p-6 flex flex-col justify-between cursor-pointer group"
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
        <div className="flex items-center justify-between text-xs font-mono-data text-[#5C6270] pb-2 border-b border-[#E5E4DC] dark:border-[#232733] mb-3">
          <span>SECTOR 0{index + 1}</span>
          <span className="uppercase font-semibold text-[#111318] dark:text-[#F4F4F0]">{location.location_id}</span>
        </div>

        {/* Sector Name */}
        <h3 className="font-display-calm font-bold text-xl text-[#111318] dark:text-[#F4F4F0] group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors mb-2.5">
          {location.location_name}
        </h3>

        {/* Status Pill Badge */}
        <div className="mb-3.5">
          <span className={statusConfig.chipClass}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {/* Status Reason */}
        <p className="font-body-prose text-xs text-[#5C6270] dark:text-[#9CA3AF] line-clamp-2 mb-4 leading-relaxed">
          {location.status_reason}
        </p>

        {/* Recommended Action */}
        <div className="p-3 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border-l-3 border-[#2563EB] mb-4 text-xs font-body-prose">
          <span className="font-mono-data text-[10px] font-bold text-[#2563EB] dark:text-[#60A5FA] uppercase block mb-0.5">
            RECOMMENDED ACTION:
          </span>
          <span className="text-[#111318] dark:text-[#F4F4F0] font-medium">
            {getRecommendedAction(location.status)}
          </span>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="pt-3 border-t border-[#E5E4DC] dark:border-[#232733] font-mono-data text-xs text-[#5C6270]">
        <div className="flex items-center justify-between mb-2">
          <span>INCIDENT CLUSTERS:</span>
          <strong className="text-[#111318] dark:text-[#F4F4F0] font-bold">{location.incident_cluster_count}</strong>
        </div>

        {isAnalysis && (
          <div className="pt-2 border-t border-[#E5E4DC] dark:border-[#232733] space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>CONFIDENCE:</span>
              <strong className="text-[#059669] dark:text-[#34D399]">{(location.confidence_score * 100).toFixed(0)}%</strong>
            </div>
            <div className="flex justify-between">
              <span>COORDINATES:</span>
              <span>{location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E</span>
            </div>
          </div>
        )}

        <div className="mt-2.5 flex items-center justify-between text-[#2563EB] dark:text-[#60A5FA] text-xs font-bold group-hover:translate-x-1 transition-transform">
          <span>INSPECT DOSSIER</span>
          <span>→</span>
        </div>
      </div>
    </motion.div>
  );
}

function getStatusConfig(status: LocationStatusType): { label: string; chipClass: string; dotClass: string } {
  switch (status) {
    case "verified_safe":
      return {
        label: "VERIFIED SAFE",
        chipClass: "chip-safe",
        dotClass: "bg-[#059669]",
      };
    case "verified_damaged":
      return {
        label: "VERIFIED CRITICAL",
        chipClass: "chip-critical",
        dotClass: "bg-[#E11D48] animate-ping",
      };
    case "blackout":
      return {
        label: "CRITICAL BLACKOUT",
        chipClass: "chip-critical",
        dotClass: "bg-[#E11D48]",
      };
    case "unverified":
    default:
      return {
        label: "UNVERIFIED REPORT",
        chipClass: "chip-warning",
        dotClass: "bg-[#D97706]",
      };
  }
}
