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
      <div className="border-b border-[#E5E4DC] dark:border-[#232733] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono-data text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
            04 // FORMAL DISASTER REPORTING
          </div>
          <h1 className="font-display-calm font-extrabold text-3xl sm:text-4xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
            Situation Report (SITREP)
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-[#5C6270] dark:text-[#9CA3AF] max-w-2xl leading-relaxed">
            Automated UN OCHA / NDMA standardized Situation Report synthesizing fused multi-agency intelligence, casualty tolls, and commander operational directives.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 font-mono-data text-xs">
          <button
            onClick={handleCopyMarkdown}
            type="button"
            className="btn-action-secondary text-xs py-2 px-4 cursor-pointer"
          >
            {copied ? "✓ COPIED" : "COPY MARKDOWN"}
          </button>
          <button
            onClick={handlePrint}
            type="button"
            className="btn-action-primary text-xs py-2 px-5 cursor-pointer"
          >
            PRINT / PDF [⎙]
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-mono-data text-[#E11D48]">
          [SITREP_ERROR]: {error}
        </div>
      )}

      {/* Official SITREP Document Canvas */}
      {sitrep && (
        <div className="surface-calm p-6 sm:p-10 space-y-8 print:border-none print:p-0 print:shadow-none">
          {/* Document Header */}
          <div className="border-b border-[#E5E4DC] dark:border-[#232733] pb-6 space-y-3 font-mono-data">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase">
              <span>AUTHORIZED BY: {sitrep.authorized_by}</span>
              <span>CODE: {sitrep.sitrep_id}</span>
            </div>

            <h2 className="font-display-calm font-extrabold text-2xl sm:text-3xl text-[#111318] dark:text-[#F4F4F0]">
              {sitrep.disaster_event_name}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#5C6270] pt-2">
              <div>PERIOD: <strong className="text-[#111318] dark:text-[#F4F4F0]">{sitrep.operational_period}</strong></div>
              <div>TIMELINE: <strong className="text-[#2563EB] dark:text-[#60A5FA]">T+{sitrep.elapsed_hours.toFixed(1)}h</strong></div>
              <div>PUBLISHED: <strong>{new Date(sitrep.simulated_time).toUTCString()}</strong></div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2.5">
            <h3 className="font-mono-data text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
              1. EXECUTIVE OPERATIONAL BRIEFING
            </h3>
            <p className="font-body-prose text-sm sm:text-base text-[#111318] dark:text-[#F4F4F0] leading-relaxed bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 p-4 rounded-xl border-l-4 border-[#2563EB]">
              {sitrep.executive_summary}
            </p>
          </div>

          {/* Section 2: Reconciled Casualty Ledger */}
          <div className="space-y-3">
            <h3 className="font-mono-data text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
              2. RECONCILED CASUALTY & LIFE-SAFETY LEDGER
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-data text-xs">
              <div className="p-4 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] text-center">
                <span className="text-[#5C6270] block text-[10px] uppercase font-bold">FATALITIES</span>
                <strong className="text-2xl text-[#E11D48] dark:text-[#FB7185] font-extrabold">
                  {sitrep.casualty_toll.confirmed_fatalities}
                </strong>
              </div>
              <div className="p-4 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] text-center">
                <span className="text-[#5C6270] block text-[10px] uppercase font-bold">TRAPPED / SAR</span>
                <strong className="text-2xl text-[#D97706] dark:text-[#FBBF24] font-extrabold">
                  {sitrep.casualty_toll.trapped_unaccounted}
                </strong>
              </div>
              <div className="p-4 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] text-center">
                <span className="text-[#5C6270] block text-[10px] uppercase font-bold">HOSPITALIZED</span>
                <strong className="text-2xl text-[#059669] dark:text-[#34D399] font-extrabold">
                  {sitrep.casualty_toll.confirmed_injured}
                </strong>
              </div>
              <div className="p-4 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] text-center">
                <span className="text-[#5C6270] block text-[10px] uppercase font-bold">MISSING</span>
                <strong className="text-2xl text-[#E11D48] dark:text-[#FB7185] font-extrabold">
                  {sitrep.casualty_toll.missing_persons_active}
                </strong>
              </div>
            </div>
          </div>

          {/* Section 3: Blackout Intelligence Briefing */}
          <div className="space-y-2.5">
            <h3 className="font-mono-data text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
              3. SILENT BLACKOUT & ISOLATED SECTOR BRIEFING
            </h3>
            <p className="font-body-prose text-xs sm:text-sm text-[#5C6270] dark:text-[#9CA3AF] leading-relaxed p-4 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733]">
              {sitrep.blackout_intelligence_briefing}
            </p>
          </div>

          {/* Section 4: Critical Sector Summary */}
          <div className="space-y-3 font-mono-data text-xs">
            <h3 className="text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
              4. CRITICAL INTERVENTION SECTORS
            </h3>
            <div className="rounded-xl border border-[#E5E4DC] dark:border-[#232733] overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F2F0E8] dark:bg-[#13161D] border-b border-[#E5E4DC] dark:border-[#232733] text-[#111318] dark:text-[#F4F4F0] font-bold">
                    <th className="p-3">SECTOR</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">CONFIDENCE</th>
                    <th className="p-3">JUSTIFICATION & THREAT SUMMARY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E4DC] dark:divide-[#232733]">
                  {sitrep.critical_sectors_summary.map((c, idx) => (
                    <tr key={`${c.sector_id}-${idx}`}>
                      <td className="p-3 font-bold uppercase text-[#111318] dark:text-[#F4F4F0]">{c.sector_name}</td>
                      <td className="p-3">
                        <span className="chip-critical">{c.status.replace("_", " ")}</span>
                      </td>
                      <td className="p-3 font-bold text-[#059669] dark:text-[#34D399]">{(c.confidence * 100).toFixed(0)}%</td>
                      <td className="p-3 text-[#5C6270] dark:text-[#9CA3AF] text-[11px] font-body-prose">{c.status_reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Priority Operational Directives */}
          <div className="space-y-3 font-mono-data text-xs">
            <h3 className="text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
              5. COMMANDER PRIORITY OPERATIONAL DIRECTIVES
            </h3>
            <div className="rounded-xl border border-[#E5E4DC] dark:border-[#232733] divide-y divide-[#E5E4DC] dark:divide-[#232733]">
              {sitrep.priority_operational_directives.map((action, idx) => (
                <div key={`${action.action_code}-${idx}`} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2563EB] dark:text-[#60A5FA]">[{action.action_code}]</span>
                      <strong className="text-sm text-[#111318] dark:text-[#F4F4F0] uppercase">Target: {action.target_sector}</strong>
                      <span className="chip-critical text-[10px]">{action.urgency}</span>
                    </div>
                    <p className="font-body-prose text-xs text-[#5C6270] dark:text-[#9CA3AF]">
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
