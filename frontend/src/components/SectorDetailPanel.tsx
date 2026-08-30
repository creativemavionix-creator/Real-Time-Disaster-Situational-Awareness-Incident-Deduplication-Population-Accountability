"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IncidentClusterItem,
  LocationStatusItem,
  ReportItem,
  fetchLocationIncidents,
  overrideLocationStatus,
  submitOfficialReport,
} from "@/lib/api";

interface SectorDetailPanelProps {
  location: LocationStatusItem | null;
  onClose: () => void;
  isAnalysis: boolean;
  onOpenPalikas?: (sectorId: string) => void;
  onRefreshStatus?: () => void;
}

export function SectorDetailPanel({
  location,
  onClose,
  isAnalysis,
  onOpenPalikas,
  onRefreshStatus,
}: SectorDetailPanelProps) {
  const [incidents, setIncidents] = useState<IncidentClusterItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCluster, setExpandedCluster] = useState<number | null>(null);

  // Operator Override Form State
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState<string>("verified_safe");
  const [operatorName, setOperatorName] = useState<string>("Duty Commander Sharma");
  const [operatorRole, setOperatorRole] = useState<string>("Officer");
  const [overrideNotes, setOverrideNotes] = useState<string>("Physical patrol recon completed and confirmed sector operational.");
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);
  const [overrideSuccessMsg, setOverrideSuccessMsg] = useState<string | null>(null);

  // Official Report Form State
  const [showOfficialModal, setShowOfficialModal] = useState(false);
  const [officialAgency, setOfficialAgency] = useState<string>("Armed Police Force (APF)");
  const [officialOfficer, setOfficialOfficer] = useState<string>("Inspector S. Thapa");
  const [officialBadge, setOfficialBadge] = useState<string>("APF-8831");
  const [officialDmgType, setOfficialDmgType] = useState<string>("structural_collapse");
  const [officialCasualties, setOfficialCasualties] = useState<number>(0);
  const [officialGrade, setOfficialGrade] = useState<number>(3);
  const [officialNeed, setOfficialNeed] = useState<string>("Heavy hydraulic cutters and emergency blood units");
  const [officialNotes, setOfficialNotes] = useState<string>("Building perimeter cordoned; triage active.");
  const [isSubmittingOfficial, setIsSubmittingOfficial] = useState(false);
  const [officialSuccessMsg, setOfficialSuccessMsg] = useState<string | null>(null);

  // Fetch incidents only when the specific sector id changes
  useEffect(() => {
    if (!location?.location_id) {
      setIncidents([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchLocationIncidents(location.location_id)
      .then((data) => {
        if (isMounted) {
          setIncidents(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load incidents");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [location?.location_id]);

  // Global ESC key listener
  useEffect(() => {
    if (!location) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [location, onClose]);

  const handleApplyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    setIsSubmittingOverride(true);
    setOverrideSuccessMsg(null);
    try {
      const res = await overrideLocationStatus(location.location_id, {
        override_status: overrideStatus,
        confirmed_safe: overrideStatus === "verified_safe",
        operator_name: operatorName,
        operator_role: operatorRole,
        badge_or_unit: "NEOC-COMMAND-1",
        justification_notes: overrideNotes,
      });
      setOverrideSuccessMsg(res.message);
      setIsSubmittingOverride(false);
      setShowOverrideForm(false);
      if (onRefreshStatus) onRefreshStatus();
    } catch (err: any) {
      setError(err.message || "Failed to save override");
      setIsSubmittingOverride(false);
    }
  };

  const handleSendOfficialReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    setIsSubmittingOfficial(true);
    setOfficialSuccessMsg(null);
    try {
      await submitOfficialReport({
        location_id: location.location_id,
        reporting_agency: officialAgency,
        officer_name: officialOfficer,
        badge_number: officialBadge,
        damage_type: officialDmgType,
        casualty_count: Number(officialCasualties),
        damage_grade: Number(officialGrade),
        immediate_need: officialNeed,
        reported_lat: location.lat,
        reported_lon: location.lon,
        raw_notes: officialNotes,
      });
      setOfficialSuccessMsg("Official report authenticated and processed with 1.0 trust rating.");
      setIsSubmittingOfficial(false);
      setShowOfficialModal(false);
      if (onRefreshStatus) onRefreshStatus();
    } catch (err: any) {
      setError(err.message || "Failed to submit official report");
      setIsSubmittingOfficial(false);
    }
  };

  const getRecommendedAction = () => {
    if (!location) return "Assess Field Situation.";
    switch (location.status) {
      case "verified_damaged":
        return "Deploy Urban SAR Heavy Battalion + Emergency Mobile Field Hospital.";
      case "blackout":
        return "Deploy High-Altitude UAV Aerial Reconnaissance + Satellite Comms Restorer.";
      case "unverified":
        return "Dispatch APF First-Responder Reconnaissance Patrol.";
      case "verified_safe":
        return "Maintain Staging Logistics Hub & Standing Monitoring.";
      default:
        return "Assess Field Situation.";
    }
  };

  return (
    <AnimatePresence>
      {location && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-[500] flex justify-end bg-black/70 backdrop-blur-xs cursor-pointer"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="w-full max-w-2xl h-full bg-[#0C0E12]/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-[#F3F4F6] cursor-default"
          >
            {/* Panel Header */}
            <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-start justify-between gap-4">
              <div>
                <div className="font-mono-data text-[10px] text-[#94A3B8] uppercase tracking-[0.25em] mb-1 flex items-center gap-2">
                  <span>SECTOR INSPECTION // {location.location_id.toUpperCase()}</span>
                  {location.operator_override?.is_overridden && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px] border border-emerald-500/30">
                      OPERATOR ATTESTED
                    </span>
                  )}
                </div>
                <h2 className="font-display-calm font-medium text-3xl text-white">
                  {location.location_name}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOfficialModal(true)}
                  type="button"
                  className="px-3 py-1.5 rounded-xl border border-blue-500/40 bg-blue-600/20 hover:bg-blue-600/30 text-xs font-mono-data text-blue-300 cursor-pointer transition-all flex items-center gap-1.5 font-bold"
                  title="Official First-Responder Intake Form"
                >
                  <span>+</span>
                  <span>OFFICIAL INTAKE</span>
                </button>
                <button
                  onClick={onClose}
                  type="button"
                  className="px-3 py-1.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-xs font-mono-data text-[#94A3B8] hover:text-white cursor-pointer transition-all flex items-center gap-2"
                  title="Close panel (Esc)"
                >
                  <span>ESC</span>
                  <span className="text-white font-bold">✕</span>
                </button>
              </div>
            </div>

            {/* Panel Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {/* OPERATOR OVERRIDE NOTIFICATION OR HUMAN CONFIRMATION GUARDRAIL BANNER */}
              {location.human_safe_confirmation_required && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold font-mono-data">
                    <span className="text-base">⚠️</span>
                    <span>HUMAN OPERATOR CONFIRMATION REQUIRED</span>
                  </div>
                  <p className="font-body-prose text-amber-200/90 leading-relaxed">
                    AI detected high-confidence safe signals, but policy guardrail prevents auto-declaring this sector safe. An authorized Officer must inspect and confirm.
                  </p>
                  <button
                    onClick={() => {
                      setOverrideStatus("verified_safe");
                      setShowOverrideForm(true);
                    }}
                    type="button"
                    className="px-3 py-1.5 rounded bg-amber-500 text-black font-bold font-mono-data text-xs hover:bg-amber-400 cursor-pointer"
                  >
                    CONFIRM SECTOR SAFE AS OPERATOR →
                  </button>
                </div>
              )}

              {overrideSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono-data text-xs">
                  ✓ {overrideSuccessMsg}
                </div>
              )}
              {officialSuccessMsg && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono-data text-xs">
                  ✓ {officialSuccessMsg}
                </div>
              )}

              {/* LAYER 1: EXECUTIVE STATUS & OPERATOR OVERRIDE TRIGGER */}
              <div className="space-y-3">
                <div className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em] flex items-center justify-between">
                  <span>1. EXECUTIVE STATUS & AI RELIABILITY</span>
                  <button
                    onClick={() => setShowOverrideForm(!showOverrideForm)}
                    type="button"
                    className="text-[10px] text-[#60A5FA] hover:text-white font-bold tracking-wider hover:underline cursor-pointer"
                  >
                    {showOverrideForm ? "[CANCEL OVERRIDE]" : "[HUMAN CONFIRM / OVERRIDE STATUS →]"}
                  </button>
                </div>

                {/* OVERRIDE FORM (FEATURE 7) */}
                {showOverrideForm && (
                  <form onSubmit={handleApplyOverride} className="p-4 rounded-xl bg-black/60 border border-blue-500/30 space-y-3 font-mono-data text-xs">
                    <div className="text-white font-bold text-xs border-b border-white/10 pb-2">
                      HUMAN-IN-THE-LOOP OPERATOR OVERRIDE
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-[#94A3B8] block mb-1">TARGET STATUS</label>
                        <select
                          value={overrideStatus}
                          onChange={(e) => setOverrideStatus(e.target.value)}
                          className="w-full bg-[#1A1D24] border border-white/10 rounded px-2.5 py-1.5 text-white"
                        >
                          <option value="verified_safe">verified_safe (Confirmed Clear)</option>
                          <option value="verified_damaged">verified_damaged (Emergency Active)</option>
                          <option value="investigating">investigating (Recon Dispatched)</option>
                          <option value="unverified">unverified (Ambiguous)</option>
                          <option value="blackout">blackout (No Telemetry)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#94A3B8] block mb-1">OPERATOR NAME & UNIT</label>
                        <input
                          type="text"
                          value={operatorName}
                          onChange={(e) => setOperatorName(e.target.value)}
                          className="w-full bg-[#1A1D24] border border-white/10 rounded px-2.5 py-1.5 text-white"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#94A3B8] block mb-1">OPERATIONAL JUSTIFICATION (AUDIT LOGGED)</label>
                      <textarea
                        value={overrideNotes}
                        onChange={(e) => setOverrideNotes(e.target.value)}
                        rows={2}
                        className="w-full bg-[#1A1D24] border border-white/10 rounded px-2.5 py-1.5 text-white font-body-prose text-xs"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowOverrideForm(false)}
                        className="px-3 py-1 bg-white/5 text-[#94A3B8] hover:text-white rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingOverride}
                        className="px-4 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded"
                      >
                        {isSubmittingOverride ? "RECORDING..." : "COMMIT OVERRIDE"}
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-3 gap-3 font-mono-data text-xs">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[9px] text-[#64748B] block uppercase tracking-wider mb-1">EFFECTIVE STATUS</span>
                    <strong className={`text-sm font-bold uppercase ${
                      location.status === "verified_damaged" ? "text-[#E11D48]" :
                      location.status === "verified_safe" ? "text-emerald-400" :
                      location.status === "blackout" ? "text-amber-400" : "text-blue-400"
                    }`}>
                      {location.status.replace("_", " ")}
                    </strong>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[9px] text-[#64748B] block uppercase tracking-wider mb-1">AI CONFIDENCE</span>
                    <strong className="text-sm font-bold text-[#059669]">
                      {(location.confidence_score * 100).toFixed(0)}%
                    </strong>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[9px] text-[#64748B] block uppercase tracking-wider mb-1">INCIDENTS / REPORTS</span>
                    <strong className="text-sm font-bold text-white">{location.incident_cluster_count} cl / {location.report_count} rep</strong>
                  </div>
                </div>
              </div>

              {/* ACCOUNTABLE SECTOR COMMANDER CARD (FEATURE 16) */}
              {location.accountable_officer && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 font-mono-data text-xs">
                  <div className="text-[10px] text-[#64748B] uppercase tracking-[0.2em] flex items-center justify-between">
                    <span>ACCOUNTABLE SECTOR LEAD (OWNER)</span>
                    <span className="text-emerald-400">● ON DUTY</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-sm">{location.accountable_officer.name}</div>
                      <div className="text-[11px] text-[#94A3B8]">{location.accountable_officer.agency} — {location.accountable_officer.role}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#64748B] block">COMMS CHANNEL</span>
                      <span className="font-bold text-[#60A5FA]">{location.accountable_officer.contact_channel}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SOURCE BIAS CHECK BAR (FEATURE 12) */}
              {location.bias_analysis && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 font-mono-data text-xs">
                  <div className="text-[10px] text-[#64748B] uppercase tracking-[0.2em] flex items-center justify-between">
                    <span>SOURCE TELEMETRY BIAS ANALYSIS</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      location.bias_analysis.bias_flag === "OFFICIALLY_CONFIRMED" ? "bg-emerald-500/20 text-emerald-300" :
                      location.bias_analysis.bias_flag === "INFORMAL_SKEW_HIGH" ? "bg-amber-500/20 text-amber-300" :
                      "bg-white/10 text-[#94A3B8]"
                    }`}>
                      {location.bias_analysis.bias_flag.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span>Informal/Social: <strong className="text-white">{location.bias_analysis.informal_report_pct}%</strong></span>
                      <span>Official First-Responders: <strong className="text-white">{location.bias_analysis.official_report_pct}%</strong></span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 flex overflow-hidden">
                      <div style={{ width: `${location.bias_analysis.informal_report_pct}%` }} className="bg-sky-500/80" />
                      <div style={{ width: `${location.bias_analysis.official_report_pct}%` }} className="bg-emerald-500/80" />
                    </div>
                  </div>
                  <p className="font-body-prose text-[11px] text-[#94A3B8] italic">
                    {location.bias_analysis.explanation}
                  </p>
                </div>
              )}

              {/* LAYER 2: EXPLANATION */}
              <div className="space-y-2">
                <div className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em]">
                  2. SITUATIONAL EXPLANATION & SILENCE DECAY
                </div>
                <p className="font-body-prose text-sm text-[#94A3B8] p-4 rounded-xl bg-white/[0.02] border border-white/5 leading-relaxed">
                  {location.status_reason}
                </p>
              </div>

              {/* LAYER 3: ACTION */}
              <div className="space-y-2">
                <div className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em]">
                  3. RECOMMENDED OPERATIONAL DIRECTIVE
                </div>
                <div className="p-4 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/30 text-sm font-body-prose text-white">
                  <strong>{getRecommendedAction()}</strong>
                </div>
              </div>

              {/* LAYER 4: EVIDENCE DOSSIER & CLUSTERS */}
              <div className="space-y-3 pt-2">
                <div className="font-mono-data text-[10px] text-[#64748B] uppercase tracking-[0.2em] flex items-center justify-between">
                  <span>4. EVIDENCE DOSSIER & CLUSTERS ({incidents.length})</span>
                  {onOpenPalikas && (
                    <button
                      onClick={() => onOpenPalikas(location.location_id)}
                      type="button"
                      className="text-[10px] text-[#60A5FA] hover:text-white font-bold tracking-wider hover:underline cursor-pointer"
                    >
                      [VIEW 2021 CENSUS PALIKAS →]
                    </button>
                  )}
                </div>

                {isLoading && (
                  <div className="py-8 text-center font-mono-data text-xs text-[#94A3B8] animate-pulse">
                    [SCORING EVIDENCE & DEDUPLICATING INCIDENTS...]
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-[#FB7185] font-mono-data">
                    {error}
                  </div>
                )}

                {!isLoading && incidents.length === 0 && (
                  <div className="p-6 text-center text-xs font-mono-data text-[#64748B] bg-white/[0.02] border border-white/5 rounded-xl">
                    NO INCIDENTS RECORDED AT CURRENT SIMULATION TIMELINE.
                  </div>
                )}

                <div className="space-y-3">
                  {incidents.map((cluster) => {
                    const isExpanded = expandedCluster === cluster.cluster_id;

                    return (
                      <div
                        key={cluster.cluster_id}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                          <div className="flex items-center gap-2 font-mono-data text-xs">
                            <span className="font-bold text-white">CLUSTER #{cluster.cluster_id}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-[#94A3B8]">
                              {cluster.damage_type}
                            </span>
                            {cluster.casualty_estimate !== null && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-[#E11D48]/20 text-[#FB7185] font-bold">
                                {cluster.casualty_estimate} CASUALTIES
                              </span>
                            )}
                          </div>

                          <div className="font-mono-data text-xs text-[#34D399] font-bold">
                            {(cluster.confidence_score * 100).toFixed(0)}% CONFIDENCE
                          </div>
                        </div>

                        <blockquote className="font-body-prose text-xs sm:text-sm text-[#94A3B8] italic">
                          &ldquo;{cluster.representative_text}&rdquo;
                        </blockquote>

                        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono-data text-[#64748B] pt-1">
                          <div className="flex gap-3">
                            {Object.entries(cluster.sources_breakdown).map(([src, count]) => (
                              <span key={src} className="uppercase">
                                {src}: <strong className="text-white">{String(count)}</strong>
                              </span>
                            ))}
                          </div>

                          {cluster.reports && cluster.reports.length > 0 && (
                            <button
                              onClick={() => setExpandedCluster(isExpanded ? null : cluster.cluster_id)}
                              type="button"
                              className="text-[#60A5FA] hover:text-white font-bold hover:underline cursor-pointer"
                            >
                              {isExpanded ? "HIDE RAW LOGS" : `VIEW ${cluster.reports.length} RAW LOGS`}
                            </button>
                          )}
                        </div>

                        {/* Contributing Raw Reports */}
                        {isExpanded && cluster.reports && (
                          <div className="mt-3 space-y-2 pt-2 border-t border-white/5">
                            {cluster.reports.map((rep: ReportItem, idx: number) => (
                              <div
                                key={`${rep.id}-${idx}`}
                                className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono-data text-xs space-y-1"
                              >
                                <div className="flex justify-between text-[10px] text-[#64748B]">
                                  <span className="font-bold uppercase text-[#F3F4F6]">{rep.source_type}</span>
                                  <span>{new Date(rep.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="font-body-prose text-xs text-[#94A3B8]">
                                  {rep.raw_text}
                                </p>
                                {isAnalysis && rep.score_breakdown && (
                                  <div className="text-[10px] text-[#64748B] pt-1 border-t border-white/5 flex justify-between">
                                    <span>SCORE: {rep.score_breakdown.effective_score?.toFixed(2)}</span>
                                    <span>TRUST WEIGHT: {rep.score_breakdown.source_trust_weight}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* MODAL: OFFICIAL FIRST-RESPONDER INTAKE (FEATURE 8 & 17) */}
            {showOfficialModal && (
              <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                <form
                  onSubmit={handleSendOfficialReport}
                  className="w-full max-w-lg bg-[#0F1218] border border-blue-500/40 rounded-2xl p-6 space-y-4 font-mono-data text-xs text-white shadow-2xl"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div>
                      <div className="text-[10px] text-blue-400 tracking-widest uppercase">FIRST-RESPONDER SECURE GATEWAY</div>
                      <h3 className="text-base font-bold text-white">OFFICIAL SITREP INTAKE — {location.location_name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowOfficialModal(false)}
                      className="text-[#94A3B8] hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#94A3B8] block mb-1">REPORTING AGENCY</label>
                      <select
                        value={officialAgency}
                        onChange={(e) => setOfficialAgency(e.target.value)}
                        className="w-full bg-[#1A1E26] border border-white/10 rounded px-2.5 py-1.5 text-white"
                      >
                        <option value="Armed Police Force (APF)">Armed Police Force (APF)</option>
                        <option value="Nepal Police">Nepal Police</option>
                        <option value="Nepal Army">Nepal Army</option>
                        <option value="District Hospital">District Hospital</option>
                        <option value="Red Cross (NRCS)">Red Cross (NRCS)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#94A3B8] block mb-1">OFFICER & BADGE #</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={officialOfficer}
                          onChange={(e) => setOfficialOfficer(e.target.value)}
                          placeholder="Officer Name"
                          className="w-1/2 bg-[#1A1E26] border border-white/10 rounded px-2 py-1.5 text-white"
                          required
                        />
                        <input
                          type="text"
                          value={officialBadge}
                          onChange={(e) => setOfficialBadge(e.target.value)}
                          placeholder="Badge #"
                          className="w-1/2 bg-[#1A1E26] border border-white/10 rounded px-2 py-1.5 text-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-[#94A3B8] block mb-1">DAMAGE TYPE</label>
                      <select
                        value={officialDmgType}
                        onChange={(e) => setOfficialDmgType(e.target.value)}
                        className="w-full bg-[#1A1E26] border border-white/10 rounded px-2 py-1.5 text-white"
                      >
                        <option value="structural_collapse">Structural Collapse</option>
                        <option value="road_blocked">Road Blocked</option>
                        <option value="medical_emergency">Medical Emergency</option>
                        <option value="landslide_debris">Landslide Debris</option>
                        <option value="safe_clear">Safe / All Clear</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#94A3B8] block mb-1">CASUALTIES</label>
                      <input
                        type="number"
                        min={0}
                        value={officialCasualties}
                        onChange={(e) => setOfficialCasualties(Number(e.target.value))}
                        className="w-full bg-[#1A1E26] border border-white/10 rounded px-2 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#94A3B8] block mb-1">DAMAGE GRADE (1-5)</label>
                      <select
                        value={officialGrade}
                        onChange={(e) => setOfficialGrade(Number(e.target.value))}
                        className="w-full bg-[#1A1E26] border border-white/10 rounded px-2 py-1.5 text-white"
                      >
                        <option value={1}>G1: Minor Cracks</option>
                        <option value={2}>G2: Moderate Damage</option>
                        <option value={3}>G3: Heavy Structural</option>
                        <option value={4}>G4: Partial Collapse</option>
                        <option value={5}>G5: Total Destruction</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#94A3B8] block mb-1">IMMEDIATE TACTICAL NEED</label>
                    <input
                      type="text"
                      value={officialNeed}
                      onChange={(e) => setOfficialNeed(e.target.value)}
                      className="w-full bg-[#1A1E26] border border-white/10 rounded px-2.5 py-1.5 text-white font-body-prose text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#94A3B8] block mb-1">TACTICAL FIELD LOG / NOTES</label>
                    <textarea
                      value={officialNotes}
                      onChange={(e) => setOfficialNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-[#1A1E26] border border-white/10 rounded px-2.5 py-1.5 text-white font-body-prose text-xs"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowOfficialModal(false)}
                      className="px-4 py-2 bg-white/5 text-[#94A3B8] hover:text-white rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingOfficial}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded"
                    >
                      {isSubmittingOfficial ? "DISPATCHING..." : "DISPATCH OFFICIAL SITREP"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
