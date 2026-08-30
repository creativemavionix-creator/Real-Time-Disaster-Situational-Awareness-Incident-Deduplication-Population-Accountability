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
    <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="prism-card p-6 sm:p-8 space-y-6">
        {/* Collapsible Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="prism-badge-cyan">
              <span>⚡</span>
              <span>FIELD TEST CONSOLE // LIVE SIGNAL INJECTION</span>
            </div>
            <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
              Inject Simulated Disaster Signal
            </h3>
            <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Simulate incoming radio, citizen, or hospital reports to test semantic deduplication and real-time matrix updates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-xs font-bold uppercase transition-all border border-slate-200 dark:border-slate-700 cursor-pointer self-start sm:self-auto"
          >
            {isOpen ? "HIDE CONSOLE ▲" : "OPEN CONSOLE ▼"}
          </button>
        </div>

        {isOpen && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6 animate-fade-in">
            {/* Quick Demo Presets */}
            <div className="space-y-2.5">
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold block">
                PRELOAD TEST SIGNALS (ENGLISH & NEPALI):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPreset("police", "Police patrol in Sindhupalchok confirms Melamchi river bridge completely washed away, 2 dead.", "27.9500", "85.7000")}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  [POLICE: SINDHUPALCHOK BRIDGE]
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("hospital", "Kathmandu Hospital trauma update: 14 injured from New Road structural collapse receiving treatment.", "27.7172", "85.3240")}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  [HOSPITAL: KATHMANDU CASUALTIES]
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("police", "गोरखा बारपाकमा ढुङ्गाको घर भत्किएर ३ जनाको मृत्यु र ५ जना घाइते।", "28.0000", "84.6333")}
                  className="bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300 text-xs font-mono px-3 py-1.5 rounded-full border border-cyan-200 dark:border-cyan-800 transition-all cursor-pointer font-semibold"
                >
                  [🇳🇵 नेपाली: गोरखा घर भत्कियो]
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("citizen", "सिन्धुपाल्चोक मेलम्ची बजारमा बाढी पसेर पक्की पुल बगायो, २ जना बेपत्ता।", "27.9500", "85.7000")}
                  className="bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300 text-xs font-mono px-3 py-1.5 rounded-full border border-cyan-200 dark:border-cyan-800 transition-all cursor-pointer font-semibold"
                >
                  [🇳🇵 नेपाली: मेलम्ची बाढी र पुल]
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("citizen", "रसुवा धुन्चेमा भीषण पहिरोले सडक अवरुद्ध, मोबाइल टावर डाउन र सम्पर्कविहीन।", "28.1500", "85.3000")}
                  className="bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-xs font-mono px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800 transition-all cursor-pointer font-semibold"
                >
                  [🇳🇵 नेपाली: रसुवा पहिरो र ब्ल्याकआउट]
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("police", "भक्तपुर दरबार स्क्वायर क्षेत्रमा कुनै क्षति छैन, सबै सुरक्षित, सामान्य अवस्था।", "27.6710", "85.4298")}
                  className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-mono px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer font-semibold"
                >
                  [🇳🇵 नेपाली: भक्तपुर सुरक्षित]
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    SOURCE CHANNEL:
                  </label>
                  <select
                    value={sourceType}
                    onChange={(e: any) => setSourceType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="citizen">CITIZEN SOS (Weight: 0.60)</option>
                    <option value="police">POLICE RADIO (Weight: 0.90)</option>
                    <option value="hospital">HOSPITAL TRIAGE LOG (Weight: 0.95)</option>
                    <option value="social_media">SOCIAL MEDIA FEED (Weight: 0.35)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6 font-mono text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={useCoords}
                      onChange={(e) => setUseCoords(e.target.checked)}
                      className="accent-[#0088A9] w-4 h-4 rounded"
                    />
                    <span>INCLUDE GPS COORDINATES (+0.10 BONUS)</span>
                  </label>
                </div>
              </div>

              {useCoords && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-slate-600 dark:text-slate-400 mb-1">LATITUDE:</label>
                    <input
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-slate-600 dark:text-slate-400 mb-1">LONGITUDE:</label>
                    <input
                      type="text"
                      value={lon}
                      onChange={(e) => setLon(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-mono text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  RAW INCIDENT TEXT (ENGLISH OR NEPALI):
                </label>
                <textarea
                  rows={3}
                  required
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="e.g. Major bridge collapse reported at Melamchi Sindhupalchok, 2 dead, 5 trapped under debris..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 font-body-prose text-xs sm:text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !rawText.trim()}
                  className="btn-primary-cyan text-xs py-2.5 px-6 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "PROCESSING AI PIPELINE..." : "INJECT REPORT [↵]"}
                </button>
              </div>
            </form>

            {/* Results Feedback */}
            {result && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-2xl font-mono text-xs space-y-2">
                <div className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
                  <span>✓</span>
                  <span>REPORT SUCCESSFULLY INGESTED & SCORED</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300 space-y-1 text-[11px]">
                  <div>EXTRACTED SECTOR: <strong className="text-slate-900 dark:text-white">{result.resolved_location_name || result.resolved_location_id || "UNRESOLVED"}</strong></div>
                  <div>DAMAGE TAG: <strong className="text-slate-900 dark:text-white">{result.extracted_damage_type || "NONE"}</strong></div>
                  <div>CASUALTY ESTIMATE: <strong className="text-slate-900 dark:text-white">{result.extracted_casualties ?? "NONE"}</strong></div>
                  <div>RELIABILITY SCORE: <strong className="text-emerald-600 dark:text-emerald-400">{result.score_breakdown?.effective_score?.toFixed(2) ?? "1.00"} / 1.00</strong></div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3.5 rounded-2xl font-mono text-xs text-rose-700 dark:text-rose-300">
                [INJECTION_ERROR]: {error}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
