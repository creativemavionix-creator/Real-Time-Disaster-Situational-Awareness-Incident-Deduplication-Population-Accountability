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
