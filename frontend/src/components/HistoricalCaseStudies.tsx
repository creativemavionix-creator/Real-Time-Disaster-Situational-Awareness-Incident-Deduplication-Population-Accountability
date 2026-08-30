"use client";

import React, { useState } from "react";

interface CaseStudy {
  id: string;
  tag: string;
  category: string;
  title: string;
  date: string;
  locations: string;
  impact: string;
  blackoutChallenge: string;
  prismOutput: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "case-01",
    tag: "Case 01",
    category: "SEISMIC RECONSTRUCTION",
    title: "2015 Gorkha Earthquake (7.8 Mw)",
    date: "25 April 2015",
    locations: "Gorkha, Barpak, Sindhupalchok",
    impact: "8,964 Fatalities • 22,300 Injured • 762,000 Buildings Damaged",
    blackoutChallenge: "Barpak epicentral region suffered total communications cutoff for 24+ hours. Emergency ops received thousands of calls from Kathmandu while zero calls arrived from Barpak.",
    prismOutput: "Project PRISM inferred high structural damage (98% Inferred Risk) due to zero transmission duration and epicenter proximity, escalating Verification Priority before field reports arrived.",
  },
  {
    id: "case-02",
    tag: "Case 02",
    category: "RIDGE CORRIDOR SEISMIC EVENT",
    title: "2023 Jajarkot & Rukum West Earthquake (6.4 Mw)",
    date: "03 November 2023",
    locations: "Jajarkot, Rukum West, Barekot",
    impact: "157 Fatalities • 375 Injured • 35,000 Homes Destroyed",
    blackoutChallenge: "Remote mountain ridgeline settlements lost night-time grid power. False early rumors understated the tragedy due to low reporting volume in Barekot.",
    prismOutput: "Project PRISM cross-referenced 260K structural building survey priors with terrain slope, immediately tagging remote stone-masonry settlements as Critical Inferred Hazard.",
  },
  {
    id: "case-03",
    tag: "Case 03",
    category: "HYDROLOGICAL DEBRIS DISASTER",
    title: "2021 Melamchi Helambu Flash Flood Sequence",
    date: "15 June 2021",
    locations: "Melamchi, Helambu, Bahrabise Corridor",
    impact: "25 Missing/Fatalities • 6 Bridges Severed • $50M Water Intake Damage",
    blackoutChallenge: "Heavy monsoon cloud cover blinded standard optical earth satellites, while river gauge telemetries were destroyed in the first 15 minutes of surging debris.",
    prismOutput: "Copernicus Sentinel-1 SAR interferometric coherence radar detected river valley bed shifts, corroborating police radio logs and triggering instant heavy equipment dispatch.",
  },
];

export function HistoricalCaseStudies() {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const currentCase = CASE_STUDIES[activeCaseIndex];

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="prism-card p-6 sm:p-10 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="prism-badge-cyan">
              <span>🏛</span>
              <span>REAL-WORLD NEPAL DISASTER CASE STUDIES</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
              Historical Case Studies & Telemetry Analysis
            </h2>
            <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Examine how Project PRISM's negative-evidence algorithms handle major historical Himalayan disasters.
            </p>
          </div>

          {/* Case Tab Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200/80 dark:border-slate-700 self-start md:self-auto">
            {CASE_STUDIES.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setActiveCaseIndex(idx)}
                type="button"
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCaseIndex === idx
                    ? "bg-[#0088A9] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {c.tag}
              </button>
            ))}
          </div>
        </div>

        {/* Case Event Metadata */}
        <div className="space-y-3">
          <div className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            {currentCase.category}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              {currentCase.title}
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>📅</span>
                <span>{currentCase.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>📍</span>
                <span>{currentCase.locations}</span>
              </div>
            </div>
          </div>

          {/* Impact Banner */}
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-3.5 rounded-xl font-mono text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <span className="text-base">📊</span>
            <span>
              <strong>Historical Disaster Impact:</strong> {currentCase.impact}
            </span>
          </div>
        </div>

        {/* Side by Side Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Blackout Challenge */}
          <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
            <div className="font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              THE INFORMATION BLACKOUT CHALLENGE
            </div>
            <p className="font-body-prose text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentCase.blackoutChallenge}
            </p>
          </div>

          {/* Right: PRISM Reconstructive Output */}
          <div className="p-6 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-900/40 space-y-3">
            <div className="font-mono text-[11px] font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
              PRISM RECONSTRUCTIVE OUTPUT
            </div>
            <p className="font-body-prose text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentCase.prismOutput}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
