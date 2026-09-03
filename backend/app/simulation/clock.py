"""Simulation replay clock state management."""

from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config import settings
from app.models.db import SimulationClockDB, ReportDB
from app.models.schemas import SimulationStateResponse


def get_or_create_clock(db: Session) -> SimulationClockDB:
    """Retrieve the singleton simulation clock row, creating it if not present."""
    clock = db.query(SimulationClockDB).filter(SimulationClockDB.id == 1).first()
    if not clock:
        start_t = settings.SIMULATION_START_TIME
        if start_t.tzinfo is None:
            start_t = start_t.replace(tzinfo=timezone.utc)
            
        clock = SimulationClockDB(
            id=1,
            current_sim_time=start_t,
            start_time=start_t,
            is_running=False
        )
        db.add(clock)
        db.commit()
        db.refresh(clock)
    return clock


def get_simulated_time(db: Session) -> datetime:
    """Get the current simulated timestamp (UTC)."""
    clock = get_or_create_clock(db)
    sim_t = clock.current_sim_time
    if sim_t.tzinfo is None:
        sim_t = sim_t.replace(tzinfo=timezone.utc)
    return sim_t


def advance_clock(db: Session, hours: float = 0.0, minutes: int = 0) -> datetime:
    """Advance simulation clock by specified hours or minutes."""
    clock = get_or_create_clock(db)
    delta = timedelta(hours=hours, minutes=minutes)
    if delta.total_seconds() == 0:
        # Default step: advance by 1 hour
        delta = timedelta(hours=1.0)
        
    new_time = clock.current_sim_time + delta
    clock.current_sim_time = new_time
    db.commit()
    db.refresh(clock)
    
    sim_t = clock.current_sim_time
    if sim_t.tzinfo is None:
        sim_t = sim_t.replace(tzinfo=timezone.utc)
    return sim_t


def reset_clock(db: Session) -> datetime:
    """Reset simulation clock back to T0 (SIMULATION_START_TIME)."""
    clock = get_or_create_clock(db)
    start_t = settings.SIMULATION_START_TIME
    if start_t.tzinfo is None:
        start_t = start_t.replace(tzinfo=timezone.utc)
        
    clock.current_sim_time = start_t
    clock.start_time = start_t
    clock.is_running = False
    db.commit()
    db.refresh(clock)
    return start_t


def set_clock_time(db: Session, target_time: datetime) -> datetime:
    """Set simulation clock to an explicit target timestamp."""
    clock = get_or_create_clock(db)
    if target_time.tzinfo is None:
        target_time = target_time.replace(tzinfo=timezone.utc)
    clock.current_sim_time = target_time
    db.commit()
    db.refresh(clock)
    return target_time


from app.simulation.disaster_types import get_disaster_profile
from app.simulation.scenario_presets import get_scenario_preset

_ACTIVE_DISASTER_TYPE: str = "earthquake"
_ACTIVE_PRESET_ID: str = "gorkha_earthquake"


def get_active_disaster_type() -> str:
    """Retrieve the current active disaster category."""
    return _ACTIVE_DISASTER_TYPE


def get_active_preset_id() -> str:
    """Retrieve the current active scenario preset ID."""
    return _ACTIVE_PRESET_ID


def set_active_disaster(disaster_type: str, preset_id: Optional[str] = None):
    """Set active disaster category and scenario preset."""
    global _ACTIVE_DISASTER_TYPE, _ACTIVE_PRESET_ID
    _ACTIVE_DISASTER_TYPE = disaster_type.lower().strip()
    if preset_id:
        _ACTIVE_PRESET_ID = preset_id.lower().strip()
    else:
        preset = get_scenario_preset(_ACTIVE_DISASTER_TYPE)
        _ACTIVE_PRESET_ID = preset.preset_id


def get_simulation_state(db: Session) -> SimulationStateResponse:
    """Get full status and metadata of the simulation clock."""
    clock = get_or_create_clock(db)
    sim_t = clock.current_sim_time
    if sim_t.tzinfo is None:
        sim_t = sim_t.replace(tzinfo=timezone.utc)
    start_t = clock.start_time
    if start_t.tzinfo is None:
        start_t = start_t.replace(tzinfo=timezone.utc)
        
    elapsed_seconds = max(0.0, (sim_t - start_t).total_seconds())
    elapsed_hours = round(elapsed_seconds / 3600.0, 2)
    
    total_reports = db.query(func.count(ReportDB.id)).scalar() or 0
    active_reports = db.query(func.count(ReportDB.id)).filter(ReportDB.timestamp <= sim_t).scalar() or 0
    
    profile = get_disaster_profile(_ACTIVE_DISASTER_TYPE)

    return SimulationStateResponse(
        simulated_time=sim_t,
        is_running=clock.is_running,
        start_time=start_t,
        elapsed_hours=elapsed_hours,
        total_reports_seeded=total_reports,
        reports_visible_at_current_time=active_reports,
        disaster_type=_ACTIVE_DISASTER_TYPE,
        active_preset_id=_ACTIVE_PRESET_ID,
        disaster_display_name=profile.display_name,
        disaster_headline=profile.headline,
    )

