"use client";

import React, { useEffect, useState } from "react";
import { fetchBeforeAfterShowcase, BeforeAfterShowcaseResponse } from "@/lib/api";

export function BeforeAfterShowcase() {
  const [data, setData] = useState<BeforeAfterShowcaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"after" | "before">("after");
  const [filterSource, setFilterSource] = useState<string>("ALL");

  useEffect(() => {
    fetchBeforeAfterShowcase()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-center font-mono-data text-xs text-[#64748B] dark:text-[#94A3B8] animate-pulse">
        Loading signal triage demonstration...
      </div>
    );
  }

  const filteredRaw = filterSource === "ALL"
    ? data.raw_messages
    : data.raw_messages.filter((m) => m.source === filterSource);

  return (
    <section className="py-12 sm:py-18 border-b border-[#E5E4DC] dark:border-[#232733] px-6 sm:px-12 lg:px-16 bg-[#FAF9F5]/40 dark:bg-[#090B0E]/40">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="font-mono-data text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
              04 // Information Triage &amp; Deduplication
            </div>
            <h2 className="font-display-calm font-extrabold text-2xl sm:text-4xl text-[#0F172A] dark:text-[#F3F4F6] tracking-tight">
              The Before &amp; After Signal Engine
            </h2>
            <p className="font-body-prose text-sm text-[#64748B] dark:text-[#94A3B8] max-w-2xl leading-relaxed">
              Demonstrates 20 unstructured, chaotic raw messages with typos, duplicates, and conflicting casualty counts condensed into 3 verified rescue directives.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 font-display-calm text-xs self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("after")}
              className={`px-4 py-2.5 rounded-xl font-semibold cursor-pointer transition-all ${
                activeTab === "after"
                  ? "bg-[#0F172A] dark:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#090B0E] shadow-sm"
                  : "surface-calm text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F3F4F6]"
              }`}
            >
              After: 3 Synthesized Directives
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("before")}
              className={`px-4 py-2.5 rounded-xl font-semibold cursor-pointer transition-all ${
                activeTab === "before"
                  ? "bg-[#E11D48] text-[#FFFFFF] shadow-sm"
                  : "surface-calm text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F3F4F6]"
              }`}
            >
              Before: 20 Raw Messages
            </button>
          </div>
        </div>

        {/* Compression Metric Strip (Open Editorial Spacing) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-[#E5E4DC] dark:border-[#232733]">
          <div className="space-y-1">
            <span className="font-mono-data text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold tracking-wider block">
              Noise Reduction
            </span>
            <div className="font-display-calm font-extrabold text-2xl text-[#059669] dark:text-[#34D399]">
              85.0%
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">20 inputs &rarr; 3 directives</p>
          </div>

          <div className="space-y-1 md:border-l md:border-[#E5E4DC] md:dark:border-[#232733] md:pl-6">
            <span className="font-mono-data text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold tracking-wider block">
              Duplicates Merged
            </span>
            <div className="font-display-calm font-extrabold text-2xl text-[#2563EB] dark:text-[#60A5FA]">
              {data.duplicate_merged_count} Signals
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">~200m spatial-semantic radius</p>
          </div>

          <div className="space-y-1 sm:border-l sm:border-[#E5E4DC] sm:dark:border-[#232733] sm:pl-6">
            <span className="font-mono-data text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold tracking-wider block">
              Time-Decay Filtered
            </span>
            <div className="font-display-calm font-extrabold text-2xl text-[#D97706] dark:text-[#FBBF24]">
              {data.time_decay_filtered_count} Stale Logs
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">&gt;6h without corroboration</p>
          </div>

          <div className="space-y-1 md:border-l md:border-[#E5E4DC] md:dark:border-[#232733] md:pl-6">
            <span className="font-mono-data text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold tracking-wider block">
              Entity Auto-Matches
            </span>
            <div className="font-display-calm font-extrabold text-2xl text-[#0F172A] dark:text-[#F3F4F6]">
              {data.population_auto_matched_count} Reconciled
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Jaro-Winkler score &ge; 0.85</p>
          </div>
        </div>

        {/* AFTER VIEW: 3 Synthesized Actionable Directives */}
        {activeTab === "after" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono-data text-xs">
            {data.condensed_directives.map((task) => (
              <div
                key={task.task_code}
                className="surface-calm p-6 space-y-4 flex flex-col justify-between border-t-3 border-t-[#2563EB]"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-[#E5E4DC] dark:border-[#232733] pb-2">
                    <span className="font-bold text-xs bg-[#0F172A] dark:bg-[#F3F4F6] text-[#FFFFFF] dark:text-[#090B0E] px-2.5 py-0.5 rounded-lg">
                      Rank #{task.rank}
                    </span>
                    <span className="chip-safe text-[10px]">
                      {(task.confidence_score * 100).toFixed(0)}% Confidence
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display-calm font-extrabold text-lg text-[#0F172A] dark:text-[#F3F4F6]">
                      {task.target_location}
                    </h3>
                    <span className="text-[10px] font-bold text-[#E11D48] dark:text-[#FB7185] uppercase block mt-0.5">
                      {task.hazard_type}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F2F0E8]/50 dark:bg-[#10131A]/60 border border-[#E5E4DC] dark:border-[#232733] font-body-prose text-xs text-[#64748B] dark:text-[#94A3B8]">
                    <strong className="font-mono-data text-[10px] text-[#0F172A] dark:text-[#F3F4F6] block mb-1 uppercase font-bold">
                      Condensation Rationale:
                    </strong>
                    {task.ai_synthesis_explanation}
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#2563EB]/5 dark:bg-[#2563EB]/10 border-l-3 border-[#2563EB] space-y-1">
                    <span className="text-[10px] font-bold text-[#2563EB] dark:text-[#60A5FA] uppercase block">
                      Recommended Directive:
                    </span>
                    <p className="font-body-prose text-xs font-semibold text-[#0F172A] dark:text-[#F3F4F6]">
                      {task.recommended_action}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E4DC] dark:border-[#232733] text-[10px] text-[#64748B] dark:text-[#94A3B8] flex justify-between">
                  <span>Deduplicated from {task.deduplicated_inputs_count} raw reports</span>
                  <span className="text-[#2563EB] dark:text-[#60A5FA] font-bold">Task {task.task_code}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BEFORE VIEW: 20 Raw Unstructured Messages */}
        {activeTab === "before" && (
          <div className="space-y-4 font-mono-data text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E4DC] dark:border-[#232733] pb-3">
              <span className="text-[#64748B] dark:text-[#94A3B8] font-bold text-xs uppercase">
                20 Raw Disaster Feeds
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[#64748B] text-[10px]">Filter Source:</span>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="bg-[#FAF9F5] dark:bg-[#090B0E] border border-[#E5E4DC] dark:border-[#232733] rounded-lg p-1.5 text-xs text-[#0F172A] dark:text-[#F3F4F6]"
                >
                  <option value="ALL">All Sources</option>
                  <option value="citizen_sms">Citizen SMS</option>
                  <option value="police_radio">Police Radio</option>
                  <option value="hospital_er">Hospital ER</option>
                  <option value="twitter_feed">Twitter / X</option>
                  <option value="facebook_post">Facebook</option>
                  <option value="shelter_log">Shelter Log</option>
                  <option value="satellite_sar">Satellite SAR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredRaw.map((msg) => (
                <div
                  key={msg.id}
                  className="surface-calm p-4 space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center text-[10px] border-b border-[#E5E4DC] dark:border-[#232733] pb-1.5">
                      <span className="font-bold text-[#2563EB] dark:text-[#60A5FA] uppercase">{msg.source.replace("_", " ")}</span>
                      <span className="text-[#64748B]">+{msg.time_offset_min}m</span>
                    </div>

                    <p className="font-body-prose text-xs text-[#0F172A] dark:text-[#F3F4F6] mt-2 italic">
                      &ldquo;{msg.raw_text}&rdquo;
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E4DC] dark:border-[#232733] space-y-1">
                    <div className="text-[10px] text-[#64748B]">
                      Location: <strong className="text-[#0F172A] dark:text-[#F3F4F6]">{msg.location_hint}</strong>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {msg.noise_flags.map((flag: string, fIdx: number) => (
                        <span key={fIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-[#E11D48] dark:text-[#FB7185] font-semibold">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
