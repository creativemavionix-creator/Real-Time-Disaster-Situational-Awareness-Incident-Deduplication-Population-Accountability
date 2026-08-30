"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  GisSectorTelemetry,
  LocationStatusItem,
  IncidentClusterItem,
  fetchLocationIncidents,
} from "@/lib/api";
import { useViewMode } from "@/context/ViewModeContext";

interface ActiveSectorDossierProps {
  sector: GisSectorTelemetry;
  location?: LocationStatusItem;
  onOpenPalikas?: (sectorId: string) => void;
}

export function ActiveSectorDossier({
  sector,
  location,
  onOpenPalikas,
}: ActiveSectorDossierProps) {
  const [incidents, setIncidents] = useState<IncidentClusterItem[]>([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const { isAnalysis } = useViewMode();

  useEffect(() => {
    let isMounted = true;
    setLoadingEvidence(true);
    fetchLocationIncidents(sector.sector_id)
      .then((data) => {
        if (isMounted) {
          setIncidents(data);
          setLoadingEvidence(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingEvidence(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sector.sector_id]);

  const getRecommendedAction = () => {
    switch (sector.status) {
      case "verified_damaged":
        return {
          title: "Deploy Urban Search & Rescue Battalion (USAR)",
          detail: "Immediate heavy concrete breaching equipment + emergency mobile trauma field hospital.",
          urgency: "CRITICAL IMMEDIATE",
          urgencyClass: "chip-critical",
        };
      case "blackout":
        return {
          title: "Deploy High-Altitude UAV Reconnaissance",
          detail: "Establish satellite mesh communications and dispatch aerial helicopter scout pass.",
          urgency: "HIGH RECON",
          urgencyClass: "chip-critical",
        };
      case "unverified":
        return {
          title: "Dispatch Armed Police Force (APF) Patrol",
          detail: "Verify initial citizen damage reports and assess local bridge passage.",
          urgency: "PRIORITY VERIFY",
          urgencyClass: "chip-warning",
        };
      case "verified_safe":
      default:
        return {
          title: "Maintain Staging Logistics Hub",
          detail: "Coordinate relief supplies and maintain standing hospital capacity.",
          urgency: "LOGISTICS SAFE",
          urgencyClass: "chip-safe",
        };
    }
  };

  const action = getRecommendedAction();
  const confidencePct = Math.round(sector.confidence_score * 100);

  return (
    <div className="surface-calm p-6 sm:p-8 space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Sector Title & Status Pill */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5E4DC] dark:border-[#232733] pb-4">
          <div>
            <div className="font-mono-data text-[11px] text-[#5C6270] uppercase tracking-wider mb-1">
              ACTIVE SECTOR DOSSIER // {sector.sector_id.toUpperCase()}
            </div>
            <h2 className="font-display-calm font-extrabold text-2xl sm:text-3xl text-[#111318] dark:text-[#F4F4F0]">
              {sector.sector_name}
            </h2>
          </div>

          <span className={action.urgencyClass}>
            {sector.status.replace("_", " ")}
          </span>
        </div>

        {/* 1. WHY IS IT DANGEROUS? */}
        <div className="space-y-2">
          <div className="font-mono-data text-[10px] font-bold text-[#5C6270] uppercase tracking-wider">
            1. SITUATION ASSESSMENT
          </div>
          <p className="font-body-prose text-sm text-[#111318] dark:text-[#F4F4F0] leading-relaxed p-4 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733]">
            {location?.status_reason ||
              `Severe seismic hazard zone located ${sector.distance_to_epicenter_km.toFixed(0)} km from the Barpak epicenter. Mountain slopes and river valley bridges experiencing significant access disruption.`}
          </p>
        </div>

        {/* 2. WHAT DOES THE SYSTEM RECOMMEND DOING? */}
        <div className="space-y-2">
          <div className="font-mono-data text-[10px] font-bold text-[#5C6270] uppercase tracking-wider">
            2. RECOMMENDED OPERATIONAL ACTION
          </div>
          <div className="p-4 rounded-xl bg-[#2563EB]/5 dark:bg-[#2563EB]/10 border-l-4 border-[#2563EB] space-y-1">
            <strong className="font-display-calm font-bold text-sm text-[#111318] dark:text-[#F4F4F0] block">
              {action.title}
            </strong>
            <p className="font-body-prose text-xs text-[#5C6270] dark:text-[#9CA3AF]">
              {action.detail}
            </p>
          </div>
        </div>

        {/* 3. HOW CONFIDENT IS IT? */}
        <div className="space-y-2">
          <div className="font-mono-data text-[10px] font-bold text-[#5C6270] uppercase tracking-wider">
            3. RECOMMENDATION CONFIDENCE
          </div>
          <div className="p-3.5 rounded-xl surface-calm flex items-center justify-between font-mono-data text-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#059669] dark:text-[#34D399]">
                {confidencePct}%
              </span>
              <span className="text-[11px] text-[#5C6270]">
                {confidencePct > 80 ? "High Confidence" : "Moderate Confidence"}
              </span>
            </div>

            <span className="text-[11px] text-[#5C6270]">
              Fused from {location?.report_count || sector.active_incidents_count || 12} source reports
            </span>
          </div>
        </div>

        {/* 4. SHOW ME THE EVIDENCE */}
        <div className="space-y-2 pt-1 font-mono-data text-xs">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              type="button"
              className="text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <span>{showEvidence ? "[-] HIDE EVIDENCE DOSSIER" : "[+] INSPECT EVIDENCE DOSSIER"}</span>
              <span>({incidents.length} Clusters)</span>
            </button>

            {onOpenPalikas && (
              <button
                onClick={() => onOpenPalikas(sector.sector_id)}
                type="button"
                className="text-[10px] text-[#5C6270] hover:text-[#111318] dark:hover:text-[#F4F4F0] cursor-pointer"
              >
                [2021 CENSUS PALIKAS →]
              </button>
            )}
          </div>

          {showEvidence && (
            <div className="mt-3 space-y-2 pt-3 border-t border-[#E5E4DC] dark:border-[#232733] max-h-56 overflow-y-auto">
              {loadingEvidence && (
                <div className="p-4 text-center text-xs text-[#5C6270] animate-pulse">
                  [LOADING EVIDENCE LOGS...]
                </div>
              )}

              {!loadingEvidence && incidents.length === 0 && (
                <div className="p-4 text-center text-xs text-[#5C6270]">
                  No incident clusters recorded for this sector at current time.
                </div>
              )}

              {incidents.map((cluster) => (
                <div
                  key={cluster.cluster_id}
                  className="p-3 rounded-lg bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] space-y-1.5"
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold uppercase text-[#111318] dark:text-[#F4F4F0]">
                      CLUSTER #{cluster.cluster_id} ({cluster.damage_type})
                    </span>
                    <span className="text-[#059669]">{(cluster.confidence_score * 100).toFixed(0)}% CONFIDENCE</span>
                  </div>
                  <p className="font-body-prose text-xs text-[#111318] dark:text-[#F4F4F0] italic">
                    &ldquo;{cluster.representative_text}&rdquo;
                  </p>
                  <div className="text-[10px] text-[#5C6270] flex justify-between">
                    <span>Casualties: <strong>{cluster.casualty_estimate ?? "Unspecified"}</strong></span>
                    <span>Sources: {Object.keys(cluster.sources_breakdown).join(", ")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-[#E5E4DC] dark:border-[#232733] flex items-center justify-between gap-3">
        <Link
          href={`/dispatch?sector=${sector.sector_id}`}
          className="w-full btn-action-primary py-3 text-xs flex items-center justify-center gap-2"
        >
          <span>AUTHORIZE TACTICAL DISPATCH FOR {sector.sector_name.toUpperCase()}</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
