"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { TacticalAudio } from "@/lib/TacticalAudio";

interface GlossaryTerm {
  term: string;
  category: "DOCTRINE" | "TELEMETRY" | "PHYSICS" | "OPERATIONS";
  shortDefinition: string;
  plainEnglishExplanation: string;
  whereItAppears: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "Silence Risk Index",
    category: "DOCTRINE",
    shortDefinition: "A numerical score (0 to 10) rating how dangerously isolated and damaged a silent sector is.",
    plainEnglishExplanation:
      "When strong shaking or flooding hits an area, we expect many calls for help. If an area experiences high hazard intensity but generates zero calls, its Silence Risk Index spikes to maximum (e.g., 9.4 / 10). It flags that absence of calls is due to collapsed towers rather than safety.",
    whereItAppears: "Homepage KPI, Blackout Intel, GIS Map Sector Dossiers.",
  },
  {
    term: "Negative Evidence",
    category: "DOCTRINE",
    shortDefinition: "Treating the absence of an expected signal as an authoritative piece of information.",
    plainEnglishExplanation:
      "If a dog usually barks when an intruder enters, the dog's silence is meaningful. In PRATYAKSH-Ω, if a community of 14,000 residents normally makes 50 phone calls an hour, the sudden drop to zero calls during an earthquake is authoritative proof that cellular towers and roads were crushed.",
    whereItAppears: "The Core Doctrine, Overview Briefing, Scientific Papers.",
  },
  {
    term: "Shannon Uncertainty (Entropy)",
    category: "TELEMETRY",
    shortDefinition: "A mathematical measurement of how much confusion or doubt the system has about what is happening.",
    plainEnglishExplanation:
      "In simple terms, it measures our level of ignorance. High entropy (e.g. 2.3 bits) means we are completely guessing between competing possibilities. Low entropy (e.g. 0.2 bits) means incoming drone or satellite proof has eliminated doubt, making us confident in the ground truth.",
    whereItAppears: "Bayesian Epistemic Chamber, Hypotheses Page.",
  },
  {
    term: "Bayesian Hypothesis",
    category: "TELEMETRY",
    shortDefinition: "One of five competing explanations for why a disaster sector has stopped communicating.",
    plainEnglishExplanation:
      "When a mountain valley goes silent, there are five possibilities: (H1) phone towers failed but homes are standing, (H2) access roads were buried, (H3) people evacuated early to open fields, (H4) sensors broke, or (H5) catastrophic structural collapse. We calculate the probability of each possibility.",
    whereItAppears: "Hypotheses Matrix, Reality Reconstruction.",
  },
  {
    term: "Modified Mercalli Intensity (MMI)",
    category: "PHYSICS",
    shortDefinition: "A 1-to-10 Roman numeral scale measuring the perceived strength of earthquake shaking at a specific location.",
    plainEnglishExplanation:
      "Unlike Richter magnitude which measures total energy at the underground fault, MMI measures how violently the ground actually shook at your feet. MMI VI causes minor cracks, while MMI IX causes violent structural collapse in brick and stone homes.",
    whereItAppears: "GIS Radar Map, Multi-Hazard Physics Showcase.",
  },
  {
    term: "Blackout Window",
    category: "TELEMETRY",
    shortDefinition: "The elapsed time since a geographic area lost all power, internet, and phone connectivity.",
    plainEnglishExplanation:
      "Tracks how many hours an isolated community has been trapped in the dark (e.g., 'T+3.5h in total blackout'). Longer blackout windows correlate with expiring battery backups and deteriorating survival chances for trapped victims.",
    whereItAppears: "Blackout Intel Dashboard, Executive SITREP.",
  },
  {
    term: "Forward Reconnaissance Sortie",
    category: "OPERATIONS",
    shortDefinition: "A targeted mission dispatching a drone, satellite, or scout patrol to verify ground conditions.",
    plainEnglishExplanation:
      "When the system is uncertain about a silent district, it recommends launching a forward sortie (such as an autonomous VTOL camera drone or tasking an ESA radar satellite pass) specifically aimed at answering the biggest unanswered question.",
    whereItAppears: "Tactical Dispatch, Bayesian Verification Ledger.",
  },
  {
    term: "Golden 72 Hours",
    category: "OPERATIONS",
    shortDefinition: "The critical 3-day survival window during which trapped disaster victims can still be saved alive.",
    plainEnglishExplanation:
      "Medical data from global earthquakes proves that the vast majority of survivable trapped victims perish from dehydration, suffocation, or internal bleeding if not rescued within 72 hours. PRATYAKSH-Ω is engineered to eliminate dispatch delays so rescue starts on Day 1, not Day 3.",
    whereItAppears: "Barpak Counterfactual, Executive SITREP Brief.",
  },
  {
    term: "Diurnal Baseline",
    category: "TELEMETRY",
    shortDefinition: "The normal, hour-by-hour pattern of human communication in a community during peaceful times.",
    plainEnglishExplanation:
      "People make fewer phone calls at 3:00 AM than at 1:00 PM. PRATYAKSH-Ω models these daily and weekly biological cycles so it knows exactly how much activity is normal before measuring any post-disaster deficit.",
    whereItAppears: "Mathematical Foundations, Negative Evidence Engine.",
  },
  {
    term: "Palika (Municipality)",
    category: "OPERATIONS",
    shortDefinition: "The local municipal government unit in Nepal (Nagarpalika or Gaunpalika).",
    plainEnglishExplanation:
      "Under Nepal’s federal constitution, disaster first-responders and local governance operate at the palika level. PRATYAKSH-Ω organizes population demographics and dispatch tickets by palika so aid reaches responsible local mayors and ward chairs.",
    whereItAppears: "Population Accountability, Census Ledger, GIS Map.",
  },
  {
    term: "DBSCAN Semantic Clustering",
    category: "TELEMETRY",
    shortDefinition: "An AI algorithm that groups related emergency text messages based on their geographical and contextual meaning.",
    plainEnglishExplanation:
      "Groups hundreds of scattered tweets, SMS messages, and radio calls that refer to the same incident into a single coherent incident cluster, preventing emergency dispatch queues from being swamped with duplicates.",
    whereItAppears: "Incident Consensus Ledger, Deduplication.",
  },
  {
    term: "UNOSAT Damage Scale",
    category: "PHYSICS",
    shortDefinition: "United Nations satellite standard classifying building destruction from minor damage to complete rubble.",
    plainEnglishExplanation:
      "Used by satellite analysts to classify satellite imagery into: Completely Destroyed (Level 3), Severe Structural Damage (Level 2), Moderate Damage (Level 1), or No Visible Damage (Level 0).",
    whereItAppears: "Data Sources, Scientific Research Datasets.",
  },
];

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((item) => {
      const matchesSearch =
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortDefinition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.plainEnglishExplanation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "ALL" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div
      className="w-full min-h-screen relative"
      style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-primary)" }}
    >
      {/* Header */}
      <section
        className="relative pt-20 pb-16 px-6 sm:px-12 lg:px-20 border-b overflow-hidden"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
            <span className="font-mono-data text-xs uppercase tracking-widest text-[#8B5CF6] font-bold">
              STAKEHOLDER REFERENCE &bull; OPERATIONAL GLOSSARY
            </span>
          </div>

          <h1 className="font-display-calm font-extrabold text-4xl sm:text-6xl text-white tracking-tight">
            Terminology & Operational Concepts
          </h1>

          <p className="font-body-prose text-base sm:text-lg text-[#9AAABE] max-w-3xl leading-relaxed">
            Short, plain-language definitions for key terms encountered across PRATYAKSH-Ω. Designed for hackathon judges, civil defense evaluators, and humanitarian officers.
          </p>

          {/* Search & Category Filter Bar */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5C6E84] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search term or concept (e.g. Entropy, MMI, Silence, Sortie)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111620] border border-white/10 text-white placeholder:text-[#5C6E84] text-xs font-mono-data focus:outline-none focus:border-[#38BDF8] transition-colors"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 font-mono-data text-[11px] overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "DOCTRINE", "TELEMETRY", "PHYSICS", "OPERATIONS"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    TacticalAudio.playClick();
                  }}
                  className={`px-3 py-2 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-white/15 border-white/30 text-white font-bold"
                      : "bg-white/[0.02] border-white/5 text-[#5C6E84] hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Glossary Terms List */}
      <section className="py-16 px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto space-y-6">
        <div className="font-mono-data text-xs text-[#5C6E84] flex items-center justify-between pb-2 border-b border-white/5">
          <span>SHOWING {filteredTerms.length} OF {GLOSSARY_TERMS.length} TERMS</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[#38BDF8] hover:underline cursor-pointer"
            >
              Clear Search Filter
            </button>
          )}
        </div>

        <div className="space-y-4">
          {filteredTerms.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#111620] border border-white/10 space-y-3 transition-all hover:border-white/20"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-display-calm text-xl font-bold text-white tracking-tight">
                    {item.term}
                  </h2>
                  <span className="font-mono-data text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-[#9AAABE] border border-white/10 uppercase">
                    {item.category}
                  </span>
                </div>
                <div className="font-mono-data text-[10px] text-[#5C6E84]">
                  APPEARS IN: <span className="text-[#CBD5E1]">{item.whereItAppears}</span>
                </div>
              </div>

              {/* Short definition */}
              <div className="font-mono-data text-xs text-[#38BDF8] font-medium">
                {item.shortDefinition}
              </div>

              {/* Plain English explanation */}
              <p className="font-body-prose text-xs sm:text-sm text-[#CBD5E1] leading-relaxed m-0">
                {item.plainEnglishExplanation}
              </p>
            </div>
          ))}

          {filteredTerms.length === 0 && (
            <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-[#5C6E84] mx-auto" />
              <div className="font-display-calm text-lg font-bold text-white">No matching terms found</div>
              <p className="font-body-prose text-xs text-[#5C6E84] max-w-sm mx-auto">
                Try searching for a different concept like &ldquo;silence&rdquo;, &ldquo;entropy&rdquo;, or &ldquo;blackout&rdquo;.
              </p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="pt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-data text-xs">
          <span className="text-[#5C6E84]">Need a concise 1-page overview?</span>
          <Link
            href="/brief"
            onClick={() => TacticalAudio.playClick()}
            className="btn-action-primary flex items-center gap-2 py-2 px-4 rounded-xl cursor-pointer"
          >
            <span>View Printable Executive Brief</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
