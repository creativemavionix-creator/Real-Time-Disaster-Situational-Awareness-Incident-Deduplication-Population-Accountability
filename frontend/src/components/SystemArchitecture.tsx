"use client";

import React, { useState } from "react";
import { useViewMode } from "@/context/ViewModeContext";

export function SystemArchitecture() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAnalysis } = useViewMode();

  return (
    <section className="py-12 sm:py-16 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full">
      <div className="surface-calm p-6 sm:p-8 space-y-6">
        {/* Toggle Header */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
        >
          <div className="space-y-1">
            <div className="font-mono-data text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
              TECHNICAL SPECIFICATION // ALGORITHMIC FORMULATION
            </div>
            <h3 className="font-display-calm font-extrabold text-2xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
              Pipeline Architecture & Formula Reference
            </h3>
            <p className="font-body-prose text-xs sm:text-sm text-[#5C6270] dark:text-[#9CA3AF]">
              Mathematical scoring rules, spatial physics constants, and fixed 8-centroid gazetteer definitions.
            </p>
          </div>

          <button
            type="button"
            className="btn-action-secondary text-xs py-2 px-4 cursor-pointer self-start sm:self-auto"
          >
            {isOpen ? "COLLAPSE [-]" : "EXPAND [+]"}
          </button>
        </div>

        {(isOpen || isAnalysis) && (
          <div className="pt-6 border-t border-[#E5E4DC] dark:border-[#232733] space-y-6 font-mono-data text-xs">
            {/* Mathematical Formulas */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] uppercase tracking-wider">
                1. EXPLAINABLE RELIABILITY SCORING & STALENESS DECAY
              </h4>
              <div className="p-5 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] space-y-3">
                <div>
                  <strong className="text-[#111318] dark:text-[#F4F4F0] text-[11px]">BASE RELIABILITY FORMULA:</strong>
                  <div className="bg-[#FAF9F5] dark:bg-[#0C0E12] p-3 rounded-lg border border-[#E5E4DC] dark:border-[#232733] text-[#2563EB] dark:text-[#60A5FA] mt-1 font-mono-data text-xs font-bold">
                    BaseScore = min(1.0, (SourceTrustWeight + CoordBonus) * (1.0 + CorroborationBonus))
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#5C6270] dark:text-[#9CA3AF] text-xs">
                  <div>
                    <span className="text-[#111318] dark:text-[#F4F4F0] font-bold">SOURCE TRUST WEIGHTS:</span>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      <li>Hospital Triage: 0.95</li>
                      <li>Police Radio: 0.90</li>
                      <li>Citizen SOS: 0.70</li>
                      <li>Social Media: 0.30</li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-[#111318] dark:text-[#F4F4F0] font-bold">BONUSES & DECAY:</span>
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
              <h4 className="text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] uppercase tracking-wider">
                2. SILENT BLACKOUT SPATIAL PHYSICS FORMULA
              </h4>
              <div className="p-5 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] space-y-2 text-xs text-[#5C6270] dark:text-[#9CA3AF]">
                <div className="bg-[#FAF9F5] dark:bg-[#0C0E12] p-3 rounded-lg border border-[#E5E4DC] dark:border-[#232733] text-[#2563EB] dark:text-[#60A5FA] font-mono-data font-bold">
                  InferredRisk = (E_hazard * 40.0) + (S_slope * 30.0) + (I_road * 30.0)
                </div>
                <p className="font-body-prose text-xs text-[#5C6270] dark:text-[#9CA3AF] leading-relaxed">
                  Where Epicenter Hazard E_hazard = exp(-d_epi / 75km) relative to Barpak (28.0°N, 84.63°E), adjusted by +15% penalty if upstream transportation bridges are severed.
                </p>
              </div>
            </div>

            {/* Fixed Central Nepal Gazetteer */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] uppercase tracking-wider">
                3. FIXED 8-CENTROID CENTRAL NEPAL GAZETTEER
              </h4>
              <div className="rounded-xl border border-[#E5E4DC] dark:border-[#232733] overflow-x-auto bg-[#FAF9F5] dark:bg-[#0C0E12]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F2F0E8] dark:bg-[#13161D] border-b border-[#E5E4DC] dark:border-[#232733] text-[#111318] dark:text-[#F4F4F0] font-bold">
                      <th className="p-3">SECTOR</th>
                      <th className="p-3">LAT / LON</th>
                      <th className="p-3">ELEVATION</th>
                      <th className="p-3">TERRAIN TYPE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E4DC] dark:divide-[#232733]">
                    <tr><td className="p-3 font-bold">Gorkha (Barpak)</td><td className="p-3">28.00°N, 84.63°E</td><td className="p-3">1,900m</td><td className="p-3">Mountain Epicenter</td></tr>
                    <tr><td className="p-3 font-bold">Sindhupalchok</td><td className="p-3">27.77°N, 85.70°E</td><td className="p-3">1,450m</td><td className="p-3">High Relief Valleys</td></tr>
                    <tr><td className="p-3 font-bold">Kathmandu</td><td className="p-3">27.71°N, 85.32°E</td><td className="p-3">1,400m</td><td className="p-3">Dense Urban Basin</td></tr>
                    <tr><td className="p-3 font-bold">Bhaktapur</td><td className="p-3">27.67°N, 85.42°E</td><td className="p-3">1,401m</td><td className="p-3">Historic Masonry Core</td></tr>
                    <tr><td className="p-3 font-bold">Rasuwa</td><td className="p-3">28.13°N, 85.30°E</td><td className="p-3">2,100m</td><td className="p-3">High Himalayan Gorge</td></tr>
                    <tr><td className="p-3 font-bold">Nuwakot</td><td className="p-3">27.91°N, 85.16°E</td><td className="p-3">1,020m</td><td className="p-3">Mid-Hills Ridge</td></tr>
                    <tr><td className="p-3 font-bold">Dolakha</td><td className="p-3">27.70°N, 86.05°E</td><td className="p-3">1,650m</td><td className="p-3">Eastern Fault Branch</td></tr>
                    <tr><td className="p-3 font-bold">Sindhuli</td><td className="p-3">27.25°N, 85.92°E</td><td className="p-3">1,150m</td><td className="p-3">Outer Churia Foothills</td></tr>
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
