"use client";

import React, { useEffect, useState } from "react";
import { fetchCurrentSitrep, SitrepReportResponse } from "@/lib/api";
import { motion } from "framer-motion";
import {
  FileText,
  Printer,
  Copy,
  Check,
  ShieldAlert,
  Radio,
  Clock,
  UserCheck,
  AlertTriangle,
  Send,
  Download,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

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
    <div className="flex-1 w-full bg-[#090B0E] p-4 sm:p-8 lg:p-12 space-y-8 max-w-5xl mx-auto text-[#F3F4F6]">
      {/* Page Actions & Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <div className="font-mono-data text-[10px] text-[#60A5FA] font-bold uppercase tracking-[0.25em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
            04 // FORMAL DISASTER REPORTING
          </div>
          <h1 className="font-display-calm font-medium text-3xl sm:text-4xl text-white tracking-tight">
            Situation Report (SITREP)
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
            Automated UN OCHA / NDMA standardized Situation Report synthesizing fused multi-agency intelligence, casualty tolls, and commander operational directives.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 font-mono-data text-xs">
          <button
            onClick={handleCopyMarkdown}
            type="button"
            className="btn-action-secondary text-xs py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5 text-[#94A3B8]" />}
            <span>{copied ? "COPIED" : "COPY MARKDOWN"}</span>
          </button>
          <button
            onClick={handlePrint}
            type="button"
            className="btn-action-primary text-xs py-2 px-5 rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT / PDF</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-mono-data text-[#FB7185] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>[SITREP_ERROR]: {error}</span>
        </div>
      )}

      {/* Official SITREP Document Canvas */}
      {sitrep && (
        <div className="p-6 sm:p-10 rounded-3xl bg-[#0C0E12]/95 border border-white/10 space-y-8 shadow-2xl print:bg-white print:text-black print:border-none print:p-0 print:shadow-none">
          {/* Document Header */}
          <div className="border-b border-white/10 pb-6 space-y-3 font-mono-data">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase">
              <span className="text-[#60A5FA] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                AUTHORIZED BY: {sitrep.authorized_by}
              </span>
              <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[#94A3B8]">
                CODE: {sitrep.sitrep_id}
              </span>
            </div>

            <h2 className="font-display-calm font-medium text-2xl sm:text-3xl text-white print:text-black">
              {sitrep.disaster_event_name}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#94A3B8] pt-2">
              <div>PERIOD: <strong className="text-white print:text-black">{sitrep.operational_period}</strong></div>
              <div>TIMELINE: <strong className="text-[#60A5FA]">T+{sitrep.elapsed_hours.toFixed(1)}h</strong></div>
              <div>PUBLISHED: <strong className="text-white print:text-black">{new Date(sitrep.simulated_time).toUTCString()}</strong></div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2.5">
            <h3 className="font-mono-data text-xs text-[#60A5FA] font-bold uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              1. EXECUTIVE OPERATIONAL BRIEFING
            </h3>
            <p className="font-body-prose text-xs sm:text-sm text-[#F3F4F6] print:text-black leading-relaxed bg-white/[0.02] p-5 rounded-2xl border-l-4 border-[#3B82F6] border border-white/5">
              {sitrep.executive_summary}
            </p>
          </div>

          {/* Section 2: Reconciled Casualty Ledger */}
          <div className="space-y-3">
            <h3 className="font-mono-data text-xs text-[#60A5FA] font-bold uppercase tracking-wider">
              2. RECONCILED CASUALTY & LIFE-SAFETY LEDGER
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-data text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-1">
                <span className="text-[#64748B] block text-[10px] uppercase font-bold">FATALITIES</span>
                <div className="text-3xl text-[#FB7185] font-bold">
                  <AnimatedCounter value={sitrep.casualty_toll.confirmed_fatalities} />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-1">
                <span className="text-[#64748B] block text-[10px] uppercase font-bold">TRAPPED / SAR</span>
                <div className="text-3xl text-[#FBBF24] font-bold">
                  <AnimatedCounter value={sitrep.casualty_toll.trapped_unaccounted} />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-1">
                <span className="text-[#64748B] block text-[10px] uppercase font-bold">HOSPITALIZED</span>
                <div className="text-3xl text-[#34D399] font-bold">
                  <AnimatedCounter value={sitrep.casualty_toll.confirmed_injured} />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-1">
                <span className="text-[#64748B] block text-[10px] uppercase font-bold">MISSING</span>
                <div className="text-3xl text-[#FB7185] font-bold">
                  <AnimatedCounter value={sitrep.casualty_toll.missing_persons_active} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Blackout Intelligence Briefing */}
          <div className="space-y-2.5">
            <h3 className="font-mono-data text-xs text-[#60A5FA] font-bold uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[#E11D48]" />
              3. SILENT BLACKOUT & ISOLATED SECTOR BRIEFING
            </h3>
            <p className="font-body-prose text-xs sm:text-sm text-[#94A3B8] print:text-black leading-relaxed p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              {sitrep.blackout_intelligence_briefing}
            </p>
          </div>

          {/* Section 4: Critical Sector Summary */}
          <div className="space-y-3 font-mono-data text-xs">
            <h3 className="text-xs text-[#60A5FA] font-bold uppercase tracking-wider">
              4. CRITICAL INTERVENTION SECTORS
            </h3>
            <div className="rounded-2xl border border-white/10 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/10 text-[#64748B] text-[10px] uppercase tracking-wider">
                    <th className="p-3.5">SECTOR</th>
                    <th className="p-3.5">STATUS</th>
                    <th className="p-3.5">CONFIDENCE</th>
                    <th className="p-3.5">JUSTIFICATION & THREAT SUMMARY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sitrep.critical_sectors_summary.map((c, idx) => (
                    <tr key={`${c.sector_id}-${idx}`} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-bold uppercase text-white print:text-black">{c.sector_name}</td>
                      <td className="p-3.5">
                        <span className="chip-critical text-[10px]">{c.status.replace("_", " ")}</span>
                      </td>
                      <td className="p-3.5 font-bold text-[#34D399]">{(c.confidence * 100).toFixed(0)}%</td>
                      <td className="p-3.5 text-[#94A3B8] print:text-black text-xs font-body-prose">{c.status_reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Priority Operational Directives */}
          <div className="space-y-3 font-mono-data text-xs">
            <h3 className="text-xs text-[#60A5FA] font-bold uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-[#E11D48]" />
              5. COMMANDER PRIORITY OPERATIONAL DIRECTIVES
            </h3>
            <div className="rounded-2xl border border-white/10 divide-y divide-white/5">
              {sitrep.priority_operational_directives.map((action, idx) => (
                <div key={`${action.action_code}-${idx}`} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#60A5FA]">[{action.action_code}]</span>
                      <strong className="text-sm text-white print:text-black uppercase">Target: {action.target_sector}</strong>
                      <span className="chip-critical text-[10px]">{action.urgency}</span>
                    </div>
                    <p className="font-body-prose text-xs text-[#94A3B8] print:text-black">
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
