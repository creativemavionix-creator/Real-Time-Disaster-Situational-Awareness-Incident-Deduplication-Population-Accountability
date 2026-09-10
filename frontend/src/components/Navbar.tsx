"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronRight,
  LogOut,
  UserCheck,
  Radar,
  ArrowRight,
  LogIn,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { TacticalAudio } from "@/lib/TacticalAudio";
import { CinematicTourModal } from "@/components/CinematicTourModal";

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

// Strictly the 4 operational pillars requested: Situation, Intelligence, Response, Report
const OPERATIONAL_PILLARS: NavPillar[] = [
  {
    id: "situation",
    code: "01",
    label: "Situation",
    primaryHref: "/situation",
    subRoutes: [
      { label: "Overview", href: "/situation", description: "Executive briefing & crisis narrative" },
      { label: "Live GIS Map", href: "/gis-map", description: "Geospatial radar & vector cartography" },
    ],
  },
  {
    id: "intelligence",
    code: "02",
    label: "Intelligence",
    primaryHref: "/hypotheses",
    subRoutes: [
      { label: "Reality Reconstruction", href: "/hypotheses", description: "PRATYAKSH-Ω Bayesian inference" },
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
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  // Check if we are on landing page or auth page
  const isLandingPage = pathname === "/";
  const isAuthPage = pathname === "/auth";

  // The operational navbar is shown ONLY when authenticated and not on public landing/auth
  const showOperationalNav = user && !isLandingPage && !isAuthPage;

  const handleSignOut = async () => {
    try {
      TacticalAudio.playClick();
    } catch {}
    try {
      await signOut();
    } catch {}
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <header
      className="sticky top-0 z-50 select-none"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      {/* Main nav bar — NOTHING rendered above navbar */}
      <div
        className="surface-glass-strong"
        style={{ borderBottom: "none" }}
      >
        <div
          className="max-w-7xl mx-auto flex items-center justify-between gap-6"
          style={{ padding: "0.625rem 2rem" }}
        >
          {/* Brand */}
          <Link
            href="/"
            onClick={() => TacticalAudio.playClick()}
            className="flex items-center gap-3 group"
            style={{ textDecoration: "none" }}
          >
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
                {isLandingPage ? "Comprehensive System Dossier" : "Negative Evidence Intelligence"}
              </div>
            </div>
          </Link>

          {/* Operational Pillars — ONLY shown after authentication */}
          {showOperationalNav && (
            <nav className="hidden lg:flex items-center gap-1" aria-label="Operational Navigation">
              {OPERATIONAL_PILLARS.map((pillar) => {
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
                      onClick={() => TacticalAudio.playClick()}
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

                    {/* Dropdown Menu */}
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
                                onClick={() => {
                                  TacticalAudio.playClick();
                                  setActiveHover(null);
                                }}
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
          )}

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {isLandingPage ? (
              // On landing page: show Sign In / Enter Platform
              user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/situation"
                    onClick={() => TacticalAudio.playPing()}
                    className="btn-action-primary flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold"
                  >
                    <span>Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-xl text-[#9AAABE] hover:text-white hover:bg-white/5 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => TacticalAudio.playClick()}
                  className="btn-action-primary flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold shadow-lg shadow-rose-900/20"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Launch</span>
                </Link>
              )
            ) : isAuthPage ? (
              <Link
                href="/"
                className="font-mono-data text-xs text-[#9AAABE] hover:text-white transition-colors"
              >
                ← Public Dossier
              </Link>
            ) : user ? (
              // In authenticated operational dashboard
              <div className="flex items-center gap-3">
                {/* Tactical Cinematic Tour Trigger */}
                <button
                  id="navbar-tour-btn"
                  onClick={() => {
                    TacticalAudio.playClick();
                    setTourOpen(true);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-mono-data border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/60 cursor-pointer transition-all shadow-sm shadow-rose-950/40"
                  title="Launch Interactive Cinematic Tour of PRATYAKSH-Ω"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span className="font-semibold">Tour</span>
                </button>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-mono-data text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[#9AAABE] max-w-[140px] truncate" title={user.email || "Operator"}>
                    {user.displayName || user.email?.split("@")[0] || "Operator"}
                  </span>
                </div>
                <button
                  id="operational-signout-btn"
                  onClick={handleSignOut}
                  className="btn-action-secondary flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-mono-data cursor-pointer hover:text-rose-400 transition-colors"
                  title="Sign out of crisis platform"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
                {/* Mobile menu trigger */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-1.5 rounded-lg transition-colors cursor-pointer text-[#9AAABE] border border-white/10"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            ) : pathname === "/situation" ? (
              // Situation page fallback for instant access
              <div className="flex items-center gap-3">
                <button
                  id="navbar-tour-btn"
                  onClick={() => {
                    TacticalAudio.playClick();
                    setTourOpen(true);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-mono-data border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/60 cursor-pointer transition-all shadow-sm shadow-rose-950/40"
                  title="Launch Interactive Cinematic Tour of PRATYAKSH-Ω"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span className="font-semibold">Tour</span>
                </button>
                <Link
                  href="/auth"
                  className="btn-action-primary flex items-center gap-2 py-1.5 px-3.5 rounded-xl text-xs font-bold"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              </div>
            ) : (
              // Fallback if unauthenticated and on another page
              <Link
                href="/auth"
                className="btn-action-primary flex items-center gap-2 py-1.5 px-3.5 rounded-xl text-xs font-bold"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Operational Nav) */}
      {showOperationalNav && mobileMenuOpen && (
        <div
          className="lg:hidden space-y-4"
          style={{
            padding: "1rem 1.5rem 1.5rem",
            borderTop: "1px solid var(--border-faint)",
            backgroundColor: "var(--bg-void)",
          }}
        >
          {OPERATIONAL_PILLARS.map((pillar) => (
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

      {/* Cinematic Tour Interactive Modal */}
      <CinematicTourModal isOpen={tourOpen} onClose={() => setTourOpen(false)} />
    </header>
  );
}
