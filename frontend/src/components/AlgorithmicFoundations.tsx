"use client";

import React from "react";

interface AxiomCard {
  number: string;
  title: string;
  formula: string;
  description: string;
}

const AXIOMS: AxiomCard[] = [
  {
    number: "01",
    title: "BAYESIAN NEGATIVE-EVIDENCE UPDATE",
    formula: "P(D | ¬S) ∝ P(¬S | D) × P(D)",
    description: "Calculates inferred damage probability P(D) given zero-transmission signal (¬S). As blackout duration increases near epicenter, inferred damage probability approaches 99%.",
  },
  {
    number: "02",
    title: "SPATIO-TEMPORAL INFORMATION DECAY",
    formula: "w(t, d) = exp(-λ₁·t) × exp(-λ₂·d)",
    description: "Applies exponential decay weighting w(t, d) to older citizen tweets and distant radio logs so immediate local telemetry dominates the fusion matrix.",
  },
  {
    number: "03",
    title: "ENTITY RESOLUTION & DEDUPLICATION",
    formula: "Sim(e₁, e₂) = α·Levenshtein + (1-α)·Cosine(Embeddings)",
    description: "Merges duplicate citizen social posts and radio dispatches claiming the same collapse incident into a single unified incident entity.",
  },
  {
    number: "04",
    title: "DUAL PRIORITY BALANCING",
    formula: "Score = β·RescuePriority + (1-β)·VerificationPriority",
    description: "Dynamically balances Search & Rescue asset dispatches against Satellite & Recon Drone verification sorties across vocal vs silent districts.",
  },
];

export function AlgorithmicFoundations() {
  return (
    <section id="methodology" className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="prism-card p-6 sm:p-10 space-y-8">
        {/* Section Header */}
        <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="prism-badge-cyan">
            <span>∑</span>
            <span>MATHEMATICAL METHODOLOGY & CORE AXIOMS</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Algorithmic Foundations of Reality Reconstruction
          </h2>
          <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            The mathematical principles governing Project PRISM's evidence fusion and negative-evidence inference engines.
          </p>
        </div>

        {/* 4 Formula Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {AXIOMS.map((axiom, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="font-mono text-[11px] font-bold text-cyan-700 dark:text-cyan-400 tracking-wider">
                  {axiom.number} {axiom.title}
                </div>

                {/* Formula Display Box */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-cyan-300 shadow-xs">
                  {axiom.formula}
                </div>
              </div>

              <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {axiom.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
