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


LocationStatusType = Literal["verified_safe", "verified_damaged", "unverified", "blackout"]


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


class AllLocationsStatusResponse(BaseModel):
    simulated_time: datetime
    locations: list[LocationStatusResponse]
    summary_counts: dict[str, int] = Field(default_factory=dict)


class SimulationStateResponse(BaseModel):
    simulated_time: datetime
    is_running: bool
    start_time: datetime
    elapsed_hours: float
    total_reports_seeded: int
    reports_visible_at_current_time: int


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
