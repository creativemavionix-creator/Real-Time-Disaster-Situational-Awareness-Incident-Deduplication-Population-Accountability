"use client";

import React, { useState } from "react";
import { submitReport, ReportItem } from "@/lib/api";

interface ReportInjectionFormProps {
  onReportInjected: () => void;
}

export function ReportInjectionForm({ onReportInjected }: ReportInjectionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sourceType, setSourceType] = useState<"citizen" | "police" | "hospital" | "social_media">("citizen");
  const [rawText, setRawText] = useState("");
  const [useCoords, setUseCoords] = useState(false);
  const [lat, setLat] = useState("27.7172");
  const [lon, setLon] = useState("85.3240");
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
      const rep = await submitReport({
        source_type: sourceType,
        raw_text: rawText.trim(),
        reported_lat: useCoords ? parseFloat(lat) : null,
        reported_lon: useCoords ? parseFloat(lon) : null,
      });

      setResult(rep);
      setRawText("");
      onReportInjected();
    } catch (err: any) {
      setError(err.message || "Failed to inject report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const setPreset = (src: "citizen" | "police" | "hospital" | "social_media", text: string, pLat?: string, pLon?: string) => {
    setSourceType(src);
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
    <section className="p-6 sm:p-10 lg:p-14 border-t border-[#EDEDE8]/10 bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto surface-card p-6 sm:p-8">
        {/* Collapsible Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
              FIELD TEST CONSOLE // LIVE REPORT INJECTION
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#EDEDE8]">
              INJECT DISASTER SIGNAL
            </h3>
            <p className="font-body-prose text-xs text-[#EDEDE8]/70 mt-0.5">
              Simulate incoming radio, citizen, or hospital reports to test semantic deduplication and real-time matrix updates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 bg-[#EDEDE8]/10 hover:bg-[#EDEDE8] hover:text-[#0A0A0A] font-mono-data text-xs font-bold uppercase transition-colors border border-[#EDEDE8]/20 cursor-pointer self-start sm:self-auto"
          >
            {isOpen ? "HIDE CONSOLE ▲" : "OPEN CONSOLE ▼"}
          </button>
        </div>

        {isOpen && (
          <div className="mt-6 pt-6 border-t border-[#EDEDE8]/10 space-y-6 animate-fade-in">
            {/* Quick Demo Presets */}
            <div>
              <span className="font-mono-data text-[10px] text-[#EDEDE8]/50 uppercase font-bold block mb-2">
                PRELOAD TEST SIGNALS:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPreset("police", "Police patrol in Sindhupalchok confirms Melamchi river bridge completely washed away, 2 dead.", "27.9500", "85.7000")}
                  className="bg-[#EDEDE8]/5 hover:bg-[#EDEDE8]/15 text-[#EDEDE8] text-xs font-mono-data px-2.5 py-1 border border-[#EDEDE8]/20 transition-colors cursor-pointer"
                >
                  [POLICE: SINDHUPALCHOK BRIDGE COLLAPSE]
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("hospital", "Kathmandu Hospital trauma update: 14 injured from New Road structural collapse receiving treatment.", "27.7172", "85.3240")}
                  className="bg-[#EDEDE8]/5 hover:bg-[#EDEDE8]/15 text-[#EDEDE8] text-xs font-mono-data px-2.5 py-1 border border-[#EDEDE8]/20 transition-colors cursor-pointer"
                >
                  [HOSPITAL: KATHMANDU CASUALTIES]
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("social_media", "Black smoke rising over Thamel Kathmandu! Huge fire spreading after tremor!", undefined, undefined)}
                  className="bg-[#EDEDE8]/5 hover:bg-[#EDEDE8]/15 text-[#EDEDE8] text-xs font-mono-data px-2.5 py-1 border border-[#EDEDE8]/20 transition-colors cursor-pointer"
                >
                  [SOCIAL: THAMEL FIRE RUMOR]
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono-data text-xs text-[#EDEDE8]/70 mb-1">
                    SOURCE CHANNEL:
                  </label>
                  <select
                    value={sourceType}
                    onChange={(e: any) => setSourceType(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#EDEDE8]/30 p-2.5 text-[#EDEDE8] font-mono-data text-xs focus:border-[#FFB800] focus:outline-none"
                  >
                    <option value="citizen">CITIZEN SOS (Weight: 0.60)</option>
                    <option value="police">POLICE RADIO (Weight: 0.90)</option>
                    <option value="hospital">HOSPITAL TRIAGE LOG (Weight: 0.95)</option>
                    <option value="social_media">SOCIAL MEDIA FEED (Weight: 0.35)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6 font-mono-data text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-[#EDEDE8]/80">
                    <input
                      type="checkbox"
                      checked={useCoords}
                      onChange={(e) => setUseCoords(e.target.checked)}
                      className="accent-[#FFB800]"
                    />
                    <span>INCLUDE GPS COORDINATES (+0.10 BONUS)</span>
                  </label>
                </div>
              </div>

              {useCoords && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono-data text-xs text-[#EDEDE8]/70 mb-1">LATITUDE:</label>
                    <input
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#EDEDE8]/30 p-2 text-[#EDEDE8] font-mono-data text-xs focus:border-[#FFB800] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono-data text-xs text-[#EDEDE8]/70 mb-1">LONGITUDE:</label>
                    <input
                      type="text"
                      value={lon}
                      onChange={(e) => setLon(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#EDEDE8]/30 p-2 text-[#EDEDE8] font-mono-data text-xs focus:border-[#FFB800] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-mono-data text-xs text-[#EDEDE8]/70 mb-1">
                  RAW INCIDENT TEXT:
                </label>
                <textarea
                  rows={3}
                  required
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="e.g. Major bridge collapse reported at Melamchi Sindhupalchok, 2 dead, 5 trapped under debris..."
                  className="w-full bg-[#0A0A0A] border border-[#EDEDE8]/30 p-3 text-[#EDEDE8] font-body-prose text-xs focus:border-[#FFB800] focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !rawText.trim()}
                  className="px-6 py-2.5 bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] font-mono-data text-xs font-bold uppercase transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "PROCESSING AI PIPELINE..." : "INJECT REPORT [↵]"}
                </button>
              </div>
            </form>

            {/* Results Feedback */}
            {result && (
              <div className="bg-[#3FB950]/10 border border-[#3FB950]/40 p-4 font-mono-data text-xs space-y-2">
                <div className="text-[#3FB950] font-bold">
                  ✓ REPORT SUCCESSFULLY INGESTED & SCORED
                </div>
                <div className="text-[#EDEDE8]/80 space-y-1 text-[11px]">
                  <div>EXTRACTED SECTOR: <strong className="text-[#EDEDE8]">{result.resolved_location_name || result.resolved_location_id || "UNRESOLVED"}</strong></div>
                  <div>DAMAGE TAG: <strong className="text-[#EDEDE8]">{result.extracted_damage_type || "NONE"}</strong></div>
                  <div>CASUALTY ESTIMATE: <strong className="text-[#EDEDE8]">{result.extracted_casualties ?? "NONE"}</strong></div>
                  <div>RELIABILITY SCORE: <strong className="text-[#3FB950]">{result.score_breakdown?.effective_score?.toFixed(2) ?? "1.00"} / 1.00</strong></div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-[#E5484D]/10 border border-[#E5484D] p-3 font-mono-data text-xs text-[#E5484D]">
                [INJECTION_ERROR]: {error}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
