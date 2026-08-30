"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  GisSectorTelemetry,
  LocationStatusItem,
  IncidentClusterItem,
  fetchLocationIncidents,
} from "@/lib/api";

interface ActiveSectorDossierProps {
  sector: GisSectorTelemetry;
  location?: LocationStatusItem;
  onOpenPalikas?: (sectorId: string) => void;
  onInspectEvidence?: () => void;
}

export function ActiveSectorDossier({
  sector,
  location,
  onOpenPalikas,
  onInspectEvidence
}: ActiveSectorDossierProps) {
  const [incidents, setIncidents] = useState<IncidentClusterItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    fetchLocationIncidents(sector.sector_id)
      .then((data) => {
        if (isMounted) setIncidents(data);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [sector.sector_id]);

  const getRecommendedAction = () => {
    switch (sector.status) {
      case "verified_damaged":
        return { title: "Deploy USAR", urgencyClass: "text-[#E11D48]" };
      case "blackout":
        return { title: "UAV Recon", urgencyClass: "text-[#E11D48]" };
      case "unverified":
        return { title: "Verify", urgencyClass: "text-[#D97706]" };
      case "verified_safe":
      default:
        return { title: "Staging", urgencyClass: "text-[#059669]" };
    }
  };

  const action = getRecommendedAction();
  const confidencePct = Math.round(sector.confidence_score * 100);

  return (
    <div className="pointer-events-auto w-[420px] h-[calc(100vh-144px)] bg-[#0C0E12]/80 backdrop-blur-3xl border border-white/10 rounded-2xl flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
      <div className="p-10 space-y-10 overflow-y-auto scrollbar-none">
        <div>
          <div className="font-mono-data text-[9px] text-[#64748B] uppercase tracking-[0.25em] mb-4">Sector Active</div>
          <h2 className="font-display-calm font-medium text-4xl text-[#F3F4F6] tracking-tight">
            {sector.sector_name}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="font-mono-data text-[9px] text-[#64748B] uppercase tracking-[0.2em]">Condition</div>
          <p className="font-body-prose text-sm text-[#94A3B8] leading-relaxed">
            {location?.status_reason ||
              `Hazard zone located ${sector.distance_to_epicenter_km.toFixed(0)} km from Barpak.`}
          </p>
        </div>

        <div className="space-y-4">
          <div className="font-mono-data text-[9px] text-[#64748B] uppercase tracking-[0.2em]">Directive</div>
          <div className="font-display-calm font-medium text-2xl text-[#F3F4F6]">
            {action.title}
          </div>
        </div>

        <div className="space-y-4">
          <div className="font-mono-data text-[9px] text-[#64748B] uppercase tracking-[0.2em]">Confidence</div>
          <div className={`font-mono-data text-2xl ${confidencePct > 80 ? 'text-[#059669]' : 'text-[#D97706]'}`}>
            {confidencePct}%
          </div>
        </div>

        <div className="space-y-5 pt-8 border-t border-white/5">
           <button
             onClick={onInspectEvidence}
             className="text-left w-full font-mono-data text-[10px] text-[#94A3B8] hover:text-[#F3F4F6] uppercase tracking-[0.2em] transition-colors cursor-pointer flex items-center justify-between"
           >
             <span>Inspect Evidence Logs</span>
             <span>({incidents.length})</span>
           </button>
           {onOpenPalikas && (
             <button
               onClick={() => onOpenPalikas(sector.sector_id)}
               className="text-left w-full font-mono-data text-[10px] text-[#94A3B8] hover:text-[#F3F4F6] uppercase tracking-[0.2em] transition-colors cursor-pointer flex items-center justify-between"
             >
               <span>Census Baseline</span>
               <span>&rarr;</span>
             </button>
           )}
        </div>
      </div>

      <Link
        href={`/dispatch?sector=${sector.sector_id}`}
        className="w-full p-8 font-mono-data text-[10px] uppercase tracking-[0.2em] text-[#F3F4F6] hover:bg-white/5 transition-colors border-t border-white/5 flex justify-between"
      >
        <span>Authorize Dispatch</span>
        <span>&rarr;</span>
      </Link>
    </div>
  );
}
