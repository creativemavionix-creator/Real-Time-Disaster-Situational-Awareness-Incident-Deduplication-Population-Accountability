"use client";

import React, { useEffect, useState } from "react";
import {
  fetchPopulationExposure,
  fetchMissingPersons,
  submitMissingPerson,
  fetchSectorPalikas,
  AllPopulationExposureResponse,
  MissingPersonItem,
  SectorPalikaBreakdown,
} from "@/lib/api";
import { PopulationReconciliationLedger } from "@/components/PopulationReconciliationLedger";

export default function PopulationPage() {
  const [exposureData, setExposureData] = useState<AllPopulationExposureResponse | null>(null);
  const [missingPersons, setMissingPersons] = useState<MissingPersonItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Palika drill-down modal state
  const [selectedSectorForPalikas, setSelectedSectorForPalikas] = useState<string | null>(null);
  const [palikaData, setPalikaData] = useState<SectorPalikaBreakdown | null>(null);
  const [loadingPalikas, setLoadingPalikas] = useState(false);

  // Form state
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

  const handleOpenPalikas = async (sId: string) => {
    setSelectedSectorForPalikas(sId);
    setLoadingPalikas(true);
    try {
      const data = await fetchSectorPalikas(sId);
      setPalikaData(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch palika demographics");
    } finally {
      setLoadingPalikas(false);
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
      case "located_safe":
        return <span className="chip-safe">LOCATED SAFE</span>;
      case "HOSPITALIZED":
      case "hospitalized":
        return <span className="chip-warning">IN HOSPITAL TRIAGE</span>;
      default:
        return <span className="chip-critical">UNACCOUNTED FOR</span>;
    }
  };

  return (
    <div className="p-6 sm:p-10 lg:p-14 space-y-10 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="border-b border-[#E5E4DC] dark:border-[#232733] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono-data text-xs text-[#059669] dark:text-[#34D399] font-bold uppercase tracking-wider">
            02 // POPULATION ACCOUNTABILITY & ENTITY RESOLUTION
          </div>
          <h1 className="font-display-calm font-extrabold text-3xl sm:text-4xl text-[#111318] dark:text-[#F4F4F0] tracking-tight">
            Population Exposure & Reconciliation
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-[#5C6270] dark:text-[#9CA3AF] max-w-2xl leading-relaxed">
            Verified NSO Nepal 2021 Census baseline with municipal Palika demographics, real-time shelter check-in reconciliation, and fuzzy entity matching.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          type="button"
          className="btn-action-primary text-xs py-2.5 px-5 cursor-pointer self-start md:self-auto"
        >
          <span>+ REGISTER MISSING PERSON</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-mono-data text-[#E11D48]">
          [POPULATION_ERROR]: {error}
        </div>
      )}

      {/* Top Population Exposure KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-data text-xs">
        <div className="surface-calm p-5">
          <span className="text-[#5C6270] block text-[10px] uppercase font-bold">ESTIMATED EXPOSED</span>
          <strong className="text-3xl text-[#111318] dark:text-[#F4F4F0] font-extrabold">
            {((exposureData?.total_national_exposed_population || 0) / 1000000).toFixed(2)}M
          </strong>
          <span className="text-[11px] text-[#059669] dark:text-[#34D399] block mt-1 font-semibold">Real-time exposed in disaster zones</span>
        </div>

        <div className="surface-calm p-5">
          <span className="text-[#5C6270] block text-[10px] uppercase font-bold">2021 CENSUS BASELINE</span>
          <strong className="text-3xl text-[#2563EB] dark:text-[#60A5FA] font-extrabold">
            {((exposureData?.sector_exposures.reduce((acc, s) => acc + s.census_baseline_population, 0) || 0) / 1000000).toFixed(2)}M
          </strong>
          <span className="text-[11px] text-[#5C6270] block mt-1">Verified NSO Municipal Sums</span>
        </div>

        <div className="surface-calm p-5">
          <span className="text-[#5C6270] block text-[10px] uppercase font-bold">CONFIRMED EVACUATED</span>
          <strong className="text-3xl text-[#059669] dark:text-[#34D399] font-extrabold">
            {((exposureData?.sector_exposures.reduce((acc, s) => acc + s.evacuated_population_estimate, 0) || 0) / 1000).toFixed(0)}k
          </strong>
          <span className="text-[11px] text-[#5C6270] block mt-1">Relocated to safe shelters</span>
        </div>

        <div className="surface-calm p-5">
          <span className="text-[#5C6270] block text-[10px] uppercase font-bold">UNACCOUNTED CASES</span>
          <strong className="text-3xl text-[#E11D48] dark:text-[#FB7185] font-extrabold">
            {missingPersons.length}
          </strong>
          <span className="text-[11px] text-[#5C6270] block mt-1">Registered missing cases</span>
        </div>
      </div>

      {/* Regional Exposure Breakdown Cards */}
      <div className="space-y-4 font-mono-data text-xs">
        <div className="text-[#5C6270] font-bold uppercase tracking-wider">
          DYNAMIC POPULATION EXPOSURE BY REGION
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {exposureData?.sector_exposures.map((sec) => (
            <div key={sec.sector_id} className="surface-calm p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-[#E5E4DC] dark:border-[#232733] pb-2">
                  <strong className="text-sm font-bold uppercase text-[#111318] dark:text-[#F4F4F0]">{sec.sector_name}</strong>
                  <span className="text-[#E11D48] dark:text-[#FB7185] font-bold text-[11px]">
                    {sec.missing_persons_reported} UNACCOUNTED
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] mt-3">
                  <div className="flex justify-between">
                    <span className="text-[#5C6270]">DYNAMIC EXPOSURE:</span>
                    <strong className="text-[#111318] dark:text-[#F4F4F0]">{sec.real_time_exposed_population.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6270]">CENSUS BASELINE:</span>
                    <span className="text-[#5C6270] dark:text-[#9CA3AF]">{sec.census_baseline_population.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6270]">COMMUTER + TOURIST:</span>
                    <span className="text-[#2563EB] dark:text-[#60A5FA] font-bold">+{((sec.diurnal_commuter_flux + sec.tourist_density_estimate) / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6270]">EVACUATED:</span>
                    <span className="text-[#059669] dark:text-[#34D399] font-bold">-{sec.evacuated_population_estimate.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenPalikas(sec.sector_id)}
                className="w-full mt-3 py-2 px-3 btn-action-secondary text-[11px] font-bold uppercase cursor-pointer"
              >
                <span>🏛️ 2021 CENSUS PALIKAS</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PROBABILISTIC ENTITY RECONCILIATION LEDGER (Missing vs. Found Shelter Check-ins) */}
      <PopulationReconciliationLedger />

      {/* Missing Persons Registry Section */}
      <div className="surface-calm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E4DC] dark:border-[#232733] pb-4">
          <div>
            <div className="font-mono-data text-xs text-[#059669] dark:text-[#34D399] font-bold uppercase tracking-wider mb-1">
              PERSONNEL ACCOUNTABILITY
            </div>
            <h2 className="font-display-calm font-extrabold text-2xl text-[#111318] dark:text-[#F4F4F0]">
              Missing Persons Inquiries Registry ({missingPersons.length})
            </h2>
          </div>

          {/* Search Controls */}
          <div className="flex flex-wrap items-center gap-3 font-mono-data text-xs">
            <input
              type="text"
              placeholder="Search by name, contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#FAF9F5] dark:bg-[#0C0E12] border border-[#E5E4DC] dark:border-[#232733] rounded-lg p-2.5 text-[#111318] dark:text-[#F4F4F0] focus:border-[#2563EB] focus:outline-none min-w-[220px]"
            />
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-[#FAF9F5] dark:bg-[#0C0E12] border border-[#E5E4DC] dark:border-[#232733] rounded-lg p-2.5 text-[#111318] dark:text-[#F4F4F0] focus:border-[#2563EB] focus:outline-none"
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
              className="surface-calm p-4 space-y-3 font-mono-data text-xs"
            >
              <div className="flex items-center justify-between border-b border-[#E5E4DC] dark:border-[#232733] pb-2">
                <div>
                  <strong className="text-sm text-[#111318] dark:text-[#F4F4F0] block font-bold">{p.full_name}</strong>
                  <span className="text-[10px] text-[#5C6270]">
                    {p.gender || "Unknown"}, {p.age ? `${p.age} yrs` : "Age Unspecified"}
                  </span>
                </div>
                {getStatusBadge(p.status)}
              </div>

              <div className="text-[11px] space-y-1 text-[#5C6270] dark:text-[#9CA3AF]">
                <div>LAST KNOWN SECTOR: <strong className="text-[#2563EB] dark:text-[#60A5FA] uppercase">{p.last_known_location_name || p.last_known_location_id}</strong></div>
                {p.physical_description && (
                  <div className="text-[#5C6270] italic line-clamp-2">
                    &quot;{p.physical_description}&quot;
                  </div>
                )}
                {p.matched_hospital_notes && (
                  <div className="p-2 rounded-lg bg-[#059669]/10 border border-[#059669]/30 text-[#059669] dark:text-[#34D399] text-[10px] mt-2">
                    ✓ POTENTIAL HOSPITAL MATCH: {p.matched_hospital_notes}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#E5E4DC] dark:border-[#232733] text-[10px] text-[#5C6270] flex justify-between">
                <span>Reporter: {p.reported_by}</span>
                <span>{new Date(p.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Register Missing Person */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg surface-elevated p-6 sm:p-8 space-y-5 text-[#111318] dark:text-[#F4F4F0] shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#E5E4DC] dark:border-[#232733] pb-3">
              <h3 className="font-display-calm text-xl font-extrabold uppercase text-[#111318] dark:text-[#F4F4F0]">
                Register Missing Person
              </h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                type="button"
                className="font-mono-data text-xs text-[#5C6270] hover:text-[#111318] dark:hover:text-[#F4F4F0] cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 font-mono-data text-xs">
              <div>
                <label className="block text-[#5C6270] font-bold mb-1">FULL NAME *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Shrestha"
                  className="w-full bg-[#FAF9F5] dark:bg-[#0C0E12] border border-[#E5E4DC] dark:border-[#232733] rounded-lg p-2.5 text-[#111318] dark:text-[#F4F4F0] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#5C6270] font-bold mb-1">AGE</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 34"
                    className="w-full bg-[#FAF9F5] dark:bg-[#0C0E12] border border-[#E5E4DC] dark:border-[#232733] rounded-lg p-2.5 text-[#111318] dark:text-[#F4F4F0] focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#5C6270] font-bold mb-1">GENDER</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#FAF9F5] dark:bg-[#0C0E12] border border-[#E5E4DC] dark:border-[#232733] rounded-lg p-2.5 text-[#111318] dark:text-[#F4F4F0] focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#5C6270] font-bold mb-1">LAST KNOWN SECTOR *</label>
                <select
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  className="w-full bg-[#FAF9F5] dark:bg-[#0C0E12] border border-[#E5E4DC] dark:border-[#232733] rounded-lg p-2.5 text-[#111318] dark:text-[#F4F4F0] focus:border-[#2563EB] focus:outline-none"
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
                <label className="block text-[#5C6270] font-bold mb-1">PHYSICAL DESCRIPTION / CLOTHING</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Blue jacket, black backpack, last seen near New Road..."
                  className="w-full bg-[#FAF9F5] dark:bg-[#0C0E12] border border-[#E5E4DC] dark:border-[#232733] rounded-lg p-2.5 text-[#111318] dark:text-[#F4F4F0] font-body-prose text-xs focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#5C6270] font-bold mb-1">REPORTER NAME *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Maya Shrestha"
                    className="w-full bg-[#FAF9F5] dark:bg-[#0C0E12] border border-[#E5E4DC] dark:border-[#232733] rounded-lg p-2.5 text-[#111318] dark:text-[#F4F4F0] focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#5C6270] font-bold mb-1">REPORTER PHONE</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +977 9841000000"
                    className="w-full bg-[#FAF9F5] dark:bg-[#0C0E12] border border-[#E5E4DC] dark:border-[#232733] rounded-lg p-2.5 text-[#111318] dark:text-[#F4F4F0] focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="btn-action-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-action-primary text-xs py-2 px-5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "SAVING..." : "REGISTER PERSON [↵]"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2021 Census Palika Demographics Modal */}
      {selectedSectorForPalikas && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="surface-elevated max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[#E5E4DC] dark:border-[#232733] pb-4">
              <div>
                <div className="font-mono-data text-xs text-[#D97706] dark:text-[#FBBF24] uppercase font-bold tracking-wider mb-1">
                  🏛️ NSO NEPAL 2021 CENSUS BASELINE
                </div>
                <h2 className="font-display-calm font-extrabold text-2xl sm:text-3xl text-[#111318] dark:text-[#F4F4F0] uppercase">
                  {palikaData?.sector_name || selectedSectorForPalikas} Municipalities
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedSectorForPalikas(null);
                  setPalikaData(null);
                }}
                className="p-2 rounded-lg border border-[#E5E4DC] dark:border-[#232733] text-[#5C6270] hover:text-[#111318] dark:hover:text-[#F4F4F0] font-mono-data text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {loadingPalikas ? (
              <div className="p-12 text-center font-mono-data text-xs text-[#2563EB] animate-pulse">
                [LOADING_2021_CENSUS_PALIKA_RECORDS...]
              </div>
            ) : palikaData ? (
              <div className="space-y-6 font-mono-data text-xs">
                {/* Aggregate Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="surface-calm p-3.5">
                    <span className="text-[#5C6270] block text-[10px] uppercase font-bold">TOTAL PALIKAS</span>
                    <strong className="text-xl text-[#111318] dark:text-[#F4F4F0] font-bold">{palikaData.total_palikas}</strong>
                  </div>
                  <div className="surface-calm p-3.5">
                    <span className="text-[#5C6270] block text-[10px] uppercase font-bold">TOTAL HOUSEHOLDS</span>
                    <strong className="text-xl text-[#2563EB] dark:text-[#60A5FA] font-bold">{palikaData.total_households.toLocaleString()}</strong>
                  </div>
                  <div className="surface-calm p-3.5">
                    <span className="text-[#5C6270] block text-[10px] uppercase font-bold">MALE POPULATION</span>
                    <strong className="text-xl text-[#111318] dark:text-[#F4F4F0] font-bold">{palikaData.male_population.toLocaleString()}</strong>
                  </div>
                  <div className="surface-calm p-3.5">
                    <span className="text-[#5C6270] block text-[10px] uppercase font-bold">FEMALE POPULATION</span>
                    <strong className="text-xl text-[#111318] dark:text-[#F4F4F0] font-bold">{palikaData.female_population.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-[#E5E4DC] dark:border-[#232733] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F2F0E8] dark:bg-[#13161D] border-b border-[#E5E4DC] dark:border-[#232733] text-[#5C6270] text-[10px] uppercase font-bold">
                      <tr>
                        <th className="p-3">CODE</th>
                        <th className="p-3">MUNICIPALITY / PALIKA NAME</th>
                        <th className="p-3 text-right">HOUSEHOLDS</th>
                        <th className="p-3 text-right">POPULATION</th>
                        <th className="p-3 text-right">SHELTER TENTS REQ.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E4DC] dark:divide-[#232733] text-[11px]">
                      {palikaData.palikas.map((p) => (
                        <tr key={p.local_level_id} className="hover:bg-[#F2F0E8]/50 dark:hover:bg-[#13161D]/50 transition-colors">
                          <td className="p-3 font-bold text-[#2563EB] dark:text-[#60A5FA]">{p.local_level_id}</td>
                          <td className="p-3 font-bold text-[#111318] dark:text-[#F4F4F0]">{p.local_level_name}</td>
                          <td className="p-3 text-right text-[#5C6270]">{p.households.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-[#111318] dark:text-[#F4F4F0]">{p.total_population.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-[#059669] dark:text-[#34D399]">
                            {p.estimated_tents_needed.toLocaleString()} TENTS
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
