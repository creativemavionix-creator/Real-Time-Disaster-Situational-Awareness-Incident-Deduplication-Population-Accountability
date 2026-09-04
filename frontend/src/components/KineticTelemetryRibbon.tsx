"use client";

import React from "react";

const TELEMETRY_ITEMS = [
  "EPICENTER: 28°13'N, 84°45'E // BARPAK RIDGE",
  "PGA: 0.48g (M7.8 SEISMIC CODA)",
  "NEGATIVE EVIDENCE GAP: Z = -5.82σ (CRITICAL)",
  "TELEMETRY DEFICIT: 100% (0 / 48 BTS TOWERS)",
  "RECON SORTIE: AUTONOMOUS VTOL UAV AIRBORNE",
  "BAYESIAN DOMINANT: H5 CATASTROPHIC COLLAPSE",
  "SHANNON ENTROPY: H(P) = 0.28 BITS (STABILIZED)",
  "CBS 2021 CENSUS: 1.57M BASELINE | DYNAMIC EXPOSURE: 2.11M CITIZENS",
  "DATA PROVENANCE: CBS 2021 CENSUS + UNOSAT ORBITAL [SIMULATION FEED]",
  "SENTINEL-1 InSAR: 1.2M SURFACE SUBSIDENCE",
  "HIGHWAY PASSABILITY: CHOKED BY SLIDE DEBRIS",
];

export function KineticTelemetryRibbon() {
  // Doubled array for seamless loop
  const items = [...TELEMETRY_ITEMS, ...TELEMETRY_ITEMS];

  return (
    <div
      className="w-full overflow-hidden select-none relative"
      style={{
        backgroundColor: "var(--bg-recessed)",
        borderTop: "1px solid var(--border-faint)",
        borderBottom: "1px solid var(--border-faint)",
        padding: "0.625rem 0",
      }}
    >
      {/* Edge fade masks */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to right, var(--bg-recessed), transparent)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to left, var(--bg-recessed), transparent)",
        }}
      />

      <div className="flex w-max animate-marquee items-center gap-8 font-mono-data" style={{ fontSize: "var(--text-xs)" }}>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 whitespace-nowrap">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span style={{ color: "var(--fg-primary)", fontWeight: 500 }}>{item}</span>
            <span style={{ color: "var(--border-default)" }}>•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
