"use client";

import React from "react";

interface FailureMode {
  icon: string;
  bgColor: string;
  textColor: string;
  title: string;
  description: string;
}

const FAILURE_MODES: FailureMode[] = [
  {
    icon: "layers",
    bgColor: "bg-cyan-500",
    textColor: "text-cyan-500",
    title: "Fragmented Information",
    description: "Reports arrive from hundreds of uncoordinated citizens, field personnel, and agencies with incomplete context and inconsistent formatting.",
  },
  {
    icon: "repeat",
    bgColor: "bg-indigo-500",
    textColor: "text-indigo-500",
    title: "Contradictory Reports",
    description: "Different sources describe completely different realities for the same location, confusing emergency responders.",
  },
  {
    icon: "wifi-off",
    bgColor: "bg-purple-500",
    textColor: "text-purple-500",
    title: "Silent Regions",
    description: "The most dangerous location may be the place from which no information is arriving due to infrastructure destruction.",
  },
  {
    icon: "clock",
    bgColor: "bg-amber-500",
    textColor: "text-amber-500",
    title: "Delayed Decisions",
    description: "Uncertainty causes emergency operation centers to freeze or misallocate life-saving rescue resources during the critical 24-hour window.",
  },
];

export function CriticalFailureModes() {
  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-10">
        <div className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
          CRITICAL FAILURE MODES
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          The Disaster Is Not Always the Only Crisis.
        </h2>
        <p className="font-body-prose text-sm sm:text-base text-slate-600 dark:text-slate-400">
          After a major disaster, authorities may receive hundreds of reports but still lack a reliable understanding of what is actually happening.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FAILURE_MODES.map((mode, idx) => (
          <div
            key={idx}
            className="prism-card p-6 sm:p-7 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Icon Container */}
              <div
                className={`w-12 h-12 rounded-2xl ${mode.bgColor} text-white flex items-center justify-center shadow-md`}
              >
                {mode.icon === "layers" && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )}
                {mode.icon === "repeat" && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                )}
                {mode.icon === "wifi-off" && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L3 3m5.636 5.636a9 9 0 0112.728 0M1.393 9.393a15 15 0 0121.214 0M6 18l6-6-6-6" />
                  </svg>
                )}
                {mode.icon === "clock" && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                {mode.title}
              </h3>

              <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {mode.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
