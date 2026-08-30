/**
 * Type-safe API Client for Post-Disaster Information Fog & National Disaster Platform
 * Base backend URL: http://localhost:8000
 */

function getSanitizedApiUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes("<YOUR-") && !envUrl.includes("<your-")) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }
  } else if (process.env.NODE_ENV === "development") {
    return "http://localhost:8000";
  }
  return "https://prism-r2lh.onrender.com";
}

export const API_BASE_URL = getSanitizedApiUrl();

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
  current_simulated_time: string;
  start_time: string;
  elapsed_hours: number;
  total_reports_in_db: number;
  reports_visible_at_current_time: number;
  is_running: boolean;
}

// -------------------------------------------------------------
// Capability 1: Geospatial Telemetry & GIS
// -------------------------------------------------------------

export interface GisSectorTelemetry {
  sector_id: string;
  sector_name: string;
  status: LocationStatusType;
  confidence_score: number;
  severity_index: number; // 0.0 to 10.0
  threat_tier: string;
  latitude: number;
  longitude: number;
  elevation_meters: number;
  distance_to_epicenter_km: number;
  active_incidents_count: number;
  estimated_casualties: number;
  isolation_index: number;
  last_telemetry_timestamp?: string | null;
  satellite_corroborated: boolean;
  satellite_sensor: string;
}

export interface GisFeatureCollection {
  type: string;
  simulated_time: string;
  sectors: GisSectorTelemetry[];
}

export interface H3HexagonItem {
  h3_index: string;
  sector_id: string;
  sector_name: string;
  sub_region: string;
  center_lat: number;
  center_lon: number;
  polygon_coordinates: number[][];
  resolution: number;
  baseline_population: number;
  report_frequency_delta_t: number;
  adjacent_hazard_index: number;
  silent_exposure_metric_ecell: number;
  is_blackout: boolean;
  status: "critical" | "moderate" | "blackout" | "safe";
  status_color: string;
  threat_tier: string;
}

export interface H3GridResponse {
  type: string;
  total_hexagons: number;
  resolution: number;
  blackout_cells_count: number;
  hexagons: H3HexagonItem[];
}

// -------------------------------------------------------------
// Capability 2: Deduplication & Unified Truth
// -------------------------------------------------------------

export interface AgencyBreakdownItem {
  source_type: string;
  report_count: number;
  trust_weight: number;
  casualty_claims: number[];
  consensus_claim?: number | null;
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
  agency_breakdown: AgencyBreakdownItem[];
  confidence_score: number;
  representative_truth_text: string;
  verification_status: string;
  satellite_corroborated: boolean;
  satellite_damage_points_count: number;
  satellite_sensor_source: string;
  satellite_evidence_summary: string;
}

export interface UnifiedTruthResponse {
  simulated_time: string;
  total_clusters: number;
  disputed_clusters_count: number;
  corroborated_clusters_count: number;
  unified_records: UnifiedTruthRecord[];
}

export interface RawChaoticMessage {
  id: number;
  source: string;
  raw_text: string;
  sender: string;
  time_offset_min: number;
  location_hint: string;
  noise_flags: string[];
}

export interface PrioritizedRescueDirective {
  rank: number;
  task_code: string;
  target_location: string;
  hazard_type: string;
  reconciled_casualties?: number;
  hospitalized_triage_count?: number;
  confidence_score: number;
  deduplicated_inputs_count: number;
  contributing_sources: string[];
  recommended_action: string;
  ai_synthesis_explanation: string;
}

export interface BeforeAfterShowcaseResponse {
  raw_messages_count: number;
  raw_messages: RawChaoticMessage[];
  condensed_directives_count: number;
  condensed_directives: PrioritizedRescueDirective[];
  compression_ratio: string;
  time_decay_filtered_count: number;
  duplicate_merged_count: number;
  population_auto_matched_count: number;
}

// -------------------------------------------------------------
// Capability 3: Blackout Risk Intelligence
// -------------------------------------------------------------

export interface SpatialPhysicsFactors {
  elevation_meters: number;
  slope_gradient_degrees: number;
  epicenter_distance_km: number;
  epicenter_distance_hazard: number;
  landslide_susceptibility_index: number;
  road_access_impedance: number;
  critical_bridge_severed: boolean;
  structural_fragility_index?: number;
  masonry_ratio_pct?: number;
  concrete_ratio_pct?: number;
}

export interface BlackoutRiskAssessment {
  sector_id: string;
  sector_name: string;
  is_in_blackout: boolean;
  silence_duration_hours?: number | null;
  inferred_risk_score: number; // 0.0 to 100.0
  threat_tier: string;
  recommended_recon_priority: number;
  spatial_physics: SpatialPhysicsFactors;
  risk_explanation: string;
  sensor_anomalies: string[];
}

export interface AllBlackoutRisksResponse {
  simulated_time: string;
  blackout_sectors_count: number;
  assessments: BlackoutRiskAssessment[];
}

// -------------------------------------------------------------
// Capability 4: Population Exposure & Probabilistic Missing Reconciliation
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
  last_known_location_name?: string;
  reported_by: string;
  contact_number?: string | null;
  status: "missing" | "hospitalized" | "located_safe" | "deceased";
  physical_description?: string | null;
  matched_hospital_notes?: string | null;
  timestamp: string;
}

export interface PalikaItem {
  local_level_id: number;
  province_id: number;
  province_name: string;
  district_id: number;
  district_name: string;
  sector_id: string;
  local_level_name: string;
  households: number;
  total_population: number;
  male_population: number;
  female_population: number;
  estimated_tents_needed: number;
  estimated_ration_packs_needed: number;
}

export interface SectorPalikaBreakdown {
  sector_id: string;
  sector_name: string;
  total_palikas: number;
  total_households: number;
  total_population: number;
  male_population: number;
  female_population: number;
  palikas: PalikaItem[];
}

export interface ShelterCheckinItem {
  checkin_id: number;
  facility_name: string;
  facility_type: string;
  person_name: string;
  age?: number | null;
  gender?: string | null;
  identifying_features?: string | null;
  sector_id: string;
  health_status: string;
  timestamp: string;
}

export interface ReconciliationMatchItem {
  missing_person_id: number;
  missing_name: string;
  missing_age?: number | null;
  missing_sector: string;
  missing_desc?: string | null;
  checkin_id: number;
  found_name: string;
  found_age?: number | null;
  found_facility: string;
  found_sector: string;
  found_desc?: string | null;
  health_status: string;
  match_score: number;
  confidence_tier: "HIGH_AUTO_MATCH" | "SUGGESTED_REVIEW";
}

export interface ReconciliationLedgerResponse {
  missing_ledger_count: number;
  found_checkins_count: number;
  auto_matched_count: number;
  suggested_review_count: number;
  missing_records: MissingPersonItem[];
  found_checkins: ShelterCheckinItem[];
  auto_reconciled_matches: ReconciliationMatchItem[];
  suggested_matches_queue: ReconciliationMatchItem[];
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
  status: "available" | "dispatched" | "on_scene" | "maintenance";
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
// Capability 6: SITREP Briefing Report
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

// Capability 1: GIS & H3 Hexagonal Grid
export async function fetchGisTelemetry(): Promise<GisFeatureCollection> {
  const res = await fetch(`${API_BASE_URL}/gis/telemetry`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch GIS telemetry`);
  return res.json();
}

export async function fetchH3GridTelemetry(): Promise<H3GridResponse> {
  const res = await fetch(`${API_BASE_URL}/gis/h3-grid`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch H3 grid`);
  return res.json();
}

// Capability 2: Deduplication & Before/After Showcase
export async function fetchUnifiedTruth(): Promise<UnifiedTruthResponse> {
  const res = await fetch(`${API_BASE_URL}/deduplication/unified-truth`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch unified truth`);
  return res.json();
}

export async function fetchBeforeAfterShowcase(): Promise<BeforeAfterShowcaseResponse> {
  const res = await fetch(`${API_BASE_URL}/deduplication/before-after-showcase`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch before/after showcase`);
  return res.json();
}

// Capability 3: Blackout Risk Intelligence
export async function fetchBlackoutRisks(): Promise<AllBlackoutRisksResponse> {
  const res = await fetch(`${API_BASE_URL}/blackout-intel/risk-assessment`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch blackout risks`);
  return res.json();
}

// Capability 4: Population Exposure & Probabilistic Reconciliation
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

export async function fetchReconciliationLedger(): Promise<ReconciliationLedgerResponse> {
  const res = await fetch(`${API_BASE_URL}/population/reconciliation-ledger`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch reconciliation ledger`);
  return res.json();
}

export async function confirmReconciliationMatch(missingPersonId: number, checkinId: number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/population/confirm-match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ missing_person_id: missingPersonId, checkin_id: checkinId, confirmed: true }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to confirm match`);
  return res.json();
}

export async function fetchSectorPalikas(sectorId: string): Promise<SectorPalikaBreakdown> {
  const res = await fetch(`${API_BASE_URL}/population/palikas/${encodeURIComponent(sectorId)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch palikas for sector ${sectorId}`);
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
