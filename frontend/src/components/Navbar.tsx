"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Radio,
  FileText,
  Menu,
  X,
  ChevronRight,
  Volume2,
  VolumeX,
  Keyboard,
} from "lucide-react";
import { TacticalAudio } from "@/lib/TacticalAudio";

interface NavPillar {
  id: string;
  code: string;
  label: string;
  primaryHref: string;
  subRoutes?: {
    label: string;
    href: string;
    description: string;
  }[];
}

const NAV_PILLARS: NavPillar[] = [
  {
    id: "situation",
    code: "01",
    label: "Situation",
    primaryHref: "/",
    subRoutes: [
      { label: "Overview", href: "/", description: "Executive briefing & crisis narrative" },
      { label: "Live GIS Map", href: "/gis-map", description: "Geospatial radar & vector cartography" },
    ],
  },
  {
    id: "intelligence",
    code: "02",
    label: "Intelligence",
    primaryHref: "/hypotheses",
    subRoutes: [
      { label: "Reality Reconstruction", href: "/hypotheses", description: "PRATYAKSH-O Bayesian inference" },
      { label: "Incident Consensus", href: "/deduplication", description: "Reconciled multi-agency incident ledger" },
      { label: "Blackout Risk", href: "/blackout-intel", description: "Inferred risk in silent sectors" },
      { label: "Population Exposure", href: "/population", description: "Demographic exposure & 2021 Census palikas" },
      { label: "Scientific Datasets", href: "/research-data", description: "RESQ-SIGHT ground truth & UNOSAT evidence" },
    ],
  },
  {
    id: "response",
    code: "03",
    label: "Response",
    primaryHref: "/dispatch",
    subRoutes: [
      { label: "Tactical Dispatch", href: "/dispatch", description: "Priority rescue & resource allocation" },
    ],
  },
  {
    id: "report",
    code: "04",
    label: "Report",
    primaryHref: "/sitrep",
    subRoutes: [
      { label: "SITREP Briefing", href: "/sitrep", description: "Standardized UN OCHA situational report" },
    ],
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  useEffect(() => {
    setAudioEnabled(TacticalAudio.getEnabled());
  }, []);

  const toggleAudio = () => {
    const newState = TacticalAudio.toggle();
    setAudioEnabled(newState);
  };

  return (
    <header
      className="sticky top-0 z-50 select-none"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      {/* Operational status bar */}
      <div
        className="flex items-center justify-between"
        style={{
          backgroundColor: "var(--bg-void)",
          borderBottom: "1px solid var(--border-faint)",
          padding: "0.3rem 2rem",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span
              className="font-display-calm font-semibold tracking-wider"
              style={{ fontSize: "var(--text-xs)", color: "var(--fg-primary)", letterSpacing: "0.08em" }}
            >
              CENTRAL NEPAL CRISIS PROTOCOL
            </span>
          </div>
          <span
            className="hidden md:inline"
            style={{ color: "var(--border-default)" }}
          >
            |
          </span>
          <span
            className="hidden md:inline font-mono-data"
            style={{ fontSize: "var(--text-xs)", color: "var(--fg-tertiary)" }}
          >
            Multi-Disaster Live Simulation Active
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShortcutsModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 cursor-pointer transition-all"
            style={{
              padding: "0.2rem 0.5rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-2xs)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border-subtle)",
              color: "var(--fg-tertiary)",
              fontFamily: "var(--font-mono), monospace",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-tertiary)")}
            title="View Tactical Keyboard Shortcuts"
          >
            <Keyboard className="w-3 h-3" style={{ color: "var(--status-intel-text)" }} />
            <span>[?] KEYS</span>
          </button>

          <button
            onClick={toggleAudio}
            className="flex items-center gap-1.5 cursor-pointer transition-all"
            style={{
              padding: "0.2rem 0.5rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-2xs)",
              fontFamily: "var(--font-mono), monospace",
              background: audioEnabled ? "var(--accent-subtle)" : "rgba(255,255,255,0.04)",
              border: audioEnabled ? "1px solid var(--accent-border)" : "1px solid var(--border-subtle)",
              color: audioEnabled ? "var(--status-critical-text)" : "var(--fg-tertiary)",
              fontWeight: audioEnabled ? 700 : 400,
            }}
          >
            {audioEnabled ? (
              <Volume2 className="w-3 h-3" style={{ color: "var(--accent)" }} />
            ) : (
              <VolumeX className="w-3 h-3" />
            )}
            <span>{audioEnabled ? "AUDIO" : "MUTED"}</span>
          </button>

          <span className="hidden sm:inline" style={{ color: "var(--border-faint)" }}>|</span>
          <div
            className="hidden sm:flex items-center gap-1.5 font-mono-data"
            style={{ fontSize: "var(--text-2xs)" }}
          >
            <span style={{ color: "var(--fg-tertiary)" }}>DOCTRINE:</span>
            <strong style={{ color: "var(--status-warning-text)", fontWeight: 700 }}>
              SILENCE IS NOT SAFETY
            </strong>
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <div
        className="surface-glass-strong"
        style={{ borderBottom: "none" }}
      >
        <div
          className="max-w-7xl mx-auto flex items-center justify-between gap-6"
          style={{ padding: "0.625rem 2rem" }}
        >
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group" style={{ textDecoration: "none" }}>
            <div
              className="flex items-center justify-center font-mono-data font-bold transition-all"
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, var(--bg-raised) 0%, var(--bg-surface) 100%)",
                border: "1px solid var(--border-default)",
                color: "var(--fg-primary)",
                fontSize: "var(--text-sm)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              Ω
            </div>
            <div>
              <div
                className="font-display-calm font-bold flex items-center gap-2"
                style={{
                  fontSize: "var(--text-md)",
                  color: "var(--fg-primary)",
                  letterSpacing: "var(--ls-snug)",
                  lineHeight: 1.2,
                }}
              >
                PRATYAKSH-Ω
              </div>
              <div
                className="font-mono-data uppercase"
                style={{
                  fontSize: "var(--text-2xs)",
                  color: "var(--fg-tertiary)",
                  letterSpacing: "var(--ls-wider)",
                  marginTop: "1px",
                }}
              >
                Negative Evidence Intelligence
              </div>
            </div>
          </Link>

          {/* Desktop nav pillars */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {NAV_PILLARS.map((pillar) => {
              const isPillarActive =
                pillar.subRoutes?.some((r) => r.href === pathname) ||
                pillar.primaryHref === pathname;
              const hasMultiple = (pillar.subRoutes?.length || 0) > 1;

              return (
                <div
                  key={pillar.id}
                  className="relative"
                  onMouseEnter={() => hasMultiple && setActiveHover(pillar.id)}
                  onMouseLeave={() => setActiveHover(null)}
                >
                  <Link
                    href={pillar.primaryHref}
                    className="flex items-center gap-2 transition-all"
                    style={{
                      padding: "0.375rem 0.875rem",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--text-sm)",
                      fontFamily: "var(--font-display), sans-serif",
                      fontWeight: isPillarActive ? 700 : 500,
                      color: isPillarActive ? "var(--fg-primary)" : "var(--fg-secondary)",
                      background: isPillarActive ? "rgba(255,255,255,0.08)" : "transparent",
                      border: isPillarActive
                        ? "1px solid var(--border-default)"
                        : "1px solid transparent",
                      textDecoration: "none",
                    }}
                  >
                    <span
                      className="font-mono-data"
                      style={{
                        fontSize: "var(--text-2xs)",
                        color: isPillarActive ? "var(--accent)" : "var(--amber-500)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {pillar.code}
                    </span>
                    <span>{pillar.label}</span>
                  </Link>

                  {/* Dropdown */}
                  {hasMultiple && activeHover === pillar.id && (
                    <div className="absolute top-full left-0 pt-2 w-68 z-50" style={{ width: "17rem" }}>
                      <div
                        className="surface-glass-strong p-2 space-y-0.5"
                        style={{
                          borderRadius: "var(--radius-xl)",
                          boxShadow: "0 16px 40px rgba(0,0,0,0.7)",
                        }}
                      >
                        {pillar.subRoutes?.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setActiveHover(null)}
                              style={{
                                display: "block",
                                padding: "0.625rem 0.75rem",
                                borderRadius: "var(--radius-md)",
                                textDecoration: "none",
                                transition: "all var(--dur-fast) var(--ease-out-expo)",
                                background: isSubActive ? "rgba(255,255,255,0.08)" : "transparent",
                                border: isSubActive
                                  ? "1px solid var(--border-default)"
                                  : "1px solid transparent",
                              }}
                            >
                              <div
                                className="font-display-calm font-semibold flex items-center justify-between"
                                style={{
                                  fontSize: "var(--text-sm)",
                                  color: "var(--fg-primary)",
                                }}
                              >
                                <span>{sub.label}</span>
                                {isSubActive && (
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: "var(--accent)" }}
                                  />
                                )}
                              </div>
                              <div
                                className="font-body-prose"
                                style={{
                                  fontSize: "var(--text-2xs)",
                                  color: "var(--fg-tertiary)",
                                  marginTop: "2px",
                                  lineHeight: 1.4,
                                }}
                              >
                                {sub.description}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/gis-map"
              className="hidden sm:inline-flex btn-action-secondary"
              style={{ padding: "0.375rem 0.75rem", fontSize: "var(--text-xs)" }}
            >
              <Radio className="w-3.5 h-3.5" style={{ color: "var(--status-intel-text)" }} />
              <span>Live Map</span>
            </Link>

            <Link
              href="/sitrep"
              className="btn-action-primary flex items-center gap-1.5"
              style={{ padding: "0.375rem 0.875rem", fontSize: "var(--text-xs)" }}
            >
              <span>SITREP</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg transition-colors cursor-pointer"
              style={{
                color: "var(--fg-secondary)",
                border: "1px solid var(--border-subtle)",
              }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden space-y-4"
          style={{
            padding: "1rem 1.5rem 1.5rem",
            borderTop: "1px solid var(--border-faint)",
            backgroundColor: "var(--bg-void)",
          }}
        >
          {NAV_PILLARS.map((pillar) => (
            <div key={pillar.id} className="space-y-1.5">
              <div
                className="font-mono-data uppercase px-2"
                style={{
                  fontSize: "var(--text-2xs)",
                  color: "var(--amber-500)",
                  letterSpacing: "var(--ls-wider)",
                }}
              >
                {pillar.code} // {pillar.label}
              </div>
              {pillar.subRoutes?.map((sub) => {
                const isSubActive = pathname === sub.href;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between transition-colors"
                    style={{
                      padding: "0.5rem 0.75rem",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--text-sm)",
                      fontFamily: "var(--font-display), sans-serif",
                      fontWeight: isSubActive ? 700 : 400,
                      color: isSubActive ? "var(--fg-primary)" : "var(--fg-secondary)",
                      background: isSubActive ? "rgba(255,255,255,0.07)" : "transparent",
                      border: isSubActive ? "1px solid var(--border-subtle)" : "1px solid transparent",
                      textDecoration: "none",
                    }}
                  >
                    <span>{sub.label}</span>
                    <span
                      className="font-mono-data"
                      style={{ fontSize: "var(--text-2xs)", color: "var(--fg-tertiary)" }}
                    >
                      {sub.href}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {shortcutsModalOpen && (
        <div
          className="fixed inset-0 z-[700] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.80)" }}
          onClick={() => setShortcutsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg space-y-6"
            style={{
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-2xl)",
              padding: "2rem",
              boxShadow: "0 32px 64px rgba(0,0,0,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex justify-between items-start pb-4"
              style={{ borderBottom: "1px solid var(--border-faint)" }}
            >
              <div>
                <div className="type-eyebrow mb-2">Operational Command Shortcuts</div>
                <h3
                  className="font-display-calm font-semibold"
                  style={{ fontSize: "var(--text-2xl)", color: "var(--fg-primary)" }}
                >
                  Tactical Key Legend
                </h3>
              </div>
              <button
                onClick={() => setShortcutsModalOpen(false)}
                className="p-1 rounded-lg cursor-pointer transition-colors"
                style={{ color: "var(--fg-tertiary)" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 font-mono-data" style={{ fontSize: "var(--text-xs)" }}>
              {[
                { key: "1–5", action: "Quick-switch active disaster profile" },
                { key: "Space", action: "Step crisis simulation forward by +1.0 hour" },
                { key: "D", action: "Toggle Sector Tactical Operations Dossier drawer" },
                { key: "L", action: "Toggle geospatial vector layers menu" },
                { key: "Esc", action: "Dismiss active drawer, census modal, or popup" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between"
                  style={{
                    padding: "0.625rem 0.75rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-faint)",
                  }}
                >
                  <span style={{ color: "var(--fg-secondary)" }}>{item.action}</span>
                  <kbd
                    className="shrink-0 ml-4 font-bold"
                    style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(255,255,255,0.09)",
                      border: "1px solid var(--border-default)",
                      color: "var(--fg-primary)",
                      fontSize: "var(--text-xs)",
                    }}
                  >
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div
              className="pt-4 flex justify-between items-center font-mono-data"
              style={{
                borderTop: "1px solid var(--border-faint)",
                fontSize: "var(--text-2xs)",
                color: "var(--fg-tertiary)",
              }}
            >
              <span>Active in Live GIS Map</span>
              <button
                onClick={() => setShortcutsModalOpen(false)}
                className="btn-action-primary"
                style={{ fontSize: "var(--text-2xs)", padding: "0.375rem 0.75rem" }}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
