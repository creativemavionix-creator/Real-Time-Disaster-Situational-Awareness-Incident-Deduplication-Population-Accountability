"use client";

import React, { useEffect, useState } from "react";
import {
  fetchPopulationExposure,
  fetchMissingPersons,
  submitMissingPerson,
  AllPopulationExposureResponse,
  MissingPersonItem,
} from "@/lib/api";

export default function PopulationPage() {
  const [exposureData, setExposureData] = useState<AllPopulationExposureResponse | null>(null);
  const [missingPersons, setMissingPersons] = useState<MissingPersonItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formGender, setFormGender] = useState("Male");
  const [formSector, setFormSector] = useState("kathmandu");
  const [formReporter, setFormReporter] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [expRes, mpRes] = await Promise.all([
        fetchPopulationExposure(),
        fetchMissingPersons(searchQuery || undefined, sectorFilter !== "ALL" ? sectorFilter : undefined),
      ]);
      setExposureData(expRes);
      setMissingPersons(mpRes);
    } catch (err: any) {
      setError(err.message || "Failed to load population telemetry");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [searchQuery, sectorFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formReporter.trim()) return;

    setIsSubmitting(true);
    try {
      await submitMissingPerson({
        full_name: formName.trim(),
        age: formAge ? parseInt(formAge) : null,
        gender: formGender,
        last_known_location_id: formSector,
        reported_by: formReporter.trim(),
        contact_number: formContact.trim() || null,
        physical_description: formDesc.trim() || null,
        notes: formNotes.trim() || null,
      });

      setIsModalOpen(false);
      setFormName("");
      setFormAge("");
      setFormReporter("");
      setFormContact("");
      setFormDesc("");
      setFormNotes("");
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to submit missing person report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="border-b-4 border-[#EDEDE8] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
            CAPABILITY 04 // POPULATION EXPOSURE & ACCOUNTABILITY
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-[#EDEDE8]">
            DYNAMIC EXPOSURE & MISSING REGISTRY
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-[#EDEDE8]/70 mt-1 max-w-2xl">
            Replaces static census figures with dynamic real-time population exposure (commuters, seasonal tourists, and evacuees) paired with a searchable National Missing Persons Registry.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] px-5 py-3 font-mono-data text-xs font-bold uppercase tracking-wider transition-colors border-2 border-[#0A0A0A]"
        >
          [+] REPORT MISSING PERSON
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-data text-xs">
        <div className="border-4 border-[#EDEDE8] p-4 bg-[#0A0A0A]">
          <span className="text-[#EDEDE8]/60 text-[10px] block">TOTAL NATIONAL EXPOSED POPULATION</span>
          <strong className="text-2xl text-[#EDEDE8] font-bold">
            {exposureData?.total_national_exposed_population.toLocaleString() || "0"}
          </strong>
        </div>
        <div className="border-4 border-[#E5484D] p-4 bg-[#E5484D]/5">
          <span className="text-[#E5484D] text-[10px] block font-bold">ACTIVE MISSING PERSONS</span>
          <strong className="text-2xl text-[#E5484D] font-bold">
            {missingPersons.filter((m) => m.status === "missing").length}
          </strong>
        </div>
        <div className="border-4 border-[#3FB950] p-4 bg-[#3FB950]/5">
          <span className="text-[#3FB950] text-[10px] block font-bold">LOCATED SAFE / HOSPITALIZED</span>
          <strong className="text-2xl text-[#3FB950] font-bold">
            {missingPersons.filter((m) => m.status !== "missing").length}
          </strong>
        </div>
      </div>

      {error && (
        <div className="bg-[#E5484D]/10 border-2 border-[#E5484D] p-4 font-mono-data text-xs text-[#E5484D]">
          [POPULATION_ERROR]: {error}
        </div>
      )}

      {/* Sector Population Exposure Table */}
      <div className="border-4 border-[#EDEDE8] p-6 bg-[#0A0A0A] space-y-4">
        <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest">
          DYNAMIC SECTOR EXPOSURE MATRIX (CENSUS + COMMUTERS + TOURISTS - EVACUATIONS)
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-data text-xs border-collapse">
            <thead>
              <tr className="bg-[#EDEDE8]/10 border-b-2 border-[#EDEDE8] text-[#EDEDE8]">
                <th className="p-3">SECTOR</th>
                <th className="p-3">CENSUS BASELINE</th>
                <th className="p-3">COMMUTER FLUX</th>
                <th className="p-3">TOURIST DENSITY</th>
                <th className="p-3">EVACUATED</th>
                <th className="p-3 font-bold text-[#FFB800]">REAL-TIME EXPOSED</th>
                <th className="p-3">HIGH DENSITY ZONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEDE8]/20 text-[#EDEDE8]/80">
              {exposureData?.sector_exposures.map((s) => (
                <tr key={s.sector_id} className="hover:bg-[#EDEDE8]/5 transition-colors">
                  <td className="p-3 font-bold uppercase text-[#EDEDE8]">{s.sector_name}</td>
                  <td className="p-3">{s.census_baseline_population.toLocaleString()}</td>
                  <td className="p-3 text-[#FFB800]">
                    {s.diurnal_commuter_flux > 0 ? `+${s.diurnal_commuter_flux.toLocaleString()}` : s.diurnal_commuter_flux.toLocaleString()}
                  </td>
                  <td className="p-3">+{s.tourist_density_estimate.toLocaleString()}</td>
                  <td className="p-3 text-[#3FB950]">-{s.evacuated_population_estimate.toLocaleString()}</td>
                  <td className="p-3 font-bold text-base text-[#EDEDE8]">
                    {s.real_time_exposed_population.toLocaleString()}
                  </td>
                  <td className="p-3 text-[11px] text-[#EDEDE8]/60">
                    {s.high_density_hazard_zones.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Searchable Missing Persons Registry */}
      <div className="border-4 border-[#EDEDE8] p-6 bg-[#0A0A0A] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#EDEDE8]/30 pb-4">
          <div>
            <span className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest block mb-1">
              PERSONNEL ACCOUNTABILITY
            </span>
            <h3 className="font-display text-2xl font-black uppercase text-[#EDEDE8]">
              MISSING PERSONS REGISTRY ({missingPersons.length})
            </h3>
          </div>

          {/* Search Controls */}
          <div className="flex flex-wrap items-center gap-3 font-mono-data text-xs">
            <input
              type="text"
              placeholder="Search by name, reporter, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0A0A0A] border-2 border-[#EDEDE8] p-2 text-[#EDEDE8] font-mono-data text-xs focus:border-[#FFB800] focus:outline-none min-w-[240px]"
            />
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-[#0A0A0A] border-2 border-[#EDEDE8] p-2 text-[#EDEDE8] font-mono-data text-xs focus:border-[#FFB800] focus:outline-none"
            >
              <option value="ALL">ALL SECTORS</option>
              {exposureData?.sector_exposures.map((s) => (
                <option key={s.sector_id} value={s.sector_id}>
                  {s.sector_name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Missing Persons Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {missingPersons.map((p, pIdx) => (
            <div key={`${p.id}-${pIdx}`} className="border-2 border-[#EDEDE8]/40 p-4 bg-[#EDEDE8]/5 space-y-3 font-mono-data text-xs">
              <div className="flex items-center justify-between border-b border-[#EDEDE8]/20 pb-2">
                <div>
                  <strong className="text-sm text-[#EDEDE8] block uppercase font-bold">{p.full_name}</strong>
                  <span className="text-[10px] text-[#EDEDE8]/60">
                    {p.gender || "Unknown"}, {p.age ? `${p.age} yrs` : "Age Unspecified"}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 border text-[10px] font-bold uppercase ${
                    p.status === "missing"
                      ? "border-[#E5484D] text-[#E5484D] bg-[#E5484D]/10"
                      : "border-[#3FB950] text-[#3FB950] bg-[#3FB950]/10"
                  }`}
                >
                  {p.status.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-[#EDEDE8]/80">
                <div>LAST SECTOR: <strong className="text-[#FFB800] uppercase">{p.last_known_location_name}</strong></div>
                <div>REPORTED BY: <strong>{p.reported_by}</strong> ({p.contact_number || "No contact"})</div>
                {p.physical_description && (
                  <div className="text-[10px] text-[#EDEDE8]/70 pt-1">
                    DESC: {p.physical_description}
                  </div>
                )}
              </div>

              {p.matched_hospital_notes && (
                <div className="p-2 border border-[#3FB950]/40 bg-[#3FB950]/10 text-[10px] text-[#3FB950]">
                  ✦ {p.matched_hospital_notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Report Missing Person Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0A]/90 flex items-center justify-center p-4">
          <div className="max-w-xl w-full border-4 border-[#EDEDE8] bg-[#0A0A0A] p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-4 border-[#EDEDE8] pb-3">
              <h3 className="font-display text-2xl font-black uppercase text-[#EDEDE8]">
                REGISTER MISSING PERSON
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-[#EDEDE8] text-[#0A0A0A] px-3 py-1 font-mono-data text-xs font-bold hover:bg-[#FFB800]"
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-mono-data text-xs">
              <div>
                <label className="block text-[#EDEDE8]/70 mb-1">FULL LEGAL NAME *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Aarav Shrestha"
                  className="w-full bg-[#0A0A0A] border-2 border-[#EDEDE8] p-2 text-[#EDEDE8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#EDEDE8]/70 mb-1">AGE</label>
                  <input
                    type="number"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    placeholder="e.g. 29"
                    className="w-full bg-[#0A0A0A] border-2 border-[#EDEDE8] p-2 text-[#EDEDE8]"
                  />
                </div>
                <div>
                  <label className="block text-[#EDEDE8]/70 mb-1">GENDER</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="w-full bg-[#0A0A0A] border-2 border-[#EDEDE8] p-2 text-[#EDEDE8]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#EDEDE8]/70 mb-1">LAST KNOWN SECTOR / DISTRICT *</label>
                <select
                  value={formSector}
                  onChange={(e) => setFormSector(e.target.value)}
                  className="w-full bg-[#0A0A0A] border-2 border-[#EDEDE8] p-2 text-[#EDEDE8]"
                >
                  <option value="kathmandu">Kathmandu</option>
                  <option value="bhaktapur">Bhaktapur</option>
                  <option value="sindhupalchok">Sindhupalchok</option>
                  <option value="dolakha">Dolakha</option>
                  <option value="nuwakot">Nuwakot</option>
                  <option value="gorkha">Gorkha</option>
                  <option value="rasuwa">Rasuwa</option>
                  <option value="sindhuli">Sindhuli</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#EDEDE8]/70 mb-1">REPORTING KIN / AGENCY *</label>
                  <input
                    type="text"
                    required
                    value={formReporter}
                    onChange={(e) => setFormReporter(e.target.value)}
                    placeholder="e.g. Sita Shrestha (Spouse)"
                    className="w-full bg-[#0A0A0A] border-2 border-[#EDEDE8] p-2 text-[#EDEDE8]"
                  />
                </div>
                <div>
                  <label className="block text-[#EDEDE8]/70 mb-1">CONTACT PHONE</label>
                  <input
                    type="text"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="+977-9841234567"
                    className="w-full bg-[#0A0A0A] border-2 border-[#EDEDE8] p-2 text-[#EDEDE8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#EDEDE8]/70 mb-1">PHYSICAL DESCRIPTION / CLOTHING</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Height, clothes, noticeable features..."
                  className="w-full bg-[#0A0A0A] border-2 border-[#EDEDE8] p-2 text-[#EDEDE8]"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#EDEDE8]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border-2 border-[#EDEDE8] p-3 text-[#EDEDE8] hover:bg-[#EDEDE8]/10 uppercase font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] p-3 font-bold uppercase tracking-wider"
                >
                  {isSubmitting ? "SAVING..." : "REGISTER PERSON [↵]"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
