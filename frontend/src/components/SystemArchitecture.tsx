"use client";

import React, { useState } from "react";
import { useViewMode } from "@/context/ViewModeContext";

export function SystemArchitecture() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAnalysis } = useViewMode();

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="prism-card p-6 sm:p-8 space-y-6">
        {/* Toggle Header */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
        >
          <div className="space-y-1">
            <div className="prism-badge-cyan">
              <span>📐</span>
              <span>TECHNICAL SPECIFICATION // ALGORITHMIC FORMULATION</span>
            </div>
            <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
              Pipeline Architecture & Formula Reference
            </h3>
            <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Mathematical scoring rules, spatial physics constants, and fixed 8-centroid gazetteer definitions.
            </p>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-xs font-bold uppercase transition-all border border-slate-200 dark:border-slate-700 cursor-pointer self-start sm:self-auto"
          >
            {isOpen ? "COLLAPSE [-]" : "EXPAND [+]"}
          </button>
        </div>

        {(isOpen || isAnalysis) && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6 font-mono text-xs animate-fade-in">
            {/* Mathematical Formulas */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                1. EXPLAINABLE RELIABILITY SCORING & STALENESS DECAY
              </h4>
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-3">
                <div>
                  <strong className="text-slate-800 dark:text-slate-200 text-[11px]">BASE RELIABILITY FORMULA:</strong>
                  <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-cyan-700 dark:text-cyan-300 mt-1 font-mono text-xs font-bold">
                    BaseScore = min(1.0, (SourceTrustWeight + CoordBonus) * (1.0 + CorroborationBonus))
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600 dark:text-slate-400 text-xs">
                  <div>
                    <span className="text-slate-900 dark:text-white font-bold">SOURCE TRUST WEIGHTS:</span>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      <li>Hospital Triage: 0.95</li>
                      <li>Police Radio: 0.90</li>
                      <li>Citizen SOS: 0.60</li>
                      <li>Social Media: 0.35</li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-slate-900 dark:text-white font-bold">BONUSES & DECAY:</span>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      <li>GPS Present: +0.10</li>
                      <li>Corroboration: min(0.25, 0.08 * log2(N))</li>
                      <li>Half-Life Decay: λ = 6.0 hours</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Spatial Physics Inferred Risk */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                2. SILENT BLACKOUT SPATIAL PHYSICS FORMULA
              </h4>
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-cyan-700 dark:text-cyan-300 font-mono font-bold">
                  InferredRisk = (E_hazard * 40.0) + (S_slope * 30.0) + (I_road * 30.0)
                </div>
                <p className="font-body-prose text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Where Epicenter Hazard E_hazard = exp(-d_epi / 75km) relative to Barpak (28.0°N, 84.63°E), adjusted by +15% penalty if upstream transportation bridges are severed.
                </p>
              </div>
            </div>

            {/* Fixed Central Nepal Gazetteer */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
                3. FIXED 8-CENTROID CENTRAL NEPAL GAZETTEER
              </h4>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto bg-white dark:bg-slate-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold">
                      <th className="p-3">SECTOR</th>
                      <th className="p-3">CENTROID (LAT, LON)</th>
                      <th className="p-3">KEY MUNICIPALITIES & LANDMARKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    <tr><td className="p-3 font-bold text-slate-900 dark:text-white">Kathmandu</td><td className="p-3">27.7172°N, 85.3240°E</td><td className="p-3">Thamel, New Road, Kalanki, Singha Durbar, Balaju</td></tr>
                    <tr><td className="p-3 font-bold text-slate-900 dark:text-white">Bhaktapur</td><td className="p-3">27.6710°N, 85.4298°E</td><td className="p-3">Durbar Square, Sallaghari, Thimi, Suryabinayak</td></tr>
                    <tr><td className="p-3 font-bold text-slate-900 dark:text-white">Sindhupalchok</td><td className="p-3">27.9500°N, 85.7000°E</td><td className="p-3">Chautara, Melamchi, Bahrabise, Tatopani, Araniko Hwy</td></tr>
                    <tr><td className="p-3 font-bold text-slate-900 dark:text-white">Dolakha</td><td className="p-3">27.7500°N, 86.1000°E</td><td className="p-3">Charikot, Jiri, Tama Koshi, Singati, Bhimeshwor</td></tr>
                    <tr><td className="p-3 font-bold text-slate-900 dark:text-white">Nuwakot</td><td className="p-3">27.9167°N, 85.1667°E</td><td className="p-3">Bidur, Trishuli, Battar, Devighat, Kakani</td></tr>
                    <tr><td className="p-3 font-bold text-slate-900 dark:text-white">Gorkha</td><td className="p-3">28.0000°N, 84.6333°E</td><td className="p-3">Barpak (Epicenter), Arughat, Laprak, Manakamana</td></tr>
                    <tr><td className="p-3 font-bold text-slate-900 dark:text-white">Rasuwa</td><td className="p-3">28.1500°N, 85.3000°E</td><td className="p-3">Dhunche, Syabrubesi, Langtang Valley, Timure</td></tr>
                    <tr><td className="p-3 font-bold text-slate-900 dark:text-white">Sindhuli</td><td className="p-3">27.2500°N, 85.9500°E</td><td className="p-3">Kamalamai, Sindhulimadhi, BP Highway, Khurkot</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
