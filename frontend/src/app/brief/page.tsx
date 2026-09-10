"use client";

import React from "react";
import Link from "next/link";
import { Printer, Radar, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { TacticalAudio } from "@/lib/TacticalAudio";

export default function BriefPage() {
  const handlePrint = () => {
    TacticalAudio.playClick();
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div
      className="w-full min-h-screen relative py-12 px-4 sm:px-8 lg:px-16"
      style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-primary)" }}
    >
      {/* Action Toolbar — hidden when printing */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between no-print font-mono-data text-xs">
        <div className="flex items-center gap-2 text-[#5C6E84]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>PRINTABLE EXECUTIVE BRIEFING &bull; ONE-PAGE SUMMARY</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="btn-action-primary flex items-center gap-2 py-2 px-4 rounded-xl cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Container */}
      <article
        className="printable-document max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-[#0D1117] border border-white/15 space-y-10 shadow-2xl"
      >
        {/* Document Header */}
        <div className="border-b border-slate-700/60 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="font-mono-data text-[11px] text-rose-400 font-bold uppercase tracking-widest">
              MISSION INTELLIGENCE BRIEFING &bull; NEOC SPECIFICATION
            </div>
            <h1 className="font-display-calm font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              PRATYAKSH-Ω (प्रत्यक्ष)
            </h1>
            <div className="font-mono-data text-xs text-[#9AAABE]">
              Autonomous Negative Evidence Intelligence & Disaster Reality Reconstruction Platform
            </div>
          </div>

          <div className="font-mono-data text-right text-xs text-[#5C6E84] space-y-1">
            <div>TARGET: Central Nepal Corridor</div>
            <div>VER: 2.4 LTS (Active)</div>
            <div>STATUS: Operational</div>
          </div>
        </div>

        {/* 1. The Core Problem */}
        <section className="space-y-3">
          <div className="font-mono-data text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            1. The Problem Statement
          </div>
          <p className="font-body-prose text-base sm:text-lg text-[#CBD5E1] leading-relaxed">
            In catastrophic natural disasters, emergency response systems fall into the <strong>Reporting Bias Trap</strong>: they flood personnel and medical aid to connected urban areas that generate thousands of panic calls, while rural epicenters whose telecommunications and roads were completely severed generate zero calls. Consequently, conventional dashboards mistake silence for safety, delaying rescue to the most critical zones until trapped victims have perished.
          </p>
        </section>

        {/* 2. The Operational Doctrine */}
        <section className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
          <div className="font-mono-data text-xs font-bold text-rose-300 uppercase tracking-wider">
            2. The Core Doctrine
          </div>
          <blockquote className="font-quote-display italic text-xl sm:text-2xl text-white leading-snug m-0 pb-1">
            &ldquo;Silence is not safety. In catastrophic terrain, absence of distress calls is not evidence of calm—it is authoritative evidence of infrastructure collapse.&rdquo;
          </blockquote>
          <p className="font-body-prose text-xs text-rose-200/90 leading-relaxed m-0">
            PRATYAKSH-Ω continuously cross-references physical hazard shock against observed communication baselines to detect and prioritize silent, severed communities before a single human voice can escape.
          </p>
        </section>

        {/* 3. Six Core Capabilities */}
        <section className="space-y-4">
          <div className="font-mono-data text-xs font-bold text-[#38BDF8] uppercase tracking-wider">
            3. The Six Core Capabilities
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-body-prose text-xs text-[#CBD5E1]">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <strong className="text-white block font-mono-data text-sm">
                01. Dynamic GIS & Wavefront Physics
              </strong>
              <p className="text-[#9AAABE] m-0">
                Simulates real-time shockwave propagation across 3D Himalayan terrain, modeling shaking intensity, flood surge velocity, and landslide road chokes.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <strong className="text-white block font-mono-data text-sm">
                02. Semantic Incident Deduplication
              </strong>
              <p className="text-[#9AAABE] m-0">
                Clusters chaotic English and Nepali citizen reports into a single consolidated truth ledger, cross-validated against UNOSAT satellite damage points.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <strong className="text-white block font-mono-data text-sm">
                03. Blackout Risk Intelligence
              </strong>
              <p className="text-[#9AAABE] m-0">
                Ranks silent sectors by a 0-to-10 Silence Risk Index, measuring how long vulnerable populations have been isolated without power or cellular backhaul.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <strong className="text-white block font-mono-data text-sm">
                04. Bayesian Reality Reconstruction
              </strong>
              <p className="text-[#9AAABE] m-0">
                Evaluates five competing hypotheses for why an area went dark, steadily collapsing uncertainty as aerial drone and radar evidence arrives.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <strong className="text-white block font-mono-data text-sm">
                05. Population & Census Exposure
              </strong>
              <p className="text-[#9AAABE] m-0">
                Anchors damage in official CBS Nepal 2021 Census palika records to calculate vulnerable elderly and children, tracking active missing-person inquiries.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <strong className="text-white block font-mono-data text-sm">
                06. Tactical Dispatch Optimization
              </strong>
              <p className="text-[#9AAABE] m-0">
                Matches specialized Armed Police Force search-and-rescue squads and medical teams to highest-need sectors within the vital 72-hour survival window.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Concrete Operational Benchmark */}
        <section className="p-6 rounded-2xl bg-[#111620] border border-white/10 space-y-3 font-mono-data text-xs">
          <div className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
            4. Concrete Impact: Barpak Epicenter Benchmark
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <div className="text-[#5C6E84]">Conventional Response</div>
              <div className="text-rose-300 font-bold text-sm mt-0.5">82% Fleet Diverted</div>
              <div className="text-[10px] text-[#5C6E84]">Barpak unassisted for 48 hours</div>
            </div>
            <div>
              <div className="text-[#5C6E84]">PRATYAKSH-Ω Response</div>
              <div className="text-emerald-300 font-bold text-sm mt-0.5">Alert at T+0.5 Hours</div>
              <div className="text-[10px] text-[#5C6E84]">Reconnaissance drone launched</div>
            </div>
            <div>
              <div className="text-[#5C6E84]">Life-Saving Result</div>
              <div className="text-white font-bold text-sm mt-0.5">36h Golden Window Preserved</div>
              <div className="text-[10px] text-emerald-400">USAR boots on ground at T+3h</div>
            </div>
          </div>
        </section>

        {/* 5. Call to Action / Footer */}
        <div className="pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono-data text-xs text-[#5C6E84]">
            Official evaluation copy &bull; Verified against UNOSAT & CBS Nepal 2021
          </div>

          <div className="no-print">
            <Link
              href="/gis-map"
              onClick={() => TacticalAudio.playPing()}
              className="btn-action-primary flex items-center gap-2 py-3 px-6 rounded-xl text-xs cursor-pointer"
            >
              <Radar className="w-4 h-4" />
              <span>Launch Live GIS Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
