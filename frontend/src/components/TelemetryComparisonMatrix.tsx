"use client";

import React from "react";
import { SectorTelemetryComparison, LifelineMetricComparison } from "@/lib/api";
import {
  Smartphone,
  Zap,
  Globe,
  Truck,
  AlertOctagon,
  ShieldAlert,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

interface TelemetryComparisonMatrixProps {
  telemetry: SectorTelemetryComparison | null;
  isLoading?: boolean;
}

export default function TelemetryComparisonMatrix({
  telemetry,
  isLoading = false,
}: TelemetryComparisonMatrixProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400">Loading Telemetry & Lifeline Matrices...</p>
      </div>
    );
  }

  if (!telemetry) {
    return (
      <div className="p-6 text-center text-xs font-mono text-slate-500 border border-white/5 rounded-xl">
        Select a sector to inspect Expected vs Observed telemetry.
      </div>
    );
  }

  const lifelines: Array<{
    item: LifelineMetricComparison;
    icon: any;
    color: string;
    bgColor: string;
  }> = [
    {
      item: telemetry.mobile,
      icon: Smartphone,
      color: "#60A5FA",
      bgColor: "rgba(96, 165, 250, 0.1)",
    },
    {
      item: telemetry.electricity,
      icon: Zap,
      color: "#FBBF24",
      bgColor: "rgba(251, 191, 36, 0.1)",
    },
    {
      item: telemetry.internet,
      icon: Globe,
      color: "#A78BFA",
      bgColor: "rgba(167, 139, 250, 0.1)",
    },
    {
      item: telemetry.road,
      icon: Truck,
      color: "#34D399",
      bgColor: "rgba(52, 211, 153, 0.1)",
    },
  ];

  const isCritical = telemetry.silent_zone_risk_score >= 7.0;
  const isElevated = telemetry.silent_zone_risk_score >= 5.0 && !isCritical;

  return (
    <div className="space-y-4">
      {/* 1. Silent Zone Severity Score Header */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          isCritical
            ? "bg-red-950/40 border-red-500/50 shadow-[0_0_24px_rgba(239,68,68,0.2)]"
            : isElevated
            ? "bg-amber-950/30 border-amber-500/40"
            : "bg-emerald-950/20 border-emerald-500/30"
        }`}
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            {isCritical ? (
              <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />
            ) : isElevated ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                NEGATIVE EVIDENCE & SILENT ZONE RATING
              </span>
              <h4 className="text-sm font-bold text-white tracking-wide">
                {telemetry.silent_zone_tier.replace(/_/g, " ")}
              </h4>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">RISK INDEX</span>
            <div className="flex items-baseline gap-0.5 justify-end">
              <span
                className={`text-2xl font-black font-mono ${
                  isCritical ? "text-red-400" : isElevated ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {telemetry.silent_zone_risk_score.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400">/10</span>
            </div>
          </div>
        </div>

        {/* Core Doctrine Callout */}
        <div className="pt-2 border-t border-white/10 text-xs text-slate-300 font-sans leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-white">Silence != Safety: </strong>
            {telemetry.negative_evidence_reason}
          </p>
        </div>
      </div>

      {/* 2. Four Lifelines Expected vs Observed Comparison Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1">
          <span>CRITICAL LIFELINE VECTORS</span>
          <span>BASELINE vs EXPECTED vs OBSERVED</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {lifelines.map(({ item, icon: Icon, color, bgColor }) => {
            const hasSevereGap = item.gap_percentage >= 50.0;
            return (
              <div
                key={item.lifeline_type}
                className="p-3 rounded-xl bg-[#11141C] border border-white/10 hover:border-white/20 transition-all space-y-2"
              >
                {/* Top Row: Lifeline Name, Status Badge, Gap % */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: bgColor, color: color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block leading-tight">
                        {item.metric_label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 leading-none">
                        Unit: {item.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Deficit Badge */}
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 font-bold ${
                        hasSevereGap
                          ? "bg-red-500/20 text-red-300 border border-red-500/40"
                          : "bg-slate-700/40 text-slate-300"
                      }`}
                    >
                      <ArrowDownRight className="w-3 h-3" />
                      -{item.gap_percentage.toFixed(0)}%
                    </span>

                    {/* Status Tag */}
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        item.status.includes("CRITICAL") || item.status.includes("SEVERANCE")
                          ? "bg-red-900/40 text-red-400 border border-red-800"
                          : item.status.includes("DEGRADED") || item.status.includes("RESTRICTED")
                          ? "bg-amber-900/40 text-amber-400 border border-amber-800"
                          : "bg-emerald-900/40 text-emerald-400 border border-emerald-800"
                      }`}
                    >
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Numbers Comparison Matrix (3 Columns) */}
                <div className="grid grid-cols-3 gap-1 bg-[#090C12] p-2 rounded-lg border border-white/5 text-center font-mono">
                  <div className="border-r border-white/5">
                    <span className="text-[9px] text-slate-500 block uppercase">Historical</span>
                    <span className="text-xs text-slate-300 font-bold">
                      {item.historical_baseline} {item.unit}
                    </span>
                  </div>

                  <div className="border-r border-white/5">
                    <span className="text-[9px] text-blue-400 block uppercase">Expected</span>
                    <span className="text-xs text-blue-300 font-bold">
                      {item.expected_value} {item.unit}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`text-[9px] block uppercase ${
                        hasSevereGap ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      Observed
                    </span>
                    <span
                      className={`text-xs font-black ${
                        hasSevereGap ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {item.observed_value} {item.unit}
                    </span>
                  </div>
                </div>

                {/* Plain-text Explanation Note */}
                <p className="text-[11px] text-slate-400 font-mono leading-relaxed pl-1">
                  ↳ {item.explanation}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
