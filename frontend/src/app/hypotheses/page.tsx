"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchSectorHypotheses,
  fetchSectorCounterfactuals,
  fetchSectorBaselineComparison,
  fetchNegativeEvidenceOverview,
  fetchRankedVerificationObservations,
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
  const [auditTrail, setAuditTrail] = useState<AuditTrailResponse | null>(null);

  // Role Governance Simulation State
  const [activeRole, setActiveRole] = useState<"Officer" | "Analyst" | "Auditor" | "Viewer">("Officer");
  const [reviewNote, setReviewNote] = useState("High uncertainty entropy justifies urgent forward verification.");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackNotification, setFeedbackNotification] = useState<string | null>(null);

  const loadAllData = async () => {
    try {
      const [hyp, cf, bl, neg, vrf, aud] = await Promise.all([
        fetchSectorHypotheses(selectedSector),
        fetchSectorCounterfactuals(selectedSector),
        fetchSectorBaselineComparison(selectedSector),
        fetchNegativeEvidenceOverview(),
        fetchRankedVerificationObservations(),
        fetchAuditTrail(),
      ]);

      setHypothesesData(hyp);
      setCounterfactualData(cf);
      setBaselineData(bl);
      setNegativeOverview(neg);
      setRankedActions(vrf);
      setAuditTrail(aud);
    } catch (err) {
      console.error("Failed to load PRATYAKSH-Ω intelligence:", err);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 5000);
    return () => clearInterval(interval);
  }, [selectedSector]);

  const handleApproveAction = async (rec: VerificationActionItem) => {
    setIsProcessing(true);
    setFeedbackNotification(null);
    try {
      // 1. Human Governance Review
      const reviewRes = await reviewVerificationAction({
        recommendation_id: rec.recommendation_id,
        decision: "APPROVED",
        reviewer_role: activeRole,
        reviewer_name: activeRole === "Officer" ? "Col. S. Sharma (NEOC Commander)" : "Duty Analyst",
        justification: reviewNote,
      });

      if (reviewRes.status === "FORBIDDEN") {
        setFeedbackNotification(`❌ Permission Denied: ${reviewRes.message}`);
        setIsProcessing(false);
        return;
      }

      // 2. Closed-Loop Execution & Feedback Ingestion
      const feedRes = await executeAndFeedReality({
        recommendation_id: rec.recommendation_id,
        observed_finding: `Forward ${rec.action_type.toUpperCase()} confirmed physical damage and isolated population pocket in ${rec.sector_name}.`,
        damage_confirmed: true,
        evidence_direction: "positive",
        reliability: 0.95,
      });

      setFeedbackNotification(`✅ Action Approved & Executed! ${feedRes.message}`);
      await loadAllData();
    } catch (err: any) {
      setFeedbackNotification(`❌ Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeSectorSilence = negativeOverview?.silence_windows.find(
    (w) => w.sector_id.toLowerCase() === selectedSector.toLowerCase()
  );

  return (
    <div className="flex-1 w-full bg-[#090B0E] text-[#F3F4F6] p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Protocol Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono-data text-[10px] text-[#E11D48] tracking-[0.25em] uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
            PRATYAKSH-Ω // Autonomous Negative Evidence Engine
          </div>
          <h1 className="font-display-calm font-medium text-3xl sm:text-4xl text-white tracking-tight">
            Disaster Reality Reconstruction
          </h1>
          <p className="font-body-prose text-xs text-[#94A3B8] mt-1">
            Uncertainty reasoning engine deriving reality from missing signals, counterfactual assertions, and active verification.
          </p>
        </div>

        {/* 5-Tier Role Selector Pill */}
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 p-1.5 rounded-2xl">
          <div className="font-mono-data text-[10px] text-[#64748B] uppercase px-2 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            Role:
          </div>
          {(["Officer", "Analyst", "Auditor", "Viewer"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setActiveRole(r)}
              className={`px-3 py-1 rounded-xl text-xs font-mono-data transition-all cursor-pointer ${
                activeRole === r
                  ? "bg-[#2563EB] text-white font-bold shadow-lg shadow-[#2563EB]/30"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Global Top KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono-data text-xs">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Silence Anomaly Status</span>
          <div className="text-xl font-bold text-[#E11D48] flex items-center gap-2">
            <Radio className="w-4 h-4 animate-pulse" />
            {baselineData?.status || "ANALYZING"}
          </div>
          <span className="text-[10px] text-[#94A3B8]">Z-Score: {baselineData?.z_score || 0}σ</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Dominant Hypothesis</span>
          <div className="text-sm font-bold text-[#34D399] truncate">
            {hypothesesData?.dominant_hypothesis.split(":")[0] || "H5"} — {hypothesesData?.dominant_hypothesis.split(":")[1] || "Physical Disaster"}
          </div>
          <span className="text-[10px] text-[#94A3B8]">Bayesian Consensus</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Uncertainty Entropy</span>
          <div className="text-xl font-bold text-[#F59E0B]">
            {hypothesesData?.uncertainty_entropy.toFixed(2) || "1.85"} <span className="text-xs text-[#64748B]">bits</span>
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
              ? "border-[#D97706] text-white font-bold"
              : "border-transparent text-[#64748B] hover:text-[#94A3B8]"
          }`}
        >
          02 Expected Reality & Silence
        </button>
        <button
          onClick={() => setActiveTab("counterfactual")}
          className={`pb-3 tracking-wider uppercase transition-colors cursor-pointer border-b-2 ${
            activeTab === "counterfactual"
              ? "border-[#059669] text-white font-bold"
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
      {activeTab === "hypotheses" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center text-xs font-mono-data text-[#94A3B8]">
            <span>Sector: <strong className="text-white">{hypothesesData?.sector_name}</strong></span>
            <span>Uncertainty Entropy: <strong className="text-[#F59E0B]">{hypothesesData?.uncertainty_entropy} bits</strong></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hypothesesData?.hypotheses.map((hyp) => {
              const pct = Math.round(hyp.posterior_probability * 100);
              const isLeading = hyp.status === "leading";

              return (
                <div
                  key={hyp.hypothesis_code}
                  className={`p-6 rounded-3xl border transition-all space-y-4 ${
                    isLeading
                      ? "bg-white/[0.04] border-white/20 shadow-[0_0_40px_rgba(225,29,72,0.15)]"
                      : "bg-white/[0.02] border-white/5"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 font-mono-data text-xs">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          isLeading ? "bg-[#E11D48] text-white" : "bg-white/10 text-[#94A3B8]"
                        }`}>
                          {hyp.hypothesis_code}
                        </span>
                        <span className="font-semibold text-white">{hyp.title}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono-data">
                      <div className={`text-2xl font-bold ${isLeading ? "text-[#E11D48]" : "text-white"}`}>
                        {pct}%
                      </div>
                      <div className="text-[9px] text-[#64748B] uppercase">Posterior Prob</div>
                    </div>
                  </div>

                  <p className="font-body-prose text-xs text-[#94A3B8] leading-relaxed">
                    {hyp.description}
                  </p>

                  {/* Probability Bar */}
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isLeading ? "bg-[#E11D48]" : "bg-[#2563EB]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Bayesian Explanation Trace */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      Bayesian Update Contributions
                    </div>
                    <div className="space-y-1.5 font-mono-data text-[11px]">
                      {hyp.explanation_traces.length === 0 && (
                        <div className="text-[10px] text-[#64748B] italic">No active evidence delta. Prior dominates.</div>
                      )}
                      {hyp.explanation_traces.slice(0, 3).map((tr, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-black/40 border border-white/5 flex justify-between items-center text-[10px]">
                          <span className="text-[#94A3B8] truncate max-w-[280px]">{tr.evidence_summary}</span>
                          <span className={tr.direction === "SUPPORTS" ? "text-[#34D399] font-bold" : "text-[#FB7185] font-bold"}>
                            {tr.delta_contribution > 0 ? `+${tr.delta_contribution}` : tr.delta_contribution}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: EXPECTED REALITY & SILENCE */}
      {activeTab === "baseline" && baselineData && (
        <div className="space-y-8">
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

      {/* TAB CONTENT 3: COUNTERFACTUAL MATRIX */}
      {activeTab === "counterfactual" && counterfactualData && (
        <div className="space-y-6">
          <div className="flex justify-between items-center font-mono-data text-xs">
            <span className="text-[#94A3B8]">
              Sector: <strong className="text-white">{counterfactualData.sector_name}</strong>
            </span>
            <span className="text-[#94A3B8]">
              Empirical Consistency: <strong className="text-[#34D399]">{counterfactualData.consistency_score}%</strong>
            </span>
          </div>

          <div className="border border-white/10 rounded-3xl overflow-hidden bg-white/[0.02]">
            <table className="w-full text-left font-mono-data text-xs">
              <thead className="border-b border-white/10 bg-white/[0.03] text-[9px] text-[#64748B] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Hypothesis</th>
                  <th className="p-4">Predicted Observable Assertion</th>
                  <th className="p-4">Observable Signal Type</th>
                  <th className="p-4 text-right">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px]">
                {counterfactualData.predictions.map((pred) => (
                  <tr key={pred.prediction_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-[#E11D48]">{pred.hypothesis_code}</td>
                    <td className="p-4 font-body-prose text-xs text-[#94A3B8]">{pred.prediction_statement}</td>
                    <td className="p-4 text-[#64748B]">{pred.expected_observation_type}</td>
                    <td className="p-4 text-right">
                      {pred.verification_status === "CONFIRMED" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-[#059669]/20 text-[#34D399] border border-[#059669]/40 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          CONFIRMED
                        </span>
                      )}
                      {pred.verification_status === "CONTRADICTED" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-[#E11D48]/20 text-[#FB7185] border border-[#E11D48]/40 font-bold inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          CONTRADICTED
                        </span>
                      )}
                      {pred.verification_status === "UNTESTED" && (
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
      )}

      {/* TAB CONTENT 4: ACTIVE VERIFICATION & GOVERNANCE */}
      {activeTab === "verification" && rankedActions && (
        <div className="space-y-8">
          {/* Best Next Observation Hero Card */}
          {rankedActions.best_next_observation && (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#2563EB]/10 via-[#0C0E12] to-black border border-[#2563EB]/40 shadow-[0_0_60px_rgba(37,99,235,0.15)] space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-mono-data text-[10px] text-[#60A5FA] uppercase tracking-[0.25em] mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" />
                    RECOMMENDED NEXT BEST OBSERVATION
                  </div>
                  <h3 className="font-display-calm font-medium text-3xl text-white">
                    {rankedActions.best_next_observation.action_title}
                  </h3>
                </div>
                <div className="text-right font-mono-data">
                  <div className="text-3xl font-bold text-[#34D399]">
                    {rankedActions.best_next_observation.ranking_score}
                  </div>
                  <span className="text-[9px] text-[#64748B] uppercase">Priority Rank Score</span>
                </div>
              </div>

              <p className="font-body-prose text-sm text-[#94A3B8] leading-relaxed">
                {rankedActions.best_next_observation.justification}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono-data text-xs">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[9px] text-[#64748B] uppercase block mb-1">Expected Info Gain</span>
                  <span className="text-xl text-[#34D399] font-bold">+{rankedActions.best_next_observation.expected_information_gain} bits</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[9px] text-[#64748B] uppercase block mb-1">Operational Risk</span>
                  <span className="text-xl text-white font-bold">{Math.round(rankedActions.best_next_observation.operational_risk_score * 100)}%</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[9px] text-[#64748B] uppercase block mb-1">Estimated Cost</span>
                  <span className="text-xl text-white font-bold">${rankedActions.best_next_observation.resource_cost_usd}</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[9px] text-[#64748B] uppercase block mb-1">Execution ETA</span>
                  <span className="text-xl text-[#60A5FA] font-bold">{rankedActions.best_next_observation.eta_minutes} min</span>
                </div>
              </div>

              {/* Human Approval Review Controls */}
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
                    disabled={isProcessing}
                    onClick={() => handleApproveAction(rankedActions.best_next_observation!)}
                    className="flex-1 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-mono-data uppercase tracking-wider font-bold transition-all cursor-pointer shadow-lg shadow-[#2563EB]/25 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isProcessing ? "Processing Sortie..." : "Approve & Execute Sortie (Closed-Loop Feed)"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Immutable Governance Audit Trail */}
          <div className="space-y-4 pt-4">
            <h4 className="font-mono-data text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#64748B]" />
              Immutable Governance Audit Trail ({auditTrail?.total_audits || 0})
            </h4>

            <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
              <table className="w-full text-left font-mono-data text-xs">
                <thead className="border-b border-white/10 bg-white/[0.03] text-[9px] text-[#64748B] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Audit ID</th>
                    <th className="p-3">Recommendation</th>
                    <th className="p-3">Decision</th>
                    <th className="p-3">Reviewer (Role)</th>
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
                      <td className="p-3 text-[#64748B]">{new Date(rec.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                  {auditTrail?.records.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-xs text-[#64748B]">
                        No review actions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
