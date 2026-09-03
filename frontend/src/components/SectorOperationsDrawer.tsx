"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GisSectorTelemetry,
  LocationStatusItem,
  fetchSectorHypotheses,
  fetchSectorBaselineComparison,
  fetchRankedVerificationObservations,
  executeAndFeedReality,
  overrideLocationStatus,
  SectorHypothesesResponse,
  SectorBaselineComparison,
  RankedObservationsResponse,
  VerificationActionItem,
  assignMission,
  fetchDispatchDashboard,
  DispatchDashboardResponse,
  H3HexagonItem,
} from "@/lib/api";
import {
  X,
  Radio,
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  PhoneCall,
  Wifi,
  Truck,
  BrainCircuit,
  Eye,
  Crosshair,
  UserCheck,
  Layers,
  ChevronRight,
} from "lucide-react";

interface SectorOperationsDrawerProps {
  sector: GisSectorTelemetry;
  location?: LocationStatusItem | null;
  selectedHexagon?: H3HexagonItem | null;
  onClose: () => void;
  onRefreshData?: () => void;
  onOpenPalikas?: (sectorId: string) => void;
}

export default function SectorOperationsDrawer({
  sector,
  location,
  selectedHexagon,
  onClose,
  onRefreshData,
  onOpenPalikas,
}: SectorOperationsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"telemetry" | "hypotheses" | "tactical">("telemetry");
  const [hypotheses, setHypotheses] = useState<SectorHypothesesResponse | null>(null);
  const [baselineComparison, setBaselineComparison] = useState<SectorBaselineComparison | null>(null);
  const [rankedActions, setRankedActions] = useState<RankedObservationsResponse | null>(null);
  const [dispatchData, setDispatchData] = useState<DispatchDashboardResponse | null>(null);

  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState("verified_damaged");
  const [overrideNotes, setOverrideNotes] = useState("Duty Commander physical situational override.");

  const sId = sector.sector_id.toLowerCase();

  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      try {
        const [hyp, base, act, disp] = await Promise.all([
          fetchSectorHypotheses(sId),
          fetchSectorBaselineComparison(sId),
          fetchRankedVerificationObservations(),
          fetchDispatchDashboard(),
        ]);
        if (isMounted) {
          setHypotheses(hyp);
          setBaselineComparison(base);
          setRankedActions(act);
          setDispatchData(disp);
        }
      } catch (err) {
        console.error("Failed to load sector operations details:", err);
      }
    };
    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [sId]);

  const handleExecuteAction = async (rec: VerificationActionItem) => {
    setIsProcessingAction(true);
    setActionMessage(null);
    try {
      const res = await executeAndFeedReality({
        recommendation_id: rec.recommendation_id,
        damage_confirmed: sector.status === "verified_damaged" || sector.status === "blackout",
        observed_finding: `Targeted reconnaissance executed over ${sector.sector_name}. Telemetry corroborated and verified.`,
        evidence_direction: "positive",
        reliability: 0.92,
      });
      setActionMessage(`✓ Reality updated! Entropy reduced by ${res.entropy_reduction} bits.`);
      // Reload hypotheses
      const updatedHyp = await fetchSectorHypotheses(sId);
      setHypotheses(updatedHyp);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setActionMessage(`[ERROR]: ${err.message || "Failed to execute reconnaissance action"}`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleQuickDispatch = async (unitId: number) => {
    setIsProcessingAction(true);
    try {
      const res = await assignMission({
        target_location_id: sId,
        assigned_unit_id: unitId,
        justification: `Tactical emergency deployment to ${sector.sector_name} (${sector.threat_tier})`,
      });
      setActionMessage(`✓ Mission [${res.mission_code}] successfully authorized and dispatched!`);
      const updatedDisp = await fetchDispatchDashboard();
      setDispatchData(updatedDisp);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setActionMessage(`[DISPATCH_ERROR]: ${err.message}`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleConfirmOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingAction(true);
    try {
      await overrideLocationStatus(sId, {
        override_status: overrideStatus,
        confirmed_safe: overrideStatus === "verified_safe",
        operator_name: "Duty Commander (Tactical EOC)",
        operator_role: "Officer",
        badge_or_unit: "NEOC-OPS-1",
        justification_notes: overrideNotes,
      });
      setShowOverrideModal(false);
      setActionMessage(`✓ Sector status successfully overridden to ${overrideStatus.toUpperCase()}`);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setActionMessage(`[OVERRIDE_ERROR]: ${err.message}`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const candidateActions = rankedActions?.candidate_actions || [];
  const topSortie =
    candidateActions.find((r) => r.sector_id.toLowerCase() === sId) ||
    rankedActions?.best_next_observation ||
    candidateActions[0];

  const sectorDispatchRec = dispatchData?.recommendations.find(
    (r) => r.target_sector_id.toLowerCase() === sId
  );

  return (
    <motion.aside
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 420, opacity: 0 }}
      transition={{ type: "spring", damping: 24, stiffness: 200 }}
      className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] lg:w-[520px] bg-[#090B0E]/95 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col text-[#F3F4F6] shadow-2xl font-mono-data"
    >
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3 bg-[#0C0E12]/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                sector.status === "verified_damaged" || sector.status === "blackout"
                  ? "bg-[#EF4444] animate-ping"
                  : sector.status === "verified_safe"
                  ? "bg-[#10B981]"
                  : "bg-[#F59E0B]"
              }`}
            />
            <span className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold">
              OPERATIONAL SECTOR DOSSIER
            </span>
          </div>
          <h2 className="text-xl font-bold font-display-calm text-white flex items-center gap-2">
            {sector.sector_name}
            <span className="text-xs font-mono-data px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#60A5FA]">
              {sector.threat_tier}
            </span>
          </h2>
          <div className="text-[11px] text-[#94A3B8] flex items-center gap-3">
            <span>Lat: {sector.latitude.toFixed(3)}°N</span>
            <span>Lon: {sector.longitude.toFixed(3)}°E</span>
            <span>Elev: {sector.elevation_meters}m</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Hexagon Micro-Context Banner (If Selected) */}
      {selectedHexagon && (
        <div className="p-3 bg-[#3B82F6]/10 border-b border-[#3B82F6]/30 flex items-center justify-between text-xs">
          <div>
            <span className="text-[#60A5FA] font-bold">[H3-RES8 HEXAGON ACTIVE]: </span>
            <span className="text-white font-semibold">{selectedHexagon.sub_region}</span>
            <span className="text-[10px] text-[#94A3B8] ml-2">Pop: {selectedHexagon.baseline_population.toLocaleString()}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40">
            E_cell: {selectedHexagon.silent_exposure_metric_ecell}
          </span>
        </div>
      )}

      {/* Accountable Officer Badge */}
      {location?.accountable_officer && (
        <div className="px-5 py-2.5 bg-[#0C0E12] border-b border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#60A5FA]" />
            <div>
              <div className="text-white font-semibold text-[11px]">
                {location.accountable_officer.name}
              </div>
              <div className="text-[10px] text-[#94A3B8]">
                {location.accountable_officer.agency}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-[#F59E0B] px-2 py-0.5 rounded bg-white/5 border border-white/10">
            {location.accountable_officer.contact_channel}
          </div>
        </div>
      )}

      {/* 3 Navigation Tabs */}
      <div className="grid grid-cols-3 border-b border-white/10 bg-[#0C0E12]/50 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("telemetry")}
          className={`py-2.5 text-center font-bold tracking-wider transition-all cursor-pointer ${
            activeTab === "telemetry"
              ? "border-b-2 border-[#60A5FA] text-[#60A5FA] bg-white/5"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          1. Telemetry &amp; Gaps
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("hypotheses")}
          className={`py-2.5 text-center font-bold tracking-wider transition-all cursor-pointer ${
            activeTab === "hypotheses"
              ? "border-b-2 border-[#E11D48] text-[#E11D48] bg-white/5"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          2. Bayes Hypotheses
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tactical")}
          className={`py-2.5 text-center font-bold tracking-wider transition-all cursor-pointer ${
            activeTab === "tactical"
              ? "border-b-2 border-[#10B981] text-[#10B981] bg-white/5"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          3. Tactical Response
        </button>
      </div>

      {/* Drawer Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {actionMessage && (
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-[#60A5FA]">
            {actionMessage}
          </div>
        )}

        {/* TAB 1: TELEMETRY & LIFELINES */}
        {activeTab === "telemetry" && (
          <div className="space-y-5">
            {/* 4 Lifelines */}
            <div className="space-y-2">
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold">
                Physical Lifeline Integrity
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <PhoneCall className={`w-5 h-5 ${sector.status === "blackout" ? "text-[#EF4444]" : "text-[#10B981]"}`} />
                  <div>
                    <div className="text-[10px] text-[#94A3B8]">Cellular BTS</div>
                    <div className="text-xs font-bold text-white">
                      {sector.status === "blackout" ? "0% SEVERED" : "OPERATIONAL"}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <Zap className={`w-5 h-5 ${sector.status === "blackout" ? "text-[#F59E0B]" : "text-[#10B981]"}`} />
                  <div>
                    <div className="text-[10px] text-[#94A3B8]">Electrical Grid</div>
                    <div className="text-xs font-bold text-white">
                      {sector.status === "blackout" ? "TRIPPED" : "STABLE"}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <Wifi className={`w-5 h-5 ${sector.status === "blackout" ? "text-[#EF4444]" : "text-[#10B981]"}`} />
                  <div>
                    <div className="text-[10px] text-[#94A3B8]">Internet Backhaul</div>
                    <div className="text-xs font-bold text-white">
                      {sector.status === "blackout" ? "FIBER CUT" : "ACTIVE"}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <Truck className={`w-5 h-5 ${sector.isolation_index > 0.6 ? "text-[#EF4444]" : "text-[#10B981]"}`} />
                  <div>
                    <div className="text-[10px] text-[#94A3B8]">Road Access</div>
                    <div className="text-xs font-bold text-white">
                      {sector.isolation_index > 0.6 ? "BLOCKED / CHOKED" : "PASSABLE"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expected vs Observed Telemetry */}
            {baselineComparison && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white uppercase tracking-wider">
                    Signal Gap Analysis (Δ)
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    baselineComparison.is_anomalous
                      ? "bg-red-500/20 text-red-400 border border-red-500/40"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    Z-SCORE: {baselineComparison.z_score.toFixed(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-[10px] text-[#94A3B8]">Expected Hourly Signals</div>
                    <div className="text-xl font-bold text-[#60A5FA]">
                      {baselineComparison.expected_mean.toFixed(1)} / hr
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-[10px] text-[#94A3B8]">Observed Field Signals</div>
                    <div className={`text-xl font-bold ${
                      baselineComparison.observed_value === 0 ? "text-[#EF4444]" : "text-[#10B981]"
                    }`}>
                      {baselineComparison.observed_value.toFixed(1)} / hr
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[#94A3B8] leading-relaxed italic">
                  &ldquo;{baselineComparison.explanation}&rdquo;
                </p>
              </div>
            )}

            {/* Palika Municipality Census Button */}
            {onOpenPalikas && (
              <button
                type="button"
                onClick={() => onOpenPalikas(sId)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#60A5FA] flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Layers className="w-4 h-4" />
                <span>Drill Down into Palika (Municipality) Demographics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* TAB 2: BAYESIAN HYPOTHESES */}
        {activeTab === "hypotheses" && (
          <div className="space-y-5">
            {hypotheses ? (
              <>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0C0E12] border border-white/10 text-xs">
                  <div>
                    <span className="text-[10px] text-[#94A3B8]">Uncertainty Entropy H(P):</span>
                    <div className="text-base font-bold text-[#F59E0B]">
                      {hypotheses.uncertainty_entropy.toFixed(2)} / 2.32 bits
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#94A3B8]">Leading Hypothesis:</span>
                    <div className="text-xs font-bold text-[#EF4444]">
                      [{hypotheses.dominant_hypothesis}]
                    </div>
                  </div>
                </div>

                {/* 5 Probability Bars */}
                <div className="space-y-3">
                  {hypotheses.hypotheses.map((h) => {
                    const isDominant = h.hypothesis_code === hypotheses.dominant_hypothesis;
                    const pct = Math.round(h.posterior_probability * 100);
                    return (
                      <div
                        key={h.hypothesis_code}
                        className={`p-3 rounded-xl border transition-all ${
                          isDominant
                            ? "bg-[#EF4444]/10 border-[#EF4444]/40"
                            : "bg-white/5 border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold text-white">
                            {h.hypothesis_code}: {h.title}
                          </span>
                          <span className={`font-bold ${isDominant ? "text-[#EF4444]" : "text-[#94A3B8]"}`}>
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isDominant ? "bg-[#EF4444]" : "bg-[#60A5FA]"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-[#94A3B8] leading-tight">
                          {h.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-xs text-[#94A3B8] text-center py-6">
                Loading Bayesian belief distribution...
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TACTICAL RESPONSE & DISPATCH */}
        {activeTab === "tactical" && (
          <div className="space-y-5">
            {/* Recommended Next Best Observation */}
            {topSortie && (
              <div className="p-4 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#60A5FA] font-bold uppercase tracking-wider">
                    <Crosshair className="w-4 h-4" />
                    Recommended Recon Action
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-[#60A5FA] text-[10px] font-bold">
                    Score: {topSortie.ranking_score}
                  </span>
                </div>

                <div className="text-sm font-bold text-white">
                  {topSortie.action_title}
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  {topSortie.justification}
                </p>

                <div className="grid grid-cols-3 gap-2 text-[10px] text-center pt-2 border-t border-white/10">
                  <div>
                    <span className="text-[#94A3B8]">Info Gain:</span>
                    <div className="font-bold text-[#10B981]">+{topSortie.expected_information_gain} bits</div>
                  </div>
                  <div>
                    <span className="text-[#94A3B8]">Est. ETA:</span>
                    <div className="font-bold text-white">{topSortie.eta_minutes} min</div>
                  </div>
                  <div>
                    <span className="text-[#94A3B8]">Cost:</span>
                    <div className="font-bold text-white">${topSortie.resource_cost_usd}</div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isProcessingAction}
                  onClick={() => handleExecuteAction(topSortie)}
                  className="w-full py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Recon &amp; Feed Reality</span>
                </button>
              </div>
            )}

            {/* Tactical SAR Unit Dispatch */}
            {sectorDispatchRec && sectorDispatchRec.available_matching_units.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold">
                  Available Response Units ({sectorDispatchRec.available_matching_units.length})
                </span>
                <div className="space-y-2">
                  {sectorDispatchRec.available_matching_units.slice(0, 2).map((unit) => (
                    <div
                      key={unit.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{unit.unit_name}</div>
                        <div className="text-[10px] text-[#94A3B8]">
                          {unit.unit_type} &bull; Base: {unit.home_base}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isProcessingAction}
                        onClick={() => handleQuickDispatch(unit.id)}
                        className="py-1 px-3 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-[10px] font-bold cursor-pointer transition-colors disabled:opacity-50"
                      >
                        Dispatch
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Duty Commander Override Gate */}
            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowOverrideModal(true)}
                className="w-full py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Duty Commander Status Override / Confirm Safe</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Override Modal */}
      <AnimatePresence>
        {showOverrideModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-[#0C0E12] border border-white/15 p-6 space-y-4 text-xs shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="font-bold text-white text-sm">Duty Commander Override Gate</div>
                <button type="button" onClick={() => setShowOverrideModal(false)}>
                  <X className="w-4 h-4 text-[#94A3B8]" />
                </button>
              </div>

              <form onSubmit={handleConfirmOverride} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#94A3B8] uppercase">Target Override Status:</label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-black/40 border border-white/15 text-white"
                  >
                    <option value="verified_damaged">Verified Damaged</option>
                    <option value="blackout">Confirmed Blackout</option>
                    <option value="unverified">Unverified (Investigation Needed)</option>
                    <option value="verified_safe">Verified Safe (Mandatory Officer Sign-off)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#94A3B8] uppercase">Operational Justification:</label>
                  <textarea
                    rows={3}
                    value={overrideNotes}
                    onChange={(e) => setOverrideNotes(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-black/40 border border-white/15 text-white"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOverrideModal(false)}
                    className="px-4 py-2 rounded-lg bg-white/5 text-[#94A3B8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingAction}
                    className="px-4 py-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold cursor-pointer"
                  >
                    Sign &amp; Apply Override
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
