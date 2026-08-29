"""Pydantic v2 schemas for request and response serialization."""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


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
    source_trust_weight: float = Field(..., description="Base trust weight derived from source type (hospital/police > citizen > social_media)")
    has_coordinates_bonus: float = Field(..., description="Bonus for GPS coordinates present (+0.10)")
    corroboration_bonus: float = Field(..., description="Bonus for cluster corroboration from multiple independent reports")
    base_score: float = Field(..., description="Pre-decay combined reliability score (0-1)")
    elapsed_hours: float = Field(..., description="Simulated hours elapsed since report timestamp")
    staleness_decay: float = Field(..., description="Decay multiplier from exponential half-life curve")
    effective_score: float = Field(..., description="Final effective reliability score (0-1)")
    formula_explanation: str = Field(..., description="Human-readable formula breakdown")


class ReportCreateRequest(BaseModel):
    source_type: Literal["citizen", "police", "hospital", "social_media"] = Field(
        ..., description="Origin source type of the report"
    )
    raw_text: str = Field(..., min_length=1, description="Raw report description / text")
    reported_lat: Optional[float] = Field(default=None, description="Optional reported latitude")
    reported_lon: Optional[float] = Field(default=None, description="Optional reported longitude")
    timestamp: Optional[datetime] = Field(
        default=None, description="Report timestamp (defaults to current simulated time if omitted)"
    )


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
    summary_counts: dict[str, int] = Field(
        default_factory=dict,
        description="Counts of locations per status (verified_safe, verified_damaged, unverified, blackout)"
    )


class SimulationStateResponse(BaseModel):
    simulated_time: datetime
    is_running: bool
    start_time: datetime
    elapsed_hours: float
    total_reports_seeded: int
    reports_visible_at_current_time: int


class SimulationAdvanceRequest(BaseModel):
    hours: Optional[float] = Field(default=None, ge=0.0, description="Hours to advance simulation clock by")
    minutes: Optional[int] = Field(default=None, ge=0, description="Minutes to advance simulation clock by")


class SimulationSetTimeRequest(BaseModel):
    simulated_time: datetime = Field(..., description="Explicit timestamp to set simulation clock to")


class SeedResponse(BaseModel):
    message: str
    reports_seeded: int
    simulated_time: datetime
