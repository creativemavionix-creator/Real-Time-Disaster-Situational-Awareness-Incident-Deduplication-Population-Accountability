"use client";

import React from "react";
import Link from "next/link";

export function TacticalDispatchStory() {
  const steps = [
    {
      code: "01",
      title: "OBSERVE",
      desc: "Ingest multi-agency police logs, hospital triage counts, citizen SMS, and satellite SAR imagery.",
      chip: "Multi-Source",
    },
    {
      code: "02",
      title: "UNDERSTAND",
      desc: "Deduplicate overlapping claims, filter hyperbole, and compute Bayesian negative-evidence inferred risk.",
      chip: "AI Consensus",
    },
    {
      code: "03",
      title: "DECIDE",
      desc: "Rank strategic sectors by life-safety peril, population exposure, and structural collapse fragility.",
      chip: "Priority Engine",
    },
    {
      code: "04",
      title: "RESPOND",
      desc: "Deploy Urban SAR Battalions, Air Ambulances, and Heavy Hydraulic Excavators directly to high-need zones.",
      chip: "Tactical Dispatch",
    },
  ];

  return (
    <section className="py-16 sm:py-24 border-b border-[#E5E4DC] dark:border-[#232733] px-6 sm:px-12 lg:px-16 bg-[#F2F0E8]/40 dark:bg-[#13161D]/40">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="font-mono-data text-xs text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
              07 // OPERATIONAL WORKFLOW
            </div>
            <h2 className="font-display-calm font-extrabold text-3xl sm:text-5xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
              What Should Happen Next?
            </h2>
            <p className="font-body-prose text-sm sm:text-base text-[#5C6270] dark:text-[#9CA3AF] leading-relaxed">
              From the chaos of initial report fragments to concrete rescue deployment orders. <strong className="text-white">PRATYAKSH-Ω</strong> bridges the gap between raw unstructured data and military-grade decision velocity.
            </p>
          </div>

          <Link
            href="/dispatch"
            className="btn-action-primary text-xs py-2.5 px-5 self-start md:self-auto"
          >
            <span>OPEN DISPATCH CONSOLE</span>
            <span>→</span>
          </Link>
        </div>

        {/* 4 Steps Editorial Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono-data">
          {steps.map((step) => (
            <div
              key={step.code}
              className="surface-calm p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E4DC] dark:border-[#232733] pb-3">
                  <span className="font-display-calm font-extrabold text-2xl text-[#111318] dark:text-[#F4F4F0]">
                    {step.code}
                  </span>
                  <span className="chip-neutral text-[10px]">{step.chip}</span>
                </div>

                <div className="font-display-calm font-bold text-lg text-[#111318] dark:text-[#F4F4F0]">
                  {step.title}
                </div>

                <p className="font-body-prose text-xs text-[#5C6270] dark:text-[#9CA3AF] leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-2 text-[10px] text-[#2563EB] dark:text-[#60A5FA] font-bold uppercase tracking-wider">
                → PHASE {step.code} VERIFIED
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
