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
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="prism-badge-cyan">
            <span>04</span>
            <span>//</span>
            <span>FORMAL DISASTER REPORTING</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            Situation Report (SITREP)
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Automated UN OCHA / NDMA standardized Situation Report synthesizing fused multi-agency intelligence, casualty tolls, and commander operational directives.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={handleCopyMarkdown}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold uppercase transition-all rounded-full border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
          >
            {copied ? "✓ COPIED" : "COPY MARKDOWN"}
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary-cyan text-xs py-2 px-5 cursor-pointer shadow-xs"
          >
            PRINT / PDF [⎙]
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 rounded-2xl font-mono text-xs text-rose-700 dark:text-rose-300">
          [SITREP_ERROR]: {error}
        </div>
      )}

      {/* Official SITREP Document Canvas */}
      {sitrep && (
        <div className="prism-card p-6 sm:p-10 space-y-8 print:border-none print:p-0 print:shadow-none">
          {/* Document Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-6 space-y-3 font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-cyan-700 dark:text-cyan-400 font-bold uppercase">
              <span>AUTHORIZED BY: {sitrep.authorized_by}</span>
              <span>CODE: {sitrep.sitrep_id}</span>
            </div>

            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              {sitrep.disaster_event_name}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-500 pt-2">
              <div>PERIOD: <strong className="text-slate-900 dark:text-white">{sitrep.operational_period}</strong></div>
              <div>TIMELINE: <strong className="text-cyan-700 dark:text-cyan-400">T+{sitrep.elapsed_hours.toFixed(1)}h</strong></div>
              <div>PUBLISHED: <strong>{new Date(sitrep.simulated_time).toUTCString()}</strong></div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2.5">
            <h3 className="font-mono text-xs text-cyan-700 dark:text-cyan-400 font-bold uppercase tracking-widest">
              1. EXECUTIVE OPERATIONAL BRIEFING
            </h3>
            <p className="font-body-prose text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border-l-4 border-[#0088A9]">
              {sitrep.executive_summary}
            </p>
          </div>

          {/* Section 2: Reconciled Casualty Ledger */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs text-cyan-700 dark:text-cyan-400 font-bold uppercase tracking-widest">
              2. RECONCILED CASUALTY & LIFE-SAFETY LEDGER
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-center">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">FATALITIES (CONFIRMED)</span>
                <strong className="text-2xl text-rose-600 dark:text-rose-400 font-extrabold">
                  {sitrep.casualty_toll.confirmed_fatalities}
                </strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-center">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">TRAPPED / SEARCH & RESCUE</span>
                <strong className="text-2xl text-amber-600 dark:text-amber-400 font-extrabold">
                  {sitrep.casualty_toll.trapped_unaccounted}
                </strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-center">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">HOSPITALIZED / INJURED</span>
                <strong className="text-2xl text-emerald-600 dark:text-emerald-400 font-extrabold">
                  {sitrep.casualty_toll.confirmed_injured}
                </strong>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-center">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">MISSING / UNACCOUNTED</span>
                <strong className="text-2xl text-rose-600 dark:text-rose-400 font-extrabold">
                  {sitrep.casualty_toll.missing_persons_active}
                </strong>
              </div>
            </div>
          </div>

          {/* Section 3: Blackout Intelligence Briefing */}
          <div className="space-y-2.5">
            <h3 className="font-mono text-xs text-cyan-700 dark:text-cyan-400 font-bold uppercase tracking-widest">
              3. SILENT BLACKOUT & ISOLATED SECTOR BRIEFING
            </h3>
            <p className="font-body-prose text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              {sitrep.blackout_intelligence_briefing}
            </p>
          </div>

          {/* Section 4: Critical Sector Summary */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs text-cyan-700 dark:text-cyan-400 font-bold uppercase tracking-widest">
              4. CRITICAL INTERVENTION SECTORS
            </h3>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    <th className="p-3">SECTOR</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">CONFIDENCE</th>
                    <th className="p-3">JUSTIFICATION & THREAT SUMMARY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sitrep.critical_sectors_summary.map((c, idx) => (
                    <tr key={`${c.sector_id}-${idx}`}>
                      <td className="p-3 font-bold uppercase text-slate-900 dark:text-white">{c.sector_name}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold uppercase">
                          {c.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{(c.confidence * 100).toFixed(0)}%</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 text-[11px]">{c.status_reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Priority Operational Directives */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs text-cyan-700 dark:text-cyan-400 font-bold uppercase tracking-widest">
              5. COMMANDER PRIORITY OPERATIONAL DIRECTIVES
            </h3>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
              {sitrep.priority_operational_directives.map((action, idx) => (
                <div key={`${action.action_code}-${idx}`} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-700 dark:text-cyan-400">[{action.action_code}]</span>
                      <strong className="text-sm text-slate-900 dark:text-white uppercase">Target: {action.target_sector}</strong>
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px]">
                        {action.urgency}
                      </span>
                    </div>
                    <p className="font-body-prose text-xs text-slate-600 dark:text-slate-300">
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
