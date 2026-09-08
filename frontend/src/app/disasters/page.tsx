"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Waves,
  Wind,
  Mountain,
  Flame,
  ArrowRight,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { TacticalAudio } from "@/lib/TacticalAudio";

interface DisasterArchetype {
  id: string;
  name: string;
  category: string;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  headline: string;
  physicsDescription: string;
  failureMechanism: string;
  historicalPrecedent: string;
  pratyakshDifference: string;
  tacticalUnits: string[];
}

const ARCHETYPES: DisasterArchetype[] = [
  {
    id: "seismic",
    name: "Seismic Rupture",
    category: "GEOPHYSICAL HAZARD",
    color: "#E11D48",
    icon: Activity,
    headline: "High-magnitude crustal slip shearing stone masonry and severing mountain lifelines.",
    physicsDescription:
      "A sudden slip along deep tectonic fault lines releases immense elastic strain energy. High-frequency shockwaves radiate through the bedrock, causing violent ground acceleration that shears unreinforced stone and mud-mortar dwellings within seconds.",
    failureMechanism:
      "Conventional dispatch waits for phone calls. But the strongest shaking occurs directly above the fault where cell towers tilt, transmission lines snap, and mountain access passes are buried by rockfalls—plunging the epicenter into complete communications silence.",
    historicalPrecedent:
      "2015 Gorkha M7.8 Earthquake (Barpak, Nepal). 8,964 dead, 22,000 injured, 600,000 structures destroyed across Central Nepal.",
    pratyakshDifference:
      "PRATYAKSH-Ω computes expected ground shaking across all palikas instantly upon rupture. When high-shock sectors show zero incoming calls, it raises an immediate Critical Blackout Alert, launching reconnaissance drones and dispatching heavy urban search-and-rescue teams directly to the epicenter.",
    tacticalUnits: [
      "Heavy Urban Search & Rescue (USAR)",
      "Acoustic Geophone Void Locators",
      "Armored Tracked Excavators",
      "High-Altitude Air Medevac",
    ],
  },
  {
    id: "flash_flood",
    name: "Glacial & River Breach (GLOF)",
    category: "HYDROLOGICAL HAZARD",
    color: "#06B6D4",
    icon: Waves,
    headline: "Catastrophic moraine dam failure releasing millions of cubic meters of sediment-laden torrents.",
    physicsDescription:
      "High-altitude glacial lakes, swollen by climate melt or triggered by ice avalanches, breach their terminal moraines. Millions of cubic meters of water and boulder slurries accelerate down narrow Himalayan river valleys at high velocity, carving out riverbanks and scouring bridge foundations.",
    failureMechanism:
      "Villages located downstream in valley floors have only minutes to evacuate. Conventional river monitoring stations are often swept away by the initial debris surge, depriving civil defense of downstream flood crest timing.",
    historicalPrecedent:
      "2021 Melamchi River Outburst (Sindhupalchok, Nepal). Massive sediment slurry buried water treatment intakes, destroyed 5 suspension bridges, and wiped out downstream settlements.",
    pratyakshDifference:
      "Our system tracks hydraulic discharge velocity and riverbed elevation profiles. As the surge sweeps down the gorge, the system models the precise time-to-impact for downstream hamlets, initiating automated broadcast alerts and positioning swiftwater inflatable teams before road corridors are severed.",
    tacticalUnits: [
      "Swiftwater Rescue Inflatables",
      "Submersible High-Volume Trash Pumps",
      "Autonomous Drone Delivery Payloads",
      "Emergency Potable Water Purification Units",
    ],
  },
  {
    id: "cyclone",
    name: "Severe Gale & Storm Surge",
    category: "METEOROLOGICAL HAZARD",
    color: "#3B82F6",
    icon: Wind,
    headline: "Extreme rotational gale winds collapsing power transmission pylons and isolating lowlands.",
    physicsDescription:
      "Low-pressure weather systems channel intense rotational winds and tropical downpours across the southern plains and Himalayan foothills. Sustained gusts uproot mature timber, tear sheet-metal roofing, and trigger rapid localized stream surges.",
    failureMechanism:
      "High-voltage electrical transmission grids trip over wide geographic areas as falling trees short distribution feeders. Widespread power outages shut down cellular transceivers, blinding emergency services to rural casualty clusters.",
    historicalPrecedent:
      "2019 Bara-Parsa Tornado & Severe Storm (Terai, Nepal). Level-3 wind event collapsed transmission lines and killed 28 people, injuring hundreds in rural brick-kiln communities.",
    pratyakshDifference:
      "PRATYAKSH-Ω monitors regional electrical substation load drops and cellular tower ping vitalities. By correlating wind velocity vectors with telecommunications dropouts, the system isolates high-wind impact swaths and directs high-output mobile generator convoys to keep lifeline antennas alive.",
    tacticalUnits: [
      "Mobile Lineman Bucket Trucks",
      "High-Output Mobile Generators",
      "Rapid Chainsaw Arterial Clearing Squads",
      "Field Trauma Surgical Deployments",
    ],
  },
  {
    id: "landslide",
    name: "Mountain Valley Slope Failure",
    category: "GEOTECHNICAL HAZARD",
    color: "#D97706",
    icon: Mountain,
    headline: "Precipitation-saturated hillslope collapse damming river gorges and cleaving arterial roads.",
    physicsDescription:
      "Intense monsoonal rains saturate steep colluvial mountain slopes until pore-water pressure overcomes soil shear strength. Millions of cubic meters of rock, soil, and vegetation tear away from the mountain face in a massive debris runout.",
    failureMechanism:
      "A single major rockfall can choke the only highway connecting an entire mountain district to the outside world, simultaneously snapping bridge-hung fiber-optic cables and cutting off ground access for medical convoys.",
    historicalPrecedent:
      "2014 Jure Landslide (Sindhupalchok, Nepal). 5.5 million cubic meters of mountain face collapsed into the Sunkoshi River, damming the water into a temporary lake and cutting the Arniko Highway to China.",
    pratyakshDifference:
      "PRATYAKSH-Ω evaluates slope inclination, monsoonal soil saturation indices, and optical satellite imagery to detect road closures and river damming risks. When an arterial choke is detected, dispatch instantly pivots from ground transport to air sorties and tasking heavy bulldozers.",
    tacticalUnits: [
      "Heavy Tracked Front Loaders",
      "InSAR Ground Deformation Tasking",
      "Slope Stability Ground Radar Teams",
      "Explosive Demolition Clearing Units",
    ],
  },
  {
    id: "urban_fire",
    name: "Historic Core Conflagration",
    category: "TECHNOLOGICAL / ANTHROPOGENIC",
    color: "#F97316",
    icon: Flame,
    headline: "Dense medieval timber-brick alleyway firestorm threatening cultural monuments and trapped residents.",
    physicsDescription:
      "Ignited in dense historic city quarters, fires propagate rapidly across dry timber roof trusses and narrow alleyways. Radiant thermal heat fluxes exceed critical flashover thresholds, igniting adjacent building facades across narrow streets.",
    failureMechanism:
      "Standard fire engines cannot navigate ancient medieval alleys measuring less than two meters wide. Overhead wire tangles obstruct aerial ladders, and dry municipal water hydrants leave responders without pressurized water.",
    historicalPrecedent:
      "Patan & Kathmandu Historic Core Fires. Dense multi-century Newar courtyard architecture prone to rapid inter-building fire jump.",
    pratyakshDifference:
      "PRATYAKSH-Ω maps street width constraints from municipal GIS gazetteers, automatically directing ultra-narrow mini-pumpers and compressed air foam tenders rather than standard heavy engines, while calculating evacuation corridors through courtyard networks.",
    tacticalUnits: [
      "Narrow Attack Mini-Pumpers",
      "Compressed Air Foam (CAFS) Tenders",
      "High-Pressure SCBA Compressors",
      "Thermal Drone Hotspot Trackers",
    ],
  },
];

export default function DisastersPage() {
  const [activeTab, setActiveTab] = useState(0);
  const activeArchetype = ARCHETYPES[activeTab];
  const Icon = activeArchetype.icon;

  return (
    <div
      className="w-full min-h-screen relative"
      style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-primary)" }}
    >
      {/* Header */}
      <section
        className="relative pt-20 pb-16 px-6 sm:px-12 lg:px-20 border-b overflow-hidden"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-mono-data text-xs uppercase tracking-widest text-rose-400 font-bold">
              PHYSICAL PROFILES &bull; CATASTROPHE ARCHETYPES
            </span>
          </div>

          <h1 className="font-display-calm font-extrabold text-4xl sm:text-6xl text-white tracking-tight">
            Supported Disaster Archetypes
          </h1>

          <p className="font-body-prose text-base sm:text-lg text-[#9AAABE] max-w-3xl leading-relaxed">
            Different natural hazards break society in vastly different ways. Explore how PRATYAKSH-Ω models the physical kinetics of five major catastrophe classes across the Himalayan corridor.
          </p>
        </div>
      </section>

      {/* Main Tabbed Showcase */}
      <section className="py-16 px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto space-y-12">
        {/* Horizontal Archetype Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-white/10 pb-4">
          {ARCHETYPES.map((arch, idx) => {
            const TabIcon = arch.icon;
            const isSelected = activeTab === idx;
            return (
              <button
                key={arch.id}
                onClick={() => {
                  setActiveTab(idx);
                  TacticalAudio.playClick();
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? "bg-[#161C28] border-white/30 text-white shadow-lg"
                    : "bg-white/[0.02] border-white/5 text-[#5C6E84] hover:text-white hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <TabIcon
                    className="w-4 h-4"
                    style={{ color: isSelected ? arch.color : "#5C6E84" }}
                  />
                  <span className="font-mono-data text-[10px] text-[#5C6E84]">0{idx + 1}</span>
                </div>
                <div className="font-display-calm text-xs font-bold truncate text-white">
                  {arch.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Archetype Detailed Dossier */}
        <div className="space-y-10">
          {/* Headline & Overview */}
          <div className="space-y-3">
            <div
              className="inline-block font-mono-data text-[10px] font-bold tracking-wider px-2.5 py-1 rounded uppercase"
              style={{
                backgroundColor: `${activeArchetype.color}15`,
                color: activeArchetype.color,
                border: `1px solid ${activeArchetype.color}30`,
              }}
            >
              {activeArchetype.category}
            </div>

            <h2 className="font-display-calm text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {activeArchetype.name}
            </h2>

            <p className="font-body-prose text-lg text-[#CBD5E1] leading-relaxed">
              {activeArchetype.headline}
            </p>
          </div>

          {/* 2-Column Physical Mechanics & Failure Trap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-[#111620] border border-white/10 space-y-3">
              <div className="font-mono-data text-xs text-white font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                What Physically Happens
              </div>
              <p className="font-body-prose text-sm text-[#9AAABE] leading-relaxed m-0">
                {activeArchetype.physicsDescription}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
              <div className="font-mono-data text-xs text-rose-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Why Conventional Response Fails
              </div>
              <p className="font-body-prose text-sm text-rose-100/80 leading-relaxed m-0">
                {activeArchetype.failureMechanism}
              </p>
            </div>
          </div>

          {/* Historical Precedent */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="font-mono-data text-xs text-[#5C6E84] uppercase tracking-wider font-bold">
              Real-World Benchmark Precedent
            </div>
            <div className="font-body-prose text-sm text-[#CBD5E1] font-medium leading-relaxed">
              {activeArchetype.historicalPrecedent}
            </div>
          </div>

          {/* PRATYAKSH-Ω Operational Difference */}
          <div className="p-8 rounded-2xl bg-[#161C28] border border-white/10 space-y-4">
            <div className="font-mono-data text-xs text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              What PRATYAKSH-Ω Does Differently
            </div>
            <p className="font-body-prose text-base text-white leading-relaxed m-0">
              {activeArchetype.pratyakshDifference}
            </p>

            {/* Tactical Resource Allocations */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="font-mono-data text-[11px] text-[#5C6E84] uppercase tracking-wider">
                Recommended Specialized Deployment Assets:
              </div>
              <div className="flex flex-wrap gap-2">
                {activeArchetype.tacticalUnits.map((unit, uIdx) => (
                  <span
                    key={uIdx}
                    className="font-mono-data text-xs px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[#CBD5E1]"
                  >
                    &bull; {unit}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 font-mono-data text-xs">
            <Link
              href="/gis-map"
              onClick={() => TacticalAudio.playPing()}
              className="btn-action-primary flex items-center gap-2 py-2 px-4 rounded-xl"
            >
              <span>Simulate Wavefront on Live Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/scenario"
              onClick={() => TacticalAudio.playClick()}
              className="text-[#9AAABE] hover:text-white flex items-center gap-1.5"
            >
              <span>Read the Barpak Counterfactual</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
