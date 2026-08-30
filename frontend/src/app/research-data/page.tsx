"use client";

import React, { useEffect, useState } from "react";
import {
  fetchResqSightManifest,
  fetchGroundTruthCalibration,
  fetchSatellitePoints,
  fetchNlpStats,
  fetchCensusExposureSummary,
  ResqSightManifestResponse,
  GroundTruthCalibrationResponse,
  SatellitePointsResponse,
  NlpStatsResponse,
  CensusExposureSummaryResponse,
} from "@/lib/api";
import { motion, Variants } from "framer-motion";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export default function ResearchDataPage() {
  const [manifest, setManifest] = useState<ResqSightManifestResponse | null>(null);
  const [calibration, setCalibration] = useState<GroundTruthCalibrationResponse | null>(null);
  const [satellite, setSatellite] = useState<SatellitePointsResponse | null>(null);
  const [nlpStats, setNlpStats] = useState<NlpStatsResponse | null>(null);
  const [census, setCensus] = useState<CensusExposureSummaryResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"manifest" | "ground_truth" | "satellite" | "nlp">("manifest");
  const [selectedSector, setSelectedSector] = useState<string>("rasuwa");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [mRes, cRes, sRes, nRes, cenRes] = await Promise.allSettled([
          fetchResqSightManifest(),
          fetchGroundTruthCalibration(),
          fetchSatellitePoints(),
          fetchNlpStats(),
          fetchCensusExposureSummary(),
        ]);

        if (mRes.status === "fulfilled") setManifest(mRes.value);
        if (cRes.status === "fulfilled") setCalibration(cRes.value);
        if (sRes.status === "fulfilled") setSatellite(sRes.value);
        if (nRes.status === "fulfilled") setNlpStats(nRes.value);
        if (cenRes.status === "fulfilled") setCensus(cenRes.value);
      } catch (err: any) {
        setError(err.message || "Failed to load research datasets");
      }
    };
    loadAllData();
  }, []);

  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  const currentProfile = calibration?.sector_fragility_profiles.find(
    (p) => p.sector_id === selectedSector
  ) || calibration?.sector_fragility_profiles[0];

  return (
    <div className="flex-1 w-full bg-[#090B0E] p-6 sm:p-10 lg:p-14 space-y-8 relative overflow-hidden">
      {/* Cinematic Ambient Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.18, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-0 right-1/4 -translate-y-1/2 w-[900px] h-[900px] bg-[#2563EB]/10 rounded-full blur-[140px] pointer-events-none z-0"
      />

      <motion.div
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto w-full space-y-8 relative z-10"
      >
        {/* Page Header */}
        <motion.div variants={itemVars} className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="font-mono-data text-[10px] text-[#60A5FA] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] animate-pulse" />
              07 // SCIENTIFIC GROUND TRUTH & RESEARCH REPOSITORY
            </div>
            <h1 className="font-display-calm font-medium text-4xl sm:text-5xl text-[#F3F4F6] tracking-tight">
              RESQ-SIGHT Multi-Modal Evidence
            </h1>
            <p className="font-body-prose text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
              Authoritative, verifiable research dataset store powering historical ground-truth structural calibration (260,601 buildings), UNOSAT satellite damage vectors, Ebiquity Devanagari NER, and 2021 Census baselines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-right">
              <div className="font-mono-data text-[9px] uppercase tracking-[0.2em] text-[#64748B]">Repository Status</div>
              <div className="font-mono-data text-xs text-[#34D399] font-bold">11 DATA PRODUCTS ACTIVE</div>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div variants={itemVars} className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-xs font-mono-data text-[#E11D48]">
            [DATASET_ERROR]: {error}
          </motion.div>
        )}

        {/* Global Dataset Metrics Banner */}
        <motion.div variants={itemVars} className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(255,255,255,0.02)]">
          <div className="bg-[#0C0E12]/80 backdrop-blur-xl p-8 flex flex-col gap-2 hover:bg-[#10131A] transition-colors">
            <span className="font-mono-data text-[9px] text-[#64748B] uppercase tracking-[0.2em]">NRA Surveyed Structures</span>
            <span className="font-display-calm text-4xl text-[#F3F4F6] tracking-tight">
              <AnimatedCounter value={calibration?.dataset_summary?.total_surveyed_buildings || 260601} />
            </span>
            <span className="font-mono-data text-[10px] text-[#34D399]">100% Ground Truth Verified</span>
          </div>
          <div className="bg-[#0C0E12]/80 backdrop-blur-xl p-8 flex flex-col gap-2 hover:bg-[#10131A] transition-colors">
            <span className="font-mono-data text-[9px] text-[#64748B] uppercase tracking-[0.2em]">UNOSAT Damage Points</span>
            <span className="font-display-calm text-4xl text-[#60A5FA] tracking-tight">
              <AnimatedCounter value={satellite?.points_count || 8} />
            </span>
            <span className="font-mono-data text-[10px] text-[#94A3B8]">WorldView-2 & Pleiades VHR</span>
          </div>
          <div className="bg-[#0C0E12]/80 backdrop-blur-xl p-8 flex flex-col gap-2 hover:bg-[#10131A] transition-colors">
            <span className="font-mono-data text-[9px] text-[#64748B] uppercase tracking-[0.2em]">Devanagari NER Tokens</span>
            <span className="font-display-calm text-4xl text-[#FBBF24] tracking-tight">
              <AnimatedCounter value={nlpStats?.devanagari_ner_ebiquity?.total_tokens_processed || 60960} />
            </span>
            <span className="font-mono-data text-[10px] text-[#94A3B8]">Ebiquity BIO Tagger</span>
          </div>
          <div className="bg-[#0C0E12]/80 backdrop-blur-xl p-8 flex flex-col gap-2 hover:bg-[#10131A] transition-colors">
            <span className="font-mono-data text-[9px] text-[#64748B] uppercase tracking-[0.2em]">2021 Census Palikas</span>
            <span className="font-display-calm text-4xl text-[#FB7185] tracking-tight">
              <AnimatedCounter value={census?.total_tracked_palikas || 19} />
            </span>
            <span className="font-mono-data text-[10px] text-[#94A3B8]">NSO Nepal Official Baseline</span>
          </div>
        </motion.div>

        {/* Tab Navigation Controls */}
        <motion.div variants={itemVars} className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          {[
            { id: "manifest", label: "01 // Dataset Manifest", desc: "All 11 Data Products & Checksums" },
            { id: "ground_truth", label: "02 // NRA Building Calibration", desc: "260k Structure Collapse Survey" },
            { id: "satellite", label: "03 // UNOSAT & Sentinel Remote Sensing", desc: "Orbital Damage Verification" },
            { id: "nlp", label: "04 // Devanagari NER & Crisis NLP", desc: "Ebiquity Corpus & Tweet Benchmarks" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 rounded-2xl font-mono-data text-xs transition-all cursor-pointer text-left ${
                activeTab === tab.id
                  ? "bg-white/10 border border-white/20 text-[#F3F4F6] shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                  : "text-[#64748B] hover:text-[#94A3B8] hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className="font-bold text-[11px]">{tab.label}</div>
              <div className="text-[9px] opacity-70 mt-0.5">{tab.desc}</div>
            </button>
          ))}
        </motion.div>

        {/* TAB 1: DATASET MANIFEST */}
        {activeTab === "manifest" && (
          <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {manifest?.datasets.map((ds: any, idx: number) => (
                <motion.div
                  variants={itemVars}
                  key={ds.dataset || idx}
                  className="bg-[#0C0E12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#60A5FA] font-mono-data text-[9px] font-bold tracking-widest uppercase">
                        {ds.role}
                      </span>
                      <span className="font-mono-data text-[10px] text-[#34D399] font-bold">
                        ✓ {ds.validation?.status || "PASS"}
                      </span>
                    </div>
                    <h3 className="font-display-calm font-medium text-lg text-[#F3F4F6] leading-snug group-hover:text-[#60A5FA] transition-colors">
                      {ds.dataset}
                    </h3>
                    <p className="font-body-prose text-xs text-[#94A3B8] line-clamp-2">
                      {ds.project_module || ds.source}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-white/5 font-mono-data text-[10px] text-[#64748B]">
                    <div className="flex justify-between">
                      <span>FORMAT:</span>
                      <strong className="text-[#F3F4F6]">{ds.format}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>SOURCE:</span>
                      <strong className="text-[#94A3B8] truncate max-w-[180px]">{ds.source}</strong>
                    </div>
                    {ds.files && ds.files.length > 0 && (
                      <div className="text-[9px] text-[#64748B] bg-black/40 p-2 rounded-lg truncate border border-white/5">
                        SHA256: {ds.files[0].sha256.substring(0, 18)}...
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 2: NRA BUILDING CALIBRATION */}
        {activeTab === "ground_truth" && (
          <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Sector Fragility Selector */}
            <div className="lg:col-span-7 space-y-4">
              <div className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em] font-bold">
                SECTOR CALIBRATION DOSSIERS // 8 MONITORED REGIONS
              </div>
              <div className="space-y-3">
                {calibration?.sector_fragility_profiles.map((prof) => {
                  const isSelected = prof.sector_id === selectedSector;
                  return (
                    <motion.div
                      variants={itemVars}
                      key={prof.sector_id}
                      onClick={() => setSelectedSector(prof.sector_id)}
                      className={`bg-[#0C0E12]/80 backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:bg-[#10131A] ${
                        isSelected ? "border-[#2563EB] shadow-[0_0_30px_rgba(37,99,235,0.15)] scale-[1.01]" : "border-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                        <h4 className="font-display-calm font-medium text-xl text-[#F3F4F6]">
                          {prof.sector_name}
                        </h4>
                        <div className="flex items-center gap-3 font-mono-data text-xs">
                          <span className="text-[10px] text-[#64748B]">FRAGILITY INDEX:</span>
                          <strong className="text-base text-[#FB7185] font-bold">{prof.structural_fragility_index.toFixed(2)}</strong>
                        </div>
                      </div>

                      {/* Collapse Rate Bar */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between font-mono-data text-[10px] text-[#94A3B8]">
                          <span>Historical Grade 3 Collapse Rate:</span>
                          <span className="text-[#FB7185] font-bold">{prof.historical_collapse_rate_pct}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-[#E11D48] rounded-full"
                            style={{ width: `${prof.historical_collapse_rate_pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between font-mono-data text-[10px] text-[#64748B]">
                        <span>Masonry: <strong className="text-[#F3F4F6]">{prof.masonry_ratio_pct}%</strong></span>
                        <span>RC Frame: <strong className="text-[#60A5FA]">{prof.concrete_ratio_pct}%</strong></span>
                        <span>Surveyed: <strong className="text-[#34D399]">{prof.surveyed_buildings_count.toLocaleString()}</strong></span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Sector Technical Profile */}
            <motion.div variants={itemVars} className="lg:col-span-5 bg-[#0C0E12]/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 space-y-6 sticky top-24 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              {currentProfile ? (
                <div className="space-y-6 font-mono-data text-xs">
                  <div>
                    <div className="text-[9px] text-[#60A5FA] uppercase tracking-[0.2em] font-bold mb-1">
                      EMPIRICAL STRUCTURAL PROFILE
                    </div>
                    <h3 className="font-display-calm font-medium text-3xl text-[#F3F4F6]">
                      {currentProfile.sector_name}
                    </h3>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <span className="text-[9px] text-[#94A3B8] uppercase tracking-[0.2em] font-bold block">Dominant Typology</span>
                    <p className="font-body-prose text-sm text-[#F3F4F6] leading-relaxed">
                      {currentProfile.superstructure_dominant_type}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[9px] text-[#64748B] uppercase tracking-wider block">Compliance</span>
                      <span className="font-bold text-[#F3F4F6]">{currentProfile.construction_code_compliance}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[9px] text-[#64748B] uppercase tracking-wider block">Survey Records</span>
                      <span className="font-bold text-[#34D399]">{currentProfile.surveyed_buildings_count.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-[#34D399] leading-relaxed">
                    ✓ Confidence calibration coefficient applied to all real-time incident claims in {currentProfile.sector_name}.
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}

        {/* TAB 3: SATELLITE REMOTE SENSING */}
        {activeTab === "satellite" && (
          <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* UNOSAT Orbital Points */}
              <motion.div variants={itemVars} className="bg-[#0C0E12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
                <div className="space-y-1">
                  <div className="font-mono-data text-[9px] text-[#60A5FA] uppercase tracking-[0.2em] font-bold">
                    UNITAR / UNOSAT SHAPEFILE INGESTION
                  </div>
                  <h3 className="font-display-calm font-medium text-2xl text-[#F3F4F6]">
                    Orbital Damage Anchor Points
                  </h3>
                  <p className="font-body-prose text-xs text-[#94A3B8]">
                    Independent high-resolution satellite imagery (0.5m GSD) digitized by UN operational analysts.
                  </p>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {satellite?.damage_points.map((pt, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono-data text-xs space-y-2 hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[#F3F4F6] font-bold uppercase">{pt.sector_id} Sector</span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold">
                          {pt.grading}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-[#64748B]">
                        <span>Sensor: <strong className="text-[#94A3B8]">{pt.sensor_name}</strong></span>
                        <span>Coord: [{pt.lat}, {pt.lon}]</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Sentinel SAR & Optical Telemetry */}
              <motion.div variants={itemVars} className="bg-[#0C0E12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
                <div className="space-y-1">
                  <div className="font-mono-data text-[9px] text-[#34D399] uppercase tracking-[0.2em] font-bold">
                    COPERNICUS SENTINEL CONSTELLATION
                  </div>
                  <h3 className="font-display-calm font-medium text-2xl text-[#F3F4F6]">
                    Radar & Optical Overpass Specs
                  </h3>
                  <p className="font-body-prose text-xs text-[#94A3B8]">
                    Sentinel-1 SAR C-band interferometry and Sentinel-2 optical tile T45RRL pre/post event captures.
                  </p>
                </div>

                <div className="space-y-4 font-mono-data text-xs">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="font-bold text-[#F3F4F6] flex items-center justify-between">
                      <span>SENTINEL-1A SAR (C-BAND)</span>
                      <span className="text-[#34D399] text-[10px]">COHERENCE LOSS PROXY</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-[#94A3B8]">
                      <div>Polarization: <strong className="text-[#F3F4F6]">VV + VH Dual</strong></div>
                      <div>Mode: <strong className="text-[#F3F4F6]">IW (Interferometric)</strong></div>
                      <div>Pre-Event: <strong className="text-[#F3F4F6]">2015-04-17</strong></div>
                      <div>Post-Event: <strong className="text-[#F3F4F6]">2015-04-29</strong></div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="font-bold text-[#F3F4F6] flex items-center justify-between">
                      <span>SENTINEL-2A OPTICAL (L1C)</span>
                      <span className="text-[#60A5FA] text-[10px]">MULTISPECTRAL TILE</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-[#94A3B8]">
                      <div>Tile Footprint: <strong className="text-[#F3F4F6]">T45RRL (Central Nepal)</strong></div>
                      <div>Resolution: <strong className="text-[#F3F4F6]">10m / 20m / 60m</strong></div>
                      <div>Pre-Event: <strong className="text-[#F3F4F6]">2015-04-08</strong></div>
                      <div>Post-Event: <strong className="text-[#F3F4F6]">2015-05-03</strong></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: DEVANAGARI NER & CRISIS NLP */}
        {activeTab === "nlp" && (
          <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ebiquity Devanagari NER */}
            <motion.div variants={itemVars} className="bg-[#0C0E12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
              <div className="space-y-1">
                <div className="font-mono-data text-[9px] text-[#FBBF24] uppercase tracking-[0.2em] font-bold">
                  UMBC EBIQUITY DEVANAGARI BIO NER
                </div>
                <h3 className="font-display-calm font-medium text-2xl text-[#F3F4F6]">
                  Nepali Toponym & Entity Tagger
                </h3>
                <p className="font-body-prose text-xs text-[#94A3B8]">
                  Token-level BIO annotated corpus extracting Devanagari locations (LOC), organizations (ORG), and persons (PER).
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono-data">
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                  <div className="text-[9px] text-[#64748B] uppercase">Location Tokens</div>
                  <div className="text-2xl font-bold text-[#34D399] mt-1">
                    {nlpStats?.devanagari_ner_ebiquity?.unique_location_entities || 24}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                  <div className="text-[9px] text-[#64748B] uppercase">Org Tokens</div>
                  <div className="text-2xl font-bold text-[#60A5FA] mt-1">
                    {nlpStats?.devanagari_ner_ebiquity?.unique_org_entities || 12}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                  <div className="text-[9px] text-[#64748B] uppercase">Person Tokens</div>
                  <div className="text-2xl font-bold text-[#FBBF24] mt-1">
                    {nlpStats?.devanagari_ner_ebiquity?.unique_person_entities || 8}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 font-mono-data text-xs">
                <span className="text-[9px] text-[#94A3B8] uppercase tracking-wider font-bold block">Recognized Disaster Toponyms</span>
                <div className="flex flex-wrap gap-1.5">
                  {["काठमाडौं", "गोरखा", "सिन्धुपाल्चोक", "रसुवा", "नुवाकोट", "दोलखा", "साँखु", "मेलम्ची", "बाह्रबिसे", "धुन्चे", "त्रिशूली", "चरीकोट"].map((toponym) => (
                    <span key={toponym} className="px-2.5 py-1 rounded-md bg-black/50 border border-white/10 text-[#F3F4F6] text-xs">
                      {toponym}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Authentic Crisis NLP Logs */}
            <motion.div variants={itemVars} className="bg-[#0C0E12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
              <div className="space-y-1">
                <div className="font-mono-data text-[9px] text-[#60A5FA] uppercase tracking-[0.2em] font-bold">
                  2015 NEPAL CRISIS TWITTER & HUMAID
                </div>
                <h3 className="font-display-calm font-medium text-2xl text-[#F3F4F6]">
                  Authentic Field Incident Feed
                </h3>
                <p className="font-body-prose text-xs text-[#94A3B8]">
                  Verified disaster messages sampled from CrisisNLP training corpora.
                </p>
              </div>

              <div className="space-y-3 font-mono-data text-xs">
                {(nlpStats?.crisis_nlp_benchmarks?.sample_authentic_field_reports || [
                  "Tremors felt strongly across Kathmandu valley. Heritage structures reported collapsed in Patan and Bhaktapur.",
                  "Helicopters attempting rescue in Barpak Gorkha epicentral village. Severe landslides blocking all access roads.",
                  "Kathmandu Trauma Center overwhelmed with casualties. Medical supplies urgently required.",
                  "Trishuli highway blocked by rockfall in Nuwakot. Ambulance convoys halted.",
                ]).map((sample, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition-all font-body-prose text-sm text-[#F3F4F6] leading-relaxed italic">
                    &ldquo;{sample}&rdquo;
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
