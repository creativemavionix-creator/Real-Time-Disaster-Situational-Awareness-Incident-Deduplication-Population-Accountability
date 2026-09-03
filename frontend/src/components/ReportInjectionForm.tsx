"use client";

import React, { useState } from "react";
import { submitReport, ReportItem } from "@/lib/api";
import { Radio, Send, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface ReportInjectionFormProps {
  onReportInjected?: () => void;
}

export function ReportInjectionForm({ onReportInjected }: ReportInjectionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sourceType, setSourceType] = useState<"citizen" | "police" | "hospital" | "social_media">("citizen");
  const [rawText, setRawText] = useState("");
  const [useCoords, setUseCoords] = useState(false);
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ReportItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const res = await submitReport({
        source_type: sourceType,
        raw_text: rawText.trim(),
        reported_lat: useCoords && lat ? parseFloat(lat) : undefined,
        reported_lon: useCoords && lon ? parseFloat(lon) : undefined,
      });

      setResult(res);
      setRawText("");
      if (onReportInjected) onReportInjected();
    } catch (err: any) {
      setError(err.message || "Failed to inject report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const setPreset = (type: "citizen" | "police" | "hospital", text: string, pLat?: string, pLon?: string) => {
    setSourceType(type);
    setRawText(text);
    if (pLat && pLon) {
      setUseCoords(true);
      setLat(pLat);
      setLon(pLon);
    } else {
      setUseCoords(false);
    }
  };

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      <div className="surface-calm p-6 sm:p-8 space-y-6">
        {/* Collapsible Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-mono-data text-[10px] text-[#60A5FA] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
              FIELD TEST CONSOLE // LIVE SIGNAL INJECTION
            </div>
            <h3 className="font-display-calm font-medium text-2xl text-white tracking-tight">
              Inject Simulated Disaster Signal
            </h3>
            <p className="font-body-prose text-xs text-[#94A3B8]">
              Simulate incoming police radio, citizen SMS, hospital intake, or Devanagari reports to test semantic deduplication and real-time matrix updates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="btn-action-secondary text-xs py-2 px-4 cursor-pointer self-start sm:self-auto flex items-center gap-2 rounded-xl"
          >
            <span>{isOpen ? "Hide Console" : "Open Console"}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isOpen && (
          <div className="pt-6 border-t border-white/10 space-y-6">
            {/* Quick Demo Presets */}
            <div className="space-y-2.5">
              <span className="font-mono-data text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">
                PRELOAD TEST SIGNALS (ENGLISH &amp; NEPALI):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPreset("police", "Police patrol in Sindhupalchok confirms Melamchi river bridge completely washed away, 2 dead.", "27.9500", "85.7000")}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/10 text-xs font-mono-data text-[#94A3B8] hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  [POLICE: SINDHUPALCHOK BRIDGE]
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("hospital", "Patan Hospital ER received 14 trauma patients from collapsed commercial block in Kathmandu.", "27.6710", "85.3240")}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/10 text-xs font-mono-data text-[#94A3B8] hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  [HOSPITAL: PATAN ER INTAKE]
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("citizen", "गोरखा बारपाकमा धेरै घर भत्किएका छन्, १० जना पुरिएका छन्, तत्काल उद्धार टोली चाहियो।", "28.0000", "84.6333")}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono-data text-[#FBBF24] hover:bg-amber-500/20 cursor-pointer"
                >
                  [NEPALI: GORKHA BARPAK RESCUE]
                </button>
              </div>
            </div>

            {/* Injection Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-mono-data text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#94A3B8] text-[10px] uppercase font-bold mb-1.5 tracking-wider">SOURCE TYPE *</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none"
                  >
                    <option value="citizen">Citizen Report (Trust Weight: 0.70)</option>
                    <option value="police">Police Log / First Responder (Trust Weight: 0.90)</option>
                    <option value="hospital">Hospital Triage Admissions (Trust Weight: 0.95)</option>
                    <option value="social_media">Social Media Crowdsource (Trust Weight: 0.30)</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={useCoords}
                      onChange={(e) => setUseCoords(e.target.checked)}
                      className="rounded text-[#3B82F6] focus:ring-[#3B82F6]"
                    />
                    <span>Attach Exact GPS Coordinates</span>
                  </label>
                </div>
              </div>

              {useCoords && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#64748B] text-[10px] uppercase mb-1">LATITUDE (°N)</label>
                    <input
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-2 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#64748B] text-[10px] uppercase mb-1">LONGITUDE (°E)</label>
                    <input
                      type="text"
                      value={lon}
                      onChange={(e) => setLon(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-2 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#94A3B8] text-[10px] uppercase font-bold mb-1.5 tracking-wider">RAW REPORT MESSAGE *</label>
                <textarea
                  rows={3}
                  required
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Describe damage, trapped persons, road blockages, or casualty counts..."
                  className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white font-body-prose text-xs focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !rawText.trim()}
                  className="btn-action-primary text-xs py-2.5 px-6 rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Processing Signal..." : "Inject Signal [↵]"}
                </button>
              </div>
            </form>

            {/* Results Feedback */}
            {result && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono-data text-[#34D399] space-y-1">
                <div className="font-bold">✓ SIGNAL INGESTED &amp; FUSED (ID #{result.id})</div>
                <div>Extracted Location: <strong>{result.resolved_location_name || result.resolved_location_id || "Central Nepal"}</strong> | Extracted Damage: <strong>{result.extracted_damage_type || "structural"}</strong></div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-mono-data text-[#FB7185]">
                [INJECTION_ERROR]: {error}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
