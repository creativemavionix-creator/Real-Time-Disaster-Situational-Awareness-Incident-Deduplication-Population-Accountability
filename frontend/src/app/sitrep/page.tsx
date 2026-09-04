"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  RefreshCw,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export default function SitrepPage() {
  const [sitrep, setSitrep] = useState<SitrepReportResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchCurrentSitrep();
      setSitrep(res);
    } catch (err: any) {
      setError(err.message || "Failed to generate live SITREP");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = async () => {
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
    try {
      await navigator.clipboard.writeText(md);
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = md;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="flex-1 w-full p-4 sm:p-8 lg:p-12 space-y-8 max-w-5xl mx-auto"
      style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-primary)" }}
    >
      {/* Page Actions & Header */}
      <div
        className="pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="space-y-1">
          <div className="type-eyebrow flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span>04 // Formal Disaster Reporting</span>
          </div>
          <h1
            className="font-display-calm font-medium tracking-tight"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              color: "var(--fg-primary)",
            }}
          >
            Situation Report (SITREP)
          </h1>
          <p className="type-body-sm" style={{ maxWidth: "55ch" }}>
            Automated UN OCHA / NDMA standardized Situation Report synthesizing
            fused multi-agency intelligence, casualty tolls, and commander
            operational directives.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 font-mono-data text-xs">
          <button
            onClick={handleCopyMarkdown}
            type="button"
            disabled={!sitrep}
            aria-label="Copy SITREP as Markdown"
            className="btn-action-secondary text-xs py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#34D399]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#94A3B8]" />
            )}
            <span>{copied ? "COPIED" : "COPY MARKDOWN"}</span>
          </button>
          <button
            onClick={handlePrint}
            type="button"
            disabled={!sitrep}
            aria-label="Print or export SITREP as PDF"
            className="btn-action-primary text-xs py-2 px-5 rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT / PDF</span>
          </button>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <div
          className="chip-critical p-4 rounded-xl flex items-center justify-between gap-2 font-mono-data"
          style={{ fontSize: "var(--text-xs)" }}
          role="alert"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>[SITREP_ERROR]: {error}</span>
          </div>
          <button
            onClick={loadData}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-xs"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && !sitrep && (
        <div
          aria-label="Loading SITREP…"
          className="space-y-6 animate-pulse"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-2xl)",
            padding: "clamp(1.5rem, 3vw, 2.5rem)",
          }}
        >
          <div className="h-6 rounded w-2/3 bg-white/10" />
          <div className="h-4 rounded w-1/2 bg-white/10" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-white/10" />
            ))}
          </div>
          <div className="h-24 rounded-lg bg-white/10" />
          <div className="h-16 rounded-lg bg-white/10" />
        </div>
      )}

      {/* Official SITREP Document Canvas */}
      {sitrep && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8 print:bg-white print:text-black print:border-none print:p-0 print:shadow-none"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-2xl)",
            padding: "clamp(1.5rem, 3vw, 2.5rem)",
            boxShadow: "0 24px 48px -16px rgba(0,0,0,0.6)",
          }}
          aria-label="SITREP report body"
        >
          {/* Document Header */}
          <div
            className="pb-6 space-y-3 font-mono-data"
            style={{ borderBottom: "1px solid var(--border-faint)" }}
          >
            <div
              className="flex flex-wrap items-center justify-between gap-2 font-bold uppercase"
              style={{ fontSize: "var(--text-xs)" }}
            >
              <span
                className="flex items-center gap-1.5"
                style={{ color: "var(--status-intel-text)" }}
              >
                <UserCheck className="w-3.5 h-3.5" />
                AUTHORIZED BY: {sitrep.authorized_by}
              </span>
              <span className="chip-neutral">CODE: {sitrep.sitrep_id}</span>
            </div>

            <h2
              className="font-display-calm font-semibold"
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                color: "var(--fg-primary)",
                letterSpacing: "var(--ls-snug)",
              }}
            >
              {sitrep.disaster_event_name}
            </h2>

            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2"
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--fg-secondary)",
              }}
            >
              <div>
                PERIOD:{" "}
                <strong style={{ color: "var(--fg-primary)" }}>
                  {sitrep.operational_period}
                </strong>
              </div>
              <div>
                TIMELINE:{" "}
                <strong style={{ color: "var(--status-intel-text)" }}>
                  T+{sitrep.elapsed_hours.toFixed(1)}h
                </strong>
              </div>
              <div>
                PUBLISHED:{" "}
                <strong style={{ color: "var(--fg-primary)" }}>
                  {new Date(sitrep.simulated_time).toUTCString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-3">
            <h3
              className="font-mono-data font-bold uppercase flex items-center gap-2"
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--status-intel-text)",
                letterSpacing: "var(--ls-wider)",
              }}
            >
              <FileText className="w-3.5 h-3.5" />
              1. Executive Operational Briefing
            </h3>
            <p
              className="type-body-sm print:text-black"
              style={{
                fontSize: "var(--text-sm)",
                lineHeight: "var(--lh-body)",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-faint)",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
              }}
            >
              {sitrep.executive_summary}
            </p>
          </div>

          {/* Section 2: Reconciled Casualty Ledger */}
          <div className="space-y-3">
            <h3
              className="font-mono-data font-bold uppercase"
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--status-intel-text)",
                letterSpacing: "var(--ls-wider)",
              }}
            >
              2. Reconciled Casualty &amp; Life-Safety Ledger
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-data">
              {[
                {
                  label: "Fatalities",
                  value: sitrep.casualty_toll.confirmed_fatalities,
                  color: "var(--status-critical-text)",
                },
                {
                  label: "Trapped / SAR",
                  value: sitrep.casualty_toll.trapped_unaccounted,
                  color: "var(--status-warning-text)",
                },
                {
                  label: "Hospitalized",
                  value: sitrep.casualty_toll.confirmed_injured,
                  color: "var(--status-ok-text)",
                },
                {
                  label: "Missing",
                  value: sitrep.casualty_toll.missing_persons_active,
                  color: "var(--status-critical-text)",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="text-center space-y-1"
                  style={{
                    padding: "1rem",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border-faint)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <span
                    className="block uppercase font-bold"
                    style={{
                      fontSize: "var(--text-2xs)",
                      color: "var(--fg-tertiary)",
                      letterSpacing: "var(--ls-wider)",
                    }}
                  >
                    {label}
                  </span>
                  <div
                    className="font-display-calm font-bold"
                    style={{ fontSize: "var(--text-3xl)", color, lineHeight: 1 }}
                  >
                    <AnimatedCounter value={value} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Blackout Intelligence Briefing */}
          <div className="space-y-3">
            <h3
              className="font-mono-data font-bold uppercase flex items-center gap-2"
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--status-intel-text)",
                letterSpacing: "var(--ls-wider)",
              }}
            >
              <Radio
                className="w-3.5 h-3.5"
                style={{ color: "var(--accent)" }}
              />
              3. Silent Blackout &amp; Isolated Sector Briefing
            </h3>
            <p
              className="type-body-sm print:text-black"
              style={{
                padding: "1rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-faint)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              {sitrep.blackout_intelligence_briefing}
            </p>
          </div>

          {/* Section 4: Critical Sector Summary */}
          <div className="space-y-3">
            <h3
              className="font-mono-data font-bold uppercase"
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--status-intel-text)",
                letterSpacing: "var(--ls-wider)",
              }}
            >
              4. Critical Intervention Sectors
            </h3>
            <div
              className="overflow-x-auto"
              style={{
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <table
                className="w-full text-left border-collapse font-mono-data"
                style={{ fontSize: "var(--text-xs)" }}
              >
                <thead
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    borderBottom: "1px solid var(--border-faint)",
                  }}
                >
                  <tr
                    style={{
                      color: "var(--fg-tertiary)",
                      textTransform: "uppercase",
                      letterSpacing: "var(--ls-wider)",
                      fontSize: "var(--text-2xs)",
                    }}
                  >
                    <th className="font-normal" style={{ padding: "0.75rem 1rem" }}>Sector</th>
                    <th className="font-normal" style={{ padding: "0.75rem 1rem" }}>Status</th>
                    <th className="font-normal" style={{ padding: "0.75rem 1rem" }}>Confidence</th>
                    <th className="font-normal" style={{ padding: "0.75rem 1rem" }}>Justification &amp; Threat Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {sitrep.critical_sectors_summary.map((c, idx) => (
                    <tr
                      key={`${c.sector_id}-${idx}`}
                      className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderTop: "1px solid var(--border-faint)" }}
                    >
                      <td
                        className="font-bold uppercase"
                        style={{ padding: "0.875rem 1rem", color: "var(--fg-primary)" }}
                      >
                        {c.sector_name}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span className="chip-critical">
                          {c.status.replace("_", " ")}
                        </span>
                      </td>
                      <td
                        className="font-bold"
                        style={{ padding: "0.875rem 1rem", color: "var(--status-ok-text)" }}
                      >
                        {(c.confidence * 100).toFixed(0)}%
                      </td>
                      <td
                        className="font-body-prose"
                        style={{
                          padding: "0.875rem 1rem",
                          color: "var(--fg-secondary)",
                          fontSize: "var(--text-xs)",
                        }}
                      >
                        {c.status_reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Priority Operational Directives */}
          <div className="space-y-3">
            <h3
              className="font-mono-data font-bold uppercase flex items-center gap-2"
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--status-intel-text)",
                letterSpacing: "var(--ls-wider)",
              }}
            >
              <ShieldAlert
                className="w-3.5 h-3.5"
                style={{ color: "var(--accent)" }}
              />
              5. Commander Priority Operational Directives
            </h3>
            <div
              style={{
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
              }}
            >
              {sitrep.priority_operational_directives.map((action, idx) => (
                <div
                  key={`${action.action_code}-${idx}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                  style={{
                    padding: "1rem",
                    borderTop: idx === 0 ? "none" : "1px solid var(--border-faint)",
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono-data font-bold"
                        style={{ color: "var(--status-intel-text)", fontSize: "var(--text-xs)" }}
                      >
                        [{action.action_code}]
                      </span>
                      <strong
                        className="font-display-calm uppercase"
                        style={{ fontSize: "var(--text-sm)", color: "var(--fg-primary)" }}
                      >
                        Target: {action.target_sector}
                      </strong>
                      <span className="chip-warning">{action.urgency}</span>
                    </div>
                    <p className="type-body-sm">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Copied Toast */}
      {copied && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl font-mono-data text-xs font-bold text-emerald-300 bg-emerald-900/80 border border-emerald-700 shadow-2xl backdrop-blur-xl"
          role="status"
          aria-live="polite"
        >
          <Check className="w-4 h-4" />
          SITREP markdown copied to clipboard
        </motion.div>
      )}
    </div>
  );
}
