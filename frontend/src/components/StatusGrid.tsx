"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LocationStatusItem, LocationStatusType } from "@/lib/api";

interface StatusGridProps {
  locations: LocationStatusItem[];
  onSelectLocation: (locationId: string) => void;
}

export function StatusGrid({ locations, onSelectLocation }: StatusGridProps) {
  return (
    <section id="situation-matrix" className="p-6 md:p-12">
      {/* Section Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b-rule pb-4 mb-8">
        <div>
          <span className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest block mb-1">
            SECTOR TELEMETRY // 8 FIXED CENTROIDS
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold uppercase text-[#EDEDE8]">
            SITUATION MATRIX
          </h2>
        </div>
        <div className="font-mono-data text-xs text-[#EDEDE8]/70 text-right">
          CLICK ANY SECTOR TO INSPECT DEDUPLICATED CLUSTERS & RAW DISASTER LOGS [→]
        </div>
      </div>

      {/* 8-Sector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-4 border-[#EDEDE8] divide-y-4 md:divide-y-0 md:divide-x-4 md:divide-[#EDEDE8] bg-[#0A0A0A]">
        {locations.map((loc, idx) => (
          <LocationCard
            key={loc.location_id}
            location={loc}
            index={idx}
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
  onSelect: () => void;
}

function LocationCard({ location, index, onSelect }: LocationCardProps) {
  const statusConfig = getStatusConfig(location.status);
  const confPercent = Math.round(location.confidence_score * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={onSelect}
      className={`relative flex flex-col justify-between p-6 bg-[#0A0A0A] hover:bg-[#EDEDE8]/5 cursor-pointer transition-colors duration-150 border-b-4 md:border-b-0 border-[#EDEDE8] group focus-visible:outline-4 focus-visible:outline-[#FFB800]`}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Card Header: Sector ID & Coords */}
      <div>
        <div className="flex items-center justify-between font-mono-data text-xs text-[#EDEDE8]/60 pb-2 border-b-2 border-[#EDEDE8]/20 mb-3">
          <span className="font-bold text-[#EDEDE8]">
            SECTOR 0{index + 1} // [{location.location_id.toUpperCase()}]
          </span>
          <span>
            {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E
          </span>
        </div>

        {/* Location Name */}
        <h3 className="font-display text-2xl font-bold uppercase text-[#EDEDE8] mb-4 group-hover:text-[#FFB800] transition-colors">
          {location.location_name}
        </h3>

        {/* Labeled Status Badge (Strictly Color + Text, Zero Bare Dots) */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 font-mono-data text-xs font-bold uppercase tracking-wider mb-6 border-2"
          style={{
            borderColor: statusConfig.color,
            backgroundColor: `${statusConfig.color}15`,
            color: statusConfig.color,
          }}
        >
          <span className="w-2 h-2" style={{ backgroundColor: statusConfig.color }} />
          <span>STATUS: {statusConfig.label}</span>
        </div>

        {/* Confidence Gauge */}
        <div className="mb-6">
          <div className="flex justify-between items-center font-mono-data text-xs mb-1.5">
            <span className="text-[#EDEDE8]/70">CONFIDENCE SCORE:</span>
            <span className="font-bold text-[#EDEDE8]">{confPercent}%</span>
          </div>
          {/* Stepped Segmented Bar */}
          <div className="h-3 w-full bg-[#EDEDE8]/10 border border-[#EDEDE8]/30 flex overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${confPercent}%`,
                backgroundColor: statusConfig.color,
              }}
            />
          </div>
        </div>

        {/* Status Reason & Intelligence Summary */}
        <p className="font-body-prose text-xs text-[#EDEDE8]/80 line-clamp-3 mb-6 min-h-[3rem] leading-relaxed">
          {location.status_reason}
        </p>
      </div>

      {/* Telemetry Summary & Action Trigger */}
      <div className="border-t-2 border-[#EDEDE8]/20 pt-4 font-mono-data text-xs">
        <div className="grid grid-cols-2 gap-2 text-[#EDEDE8]/70 mb-4">
          <div>REPORTS: <strong className="text-[#EDEDE8]">{location.report_count}</strong></div>
          <div>CLUSTERS: <strong className="text-[#EDEDE8]">{location.incident_cluster_count}</strong></div>
          <div>
            SILENCE:{" "}
            <strong className={location.silence_duration_hours && location.silence_duration_hours > 3.0 ? "text-[#E5484D]" : "text-[#EDEDE8]"}>
              {location.silence_duration_hours !== null && location.silence_duration_hours !== undefined ? `${location.silence_duration_hours.toFixed(1)}h` : "N/A"}
            </strong>
          </div>
          <div>
            UPD: <strong className="text-[#EDEDE8]">{location.last_update ? "RECENT" : "NONE"}</strong>
          </div>
        </div>

        <div className="flex items-center justify-between text-[#FFB800] font-bold group-hover:translate-x-1 transition-transform">
          <span>INSPECT CLUSTERS</span>
          <span>[→]</span>
        </div>
      </div>
    </motion.div>
  );
}

function getStatusConfig(status: LocationStatusType): { label: string; color: string } {
  switch (status) {
    case "verified_safe":
      return { label: "VERIFIED_SAFE", color: "#3FB950" };
    case "verified_damaged":
      return { label: "VERIFIED_DAMAGED", color: "#E5484D" };
    case "blackout":
      return { label: "COMM_BLACKOUT", color: "#E5484D" };
    case "unverified":
    default:
      return { label: "UNVERIFIED", color: "#FFB800" };
  }
}
