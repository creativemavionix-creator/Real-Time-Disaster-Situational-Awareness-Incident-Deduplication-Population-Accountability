"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // The Live GIS Map is a full-viewport interactive tactical console; suppress footer on this route
  if (pathname === "/gis-map" || pathname?.startsWith("/gis-map")) {
    return null;
  }

  return (
    <footer
      className="relative z-20 border-t select-none no-print"
      style={{
        backgroundColor: "var(--bg-base)",
        borderColor: "var(--border-subtle)",
        color: "var(--fg-secondary)",
      }}
    >
      {/* Top Banner: Doctrine Statement */}
      <div
        style={{
          borderBottom: "1px solid var(--border-faint)",
          backgroundColor: "var(--bg-void)",
          padding: "1.5rem clamp(1.5rem, 5vw, 4rem)",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span
              className="font-mono-data uppercase tracking-widest text-[11px]"
              style={{ color: "var(--fg-tertiary)" }}
            >
              OPERATIONAL DOCTRINE // HIGH-STAKES CRISIS PROTOCOL
            </span>
          </div>
          <p
            className="font-serif-editorial italic text-sm text-[#CBD5E1] m-0"
            style={{ maxWidth: "60ch" }}
          >
            &ldquo;Silence is not safety. In catastrophic terrain, absence of evidence is merely evidence of broken observation channels.&rdquo;
          </p>
        </div>
      </div>

      {/* Main Multi-Column Grid */}
      <div
        className="max-w-7xl mx-auto py-12 px-6 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10"
      >
        {/* Brand & Designation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-mono-data font-bold text-sm"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                color: "var(--fg-primary)",
              }}
            >
              Ω
            </div>
            <div>
              <div className="font-display-calm font-bold text-white text-base tracking-tight">
                PRATYAKSH-Ω
              </div>
              <div className="font-mono-data text-[10px] text-[#5C6E84] uppercase tracking-wider">
                Autonomous Disaster Reality Reconstruction
              </div>
            </div>
          </div>

          <p className="font-body-prose text-xs text-[#9AAABE] leading-relaxed max-w-sm">
            Engineered for civil protection officers, emergency dispatch commanders, and humanitarian evaluators to illuminate communication blackouts across the Central Nepal Disaster Corridor.
          </p>

          <div className="flex items-center gap-3 font-mono-data text-[11px] text-[#5C6E84] pt-2">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-white font-semibold">
              v2.4 LTS
            </span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-medium">Render Docker / Vercel Edge</span>
          </div>
        </div>

        {/* Column 2: Public Dossier */}
        <div className="space-y-3 font-mono-data text-xs">
          <div className="text-white font-bold uppercase tracking-wider text-[11px] border-b border-white/10 pb-2">
            Public Dossier
          </div>
          <ul className="space-y-2 list-none p-0 m-0">
            <li>
              <Link href="/doctrine" className="text-[#9AAABE] hover:text-white transition-colors">
                The Core Doctrine
              </Link>
            </li>
            <li>
              <Link href="/methodology" className="text-[#9AAABE] hover:text-white transition-colors">
                Six Core Capabilities
              </Link>
            </li>
            <li>
              <Link href="/disasters" className="text-[#9AAABE] hover:text-white transition-colors">
                Disaster Archetypes
              </Link>
            </li>
            <li>
              <Link href="/scenario" className="text-[#9AAABE] hover:text-white transition-colors">
                Barpak Counterfactual
              </Link>
            </li>
            <li>
              <Link href="/data-sources" className="text-[#9AAABE] hover:text-white transition-colors">
                Data Provenance Matrix
              </Link>
            </li>
            <li>
              <Link href="/glossary" className="text-[#9AAABE] hover:text-white transition-colors">
                Operational Glossary
              </Link>
            </li>
            <li>
              <Link href="/brief" className="text-[#38BDF8] hover:text-white transition-colors font-medium">
                Executive Brief (Print / PDF)
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Tactical Consoles */}
        <div className="space-y-3 font-mono-data text-xs">
          <div className="text-white font-bold uppercase tracking-wider text-[11px] border-b border-white/10 pb-2">
            Tactical Operations
          </div>
          <ul className="space-y-2 list-none p-0 m-0">
            <li>
              <Link href="/gis-map" className="text-[#9AAABE] hover:text-white transition-colors">
                Live GIS Radar Map
              </Link>
            </li>
            <li>
              <Link href="/deduplication" className="text-[#9AAABE] hover:text-white transition-colors">
                Incident Consensus Ledger
              </Link>
            </li>
            <li>
              <Link href="/hypotheses" className="text-[#9AAABE] hover:text-white transition-colors">
                Bayesian Reality Engine
              </Link>
            </li>
            <li>
              <Link href="/blackout-intel" className="text-[#9AAABE] hover:text-white transition-colors">
                Blackout Risk Intelligence
              </Link>
            </li>
            <li>
              <Link href="/population" className="text-[#9AAABE] hover:text-white transition-colors">
                Population & Census Exposure
              </Link>
            </li>
            <li>
              <Link href="/dispatch" className="text-[#9AAABE] hover:text-white transition-colors">
                Tactical Asset Dispatch
              </Link>
            </li>
            <li>
              <Link href="/sitrep" className="text-[#9AAABE] hover:text-white transition-colors">
                UN OCHA SITREP Briefing
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Ground Truth Provenance */}
        <div className="space-y-3 font-mono-data text-xs">
          <div className="text-white font-bold uppercase tracking-wider text-[11px] border-b border-white/10 pb-2">
            Sensor Calibration
          </div>
          <ul className="space-y-2 text-[#5C6E84] list-none p-0 m-0 text-[11px]">
            <li>UNITAR / UNOSAT Damage Feeds</li>
            <li>Copernicus Sentinel-1 SAR (ESA)</li>
            <li>CBS Nepal 2021 Census Demographics</li>
            <li>CrisisNLP / QCRI Humanitarian Corpus</li>
            <li>geoBoundaries Nepal ADM0-ADM3</li>
            <li className="pt-2">
              <Link href="/research-data" className="text-[#38BDF8] hover:text-white transition-colors">
                &rarr; Inspect Scientific Datasets
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Security Bar */}
      <div
        style={{
          borderTop: "1px solid var(--border-faint)",
          padding: "1rem clamp(1.5rem, 5vw, 4rem)",
          fontSize: "var(--text-2xs)",
          color: "var(--fg-tertiary)",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono-data">
          <div>
            PRATYAKSH-Ω &bull; Non-Commercial Emergency Preparedness & Civil Protection Platform
          </div>
          <div className="flex items-center gap-4">
            <span>Deterministic Bayesian Core</span>
            <span>&bull;</span>
            <span>Zero Third-Party Telemetry Egress</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
