"use client";

import React, { useState } from "react";

export function NegativeEvidenceSimulator() {
  const [outageLevel, setOutageLevel] = useState<number>(75);

  // Dynamic calculations based on blackout outage percentage
  const inferredRisk = Math.round(30 + (outageLevel * 0.72));
  const rescuePriority = Math.round(Math.max(15, 85 - (outageLevel * 0.48)));
  const verificationPriority = Math.round(20 + (outageLevel * 0.72));
  const silentDistricts = Math.round(1 + (outageLevel * 0.13));

  const handleReset = () => {
    setOutageLevel(75);
  };

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="prism-card p-6 sm:p-10 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="prism-badge-cyan">
              <span>✨</span>
              <span>INTERACTIVE DISASTER SILENCE SIMULATOR</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
              Negative-Evidence Intelligence Simulator
            </h2>
            <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Adjust communication blackout levels to watch PRATYAKSH-Ω rebalance Rescue vs Verification priorities in real-time.
            </p>
          </div>

          <button
            onClick={handleReset}
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer self-start md:self-auto"
          >
            <span>🔄</span>
            <span>Reset Simulation</span>
          </button>
        </div>

        {/* Interactive Slider Box */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span>📡</span>
              <span>REGIONAL COMMUNICATION OUTAGE LEVEL:</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-sm">
              {outageLevel}% Blackout
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={outageLevel}
              onChange={(e) => setOutageLevel(parseInt(e.target.value))}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600 dark:accent-purple-500"
            />

            <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
              <span>0% (Full Cell Network Uptime)</span>
              <span>50% (Partial Grid Collapse)</span>
              <span>100% (Total Comms Blackout)</span>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Inferred Risk Score */}
          <div className="p-6 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/50 space-y-3">
            <div className="font-mono text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
              INFERRED RISK SCORE
            </div>
            <div className="font-display font-extrabold text-4xl sm:text-5xl text-purple-600 dark:text-purple-400">
              {inferredRisk}%
            </div>
            <p className="font-body-prose text-xs text-slate-600 dark:text-slate-400">
              Calculated from epicenter distance & zero-transmission duration.
            </p>
          </div>

          {/* Card 2: Rescue Allocation Priority */}
          <div className="p-6 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 space-y-3">
            <div className="font-mono text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              RESCUE ALLOCATION PRIORITY
            </div>
            <div className="font-display font-extrabold text-4xl sm:text-5xl text-rose-600 dark:text-rose-400">
              {rescuePriority}%
            </div>
            <p className="font-body-prose text-xs text-slate-600 dark:text-slate-400">
              Immediate Search & Rescue dispatches for confirmed vocal areas.
            </p>
          </div>

          {/* Card 3: Verification Recon Priority */}
          <div className="p-6 rounded-2xl bg-cyan-50/40 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-900/50 space-y-3">
            <div className="font-mono text-[11px] font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
              VERIFICATION RECON PRIORITY
            </div>
            <div className="font-display font-extrabold text-4xl sm:text-5xl text-cyan-600 dark:text-cyan-400">
              {verificationPriority}%
            </div>
            <p className="font-body-prose text-xs text-slate-600 dark:text-slate-400">
              Urgent drone/satellite recon dispatches for silent blackout zones.
            </p>
          </div>
        </div>

        {/* Dark System Intelligence Output Box */}
        <div className="p-6 rounded-2xl bg-slate-950 text-white space-y-2.5 shadow-lg border border-slate-800 font-mono">
          <div className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase">
            SYSTEM INTELLIGENCE OUTPUT:
          </div>
          <p className="font-body-prose text-xs sm:text-sm text-slate-300 leading-relaxed">
            At <strong className="text-white font-bold">{outageLevel}% Comms Outage</strong>, PRATYAKSH-Ω flags <strong className="text-amber-400 font-bold">{silentDistricts} silent mountain districts</strong> with high Inferred Risk ({inferredRisk}%). Instead of ignoring them due to zero incoming calls, the system automatically escalates Verification Priority to <strong className="text-cyan-400 font-bold">{verificationPriority}%</strong> to dispatch satellite recon and UAV assets.
          </p>
        </div>
      </div>
    </section>
  );
}
