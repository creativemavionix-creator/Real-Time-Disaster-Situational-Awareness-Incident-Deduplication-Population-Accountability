"use client";

import React from "react";
import Link from "next/link";
import {
  Database,
  Globe2,
  ShieldCheck,
  Building,
  FileCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { TacticalAudio } from "@/lib/TacticalAudio";

interface DataSourceItem {
  name: string;
  publisher: string;
  badge: string;
  badgeColor: string;
  whatItIs: string;
  whyCredible: string;
  systemContribution: string;
  localPath: string;
}

const DATA_SOURCES: DataSourceItem[] = [
  {
    name: "UNOSAT Satellite Damage Assessment",
    publisher: "United Nations Satellite Centre (UNITAR / UNOSAT)",
    badge: "GLOBAL GOLD STANDARD",
    badgeColor: "#38BDF8",
    whatItIs:
      "A comprehensive geospatial dataset of over 1,000 individual structural damage points identified through very high-resolution optical satellite imagery following the 2015 Nepal earthquake.",
    whyCredible:
      "UNOSAT is the United Nations mandate for operational satellite analysis. Its post-disaster assessments are the definitive evidence standard used by UN OCHA, the Red Cross, and sovereign crisis ministries worldwide.",
    systemContribution:
      "Provides verified physical ground truth. When incoming citizen reports claim a school or bridge has collapsed, PRATYAKSH-Ω cross-references the claim against UNOSAT satellite coordinates to confirm reality and filter out panic-induced rumors.",
    localPath: "RESQ_SIGHT_DATA/02_UNOSAT/",
  },
  {
    name: "Copernicus Sentinel-1 SAR Radar",
    publisher: "European Space Agency (ESA)",
    badge: "ALL-WEATHER RADAR",
    badgeColor: "#8B5CF6",
    whatItIs:
      "Synthetic Aperture Radar (SAR) orbital passes capturing interferometric surface deformation, ground displacement fringes, and major landslide runouts.",
    whyCredible:
      "The Copernicus programme is Europe's flagship Earth Observation mission. Unlike optical cameras, SAR radar waves pierce through monsoon clouds, dense smoke, and nighttime darkness to measure millimeter-scale crustal movements.",
    systemContribution:
      "Validates whether ground displacement or slope failure actually occurred in silent valleys when thick mountain clouds block standard satellites and aerial cameras.",
    localPath: "RESQ_SIGHT_DATA/07_SATELLITE/",
  },
  {
    name: "National Population & Housing Census 2021",
    publisher: "Central Bureau of Statistics (CBS), Government of Nepal",
    badge: "SOVEREIGN CENSUS",
    badgeColor: "#10B981",
    whatItIs:
      "The official sovereign census enumeration of Nepal, detailing municipality-level (palika) population counts, household distributions, age structures, and building construction materials.",
    whyCredible:
      "The official baseline demographic record compiled by Nepal’s National Statistics Office, representing nationwide door-to-door enumeration.",
    systemContribution:
      "Supplies the critical denominator for human vulnerability. The system knows exactly how many children and elderly live in each palika, and calculates structural collapse risk based on the proportion of stone-and-mud masonry versus reinforced concrete.",
    localPath: "RESQ_SIGHT_DATA/06_EXPOSURE/",
  },
  {
    name: "CrisisNLP & QCRI Crisis Corpus",
    publisher: "Qatar Computing Research Institute (QCRI)",
    badge: "HUMANITARIAN NLP",
    badgeColor: "#F59E0B",
    whatItIs:
      "A curated corpus of thousands of real crisis messages, humanitarian tweets, and emergency calls logged during major disasters, including the 2015 Nepal Earthquake.",
    whyCredible:
      "Widely published in peer-reviewed computational linguistics literature and utilized by international humanitarian agencies to benchmark crisis communication algorithms.",
    systemContribution:
      "Trains our deduplication and intent extraction engine to distinguish urgent life-safety pleas ('trapped under rubble') from secondary logistical remarks ('water distributed at stadium').",
    localPath: "RESQ_SIGHT_DATA/03_CRISIS_NLP/",
  },
  {
    name: "Localized Devanagari Disaster Lexicon",
    publisher: "Nepali Crisis Entity Recognition Group",
    badge: "LOCALIZED NER",
    badgeColor: "#E11D48",
    whatItIs:
      "A specialized bilingual terminology database containing native Nepali and Romanized terms for geographical landmarks, injury descriptions, and casualty counts.",
    whyCredible:
      "Curated in collaboration with local responders to ensure regional vernacular (such as 'पहिरो' for landslide and 'भत्कियो' for collapse) are accurately interpreted.",
    systemContribution:
      "Prevents misinterpretation of citizen dispatches by ensuring reports in Devanagari script are understood directly, rather than relying on flawed automated translation.",
    localPath: "RESQ_SIGHT_DATA/04_NEPALI_NLP/",
  },
  {
    name: "geoBoundaries Administrative Gazetteers",
    publisher: "Survey Department of Nepal & geoBoundaries",
    badge: "OFFICIAL BOUNDARIES",
    badgeColor: "#06B6D4",
    whatItIs:
      "Open-license geographic vector boundaries defining Nepal's provincial (ADM1), district (ADM2), and municipal (ADM3) administrative jurisdictions.",
    whyCredible:
      "Standardized boundaries maintained by the William & Mary geoBoundaries team and aligned with Nepal's constitutional federal restructuring.",
    systemContribution:
      "Ensures that every GPS coordinate, incident cluster, and dispatch ticket maps to the exact local palika government responsible for field response.",
    localPath: "RESQ_SIGHT_DATA/05_GEOSPATIAL/",
  },
];

export default function DataSourcesPage() {
  return (
    <div
      className="w-full min-h-screen relative"
      style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-primary)" }}
    >
      {/* Header Banner */}
      <section
        className="relative pt-20 pb-16 px-6 sm:px-12 lg:px-20 border-b overflow-hidden"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-mono-data text-xs uppercase tracking-widest text-[#10B981] font-bold">
              PUBLIC TRUST &bull; DATA PROVENANCE MATRIX
            </span>
          </div>

          <h1 className="font-display-calm font-extrabold text-4xl sm:text-6xl text-white tracking-tight">
            Authentic Humanitarian Data Sources
          </h1>

          <p className="font-body-prose text-base sm:text-lg text-[#9AAABE] max-w-3xl leading-relaxed">
            PRATYAKSH-Ω is not an empty theoretical model. Every inference, population figure, and damage estimate is anchored in authoritative datasets published by the United Nations, the European Space Agency, and the Government of Nepal.
          </p>
        </div>
      </section>

      {/* Main Data Sources Grid */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {DATA_SOURCES.map((ds, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#111620] border border-white/10 flex flex-col justify-between space-y-6 shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono-data text-[10px]">
                  <span
                    className="font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${ds.badgeColor}15`,
                      color: ds.badgeColor,
                      border: `1px solid ${ds.badgeColor}30`,
                    }}
                  >
                    {ds.badge}
                  </span>
                  <span className="text-[#5C6E84]">DATASET 0{idx + 1}</span>
                </div>

                <div>
                  <h3 className="font-display-calm text-xl font-bold text-white leading-snug">
                    {ds.name}
                  </h3>
                  <div className="font-mono-data text-xs text-[#38BDF8] mt-1">
                    {ds.publisher}
                  </div>
                </div>

                <div className="space-y-3 font-body-prose text-xs text-[#CBD5E1] leading-relaxed pt-2">
                  <div>
                    <strong className="text-white block font-mono-data text-[11px] uppercase tracking-wider mb-1">
                      What It Is:
                    </strong>
                    <p className="text-[#9AAABE] m-0">{ds.whatItIs}</p>
                  </div>

                  <div>
                    <strong className="text-white block font-mono-data text-[11px] uppercase tracking-wider mb-1">
                      Why It&apos;s Credible:
                    </strong>
                    <p className="text-[#9AAABE] m-0">{ds.whyCredible}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <strong className="text-emerald-400 block font-mono-data text-[11px] uppercase tracking-wider mb-1">
                      How It Strengthens PRATYAKSH-Ω:
                    </strong>
                    <p className="text-white m-0">{ds.systemContribution}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between font-mono-data text-[10px] text-[#5C6E84]">
                <span>Repository Path:</span>
                <span className="text-[#9AAABE] font-semibold">{ds.localPath}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Statement */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#161C28] border border-white/10 text-center space-y-6">
          <div className="font-mono-data text-xs text-emerald-400 font-bold uppercase tracking-widest">
            HUMANITARIAN ETHICS & DATA SOVEREIGNTY
          </div>
          <h3 className="font-display-calm text-2xl sm:text-3xl font-bold text-white max-w-xl mx-auto leading-snug">
            Built on Real Evidence, Respecting Privacy
          </h3>
          <p className="font-body-prose text-sm text-[#9AAABE] max-w-xl mx-auto leading-relaxed">
            All citizen reports are processed on isolated, privacy-compliant infrastructure. No personal phone numbers or identifying biometric data are ever shared with third-party advertisers or commercial entities.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/research-data"
              onClick={() => TacticalAudio.playClick()}
              className="btn-action-primary text-xs py-3 px-6 rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <span>Inspect Scientific Datasets Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/glossary"
              onClick={() => TacticalAudio.playClick()}
              className="btn-action-secondary text-xs py-3 px-6 rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Operational Glossary</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
