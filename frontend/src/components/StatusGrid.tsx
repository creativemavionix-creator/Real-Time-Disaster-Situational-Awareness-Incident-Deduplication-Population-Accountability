"use client";

import React from "react";
import { motion } from "framer-motion";
import { LocationStatusItem, LocationStatusType } from "@/lib/api";
import { useViewMode } from "@/context/ViewModeContext";
import { ArrowRight, Radio, ShieldAlert, Activity } from "lucide-react";

interface StatusGridProps {
  locations: LocationStatusItem[];
  onSelectLocation: (locationId: string) => void;
}

export function StatusGrid({ locations, onSelectLocation }: StatusGridProps) {
  const { isAnalysis } = useViewMode();

  return (
    <section id="situation-matrix" className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 mb-8 border-b border-white/10">
        <div className="space-y-2">
          <div className="font-mono-data text-[10px] text-[#D97706] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
            08 // OPERATIONAL COMMAND MATRIX
          </div>
          <h2 className="font-display-calm font-medium text-3xl sm:text-4xl text-white tracking-tight">
            Central Nepal Sector Matrix
          </h2>
          <p className="font-body-prose text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
            Real-time status calculated from fused civilian logs, verified hospital triage intake, and spatial physics negative-evidence inference.
          </p>
        </div>

        <div className="font-mono-data text-xs text-[#64748B]">
          CLICK ANY SECTOR TO INSPECT EVIDENCE DOSSIER →
        </div>
      </div>

      {/* 8-Sector Refined Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      transition={{ duration: 0.3, delay: index * 0.03 }}
      onClick={onSelect}
      className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-lg"
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
        <div className="flex items-center justify-between text-xs font-mono-data text-[#64748B] pb-2 border-b border-white/5 mb-3">
          <span>SECTOR 0{index + 1}</span>
          <span className="uppercase font-semibold text-white">{location.location_id}</span>
        </div>

        {/* Sector Name */}
        <h3 className="font-display-calm font-medium text-xl text-white group-hover:text-[#60A5FA] transition-colors mb-2">
          {location.location_name}
        </h3>

        {/* Status Pill Badge */}
        <div className="mb-3">
          <span className={statusConfig.chipClass}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {/* Status Reason */}
        <p className="font-body-prose text-xs text-[#94A3B8] line-clamp-2 mb-4 leading-relaxed">
          {location.status_reason}
        </p>

        {/* Recommended Action */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 border-l-2 border-l-[#3B82F6] mb-4 text-xs font-body-prose space-y-0.5">
          <span className="font-mono-data text-[10px] font-bold text-[#60A5FA] uppercase block">
            RECOMMENDED ACTION:
          </span>
          <span className="text-white font-medium text-xs">
            {getRecommendedAction(location.status)}
          </span>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="pt-3 border-t border-white/5 font-mono-data text-xs text-[#94A3B8]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#64748B]">INCIDENT CLUSTERS:</span>
          <strong className="text-white font-bold">{location.incident_cluster_count}</strong>
        </div>

        {isAnalysis && (
          <div className="pt-2 border-t border-white/5 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#64748B]">CONFIDENCE:</span>
              <strong className="text-[#34D399]">{(location.confidence_score * 100).toFixed(0)}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">COORDINATES:</span>
              <span>{location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E</span>
            </div>
          </div>
        )}

        <div className="mt-2.5 flex items-center justify-between text-[#60A5FA] text-xs font-bold group-hover:translate-x-1 transition-transform">
          <span>INSPECT DOSSIER</span>
          <ArrowRight className="w-3.5 h-3.5" />
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
