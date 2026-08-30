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
      <div className="p-8 text-center font-mono-data text-xs text-[#5C6270] animate-pulse">
        [INITIALIZING_20_CHAOTIC_INPUTS_SHOWCASE...]
      </div>
    );
  }

  const filteredRaw = filterSource === "ALL"
    ? data.raw_messages
    : data.raw_messages.filter((m) => m.source === filterSource);

  return (
    <section className="py-12 sm:py-16 border-b border-[#E5E4DC] dark:border-[#232733] px-6 sm:px-12 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="font-mono-data text-xs text-[#E11D48] dark:text-[#FB7185] font-bold uppercase tracking-wider">
              PROTOTYPE SHOWCASE // NOISE REDUCTION & TIME-DECAY
            </div>
            <h2 className="font-display-calm font-extrabold text-2xl sm:text-4xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
              The &ldquo;Before &amp; After&rdquo; Signal Engine
            </h2>
            <p className="font-body-prose text-xs sm:text-sm text-[#5C6270] dark:text-[#9CA3AF] max-w-2xl">
              Demonstrates 20 unstructured, chaotic raw messages (with spelling errors, duplicate claims, and conflicting numbers) condensed into 3 verified rescue directives.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 font-mono-data text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("after")}
              className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${
                activeTab === "after"
                  ? "bg-[#2563EB] text-[#FFFFFF] shadow-sm"
                  : "surface-calm text-[#5C6270]"
              }`}
            >
              ✓ AFTER: 3 SYNTHESIZED TASKS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("before")}
              className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${
                activeTab === "before"
                  ? "bg-[#E11D48] text-[#FFFFFF] shadow-sm"
                  : "surface-calm text-[#5C6270]"
              }`}
            >
              ⚠ BEFORE: 20 RAW MESSAGES
            </button>
          </div>
        </div>

        {/* Compression KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-data text-xs">
          <div className="surface-calm p-4">
            <span className="text-[10px] text-[#5C6270] uppercase font-bold block">COMPRESSION RATIO</span>
            <strong className="text-xl text-[#059669] dark:text-[#34D399] font-bold">85.0% REDUCTION</strong>
            <span className="text-[10px] text-[#5C6270] block mt-0.5">20 inputs → 3 directives</span>
          </div>

          <div className="surface-calm p-4">
            <span className="text-[10px] text-[#5C6270] uppercase font-bold block">DUPLICATES MERGED</span>
            <strong className="text-xl text-[#2563EB] dark:text-[#60A5FA] font-bold">{data.duplicate_merged_count} SIGNALS</strong>
            <span className="text-[10px] text-[#5C6270] block mt-0.5">~200m spatial-semantic radius</span>
          </div>

          <div className="surface-calm p-4">
            <span className="text-[10px] text-[#5C6270] uppercase font-bold block">TIME-DECAY FILTERED</span>
            <strong className="text-xl text-[#D97706] dark:text-[#FBBF24] font-bold">{data.time_decay_filtered_count} STALE LOGS</strong>
            <span className="text-[10px] text-[#5C6270] block mt-0.5">&gt;6h without corroboration</span>
          </div>

          <div className="surface-calm p-4">
            <span className="text-[10px] text-[#5C6270] uppercase font-bold block">ENTITY AUTO-MATCHES</span>
            <strong className="text-xl text-[#111318] dark:text-[#F4F4F0] font-bold">{data.population_auto_matched_count} RECONCILED</strong>
            <span className="text-[10px] text-[#5C6270] block mt-0.5">Jaro-Winkler score &gt; 0.85</span>
          </div>
        </div>

        {/* AFTER VIEW: 3 Synthesized Actionable Directives */}
        {activeTab === "after" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono-data text-xs">
            {data.condensed_directives.map((task) => (
              <div
                key={task.task_code}
                className="surface-calm p-6 space-y-4 flex flex-col justify-between border-t-4 border-t-[#2563EB]"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-[#E5E4DC] dark:border-[#232733] pb-2">
                    <span className="font-bold text-xs bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12] px-2.5 py-0.5 rounded-lg">
                      RANK #{task.rank}
                    </span>
                    <span className="chip-safe text-[10px]">
                      {(task.confidence_score * 100).toFixed(0)}% CONFIDENCE
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display-calm font-extrabold text-lg text-[#111318] dark:text-[#F4F4F0]">
                      {task.target_location}
                    </h3>
                    <span className="text-[10px] font-bold text-[#E11D48] dark:text-[#FB7185] uppercase block mt-0.5">
                      {task.hazard_type}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] font-body-prose text-xs text-[#5C6270] dark:text-[#9CA3AF]">
                    <strong className="font-mono-data text-[10px] text-[#111318] dark:text-[#F4F4F0] block mb-1 uppercase font-bold">
                      AI CONDENSATION LOGIC:
                    </strong>
                    {task.ai_synthesis_explanation}
                  </div>

                  <div className="p-3 rounded-lg bg-[#2563EB]/5 dark:bg-[#2563EB]/10 border-l-3 border-[#2563EB] space-y-1">
                    <span className="text-[10px] font-bold text-[#2563EB] dark:text-[#60A5FA] uppercase block">
                      RECOMMENDED OPERATIONAL DIRECTIVE:
                    </span>
                    <p className="font-body-prose text-xs font-semibold text-[#111318] dark:text-[#F4F4F0]">
                      {task.recommended_action}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E4DC] dark:border-[#232733] text-[10px] text-[#5C6270] flex justify-between">
                  <span>Deduplicated from {task.deduplicated_inputs_count} raw signals</span>
                  <span className="text-[#2563EB] dark:text-[#60A5FA] font-bold">TASK #{task.task_code}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BEFORE VIEW: 20 Raw Unstructured Messages */}
        {activeTab === "before" && (
          <div className="space-y-4 font-mono-data text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E4DC] dark:border-[#232733] pb-3">
              <span className="text-[#5C6270] font-bold uppercase">
                SHOWING {filteredRaw.length} RAW NOISY SIGNALS:
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[#5C6270] text-[10px]">FILTER SOURCE:</span>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="bg-[#FAF9F5] dark:bg-[#0C0E12] border border-[#E5E4DC] dark:border-[#232733] rounded-lg p-1.5 text-xs text-[#111318] dark:text-[#F4F4F0]"
                >
                  <option value="ALL">ALL SOURCES</option>
                  <option value="citizen_sms">Citizen SMS</option>
                  <option value="police_radio">Police Radio</option>
                  <option value="hospital_er">Hospital ER</option>
                  <option value="twitter_feed">Twitter / X Feed</option>
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
                      <span className="text-[#5C6270]">+{msg.time_offset_min}m</span>
                    </div>

                    <p className="font-body-prose text-xs text-[#111318] dark:text-[#F4F4F0] mt-2 italic">
                      &ldquo;{msg.raw_text}&rdquo;
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E4DC] dark:border-[#232733] space-y-1">
                    <div className="text-[10px] text-[#5C6270]">
                      Location: <strong className="text-[#111318] dark:text-[#F4F4F0]">{msg.location_hint}</strong>
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
