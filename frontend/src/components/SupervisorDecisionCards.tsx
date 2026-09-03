"use client";

import React, { useState } from "react";
import {
  TacticalDispatchRecommendation,
  EmergencySupplyAllocationItem,
  ConflictEvidenceRecord,
} from "@/lib/api";
import {
  ShieldAlert,
  Package,
  Droplet,
  HeartPulse,
  Radio,
  Tent,
  Plane,
  Truck,
  Send,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Clock,
  Compass,
} from "lucide-react";

interface SupervisorDecisionCardsProps {
  dispatchRecommendation?: TacticalDispatchRecommendation | null;
  supplyAllocation?: EmergencySupplyAllocationItem | null;
  conflicts?: ConflictEvidenceRecord[];
  onDispatchUnit?: (unitId: number, sectorId: string) => void;
  isLoading?: boolean;
}

export default function SupervisorDecisionCards({
  dispatchRecommendation,
  supplyAllocation,
  conflicts = [],
  onDispatchUnit,
  isLoading = false,
}: SupervisorDecisionCardsProps) {
  const [dispatchedUnits, setDispatchedUnits] = useState<number[]>([]);

  const handleDispatch = (unitId: number, sectorId: string) => {
    setDispatchedUnits((prev) => [...prev, unitId]);
    if (onDispatchUnit) {
      onDispatchUnit(unitId, sectorId);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Multi-Source Intelligence Conflict Alert (if any active for sector) */}
      {conflicts.length > 0 && (
        <div className="space-y-2">
          {conflicts.map((conf) => (
            <div
              key={conf.conflict_id}
              className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold font-mono">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>MULTI-AGENCY CONFLICT: {conf.disputed_metric}</span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                  {conf.discrepancy_severity.replace(/_/g, " ")}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[9px] text-red-400 block uppercase font-bold">
                    Claim A ({conf.primary_source})
                  </span>
                  <p className="text-slate-300 leading-snug">{conf.primary_claim}</p>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[9px] text-emerald-400 block uppercase font-bold">
                    Claim B ({conf.competing_source})
                  </span>
                  <p className="text-slate-300 leading-snug">{conf.competing_claim}</p>
                </div>
              </div>

              <div className="text-[11px] text-amber-200 bg-amber-950/50 p-2 rounded border border-amber-500/20">
                <strong>Supervisor Directive: </strong>
                {conf.resolution_recommendation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Emergency Supply Allocation Quota Card */}
      {supplyAllocation && (
        <div className="p-4 rounded-xl bg-[#11141D] border border-white/10 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                EMERGENCY SUPPLY ALLOCATION QUOTA
              </h4>
            </div>
            <span
              className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                supplyAllocation.priority_tier === "CRITICAL_IMMEDIATE"
                  ? "bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse"
                  : supplyAllocation.priority_tier === "HIGH_PRIORITY"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
              }`}
            >
              {supplyAllocation.priority_tier.replace(/_/g, " ")} (SCORE: {supplyAllocation.priority_score})
            </span>
          </div>

          {/* Supply Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="p-2 rounded-lg bg-[#0A0D14] border border-white/5 text-center">
              <Droplet className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <span className="text-[9px] font-mono text-slate-400 block uppercase">Drinking Water</span>
              <span className="text-xs font-mono font-bold text-white">
                {supplyAllocation.drinking_water_liters.toLocaleString()} L
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#0A0D14] border border-white/5 text-center">
              <Package className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="text-[9px] font-mono text-slate-400 block uppercase">Food Rations</span>
              <span className="text-xs font-mono font-bold text-white">
                {supplyAllocation.food_rations_mre.toLocaleString()} MRE
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#0A0D14] border border-white/5 text-center">
              <HeartPulse className="w-4 h-4 text-red-400 mx-auto mb-1" />
              <span className="text-[9px] font-mono text-slate-400 block uppercase">Trauma Kits</span>
              <span className="text-xs font-mono font-bold text-white">
                {supplyAllocation.trauma_medical_kits.toLocaleString()} Sets
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#0A0D14] border border-white/5 text-center">
              <Radio className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <span className="text-[9px] font-mono text-slate-400 block uppercase">Satellite Comms</span>
              <span className="text-xs font-mono font-bold text-white">
                {supplyAllocation.emergency_comms_terminals} Units
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#0A0D14] border border-white/5 text-center col-span-2 sm:col-span-1">
              <Tent className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-[9px] font-mono text-slate-400 block uppercase">Emergency Tents</span>
              <span className="text-xs font-mono font-bold text-white">
                {supplyAllocation.emergency_tents.toLocaleString()} Tents
              </span>
            </div>
          </div>

          {/* Delivery Logistics */}
          <div className="p-2.5 rounded-lg bg-[#090C12] border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              {supplyAllocation.recommended_delivery_mode.includes("HELICOPTER") ? (
                <Plane className="w-4 h-4 text-cyan-400" />
              ) : (
                <Truck className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-slate-400">Mode:</span>
              <strong className="text-white">{supplyAllocation.recommended_delivery_mode.replace(/_/g, " ")}</strong>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Compass className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400">Hub:</span>
              <span className="text-white truncate max-w-[200px]">{supplyAllocation.staging_hub}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>ETA: ~{supplyAllocation.eta_hours}h</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-mono leading-relaxed pl-1">
            ↳ {supplyAllocation.rationale}
          </p>
        </div>
      )}

      {/* 3. Tactical Dispatch Recommendations */}
      {dispatchRecommendation && (
        <div className="p-4 rounded-xl bg-[#11141D] border border-white/10 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                TACTICAL EMERGENCY DISPATCH QUEUE
              </h4>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-slate-400">PRIORITY:</span>
              <span className="text-red-400 font-bold text-sm">
                {dispatchRecommendation.priority_score.toFixed(1)}/100
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-mono leading-relaxed bg-[#090C12] p-2.5 rounded-lg border border-white/5">
            {dispatchRecommendation.rationale}
          </p>

          {/* Units Matching & Deployment */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              RECOMMENDED OPERATIONAL ASSETS
            </span>

            {dispatchRecommendation.available_matching_units.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 italic p-3 text-center bg-black/20 rounded-lg">
                All matching specialized units are currently deployed or on-scene.
              </p>
            ) : (
              <div className="space-y-2">
                {dispatchRecommendation.available_matching_units.map((unit) => {
                  const isDispatched = dispatchedUnits.includes(unit.id);
                  return (
                    <div
                      key={unit.id}
                      className="p-3 rounded-lg bg-[#0A0D14] border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-mono">
                            {unit.unit_name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                            {unit.unit_code}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                          <span>Base: {unit.home_base}</span>
                          <span>•</span>
                          <span>Cap: {unit.capacity} personnel</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDispatch(unit.id, dispatchRecommendation.target_sector_id)}
                        disabled={isDispatched}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          isDispatched
                            ? "bg-emerald-600/30 border border-emerald-500 text-emerald-300 cursor-default"
                            : "bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-200 hover:text-white"
                        }`}
                      >
                        {isDispatched ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>DEPLOYED</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>DISPATCH</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
