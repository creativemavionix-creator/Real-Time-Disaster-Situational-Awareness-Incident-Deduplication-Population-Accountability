"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function DeduplicationStory() {
  const [activeTab, setActiveTab] = useState<"divergent" | "converged">("converged");

  return (
    <section className="py-16 sm:py-24 border-b border-[#E5E4DC] dark:border-[#232733] px-6 sm:px-12 lg:px-16">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="space-y-3 max-w-3xl">
          <div className="font-mono-data text-xs text-[#D97706] dark:text-[#FBBF24] font-bold uppercase tracking-wider">
            04 // UNIFIED TRUTH & ENTITY RESOLUTION
          </div>
          <h2 className="font-display-calm font-extrabold text-3xl sm:text-5xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
            What Do We Actually Know?
          </h2>
          <p className="font-body-prose text-sm sm:text-base text-[#5C6270] dark:text-[#9CA3AF] leading-relaxed">
            During disasters, the same building collapse is reported by social media with 50 claimed casualties, by police with 12, and by hospital triage with 8. PRISM semantically clusters reports into a single unified truth ledger.
          </p>
        </div>

        {/* Interactive Convergence Visualizer */}
        <div className="surface-calm p-6 sm:p-10 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E4DC] dark:border-[#232733] pb-4">
            <div className="font-mono-data text-xs text-[#5C6270] dark:text-[#9CA3AF]">
              INCIDENT ENTITY RESOLUTION PIPELINE
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("divergent")}
                type="button"
                className={`px-3 py-1.5 rounded-lg font-mono-data text-xs font-semibold transition-colors ${
                  activeTab === "divergent"
                    ? "bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12]"
                    : "text-[#5C6270] hover:bg-[#F2F0E8] dark:hover:bg-[#1A1E27]"
                }`}
              >
                4 FRAGMENTED SIGNALS
              </button>
              <button
                onClick={() => setActiveTab("converged")}
                type="button"
                className={`px-3 py-1.5 rounded-lg font-mono-data text-xs font-semibold transition-colors ${
                  activeTab === "converged"
                    ? "bg-[#2563EB] text-[#FFFFFF]"
                    : "text-[#5C6270] hover:bg-[#F2F0E8] dark:hover:bg-[#1A1E27]"
                }`}
              >
                1 UNIFIED CONSENSUS [✓]
              </button>
            </div>
          </div>

          {activeTab === "divergent" ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div className="p-4 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] space-y-2 font-mono-data text-xs">
                <div className="flex justify-between text-[10px] text-[#5C6270]">
                  <span className="font-bold text-[#E11D48]">POLICE LOG</span>
                  <span>T+1.2h</span>
                </div>
                <p className="font-body-prose text-xs text-[#111318] dark:text-[#F4F4F0]">
                  &quot;Commercial block collapsed at Chautara bazaar. 14 people reported trapped under concrete slabs.&quot;
                </p>
                <div className="text-[10px] text-[#5C6270] pt-2 border-t border-[#E5E4DC] dark:border-[#232733]">
                  Weight: <strong>0.90</strong> • Casualties: <strong>14</strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] space-y-2 font-mono-data text-xs">
                <div className="flex justify-between text-[10px] text-[#5C6270]">
                  <span className="font-bold text-[#2563EB]">HOSPITAL TRIAGE</span>
                  <span>T+1.8h</span>
                </div>
                <p className="font-body-prose text-xs text-[#111318] dark:text-[#F4F4F0]">
                  &quot;Sindhupalchok District Hospital admits 8 trauma victims from bazaar building collapse.&quot;
                </p>
                <div className="text-[10px] text-[#5C6270] pt-2 border-t border-[#E5E4DC] dark:border-[#232733]">
                  Weight: <strong>0.95</strong> • Casualties: <strong>8</strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] space-y-2 font-mono-data text-xs">
                <div className="flex justify-between text-[10px] text-[#5C6270]">
                  <span className="font-bold text-[#D97706]">CITIZEN SMS</span>
                  <span>T+2.1h</span>
                </div>
                <p className="font-body-prose text-xs text-[#111318] dark:text-[#F4F4F0]">
                  &quot;Need ambulance in Chautara main road. Storefront fell down, many people crying.&quot;
                </p>
                <div className="text-[10px] text-[#5C6270] pt-2 border-t border-[#E5E4DC] dark:border-[#232733]">
                  Weight: <strong>0.70</strong> • Casualties: <strong>~10</strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F2F0E8]/60 dark:bg-[#13161D]/60 border border-[#E5E4DC] dark:border-[#232733] space-y-2 font-mono-data text-xs">
                <div className="flex justify-between text-[10px] text-[#5C6270]">
                  <span className="font-bold text-[#5C6270]">SOCIAL MEDIA</span>
                  <span>T+2.4h</span>
                </div>
                <p className="font-body-prose text-xs text-[#111318] dark:text-[#F4F4F0]">
                  &quot;Over 50 people dead in Sindhupalchok bazaar! Entire town flattened please send army helicopter!&quot;
                </p>
                <div className="text-[10px] text-[#5C6270] pt-2 border-t border-[#E5E4DC] dark:border-[#232733]">
                  Weight: <strong>0.30</strong> • Claim: <strong>50 (Hyperbolic)</strong>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl bg-[#2563EB]/5 dark:bg-[#2563EB]/10 border border-[#2563EB]/30 space-y-4 font-mono-data text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2563EB]/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#111318] dark:text-[#F4F4F0]">
                    RESOLVED INCIDENT CLUSTER #104 // CHAUTARA BAZAAR
                  </span>
                  <span className="chip-safe">94% CONFIDENCE</span>
                </div>

                <div className="text-xs text-[#059669] dark:text-[#34D399] font-bold">
                  CONSENSUS ESTIMATE: 14 CASUALTIES (±3)
                </div>
              </div>

              <blockquote className="font-body-prose text-sm text-[#111318] dark:text-[#F4F4F0] italic">
                &ldquo;Major structural collapse of 3-story commercial block on Chautara Main Road. Reconciled across Police (0.90), Hospital Triage (0.95), and 3 citizen corroborations. Social media claim of 50 discounted as low-trust outlier.&rdquo;
              </blockquote>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] text-[#5C6270] dark:text-[#9CA3AF]">
                <div>FUSED SIGNALS: <strong className="text-[#111318] dark:text-[#F4F4F0]">4 Sources</strong></div>
                <div>SATELLITE SAR: <strong className="text-[#059669]">CORROBORATED</strong></div>
                <div>DISPUTE RANGE: <strong className="text-[#D97706]">[8 — 14]</strong></div>
                <div>STATUS: <strong className="text-[#2563EB]">ACTIONABLE FOR SAR</strong></div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
