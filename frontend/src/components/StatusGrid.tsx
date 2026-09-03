"use client";

import React from "react";
import { motion } from "framer-motion";
import { LocationStatusItem, LocationStatusType } from "@/lib/api";
import { useViewMode } from "@/context/ViewModeContext";
import { ArrowRight } from "lucide-react";

interface StatusGridProps {
  locations: LocationStatusItem[];
  onSelectLocation: (locationId: string) => void;
}

export function StatusGrid({ locations, onSelectLocation }: StatusGridProps) {
  const { isAnalysis } = useViewMode();

  return (
    <section id="situation-matrix" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      {/* Section header — eyebrow omitted here (used in landing/hero already) */}
      <div
        className="pb-8 mb-8"
        style={{ borderBottom: "1px solid var(--border-faint)" }}
      >
        <h2
          className="font-display-calm"
          style={{
            fontSize: "clamp(1.75rem, 3.5vw, var(--text-3xl))",
            fontWeight: 600,
            letterSpacing: "var(--ls-snug)",
            color: "var(--fg-primary)",
            lineHeight: "var(--lh-heading)",
            marginBottom: "0.5rem",
          }}
        >
          Central Nepal Sector Matrix
        </h2>
        <p
          className="type-body-sm"
          style={{ maxWidth: "56ch" }}
        >
          Real-time status calculated from fused civilian logs, verified hospital triage intake,
          and spatial physics negative-evidence inference.
        </p>
        <p
          className="font-mono-data mt-4"
          style={{ fontSize: "var(--text-xs)", color: "var(--fg-tertiary)" }}
        >
          SELECT ANY SECTOR TO INSPECT EVIDENCE DOSSIER
        </p>
      </div>

      {/* 4-col grid at large screens */}
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

  const getRecommendedAction = (status: LocationStatusType): string => {
    switch (status) {
      case "verified_damaged": return "Deploy Heavy SAR + Emergency Trauma Unit";
      case "blackout":         return "Deploy High-Altitude UAV & Satellite Comms";
      case "unverified":       return "Dispatch APF Reconnaissance Patrol";
      case "verified_safe":    return "Maintain Staging Logistics Hub";
      default:                 return "Assess Field Telemetry";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      onClick={onSelect}
      tabIndex={0}
      role="button"
      aria-label={`Inspect dossier for ${location.location_name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="flex flex-col justify-between cursor-pointer group"
      style={{
        padding: "1.25rem",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        transition: "border-color var(--dur-base) var(--ease-out-expo), box-shadow var(--dur-base) var(--ease-out-expo)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        minHeight: "280px",
      }}
      whileHover={{
        borderColor: "rgba(255,255,255,0.20)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}
    >
      <div>
        {/* Top meta */}
        <div
          className="flex items-center justify-between font-mono-data pb-2 mb-3"
          style={{
            fontSize: "var(--text-2xs)",
            color: "var(--fg-tertiary)",
            borderBottom: "1px solid var(--border-faint)",
          }}
        >
          <span>SECTOR 0{index + 1}</span>
          <span
            className="font-semibold uppercase"
            style={{ color: "var(--fg-primary)" }}
          >
            {location.location_id}
          </span>
        </div>

        {/* Sector name */}
        <h3
          className="font-display-calm mb-2 transition-colors"
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            color: "var(--fg-primary)",
            lineHeight: "var(--lh-snug)",
          }}
        >
          {location.location_name}
        </h3>

        {/* Status chip */}
        <div className="mb-3">
          <span className={statusConfig.chipClass}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotAnimateClass}`}
              style={{ backgroundColor: statusConfig.dotColor }}
            />
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {/* Status reason */}
        <p
          className="font-body-prose mb-4"
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--fg-secondary)",
            lineHeight: "var(--lh-body)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {location.status_reason}
        </p>

        {/* Recommended action — flat inline style, NOT border-left+border-radius */}
        <div
          className="mb-4"
          style={{
            paddingTop: "0.5rem",
            borderTop: "1px solid var(--border-faint)",
          }}
        >
          <span
            className="font-mono-data uppercase block"
            style={{
              fontSize: "var(--text-2xs)",
              color: "var(--status-intel-text)",
              letterSpacing: "var(--ls-wider)",
              marginBottom: "0.25rem",
            }}
          >
            Recommended Action:
          </span>
          <span
            className="font-display-calm font-medium"
            style={{ fontSize: "var(--text-xs)", color: "var(--fg-primary)" }}
          >
            {getRecommendedAction(location.status)}
          </span>
        </div>
      </div>

      {/* Footer metrics */}
      <div
        className="pt-3 font-mono-data"
        style={{
          fontSize: "var(--text-xs)",
          borderTop: "1px solid var(--border-faint)",
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <span style={{ color: "var(--fg-tertiary)" }}>Incident Clusters:</span>
          <strong style={{ color: "var(--fg-primary)" }}>
            {location.incident_cluster_count}
          </strong>
        </div>

        {isAnalysis && (
          <div
            className="pt-2 space-y-1"
            style={{
              borderTop: "1px solid var(--border-faint)",
              fontSize: "var(--text-2xs)",
            }}
          >
            <div className="flex justify-between">
              <span style={{ color: "var(--fg-tertiary)" }}>Confidence:</span>
              <strong style={{ color: "var(--status-ok-text)" }}>
                {(location.confidence_score * 100).toFixed(0)}%
              </strong>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--fg-tertiary)" }}>Coordinates:</span>
              <span style={{ color: "var(--fg-secondary)" }}>
                {location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E
              </span>
            </div>
          </div>
        )}

        <div
          className="mt-3 flex items-center justify-between font-semibold group-hover:gap-3 transition-all"
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--status-intel-text)",
            letterSpacing: "var(--ls-wide)",
            fontFamily: "var(--font-display), sans-serif",
          }}
        >
          <span>INSPECT DOSSIER</span>
          <ArrowRight
            className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"
          />
        </div>
      </div>
    </motion.div>
  );
}

function getStatusConfig(status: LocationStatusType): {
  label: string;
  chipClass: string;
  dotColor: string;
  dotAnimateClass: string;
} {
  switch (status) {
    case "verified_safe":
      return {
        label: "VERIFIED SAFE",
        chipClass: "chip-safe",
        dotColor: "var(--status-ok)",
        dotAnimateClass: "",
      };
    case "verified_damaged":
      return {
        label: "VERIFIED CRITICAL",
        chipClass: "chip-critical",
        dotColor: "var(--status-critical)",
        dotAnimateClass: "animate-ping",
      };
    case "blackout":
      return {
        label: "CRITICAL BLACKOUT",
        chipClass: "chip-blackout",
        dotColor: "var(--status-blackout)",
        dotAnimateClass: "",
      };
    case "unverified":
    default:
      return {
        label: "UNVERIFIED REPORT",
        chipClass: "chip-warning",
        dotColor: "var(--status-warning)",
        dotAnimateClass: "",
      };
  }
}
