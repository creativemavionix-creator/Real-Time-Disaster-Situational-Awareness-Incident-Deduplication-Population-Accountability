"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchSectorHypotheses,
  fetchSectorCounterfactuals,
  fetchSectorBaselineComparison,
  fetchNegativeEvidenceOverview,
  fetchRankedVerificationObservations,
  fetchSectorVerificationActions,
  reviewVerificationAction,
  executeAndFeedReality,
  fetchAuditTrail,
  SectorHypothesesResponse,
  SectorCounterfactualResponse,
  SectorBaselineComparison,
  NegativeEvidenceOverviewResponse,
  RankedObservationsResponse,
  VerificationActionItem,
  AuditTrailResponse,
  HypothesisTraceItem,
} from "@/lib/api";
import {
  Radio,
  ShieldAlert,
  Activity,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  UserCheck,
  Send,
  Eye,
  FileText,
  AlertTriangle,
  Scale,
  BrainCircuit,
  Zap,
  Globe,
  MapPin,
  Plane,
  Radar,
  FastForward,
  Check,
} from "lucide-react";

const SECTOR_OPTIONS = [
  { id: "gorkha", name: "Gorkha (Epicenter)" },
  { id: "sindhupalchok", name: "Sindhupalchok" },
  { id: "rasuwa", name: "Rasuwa" },
  { id: "kathmandu", name: "Kathmandu Valley" },
  { id: "bhaktapur", name: "Bhaktapur" },
  { id: "nuwakot", name: "Nuwakot" },
  { id: "dolakha", name: "Dolakha" },
  { id: "sindhuli", name: "Sindhuli" },
];

export default function HypothesesPage() {
  const [selectedSector, setSelectedSector] = useState("gorkha");
  const [activeTab, setActiveTab] = useState<"hypotheses" | "baseline" | "counterfactual" | "verification">("hypotheses");

  // Live Data States
  const [hypothesesData, setHypothesesData] = useState<SectorHypothesesResponse | null>(null);
  const [counterfactualData, setCounterfactualData] = useState<SectorCounterfactualResponse | null>(null);
  const [baselineData, setBaselineData] = useState<SectorBaselineComparison | null>(null);
  const [negativeOverview, setNegativeOverview] = useState<NegativeEvidenceOverviewResponse | null>(null);
  const [rankedActions, setRankedActions] = useState<RankedObservationsResponse | null>(null);
  const [sectorActions, setSectorActions] = useState<VerificationActionItem[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrailResponse | null>(null);

  // Option 1: Verification Scope Mode ("sector" | "theater")
  const [verificationScope, setVerificationScope] = useState<"sector" | "theater">("sector");

  // Role Governance Simulation State
  const [activeRole, setActiveRole] = useState<"Officer" | "Analyst" | "Auditor" | "Viewer">("Officer");
  const [reviewNote, setReviewNote] = useState("High uncertainty entropy justifies urgent forward verification.");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackNotification, setFeedbackNotification] = useState<string | null>(null);

  // Option 4: Closed-Loop Simulation State
  const [activeSortie, setActiveSortie] = useState<{
    action: VerificationActionItem;
    secondsRemaining: number;
    totalSeconds: number;
    stage: "DISPATCHED" | "INGESTING" | "RESOLVED";
    liveTelemetry?: string;
    entropyDelta?: number;
  } | null>(null);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadAllData = async () => {
    try {
      const [hyp, cf, bl, neg, vrf, secVrf, aud] = await Promise.allSettled([
        fetchSectorHypotheses(selectedSector),
        fetchSectorCounterfactuals(selectedSector),
        fetchSectorBaselineComparison(selectedSector),
        fetchNegativeEvidenceOverview(),
        fetchRankedVerificationObservations(),
        fetchSectorVerificationActions(selectedSector),
        fetchAuditTrail(),
      ]);

      if (hyp.status === "fulfilled") setHypothesesData(hyp.value);
      if (cf.status === "fulfilled") setCounterfactualData(cf.value);
      if (bl.status === "fulfilled") setBaselineData(bl.value);
      if (neg.status === "fulfilled") setNegativeOverview(neg.value);
      if (vrf.status === "fulfilled") setRankedActions(vrf.value);
      if (secVrf.status === "fulfilled") setSectorActions(secVrf.value);
      if (aud.status === "fulfilled") setAuditTrail(aud.value);
    } catch (err) {
      console.error("Failed to load PRATYAKSH-Ω intelligence:", err);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
      // Pause background polling while sortie is actively in flight to avoid network contention
      if (!activeSortie || activeSortie.stage === "RESOLVED") {
        loadAllData();
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [selectedSector, activeSortie?.stage]);

  // Option 4: Closed-Loop Execution Timer
  useEffect(() => {
    if (!activeSortie || activeSortie.stage !== "DISPATCHED") return;

    countdownTimerRef.current = setInterval(() => {
      setActiveSortie((prev) => {
        if (!prev) return null;
        if (prev.secondsRemaining <= 1) {
          clearInterval(countdownTimerRef.current as NodeJS.Timeout);
          finishSortieExecution(prev.action);
          return { ...prev, secondsRemaining: 0, stage: "INGESTING" };
        }
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [activeSortie?.stage]);

  const finishSortieExecution = async (rec: VerificationActionItem) => {
    try {
      let telemetryReport = `Forward ${rec.action_type.toUpperCase()} verified ground conditions in ${rec.sector_name}. Ground truth confirmed infrastructure severance with population clusters isolated.`;
      if (rec.action_type === "drone_uav_recon") {
        telemetryReport = `VTOL UAV Sensor Stream: High-res infrared and optical imagery confirmed 2 major bridge collapses along main arterial corridor in ${rec.sector_name}. Multiple stranded vehicles confirmed at GPS coordinates. Zero functional cellular BTS towers.`;
      } else if (rec.action_type === "mobile_comms_cow") {
        telemetryReport = `Cell-on-Wheels (COW) Mobile Tower deployed. 417 emergency subscriber handshakes established. Distress SMS traffic confirms local survivor camp without casualties.`;
      } else if (rec.action_type === "satellite_sar_tasking") {
        telemetryReport = `Sentinel-1 C-band SAR interferometric pass ingested. Coherence loss = 0.91 confirms widespread hillside slope collapse blocking evacuation access.`;
      }

      let entropyDelta = 0.85;
      let statusMsg = "Reconnaissance telemetry ingested into PRATYAKSH-Ω engine";

      try {
        const feedRes = await executeAndFeedReality({
          recommendation_id: rec.recommendation_id,
          sector_id: rec.sector_id,
          observed_finding: telemetryReport,
          damage_confirmed: true,
          evidence_direction: "positive",
          reliability: 0.96,
        });
        if (feedRes.entropy_reduction) entropyDelta = feedRes.entropy_reduction;
        if (feedRes.message) statusMsg = feedRes.message;
      } catch (feedErr) {
        console.warn("Backend feedback loop offline or degraded, simulating local Bayesian entropy reduction:", feedErr);
      }

      setActiveSortie({
        action: rec,
        secondsRemaining: 0,
        totalSeconds: 15,
        stage: "RESOLVED",
        liveTelemetry: telemetryReport,
        entropyDelta: entropyDelta,
      });

      setFeedbackNotification(
        `✅ Sortie Complete for ${rec.sector_name}! ${statusMsg} (Entropy reduced by -${entropyDelta.toFixed(2)} bits)`
      );

      await loadAllData();
    } catch (err: any) {
      setFeedbackNotification(`❌ Telemetry Ingestion Notice: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartSortie = async (rec: VerificationActionItem) => {
    setIsProcessing(true);
    setFeedbackNotification(null);
    try {
      try {
        const reviewRes = await reviewVerificationAction({
          recommendation_id: rec.recommendation_id,
          decision: "APPROVED",
          reviewer_role: activeRole,
          reviewer_name: activeRole === "Officer" ? "Col. S. Sharma (NEOC Commander)" : "Duty Analyst",
          justification: reviewNote || "Operational sorties dispatched under active verification protocol.",
        });

        if (reviewRes.status === "FORBIDDEN") {
          setFeedbackNotification(`❌ Permission Denied: ${reviewRes.message}`);
          setIsProcessing(false);
          return;
        }
      } catch (reviewErr: any) {
        console.warn("Backend review recording warning, proceeding with simulated sortie dispatch:", reviewErr);
      }

      setActiveSortie({
        action: rec,
        secondsRemaining: 12,
        totalSeconds: 12,
        stage: "DISPATCHED",
      });

      setFeedbackNotification(
        `🚀 Sortie Dispatched: ${rec.action_title} is airborne. Streaming live reconnaissance telemetry...`
      );
    } catch (err: any) {
      setFeedbackNotification(`❌ Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lenis = (window as unknown as { __lenis?: { resize: () => void } }).__lenis;
      if (lenis) {
        lenis.resize();
        const t1 = setTimeout(() => lenis.resize(), 50);
        const t2 = setTimeout(() => lenis.resize(), 200);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    }
  }, [activeTab, verificationScope, selectedSector, counterfactualData, rankedActions, auditTrail, activeSortie]);

  const activeSectorSilence = negativeOverview?.silence_windows.find(
    (w) => w.sector_id.toLowerCase() === selectedSector.toLowerCase()
  );

  const pendingSectorActions = sectorActions.filter(
    (a) => a.status === "PENDING_REVIEW" || a.status === "MODIFIED"
  );
  const sectorTopAction = pendingSectorActions[0] || sectorActions[0] || rankedActions?.best_next_observation;
  const theaterTopAction = rankedActions?.best_next_observation;
  const heroObservation = verificationScope === "sector" ? sectorTopAction : theaterTopAction;

  return (
    <div className="flex-1 w-full bg-[#090B0E] text-[#F3F4F6] p-4 sm:p-8 pb-36 sm:pb-48 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-4 h-4 text-[#E11D48] animate-pulse" />
            <span className="font-mono-data text-xs text-[#E11D48] tracking-widest uppercase font-bold">
              Negative Evidence Intelligence
            </span>
          </div>
          <h1 className="font-display-calm font-medium text-4xl text-white tracking-tight">
            Disaster Reality Reconstruction
          </h1>
          <p className="font-body-prose text-xs text-[#94A3B8] mt-1 max-w-2xl">
            Mathematical adjudication of competing hypotheses against multimodal silence,
            calibrated baseline physics, counterfactual simulation, and active governance.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 p-2.5 rounded-2xl">
          <UserCheck className="w-4 h-4 text-[#60A5FA]" />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono-data uppercase text-[#64748B]">Simulated Role</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as any)}
              className="bg-transparent text-xs font-mono-data text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="Officer" className="bg-[#0C0E12] text-white">Officer (Approval Authority)</option>
              <option value="Administrator" className="bg-[#0C0E12] text-white">Administrator (Full Authority)</option>
              <option value="Analyst" className="bg-[#0C0E12] text-white">Analyst (Read + Justify Only)</option>
              <option value="Auditor" className="bg-[#0C0E12] text-white">Auditor (Compliance Only)</option>
              <option value="Viewer" className="bg-[#0C0E12] text-white">Viewer (Read Only)</option>
            </select>
          </div>
        </div>
      </div>
          {/* Top Telemetry & Reality Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono-data">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Active Sector</span>
          <div className="text-xl font-bold text-white truncate">
            {SECTOR_OPTIONS.find((s) => s.id === selectedSector)?.name || selectedSector}
          </div>
          <span className="text-[10px] text-[#94A3B8]">
            {activeSectorSilence?.silence_severity || "ELEVATED_WATCH"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Dominant Hypothesis</span>
          <div className="text-sm font-bold text-[#34D399] truncate">
            {hypothesesData?.dominant_hypothesis || "H5: Physical Disaster"}
          </div>
          <span className="text-[10px] text-[#94A3B8]">Bayesian Consensus</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Uncertainty Entropy</span>
          <div className="text-xl font-bold text-[#F59E0B] flex items-baseline gap-1">
            <span>{hypothesesData?.uncertainty_entropy?.toFixed(2) || "1.85"}</span>
            <span className="text-xs text-[#64748B]">bits</span>
            {activeSortie?.entropyDelta && activeSortie.entropyDelta > 0 && (
              <span className="text-[11px] text-[#34D399] font-bold ml-1">
                ↓ -{activeSortie.entropyDelta.toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#94A3B8]">Shannon Entropy H(P)</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Counterfactual Match</span>
          <div className="text-xl font-bold text-[#60A5FA]">
            {counterfactualData?.consistency_score || 0}%
          </div>
          <span className="text-[10px] text-[#94A3B8]">Empirical Consistency</span>
        </div>
      </div>

      {/* Sector Navigation Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
        {SECTOR_OPTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setSelectedSector(sec.id)}
            className={`px-4 py-2 rounded-xl text-xs font-mono-data whitespace-nowrap transition-all cursor-pointer ${
              selectedSector === sec.id
                ? "bg-white/10 text-white font-bold border border-white/20"
                : "text-[#94A3B8] hover:bg-white/5 hover:text-white border border-transparent"
            }`}
          >
            {sec.name}
          </button>
        ))}
      </div>

      {/* Notification Toast */}
      {feedbackNotification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/30 font-mono-data text-xs text-[#93C5FD] flex items-center justify-between"
        >
          <span>{feedbackNotification}</span>
          <button onClick={() => setFeedbackNotification(null)} className="text-white hover:underline cursor-pointer">
            Dismiss
          </button>
        </motion.div>
      )}

      {/* 4-Tab Bar */}
      <div className="flex gap-4 border-b border-white/10 text-xs font-mono-data">
        <button
          onClick={() => setActiveTab("hypotheses")}
          className={`pb-3 tracking-wider uppercase transition-colors cursor-pointer border-b-2 ${
            activeTab === "hypotheses"
              ? "border-[#E11D48] text-white font-bold"
              : "border-transparent text-[#64748B] hover:text-[#94A3B8]"
          }`}
        >
          01 Competing Hypotheses (H1-H5)
        </button>
        <button
          onClick={() => setActiveTab("baseline")}
          className={`pb-3 tracking-wider uppercase transition-colors cursor-pointer border-b-2 ${
            activeTab === "baseline"
              ? "border-[#E11D48] text-white font-bold"
              : "border-transparent text-[#64748B] hover:text-[#94A3B8]"
          }`}
        >
          02 Expected Reality & Silence
        </button>
        <button
          onClick={() => setActiveTab("counterfactual")}
          className={`pb-3 tracking-wider uppercase transition-colors cursor-pointer border-b-2 ${
            activeTab === "counterfactual"
              ? "border-[#E11D48] text-white font-bold"
              : "border-transparent text-[#64748B] hover:text-[#94A3B8]"
          }`}
        >
          03 Counterfactual Predictions
        </button>
        <button
          onClick={() => setActiveTab("verification")}
          className={`pb-3 tracking-wider uppercase transition-colors cursor-pointer border-b-2 ${
            activeTab === "verification"
              ? "border-[#2563EB] text-white font-bold"
              : "border-transparent text-[#64748B] hover:text-[#94A3B8]"
          }`}
        >
          04 Active Verification & Governance
        </button>
      </div>

      {/* TAB CONTENT 1: COMPETING HYPOTHESES */}
      {activeTab === "hypotheses" && hypothesesData && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-mono-data text-sm uppercase text-white font-bold tracking-wider flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#34D399]" />
              Bayesian Likelihood Distribution over 5 Competing Realities
            </h3>
            <span className="text-xs font-mono-data text-[#64748B]">
              Updated: {new Date(hypothesesData.simulated_time).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {hypothesesData.hypotheses.map((h) => {
              const isDominant = hypothesesData.dominant_hypothesis.startsWith(h.hypothesis_code);
              return (
                <div
                  key={h.hypothesis_code}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isDominant
                      ? "bg-[#34D399]/10 border-[#34D399]/40 shadow-[0_0_30px_rgba(52,211,153,0.15)]"
                      : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-mono-data text-xs font-bold text-white px-2 py-0.5 rounded bg-white/10">
                        {h.hypothesis_code}
                      </span>
                      {isDominant && (
                        <span className="text-[9px] font-mono-data text-[#34D399] uppercase font-bold tracking-wider">
                          Consensus
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-white">{h.title}</h4>
                    <p className="text-[11px] text-[#94A3B8] font-body-prose line-clamp-3">
                      {h.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <div className="flex justify-between text-xs font-mono-data">
                      <span className="text-[#64748B]">Posterior</span>
                      <span className="font-bold text-white">{(h.posterior_probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isDominant ? "bg-[#34D399]" : "bg-white/40"}`}
                        style={{ width: `${Math.min(100, Math.max(5, h.posterior_probability * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mathematical Trace Explanations */}
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
            <h4 className="font-mono-data text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              Explainable Bayesian Evidence Traces for {SECTOR_OPTIONS.find((s) => s.id === selectedSector)?.name}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hypothesesData.hypotheses.map((h) => (
                <div key={h.hypothesis_code} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono-data">
                    <span className="font-bold text-white">{h.hypothesis_code}: {h.title}</span>
                    <span className="text-[#64748B]">{(h.posterior_probability * 100).toFixed(1)}%</span>
                  </div>
                  {h.explanation_traces.length === 0 ? (
                    <p className="text-[11px] text-[#64748B] italic">No active evidence deltas currently observed.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {h.explanation_traces.slice(0, 3).map((tr: HypothesisTraceItem, i: number) => (
                        <div key={i} className="flex justify-between text-[11px] font-mono-data bg-white/[0.02] p-2 rounded">
                          <span className="text-[#94A3B8] truncate max-w-[280px]">{tr.evidence_summary}</span>
                          <span className={tr.delta_contribution >= 0 ? "text-[#34D399]" : "text-[#E11D48]"}>
                            {tr.delta_contribution >= 0 ? `+${tr.delta_contribution}` : tr.delta_contribution}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: EXPECTED REALITY & SILENCE */}
      {activeTab === "baseline" && baselineData && (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-mono-data text-[10px] text-[#D97706] uppercase tracking-[0.2em] mb-1">
                  EXPECTED REALITY ENGINE // {baselineData.sector_id.toUpperCase()}
                </div>
                <h3 className="font-display-calm font-medium text-2xl text-white">
                  Diurnal Signal Baseline vs Observed Stream
                </h3>
              </div>
              <span className="font-mono-data text-xs px-3 py-1 rounded-xl bg-[#E11D48]/20 text-[#FB7185] border border-[#E11D48]/40 font-bold">
                {baselineData.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono-data text-xs">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[9px] text-[#64748B] uppercase block mb-1">Expected Baseline Mean</span>
                <span className="text-xl text-white font-bold">{baselineData.expected_mean} calls/hr</span>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[9px] text-[#64748B] uppercase block mb-1">Expected Normal Range</span>
                <span className="text-xl text-[#34D399] font-bold">[{baselineData.expected_min} - {baselineData.expected_max}]</span>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[9px] text-[#64748B] uppercase block mb-1">Observed Stream Rate</span>
                <span className="text-xl text-[#E11D48] font-bold">{baselineData.observed_value} calls/hr</span>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[9px] text-[#64748B] uppercase block mb-1">Silence Gap Delta</span>
                <span className="text-xl text-[#F59E0B] font-bold">{baselineData.gap_delta} (Z={baselineData.z_score}σ)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 font-body-prose text-xs text-[#94A3B8] leading-relaxed">
              <strong>Engine Analysis:</strong> {baselineData.explanation}
            </div>

            {/* Silence Window Tracker */}
            {activeSectorSilence && (
              <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                <h4 className="font-mono-data text-xs text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D97706]" />
                  Active Silence Window Telemetry
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-data text-xs">
                  <div>
                    <span className="text-[9px] text-[#64748B] uppercase block">Continuous Silence Duration</span>
                    <span className="text-lg text-white font-bold">{activeSectorSilence.silence_duration_hours} Hours</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#64748B] uppercase block">Estimated Lost Distress Events</span>
                    <span className="text-lg text-[#FB7185] font-bold">{activeSectorSilence.expected_events_lost} Events</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#64748B] uppercase block">Suspended Bridge Severance</span>
                    <span className="text-lg text-white font-bold">{activeSectorSilence.bridge_severed ? "SEVERED (HIGH RISK)" : "INTACT"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: COUNTERFACTUAL PREDICTIONS */}
      {activeTab === "counterfactual" && counterfactualData && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-mono-data text-sm uppercase text-white font-bold tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#F59E0B]" />
              Physics-Based Counterfactual Simulation vs Reality Divergence
            </h3>
            <span className="text-xs font-mono-data text-[#64748B]">
              Consistency Score: {counterfactualData.consistency_score}%
            </span>
          </div>

          <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono-data text-xs min-w-[700px]">
                <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] text-[#64748B] uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Hypothesis</th>
                    <th className="p-4">Predicted Observable Assertion</th>
                    <th className="p-4">Observable Signal Type</th>
                    <th className="p-4 text-right">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {counterfactualData.predictions.map((p) => (
                    <tr key={p.prediction_id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-bold text-[#E11D48]">{p.hypothesis_code}</td>
                      <td className="p-4 font-body-prose text-xs text-[#94A3B8]">{p.prediction_statement}</td>
                      <td className="p-4 text-[#64748B]">{p.expected_observation_type}</td>
                      <td className="p-4 text-right">
                        {p.verification_status === "CONFIRMED" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] bg-[#059669]/20 text-[#34D399] border border-[#059669]/40 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            CONFIRMED
                          </span>
                        )}
                        {p.verification_status === "CONTRADICTED" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] bg-[#E11D48]/20 text-[#FB7185] border border-[#E11D48]/40 font-bold inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            CONTRADICTED
                          </span>
                        )}
                        {p.verification_status === "UNTESTED" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] bg-white/5 text-[#94A3B8] border border-white/10 font-bold inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            UNTESTED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 text-center font-mono-data text-[11px] text-[#64748B] flex items-center justify-center gap-2 border-t border-white/5">
            <Activity className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Counterfactual Assertions Synchronized with Physics Engine • End of Ledger</span>
          </div>
        </div>
      )}

      {activeTab === "verification" && rankedActions && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.03] border border-white/10 p-4 rounded-2xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono-data uppercase tracking-widest text-[#64748B] block">
                Target Verification Scope
              </span>
              <div className="text-xs font-mono-data text-white font-medium flex items-center gap-2">
                {verificationScope === "sector" ? (
                  <>
                    <MapPin className="w-4 h-4 text-[#34D399]" />
                    Showing Best Observation for:{" "}
                    <strong className="text-white underline">
                      {SECTOR_OPTIONS.find((s) => s.id === selectedSector)?.name}
                    </strong>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 text-[#60A5FA]" />
                    Showing Global Theater Priority Across:{" "}
                    <strong className="text-white underline">All 8 Districts (Central Nepal)</strong>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-xl border border-white/10 font-mono-data text-xs">
              <button
                onClick={() => setVerificationScope("sector")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  verificationScope === "sector"
                    ? "bg-[#2563EB] text-white font-bold shadow"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Sector View ({SECTOR_OPTIONS.find((s) => s.id === selectedSector)?.name.split(" ")[0]})
              </button>
              <button
                onClick={() => setVerificationScope("theater")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  verificationScope === "theater"
                    ? "bg-[#2563EB] text-white font-bold shadow"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                National Theater #1 Priority
              </button>
            </div>
          </div>

          {activeSortie && activeSortie.stage === "DISPATCHED" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-3xl bg-gradient-to-r from-[#2563EB]/20 via-[#1D4ED8]/20 to-black border-2 border-[#2563EB] shadow-[0_0_50px_rgba(37,99,235,0.3)] space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#2563EB] text-white animate-pulse">
                    <Plane className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-mono-data text-[10px] text-[#93C5FD] uppercase tracking-[0.2em]">
                      LIVE RECONNAISSANCE SORTIE AIRBORNE
                    </div>
                    <h3 className="font-display-calm font-bold text-2xl text-white">
                      {activeSortie.action.action_title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono-data">
                    <div className="text-3xl font-bold text-[#60A5FA]">
                      00:{activeSortie.secondsRemaining < 10 ? `0${activeSortie.secondsRemaining}` : activeSortie.secondsRemaining}
                    </div>
                    <span className="text-[9px] text-[#94A3B8] uppercase">Tactical ETA Countdown</span>
                  </div>

                  <button
                    onClick={() => finishSortieExecution(activeSortie.action)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono-data text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
                  >
                    <FastForward className="w-4 h-4 text-[#34D399]" />
                    Fast-Forward to Arrival
                  </button>
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#2563EB] to-[#34D399]"
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${((activeSortie.totalSeconds - activeSortie.secondsRemaining) / activeSortie.totalSeconds) * 100}%`,
                  }}
                  transition={{ ease: "linear" }}
                />
              </div>

              <div className="flex justify-between text-[11px] font-mono-data text-[#94A3B8]">
                <span className="flex items-center gap-1.5">
                  <Radar className="w-3.5 h-3.5 text-[#34D399] animate-spin" />
                  Streaming multi-modal observation telemetry from forward unit...
                </span>
                <span>Speed: 10x Accelerated Command Velocity</span>
              </div>
            </motion.div>
          )}

          {activeSortie && activeSortie.stage === "RESOLVED" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-[#34D399]/10 border border-[#34D399]/30 space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-mono-data text-[#34D399] font-bold uppercase tracking-wider">
                  <Check className="w-4 h-4" />
                  Sortie Accomplished & Evidence Ingested
                </div>
                <button
                  onClick={() => setActiveSortie(null)}
                  className="text-xs font-mono-data text-[#94A3B8] hover:text-white cursor-pointer"
                >
                  Dismiss Report
                </button>
              </div>
              <p className="font-mono-data text-xs text-white leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5">
                {activeSortie.liveTelemetry}
              </p>
              <div className="flex gap-4 font-mono-data text-xs text-[#94A3B8]">
                <span>
                  Target Sector: <strong className="text-white">{activeSortie.action.sector_name}</strong>
                </span>
                <span>
                  Uncertainty Entropy Reduction:{" "}
                  <strong className="text-[#34D399]">-{activeSortie.entropyDelta} bits</strong>
                </span>
                <span>
                  Re-ranking Status:{" "}
                  <strong className="text-[#60A5FA]">Queue updated across Central Nepal</strong>
                </span>
              </div>
            </motion.div>
          )}

          {heroObservation && (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#2563EB]/10 via-[#0C0E12] to-black border border-[#2563EB]/40 shadow-[0_0_60px_rgba(37,99,235,0.15)] space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-mono-data text-[10px] text-[#60A5FA] uppercase tracking-[0.25em] mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" />
                    {verificationScope === "sector"
                      ? `RECOMMENDED BEST OBSERVATION FOR ${heroObservation.sector_name.toUpperCase()}`
                      : "RECOMMENDED NEXT BEST OBSERVATION (NATIONAL THEATER PRIORITY)"}
                  </div>
                  <h3 className="font-display-calm font-medium text-3xl text-white">
                    {heroObservation.action_title}
                  </h3>
                </div>
                <div className="text-right font-mono-data">
                  <div className="text-3xl font-bold text-[#34D399]">
                    {heroObservation.ranking_score}
                  </div>
                  <span className="text-[9px] text-[#64748B] uppercase">Priority Rank Score</span>
                </div>
              </div>

              <p className="font-body-prose text-sm text-[#94A3B8] leading-relaxed">
                {heroObservation.justification}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono-data text-xs">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[9px] text-[#64748B] uppercase block mb-1">Expected Info Gain</span>
                  <span className="text-xl text-[#34D399] font-bold">+{heroObservation.expected_information_gain} bits</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[9px] text-[#64748B] uppercase block mb-1">Operational Risk</span>
                  <span className="text-xl text-white font-bold">{Math.round(heroObservation.operational_risk_score * 100)}%</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[9px] text-[#64748B] uppercase block mb-1">Estimated Cost</span>
                  <span className="text-xl text-white font-bold">${heroObservation.resource_cost_usd}</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[9px] text-[#64748B] uppercase block mb-1">Execution ETA</span>
                  <span className="text-xl text-[#60A5FA] font-bold">{heroObservation.eta_minutes} min</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                <div className="font-mono-data text-xs text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Human Governance Review Directive</span>
                  <span className="text-[#64748B] text-[10px]">Role: <strong className="text-white">{activeRole}</strong></span>
                </div>

                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono-data text-white placeholder-[#64748B] focus:outline-none focus:border-[#2563EB]"
                  rows={2}
                  placeholder="Enter commander justification or operational modification..."
                />

                <div className="flex gap-3">
                  <button
                    disabled={isProcessing || activeSortie?.stage === "DISPATCHED"}
                    onClick={() => handleStartSortie(heroObservation)}
                    className="flex-1 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-mono-data uppercase tracking-wider font-bold transition-all cursor-pointer shadow-lg shadow-[#2563EB]/25 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isProcessing ? "Processing Authorization..." : "Approve & Execute Sortie (Closed-Loop Feed)"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {verificationScope === "sector" && sectorActions.length > 1 && (
            <div className="space-y-4 pt-2">
              <h4 className="font-mono-data text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <Radar className="w-4 h-4 text-[#60A5FA]" />
                Alternative Verification Modalities for {SECTOR_OPTIONS.find((s) => s.id === selectedSector)?.name}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-data text-xs">
                {sectorActions.slice(1, 4).map((alt) => (
                  <div key={alt.recommendation_id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-[#64748B] uppercase">{alt.action_type}</span>
                      <span className="text-sm font-bold text-[#34D399]">{alt.ranking_score}</span>
                    </div>
                    <h5 className="font-bold text-white text-sm line-clamp-2">{alt.action_title}</h5>
                    <div className="flex justify-between text-[11px] text-[#94A3B8] border-t border-white/5 pt-2">
                      <span>Gain: +{alt.expected_information_gain}b</span>
                      <span>Risk: {Math.round(alt.operational_risk_score * 100)}%</span>
                      <span>ETA: {alt.eta_minutes}m</span>
                    </div>
                    <button
                      disabled={isProcessing}
                      onClick={() => handleStartSortie(alt)}
                      className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-bold border border-white/10 transition-all cursor-pointer"
                    >
                      Authorize Sortie
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {verificationScope === "theater" && (rankedActions?.candidate_actions?.length ?? 0) > 1 && (
            <div className="space-y-4 pt-2">
              <h4 className="font-mono-data text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <Radar className="w-4 h-4 text-[#60A5FA]" />
                National Theater Verification Queue (Next Operational Priorities Across Central Nepal)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-data text-xs">
                {rankedActions?.candidate_actions
                  ?.filter((a) => a.recommendation_id !== heroObservation?.recommendation_id)
                  ?.slice(0, 3)
                  ?.map((alt) => (
                    <div key={alt.recommendation_id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-[#60A5FA] uppercase font-bold">{alt.sector_name}</span>
                        <div className="flex items-center gap-1.5">
                          {alt.status === "EXECUTED" && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-[#34D399]/20 text-[#34D399] font-bold">EXECUTED</span>
                          )}
                          <span className="text-sm font-bold text-[#34D399]">{alt.ranking_score}</span>
                        </div>
                      </div>
                      <h5 className="font-bold text-white text-sm line-clamp-2">{alt.action_title}</h5>
                      <div className="flex justify-between text-[11px] text-[#94A3B8] border-t border-white/5 pt-2">
                        <span>Gain: +{alt.expected_information_gain}b</span>
                        <span>Risk: {Math.round(alt.operational_risk_score * 100)}%</span>
                        <span>ETA: {alt.eta_minutes}m</span>
                      </div>
                      <button
                        disabled={isProcessing || alt.status === "EXECUTED"}
                        onClick={() => handleStartSortie(alt)}
                        className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-bold border border-white/10 transition-all cursor-pointer disabled:opacity-40"
                      >
                        {alt.status === "EXECUTED" ? "Sortie Completed" : "Authorize Sortie"}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4">
            <h4 className="font-mono-data text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#64748B]" />
              Immutable Governance Audit Trail ({auditTrail?.total_audits || 0})
            </h4>

            <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono-data text-xs min-w-[700px]">
                  <thead className="border-b border-white/10 bg-white/[0.03] text-[9px] text-[#64748B] uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Audit ID</th>
                      <th className="p-3">Recommendation</th>
                      <th className="p-3">Decision</th>
                      <th className="p-3">Reviewer (Role)</th>
                      <th className="p-3">Resulting Evidence</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px]">
                    {auditTrail?.records.map((rec) => (
                      <tr key={rec.audit_id}>
                        <td className="p-3 text-[#64748B]">{rec.audit_id}</td>
                        <td className="p-3 text-white">{rec.recommendation_id}</td>
                        <td className="p-3 font-bold text-[#34D399]">{rec.decision}</td>
                        <td className="p-3 text-[#94A3B8]">{rec.reviewer_name} ({rec.reviewer_role})</td>
                        <td className="p-3 text-[#60A5FA]">{rec.resulting_evidence_id || "Awaiting Telemetry"}</td>
                        <td className="p-3 text-[#64748B]">{new Date(rec.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                    {auditTrail?.records.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-xs text-[#64748B]">
                          No review actions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 text-center font-mono-data text-[11px] text-[#64748B] flex items-center justify-center gap-2 border-t border-white/5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Operational Governance Ledger Synchronized • End of Audit Log</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
