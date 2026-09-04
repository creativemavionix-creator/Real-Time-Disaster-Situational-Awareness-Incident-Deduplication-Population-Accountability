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
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building2,
  UserPlus,
  Search,
  MapPin,
  AlertTriangle,
  X,
  CheckCircle2,
  Tent,
  FileSpreadsheet,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

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
  const [totalRegistryCount, setTotalRegistryCount] = useState<number>(0);

  const loadData = async () => {
    try {
      const [expRes, missRes, allMissRes] = await Promise.all([
        fetchPopulationExposure(),
        fetchMissingPersons(
          searchQuery || undefined,
          sectorFilter === "ALL" ? undefined : sectorFilter
        ),
        fetchMissingPersons(undefined, undefined),
      ]);
      setExposureData(expRes);
      setMissingPersons(missRes);
      setTotalRegistryCount(allMissRes.length);
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
        age: age ? parseInt(age, 10) : undefined,
        gender: gender || undefined,
        last_known_location_id: sectorId,
        reported_by: contactName.trim(),
        contact_number: contactPhone.trim() || undefined,
        physical_description: description.trim() || undefined,
      });

      // Clear form & reset filters so registered record is immediately visible
      setFullName("");
      setAge("");
      setGender("");
      setDescription("");
      setContactName("");
      setContactPhone("");
      setIsRegisterOpen(false);
      setSectorFilter("ALL");
      setSearchQuery("");
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to register missing person");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#090B0E] p-4 sm:p-8 lg:p-12 space-y-8 max-w-7xl mx-auto text-[#F3F4F6]">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono-data text-[10px] text-[#60A5FA] font-bold uppercase tracking-[0.25em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
            03 // DEMOGRAPHIC EXPOSURE & CASUALTY ACCOUNTABILITY
          </div>
          <h1 className="font-display-calm font-medium text-3xl sm:text-4xl text-white tracking-tight">
            Population Accountability Matrix
          </h1>
          <p className="font-body-prose text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
            Real-time demographic exposure calculated from NSO Nepal 2021 Census baseline, diurnal commuter fluxes, and probabilistic person entity resolution against field triage rosters.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          type="button"
          className="btn-action-primary text-xs py-2.5 px-5 cursor-pointer self-start md:self-auto flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Missing Person</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-mono-data text-[#FB7185] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>[POPULATION_ERROR]: {error}</span>
        </div>
      )}

      {/* Top Population Exposure KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-data text-xs">
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
          <span className="text-[#64748B] block text-[10px] uppercase font-bold tracking-wider">ESTIMATED EXPOSED</span>
          <div className="text-3xl text-white font-bold">
            <AnimatedCounter
              value={(exposureData?.total_national_exposed_population || 0) / 1000000}
              isDecimal={true}
              suffix="M"
            />
          </div>
          <span className="text-[11px] text-[#34D399] block font-semibold">Real-time exposed in disaster zones</span>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
          <span className="text-[#64748B] block text-[10px] uppercase font-bold tracking-wider">2021 CENSUS BASELINE</span>
          <div className="text-3xl text-[#60A5FA] font-bold">
            <AnimatedCounter
              value={(exposureData?.sector_exposures.reduce((acc, s) => acc + s.census_baseline_population, 0) || 0) / 1000000}
              isDecimal={true}
              suffix="M"
            />
          </div>
          <span className="text-[11px] text-[#94A3B8] block">Verified NSO Municipal Sums</span>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
          <span className="text-[#64748B] block text-[10px] uppercase font-bold tracking-wider">CONFIRMED EVACUATED</span>
          <div className="text-3xl text-[#34D399] font-bold">
            <AnimatedCounter
              value={(exposureData?.sector_exposures.reduce((acc, s) => acc + s.evacuated_population_estimate, 0) || 0) / 1000}
              suffix="k"
            />
          </div>
          <span className="text-[11px] text-[#94A3B8] block">Relocated to safe shelters</span>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
          <span className="text-[#64748B] block text-[10px] uppercase font-bold tracking-wider">UNACCOUNTED CASES</span>
          <div className="text-3xl text-[#FB7185] font-bold">
            <AnimatedCounter value={totalRegistryCount || missingPersons.length} />
          </div>
          <span className="text-[11px] text-[#94A3B8] block">Active missing person records</span>
        </div>
      </div>

      {/* Regional Exposure Breakdown Cards */}
      <div className="space-y-4 font-mono-data text-xs">
        <div className="text-[#64748B] font-bold uppercase tracking-wider flex items-center justify-between">
          <span>DYNAMIC POPULATION EXPOSURE BY REGION</span>
          <span className="text-[#94A3B8]">{exposureData?.sector_exposures.length || 0} SECTORS AUDITED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {exposureData?.sector_exposures.map((sec) => (
            <div key={sec.sector_id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4 flex flex-col justify-between hover:border-white/20 transition-all">
              <div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <strong className="text-base font-display-calm font-medium text-white">{sec.sector_name}</strong>
                  <span className="chip-critical text-[10px]">
                    {sec.missing_persons_reported} MISSING
                  </span>
                </div>

                <div className="space-y-2 text-[11px] mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">DYNAMIC EXPOSURE:</span>
                    <strong className="text-white font-bold">{sec.real_time_exposed_population.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">CENSUS BASELINE:</span>
                    <span className="text-[#94A3B8]">{sec.census_baseline_population.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">COMMUTER + TOURIST:</span>
                    <span className="text-[#60A5FA] font-bold">+{((sec.diurnal_commuter_flux + sec.tourist_density_estimate) / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">EVACUATED:</span>
                    <span className="text-[#34D399] font-bold">-{sec.evacuated_population_estimate.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenPalikas(sec.sector_id)}
                className="w-full py-2.5 px-3 btn-action-secondary text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>2021 Census Palikas</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Probabilistic Entity Reconciliation Ledger */}
      <PopulationReconciliationLedger />

      {/* Missing Persons Registry Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0C0E12]/90 border border-white/10 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="font-mono-data text-[10px] text-[#34D399] font-bold uppercase tracking-wider mb-1">
              PERSONNEL ACCOUNTABILITY
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display-calm font-medium text-2xl text-white">
                Missing Persons Inquiries Registry ({missingPersons.length})
              </h2>
              <span className="px-2.5 py-0.5 rounded bg-blue-500/10 text-[#60A5FA] border border-blue-500/30 text-[10px] font-mono-data font-bold">
                [▼ SORT: NEWEST REPORTED FIRST]
              </span>
            </div>
          </div>

          {/* Search Controls */}
          <div className="flex flex-wrap items-center gap-3 font-mono-data text-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or ID..."
                className="pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none text-xs w-44 sm:w-56"
              />
            </div>

            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none text-xs"
            >
              <option value="ALL">All Sectors</option>
              {exposureData?.sector_exposures.map((s) => (
                <option key={s.sector_id} value={s.sector_id}>
                  {s.sector_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Indicator Bar */}
        {(sectorFilter !== "ALL" || searchQuery.trim() !== "") && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-mono-data text-[#60A5FA]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-white uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-blue-600">FILTER ACTIVE</span>
              <span>Showing <strong>{missingPersons.length}</strong> of <strong>{totalRegistryCount || missingPersons.length}</strong> records</span>
              {sectorFilter !== "ALL" && (
                <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-white text-[11px]">
                  Sector: {sectorFilter.toUpperCase()}
                </span>
              )}
              {searchQuery.trim() !== "" && (
                <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-white text-[11px]">
                  Query: &ldquo;{searchQuery}&rdquo;
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setSectorFilter("ALL");
                setSearchQuery("");
              }}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer transition-colors text-xs"
            >
              Clear Active Filters
            </button>
          </div>
        )}

        {/* Missing Persons Table */}
        <div className="rounded-2xl border border-white/10 overflow-x-auto">
          <table className="w-full text-left font-mono-data text-xs">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/10 text-[#64748B] text-[10px] uppercase tracking-wider">
                <th className="p-3.5">ID</th>
                <th className="p-3.5">FULL NAME</th>
                <th className="p-3.5">DEMOGRAPHICS</th>
                <th className="p-3.5">LAST SEEN SECTOR</th>
                <th className="p-3.5">PHYSICAL DESCRIPTION</th>
                <th className="p-3.5">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {missingPersons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#64748B]">
                    {sectorFilter !== "ALL" || searchQuery.trim() !== "" ? (
                      <div className="space-y-3">
                        <p>No records match active filter. ({totalRegistryCount} total records in registry)</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSectorFilter("ALL");
                            setSearchQuery("");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition-colors"
                        >
                          Clear Filters to Show All
                        </button>
                      </div>
                    ) : (
                      "No missing person records registered yet."
                    )}
                  </td>
                </tr>
              ) : (
                missingPersons.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 text-[#64748B]">#{p.id}</td>
                    <td className="p-3.5 font-bold text-white font-display-calm text-sm">{p.full_name}</td>
                    <td className="p-3.5 text-[#94A3B8]">
                      {p.age ? `${p.age}y` : "Age N/A"} &bull; {p.gender || "N/A"}
                    </td>
                    <td className="p-3.5 uppercase text-white font-mono-data text-xs">{p.last_known_location_name || p.last_known_location_id}</td>
                    <td className="p-3.5 text-[#94A3B8] max-w-xs truncate text-xs font-body-prose">
                      {p.physical_description || "None recorded"}
                    </td>
                    <td className="p-3.5">
                      <span className={
                        p.status === "located_safe"
                          ? "chip-safe"
                          : p.status === "hospitalized"
                          ? "chip-warning"
                          : "chip-critical"
                      }>
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {isRegisterOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 sm:p-8 rounded-3xl bg-[#0C0E12] border border-white/15 max-w-lg w-full space-y-6 shadow-2xl font-mono-data text-xs"
            >
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <div className="text-[10px] text-[#60A5FA] uppercase tracking-wider mb-1">
                    NEW CASE INTAKE
                  </div>
                  <h3 className="font-display-calm font-medium text-2xl text-white">
                    Register Missing Person
                  </h3>
                </div>
                <button
                  onClick={() => setIsRegisterOpen(false)}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-[#94A3B8] text-[10px] tracking-wider uppercase mb-1.5">FULL NAME *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Adhikari"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#94A3B8] text-[10px] tracking-wider uppercase mb-1.5">AGE</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 34"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#94A3B8] text-[10px] tracking-wider uppercase mb-1.5">GENDER</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#3B82F6] focus:outline-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#94A3B8] text-[10px] tracking-wider uppercase mb-1.5">LAST KNOWN SECTOR *</label>
                  <select
                    value={sectorId}
                    onChange={(e) => setSectorId(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#3B82F6] focus:outline-none"
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
                  <label className="block text-[#94A3B8] text-[10px] tracking-wider uppercase mb-1.5">PHYSICAL DESCRIPTION / CLOTHING</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Blue jacket, black backpack, last seen near New Road..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-body-prose text-xs focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#94A3B8] text-[10px] tracking-wider uppercase mb-1.5">REPORTER NAME *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Maya Shrestha"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#94A3B8] text-[10px] tracking-wider uppercase mb-1.5">REPORTER PHONE</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. +977 9841000000"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsRegisterOpen(false)}
                    className="btn-action-secondary text-xs py-2 px-4 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-action-primary text-xs py-2 px-5 rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Saving..." : "Register Person [↵]"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2021 Census Palika Demographics Modal */}
      <AnimatePresence>
        {selectedSectorForPalikas && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 sm:p-8 rounded-3xl bg-[#0C0E12] border border-white/15 max-w-4xl w-full space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl font-mono-data text-xs"
            >
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <div className="text-[10px] text-[#F59E0B] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>NSO NEPAL 2021 CENSUS BASELINE</span>
                  </div>
                  <h2 className="font-display-calm font-medium text-2xl sm:text-3xl text-white uppercase">
                    {palikaData?.sector_name || selectedSectorForPalikas} Municipalities
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSectorForPalikas(null);
                    setPalikaData(null);
                  }}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingPalikas ? (
                <div className="p-12 text-center font-mono-data text-xs text-[#60A5FA] animate-pulse">
                  [LOADING_2021_CENSUS_PALIKA_RECORDS...]
                </div>
              ) : palikaData ? (
                <div className="space-y-6">
                  {/* Aggregate Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-[#64748B] block text-[10px] uppercase font-bold">TOTAL PALIKAS</span>
                      <strong className="text-xl text-white font-bold">{palikaData.total_palikas}</strong>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-[#64748B] block text-[10px] uppercase font-bold">TOTAL HOUSEHOLDS</span>
                      <strong className="text-xl text-[#60A5FA] font-bold">{palikaData.total_households.toLocaleString()}</strong>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-[#64748B] block text-[10px] uppercase font-bold">MALE POPULATION</span>
                      <strong className="text-xl text-white font-bold">{palikaData.male_population.toLocaleString()}</strong>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-[#64748B] block text-[10px] uppercase font-bold">FEMALE POPULATION</span>
                      <strong className="text-xl text-white font-bold">{palikaData.female_population.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-2xl border border-white/10 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.03] border-b border-white/10 text-[#64748B] text-[10px] uppercase font-bold tracking-wider">
                        <tr>
                          <th className="p-3.5">CODE</th>
                          <th className="p-3.5">MUNICIPALITY / PALIKA NAME</th>
                          <th className="p-3.5 text-right">HOUSEHOLDS</th>
                          <th className="p-3.5 text-right">POPULATION</th>
                          <th className="p-3.5 text-right">SHELTER TENTS REQ.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-[11px]">
                        {palikaData.palikas.map((p) => (
                          <tr key={p.local_level_id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3.5 font-bold text-[#60A5FA]">{p.local_level_id}</td>
                            <td className="p-3.5 font-bold text-white">{p.local_level_name}</td>
                            <td className="p-3.5 text-right text-[#94A3B8]">{p.households.toLocaleString()}</td>
                            <td className="p-3.5 text-right font-bold text-white">{p.total_population.toLocaleString()}</td>
                            <td className="p-3.5 text-right font-bold text-[#34D399]">
                              {p.estimated_tents_needed.toLocaleString()} TENTS
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
