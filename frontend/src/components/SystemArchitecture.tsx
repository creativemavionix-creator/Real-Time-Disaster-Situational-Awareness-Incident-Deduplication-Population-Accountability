"use client";

import React, { useState } from "react";

export function SystemArchitecture() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="p-6 md:p-12 border-t-rule bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto border-4 border-[#EDEDE8] p-6 bg-[#0A0A0A]">
        {/* Toggle Header */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div>
            <span className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest block mb-1">
              SPECIFICATION // ALGORITHMIC FORMULATION
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase text-[#EDEDE8]">
              PIPELINE ARCHITECTURE & GAZETTEER REFERENCE
            </h3>
          </div>
          <button className="bg-[#EDEDE8] text-[#0A0A0A] px-4 py-2 font-mono-data text-xs font-bold uppercase hover:bg-[#FFB800]">
            {isOpen ? "COLLAPSE [-]" : "EXPAND [+]"}
          </button>
        </div>

        {isOpen && (
          <div className="mt-6 pt-6 border-t-4 border-[#EDEDE8] space-y-8 font-mono-data text-xs">
            {/* Mathematical Formulas */}
            <div>
              <h4 className="text-sm font-bold text-[#FFB800] uppercase mb-3">
                1. EXPLAINABLE RELIABILITY SCORING & STALENESS DECAY
              </h4>
              <div className="bg-[#EDEDE8]/5 border-2 border-[#EDEDE8]/30 p-4 space-y-3">
                <div>
                  <strong className="text-[#EDEDE8]">BASE RELIABILITY FORMULA:</strong>
                  <div className="bg-[#0A0A0A] p-2.5 border border-[#EDEDE8]/30 text-[#EDEDE8] mt-1">
                    BaseScore = min(1.0, (SourceTrustWeight + CoordBonus) * (1.0 + CorroborationBonus))
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#EDEDE8]/80">
                  <div>
                    <span className="text-[#FFB800] font-bold">SOURCE TRUST WEIGHTS:</span>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5">
                      <li>Hospital: 0.95</li>
                      <li>Police: 0.90</li>
                      <li>Citizen: 0.60</li>
                      <li>Social Media: 0.35</li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-[#FFB800] font-bold">BONUSES:</span>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5">
                      <li>GPS Coordinate Present: +0.10</li>
                      <li>Corroboration: min(0.25, 0.08 * log2(ClusterSize))</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <strong className="text-[#EDEDE8]">EXPONENTIAL STALENESS DECAY:</strong>
                  <div className="bg-[#0A0A0A] p-2.5 border border-[#EDEDE8]/30 text-[#EDEDE8] mt-1">
                    EffectiveScore = BaseScore * exp(-ln(2) * (ElapsedHours / HalfLifeHours [6.0h]))
                  </div>
                </div>
              </div>
            </div>

            {/* Situational Status Thresholds */}
            <div>
              <h4 className="text-sm font-bold text-[#FFB800] uppercase mb-3">
                2. SITUATIONAL STATUS DECISION MATRIX
              </h4>
              <div className="border-2 border-[#EDEDE8]/30 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EDEDE8]/10 border-b-2 border-[#EDEDE8]/30 text-[#EDEDE8]">
                      <th className="p-2.5">STATUS</th>
                      <th className="p-2.5">COLOR</th>
                      <th className="p-2.5">CRITERIA / TRIGGER RULE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDEDE8]/20 text-[#EDEDE8]/90">
                    <tr>
                      <td className="p-2.5 font-bold text-[#3FB950]">VERIFIED_SAFE</td>
                      <td className="p-2.5 font-mono">#3FB950</td>
                      <td className="p-2.5">Official safe/clear inspections confirmed with Confidence ≥ 0.60 and no severe damage.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#E5484D]">VERIFIED_DAMAGED</td>
                      <td className="p-2.5 font-mono">#E5484D</td>
                      <td className="p-2.5">Corroborated damage cluster with Confidence ≥ 0.60 (structural, flood, fire, landslide, road).</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#FFB800]">UNVERIFIED</td>
                      <td className="p-2.5 font-mono">#FFB800</td>
                      <td className="p-2.5">Reports received within silence window, but overall Confidence &lt; 0.60 or uncorroborated rumors.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#E5484D]">COMM_BLACKOUT</td>
                      <td className="p-2.5 font-mono">#E5484D</td>
                      <td className="p-2.5">Silence window exceeded (Δt &gt; 3.0h since last report) or 0 total reports received.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 8 Centroids Reference */}
            <div>
              <h4 className="text-sm font-bold text-[#FFB800] uppercase mb-3">
                3. FIXED 8-LOCATION NEPAL GAZETTEER
              </h4>
              <div className="border-2 border-[#EDEDE8]/30 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EDEDE8]/10 border-b-2 border-[#EDEDE8]/30 text-[#EDEDE8]">
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">SECTOR NAME</th>
                      <th className="p-2.5">CENTROID LAT / LON</th>
                      <th className="p-2.5">LOCAL ALIASES & LANDMARKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDEDE8]/20 text-[#EDEDE8]/80">
                    <tr><td className="p-2.5 font-bold text-[#FFB800]">kathmandu</td><td className="p-2.5">Kathmandu</td><td className="p-2.5">27.7172° N, 85.3240° E</td><td className="p-2.5">KTM, Kantipur, Thamel, New Road, Bhotahiti, Kalanki, Singha Durbar</td></tr>
                    <tr><td className="p-2.5 font-bold text-[#FFB800]">bhaktapur</td><td className="p-2.5">Bhaktapur</td><td className="p-2.5">27.6710° N, 85.4298° E</td><td className="p-2.5">Bhadgaon, Durbar Square, Sallaghari, Thimi, Madhyapur</td></tr>
                    <tr><td className="p-2.5 font-bold text-[#FFB800]">sindhupalchok</td><td className="p-2.5">Sindhupalchok</td><td className="p-2.5">27.9500° N, 85.7000° E</td><td className="p-2.5">Melamchi, Bahrabise, Chautara, Helambu, Tatopani, Araniko Highway</td></tr>
                    <tr><td className="p-2.5 font-bold text-[#FFB800]">dolakha</td><td className="p-2.5">Dolakha</td><td className="p-2.5">27.7500° N, 86.1000° E</td><td className="p-2.5">Charikot, Jiri, Tama Koshi, Singati, Bhimeshwor</td></tr>
                    <tr><td className="p-2.5 font-bold text-[#FFB800]">nuwakot</td><td className="p-2.5">Nuwakot</td><td className="p-2.5">27.9167° N, 85.1667° E</td><td className="p-2.5">Bidur, Trishuli, Battar, Devighat, Kakani</td></tr>
                    <tr><td className="p-2.5 font-bold text-[#FFB800]">gorkha</td><td className="p-2.5">Gorkha</td><td className="p-2.5">28.0000° N, 84.6333° E</td><td className="p-2.5">Barpak, Arughat, Laprak, Manakamana, Palungtar</td></tr>
                    <tr><td className="p-2.5 font-bold text-[#FFB800]">rasuwa</td><td className="p-2.5">Rasuwa</td><td className="p-2.5">28.1500° N, 85.3000° E</td><td className="p-2.5">Dhunche, Syabrubesi, Langtang, Timure, Betrawati</td></tr>
                    <tr><td className="p-2.5 font-bold text-[#FFB800]">sindhuli</td><td className="p-2.5">Sindhuli</td><td className="p-2.5">27.2500° N, 85.9500° E</td><td className="p-2.5">Kamalamai, Sindhulimadhi, BP Highway, Khurkot</td></tr>
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
