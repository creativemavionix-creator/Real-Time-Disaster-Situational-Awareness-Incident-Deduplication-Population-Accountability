"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Radio,
  CheckCircle2,
  XCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { TacticalAudio } from "@/lib/TacticalAudio";

interface Milestone {
  timeLabel: string;
  conventionalTitle: string;
  conventionalDesc: string;
  conventionalStat: string;
  conventionalBadge: string;
  pratyakshTitle: string;
  pratyakshDesc: string;
  pratyakshStat: string;
  pratyakshBadge: string;
}

const MILESTONES: Milestone[] = [
  {
    timeLabel: "T+0.5 Hours Post-Rupture",
    conventionalTitle: "Urban Noise Flooding",
    conventionalDesc:
      "Dispatch queues in Kathmandu are overwhelmed by 4,820 emergency telephone calls an hour regarding cosmetic plaster cracks and perimeter fence tremors. Because no phone calls arrive from the mountain ridge of Barpak, dispatch software assigns Barpak a low priority status.",
    conventionalStat: "4,820 Calls / hr (Urban Noise)",
    conventionalBadge: "MISALLOCATION RISK",
    pratyakshTitle: "Negative Evidence Trigger",
    pratyakshDesc:
      "PRATYAKSH-Ω compares expected diurnal communication traffic against observed telemetry. Barpak is calculated to have 14,000 residents and an expected volume of 48.5 calls/hr. Registering exactly 0.0 calls during MMI IX shaking, the system flags a critical divergence (Z = -5.82σ).",
    pratyakshStat: "Z = -5.82σ (Critical Blackout)",
    pratyakshBadge: "IMMEDIATE ALERT",
  },
  {
    timeLabel: "T+1.5 Hours Post-Rupture",
    conventionalTitle: "The Fatal Divergence",
    conventionalDesc:
      "82% of all available police squads, trauma ambulances, and light rescue vehicles are diverted to Kathmandu Valley streets to manage urban traffic jams and minor panic. Barpak remains completely invisible on the dashboard because zero messages have escaped the gorge.",
    conventionalStat: "82% Emergency Fleet Diverted",
    conventionalBadge: "FATAL BLIND SPOT",
    pratyakshTitle: "Autonomous Aerial Sortie Tasking",
    pratyakshDesc:
      "The Bayesian reality engine determines that the probability of Catastrophic Structural Rupture (H5) in Barpak is 58% dominant. The platform automatically tasks a high-speed VTOL reconnaissance drone from Pokhara to inspect the silent ridge.",
    pratyakshStat: "VTOL Drone Sortie Tasked",
    pratyakshBadge: "AUTONOMOUS RECON",
  },
  {
    timeLabel: "T+3.0 Hours Post-Rupture",
    conventionalTitle: "Golden Window Abandoned",
    conventionalDesc:
      "Barpak residents remain trapped under collapsed stone and heavy timber beams. With Pasang Lhamu highway choked by rockfalls and zero dispatch awareness, the first ground rescue teams will not reach the village for 48 to 72 hours—after most trapped victims have succumbed.",
    conventionalStat: "0 Units Dispatched to Epicenter",
    conventionalBadge: "GOLDEN WINDOW LOST",
    pratyakshTitle: "Direct Heavy USAR Mobilization",
    pratyakshDesc:
      "Drone optical passes verify 92% masonry collapse. Armed Police Force Heavy Urban Search & Rescue teams and high-altitude medevac helicopters are mobilized directly to the ridge at T+3.0h, initiating victim extrication during the golden survival window.",
    pratyakshStat: "Heavy USAR on Ground at T+3h",
    pratyakshBadge: "LIVES PRESERVED",
  },
];

export default function ScenarioPage() {
  const [viewMode, setViewMode] = useState<"comparison" | "pratyaksh" | "conventional">("comparison");

  return (
    <div
      className="w-full min-h-screen relative"
      style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-primary)" }}
    >
      {/* Header Banner */}
      <section
        className="relative pt-20 pb-16 px-6 sm:px-12 lg:px-20 border-b overflow-hidden"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-mono-data text-xs uppercase tracking-widest text-rose-400 font-bold">
              OPERATIONAL COUNTERFACTUAL &bull; PERSUASION CENTERPIECE
            </span>
          </div>

          <h1 className="font-display-calm font-extrabold text-4xl sm:text-6xl text-white tracking-tight">
            Barpak Ridge: Three Hours After the Quake
          </h1>

          <p className="font-body-prose text-base sm:text-lg text-[#9AAABE] max-w-3xl leading-relaxed">
            A walked-through comparison of what conventional emergency dispatch does versus what PRATYAKSH-Ω does when an isolated mountain epicenter goes dark.
          </p>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 pt-2 font-mono-data text-xs">
            <button
              onClick={() => {
                setViewMode("comparison");
                TacticalAudio.playClick();
              }}
              className={`px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                viewMode === "comparison"
                  ? "bg-white/15 border-white/30 text-white font-bold"
                  : "bg-white/[0.02] border-white/5 text-[#5C6E84] hover:text-white"
              }`}
            >
              Side-by-Side Comparison
            </button>
            <button
              onClick={() => {
                setViewMode("pratyaksh");
                TacticalAudio.playClick();
              }}
              className={`px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                viewMode === "pratyaksh"
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold"
                  : "bg-white/[0.02] border-white/5 text-[#5C6E84] hover:text-white"
              }`}
            >
              PRATYAKSH-Ω Only
            </button>
            <button
              onClick={() => {
                setViewMode("conventional");
                TacticalAudio.playClick();
              }}
              className={`px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                viewMode === "conventional"
                  ? "bg-rose-950/40 border-rose-500/50 text-rose-300 font-bold"
                  : "bg-white/[0.02] border-white/5 text-[#5C6E84] hover:text-white"
              }`}
            >
              Conventional Dispatch Only
            </button>
          </div>
        </div>
      </section>

      {/* Main Counterfactual Milestones */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto space-y-16">
        {MILESTONES.map((ms, idx) => (
          <div key={idx} className="space-y-6">
            {/* Timeline Tag */}
            <div className="flex items-center gap-3 font-mono-data text-xs">
              <Clock className="w-4 h-4 text-[#38BDF8]" />
              <span className="text-white font-bold tracking-wider">{ms.timeLabel}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Conventional Card */}
              {(viewMode === "comparison" || viewMode === "conventional") && (
                <div className="p-8 rounded-3xl bg-rose-950/15 border border-rose-500/30 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono-data text-[10px]">
                      <span className="text-rose-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Conventional Response
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                        {ms.conventionalBadge}
                      </span>
                    </div>

                    <h3 className="font-display-calm text-2xl font-bold text-white">
                      {ms.conventionalTitle}
                    </h3>

                    <p className="font-body-prose text-sm text-[#CBD5E1] leading-relaxed">
                      {ms.conventionalDesc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-rose-500/20 font-mono-data">
                    <div className="text-[10px] text-rose-400 uppercase tracking-wider">
                      Outcome Telemetry:
                    </div>
                    <div className="text-lg font-bold text-rose-200 mt-0.5">
                      {ms.conventionalStat}
                    </div>
                  </div>
                </div>
              )}

              {/* PRATYAKSH-Ω Card */}
              {(viewMode === "comparison" || viewMode === "pratyaksh") && (
                <div className="p-8 rounded-3xl bg-[#0F1D19]/40 border border-emerald-500/30 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono-data text-[10px]">
                      <span className="text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PRATYAKSH-Ω Epistemic Dispatch
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {ms.pratyakshBadge}
                      </span>
                    </div>

                    <h3 className="font-display-calm text-2xl font-bold text-white">
                      {ms.pratyakshTitle}
                    </h3>

                    <p className="font-body-prose text-sm text-[#CBD5E1] leading-relaxed">
                      {ms.pratyakshDesc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-emerald-500/20 font-mono-data">
                    <div className="text-[10px] text-emerald-400 uppercase tracking-wider">
                      Outcome Telemetry:
                    </div>
                    <div className="text-lg font-bold text-emerald-200 mt-0.5">
                      {ms.pratyakshStat}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Persuasion Summary Callout */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#111620] border border-white/10 text-center space-y-6">
          <div className="font-mono-data text-xs text-rose-400 font-bold uppercase tracking-widest">
            THE BOTTOM LINE
          </div>
          <h2 className="font-display-calm text-3xl sm:text-4xl font-bold text-white max-w-2xl mx-auto leading-snug">
            36 Hours Saved in the Golden Window
          </h2>
          <p className="font-body-prose text-base text-[#9AAABE] max-w-xl mx-auto leading-relaxed">
            By eliminating the reporting bias trap, PRATYAKSH-Ω converts a 48-hour rescue delay into a 3-hour forward deployment, ensuring rescue teams arrive while victims are still alive.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/gis-map"
              onClick={() => TacticalAudio.playPing()}
              className="btn-action-primary text-xs py-3 px-6 rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <span>Verify on Live GIS Radar Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/data-sources"
              onClick={() => TacticalAudio.playClick()}
              className="btn-action-secondary text-xs py-3 px-6 rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <span>Examine Data Sources</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
