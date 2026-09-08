"use client";

import React from "react";
import Link from "next/link";
import {
  Map,
  Layers,
  Radio,
  Cpu,
  Users,
  Truck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { TacticalAudio } from "@/lib/TacticalAudio";

const CAPABILITIES = [
  {
    id: "01",
    name: "Dynamic GIS & Hazard Wavefronts",
    tag: "GEOSPATIAL PHYSICS",
    icon: Map,
    iconColor: "#38BDF8",
    problem:
      "Conventional disaster dashboards are static pins on a flat map, updated hours or days after victims report damage. They tell you where damage was reported yesterday, not where danger is traveling right now.",
    solution:
      "PRATYAKSH-Ω simulates the physical propagation of disasters in real time. Whether it is an earthquake rupture radiating from an epicenter, a glacial flood wave surging down the Melamchi river, or monsoonal slope failure blocking a mountain pass, the system tracks the hazard wavefront as it expands across complex Himalayan topography.",
    uiExperience:
      "Operators watch live, animated shockwaves sweep across 3D terrain and H3 hexagonal microgrids, viewing instant estimates of shaking intensity, flood crest arrival times, and road lifeline cutoffs.",
    route: "/gis-map",
    buttonLabel: "Explore GIS Radar Map",
  },
  {
    id: "02",
    name: "Incident Deduplication & Multi-Agency Truth",
    tag: "NATURAL LANGUAGE CONSENSUS",
    icon: Layers,
    iconColor: "#10B981",
    problem:
      "During a crisis, emergency lines receive thousands of chaotic messages. Ten different citizens, police officers, and amateur radio operators report the same collapsed suspension bridge using ten different phrases, wildly different casualty guesses, and vague landmarks.",
    solution:
      "Our AI understands the contextual meaning of reports in both English and Nepali. It identifies that 'Trisuli bridge snapped near milepost 12' and 'suspension crossing collapsed on highway' describe the exact same event. It clusters duplicates together, filters panic rumors, and reconciles conflicting victim estimates against authentic UNOSAT satellite building damage points.",
    uiExperience:
      "A unified incident ledger showing deduplicated events. Operators can toggle between the chaotic raw feed and the clean truth ledger, observing an 80%+ reduction in dispatch noise.",
    route: "/deduplication",
    buttonLabel: "View Consensus Ledger",
  },
  {
    id: "03",
    name: "Negative Evidence & Blackout Intelligence",
    tag: "SILENCE DETECTION",
    icon: Radio,
    iconColor: "#E11D48",
    problem:
      "Traditional dispatch centers prioritize areas with the loudest call volume. Remote mountain valleys whose phone towers, power grids, and optical cables were severed generate zero calls—misleading emergency commanders into assuming they escaped damage.",
    solution:
      "By establishing diurnal baselines (how many phone calls and how much electrical power a community normally uses at any given hour), PRATYAKSH-Ω detects when an area unexpectedly goes dead quiet during an extreme hazard. The system treats silence not as safety, but as an urgent negative evidence alert.",
    uiExperience:
      "A real-time Blackout Risk ranking that highlights severed sectors in prominent crimson. Each sector displays its Silence Risk Score (0 to 10), duration of total telecom blackout, and estimated isolated population.",
    route: "/blackout-intel",
    buttonLabel: "Inspect Blackout Intel",
  },
  {
    id: "04",
    name: "Bayesian Epistemic Reality Reconstruction",
    tag: "PROBABILISTIC REASONING",
    icon: Cpu,
    iconColor: "#8B5CF6",
    problem:
      "When a remote village goes silent, emergency supervisors face a critical puzzle: Did the town suffer catastrophic building collapse, or did a single cell tower battery just run out of fuel while everyone is safe in the fields?",
    solution:
      "Rather than guessing, PRATYAKSH-Ω maintains five competing hypotheses for every silent sector. As new pieces of evidence arrive—satellite radar scans from Copernicus Sentinel-1, amateur radio chatter, or aerial drone flyovers—the system uses Bayesian mathematics to mathematically update the probability of each scenario, steadily collapsing uncertainty.",
    uiExperience:
      "An interactive probability chamber where commanders can inspect the five hypotheses for any district, view current confidence percentages, and task targeted reconnaissance sorties to eliminate remaining uncertainty.",
    route: "/hypotheses",
    buttonLabel: "Open Hypothesis Chamber",
  },
  {
    id: "05",
    name: "Population Exposure & Census Accountability",
    tag: "DEMOGRAPHIC ACCOUNTABILITY",
    icon: Users,
    iconColor: "#F59E0B",
    problem:
      "Post-disaster rescue operations often operate in the dark regarding who was actually present in the impact zone. Responders don't know if an affected municipality had 2,000 residents or 20,000, how many were elderly, or how many buildings were built from unreinforced mud and stone.",
    solution:
      "We ground every sector directly in official Central Bureau of Statistics (CBS) Nepal 2021 Census demographics. By overlaying physical hazard intensity onto local building construction types, PRATYAKSH-Ω predicts structural collapse rates and tracks individual missing person inquiries against hospital rosters and evacuation centers.",
    uiExperience:
      "A district-by-district accountability matrix displaying exposed population counts, percentages of vulnerable children and elderly, and a live roster reconciling confirmed safe individuals, hospital admissions, and active missing reports.",
    route: "/population",
    buttonLabel: "Review Population Matrix",
  },
  {
    id: "06",
    name: "Specialized Tactical Dispatch & Sorties",
    tag: "RESOURCE OPTIMIZATION",
    icon: Truck,
    iconColor: "#06B6D4",
    problem:
      "In chaotic aftermaths, the wrong rescue assets are frequently sent to the wrong disasters—such as sending swiftwater rubber boats to dry earthquake rockfalls, or sending light medical kits where heavy hydraulic excavators are required to lift collapsed concrete slabs.",
    solution:
      "PRATYAKSH-Ω dynamically matches specialized field units (Armed Police Force disaster squads, trauma surgical teams, heavy tracked road clearers, satellite surveillance taskings) to sectors based on their dominant deficit profile, prioritizing life-safety recovery within the crucial 72-hour survival window.",
    uiExperience:
      "A high-priority deployment queue with recommended units, calculated travel times, and one-click sortie authorization complete with role-based sign-off and historical audit logs.",
    route: "/dispatch",
    buttonLabel: "View Dispatch Board",
  },
];

export default function MethodologyPage() {
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
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
            <span className="font-mono-data text-xs uppercase tracking-widest text-[#38BDF8] font-bold">
              SYSTEM ARCHITECTURE &bull; HOW IT WORKS
            </span>
          </div>

          <h1 className="font-display-calm font-extrabold text-4xl sm:text-6xl text-white tracking-tight">
            The Six Core Capabilities
          </h1>

          <p className="font-body-prose text-base sm:text-lg text-[#9AAABE] max-w-3xl leading-relaxed">
            A plain-language guide for civil protection evaluators, humanitarian directors, and decision-makers. No formulas or code—just the operational problems we solve and how commanders experience them on screen.
          </p>
        </div>
      </section>

      {/* Main Capability Sections */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto space-y-24">
        {CAPABILITIES.map((cap, idx) => {
          const Icon = cap.icon;
          return (
            <div
              key={cap.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start border-b border-white/5 pb-20 last:border-0"
            >
              {/* Left Column: Number, Title, Tag */}
              <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-28">
                <div className="flex items-center gap-2 font-mono-data text-xs font-bold text-[#5C6E84]">
                  <span>CAPABILITY</span>
                  <span className="text-white">{cap.id} // 06</span>
                </div>

                <div
                  className="inline-block font-mono-data text-[10px] font-bold tracking-wider px-2.5 py-1 rounded uppercase"
                  style={{
                    backgroundColor: `${cap.iconColor}15`,
                    color: cap.iconColor,
                    border: `1px solid ${cap.iconColor}30`,
                  }}
                >
                  {cap.tag}
                </div>

                <h2 className="font-display-calm text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {cap.name}
                </h2>

                <Link
                  href={cap.route}
                  onClick={() => TacticalAudio.playClick()}
                  className="btn-action-secondary inline-flex items-center gap-2 text-xs py-2 px-4 rounded-xl cursor-pointer mt-2"
                >
                  <span>{cap.buttonLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Right Column: Problem, Solution, UI Experience */}
              <div className="lg:col-span-8 space-y-6 font-body-prose text-sm text-[#CBD5E1] leading-relaxed">
                {/* Problem */}
                <div className="space-y-1.5 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="font-mono-data text-xs text-rose-400 font-bold uppercase tracking-wider">
                    The Operational Problem
                  </div>
                  <p className="m-0 leading-relaxed text-[#9AAABE]">{cap.problem}</p>
                </div>

                {/* Solution */}
                <div className="space-y-1.5 p-5 rounded-2xl bg-[#111620] border border-white/10">
                  <div className="font-mono-data text-xs text-emerald-400 font-bold uppercase tracking-wider">
                    How PRATYAKSH-Ω Solves It
                  </div>
                  <p className="m-0 leading-relaxed text-white">{cap.solution}</p>
                </div>

                {/* UI Experience */}
                <div className="space-y-1.5 p-5 rounded-2xl bg-[#161C28] border border-white/10">
                  <div className="font-mono-data text-xs text-[#38BDF8] font-bold uppercase tracking-wider">
                    What The Commander Sees
                  </div>
                  <p className="m-0 leading-relaxed text-[#CBD5E1]">{cap.uiExperience}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Bottom Gateway */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0D1117] border border-white/10 text-center space-y-6">
          <h3 className="font-display-calm text-2xl sm:text-3xl font-bold text-white">
            Ready to See the System in Action?
          </h3>
          <p className="font-body-prose text-sm text-[#9AAABE] max-w-xl mx-auto leading-relaxed">
            Walk through a side-by-side simulation of what happens during the first three hours following a major Himalayan earthquake.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/scenario"
              onClick={() => TacticalAudio.playClick()}
              className="btn-action-primary text-xs py-3 px-6 rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <span>Explore the Barpak Scenario</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/disasters"
              onClick={() => TacticalAudio.playClick()}
              className="btn-action-secondary text-xs py-3 px-6 rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <span>View Disaster Archetypes</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
