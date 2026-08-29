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
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    if (!sitrep) return;
    const md = `
# ${sitrep.disaster_event_name}
## ${sitrep.sitrep_id} // OPERATIONAL PERIOD: ${sitrep.operational_period}
**Authorized By**: ${sitrep.authorized_by}

---

### 1. Executive Summary
${sitrep.executive_summary}

---

### 2. Casualty Toll
- Confirmed Fatalities: ${sitrep.casualty_toll.confirmed_fatalities}
- Confirmed Injured: ${sitrep.casualty_toll.confirmed_injured}
- Trapped / Rubble: ${sitrep.casualty_toll.trapped_unaccounted}
- Active Missing Persons: ${sitrep.casualty_toll.missing_persons_active}

---

### 3. Blackout Intelligence Briefing
${sitrep.blackout_intelligence_briefing}

---

### 4. Priority Operational Directives
${sitrep.priority_operational_directives.map((d) => `- [${d.urgency}] ${d.action_code} (${d.target_sector}): ${d.description}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header Controls */}
      <div className="border-b-4 border-[#EDEDE8] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 print:hidden">
        <div>
          <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
            CAPABILITY 06 // TIMELINE & SITREP COMPILER
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-[#EDEDE8]">
            SITUATION REPORT (SITREP)
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-[#EDEDE8]/70 mt-1 max-w-2xl">
            UN OCHA & military-standard formal Situation Report automatically compiled from multi-agency fused intelligence for emergency command leaders.
          </p>
        </div>

        <div className="flex gap-3 font-mono-data text-xs">
          <button
            onClick={handleCopyMarkdown}
            className="border-2 border-[#EDEDE8] bg-[#0A0A0A] hover:bg-[#EDEDE8]/10 text-[#EDEDE8] px-4 py-2 uppercase font-bold transition-colors"
          >
            {copied ? "COPIED [✓]" : "COPY RAW MD"}
          </button>
          <button
            onClick={handlePrint}
            className="bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] px-4 py-2 uppercase font-bold tracking-wider transition-colors border-2 border-[#0A0A0A]"
          >
            PRINT / EXPORT [⌘P]
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#E5484D]/10 border-2 border-[#E5484D] p-4 font-mono-data text-xs text-[#E5484D]">
          [SITREP_ERROR]: {error}
        </div>
      )}

      {/* Printable Formal SITREP Document */}
      {sitrep && (
        <div className="border-4 border-[#EDEDE8] p-8 md:p-12 bg-[#0A0A0A] space-y-8 print:border-none print:p-0 print:text-black">
          {/* Header Masthead */}
          <div className="border-b-4 border-[#EDEDE8] pb-6 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono-data text-xs">
              <span className="text-[#FFB800] font-bold tracking-widest uppercase">
                GOVERNMENT OF NEPAL // NEOC CRISIS COMMAND
              </span>
              <span className="text-[#EDEDE8]/60 uppercase">
                CLASSIFICATION: UNCLASSIFIED / OPERATIONAL
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-4xl font-black uppercase text-[#EDEDE8] tracking-tight">
              {sitrep.disaster_event_name}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono-data text-xs text-[#EDEDE8]/80 pt-2 border-t border-[#EDEDE8]/20">
              <div>REPORT ID: <strong className="text-[#EDEDE8]">{sitrep.sitrep_id}</strong></div>
              <div>OPERATIONAL PERIOD: <strong className="text-[#EDEDE8]">{sitrep.operational_period}</strong></div>
              <div>TIMELINE ELAPSED: <strong className="text-[#FFB800]">{sitrep.elapsed_hours.toFixed(1)} HOURS</strong></div>
              <div>AUTHORITY: <strong className="text-[#EDEDE8]">{sitrep.authorized_by}</strong></div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h3 className="font-mono-data text-xs text-[#FFB800] font-bold uppercase tracking-widest">
              1. EXECUTIVE OPERATIONAL SUMMARY
            </h3>
            <p className="font-body-prose text-xs sm:text-sm text-[#EDEDE8] leading-relaxed border-l-4 border-[#FFB800] pl-4 py-1">
              {sitrep.executive_summary}
            </p>
          </div>

          {/* Section 2: Casualty Toll */}
          <div className="space-y-3">
            <h3 className="font-mono-data text-xs text-[#FFB800] font-bold uppercase tracking-widest">
              2. FUSED CASUALTY & PERSONNEL ACCOUNTABILITY
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono-data text-xs">
              <div className="border-2 border-[#E5484D] p-3 bg-[#E5484D]/5">
                <span className="text-[#EDEDE8]/60 text-[10px] block">CONFIRMED DEAD</span>
                <strong className="text-2xl text-[#E5484D] font-bold">
                  {sitrep.casualty_toll.confirmed_fatalities}
                </strong>
              </div>
              <div className="border-2 border-[#FFB800] p-3 bg-[#FFB800]/5">
                <span className="text-[#EDEDE8]/60 text-[10px] block">CONFIRMED INJURED</span>
                <strong className="text-2xl text-[#FFB800] font-bold">
                  {sitrep.casualty_toll.confirmed_injured}
                </strong>
              </div>
              <div className="border-2 border-[#EDEDE8]/40 p-3 bg-[#EDEDE8]/5">
                <span className="text-[#EDEDE8]/60 text-[10px] block">TRAPPED / RUBBLE</span>
                <strong className="text-2xl text-[#EDEDE8] font-bold">
                  {sitrep.casualty_toll.trapped_unaccounted}
                </strong>
              </div>
              <div className="border-2 border-[#E5484D]/60 p-3 bg-[#E5484D]/5">
                <span className="text-[#EDEDE8]/60 text-[10px] block">ACTIVE MISSING</span>
                <strong className="text-2xl text-[#E5484D] font-bold">
                  {sitrep.casualty_toll.missing_persons_active}
                </strong>
              </div>
            </div>
          </div>

          {/* Section 3: Blackout Briefing */}
          <div className="space-y-2">
            <h3 className="font-mono-data text-xs text-[#FFB800] font-bold uppercase tracking-widest">
              3. SILENT BLACKOUT THREAT INTELLIGENCE
            </h3>
            <div className="p-4 border-2 border-[#E5484D] bg-[#E5484D]/5 font-mono-data text-xs text-[#EDEDE8]">
              {sitrep.blackout_intelligence_briefing}
            </div>
          </div>

          {/* Section 4: Critical Sector Summary */}
          <div className="space-y-3">
            <h3 className="font-mono-data text-xs text-[#FFB800] font-bold uppercase tracking-widest">
              4. CRITICAL INTERVENTION SECTORS
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono-data text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EDEDE8]/10 border-b-2 border-[#EDEDE8] text-[#EDEDE8]">
                    <th className="p-2.5">SECTOR</th>
                    <th className="p-2.5">STATUS</th>
                    <th className="p-2.5">CONFIDENCE</th>
                    <th className="p-2.5">JUSTIFICATION & THREAT SUMMARY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEDE8]/20">
                  {sitrep.critical_sectors_summary.map((c, idx) => (
                    <tr key={`${c.sector_id}-${idx}`}>
                      <td className="p-2.5 font-bold uppercase text-[#EDEDE8]">{c.sector_name}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.2 border border-[#E5484D] text-[#E5484D] text-[10px] font-bold uppercase">
                          {c.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-[#3FB950]">{(c.confidence * 100).toFixed(0)}%</td>
                      <td className="p-2.5 text-[#EDEDE8]/80 text-[11px]">{c.status_reason}</td>
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
            <div className="border-2 border-[#EDEDE8]/30 divide-y divide-[#EDEDE8]/20 font-mono-data text-xs">
              {sitrep.priority_operational_directives.map((action, idx) => (
                <div key={`${action.action_code}-${idx}`} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#FFB800]">[{action.action_code}]</span>
                      <strong className="uppercase text-[#EDEDE8]">{action.target_sector}</strong>
                      <span className="px-1.5 py-0.2 bg-[#E5484D] text-[#0A0A0A] font-bold text-[9px] uppercase">
                        {action.urgency}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#EDEDE8]/80">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Block */}
          <div className="border-t-4 border-[#EDEDE8] pt-6 flex justify-between font-mono-data text-xs text-[#EDEDE8]/70">
            <div>
              <span>OFFICIAL TRANSMISSION // DISASTER RISK MANAGEMENT AUTHORITY</span>
              <span className="block text-[10px] text-[#EDEDE8]/40 mt-0.5">
                GENERATED VIA AI SITREP FUSION PIPELINE
              </span>
            </div>
            <div className="text-right">
              <span>AUTHENTICATED BY: NEOC INCIDENT COMMANDER</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
