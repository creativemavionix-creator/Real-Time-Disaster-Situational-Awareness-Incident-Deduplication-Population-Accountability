"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, ShieldAlert, Compass, Radio } from "lucide-react";
import { TacticalAudio } from "@/lib/TacticalAudio";

export default function DoctrinePage() {
  return (
    <div
      className="w-full min-h-screen relative"
      style={{ backgroundColor: "var(--bg-void)", color: "var(--fg-primary)" }}
    >
      {/* Editorial Header / Hero */}
      <section
        className="relative pt-20 pb-16 px-6 sm:px-12 lg:px-20 border-b overflow-hidden"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-base)" }}
      >
        {/* Subtle radial ambient */}
        <div
          aria-hidden
          className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(232,16,58,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-mono-data text-xs uppercase tracking-widest text-rose-400 font-bold">
              OPERATIONAL PHILOSOPHY // DOCTRINE 01
            </span>
          </div>

          <h1
            className="font-display-calm font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white"
            style={{ lineHeight: 1.05, textWrap: "balance" }}
          >
            Silence is Not Safety.
          </h1>

          <blockquote
            className="font-quote-display italic text-xl sm:text-2xl lg:text-3xl text-[#CBD5E1] border-l-2 pl-6 my-6 leading-relaxed pb-1"
            style={{ borderColor: "var(--accent)" }}
          >
            &ldquo;In catastrophic terrain, the absence of distress signals is not evidence of safety. It is direct, empirical evidence that observation channels have been severed.&rdquo;
          </blockquote>

          <p
            className="font-body-prose text-base sm:text-lg text-[#9AAABE] max-w-[65ch] leading-relaxed"
            style={{ textWrap: "pretty" }}
          >
            The fundamental flaw in modern disaster management is not lack of good will or courageous personnel. It is an epistemological trap: systems listen only to those who have the voice to cry out, leaving the most severely wounded communities in complete obscurity.
          </p>
        </div>
      </section>

      {/* Narrative Section 1: The Reporting Bias Trap */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 max-w-5xl mx-auto space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-28">
            <div className="font-mono-data text-xs text-rose-400 uppercase tracking-wider font-bold">
              CHAPTER 01
            </div>
            <h2 className="font-display-calm text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The Reporting Bias Trap
            </h2>
            <div className="h-0.5 w-12 bg-rose-500/50" />
            <p className="font-body-prose text-xs text-[#5C6E84]">
              How computer-aided dispatch queues amplify noise and orphan epicenters.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-6 font-body-prose text-[#CBD5E1] text-base leading-relaxed">
            <p>
              When a natural catastrophe strikes, civil defense command centers light up with activity. Giant LED walls render live maps blinking with pins, heat maps, and incoming emergency telephone logs.
            </p>
            <p>
              Supervisors look at these maps to decide where to send medical convoys, rescue helicopters, and engineering bulldozers. Naturally, they send help where the screens show distress. If Sector A generates 4,000 emergency calls an hour and Sector B generates zero, standard operating procedure dictates rushing every available asset to Sector A.
            </p>
            <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2 my-6">
              <div className="font-mono-data text-xs text-rose-300 font-bold uppercase tracking-wider">
                The Fatal Flaw
              </div>
              <p className="text-sm text-rose-100/90 leading-relaxed m-0">
                This approach assumes that the ability to report damage is independent of the damage itself. In reality, the opposite is true: <strong>the more catastrophic the destruction, the less capable the population is of communicating.</strong>
              </p>
            </div>
            <p>
              In extreme events, the communities nearest the epicenter suffer immediate electrical blackout, cell tower collapse, fiber optic severance, and road burial. They cannot dial 100 or 911. They cannot post photos to social media. They are plunged into absolute silence.
            </p>
          </div>
        </div>

        {/* Narrative Section 2: Case Study: 2015 Gorkha Earthquake */}
        <div className="border-t border-white/10 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-28">
            <div className="font-mono-data text-xs text-[#38BDF8] uppercase tracking-wider font-bold">
              HISTORICAL PRECEDENT
            </div>
            <h2 className="font-display-calm text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Nepal, April 25, 2015
            </h2>
            <div className="h-0.5 w-12 bg-[#38BDF8]/50" />
            <p className="font-body-prose text-xs text-[#5C6E84]">
              11:56 AM local time &bull; Magnitude 7.8 &bull; 8,964 Lives Lost
            </p>
          </div>

          <div className="lg:col-span-8 space-y-6 font-body-prose text-[#CBD5E1] text-base leading-relaxed">
            <p>
              At 11:56 AM on a Saturday, a 150-kilometer stretch of the Main Himalayan Thrust ruptured violently. In Kathmandu Valley, 80 kilometers away, high-rise buildings swayed and boundary walls toppled.
            </p>
            <p>
              Within minutes, Kathmandu’s telecommunications networks were flooded with tens of thousands of simultaneous calls. Worried residents reported hairline drywall fractures, fallen water tanks, and blocked alleyways. Emergency dispatchers, inundated with frantic callers, dispatched police sirens and medical personnel across the city.
            </p>
            <p>
              Meanwhile, at the epicenter in <strong>Barpak, Gorkha</strong>, 92% of all homes were leveled within 45 seconds. The village’s lone cellular repeater lost its grid connection instantly; its backup battery bank was crushed beneath collapsed masonry. Pasang Lhamu highway was cleaved by hundreds of coseismic rockfalls.
            </p>
            <div className="p-6 rounded-2xl bg-[#111620] border border-white/10 space-y-3 font-mono-data text-xs">
              <div className="flex items-center justify-between text-[#9AAABE] border-b border-white/10 pb-2">
                <span>SECTOR LOG COMPARISON</span>
                <span>T+2.0 HOURS POST-RUPTURE</span>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div>
                  <div className="text-white font-bold">Kathmandu Core</div>
                  <div className="text-2xl font-display-calm font-bold text-white mt-1">4,820 calls/hr</div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">82% emergency fleet dispatched</div>
                </div>
                <div>
                  <div className="text-rose-400 font-bold">Barpak Epicenter Ridge</div>
                  <div className="text-2xl font-display-calm font-bold text-rose-300 mt-1">0 calls/hr</div>
                  <div className="text-[11px] text-rose-400 mt-0.5">0 search-and-rescue units dispatched</div>
                </div>
              </div>
            </div>
            <p>
              Because Barpak registered zero calls, emergency dashboards showed it in benign gray. It took nearly 48 hours for the first military foot patrols to physically reach the ridge. In disaster medicine, this is known as the loss of the <strong>Golden 72 Hours</strong>—the window in which trapped victims under collapsed timber and stone can still be recovered alive.
            </p>
          </div>
        </div>

        {/* Narrative Section 3: Negative Evidence as Intelligence */}
        <div className="border-t border-white/10 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-28">
            <div className="font-mono-data text-xs text-emerald-400 uppercase tracking-wider font-bold">
              THE SOLUTION
            </div>
            <h2 className="font-display-calm text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Negative Evidence Intelligence
            </h2>
            <div className="h-0.5 w-12 bg-emerald-500/50" />
            <p className="font-body-prose text-xs text-[#5C6E84]">
              Turning the absence of signals into an active tactical trigger.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-6 font-body-prose text-[#CBD5E1] text-base leading-relaxed">
            <p>
              PRATYAKSH-Ω inverts the reporting model. Instead of waiting for victims to call, the system models <strong>what reality ought to be producing</strong>.
            </p>
            <p>
              Before an earthquake or flood occurs, PRATYAKSH-Ω continuously tracks the expected diurnal rhythm of life in every valley: how many cellular handsets are typically registered, how much electricity substations draw, and how many calls normally occur on a Saturday noon.
            </p>
            <p>
              When physical sensors register intense shaking or river surging, PRATYAKSH-Ω compares the physical reality with the observed communication stream. If a high-vulnerability mountain community with 14,000 residents suddenly drops to <strong>zero calls</strong> during an event that should have triggered hundreds, the system does not assume they are safe.
            </p>
            <p>
              It recognizes this gap as an unambiguous signal of severe infrastructure decapitation. The sector is instantly tagged with a <strong>Critical Blackout Alert</strong>, automatically tasking autonomous aerial drones and prioritizing search-and-rescue convoys before a single human voice escapes the valley.
            </p>
          </div>
        </div>

        {/* The Operational Pledge */}
        <div
          className="p-8 sm:p-12 rounded-3xl border text-center space-y-6 relative overflow-hidden"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-default)",
          }}
        >
          <div className="font-mono-data text-xs text-rose-400 uppercase tracking-widest font-bold">
            THE PRATYAKSH DOCTRINE
          </div>
          <h3 className="font-display-calm text-2xl sm:text-4xl font-extrabold text-white max-w-2xl mx-auto leading-snug">
            We do not wait for the silent to scream. We send help because they are silent.
          </h3>
          <p className="font-body-prose text-sm text-[#9AAABE] max-w-xl mx-auto">
            By reconciling physics with information flow, PRATYAKSH-Ω guarantees that rural, isolated, and destroyed sectors receive first-priority response rather than last-priority neglect.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/scenario"
              onClick={() => TacticalAudio.playClick()}
              className="btn-action-primary flex items-center gap-2 text-xs py-3 px-6 rounded-xl cursor-pointer"
            >
              <span>Walk the Barpak Scenario</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/methodology"
              onClick={() => TacticalAudio.playClick()}
              className="btn-action-secondary flex items-center gap-2 text-xs py-3 px-6 rounded-xl cursor-pointer"
            >
              <span>Explore the Six Capabilities</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
