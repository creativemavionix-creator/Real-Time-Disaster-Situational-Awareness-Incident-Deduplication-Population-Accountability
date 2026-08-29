"use client";

import React, { useEffect, useState } from "react";
import { fetchCurrentSitrep, SitrepReportResponse } from "@/lib/api";

export default function SitrepPage() {
  const [sitrep, setSitrep] = useState<SitrepReportResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchCurrentSitrep();
      setSitrep(res);
    } catch (err: any) {
      setError(err.message || "Failed to generate live SITREP");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    if (!sitrep) return;
    const md = `# ${sitrep.disaster_event_name} - SITUATION REPORT ${sitrep.sitrep_id}
**Operational Period:** ${sitrep.operational_period} | **Published:** ${sitrep.simulated_time}
**Authorized By:** ${sitrep.authorized_by}

## 1. Executive Summary
${sitrep.executive_summary}

## 2. Casualty & Life Safety Toll
- Confirmed Fatalities: ${sitrep.casualty_toll.confirmed_fatalities}
- Confirmed Injured / Hospitalized: ${sitrep.casualty_toll.confirmed_injured}
- Trapped / Structural Rescue: ${sitrep.casualty_toll.trapped_unaccounted}
- Active Missing Persons: ${sitrep.casualty_toll.missing_persons_active}

## 3. Blackout Threat Intelligence
${sitrep.blackout_intelligence_briefing}

## 4. Priority Operational Directives
${sitrep.priority_operational_directives.map(d => `- [${d.action_code}] (${d.urgency}) Target: ${d.target_sector} -> ${d.description}`).join("\n")}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 sm:p-10 lg:p-14 space-y-8 max-w-5xl mx-auto w-full">
      {/* Page Actions & Header */}
      <div className="border-b border-[#EDEDE8]/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
            04 // FORMAL DISASTER REPORTING
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#EDEDE8]">
            SITUATION REPORT (SITREP)
          </h1>
          <p className="font-body-prose text-sm text-[#EDEDE8]/70 mt-1 max-w-2xl leading-relaxed">
            Automated UN OCHA / NDMA standardized Situation Report synthesizing fused multi-agency intelligence, casualty tolls, and commander operational directives.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 font-mono-data text-xs">
          <button
            onClick={handleCopyMarkdown}
            className="px-4 py-2 bg-[#EDEDE8]/10 hover:bg-[#EDEDE8] hover:text-[#0A0A0A] font-bold uppercase transition-colors border border-[#EDEDE8]/20 cursor-pointer"
          >
            {copied ? "✓ COPIED" : "COPY MARKDOWN"}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] font-bold uppercase transition-colors cursor-pointer"
          >
            PRINT / PDF [⎙]
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#E5484D]/10 border border-[#E5484D] p-4 font-mono-data text-xs text-[#E5484D]">
          [SITREP_ERROR]: {error}
        </div>
      )}

      {/* Official SITREP Document Canvas */}
      {sitrep && (
        <div className="surface-card p-6 sm:p-10 space-y-8 print:border-none print:p-0">
          {/* Document Header */}
          <div className="border-b border-[#EDEDE8]/15 pb-6 space-y-3 font-mono-data">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#FFB800] font-bold uppercase">
              <span>AUTHORIZED BY: {sitrep.authorized_by}</span>
              <span>CODE: {sitrep.sitrep_id}</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#EDEDE8]">
              {sitrep.disaster_event_name}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#EDEDE8]/60 pt-2">
              <div>PERIOD: <strong className="text-[#EDEDE8]">{sitrep.operational_period}</strong></div>
              <div>TIMELINE: <strong className="text-[#FFB800]">T+{sitrep.elapsed_hours.toFixed(1)}h</strong></div>
              <div>PUBLISHED: <strong>{new Date(sitrep.simulated_time).toUTCString()}</strong></div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h3 className="font-mono-data text-xs text-[#FFB800] font-bold uppercase tracking-widest">
              1. EXECUTIVE OPERATIONAL BRIEFING
            </h3>
            <p className="font-body-prose text-sm sm:text-base text-[#EDEDE8]/90 leading-relaxed bg-[#EDEDE8]/2 p-4 border-l-2 border-[#FFB800]">
              {sitrep.executive_summary}
            </p>
          </div>

          {/* Section 2: Reconciled Casualty Ledger */}
          <div className="space-y-3">
            <h3 className="font-mono-data text-xs text-[#FFB800] font-bold uppercase tracking-widest">
              2. RECONCILED CASUALTY & LIFE-SAFETY LEDGER
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-data text-xs">
              <div className="bg-[#EDEDE8]/3 p-4 border border-[#EDEDE8]/10 text-center">
                <span className="text-[#EDEDE8]/50 block text-[10px] uppercase">FATALITIES (CONFIRMED)</span>
                <strong className="text-2xl text-[#E5484D] font-bold">
                  {sitrep.casualty_toll.confirmed_fatalities}
                </strong>
              </div>
              <div className="bg-[#EDEDE8]/3 p-4 border border-[#EDEDE8]/10 text-center">
                <span className="text-[#EDEDE8]/50 block text-[10px] uppercase">TRAPPED / SEARCH & RESCUE</span>
                <strong className="text-2xl text-[#FFB800] font-bold">
                  {sitrep.casualty_toll.trapped_unaccounted}
                </strong>
              </div>
              <div className="bg-[#EDEDE8]/3 p-4 border border-[#EDEDE8]/10 text-center">
                <span className="text-[#EDEDE8]/50 block text-[10px] uppercase">HOSPITALIZED / INJURED</span>
                <strong className="text-2xl text-[#3FB950] font-bold">
                  {sitrep.casualty_toll.confirmed_injured}
                </strong>
              </div>
              <div className="bg-[#EDEDE8]/3 p-4 border border-[#EDEDE8]/10 text-center">
                <span className="text-[#EDEDE8]/50 block text-[10px] uppercase">MISSING / UNACCOUNTED</span>
                <strong className="text-2xl text-[#E5484D] font-bold">
                  {sitrep.casualty_toll.missing_persons_active}
                </strong>
              </div>
            </div>
          </div>

          {/* Section 3: Blackout Intelligence Briefing */}
          <div className="space-y-2">
            <h3 className="font-mono-data text-xs text-[#FFB800] font-bold uppercase tracking-widest">
              3. SILENT BLACKOUT & ISOLATED SECTOR BRIEFING
            </h3>
            <p className="font-body-prose text-sm text-[#EDEDE8]/80 leading-relaxed bg-[#EDEDE8]/2 p-3 border border-[#EDEDE8]/10">
              {sitrep.blackout_intelligence_briefing}
            </p>
          </div>

          {/* Section 4: Critical Sector Summary */}
          <div className="space-y-3">
            <h3 className="font-mono-data text-xs text-[#FFB800] font-bold uppercase tracking-widest">
              4. CRITICAL INTERVENTION SECTORS
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono-data text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EDEDE8]/5 border-b border-[#EDEDE8]/15 text-[#EDEDE8]">
                    <th className="p-2.5">SECTOR</th>
                    <th className="p-2.5">STATUS</th>
                    <th className="p-2.5">CONFIDENCE</th>
                    <th className="p-2.5">JUSTIFICATION & THREAT SUMMARY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEDE8]/10">
                  {sitrep.critical_sectors_summary.map((c, idx) => (
                    <tr key={`${c.sector_id}-${idx}`}>
                      <td className="p-2.5 font-bold uppercase text-[#EDEDE8]">{c.sector_name}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.2 border border-[#E5484D] text-[#E5484D] text-[10px] font-bold uppercase">
                          {c.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-[#3FB950]">{(c.confidence * 100).toFixed(0)}%</td>
                      <td className="p-2.5 text-[#EDEDE8]/70 text-[11px]">{c.status_reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Priority Operational Directives */}
          <div className="space-y-3">
            <h3 className="font-mono-data text-xs text-[#FFB800] font-bold uppercase tracking-widest">
              5. COMMANDER PRIORITY OPERATIONAL DIRECTIVES
            </h3>
            <div className="border border-[#EDEDE8]/15 divide-y divide-[#EDEDE8]/10 font-mono-data text-xs">
              {sitrep.priority_operational_directives.map((action, idx) => (
                <div key={`${action.action_code}-${idx}`} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#FFB800]">[{action.action_code}]</span>
                      <strong className="text-sm text-[#EDEDE8] uppercase">Target: {action.target_sector}</strong>
                      <span className="px-1.5 py-0.2 bg-[#E5484D]/10 text-[#E5484D] border border-[#E5484D]/30 text-[10px]">
                        {action.urgency}
                      </span>
                    </div>
                    <p className="font-body-prose text-xs text-[#EDEDE8]/80">
                      {action.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
