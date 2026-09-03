"""Pydantic v2 schemas for all 6 platform capabilities."""

from datetime import datetime
from typing import Optional, Literal, Any
from pydantic import BaseModel, Field, ConfigDict


# -------------------------------------------------------------
# Base Core Schemas
# -------------------------------------------------------------

class LocationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    lat: float
    lon: float
    description: str = ""
    aliases: list[str] = Field(default_factory=list)


class LocationListResponse(BaseModel):
    locations: list[LocationSchema]
    total: int


class ScoreBreakdownSchema(BaseModel):
    source_trust_weight: float
    has_coordinates_bonus: float
    corroboration_bonus: float
    base_score: float
    elapsed_hours: float
    staleness_decay: float
    effective_score: float
    formula_explanation: str


class ReportCreateRequest(BaseModel):
    source_type: Literal["citizen", "police", "hospital", "social_media"]
    raw_text: str = Field(..., min_length=1)
    reported_lat: Optional[float] = None
    reported_lon: Optional[float] = None
    timestamp: Optional[datetime] = None


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    source_type: str
    raw_text: str
    reported_lat: Optional[float] = None
    reported_lon: Optional[float] = None
    timestamp: datetime
    resolved_location_id: Optional[str] = None
    resolved_location_name: Optional[str] = None
    location_resolved_by: str
    extracted_casualties: Optional[int] = None
    extracted_damage_type: str
    score_breakdown: ScoreBreakdownSchema
    cluster_id: Optional[int] = None


class IncidentClusterResponse(BaseModel):
    cluster_id: int
    location_id: str
    representative_text: str
    damage_type: str
    casualty_estimate: Optional[int] = None
    report_count: int
    sources_breakdown: dict[str, int]
    confidence_score: float
    first_reported: datetime
    last_reported: datetime
    reports: list[ReportResponse] = Field(default_factory=list)


LocationStatusType = Literal["verified_safe", "verified_damaged", "unverified", "blackout", "investigating"]


class BiasAnalysisSchema(BaseModel):
    informal_report_pct: float = Field(..., description="Percentage of reports from citizen or social media streams")
    official_report_pct: float = Field(..., description="Percentage of reports from police or hospital sources")
    bias_flag: Literal["INFORMAL_SKEW_HIGH", "OFFICIALLY_CONFIRMED", "BALANCED", "BLACKOUT_NO_TELEMETRY"] = "BALANCED"
    explanation: str = ""


class AccountableOfficerSchema(BaseModel):
    name: str = "Duty Operations Officer"
    agency: str = "Armed Police Force (APF) Disaster Response"
    role: str = "Sector Commander"
    contact_channel: str = "VHF Ch-04 / SAT-02"
    last_attestation: Optional[datetime] = None


class OperatorOverrideSchema(BaseModel):
    is_overridden: bool = False
    override_status: Optional[str] = None
    confirmed_safe: bool = False
    operator_name: Optional[str] = None
    operator_role: Optional[str] = None
    badge_or_unit: Optional[str] = None
    justification_notes: Optional[str] = None
    timestamp: Optional[datetime] = None


class LocationStatusResponse(BaseModel):
    location_id: str
    location_name: str
    lat: float
    lon: float
    status: LocationStatusType
    confidence_score: float
    report_count: int
    incident_cluster_count: int
    last_update: Optional[datetime] = None
    silence_duration_hours: Optional[float] = None
    top_incidents: list[IncidentClusterResponse] = Field(default_factory=list)
    status_reason: str
    operator_override: Optional[OperatorOverrideSchema] = None
    accountable_officer: Optional[AccountableOfficerSchema] = None
    bias_analysis: Optional[BiasAnalysisSchema] = None
    human_safe_confirmation_required: bool = False


class LocationOverrideRequest(BaseModel):
    override_status: LocationStatusType
    confirmed_safe: bool = False
    operator_name: str = Field(..., min_length=2)
    operator_role: Literal["Officer", "Analyst", "Administrator"] = "Officer"
    badge_or_unit: Optional[str] = None
    justification_notes: str = Field(..., min_length=5, description="Mandatory operational justification for audit ledger")


class LocationOverrideResponse(BaseModel):
    success: bool
    location_id: str
    effective_status: str
    confirmed_safe: bool
    operator_name: str
    timestamp: datetime
    message: str


class OfficialReportCreateRequest(BaseModel):
    location_id: str
    reporting_agency: Literal["Nepal Police", "Armed Police Force (APF)", "Nepal Army", "District Hospital", "Red Cross (NRCS)"]
    officer_name: str = Field(..., min_length=2)
    badge_number: str = Field(..., min_length=2)
    damage_type: Literal["structural_collapse", "road_blocked", "medical_emergency", "landslide_debris", "safe_clear", "critical_hazard"]
    casualty_count: int = Field(default=0, ge=0)
    damage_grade: int = Field(default=3, ge=1, le=5, description="EMS Damage Grade 1 (Negligible) to 5 (Total Collapse)")
    immediate_need: str = Field(..., description="E.g. SAR extraction team, surgical triage, heavy excavators")
    reported_lat: Optional[float] = None
    reported_lon: Optional[float] = None
    raw_notes: str = Field(..., min_length=5)


class OfficialReportCreateResponse(BaseModel):
    success: bool
    report_id: int
    location_id: str
    source_type: str = "police"
    assigned_trust_weight: float = 1.0
    status: str = "VERIFIED_OFFICIAL"
    message: str


class LocationVerificationRankSchema(BaseModel):
    location_id: str
    location_name: str
    rank: int
    urgency_score: float
    silence_duration_hours: float
    estimated_exposed_population: int
    structural_vulnerability_index: float
    recommended_recon_sortie: str
    primary_reason: str


class AllLocationsStatusResponse(BaseModel):
    simulated_time: datetime
    locations: list[LocationStatusResponse]
    summary_counts: dict[str, int] = Field(default_factory=dict)
    verification_ranking: list[LocationVerificationRankSchema] = Field(default_factory=list)


class SimulationStateResponse(BaseModel):
    simulated_time: datetime
    is_running: bool
    start_time: datetime
    elapsed_hours: float
    total_reports_seeded: int
    reports_visible_at_current_time: int
    disaster_type: str = "earthquake"
    active_preset_id: str = "gorkha_earthquake"
    disaster_display_name: str = "Seismic Rupture & Ground Motion"
    disaster_headline: str = "M7.8 Central Himalayan Thrust Rupture"


class SimulationAdvanceRequest(BaseModel):
    hours: Optional[float] = Field(default=None, ge=0.0)
    minutes: Optional[int] = Field(default=None, ge=0)


class SimulationSetTimeRequest(BaseModel):
    simulated_time: datetime


class SeedResponse(BaseModel):
    message: str
    reports_seeded: int
    simulated_time: datetime


# -------------------------------------------------------------
# Capability 1: Real-Time Situational GIS Telemetry
# -------------------------------------------------------------

class GisSectorGeometry(BaseModel):
    type: str = "Point"
    coordinates: list[float]  # [lon, lat]


class GisSectorTelemetry(BaseModel):
    sector_id: str
    sector_name: str
    status: LocationStatusType
    confidence_score: float
    severity_index: float  # 0.0 to 10.0
    threat_tier: str  # CRITICAL, HIGH, MODERATE, SAFE, BLACKOUT
    latitude: float
    longitude: float
    elevation_meters: int
    distance_to_epicenter_km: float
    active_incidents_count: int
    estimated_casualties: int
    isolation_index: float  # 0.0 (connected) to 1.0 (severed)
    last_telemetry_timestamp: Optional[datetime] = None
    satellite_corroborated: bool = False
    satellite_sensor: Optional[str] = None


class GisFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    simulated_time: datetime
    sectors: list[GisSectorTelemetry]


# -------------------------------------------------------------
# Capability 2: Multi-Agency Deduplication & Unified Truth
# -------------------------------------------------------------

class AgencyReportBreakdown(BaseModel):
    source_type: str
    report_count: int
    casualty_claims: list[int] = Field(default_factory=list)
    consensus_claim: Optional[int] = None
    trust_weight: float


class UnifiedTruthRecord(BaseModel):
    cluster_id: int
    sector_id: str
    sector_name: str
    consensus_damage_type: str
    unified_casualty_estimate: int
    casualty_dispute_range: tuple[int, int]
    has_conflicts: bool
    conflict_summary: str
    agency_breakdown: list[AgencyReportBreakdown]
    confidence_score: float
    representative_truth_text: str
    verification_status: str  # CORROBORATED_TRUTH, DISPUTED, UNVERIFIED_RUMOR
    satellite_corroborated: bool = False
    satellite_damage_points_count: int = 0
    satellite_sensor_source: Optional[str] = None
    satellite_evidence_summary: Optional[str] = None



class UnifiedTruthResponse(BaseModel):
    simulated_time: datetime
    total_clusters: int
    disputed_clusters_count: int
    corroborated_clusters_count: int
    unified_records: list[UnifiedTruthRecord]


# -------------------------------------------------------------
# Capability 3: Silent Blackout Risk Intelligence
# -------------------------------------------------------------

class SpatialPhysicsFactors(BaseModel):
    epicenter_distance_km: float
    epicenter_distance_hazard: float  # 0 to 1
    slope_gradient_degrees: float
    landslide_susceptibility_index: float  # 0 to 1
    critical_bridge_severed: bool
    road_access_impedance: float  # 0 to 1
    elevation_meters: int
    structural_fragility_index: float = 0.5  # 0.0 to 1.0 (Calibrated from 260K Gorkha buildings)
    masonry_ratio_pct: float = 50.0  # Percentage of stone/mud mortar structures
    concrete_ratio_pct: float = 50.0  # Percentage of reinforced concrete structures
    historical_collapse_rate_pct: float = 50.0  # Historical Grade 3 collapse rate
    superstructure_dominant_type: str = "Mixed Masonry / RC"



class BlackoutRiskAssessment(BaseModel):
    sector_id: str
    sector_name: str
    is_in_blackout: bool
    silence_duration_hours: Optional[float]
    spatial_physics: SpatialPhysicsFactors
    inferred_risk_score: float  # 0.0 to 100.0
    threat_tier: Literal["CRITICAL_INFERRED", "HIGH_INFERRED", "MODERATE", "LOW", "VERIFIED_SAFE"]
    risk_explanation: str
    recommended_recon_priority: int  # 1 (Urgent) to 5 (Low)


class AllBlackoutRisksResponse(BaseModel):
    simulated_time: datetime
    blackout_sectors_count: int
    high_risk_blackout_count: int
    assessments: list[BlackoutRiskAssessment]


# -------------------------------------------------------------
# Capability 4: Dynamic Population Exposure & Missing Persons
# -------------------------------------------------------------

class PopulationExposureItem(BaseModel):
    sector_id: str
    sector_name: str
    census_baseline_population: int
    diurnal_commuter_flux: int
    tourist_density_estimate: int
    evacuated_population_estimate: int
    real_time_exposed_population: int
    high_density_hazard_zones: list[str]
    missing_persons_reported: int
    located_safe_count: int


class AllPopulationExposureResponse(BaseModel):
    simulated_time: datetime
    total_national_exposed_population: int
    total_missing_persons: int
    total_located_safe: int
    sector_exposures: list[PopulationExposureItem]


class MissingPersonCreate(BaseModel):
    full_name: str = Field(..., min_length=2)
    age: Optional[int] = None
    gender: Optional[str] = None
    last_known_location_id: str
    reported_by: str
    contact_number: Optional[str] = None
    physical_description: Optional[str] = None
    notes: Optional[str] = None


class MissingPersonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    last_known_location_id: str
    last_known_location_name: Optional[str] = None
    reported_by: str
    contact_number: Optional[str] = None
    status: str  # missing, hospitalized, located_safe, deceased
    physical_description: Optional[str] = None
    timestamp: datetime


class PalikaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    local_level_id: int
    province_id: int
    province_name: str
    district_id: int
    district_name: str
    sector_id: str
    local_level_name: str
    households: int
    total_population: int
    male_population: int
    female_population: int
    estimated_tents_needed: int
    estimated_ration_packs_needed: int


class SectorPalikasResponse(BaseModel):
    sector_id: str
    sector_name: str
    total_palikas: int
    total_households: int
    total_population: int
    male_population: int
    female_population: int
    palikas: list[PalikaResponse]



# -------------------------------------------------------------
# Capability 5: Tactical Resource Dispatch Engine
# -------------------------------------------------------------

class ResourceUnitSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    unit_code: str
    unit_name: str
    unit_type: str  # sar_heavy, air_ambulance, heavy_excavator, mobile_comms, medical_triage
    home_base: str
    current_location_id: Optional[str] = None
    status: str  # available, dispatched, on_scene, maintenance
    capacity: int


class TacticalDispatchRecommendation(BaseModel):
    target_sector_id: str
    target_sector_name: str
    priority_score: float  # 0.0 to 100.0
    threat_tier: str
    is_blackout: bool
    rationale: str
    recommended_unit_types: list[str]
    available_matching_units: list[ResourceUnitSchema]
    assigned_missions_count: int


class MissionDispatchCreate(BaseModel):
    target_location_id: str
    assigned_unit_id: int
    justification: str


class MissionDispatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    mission_code: str
    target_location_id: str
    target_location_name: Optional[str] = None
    assigned_unit_id: int
    assigned_unit_name: Optional[str] = None
    priority_score: float
    threat_tier: str
    justification: str
    status: str
    dispatched_at: datetime


class DispatchDashboardResponse(BaseModel):
    simulated_time: datetime
    available_units_count: int
    active_missions_count: int
    recommendations: list[TacticalDispatchRecommendation]
    resource_units: list[ResourceUnitSchema]
    active_missions: list[MissionDispatchResponse]


# -------------------------------------------------------------
# Capability 6: 24-Hour Timeline & SITREP Generator
# -------------------------------------------------------------

class SitrepCasualtyToll(BaseModel):
    confirmed_fatalities: int
    confirmed_injured: int
    trapped_unaccounted: int
    missing_persons_active: int


class SitrepPriorityAction(BaseModel):
    action_code: str
    target_sector: str
    urgency: Literal["IMMEDIATE", "HIGH", "PRIORITY", "ROUTINE"]
    description: str


class SitrepReportResponse(BaseModel):
    sitrep_id: str
    operational_period: str
    simulated_time: datetime
    elapsed_hours: float
    disaster_event_name: str = "Central Nepal Seismic Sequence (M7.8)"
    executive_summary: str
    casualty_toll: SitrepCasualtyToll
    critical_sectors_summary: list[dict[str, Any]]
    blackout_intelligence_briefing: str
    resource_deployment_status: dict[str, int]
    priority_operational_directives: list[SitrepPriorityAction]
    authorized_by: str = "National Emergency Operations Centre (NEOC)"


# -------------------------------------------------------------
# PRATYAKSH-Ω: Autonomous Negative Evidence & Reality Reconstruction Schemas
# -------------------------------------------------------------

class BaselineItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    sector_id: str
    metric: str
    hour_of_day: int
    day_of_week: int = 0
    expected_mean: float
    expected_std: float
    expected_min: float
    expected_max: float
    unit: str = "events/hour"
    source: str = "historical_telecom_census"
    provenance: Optional[str] = None


class BaselineCatalogResponse(BaseModel):
    total_baselines: int
    sector_count: int
    metrics: list[str]
    baselines: list[BaselineItem]


class SectorBaselineComparison(BaseModel):
    sector_id: str
    sector_name: str
    current_hour: int
    metric: str
    expected_mean: float
    expected_min: float
    expected_max: float
    observed_value: float
    gap_delta: float
    z_score: float
    is_anomalous: bool
    status: Literal["NORMAL", "ELEVATED", "UNEXPECTED_SILENCE", "CRITICAL_BLACKOUT"]
    explanation: str


class EvidenceItemSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    evidence_id: str
    sector_id: str
    source_type: str
    source_id: Optional[str] = None
    timestamp: datetime
    observation_type: str
    observed_value: Optional[float] = None
    expected_value: Optional[float] = None
    raw_payload: Optional[str] = None
    direction: Literal["positive", "negative"] = "positive"
    reliability: float = Field(0.7, ge=0.0, le=1.0)
    freshness_weight: float = 1.0
    status: Literal["active", "stale", "superseded", "disproven"] = "active"
    contradictions: list[str] = []
    provenance: Optional[str] = None


class MultiModalEvidenceIngest(BaseModel):
    sector_id: str
    source_type: str
    source_id: Optional[str] = None
    observation_type: str
    observed_value: Optional[float] = None
    expected_value: Optional[float] = None
    raw_payload: str
    direction: Literal["positive", "negative"] = "positive"
    reliability: float = 0.8
    timestamp: Optional[datetime] = None


class NegativeEvidenceAnomalyItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    anomaly_id: str
    sector_id: str
    sector_name: str
    metric: str
    expected_value: float
    observed_value: float
    gap_magnitude: float
    silence_duration_hours: float
    confidence: float
    severity_tier: Literal["CRITICAL", "HIGH", "MODERATE", "LOW"]
    explanation: str
    detected_at: datetime
    is_active: bool


class SilenceWindowItem(BaseModel):
    sector_id: str
    sector_name: str
    last_signal_timestamp: Optional[datetime]
    silence_duration_hours: float
    expected_events_lost: float
    silence_severity: Literal["NORMAL", "ELEVATED_WATCH", "CRITICAL_SILENCE", "PROLONGED_BLACKOUT"]
    landslide_risk: float
    bridge_severed: bool


class NegativeEvidenceOverviewResponse(BaseModel):
    simulated_time: datetime
    active_anomalies_count: int
    critical_silent_sectors_count: int
    anomalies: list[NegativeEvidenceAnomalyItem]
    silence_windows: list[SilenceWindowItem]


class HypothesisTraceItem(BaseModel):
    evidence_id: str
    evidence_summary: str
    delta_contribution: float
    direction: Literal["SUPPORTS", "CONTRADICTS"]
    source_reliability: float


class CompetingHypothesisItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    hypothesis_code: Literal["H1", "H2", "H3", "H4", "H5"]
    sector_id: str
    title: str
    description: str
    prior_probability: float
    posterior_probability: float
    confidence: float
    status: Literal["leading", "plausible", "unlikely", "refuted"]
    supporting_evidence: list[str] = []
    contradicting_evidence: list[str] = []
    explanation_traces: list[HypothesisTraceItem] = []


class SectorHypothesesResponse(BaseModel):
    sector_id: str
    sector_name: str
    simulated_time: datetime
    dominant_hypothesis: str
    uncertainty_entropy: float  # Shannon Entropy H(P)
    hypotheses: list[CompetingHypothesisItem]


class AllHypothesesOverviewResponse(BaseModel):
    simulated_time: datetime
    national_dominant_hypotheses: dict[str, str]
    sector_entropy: dict[str, float]
    sectors: list[SectorHypothesesResponse]


class CounterfactualPredictionItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    prediction_id: str
    hypothesis_code: str
    sector_id: str
    prediction_statement: str
    expected_observation_type: str
    verification_status: Literal["CONFIRMED", "CONTRADICTED", "UNTESTED"]
    matched_evidence_id: Optional[str] = None
    consistency_weight: float = 1.0


class SectorCounterfactualResponse(BaseModel):
    sector_id: str
    sector_name: str
    consistency_score: float
    predictions: list[CounterfactualPredictionItem]


class VerificationActionItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    recommendation_id: str
    sector_id: str
    sector_name: str
    action_type: str
    action_title: str
    target_hypotheses: list[str]
    expected_information_gain: float  # Delta Entropy
    operational_risk_score: float
    resource_cost_usd: float
    eta_minutes: int
    ranking_score: float
    justification: str
    status: Literal["PENDING_REVIEW", "APPROVED", "MODIFIED", "REJECTED", "EXECUTED"]
    created_at: datetime


class RankedObservationsResponse(BaseModel):
    simulated_time: datetime
    total_actions_evaluated: int
    best_next_observation: Optional[VerificationActionItem]
    candidate_actions: list[VerificationActionItem]


class ActionReviewRequest(BaseModel):
    recommendation_id: str
    decision: Literal["APPROVED", "MODIFIED", "REJECTED"]
    reviewer_role: Literal["Viewer", "Analyst", "Officer", "Administrator", "Auditor"] = "Officer"
    reviewer_name: str = "Duty Operations Commander"
    justification: str
    modifications: Optional[dict[str, Any]] = None


class ActionReviewResponse(BaseModel):
    audit_id: str
    recommendation_id: str
    decision: str
    reviewer_role: str
    status: str
    message: str
    timestamp: datetime


class ActionAuditItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    audit_id: str
    recommendation_id: str
    sector_id: str
    action_type: str
    decision: str
    reviewer_role: str
    reviewer_name: str
    justification: Optional[str]
    resulting_evidence_id: Optional[str]
    timestamp: datetime


class AuditTrailResponse(BaseModel):
    total_audits: int
    records: list[ActionAuditItem]


class ExecutionResultPayload(BaseModel):
    recommendation_id: str
    observed_finding: str
    evidence_direction: Literal["positive", "negative"] = "positive"
    damage_confirmed: bool = True
    reliability: float = 0.95


class FeedbackLoopResultResponse(BaseModel):
    success: bool
    recommendation_id: str
    generated_evidence_id: str
    sector_id: str
    previous_dominant_hypothesis: str
    updated_dominant_hypothesis: str
    entropy_reduction: float
    updated_hypotheses: list[CompetingHypothesisItem]
    message: str

