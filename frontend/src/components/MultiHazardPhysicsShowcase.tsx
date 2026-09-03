"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  Waves,
  Wind,
  Mountain,
  Flame,
  Radio,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { TacticalAudio } from "@/lib/TacticalAudio";

interface DisasterSpec {
  id: string;
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  epicenter: string;
  metric: string;
  metricLabel: string;
  secondaryHazards: string;
  lifelineMechanism: string;
  recommendedUnits: string;
  gisPresetId: string;
}

const DISASTER_SPECS: DisasterSpec[] = [
  {
    id: "earthquake",
    name: "Seismic Rupture (M7.8 Gorkha Event)",
    label: "Seismic Rupture",
    icon: Activity,
    color: "#E11D48",
    epicenter: "Barpak, Gorkha (28°13'N, 84°45'E)",
    metric: "PGA > 0.48g (Coda 55s)",
    metricLabel: "Peak Ground Acceleration",
    secondaryHazards: "Liquefaction in Valley Alluvium, Coseismic Rockfalls, Damming of Trisuli River",
    lifelineMechanism: "Stone-masonry shearing, microwave tower foundation tilting, mountain pass burial",
    recommendedUnits: "Heavy USAR, Acoustic Geophones, Armored Tracked Excavators, Air Medevac",
    gisPresetId: "gorkha_earthquake",
  },
  {
    id: "flash_flood",
    name: "Glacial & River Breach (Melamchi Outburst)",
    label: "Glacial & River Breach",
    icon: Waves,
    color: "#06B6D4",
    epicenter: "Melamchi / Bhotekoshi Headwaters (28°02'N, 85°34'E)",
    metric: "Peak Q: 8,200 m³/s",
    metricLabel: "Hydraulic Discharge",
    secondaryHazards: "Riverbed Aggradation, Bridge Pier Scouring, High-Turbidity Water Intakes Blocked",
    lifelineMechanism: "Suspension bridge sheared, bridge-hung fiber conduits torn, pump stations drowned",
    recommendedUnits: "Swiftwater Rescue Inflatables, Submersible Trash Pumps, Drone Delivery Payloads",
    gisPresetId: "melamchi_flood",
  },
  {
    id: "cyclone",
    name: "Severe Gale & Storm Surge (Terai Low)",
    label: "Severe Gale & Storm",
    icon: Wind,
    color: "#3B82F6",
    epicenter: "Southern Foothills / Chitwan Basin (27°32'N, 84°28'E)",
    metric: "Gusts: 190 km/h",
    metricLabel: "Maximum Sustained Wind",
    secondaryHazards: "High-voltage transmission grid trip, sheet metal projectiles, flash stream surges",
    lifelineMechanism: "132kV transmission pylon buckling, dish misalignment, tree-fall feeder faults",
    recommendedUnits: "Chainsaw Clearing Squads, High-Output Mobile Generators, Lineman Buckets",
    gisPresetId: "terai_cyclone",
  },
  {
    id: "landslide",
    name: "Valley Slope Failure (Rasuwa Pass Choke)",
    label: "Mountain Landslide",
    icon: Mountain,
    color: "#D97706",
    epicenter: "Dhunche Mountain Pass (28°06'N, 85°18'E)",
    metric: "3.8M m³ Debris Runout",
    metricLabel: "Displaced Rockmass",
    secondaryHazards: "Trisuli River Valley Impoundment, Road Lifeline Choke, Optical Conduit Snaps",
    lifelineMechanism: "Pasang Lhamu arterial highway severed, fiber spans torn across gorges",
    recommendedUnits: "Heavy Tracked Front Loaders, Rockfall Radar Sensors, Satellite SAR Tasking",
    gisPresetId: "rasuwa_landslide",
  },
  {
    id: "urban_fire",
    name: "Dense Historic Core Conflagration (Kathmandu)",
    label: "Historic Core Firestorm",
    icon: Flame,
    color: "#F97316",
    epicenter: "Asan / Indra Chowk Core (27°42'N, 85°18'E)",
    metric: "Flux: 45 kW/m²",
    metricLabel: "Radiant Thermal Heat",
    secondaryHazards: "Flashover across timber-joist balconies, alley impassability, overhead wire bundle fires",
    lifelineMechanism: "Overhead bundle incineration, substation transformer burns, alley impassability",
    recommendedUnits: "Narrow Attack Mini-Pumpers, Compressed Air Foam Tenders, SCBA Compressors",
    gisPresetId: "patan_fire",
  },
];

export function MultiHazardPhysicsShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeDisaster = DISASTER_SPECS[activeIdx];
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);

  // Animated Waveform Canvas for the selected disaster
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const renderWave = () => {
      t += 0.04;
      const w = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
      const h = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const displayW = canvas.offsetWidth;
      const displayH = canvas.offsetHeight;

      ctx.clearRect(0, 0, displayW, displayH);

      // Baseline grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 0.5;
      for (let y = 0; y < displayH; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(displayW, y);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.strokeStyle = activeDisaster.color;
      ctx.lineWidth = 2;

      const midY = displayH / 2;

      for (let x = 0; x < displayW; x++) {
        const normX = x / displayW;
        let val = 0;

        if (activeDisaster.id === "earthquake") {
          // Seismogram: multiple high-frequency decaying harmonic sinusoids
          val =
            Math.sin(normX * 24 + t * 4) * Math.sin(normX * 4) * 28 +
            Math.sin(normX * 60 + t * 8) * 8;
        } else if (activeDisaster.id === "flash_flood") {
          // Hydrograph curve: sharp rise, long exponential tail + river turbulence
          const peakX = 0.35;
          const dist = normX - peakX;
          const envelope = dist < 0 ? Math.exp(dist * 6) : Math.exp(-dist * 3.5);
          val = envelope * 38 + Math.sin(normX * 18 + t * 3) * 6;
        } else if (activeDisaster.id === "cyclone") {
          // Gale gusts: large swelling pressure wave with fast vortex ripples
          val =
            Math.sin(normX * 6 + t * 2) * 24 +
            Math.cos(normX * 32 + t * 6) * 12;
        } else if (activeDisaster.id === "landslide") {
          // Debris runout parabola + friction step
          val = Math.sin(normX * Math.PI) * 32 + Math.sin(normX * 40 + t * 3) * 4;
        } else {
          // Urban fire radiant thermal flux: stochastic flame flicker
          val =
            Math.sin(normX * 12 + t * 5) * 18 +
            Math.cos(normX * 28 + t * 10) * 14;
        }

        const y = midY - val;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();

      // Filled gradient area underneath wave
      ctx.lineTo(displayW, displayH);
      ctx.lineTo(0, displayH);
      ctx.closePath();
      const fillGrad = ctx.createLinearGradient(0, 0, 0, displayH);
      fillGrad.addColorStop(0, `${activeDisaster.color}33`);
      fillGrad.addColorStop(1, `${activeDisaster.color}00`);
      ctx.fillStyle = fillGrad;
      ctx.fill();

      animId = requestAnimationFrame(renderWave);
    };

    animId = requestAnimationFrame(renderWave);

    return () => cancelAnimationFrame(animId);
  }, [activeDisaster]);

  return (
    <section className="relative py-28 p-4 sm:p-8 lg:p-16 border-t border-white/5 bg-[#090B0E]">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="font-mono-data text-xs text-[#E11D48] tracking-[0.25em] uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#E11D48]" />
              <span>02 // MULTI-HAZARD PHYSICS ENGINE</span>
            </div>
            <h2 className="font-display-calm text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight font-medium">
              Autonomous Catastrophe Physics
            </h2>
            <p className="font-body-prose text-sm sm:text-base text-[#94A3B8] max-w-2xl leading-relaxed">
              Disasters exhibit vastly distinct propagation kinetics. Select a profile to observe deterministic waveform attenuation, lifeline destruction vectors, and allocated rescue assets.
            </p>
          </div>

          <div className="font-mono-data text-xs text-[#64748B]">
            <span>5 PROFILES OPERATIONAL</span>
          </div>
        </div>

        {/* Disaster Selector Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#0C0E12] border border-white/10">
          {DISASTER_SPECS.map((item, idx) => {
            const IconComponent = item.icon;
            const isSelected = activeIdx === idx;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveIdx(idx);
                  TacticalAudio.playClick();
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-mono-data text-xs transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white/10 text-white font-bold shadow-lg border border-white/20"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <IconComponent className="w-4 h-4" style={{ color: item.color }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Interactive Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column (7): Real-Time Waveform Monitor & Physical Parameters */}
          <div className="lg:col-span-7 rounded-3xl bg-[#0C0E12] border border-white/10 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-widest">
                  LIVE PHYSICAL TELEMETRY OSCILLOSCOPE
                </span>
                <h3 className="font-display-calm text-2xl font-medium text-white">
                  {activeDisaster.name}
                </h3>
              </div>
              <div className="text-right font-mono-data">
                <div className="text-sm font-bold" style={{ color: activeDisaster.color }}>
                  {activeDisaster.metric}
                </div>
                <div className="text-[10px] text-[#64748B] uppercase">
                  {activeDisaster.metricLabel}
                </div>
              </div>
            </div>

            {/* Canvas Oscilloscope Monitor */}
            <div className="relative h-48 w-full rounded-2xl bg-black/60 border border-white/10 overflow-hidden">
              <canvas ref={waveformCanvasRef} className="w-full h-full" />
              <div className="absolute top-3 left-3 font-mono-data text-[10px] text-white/40 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse" />
                <span>REAL-TIME ATTENUATION CURVE</span>
              </div>
            </div>

            {/* Physical Telemetry Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-data text-xs">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[#64748B] uppercase block">Ignition / Epicenter Anchor</span>
                <span className="text-white font-bold">{activeDisaster.epicenter}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[#64748B] uppercase block">Secondary Cascading Risks</span>
                <span className="text-[#94A3B8]">{activeDisaster.secondaryHazards}</span>
              </div>
            </div>
          </div>

          {/* Right Column (5): Tactical Response & Lifeline Shearing */}
          <div className="lg:col-span-5 rounded-3xl bg-[#0C0E12] border border-white/10 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl">
            <div className="space-y-6">
              <div>
                <span className="font-mono-data text-[10px] text-[#E11D48] uppercase tracking-widest block mb-2 flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Lifeline Severance Mechanism</span>
                </span>
                <p className="font-body-prose text-sm text-[#F3F4F6] leading-relaxed">
                  {activeDisaster.lifelineMechanism}
                </p>
              </div>

              <div>
                <span className="font-mono-data text-[10px] text-[#059669] uppercase tracking-widest block mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Prioritized Rescue Fleet Units</span>
                </span>
                <div className="p-4 rounded-xl bg-[#059669]/10 border border-[#059669]/20 font-mono-data text-xs text-[#34D399] leading-relaxed">
                  {activeDisaster.recommendedUnits}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="font-mono-data text-[10px] text-[#64748B]">
                Explore in 3D Map
              </span>
              <Link
                href="/gis-map"
                onClick={() => TacticalAudio.playPing()}
                className="btn-action-primary text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-[#E11D48]/25"
              >
                <span>Simulate in GIS Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
