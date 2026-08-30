"""Database ORM models using SQLAlchemy."""

from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class ReportDB(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_type = Column(String(32), nullable=False)
    raw_text = Column(Text, nullable=False)
    reported_lat = Column(Float, nullable=True)
    reported_lon = Column(Float, nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    resolved_location_id = Column(String(64), nullable=True, index=True)
    location_resolved_by = Column(String(32), nullable=False, default="unresolved")
    extracted_casualties = Column(Integer, nullable=True)
    extracted_damage_type = Column(String(64), nullable=False, default="unspecified")
    confidence_hint = Column(Float, nullable=False, default=0.5)
    embedding_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SimulationClockDB(Base):
    __tablename__ = "simulation_clock"

    id = Column(Integer, primary_key=True, default=1)
    current_sim_time = Column(DateTime(timezone=True), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    is_running = Column(Boolean, nullable=False, default=False)


class MissingPersonDB(Base):
    __tablename__ = "missing_persons"

    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(128), nullable=False, index=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(16), nullable=True)
    last_known_location_id = Column(String(64), nullable=False, index=True)
    reported_by = Column(String(128), nullable=False)
    contact_number = Column(String(64), nullable=True)
    status = Column(String(32), nullable=False, default="missing")  # missing, hospitalized, located_safe, deceased
    physical_description = Column(Text, nullable=True)
    hospital_match_id = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ResourceUnitDB(Base):
    __tablename__ = "resource_units"

    id = Column(Integer, primary_key=True, autoincrement=True)
    unit_code = Column(String(32), unique=True, nullable=False)
    unit_name = Column(String(128), nullable=False)
    unit_type = Column(String(64), nullable=False)  # sar_heavy, air_ambulance, heavy_excavator, mobile_comms, medical_triage
    home_base = Column(String(128), nullable=False)
    current_location_id = Column(String(64), nullable=True)
    status = Column(String(32), nullable=False, default="available")  # available, dispatched, on_scene, maintenance
    capacity = Column(Integer, nullable=False, default=10)
    capabilities_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class DispatchMissionDB(Base):
    __tablename__ = "dispatch_missions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mission_code = Column(String(32), unique=True, nullable=False)
    target_location_id = Column(String(64), nullable=False, index=True)
    assigned_unit_id = Column(Integer, nullable=False)
    priority_score = Column(Float, nullable=False)
    threat_tier = Column(String(32), nullable=False)
    justification = Column(Text, nullable=False)
    status = Column(String(32), nullable=False, default="dispatched")  # dispatched, en_route, on_scene, completed
    dispatched_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)


class PalikaDB(Base):
    __tablename__ = "palikas"

    local_level_id = Column(Integer, primary_key=True, index=True)
    province_id = Column(Integer, nullable=False)
    province_name = Column(String(64), nullable=False)
    district_id = Column(Integer, nullable=False, index=True)
    district_name = Column(String(64), nullable=False, index=True)
    sector_id = Column(String(64), nullable=False, index=True)
    local_level_name = Column(String(128), nullable=False)
    households = Column(Integer, nullable=False, default=0)
    total_population = Column(Integer, nullable=False, default=0)
    male_population = Column(Integer, nullable=False, default=0)
    female_population = Column(Integer, nullable=False, default=0)


# ==========================================
# PRATYAKSH-Ω ORM Models
# ==========================================

class BaselineDB(Base):
    """Expected reality baseline profile for temporal activity modeling."""
    __tablename__ = "baselines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sector_id = Column(String(64), nullable=False, index=True)
    metric = Column(String(64), nullable=False, index=True)  # telecom_call_rate, report_volume, sensor_ping_rate, mobility_flux
    hour_of_day = Column(Integer, nullable=False)  # 0 - 23
    day_of_week = Column(Integer, nullable=False, default=0)  # 0=Monday .. 6=Sunday
    expected_mean = Column(Float, nullable=False)
    expected_std = Column(Float, nullable=False)
    expected_min = Column(Float, nullable=False)
    expected_max = Column(Float, nullable=False)
    unit = Column(String(32), nullable=False, default="events/hour")
    source = Column(String(128), nullable=False, default="historical_telecom_census")
    provenance = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class EvidenceDB(Base):
    """Structured Multi-Modal Evidence Item."""
    __tablename__ = "evidence_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    evidence_id = Column(String(64), unique=True, nullable=False, index=True)
    sector_id = Column(String(64), nullable=False, index=True)
    source_type = Column(String(64), nullable=False)  # human_report, sensor_iot, telecom_cdr, remote_sensing_sar, optical_satellite, police_radio
    source_id = Column(String(128), nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    observation_type = Column(String(64), nullable=False)  # signal_loss, structural_collapse, casualty_count, bridge_severance, tower_down
    observed_value = Column(Float, nullable=True)
    expected_value = Column(Float, nullable=True)
    raw_payload = Column(Text, nullable=True)
    direction = Column(String(16), nullable=False, default="positive")  # positive, negative (absence)
    reliability = Column(Float, nullable=False, default=0.7)  # 0.0 - 1.0
    freshness_weight = Column(Float, nullable=False, default=1.0)
    status = Column(String(32), nullable=False, default="active")  # active, stale, superseded, disproven
    contradictions_json = Column(Text, nullable=True)
    provenance = Column(String(128), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class NegativeEvidenceAnomalyDB(Base):
    """Detected unexpected gaps between expected and observed reality."""
    __tablename__ = "negative_evidence_anomalies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    anomaly_id = Column(String(64), unique=True, nullable=False, index=True)
    sector_id = Column(String(64), nullable=False, index=True)
    metric = Column(String(64), nullable=False)
    expected_value = Column(Float, nullable=False)
    observed_value = Column(Float, nullable=False)
    gap_magnitude = Column(Float, nullable=False)  # Z-score or ratio
    silence_duration_hours = Column(Float, nullable=False, default=0.0)
    confidence = Column(Float, nullable=False, default=0.8)
    severity_tier = Column(String(32), nullable=False, default="CRITICAL")  # CRITICAL, HIGH, MODERATE, LOW
    explanation = Column(Text, nullable=False)
    detected_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)


class HypothesisDB(Base):
    """Competing hypotheses explaining unexpected reality gaps."""
    __tablename__ = "competing_hypotheses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    hypothesis_code = Column(String(16), nullable=False)  # H1, H2, H3, H4, H5
    sector_id = Column(String(64), nullable=False, index=True)
    title = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    prior_probability = Column(Float, nullable=False, default=0.2)
    posterior_probability = Column(Float, nullable=False, default=0.2)
    confidence = Column(Float, nullable=False, default=0.5)
    supporting_evidence_json = Column(Text, nullable=True)
    contradicting_evidence_json = Column(Text, nullable=True)
    explanation_trace_json = Column(Text, nullable=True)
    status = Column(String(32), nullable=False, default="active")  # leading, plausible, unlikely, refuted
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class CounterfactualPredictionDB(Base):
    """Predicted observations generated to test competing hypotheses."""
    __tablename__ = "counterfactual_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    prediction_id = Column(String(64), unique=True, nullable=False, index=True)
    hypothesis_code = Column(String(16), nullable=False)
    sector_id = Column(String(64), nullable=False, index=True)
    prediction_statement = Column(Text, nullable=False)
    expected_observation_type = Column(String(64), nullable=False)
    verification_status = Column(String(32), nullable=False, default="UNTESTED")  # CONFIRMED, CONTRADICTED, UNTESTED
    matched_evidence_id = Column(String(64), nullable=True)
    consistency_weight = Column(Float, nullable=False, default=1.0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class VerificationRecommendationDB(Base):
    """Ranked Active Verification Candidates / Next Best Observations."""
    __tablename__ = "verification_recommendations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    recommendation_id = Column(String(64), unique=True, nullable=False, index=True)
    sector_id = Column(String(64), nullable=False, index=True)
    action_type = Column(String(64), nullable=False)  # drone_uav_recon, satellite_sar_tasking, field_patrol_recon, lora_iot_probe, cctv_poll, local_palika_query
    action_title = Column(String(128), nullable=False)
    target_hypotheses_json = Column(Text, nullable=False)  # ["H2", "H5"]
    expected_information_gain = Column(Float, nullable=False)  # Delta Shannon Entropy
    operational_risk_score = Column(Float, nullable=False, default=0.2)  # 0 (Safe) - 1 (Hazardous)
    resource_cost_usd = Column(Float, nullable=False, default=150.0)
    eta_minutes = Column(Integer, nullable=False, default=30)
    ranking_score = Column(Float, nullable=False)  # Combined multi-criteria score
    justification = Column(Text, nullable=False)
    status = Column(String(32), nullable=False, default="PENDING_REVIEW")  # PENDING_REVIEW, APPROVED, MODIFIED, REJECTED, EXECUTED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ActionReviewAuditDB(Base):
    """Human approval governance and audit trail."""
    __tablename__ = "action_review_audits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    audit_id = Column(String(64), unique=True, nullable=False, index=True)
    recommendation_id = Column(String(64), nullable=False, index=True)
    sector_id = Column(String(64), nullable=False)
    action_type = Column(String(64), nullable=False)
    decision = Column(String(32), nullable=False)  # APPROVED, MODIFIED, REJECTED
    reviewer_role = Column(String(32), nullable=False, default="Officer")  # Officer, Analyst, Administrator, Auditor
    reviewer_name = Column(String(128), nullable=False, default="Duty Operations Commander")
    justification = Column(Text, nullable=True)
    modifications_json = Column(Text, nullable=True)
    resulting_evidence_id = Column(String(64), nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))


class LocationOverrideDB(Base):
    """Human operator confirmation or override on location situational status."""
    __tablename__ = "location_overrides"

    id = Column(Integer, primary_key=True, autoincrement=True)
    location_id = Column(String(64), nullable=False, index=True)
    override_status = Column(String(32), nullable=False)  # verified_safe, verified_damaged, unverified, blackout, investigating
    confirmed_safe = Column(Boolean, nullable=False, default=False)
    operator_name = Column(String(128), nullable=False, default="Duty Commander")
    operator_role = Column(String(32), nullable=False, default="Officer")
    badge_or_unit = Column(String(128), nullable=True)
    justification_notes = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))


