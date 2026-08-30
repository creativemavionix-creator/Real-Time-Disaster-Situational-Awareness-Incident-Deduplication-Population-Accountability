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

