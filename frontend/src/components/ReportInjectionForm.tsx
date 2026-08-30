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
    <section className="py-12 sm:py-16 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full">
      <div className="surface-calm p-6 sm:p-8 space-y-6">
        {/* Collapsible Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-mono-data text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
              FIELD TEST CONSOLE // LIVE SIGNAL INJECTION
            </div>
            <h3 className="font-display-calm font-extrabold text-2xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
              Inject Simulated Disaster Signal
            </h3>
            <p className="font-body-prose text-xs sm:text-sm text-[#5C6270] dark:text-[#9CA3AF]">
              Simulate incoming police radio, citizen SMS, hospital intake, or Devanagari reports to test semantic deduplication and real-time matrix updates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="btn-action-secondary text-xs py-2 px-4 cursor-pointer self-start sm:self-auto"
          >
            {isOpen ? "HIDE CONSOLE ▲" : "OPEN CONSOLE ▼"}
          </button>
        </div>

        {isOpen && (
          <div className="pt-6 border-t border-[#E5E4DC] dark:border-[#232733] space-y-6">
            {/* Quick Demo Presets */}
            <div className="space-y-2.5">
              <span className="font-mono-data text-[11px] text-[#5C6270] uppercase font-bold block">
                PRELOAD TEST SIGNALS (ENGLISH & NEPALI):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPreset("police", "Police patrol in Sindhupalchok confirms Melamchi river bridge completely washed away, 2 dead.", "27.9500", "85.7000")}
                  className="px-3 py-1.5 rounded-lg surface-calm text-xs font-mono-data text-[#5C6270] hover:text-[#111318] dark:hover:text-[#F4F4F0] cursor-pointer"
                >
                  [POLICE: SINDHUPALCHOK BRIDGE]
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("hospital", "Patan Hospital ER received 14 trauma patients from collapsed commercial block in Kathmandu.", "27.6710", "85.3240")}
                  className="px-3 py-1.5 rounded-lg surface-calm text-xs font-mono-data text-[#5C6270] hover:text-[#111318] dark:hover:text-[#F4F4F0] cursor-pointer"
                >
                  [HOSPITAL: PATAN ER INTAKE]
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("citizen", "गोरखा बारपाकमा धेरै घर भत्किएका छन्, १० जना पुरिएका छन्, तत्काल उद्धार टोली चाहियो।", "28.0000", "84.6333")}
                  className="px-3 py-1.5 rounded-lg surface-calm text-xs font-mono-data text-[#D97706] hover:underline cursor-pointer"
                >
                  [NEPALI: GORKHA BARPAK RESCUE]
                </button>
              </div>
            </div>

            {/* Injection Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-mono-data text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#5C6270] font-bold mb-1.5">SOURCE TYPE *</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as any)}
                    className="w-full bg-[#FAF9F5] dark:bg-[#0C0E12] border border-[#E5E4DC] dark:border-[#232733] p-2.5 rounded-lg text-[#111318] dark:text-[#F4F4F0] focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="citizen">Citizen Report (Trust Weight: 0.70)</option>
                    <option value="police">Police Log / First Responder (Trust Weight: 0.90)</option>
                    <option value="hospital">Hospital Triage Admissions (Trust Weight: 0.95)</option>
                    <option value="social_media">Social Media Crowdsource (Trust Weight: 0.30)</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-[#111318] dark:text-[#F4F4F0]">
                    <input
                      type="checkbox"
                      checked={useCoords}
                      onChange={(e) => setUseCoords(e.target.checked)}
                      className="rounded text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span>Attach Exact GPS Coordinates</span>
                  </label>
                </div>
              </div>

              {useCoords && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#5C6270] mb-1">LATITUDE (°N)</label>
                    <input
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full bg-[#FAF9F5] dark:bg-[#0C0E12] border border-[#E5E4DC] dark:border-[#232733] p-2 rounded-lg text-[#111318] dark:text-[#F4F4F0]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5C6270] mb-1">LONGITUDE (°E)</label>
                    <input
                      type="text"
                      value={lon}
                      onChange={(e) => setLon(e.target.value)}
                      className="w-full bg-[#FAF9F5] dark:bg-[#0C0E12] border border-[#E5E4DC] dark:border-[#232733] p-2 rounded-lg text-[#111318] dark:text-[#F4F4F0]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#5C6270] font-bold mb-1.5">RAW REPORT MESSAGE *</label>
                <textarea
                  rows={3}
                  required
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Describe damage, trapped persons, road blockages, or casualty counts..."
                  className="w-full bg-[#FAF9F5] dark:bg-[#0C0E12] border border-[#E5E4DC] dark:border-[#232733] p-3 rounded-lg text-[#111318] dark:text-[#F4F4F0] font-body-prose text-xs focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !rawText.trim()}
                  className="btn-action-primary text-xs py-2.5 px-6 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "PROCESSING SIGNAL..." : "INJECT SIGNAL [↵]"}
                </button>
              </div>
            </form>

            {/* Results Feedback */}
            {result && (
              <div className="p-4 rounded-xl bg-[#059669]/10 border border-[#059669]/30 text-xs font-mono-data text-[#059669] dark:text-[#34D399] space-y-1">
                <div className="font-bold">✓ SIGNAL INGESTED & FUSED (ID #{result.id})</div>
                <div>Extracted Location: <strong>{result.resolved_location_name || result.resolved_location_id || "Central Nepal"}</strong> | Extracted Damage: <strong>{result.extracted_damage_type || "structural"}</strong></div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs font-mono-data text-[#E11D48]">
                [INJECTION_ERROR]: {error}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
