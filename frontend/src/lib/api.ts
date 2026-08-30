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

export type LocationStatusType = "verified_safe" | "verified_damaged" | "unverified" | "blackout" | "investigating";

export interface BiasAnalysis {
  informal_report_pct: number;
  official_report_pct: number;
  bias_flag: "INFORMAL_SKEW_HIGH" | "OFFICIALLY_CONFIRMED" | "BALANCED" | "BLACKOUT_NO_TELEMETRY";
  explanation: string;
}

export interface AccountableOfficer {
  name: string;
  agency: string;
  role: string;
  contact_channel: string;
  last_attestation?: string | null;
}

export interface OperatorOverride {
  is_overridden: boolean;
  override_status?: string | null;
  confirmed_safe: boolean;
  operator_name?: string | null;
  operator_role?: string | null;
  badge_or_unit?: string | null;
  justification_notes?: string | null;
  timestamp?: string | null;
}

export interface LocationVerificationRankItem {
  location_id: string;
  location_name: string;
  rank: number;
  urgency_score: number;
  silence_duration_hours: number;
  estimated_exposed_population: number;
  structural_vulnerability_index: number;
  recommended_recon_sortie: string;
  primary_reason: string;
}

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
  operator_override?: OperatorOverride | null;
  accountable_officer?: AccountableOfficer | null;
  bias_analysis?: BiasAnalysis | null;
  human_safe_confirmation_required?: boolean;
}

export interface AllLocationsStatusResponse {
  simulated_time: string;
  locations: LocationStatusItem[];
  summary_counts: {
    verified_safe?: number;
    verified_damaged?: number;
    unverified?: number;
    blackout?: number;
    investigating?: number;
  };
  verification_ranking?: LocationVerificationRankItem[];
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

// -------------------------------------------------------------
// Capability 7: RESQ-SIGHT Multi-Modal Ground Truth & Research APIs
// -------------------------------------------------------------

export interface ResqSightManifestItem {
  dataset: string;
  role: string;
  project_module: string;
  source: string;
  source_url?: string;
  format: string;
  records_count?: number;
  files?: Array<{
    filename: string;
    relative_path: string;
    size_human: string;
    sha256: string;
  }>;
  validation?: {
    status: string;
    notes: string;
  };
}

export interface ResqSightManifestResponse {
  repository: string;
  status: string;
  total_datasets_count: number;
  datasets: ResqSightManifestItem[];
}

export interface GroundTruthCalibrationProfile {
  sector_id: string;
  sector_name: string;
  structural_fragility_index: number;
  masonry_ratio_pct: number;
  concrete_ratio_pct: number;
  historical_collapse_rate_pct: number;
  superstructure_dominant_type: string;
  construction_code_compliance: string;
  surveyed_buildings_count: number;
}

export interface GroundTruthCalibrationResponse {
  dataset_summary: {
    source: string;
    total_surveyed_buildings: number;
    damage_grade_distribution: {
      grade_1_low_damage_pct: number;
      grade_2_moderate_damage_pct: number;
      grade_3_severe_collapse_pct: number;
    };
    dominant_foundation_types: Record<string, string>;
    status: string;
    sectors_calibrated: number;
  };
  sector_fragility_profiles: GroundTruthCalibrationProfile[];
}

export interface SatelliteDamagePointItem {
  lat: number;
  lon: number;
  grading: string;
  sensor_name: string;
  sector_id: string;
  source_dataset: string;
}

export interface SatellitePointsResponse {
  summary: {
    unosat_damage_points_count: number;
    sectors_covered: string[];
    points_by_sector: Record<string, number>;
    sensors_active: string[];
    sentinel_sar_metadata: any;
  };
  points_count: number;
  damage_points: SatelliteDamagePointItem[];
}

export interface NlpStatsResponse {
  devanagari_ner_ebiquity: {
    dataset_source: string;
    total_tokens_processed: number;
    unique_location_entities: number;
    unique_org_entities: number;
    unique_person_entities: number;
    tag_distribution: Record<string, number>;
    status: string;
  };
  crisis_nlp_benchmarks: {
    datasets: Array<{
      name: string;
      role: string;
      record_count?: number;
      events_covered?: number;
      disaster_types?: string[];
      source: string;
      status: string;
    }>;
    sample_authentic_field_reports: string[];
  };
}

export interface CensusExposureSummaryResponse {
  census_year: number;
  source: string;
  total_tracked_palikas: number;
  total_monitored_population: number;
  total_households: number;
  sectors_breakdown: Array<{
    sector_id: string;
    palikas_count: number;
    total_population: number;
    households: number;
    palikas: Array<{
      name: string;
      population: number;
      households: number;
    }>;
  }>;
}

export async function fetchResqSightManifest(): Promise<ResqSightManifestResponse> {
  const res = await fetch(`${API_BASE_URL}/resq-sight/manifest`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch RESQ-SIGHT manifest`);
  return res.json();
}

export async function fetchGroundTruthCalibration(): Promise<GroundTruthCalibrationResponse> {
  const res = await fetch(`${API_BASE_URL}/resq-sight/ground-truth/calibration`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch ground-truth calibration`);
  return res.json();
}

export async function fetchSatellitePoints(): Promise<SatellitePointsResponse> {
  const res = await fetch(`${API_BASE_URL}/resq-sight/satellite/points`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch satellite damage points`);
  return res.json();
}

export async function fetchNlpStats(): Promise<NlpStatsResponse> {
  const res = await fetch(`${API_BASE_URL}/resq-sight/nlp/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch NLP stats`);
  return res.json();
}

export async function fetchCensusExposureSummary(): Promise<CensusExposureSummaryResponse> {
  const res = await fetch(`${API_BASE_URL}/resq-sight/exposure/summary`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch census exposure summary`);
  return res.json();
}


// =============================================================
// PRATYAKSH-Ω: Autonomous Negative Evidence & Reality Reconstruction
// =============================================================

export interface BaselineItem {
  id?: number;
  sector_id: string;
  metric: string;
  hour_of_day: number;
  day_of_week: number;
  expected_mean: number;
  expected_std: number;
  expected_min: number;
  expected_max: number;
  unit: string;
  source: string;
  provenance?: string;
}

export interface BaselineCatalogResponse {
  total_baselines: number;
  sector_count: number;
  metrics: string[];
  baselines: BaselineItem[];
}

export interface SectorBaselineComparison {
  sector_id: string;
  sector_name: string;
  current_hour: number;
  metric: string;
  expected_mean: number;
  expected_min: number;
  expected_max: number;
  observed_value: number;
  gap_delta: number;
  z_score: number;
  is_anomalous: boolean;
  status: "NORMAL" | "ELEVATED" | "UNEXPECTED_SILENCE" | "CRITICAL_BLACKOUT";
  explanation: string;
}

export interface NegativeEvidenceAnomalyItem {
  anomaly_id: string;
  sector_id: string;
  sector_name: string;
  metric: string;
  expected_value: number;
  observed_value: number;
  gap_magnitude: number;
  silence_duration_hours: number;
  confidence: number;
  severity_tier: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  explanation: string;
  detected_at: string;
  is_active: boolean;
}

export interface SilenceWindowItem {
  sector_id: string;
  sector_name: string;
  last_signal_timestamp?: string;
  silence_duration_hours: number;
  expected_events_lost: number;
  silence_severity: "NORMAL" | "ELEVATED_WATCH" | "CRITICAL_SILENCE" | "PROLONGED_BLACKOUT";
  landslide_risk: number;
  bridge_severed: boolean;
}

export interface NegativeEvidenceOverviewResponse {
  simulated_time: string;
  active_anomalies_count: number;
  critical_silent_sectors_count: number;
  anomalies: NegativeEvidenceAnomalyItem[];
  silence_windows: SilenceWindowItem[];
}

export interface HypothesisTraceItem {
  evidence_id: string;
  evidence_summary: string;
  delta_contribution: number;
  direction: "SUPPORTS" | "CONTRADICTS";
  source_reliability: number;
}

export interface CompetingHypothesisItem {
  hypothesis_code: "H1" | "H2" | "H3" | "H4" | "H5";
  sector_id: string;
  title: string;
  description: string;
  prior_probability: number;
  posterior_probability: number;
  confidence: number;
  status: "leading" | "plausible" | "unlikely" | "refuted";
  supporting_evidence: string[];
  contradicting_evidence: string[];
  explanation_traces: HypothesisTraceItem[];
}

export interface SectorHypothesesResponse {
  sector_id: string;
  sector_name: string;
  simulated_time: string;
  dominant_hypothesis: string;
  uncertainty_entropy: number;
  hypotheses: CompetingHypothesisItem[];
}

export interface AllHypothesesOverviewResponse {
  simulated_time: string;
  national_dominant_hypotheses: Record<string, string>;
  sector_entropy: Record<string, number>;
  sectors: SectorHypothesesResponse[];
}

export interface CounterfactualPredictionItem {
  prediction_id: string;
  hypothesis_code: string;
  sector_id: string;
  prediction_statement: string;
  expected_observation_type: string;
  verification_status: "CONFIRMED" | "CONTRADICTED" | "UNTESTED";
  matched_evidence_id?: string | null;
  consistency_weight: number;
}

export interface SectorCounterfactualResponse {
  sector_id: string;
  sector_name: string;
  consistency_score: number;
  predictions: CounterfactualPredictionItem[];
}

export interface VerificationActionItem {
  recommendation_id: string;
  sector_id: string;
  sector_name: string;
  action_type: string;
  action_title: string;
  target_hypotheses: string[];
  expected_information_gain: number;
  operational_risk_score: number;
  resource_cost_usd: number;
  eta_minutes: number;
  ranking_score: number;
  justification: string;
  status: "PENDING_REVIEW" | "APPROVED" | "MODIFIED" | "REJECTED" | "EXECUTED";
  created_at: string;
}

export interface RankedObservationsResponse {
  simulated_time: string;
  total_actions_evaluated: number;
  best_next_observation?: VerificationActionItem | null;
  candidate_actions: VerificationActionItem[];
}

export interface ActionReviewRequest {
  recommendation_id: string;
  decision: "APPROVED" | "MODIFIED" | "REJECTED";
  reviewer_role: "Viewer" | "Analyst" | "Officer" | "Administrator" | "Auditor";
  reviewer_name: string;
  justification: string;
  modifications?: Record<string, any>;
}

export interface ActionReviewResponse {
  audit_id: string;
  recommendation_id: string;
  decision: string;
  reviewer_role: string;
  status: string;
  message: string;
  timestamp: string;
}

export interface ActionAuditItem {
  audit_id: string;
  recommendation_id: string;
  sector_id: string;
  action_type: string;
  decision: string;
  reviewer_role: string;
  reviewer_name: string;
  justification?: string;
  resulting_evidence_id?: string;
  timestamp: string;
}

export interface AuditTrailResponse {
  total_audits: number;
  records: ActionAuditItem[];
}

export interface ExecutionResultPayload {
  recommendation_id: string;
  observed_finding: string;
  evidence_direction: "positive" | "negative";
  damage_confirmed: boolean;
  reliability: number;
}

export interface FeedbackLoopResultResponse {
  success: boolean;
  recommendation_id: string;
  generated_evidence_id: string;
  sector_id: string;
  previous_dominant_hypothesis: string;
  updated_dominant_hypothesis: string;
  entropy_reduction: number;
  updated_hypotheses: CompetingHypothesisItem[];
  message: string;
}

// PRATYAKSH-Ω API Client Functions
export async function fetchBaselinesCatalog(): Promise<BaselineCatalogResponse> {
  const res = await fetch(`${API_BASE_URL}/baselines`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch baselines catalog`);
  return res.json();
}

export async function fetchSectorBaselineComparison(sectorId: string): Promise<SectorBaselineComparison> {
  const res = await fetch(`${API_BASE_URL}/baselines/${encodeURIComponent(sectorId)}/comparison`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch baseline comparison for ${sectorId}`);
  return res.json();
}

export async function fetchNegativeEvidenceOverview(): Promise<NegativeEvidenceOverviewResponse> {
  const res = await fetch(`${API_BASE_URL}/negative-evidence/overview`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch negative evidence overview`);
  return res.json();
}

export async function fetchAllHypothesesOverview(): Promise<AllHypothesesOverviewResponse> {
  const res = await fetch(`${API_BASE_URL}/hypotheses/all`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch hypotheses overview`);
  return res.json();
}

export async function fetchSectorHypotheses(sectorId: string): Promise<SectorHypothesesResponse> {
  const res = await fetch(`${API_BASE_URL}/hypotheses/sector/${encodeURIComponent(sectorId)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch sector hypotheses for ${sectorId}`);
  return res.json();
}

export async function fetchSectorCounterfactuals(sectorId: string): Promise<SectorCounterfactualResponse> {
  const res = await fetch(`${API_BASE_URL}/hypotheses/counterfactuals/${encodeURIComponent(sectorId)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch counterfactuals for ${sectorId}`);
  return res.json();
}

export async function fetchRankedVerificationObservations(): Promise<RankedObservationsResponse> {
  const res = await fetch(`${API_BASE_URL}/verification/next-best-observations`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch ranked verification observations`);
  return res.json();
}

export async function reviewVerificationAction(payload: ActionReviewRequest): Promise<ActionReviewResponse> {
  const res = await fetch(`${API_BASE_URL}/verification/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to record action review`);
  return res.json();
}

export async function executeAndFeedReality(payload: ExecutionResultPayload): Promise<FeedbackLoopResultResponse> {
  const res = await fetch(`${API_BASE_URL}/verification/execute-and-feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to execute action feedback loop`);
  return res.json();
}

export async function fetchAuditTrail(): Promise<AuditTrailResponse> {
  const res = await fetch(`${API_BASE_URL}/verification/audit-trail`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch audit trail`);
  return res.json();
}

export async function overrideLocationStatus(locationId: string, payload: {
  override_status: string;
  confirmed_safe: boolean;
  operator_name: string;
  operator_role: string;
  badge_or_unit?: string;
  justification_notes: string;
}): Promise<{ success: boolean; location_id: string; effective_status: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/locations/${encodeURIComponent(locationId)}/override`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to override location status`);
  return res.json();
}

export async function submitOfficialReport(payload: {
  location_id: string;
  reporting_agency: string;
  officer_name: string;
  badge_number: string;
  damage_type: string;
  casualty_count: number;
  damage_grade: number;
  immediate_need: string;
  reported_lat?: number;
  reported_lon?: number;
  raw_notes: string;
}): Promise<ReportItem> {
  const res = await fetch(`${API_BASE_URL}/reports/official`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to submit official report`);
  return res.json();
}

export async function fetchLocationsVerificationRanking(): Promise<LocationVerificationRankItem[]> {
  const res = await fetch(`${API_BASE_URL}/locations/verification-ranking`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch verification rankings`);
  return res.json();
}



