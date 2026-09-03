"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Compass, Check, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { TacticalAudio } from "@/lib/TacticalAudio";
import Link from "next/link";

interface EvidenceToggle {
  id: string;
  label: string;
  source: string;
  deltaH5: number;
  deltaH1: number;
  deltaH2: number;
}

const EVIDENCE_OPTIONS: EvidenceToggle[] = [
  {
    id: "vtol_drone",
    label: "Autonomous VTOL UAV Reconnaissance",
    source: "High-resolution optical pass over Barpak ridge reveals 78% masonry collapse",
    deltaH5: 2.4,
    deltaH1: -0.8,
    deltaH2: 1.2,
  },
  {
    id: "sentinel_insar",
    label: "Copernicus Sentinel-1 InSAR Pass",
    source: "Interferometric fringe analysis registers 1.2m surface displacement and gorge slide",
    deltaH5: 1.8,
    deltaH1: -0.4,
    deltaH2: 2.1,
  },
  {
    id: "ham_radio",
    label: "Amateur Radio VHF/HF HAM Packet",
    source: "District repeater receives intermittent call from local postmaster reporting trapped families",
    deltaH5: 1.5,
    deltaH1: -1.2,
    deltaH2: 0.5,
  },
  {
    id: "geophone_sensors",
    label: "Acoustic Victim Locator Deployments",
    source: "Seismic USAR geophone spikes acoustic signals 3m below rubble void",
    deltaH5: 2.9,
    deltaH1: -2.0,
    deltaH2: 0.2,
  },
];

export function BayesianEntropyChamber() {
  const [activeEvidences, setActiveEvidences] = useState<string[]>(["vtol_drone"]);

  const toggleEvidence = (id: string) => {
    let next: string[];
    if (activeEvidences.includes(id)) {
      next = activeEvidences.filter((item) => item !== id);
    } else {
      next = [...activeEvidences, id];
    }
    setActiveEvidences(next);

    TacticalAudio.playClick();
    if (next.length >= 3) {
      TacticalAudio.playEntropyChime();
    }
  };

  const resetEvidences = () => {
    setActiveEvidences([]);
    TacticalAudio.playClick();
  };

  // Bayesian calculation using Log-Sum-Exp softmax
  // Prior logits for H1..H5
  let logits = {
    H1: 0.2, // Comms failure
    H2: 0.3, // Infra severed
    H3: -0.5, // Pop movement
    H4: -1.2, // Sensor fault
    H5: 0.5, // Catastrophic impact
  };

  activeEvidences.forEach((evId) => {
    const ev = EVIDENCE_OPTIONS.find((e) => e.id === evId);
    if (ev) {
      logits.H1 += ev.deltaH1;
      logits.H2 += ev.deltaH2;
      logits.H5 += ev.deltaH5;
    }
  });

  // Softmax
  const maxLogit = Math.max(...Object.values(logits));
  const expH1 = Math.exp(logits.H1 - maxLogit);
  const expH2 = Math.exp(logits.H2 - maxLogit);
  const expH3 = Math.exp(logits.H3 - maxLogit);
  const expH4 = Math.exp(logits.H4 - maxLogit);
  const expH5 = Math.exp(logits.H5 - maxLogit);
  const sumExp = expH1 + expH2 + expH3 + expH4 + expH5;

  const probs = {
    H1: expH1 / sumExp,
    H2: expH2 / sumExp,
    H3: expH3 / sumExp,
    H4: expH4 / sumExp,
    H5: expH5 / sumExp,
  };

  // Shannon Entropy: H(P) = -sum(p * log2(p))
  let entropy = 0;
  Object.values(probs).forEach((p) => {
    if (p > 0.0001) {
      entropy -= p * Math.log2(p);
    }
  });

  const maxPossibleEntropy = Math.log2(5); // ~2.32 bits
  const certaintyPct = Math.max(0, Math.min(100, Math.round((1 - entropy / maxPossibleEntropy) * 100)));

  return (
    <section className="relative py-28 p-4 sm:p-8 lg:p-16 border-t border-white/5 bg-[#0C0E12]/50">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="font-mono-data text-xs text-[#E11D48] tracking-[0.25em] uppercase flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#60A5FA]" />
              <span>03 // EPISTEMIC REASONING CHAMBER</span>
            </div>
            <h2 className="font-display-calm text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight font-medium">
              Interactive Bayesian Epistemic Engine
            </h2>
            <p className="font-body-prose text-sm sm:text-base text-[#94A3B8] max-w-2xl leading-relaxed">
              Experience the collapse of information entropy. Toggle active reconnaissance observations to watch numerically stabilized Log-Sum-Exp Bayesian updating converge on ground truth.
            </p>
          </div>

          <button
            onClick={resetEvidences}
            className="self-start md:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono-data text-[#94A3B8] hover:text-white transition-all cursor-pointer border border-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Evidence State</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5): Tactical Observation Toggles */}
          <div className="lg:col-span-5 rounded-3xl bg-[#090B0E] border border-white/10 p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between font-mono-data text-xs text-[#64748B]">
              <span className="uppercase tracking-wider">OBSERVATION TOGGLES</span>
              <span className="text-[#60A5FA] font-bold">
                {activeEvidences.length} OF {EVIDENCE_OPTIONS.length} APPLIED
              </span>
            </div>

            <div className="space-y-3">
              {EVIDENCE_OPTIONS.map((item) => {
                const isActive = activeEvidences.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleEvidence(item.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isActive
                        ? "bg-white/10 border-white/30 text-white shadow-lg"
                        : "bg-white/[0.02] border-white/5 text-[#94A3B8] hover:border-white/15 hover:text-white"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        isActive
                          ? "bg-[#E11D48] border-[#E11D48] text-white"
                          : "border-white/20 bg-black/40"
                      }`}
                    >
                      {isActive && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-1">
                      <div className="font-mono-data text-xs font-bold">{item.label}</div>
                      <div className="font-body-prose text-[11px] text-[#94A3B8] leading-relaxed">
                        {item.source}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Shannon Entropy Metric Card */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 mt-4">
              <div className="flex justify-between items-center font-mono-data text-xs">
                <span className="text-[#64748B] uppercase">Shannon Uncertainty H(P)</span>
                <span className="text-white font-bold">{entropy.toFixed(2)} bits</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor:
                      entropy > 1.2
                        ? "#F59E0B"
                        : entropy > 0.6
                        ? "#60A5FA"
                        : "#10B981",
                  }}
                  animate={{ width: `${(entropy / maxPossibleEntropy) * 100}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
              </div>

              <div className="flex justify-between items-center font-mono-data text-[10px] text-[#94A3B8]">
                <span>Certainty Metric</span>
                <span className="text-emerald-400 font-bold">{certaintyPct}% Resolved</span>
              </div>
            </div>
          </div>

          {/* Right Column (7): Posterior Probability Distribution Bars */}
          <div className="lg:col-span-7 rounded-3xl bg-[#090B0E] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
              <div>
                <span className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-widest block">
                  MUTUALLY EXCLUSIVE & COLLECTIVELY EXHAUSTIVE STATES
                </span>
                <h3 className="font-display-calm text-2xl font-medium text-white">
                  Posterior Belief Vector P(H | E)
                </h3>
              </div>
              <span className="chip-neutral text-xs">Log-Sum-Exp</span>
            </div>

            {/* 5 Hypotheses Animated Bars */}
            <div className="space-y-4 font-mono-data text-xs">
              {[
                { code: "H1", name: "Telecommunication Failure", p: probs.H1, desc: "BTS towers down; physical structures intact" },
                { code: "H2", name: "Arterial Road Choke", p: probs.H2, desc: "Access passes severed by rockfall debris" },
                { code: "H3", name: "Spontaneous Evacuation", p: probs.H3, desc: "Villages assembled in open football grounds" },
                { code: "H4", name: "Sensor Telemetry Fault", p: probs.H4, desc: "Data loggers depowered; normal human activity" },
                { code: "H5", name: "Catastrophic Structural Rupture", p: probs.H5, desc: "Widespread collapse, trapped casualties in silent zone", dominant: probs.H5 > 0.5 },
              ].map((h) => {
                const percentage = Math.round(h.p * 100);
                return (
                  <div key={h.code} className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                            h.dominant
                              ? "bg-[#E11D48] text-white"
                              : "bg-white/10 text-[#94A3B8]"
                          }`}
                        >
                          {h.code}
                        </span>
                        <span className="text-white font-medium">{h.name}</span>
                      </div>
                      <span className={`font-bold ${h.dominant ? "text-[#FB7185]" : "text-[#94A3B8]"}`}>
                        {percentage}%
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          h.dominant ? "bg-[#E11D48]" : "bg-white/30"
                        }`}
                        animate={{ width: `${percentage}%` }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      />
                    </div>

                    <div className="text-[10px] text-[#64748B]">{h.desc}</div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="font-mono-data text-xs text-[#94A3B8]">
                Inspect all 8 Sector Bayesian Ledgers
              </span>
              <Link
                href="/hypotheses"
                onClick={() => TacticalAudio.playPing()}
                className="btn-action-secondary text-xs py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <span>Open Hypotheses Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
