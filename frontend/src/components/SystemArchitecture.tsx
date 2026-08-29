"use client";

import React, { useState } from "react";
import { useViewMode } from "@/context/ViewModeContext";

export function SystemArchitecture() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAnalysis } = useViewMode();

  return (
    <section className="p-6 sm:p-10 lg:p-14 border-t border-[#EDEDE8]/10 bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto surface-card p-6 sm:p-8">
        {/* Toggle Header */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
        >
          <div>
            <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
              TECHNICAL SPECIFICATION // ALGORITHMIC FORMULATION
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#EDEDE8]">
              PIPELINE ARCHITECTURE & FORMULA REFERENCE
            </h3>
            <p className="font-body-prose text-xs text-[#EDEDE8]/70 mt-0.5">
              Mathematical scoring rules, spatial physics constants, and fixed 8-centroid gazetteer definitions.
            </p>
          </div>

          <button
            type="button"
            className="px-4 py-2 bg-[#EDEDE8]/10 hover:bg-[#EDEDE8] hover:text-[#0A0A0A] font-mono-data text-xs font-bold uppercase transition-colors border border-[#EDEDE8]/20 cursor-pointer self-start sm:self-auto"
          >
            {isOpen ? "COLLAPSE [-]" : "EXPAND [+]"}
          </button>
        </div>

        {(isOpen || isAnalysis) && (
          <div className="mt-6 pt-6 border-t border-[#EDEDE8]/10 space-y-6 font-mono-data text-xs animate-fade-in">
            {/* Mathematical Formulas */}
            <div>
              <h4 className="text-xs font-bold text-[#FFB800] uppercase mb-2">
                1. EXPLAINABLE RELIABILITY SCORING & STALENESS DECAY
              </h4>
              <div className="bg-[#EDEDE8]/3 border border-[#EDEDE8]/15 p-4 space-y-3">
                <div>
                  <strong className="text-[#EDEDE8] text-[11px]">BASE RELIABILITY FORMULA:</strong>
                  <div className="bg-[#0A0A0A] p-2 border border-[#EDEDE8]/20 text-[#FFB800] mt-1 font-mono text-[11px]">
                    BaseScore = min(1.0, (SourceTrustWeight + CoordBonus) * (1.0 + CorroborationBonus))
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#EDEDE8]/70 text-[11px]">
                  <div>
                    <span className="text-[#EDEDE8] font-bold">SOURCE TRUST WEIGHTS:</span>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      <li>Hospital Triage: 0.95</li>
                      <li>Police Radio: 0.90</li>
                      <li>Citizen SOS: 0.60</li>
                      <li>Social Media: 0.35</li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-[#EDEDE8] font-bold">BONUSES & DECAY:</span>
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
            <div>
              <h4 className="text-xs font-bold text-[#FFB800] uppercase mb-2">
                2. SILENT BLACKOUT SPATIAL PHYSICS FORMULA
              </h4>
              <div className="bg-[#EDEDE8]/3 border border-[#EDEDE8]/15 p-4 space-y-2 text-[11px] text-[#EDEDE8]/80">
                <div className="bg-[#0A0A0A] p-2 border border-[#EDEDE8]/20 text-[#FFB800] font-mono">
                  InferredRisk = (E_hazard * 40.0) + (S_slope * 30.0) + (I_road * 30.0)
                </div>
                <p className="font-body-prose text-xs text-[#EDEDE8]/70">
                  Where Epicenter Hazard E_hazard = exp(-d_epi / 75km) relative to Barpak (28.0°N, 84.63°E), adjusted by +15% penalty if upstream transportation bridges are severed.
                </p>
              </div>
            </div>

            {/* Fixed Central Nepal Gazetteer */}
            <div>
              <h4 className="text-xs font-bold text-[#FFB800] uppercase mb-2">
                3. FIXED 8-CENTROID CENTRAL NEPAL GAZETTEER
              </h4>
              <div className="border border-[#EDEDE8]/15 overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-[#EDEDE8]/5 border-b border-[#EDEDE8]/15 text-[#EDEDE8]">
                      <th className="p-2">SECTOR</th>
                      <th className="p-2">CENTROID (LAT, LON)</th>
                      <th className="p-2">KEY MUNICIPALITIES & LANDMARKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDEDE8]/10 text-[#EDEDE8]/80">
                    <tr><td className="p-2 font-bold text-[#EDEDE8]">Kathmandu</td><td className="p-2">27.7172°N, 85.3240°E</td><td className="p-2">Thamel, New Road, Kalanki, Singha Durbar, Balaju</td></tr>
                    <tr><td className="p-2 font-bold text-[#EDEDE8]">Bhaktapur</td><td className="p-2">27.6710°N, 85.4298°E</td><td className="p-2">Durbar Square, Sallaghari, Thimi, Suryabinayak</td></tr>
                    <tr><td className="p-2 font-bold text-[#EDEDE8]">Sindhupalchok</td><td className="p-2">27.9500°N, 85.7000°E</td><td className="p-2">Chautara, Melamchi, Bahrabise, Tatopani, Araniko Hwy</td></tr>
                    <tr><td className="p-2 font-bold text-[#EDEDE8]">Dolakha</td><td className="p-2">27.7500°N, 86.1000°E</td><td className="p-2">Charikot, Jiri, Tama Koshi, Singati, Bhimeshwor</td></tr>
                    <tr><td className="p-2 font-bold text-[#EDEDE8]">Nuwakot</td><td className="p-2">27.9167°N, 85.1667°E</td><td className="p-2">Bidur, Trishuli, Battar, Devighat, Kakani</td></tr>
                    <tr><td className="p-2 font-bold text-[#EDEDE8]">Gorkha</td><td className="p-2">28.0000°N, 84.6333°E</td><td className="p-2">Barpak (Epicenter), Arughat, Laprak, Manakamana</td></tr>
                    <tr><td className="p-2 font-bold text-[#EDEDE8]">Rasuwa</td><td className="p-2">28.1500°N, 85.3000°E</td><td className="p-2">Dhunche, Syabrubesi, Langtang Valley, Timure</td></tr>
                    <tr><td className="p-2 font-bold text-[#EDEDE8]">Sindhuli</td><td className="p-2">27.2500°N, 85.9500°E</td><td className="p-2">Kamalamai, Sindhulimadhi, BP Highway, Khurkot</td></tr>
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
