"use client";

import React, { useEffect, useState } from "react";
import {
  fetchPopulationExposure,
  fetchMissingPersons,
  submitMissingPerson,
  AllPopulationExposureResponse,
  PopulationExposureItem,
  MissingPersonItem,
} from "@/lib/api";

export default function PopulationPage() {
  const [exposureData, setExposureData] = useState<AllPopulationExposureResponse | null>(null);
  const [missingPersons, setMissingPersons] = useState<MissingPersonItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for registering missing person
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [sectorId, setSectorId] = useState("kathmandu");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [expRes, missRes] = await Promise.all([
        fetchPopulationExposure(),
        fetchMissingPersons(
          searchQuery || undefined,
          sectorFilter === "ALL" ? undefined : sectorFilter
        ),
      ]);
      setExposureData(expRes);
      setMissingPersons(missRes);
    } catch (err: any) {
      setError(err.message || "Failed to load population data");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [sectorFilter, searchQuery]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !contactName.trim()) return;

    setIsSubmitting(true);
    try {
      await submitMissingPerson({
        full_name: fullName.trim(),
        age: age ? parseInt(age) : null,
        gender: gender || null,
        last_known_location_id: sectorId,
        physical_description: description.trim() || null,
        reported_by: contactName.trim(),
        contact_number: contactPhone.trim() || null,
      });

      // Clear form
      setFullName("");
      setAge("");
      setGender("");
      setDescription("");
      setContactName("");
      setContactPhone("");
      setIsRegisterOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to register missing person");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LOCATED_SAFE":
        return <span className="px-2 py-0.5 border border-[#3FB950] text-[#3FB950] text-[10px] font-bold uppercase">LOCATED SAFE</span>;
      case "HOSPITALIZED":
        return <span className="px-2 py-0.5 border border-[#FFB800] text-[#FFB800] text-[10px] font-bold uppercase">IN HOSPITAL TRIAGE</span>;
      default:
        return <span className="px-2 py-0.5 border border-[#E5484D] text-[#E5484D] text-[10px] font-bold uppercase">UNACCOUNTED FOR</span>;
    }
  };

  return (
    <div className="p-6 sm:p-10 lg:p-14 space-y-10 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="border-b border-[#EDEDE8]/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
            02 // POPULATION ACCOUNTABILITY
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#EDEDE8]">
            WHO MAY BE AFFECTED?
          </h1>
          <p className="font-body-prose text-sm text-[#EDEDE8]/70 mt-1 max-w-2xl leading-relaxed">
            Real-time population exposure adjusting static census baselines for diurnal commuters, tourist density, and evacuations—coupled with an active Missing Persons Registry.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="px-5 py-2.5 bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] font-mono-data text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <span>+ REGISTER MISSING PERSON</span>
        </button>
      </div>

      {error && (
        <div className="bg-[#E5484D]/10 border border-[#E5484D] p-4 font-mono-data text-xs text-[#E5484D]">
          [POPULATION_ERROR]: {error}
        </div>
      )}

      {/* Top Population Exposure KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-data text-xs">
        <div className="surface-card p-5">
          <span className="text-[#EDEDE8]/50 block text-[10px] uppercase">ESTIMATED EXPOSED POPULATION</span>
          <strong className="text-3xl text-[#EDEDE8] font-bold">
            {((exposureData?.total_national_exposed_population || 0) / 1_000_000).toFixed(2)}M
          </strong>
          <span className="text-[10px] text-[#EDEDE8]/40 block mt-1">Across 8 monitored sectors</span>
        </div>

        <div className="surface-card p-5">
          <span className="text-[#FFB800] block text-[10px] uppercase font-bold">TRANSIENT COMMUTER/TOURISTS</span>
          <strong className="text-3xl text-[#FFB800] font-bold">
            +{((exposureData?.sector_exposures.reduce((acc, s) => acc + s.diurnal_commuter_flux + s.tourist_density_estimate, 0) || 0) / 1000).toFixed(0)}k
          </strong>
          <span className="text-[10px] text-[#EDEDE8]/40 block mt-1">Net non-resident flux</span>
        </div>

        <div className="surface-card p-5">
          <span className="text-[#3FB950] block text-[10px] uppercase font-bold">CONFIRMED EVACUATED</span>
          <strong className="text-3xl text-[#3FB950] font-bold">
            {((exposureData?.sector_exposures.reduce((acc, s) => acc + s.evacuated_population_estimate, 0) || 0) / 1000).toFixed(0)}k
          </strong>
          <span className="text-[10px] text-[#EDEDE8]/40 block mt-1">Relocated to safe shelters</span>
        </div>

        <div className="surface-card p-5">
          <span className="text-[#E5484D] block text-[10px] uppercase font-bold">UNACCOUNTED REGISTRY</span>
          <strong className="text-3xl text-[#E5484D] font-bold">
            {missingPersons.length}
          </strong>
          <span className="text-[10px] text-[#EDEDE8]/40 block mt-1">Registered missing cases</span>
        </div>
      </div>

      {/* Regional Exposure Breakdown Cards */}
      <div className="space-y-4">
        <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest">
          DYNAMIC POPULATION EXPOSURE BY REGION
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {exposureData?.sector_exposures.map((sec) => (
            <div key={sec.sector_id} className="surface-card p-5 space-y-3 font-mono-data text-xs">
              <div className="flex justify-between items-center border-b border-[#EDEDE8]/10 pb-2">
                <strong className="text-sm font-bold uppercase text-[#EDEDE8]">{sec.sector_name}</strong>
                <span className="text-[#FFB800] font-bold text-[11px]">
                  {sec.missing_persons_reported} UNACCOUNTED
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#EDEDE8]/50">DYNAMIC EXPOSURE:</span>
                  <strong className="text-[#EDEDE8]">{sec.real_time_exposed_population.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#EDEDE8]/50">CENSUS BASELINE:</span>
                  <span className="text-[#EDEDE8]/80">{sec.census_baseline_population.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#EDEDE8]/50">COMMUTER + TOURIST:</span>
                  <span className="text-[#FFB800]">+{((sec.diurnal_commuter_flux + sec.tourist_density_estimate) / 1000).toFixed(0)}k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#EDEDE8]/50">EVACUATED:</span>
                  <span className="text-[#3FB950]">-{sec.evacuated_population_estimate.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Missing Persons Registry Section */}
      <div className="surface-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EDEDE8]/10 pb-4">
          <div>
            <div className="font-mono-data text-xs text-[#FFB800] uppercase font-bold tracking-widest mb-1">
              PERSONNEL ACCOUNTABILITY
            </div>
            <h2 className="font-display text-2xl font-bold text-[#EDEDE8]">
              MISSING PERSONS REGISTRY ({missingPersons.length})
            </h2>
          </div>

          {/* Search Controls */}
          <div className="flex flex-wrap items-center gap-3 font-mono-data text-xs">
            <input
              type="text"
              placeholder="Search by name, contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0A0A0A] border border-[#EDEDE8]/30 p-2 text-[#EDEDE8] font-mono-data text-xs focus:border-[#FFB800] focus:outline-none min-w-[220px]"
            />
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-[#0A0A0A] border border-[#EDEDE8]/30 p-2 text-[#EDEDE8] font-mono-data text-xs focus:border-[#FFB800] focus:outline-none"
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
            <div
              key={`${p.id}-${pIdx}`}
              className="surface-card p-4 space-y-3 font-mono-data text-xs border border-[#EDEDE8]/15"
            >
              <div className="flex items-center justify-between border-b border-[#EDEDE8]/10 pb-2">
                <div>
                  <strong className="text-sm text-[#EDEDE8] block font-bold">{p.full_name}</strong>
                  <span className="text-[10px] text-[#EDEDE8]/50">
                    {p.gender || "Unknown"}, {p.age ? `${p.age} yrs` : "Age Unspecified"}
                  </span>
                </div>
                {getStatusBadge(p.status)}
              </div>

              <div className="text-[11px] space-y-1 text-[#EDEDE8]/80">
                <div>LAST KNOWN SECTOR: <strong className="text-[#FFB800] uppercase">{p.last_known_location_name || p.last_known_location_id}</strong></div>
                {p.physical_description && (
                  <div className="text-[#EDEDE8]/70 italic line-clamp-2">
                    &quot;{p.physical_description}&quot;
                  </div>
                )}
                {p.matched_hospital_notes && (
                  <div className="bg-[#3FB950]/10 border border-[#3FB950]/30 p-2 text-[#3FB950] text-[10px] mt-2">
                    ✓ POTENTIAL HOSPITAL MATCH: {p.matched_hospital_notes}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#EDEDE8]/10 text-[10px] text-[#EDEDE8]/40 flex justify-between">
                <span>Reporter: {p.reported_by}</span>
                <span>{new Date(p.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Register Missing Person */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/90 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0A0A0A] border border-[#EDEDE8]/30 p-6 sm:p-8 space-y-5 text-[#EDEDE8] shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#EDEDE8]/10 pb-3">
              <h3 className="font-display text-xl font-bold uppercase text-[#EDEDE8]">
                REGISTER MISSING PERSON
              </h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="font-mono-data text-xs text-[#EDEDE8]/60 hover:text-[#EDEDE8] cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 font-mono-data text-xs">
              <div>
                <label className="block text-[#EDEDE8]/70 mb-1">FULL NAME *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Shrestha"
                  className="w-full bg-[#0A0A0A] border border-[#EDEDE8]/30 p-2.5 text-[#EDEDE8] focus:border-[#FFB800] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#EDEDE8]/70 mb-1">AGE</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 34"
                    className="w-full bg-[#0A0A0A] border border-[#EDEDE8]/30 p-2.5 text-[#EDEDE8] focus:border-[#FFB800] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#EDEDE8]/70 mb-1">GENDER</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#EDEDE8]/30 p-2.5 text-[#EDEDE8] focus:border-[#FFB800] focus:outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#EDEDE8]/70 mb-1">LAST KNOWN SECTOR *</label>
                <select
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#EDEDE8]/30 p-2.5 text-[#EDEDE8] focus:border-[#FFB800] focus:outline-none"
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

              <div>
                <label className="block text-[#EDEDE8]/70 mb-1">PHYSICAL DESCRIPTION / CLOTHING</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Blue jacket, black backpack, last seen near New Road..."
                  className="w-full bg-[#0A0A0A] border border-[#EDEDE8]/30 p-2.5 text-[#EDEDE8] focus:border-[#FFB800] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#EDEDE8]/70 mb-1">REPORTER NAME *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Maya Shrestha"
                    className="w-full bg-[#0A0A0A] border border-[#EDEDE8]/30 p-2.5 text-[#EDEDE8] focus:border-[#FFB800] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#EDEDE8]/70 mb-1">REPORTER PHONE</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +977 9841000000"
                    className="w-full bg-[#0A0A0A] border border-[#EDEDE8]/30 p-2.5 text-[#EDEDE8] focus:border-[#FFB800] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 border border-[#EDEDE8]/20 text-[#EDEDE8]/60 hover:text-[#EDEDE8] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#EDEDE8] text-[#0A0A0A] hover:bg-[#FFB800] font-bold uppercase transition-colors disabled:opacity-50 cursor-pointer"
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
