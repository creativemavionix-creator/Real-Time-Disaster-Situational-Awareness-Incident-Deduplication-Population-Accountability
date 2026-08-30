/**
 * Type-safe API Client for Post-Disaster Information Fog & National Disaster Platform
 * Base backend URL: http://localhost:8000
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// -------------------------------------------------------------
// Core Schemas
// -------------------------------------------------------------

export interface ScoreBreakdown {
  source_trust_weight: number;
  has_coordinates_bonus: number;
  corroboration_bonus: number;
  base_score: number;
  elapsed_hours: number;
  staleness_decay: number;
  effective_score: number;
  formula_explanation: string;
}

export interface ReportItem {
  id: number;
  source_type: "citizen" | "police" | "hospital" | "social_media";
  raw_text: str;
  reported_lat?: number | null;
  reported_lon?: number | null;
  timestamp: string;
  resolved_location_id?: string | null;
  resolved_location_name?: string | null;
  location_resolved_by: string;
  extracted_casualties?: number | null;
  extracted_damage_type: string;
  score_breakdown: ScoreBreakdown;
  cluster_id?: number | null;
}

type str = string;

export type LocationStatusType = "verified_safe" | "verified_damaged" | "unverified" | "blackout";

export interface IncidentCluster {
  cluster_id: number;
  location_id: string;
  representative_text: string;
  damage_type: string;
  casualty_estimate?: number | null;
  report_count: number;
  sources_breakdown: { [source: string]: number };
  confidence_score: number;
  first_reported: string;
  last_reported: string;
  reports: ReportItem[];
}

export type IncidentClusterItem = IncidentCluster;

export interface LocationStatusItem {
  location_id: string;
  location_name: string;
  lat: number;
  lon: number;
  status: LocationStatusType;
  confidence_score: number;
  report_count: number;
  incident_cluster_count: number;
  last_update?: string | null;
  silence_duration_hours?: number | null;
  top_incidents: IncidentCluster[];
  status_reason: string;
}

export interface AllLocationsStatusResponse {
  simulated_time: string;
  locations: LocationStatusItem[];
  summary_counts: {
    verified_safe?: number;
    verified_damaged?: number;
    unverified?: number;
    blackout?: number;
  };
}

export interface SimulationState {
  simulated_time: string;
  is_running: boolean;
  start_time: string;
  elapsed_hours: number;
  total_reports_seeded: number;
  reports_visible_at_current_time: number;
}

// -------------------------------------------------------------
// Capability 1: GIS Telemetry Schemas
// -------------------------------------------------------------

export interface GisSectorTelemetry {
  sector_id: string;
  sector_name: string;
  status: "verified_safe" | "verified_damaged" | "unverified" | "blackout";
  confidence_score: number;
  severity_index: number;
  threat_tier: string;
  latitude: number;
  longitude: number;
  elevation_meters: number;
  distance_to_epicenter_km: number;
  active_incidents_count: number;
  estimated_casualties: number;
  isolation_index: number;
  last_telemetry_timestamp?: string | null;
}

export interface GisFeatureCollection {
  type: string;
  simulated_time: string;
  sectors: GisSectorTelemetry[];
}

// -------------------------------------------------------------
// Capability 2: Unified Truth & Deduplication Schemas
// -------------------------------------------------------------

export interface AgencyReportBreakdown {
  source_type: string;
  report_count: number;
  casualty_claims: number[];
  consensus_claim?: number | null;
  trust_weight: number;
}

export interface UnifiedTruthRecord {
  cluster_id: number;
  sector_id: string;
  sector_name: string;
  consensus_damage_type: string;
  unified_casualty_estimate: number;
  casualty_dispute_range: [number, number];
  has_conflicts: boolean;
  conflict_summary: string;
  agency_breakdown: AgencyReportBreakdown[];
  confidence_score: number;
  representative_truth_text: string;
  verification_status: string;
}

export interface UnifiedTruthResponse {
  simulated_time: string;
  total_clusters: number;
  disputed_clusters_count: number;
  corroborated_clusters_count: number;
  unified_records: UnifiedTruthRecord[];
}

// -------------------------------------------------------------
// Capability 3: Blackout Risk Intelligence Schemas
// -------------------------------------------------------------

export interface SpatialPhysicsFactors {
  epicenter_distance_km: number;
  epicenter_distance_hazard: number;
  slope_gradient_degrees: number;
  landslide_susceptibility_index: number;
  critical_bridge_severed: boolean;
  road_access_impedance: number;
  elevation_meters: number;
}

export interface BlackoutRiskAssessment {
  sector_id: string;
  sector_name: string;
  is_in_blackout: boolean;
  silence_duration_hours?: number | null;
  spatial_physics: SpatialPhysicsFactors;
  inferred_risk_score: number;
  threat_tier: "CRITICAL_INFERRED" | "HIGH_INFERRED" | "MODERATE" | "LOW" | "VERIFIED_SAFE";
  risk_explanation: string;
  recommended_recon_priority: number;
}

export interface AllBlackoutRisksResponse {
  simulated_time: string;
  blackout_sectors_count: number;
  high_risk_blackout_count: number;
  assessments: BlackoutRiskAssessment[];
}

// -------------------------------------------------------------
// Capability 4: Dynamic Population & Missing Persons
// -------------------------------------------------------------

export interface PopulationExposureItem {
  sector_id: string;
  sector_name: string;
  census_baseline_population: number;
  diurnal_commuter_flux: number;
  tourist_density_estimate: number;
  evacuated_population_estimate: number;
  real_time_exposed_population: number;
  high_density_hazard_zones: string[];
  missing_persons_reported: number;
  located_safe_count: number;
}

export interface AllPopulationExposureResponse {
  simulated_time: string;
  total_national_exposed_population: number;
  total_missing_persons: number;
  total_located_safe: number;
  sector_exposures: PopulationExposureItem[];
}

export interface MissingPersonItem {
  id: number;
  full_name: string;
  age?: number | null;
  gender?: string | null;
  last_known_location_id: string;
  last_known_location_name?: string | null;
  reported_by: string;
  contact_number?: string | null;
  status: string;
  physical_description?: string | null;
  matched_hospital_notes?: string | null;
  timestamp: string;
}

// -------------------------------------------------------------
// Capability 5: Tactical Resource Dispatch
// -------------------------------------------------------------

export interface ResourceUnitItem {
  id: number;
  unit_code: string;
  unit_name: string;
  unit_type: string;
  home_base: string;
  current_location_id?: string | null;
  status: string;
  capacity: number;
}

export interface TacticalDispatchRecommendation {
  target_sector_id: string;
  target_sector_name: string;
  priority_score: number;
  threat_tier: string;
  is_blackout: boolean;
  rationale: string;
  recommended_unit_types: string[];
  available_matching_units: ResourceUnitItem[];
  assigned_missions_count: number;
}

export interface MissionDispatchItem {
  id: number;
  mission_code: string;
  target_location_id: string;
  target_location_name?: string | null;
  assigned_unit_id: number;
  assigned_unit_name?: string | null;
  priority_score: number;
  threat_tier: string;
  justification: string;
  status: string;
  dispatched_at: string;
}

export interface DispatchDashboardResponse {
  simulated_time: string;
  available_units_count: number;
  active_missions_count: number;
  recommendations: TacticalDispatchRecommendation[];
  resource_units: ResourceUnitItem[];
  active_missions: MissionDispatchItem[];
}

// -------------------------------------------------------------
// Capability 6: SITREP Generator
// -------------------------------------------------------------

export interface SitrepCasualtyToll {
  confirmed_fatalities: number;
  confirmed_injured: number;
  trapped_unaccounted: number;
  missing_persons_active: number;
}

export interface SitrepPriorityAction {
  action_code: string;
  target_sector: string;
  urgency: "IMMEDIATE" | "HIGH" | "PRIORITY" | "ROUTINE";
  description: string;
}

export interface SitrepReportResponse {
  sitrep_id: string;
  operational_period: string;
  simulated_time: string;
  elapsed_hours: number;
  disaster_event_name: string;
  executive_summary: string;
  casualty_toll: SitrepCasualtyToll;
  critical_sectors_summary: Array<{
    sector_id: string;
    sector_name: string;
    status: string;
    confidence: number;
    active_reports: number;
    status_reason: string;
  }>;
  blackout_intelligence_briefing: string;
  resource_deployment_status: {
    available_units: number;
    dispatched_active: number;
    total_inventory: number;
  };
  priority_operational_directives: SitrepPriorityAction[];
  authorized_by: string;
}

// -------------------------------------------------------------
// API Client Methods
// -------------------------------------------------------------

export async function fetchAllLocationsStatus(): Promise<AllLocationsStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/locations/status`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch location status`);
  return res.json();
}

export async function fetchLocationIncidents(locationId: string): Promise<IncidentCluster[]> {
  const res = await fetch(`${API_BASE_URL}/locations/${encodeURIComponent(locationId)}/incidents`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch incidents for ${locationId}`);
  return res.json();
}

export async function fetchSimulationState(): Promise<SimulationState> {
  const res = await fetch(`${API_BASE_URL}/simulation/state`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch simulation state`);
  return res.json();
}

export async function advanceSimulation(hours: number = 1.0, minutes: number = 0): Promise<SimulationState> {
  const res = await fetch(`${API_BASE_URL}/simulation/advance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hours, minutes }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to advance simulation`);
  return res.json();
}

export async function resetSimulation(): Promise<SimulationState> {
  const res = await fetch(`${API_BASE_URL}/simulation/reset`, { method: "POST" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to reset simulation`);
  return res.json();
}

export async function seedDatabase(): Promise<{ message: string; reports_seeded: number }> {
  const res = await fetch(`${API_BASE_URL}/seed`, { method: "POST" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to seed database`);
  return res.json();
}

export async function submitReport(payload: {
  source_type: "citizen" | "police" | "hospital" | "social_media";
  raw_text: string;
  reported_lat?: number | null;
  reported_lon?: number | null;
}): Promise<ReportItem> {
  const res = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Capability 1: GIS
export async function fetchGisTelemetry(): Promise<GisFeatureCollection> {
  const res = await fetch(`${API_BASE_URL}/gis/telemetry`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch GIS telemetry`);
  return res.json();
}

// Capability 2: Deduplication & Unified Truth
export async function fetchUnifiedTruth(): Promise<UnifiedTruthResponse> {
  const res = await fetch(`${API_BASE_URL}/deduplication/unified-truth`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch unified truth`);
  return res.json();
}

// Capability 3: Blackout Risk Intelligence
export async function fetchBlackoutRisks(): Promise<AllBlackoutRisksResponse> {
  const res = await fetch(`${API_BASE_URL}/blackout-intel/risk-assessment`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch blackout risks`);
  return res.json();
}

// Capability 4: Population Exposure & Missing Persons
export async function fetchPopulationExposure(): Promise<AllPopulationExposureResponse> {
  const res = await fetch(`${API_BASE_URL}/population/exposure`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch population exposure`);
  return res.json();
}

export async function fetchMissingPersons(query?: string, sectorId?: string): Promise<MissingPersonItem[]> {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (sectorId) params.set("sector_id", sectorId);
  const url = `${API_BASE_URL}/population/missing-persons${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch missing persons`);
  return res.json();
}

export async function submitMissingPerson(payload: {
  full_name: string;
  age?: number | null;
  gender?: string | null;
  last_known_location_id: string;
  reported_by: string;
  contact_number?: string | null;
  physical_description?: string | null;
  notes?: string | null;
}): Promise<MissingPersonItem> {
  const res = await fetch(`${API_BASE_URL}/population/missing-persons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Capability 5: Tactical Resource Dispatch
export async function fetchDispatchDashboard(): Promise<DispatchDashboardResponse> {
  const res = await fetch(`${API_BASE_URL}/dispatch/dashboard`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch dispatch dashboard`);
  return res.json();
}

export async function assignMission(payload: {
  target_location_id: string;
  assigned_unit_id: number;
  justification: string;
}): Promise<MissionDispatchItem> {
  const res = await fetch(`${API_BASE_URL}/dispatch/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Capability 6: SITREP Generator
export async function fetchCurrentSitrep(): Promise<SitrepReportResponse> {
  const res = await fetch(`${API_BASE_URL}/sitrep/current`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch current SITREP`);
  return res.json();
}
