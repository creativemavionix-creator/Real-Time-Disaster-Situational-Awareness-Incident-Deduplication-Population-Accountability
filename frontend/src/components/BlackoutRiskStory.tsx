"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function BlackoutRiskStory() {
  const [blackoutLevel, setBlackoutLevel] = useState<number>(85);

  // Inferred risk formula: Risk = Epicenter Hazard + Silence Hazard + Slope Hazard
  const inferredRisk = Math.min(100, Math.round(35 + (blackoutLevel * 0.55) + 12));
  const reconPriority = inferredRisk > 75 ? "P1 — IMMEDIATE HELI SAR" : inferredRisk > 50 ? "P2 — UAV RECON" : "P3 — GROUND PATROL";

  return (
    <section className="py-16 sm:py-24 border-b border-[#E5E4DC] dark:border-[#232733] px-6 sm:px-12 lg:px-16 bg-[#F2F0E8]/40 dark:bg-[#13161D]/40">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="space-y-3 max-w-3xl">
          <div className="font-mono-data text-xs text-[#E11D48] dark:text-[#FB7185] font-bold uppercase tracking-wider">
            05 // SILENT BLACKOUT INTELLIGENCE
          </div>
          <h2 className="font-display-calm font-extrabold text-3xl sm:text-5xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
            What Can We Not See?
          </h2>
          <p className="font-body-prose text-sm sm:text-base text-[#5C6270] dark:text-[#9CA3AF] leading-relaxed">
            Standard crisis dashboards only display data where people have internet and power to tweet or call. In mountain crises, zero incoming reports from the epicenter is not evidence of safety—it is mathematical evidence of total infrastructure severance.
          </p>
        </div>

        {/* Negative-Evidence Interactive Sandbox */}
        <div className="surface-calm p-6 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E4DC] dark:border-[#232733] pb-4">
            <div className="font-mono-data text-xs">
              <span className="text-[#5C6270] dark:text-[#9CA3AF]">BAYESIAN NEGATIVE-EVIDENCE REASONING:</span>{" "}
              <strong className="text-[#E11D48] dark:text-[#FB7185]">NO REPORTS ≠ NO DANGER</strong>
            </div>

            <div className="font-mono-data text-xs text-[#5C6270] dark:text-[#9CA3AF]">
              Target: <strong className="text-[#111318] dark:text-[#F4F4F0]">Barpak (Gorkha) & Rasuwa Ridges</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Interactive Outage Control */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between font-mono-data text-xs">
                  <span className="text-[#5C6270] dark:text-[#9CA3AF] font-bold">REGIONAL TELECOM & ROAD OUTAGE:</span>
                  <strong className="text-base text-[#E11D48] dark:text-[#FB7185] font-bold">{blackoutLevel}% BLACKOUT</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={blackoutLevel}
                  onChange={(e) => setBlackoutLevel(Number(e.target.value))}
                  className="w-full h-2 bg-[#E5E4DC] dark:bg-[#232733] rounded-lg appearance-none cursor-pointer accent-[#E11D48]"
                />
                <div className="flex justify-between text-[10px] font-mono-data text-[#5C6270]">
                  <span>0% (Full Cellular & Road Comms)</span>
                  <span>100% (Total Mountain Isolation)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F2F0E8]/70 dark:bg-[#13161D]/70 border border-[#E5E4DC] dark:border-[#232733] space-y-2 font-mono-data text-xs text-[#5C6270] dark:text-[#9CA3AF]">
                <div className="font-bold text-[#111318] dark:text-[#F4F4F0] text-[11px] uppercase">
                  Spatial Physics Priors Included:
                </div>
                <ul className="space-y-1 text-[11px]">
                  <li>• Epicenter Proximity: <strong>14.2 km from rupture zone</strong></li>
                  <li>• Mountain Slope Gradient: <strong>32.4° steep terrain</strong></li>
                  <li>• Transportation Impedance: <strong>3 Trisuli bridges severed</strong></li>
                  <li>• Structural Fragility Census: <strong>68% unreinforced stone masonry</strong></li>
                </ul>
              </div>
            </div>

            {/* Right Column: Inferred Intelligence Outputs */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 surface-calm space-y-2">
                <span className="text-[10px] font-mono-data text-[#5C6270] dark:text-[#9CA3AF] uppercase font-bold block">
                  INFERRED RISK SCORE
                </span>
                <div className="text-4xl sm:text-5xl font-display-calm font-extrabold text-[#E11D48] dark:text-[#FB7185]">
                  {inferredRisk}%
                </div>
                <p className="font-body-prose text-xs text-[#5C6270] dark:text-[#9CA3AF]">
                  System infers severe destruction despite zero civilian incoming calls.
                </p>
              </div>

              <div className="p-5 surface-calm space-y-2">
                <span className="text-[10px] font-mono-data text-[#5C6270] dark:text-[#9CA3AF] uppercase font-bold block">
                  TACTICAL RECON SORTIE
                </span>
                <div className="text-lg font-mono-data font-bold text-[#111318] dark:text-[#F4F4F0]">
                  {reconPriority}
                </div>
                <p className="font-body-prose text-xs text-[#5C6270] dark:text-[#9CA3AF]">
                  Prioritizes recon sorties where uncertainty and potential peril are highest.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
