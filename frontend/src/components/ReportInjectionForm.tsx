"use client";

import React, { useState } from "react";
import { submitReport, ReportItem } from "@/lib/api";

interface ReportInjectionFormProps {
  onReportInjected: () => void;
}

export function ReportInjectionForm({ onReportInjected }: ReportInjectionFormProps) {
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
    <section className="p-6 md:p-12 border-t-rule bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto border-4 border-[#EDEDE8] p-6 md:p-8 bg-[#0A0A0A]">
        {/* Header */}
        <div className="border-b-4 border-[#EDEDE8] pb-4 mb-6">
          <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
            DEMO TOOLING // LIVE REPORT INJECTION
          </div>
          <h3 className="font-display text-2xl sm:text-4xl font-bold uppercase text-[#EDEDE8]">
            INJECT FIELD REPORT
          </h3>
          <p className="font-body-prose text-xs sm:text-sm text-[#EDEDE8]/70 mt-1">
            Test the live AI pipeline: inject a raw incident report, watch the regex extractor parse casualties/damage, sentence-transformers cluster duplicates, and the situation matrix update immediately.
          </p>
        </div>

        {/* Quick Demo Presets */}
        <div className="mb-6">
          <span className="font-mono-data text-[10px] text-[#EDEDE8]/60 uppercase font-bold block mb-2">
            PRELOAD TEST SIGNALS:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPreset("police", "Police patrol in Sindhupalchok confirms Melamchi river bridge completely washed away, 2 dead.", "27.9500", "85.7000")}
              className="bg-[#EDEDE8]/10 hover:bg-[#EDEDE8] hover:text-[#0A0A0A] text-[#EDEDE8] text-xs font-mono-data px-3 py-1.5 border border-[#EDEDE8]/40 transition-colors uppercase"
            >
              [POLICE: SINDHUPALCHOK BRIDGE COLLAPSE]
            </button>
            <button
              type="button"
              onClick={() => setPreset("hospital", "Kathmandu Hospital trauma update: 14 injured from New Road structural collapse receiving treatment.", "27.7172", "85.3240")}
              className="bg-[#EDEDE8]/10 hover:bg-[#EDEDE8] hover:text-[#0A0A0A] text-[#EDEDE8] text-xs font-mono-data px-3 py-1.5 border border-[#EDEDE8]/40 transition-colors uppercase"
            >
              [HOSPITAL: KATHMANDU CASUALTIES]
            </button>
            <button
              type="button"
              onClick={() => setPreset("social_media", "Black smoke rising over Thamel Kathmandu! Huge fire spreading after tremor!", undefined, undefined)}
              className="bg-[#EDEDE8]/10 hover:bg-[#EDEDE8] hover:text-[#0A0A0A] text-[#EDEDE8] text-xs font-mono-data px-3 py-1.5 border border-[#EDEDE8]/40 transition-colors uppercase"
            >
              [SOCIAL: THAMEL FIRE RUMOR]
            </button>
            <button
              type="button"
              onClick={() => setPreset("police", "Bhaktapur municipal engineers inspected all historical monuments: 0 casualties, completely safe and operational.", "27.6710", "85.4298")}
              className="bg-[#EDEDE8]/10 hover:bg-[#EDEDE8] hover:text-[#0A0A0A] text-[#EDEDE8] text-xs font-mono-data px-3 py-1.5 border border-[#EDEDE8]/40 transition-colors uppercase"
            >
              [POLICE: BHAKTAPUR ALL CLEAR]
            </button>
          </div>
        </div>

        {/* Injection Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Source Type Selector */}
          <div>
            <label className="font-mono-data text-xs text-[#EDEDE8] uppercase font-bold block mb-2">
              SOURCE TYPE (GOVERNS INITIAL TRUST WEIGHT):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-data text-xs">
              {(["hospital", "police", "citizen", "social_media"] as const).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSourceType(src)}
                  className={`p-3 font-bold uppercase border-2 transition-colors ${
                    sourceType === src
                      ? "bg-[#FFB800] text-[#0A0A0A] border-[#FFB800]"
                      : "bg-[#0A0A0A] text-[#EDEDE8] border-[#EDEDE8]/30 hover:border-[#EDEDE8]"
                  }`}
                >
                  {src.replace("_", " ")}
                  <span className="block text-[10px] opacity-75">
                    {src === "hospital" ? "WT: 0.95" : src === "police" ? "WT: 0.90" : src === "citizen" ? "WT: 0.60" : "WT: 0.35"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Coordinates Toggle */}
          <div className="border border-[#EDEDE8]/20 p-3 bg-[#EDEDE8]/5">
            <div className="flex items-center gap-3">
              <input
                id="coords-toggle"
                type="checkbox"
                checked={useCoords}
                onChange={(e) => setUseCoords(e.target.checked)}
                className="w-4 h-4 accent-[#FFB800]"
              />
              <label htmlFor="coords-toggle" className="font-mono-data text-xs font-bold text-[#EDEDE8] cursor-pointer">
                ATTACH RAW GPS COORDINATES (+0.10 RELIABILITY BONUS)
              </label>
            </div>

            {useCoords && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#EDEDE8]/20 font-mono-data text-xs">
                <div>
                  <label className="block text-[#EDEDE8]/70 mb-1">LATITUDE:</label>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full bg-[#0A0A0A] border-2 border-[#EDEDE8] p-2 text-[#EDEDE8] font-mono-data"
                  />
                </div>
                <div>
                  <label className="block text-[#EDEDE8]/70 mb-1">LONGITUDE:</label>
                  <input
                    type="number"
                    step="any"
                    value={lon}
                    onChange={(e) => setLon(e.target.value)}
                    className="w-full bg-[#0A0A0A] border-2 border-[#EDEDE8] p-2 text-[#EDEDE8] font-mono-data"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Raw Text Description */}
          <div>
            <label className="font-mono-data text-xs text-[#EDEDE8] uppercase font-bold block mb-2">
              INCIDENT DESCRIPTION (RAW FIELD TEXT):
            </label>
            <textarea
              required
              rows={3}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g. Landslide blocking Araniko Highway at Melamchi Sindhupalchok, 2 missing..."
              className="w-full bg-[#0A0A0A] border-2 border-[#EDEDE8] p-3 text-[#EDEDE8] font-mono-data text-sm focus:border-[#FFB800] focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !rawText.trim()}
            className="w-full bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] hover:text-[#0A0A0A] p-4 font-mono-data text-sm font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? "TRANSMITTING TO PIPELINE..." : "INJECT REPORT TO BACKEND [↵]"}
          </button>
        </form>

        {/* Error Box */}
        {error && (
          <div className="mt-6 font-mono-data text-xs text-[#E5484D] p-4 border-2 border-[#E5484D] bg-[#E5484D]/10">
            ERROR: {error}
          </div>
        )}

        {/* Ingest Result Success Dossier */}
        {result && (
          <div className="mt-6 border-4 border-[#3FB950] p-4 bg-[#3FB950]/5 font-mono-data text-xs space-y-3">
            <div className="flex items-center justify-between text-[#3FB950] font-bold border-b border-[#3FB950]/30 pb-2">
              <span>REPORT INGESTED & SCORED (ID #{result.id})</span>
              <span>RESOLVED: {result.resolved_location_name || "UNRESOLVED"}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#EDEDE8]">
              <div>DAMAGE TAG: <strong className="text-[#FFB800] uppercase">{result.extracted_damage_type}</strong></div>
              <div>CASUALTIES: <strong className="text-[#E5484D]">{result.extracted_casualties ?? "NONE"}</strong></div>
              <div>RESOLVED BY: <strong>{result.location_resolved_by}</strong></div>
              <div>EFFECTIVE SCORE: <strong className="text-[#3FB950]">{(result.score_breakdown.effective_score * 100).toFixed(1)}%</strong></div>
            </div>

            <div className="bg-[#0A0A0A] p-2 border border-[#EDEDE8]/20 text-[11px] text-[#EDEDE8]/70">
              FORMULA: {result.score_breakdown.formula_explanation}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
