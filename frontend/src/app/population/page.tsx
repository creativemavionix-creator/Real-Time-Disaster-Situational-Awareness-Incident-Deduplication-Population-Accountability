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
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold uppercase">LOCATED SAFE</span>;
      case "HOSPITALIZED":
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold uppercase">IN HOSPITAL TRIAGE</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold uppercase">UNACCOUNTED FOR</span>;
    }
  };

  return (
    <div className="p-6 sm:p-10 lg:p-14 space-y-10 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="prism-badge-cyan">
            <span>02</span>
            <span>//</span>
            <span>POPULATION ACCOUNTABILITY</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            Exposed Population & Missing Registry
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Verified NSO Nepal 2021 Census baseline with municipal Palika & household drill-down, adjusted for diurnal commuters, tourist density, and evacuations.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="btn-primary-cyan text-xs py-2.5 px-5 cursor-pointer self-start md:self-auto"
        >
          <span>+ REGISTER MISSING PERSON</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 rounded-2xl font-mono text-xs text-rose-700 dark:text-rose-300">
          [POPULATION_ERROR]: {error}
        </div>
      )}

      {/* Top Population Exposure KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="prism-card p-5">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">ESTIMATED EXPOSED POPULATION</span>
          <strong className="text-3xl text-slate-900 dark:text-white font-extrabold">
            {((exposureData?.total_national_exposed_population || 0) / 1000000).toFixed(2)}M
          </strong>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-1 font-semibold">Real-time exposed in disaster zones</span>
        </div>

        <div className="prism-card p-5">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">2021 CENSUS BASELINE</span>
          <strong className="text-3xl text-amber-600 dark:text-amber-400 font-extrabold">
            {((exposureData?.sector_exposures.reduce((acc, s) => acc + s.census_baseline_population, 0) || 0) / 1000000).toFixed(2)}M
          </strong>
          <span className="text-[11px] text-slate-400 block mt-1">Verified NSO Nepal Municipal Sums</span>
        </div>

        <div className="prism-card p-5">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">CONFIRMED EVACUATED</span>
          <strong className="text-3xl text-emerald-600 dark:text-emerald-400 font-extrabold">
            {((exposureData?.sector_exposures.reduce((acc, s) => acc + s.evacuated_population_estimate, 0) || 0) / 1000).toFixed(0)}k
          </strong>
          <span className="text-[11px] text-slate-400 block mt-1">Relocated to safe shelters</span>
        </div>

        <div className="prism-card p-5">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">UNACCOUNTED REGISTRY</span>
          <strong className="text-3xl text-rose-600 dark:text-rose-400 font-extrabold">
            {missingPersons.length}
          </strong>
          <span className="text-[11px] text-slate-400 block mt-1">Registered missing cases</span>
        </div>
      </div>

      {/* Regional Exposure Breakdown Cards */}
      <div className="space-y-4">
        <div className="font-mono text-xs text-slate-500 font-bold uppercase tracking-wider">
          DYNAMIC POPULATION EXPOSURE BY REGION
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {exposureData?.sector_exposures.map((sec) => (
            <div key={sec.sector_id} className="prism-card p-5 space-y-3 font-mono text-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <strong className="text-sm font-bold uppercase text-slate-900 dark:text-white">{sec.sector_name}</strong>
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                    {sec.missing_persons_reported} UNACCOUNTED
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] mt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">DYNAMIC EXPOSURE:</span>
                    <strong className="text-slate-900 dark:text-white">{sec.real_time_exposed_population.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">CENSUS BASELINE:</span>
                    <span className="text-slate-700 dark:text-slate-300">{sec.census_baseline_population.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">COMMUTER + TOURIST:</span>
                    <span className="text-cyan-700 dark:text-cyan-400 font-bold">+{((sec.diurnal_commuter_flux + sec.tourist_density_estimate) / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">EVACUATED:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">-{sec.evacuated_population_estimate.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenPalikas(sec.sector_id)}
                className="w-full mt-3 py-2 px-3 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🏛️ 2021 CENSUS PALIKAS</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Missing Persons Registry Section */}
      <div className="prism-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="prism-badge-cyan mb-1">
              <span>PERSONNEL ACCOUNTABILITY</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
              MISSING PERSONS REGISTRY ({missingPersons.length})
            </h2>
          </div>

          {/* Search Controls */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <input
              type="text"
              placeholder="Search by name, contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none min-w-[220px]"
            />
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
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
              className="prism-card p-4 space-y-3 font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <strong className="text-sm text-slate-900 dark:text-white block font-bold">{p.full_name}</strong>
                  <span className="text-[10px] text-slate-500">
                    {p.gender || "Unknown"}, {p.age ? `${p.age} yrs` : "Age Unspecified"}
                  </span>
                </div>
                {getStatusBadge(p.status)}
              </div>

              <div className="text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                <div>LAST KNOWN SECTOR: <strong className="text-cyan-700 dark:text-cyan-400 uppercase">{p.last_known_location_name || p.last_known_location_id}</strong></div>
                {p.physical_description && (
                  <div className="text-slate-500 italic line-clamp-2">
                    &quot;{p.physical_description}&quot;
                  </div>
                )}
                {p.matched_hospital_notes && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2 rounded-xl text-emerald-700 dark:text-emerald-300 text-[10px] mt-2">
                    ✓ POTENTIAL HOSPITAL MATCH: {p.matched_hospital_notes}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between">
                <span>Reporter: {p.reported_by}</span>
                <span>{new Date(p.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Register Missing Person */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 text-slate-900 dark:text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-display text-xl font-extrabold uppercase text-slate-900 dark:text-white">
                REGISTER MISSING PERSON
              </h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="font-mono text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">FULL NAME *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Shrestha"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">AGE</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 34"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">GENDER</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">LAST KNOWN SECTOR *</label>
                <select
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
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
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">PHYSICAL DESCRIPTION / CLOTHING</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Blue jacket, black backpack, last seen near New Road..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none font-body-prose"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">REPORTER NAME *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Maya Shrestha"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">REPORTER PHONE</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +977 9841000000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary-cyan text-xs py-2 px-5 disabled:opacity-50 cursor-pointer"
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
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="prism-card max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="prism-badge-cyan mb-1">
                  <span>🏛️ NSO NEPAL 2021 CENSUS BASELINE</span>
                </div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white uppercase">
                  {palikaData?.sector_name || selectedSectorForPalikas} SECTOR MUNICIPALITIES
                </h2>
                <p className="font-body-prose text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Local level distribution of households, gender demographic split, and emergency shelter requirement models.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedSectorForPalikas(null);
                  setPalikaData(null);
                }}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-mono text-sm p-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {loadingPalikas ? (
              <div className="p-12 text-center font-mono text-xs text-cyan-600 dark:text-cyan-400 animate-pulse">
                [LOADING_2021_CENSUS_PALIKA_RECORDS...]
              </div>
            ) : palikaData ? (
              <div className="space-y-6">
                {/* Aggregate Summary KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">TOTAL PALIKAS</span>
                    <strong className="text-xl text-slate-900 dark:text-white font-bold">{palikaData.total_palikas}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">TOTAL HOUSEHOLDS</span>
                    <strong className="text-xl text-cyan-700 dark:text-cyan-400 font-bold">{palikaData.total_households.toLocaleString()}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">MALE POPULATION</span>
                    <strong className="text-xl text-slate-900 dark:text-white font-bold">{palikaData.male_population.toLocaleString()}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">FEMALE POPULATION</span>
                    <strong className="text-xl text-slate-900 dark:text-white font-bold">{palikaData.female_population.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Gender Percentage Bar */}
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>MALE: {((palikaData.male_population / (palikaData.total_population || 1)) * 100).toFixed(1)}%</span>
                    <span>FEMALE: {((palikaData.female_population / (palikaData.total_population || 1)) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden">
                    <div
                      style={{ width: `${(palikaData.male_population / (palikaData.total_population || 1)) * 100}%` }}
                      className="bg-cyan-500 h-full"
                    />
                    <div
                      style={{ width: `${(palikaData.female_population / (palikaData.total_population || 1)) * 100}%` }}
                      className="bg-purple-500 h-full"
                    />
                  </div>
                </div>

                {/* Municipal Palikas Table */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="p-3">CODE</th>
                        <th className="p-3">MUNICIPALITY / PALIKA NAME</th>
                        <th className="p-3 text-right">HOUSEHOLDS</th>
                        <th className="p-3 text-right">POPULATION</th>
                        <th className="p-3 text-right">MALE / FEMALE</th>
                        <th className="p-3 text-right">SHELTER TENTS REQ.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                      {palikaData.palikas.map((p) => (
                        <tr key={p.local_level_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 font-bold text-cyan-700 dark:text-cyan-400">{p.local_level_id}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{p.local_level_name}</td>
                          <td className="p-3 text-right text-slate-600 dark:text-slate-300">{p.households.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-slate-900 dark:text-white">{p.total_population.toLocaleString()}</td>
                          <td className="p-3 text-right text-slate-500">
                            {p.male_population.toLocaleString()} / {p.female_population.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            {p.estimated_tents_needed.toLocaleString()} TENTS
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/80 p-3.5 rounded-xl text-xs font-mono text-cyan-900 dark:text-cyan-300 flex items-start gap-2">
                  <span className="font-bold">ℹ️ RELIEF CALCULATION FORMULA:</span>
                  <span>Emergency shelter requirement = 85% of total census households. Family food rations = 100% of household units.</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No palika demographic records found for this sector.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
