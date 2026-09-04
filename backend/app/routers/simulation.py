"""API router for simulation replay clock, dataset seeding, and scenario lifecycle management."""

import json
import re
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import (
    SimulationStateResponse,
    SimulationAdvanceRequest,
    SimulationSetTimeRequest,
    SeedResponse,
    ScenarioCreateRequest,
    ScenarioResponse,
    ScenarioAdvanceRequest,
    ScenarioListResponse,
    SectorScenarioStateSchema,
)
from app.models.db import (
    DisasterScenarioDB,
    SectorScenarioStateDB,
    InfrastructureStatusDB,
    ScenarioEventDB,
    SilentZoneAssessmentDB,
)
from app.pipeline.gazetteer import LOCATIONS
from app.simulation.clock import (
    get_or_create_clock,
    get_simulation_state,
    advance_clock,
    reset_clock,
    set_clock_time,
    get_simulated_time,
    get_active_disaster_type,
    get_active_preset_id,
    set_active_disaster,
)
from app.simulation.generator import seed_database
from app.simulation.scenario_presets import (
    list_all_scenario_presets,
    get_scenario_preset,
    SCENARIO_PRESETS,
    ScenarioPreset,
)

router = APIRouter(prefix="", tags=["Simulation & Replay"])


def _slugify(text: str) -> str:
    s = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[-\s]+", "_", s) or "custom_scenario"


def _preset_to_response(preset: ScenarioPreset, db: Session) -> ScenarioResponse:
    active_id = get_active_preset_id()
    is_active = (active_id == preset.preset_id) or (active_id == preset.disaster_type)
    clock = get_or_create_clock(db)
    sim_time = get_simulated_time(db)
    t0 = clock.start_time
    if t0.tzinfo is None:
        t0 = t0.replace(tzinfo=timezone.utc)
    elapsed = max(0.0, (sim_time - t0).total_seconds() / 3600.0) if is_active else 0.0
    status_str = "RUNNING" if (is_active and clock.is_running) else "READY"

    sector_states: list[SectorScenarioStateSchema] = []
    for sec_id in preset.initial_affected_sectors:
        loc = LOCATIONS.get(sec_id)
        name = loc.name if loc else sec_id.title()
        is_silent = sec_id in preset.suspected_silent_zones
        sector_states.append(
            SectorScenarioStateSchema(
                sector_id=sec_id,
                sector_name=name,
                silence_risk_score=0.88 if is_silent else 0.25,
                exposed_population=45000,
                damage_score=7.5 if is_silent else 3.0,
                telecom_status="COLLAPSED" if is_silent else "OPERATIONAL",
                power_status="SEVERED" if is_silent else "OPERATIONAL",
                road_status="DEGRADED" if is_silent else "OPERATIONAL",
                water_status="OPERATIONAL",
                is_silent_zone=is_silent,
                dominant_silence_cause="H2_TELECOM_BLACKOUT" if is_silent else None,
            )
        )

    return ScenarioResponse(
        scenario_id=preset.preset_id,
        title=preset.title,
        disaster_type=preset.disaster_type,
        description=preset.description,
        status=status_str,
        center_lat=preset.center_lat,
        center_lon=preset.center_lon,
        default_zoom=preset.default_zoom,
        elapsed_hours=round(elapsed, 2),
        simulated_time=sim_time,
        initial_affected_sectors=preset.initial_affected_sectors,
        suspected_silent_zones=preset.suspected_silent_zones,
        critical_lifelines_at_risk=preset.critical_lifelines_at_risk,
        tags=preset.tags,
        sector_states=sector_states,
        created_at=datetime(2026, 8, 30, 6, 0, tzinfo=timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )


def _db_to_response(db_item: DisasterScenarioDB, db: Session) -> ScenarioResponse:
    active_id = get_active_preset_id()
    is_active = (active_id == db_item.scenario_id)
    clock = get_or_create_clock(db)
    sim_time = get_simulated_time(db)
    t0 = clock.start_time
    if t0.tzinfo is None:
        t0 = t0.replace(tzinfo=timezone.utc)
    elapsed = max(0.0, (sim_time - t0).total_seconds() / 3600.0) if is_active else db_item.elapsed_hours
    status_str = db_item.status
    if is_active and status_str not in ("RESET", "PAUSED", "COMPLETED") and clock.is_running:
        status_str = "RUNNING"

    states = db.query(SectorScenarioStateDB).filter(SectorScenarioStateDB.scenario_id == db_item.scenario_id).all()
    sector_states: list[SectorScenarioStateSchema] = []
    for s in states:
        loc = LOCATIONS.get(s.sector_id)
        name = loc.name if loc else s.sector_id.title()
        sector_states.append(
            SectorScenarioStateSchema(
                sector_id=s.sector_id,
                sector_name=name,
                silence_risk_score=s.silence_risk_score,
                exposed_population=s.exposed_population,
                damage_score=s.damage_score,
                telecom_status=s.telecom_status,
                power_status=s.power_status,
                road_status=s.road_status,
                water_status=s.water_status,
                is_silent_zone=s.is_silent_zone,
                dominant_silence_cause=s.dominant_silence_cause,
            )
        )

    initial_affected = json.loads(db_item.initial_affected_sectors_json) if db_item.initial_affected_sectors_json else []
    suspected_silent = json.loads(db_item.suspected_silent_zones_json) if db_item.suspected_silent_zones_json else []
    critical_lifelines = json.loads(db_item.critical_lifelines_at_risk_json) if db_item.critical_lifelines_at_risk_json else []
    tags = json.loads(db_item.config_json) if db_item.config_json else []

    created_at = db_item.created_at or datetime.now(timezone.utc)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    updated_at = db_item.updated_at or datetime.now(timezone.utc)
    if updated_at.tzinfo is None:
        updated_at = updated_at.replace(tzinfo=timezone.utc)

    return ScenarioResponse(
        scenario_id=db_item.scenario_id,
        title=db_item.title,
        disaster_type=db_item.disaster_type,
        description=db_item.description,
        status=status_str,
        center_lat=db_item.center_lat,
        center_lon=db_item.center_lon,
        default_zoom=db_item.default_zoom,
        elapsed_hours=round(elapsed, 2),
        simulated_time=sim_time if is_active else (db_item.simulated_time or sim_time),
        initial_affected_sectors=initial_affected,
        suspected_silent_zones=suspected_silent,
        critical_lifelines_at_risk=critical_lifelines,
        tags=tags,
        sector_states=sector_states,
        created_at=created_at,
        updated_at=updated_at,
    )


# =============================================================
# Milestone 2: Scenario Lifecycle CRUD Endpoints
# =============================================================

@router.post(
    "/simulation/scenarios",
    response_model=ScenarioResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a custom multi-disaster scenario",
)
def create_scenario(payload: ScenarioCreateRequest, db: Session = Depends(get_db)):
    """Creates a custom disaster simulation scenario with affected sectors, lifelines, and suspected silent zones."""
    base_id = _slugify(payload.title)
    scenario_id = base_id
    idx = 1
    while db.query(DisasterScenarioDB).filter(DisasterScenarioDB.scenario_id == scenario_id).first() or scenario_id in SCENARIO_PRESETS:
        scenario_id = f"{base_id}_{idx}"
        idx += 1

    sim_time = get_simulated_time(db)
    new_scenario = DisasterScenarioDB(
        scenario_id=scenario_id,
        title=payload.title,
        disaster_type=payload.disaster_type,
        description=payload.description,
        status="READY",
        center_lat=payload.center_lat,
        center_lon=payload.center_lon,
        default_zoom=payload.default_zoom,
        initial_affected_sectors_json=json.dumps(payload.initial_affected_sectors),
        suspected_silent_zones_json=json.dumps(payload.suspected_silent_zones),
        critical_lifelines_at_risk_json=json.dumps(payload.critical_lifelines_at_risk),
        config_json=json.dumps(payload.tags),
        elapsed_hours=0.0,
        simulated_time=sim_time,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(new_scenario)

    # Initialize sector scenario states
    for sec_id in payload.initial_affected_sectors:
        loc = LOCATIONS.get(sec_id)
        is_silent = sec_id in payload.suspected_silent_zones
        sector_state = SectorScenarioStateDB(
            scenario_id=scenario_id,
            sector_id=sec_id,
            silence_risk_score=0.90 if is_silent else 0.20,
            exposed_population=40000,
            damage_score=8.0 if is_silent else 2.5,
            telecom_status="COLLAPSED" if is_silent else "OPERATIONAL",
            power_status="SEVERED" if is_silent else "OPERATIONAL",
            road_status="DEGRADED" if is_silent else "OPERATIONAL",
            water_status="OPERATIONAL",
            is_silent_zone=is_silent,
            dominant_silence_cause="H2_TELECOM_BLACKOUT" if is_silent else None,
            updated_at=datetime.now(timezone.utc),
        )
        db.add(sector_state)

    db.commit()
    db.refresh(new_scenario)
    return _db_to_response(new_scenario, db)


@router.get(
    "/simulation/scenarios",
    response_model=ScenarioListResponse,
    summary="List all scenarios (presets and custom)",
)
def list_scenarios(db: Session = Depends(get_db)):
    """List all available disaster scenarios, including predefined presets and custom registered scenarios."""
    scenarios: list[ScenarioResponse] = []

    # Built-in presets
    for preset in list_all_scenario_presets():
        scenarios.append(_preset_to_response(preset, db))

    # Custom DB scenarios
    db_items = db.query(DisasterScenarioDB).order_by(DisasterScenarioDB.created_at.desc()).all()
    for db_item in db_items:
        scenarios.append(_db_to_response(db_item, db))

    return ScenarioListResponse(
        total_scenarios=len(scenarios),
        active_scenario_id=get_active_preset_id(),
        scenarios=scenarios,
    )


@router.get(
    "/simulation/scenarios/{scenario_id}",
    response_model=ScenarioResponse,
    summary="Get scenario details by ID",
)
def get_scenario(scenario_id: str, db: Session = Depends(get_db)):
    """Fetch complete scenario status, configuration, lifelines, and sector telemetry by scenario ID."""
    db_item = db.query(DisasterScenarioDB).filter(DisasterScenarioDB.scenario_id == scenario_id).first()
    if db_item:
        return _db_to_response(db_item, db)

    preset = SCENARIO_PRESETS.get(scenario_id)
    if not preset:
        # Fallback by disaster type match
        for p in SCENARIO_PRESETS.values():
            if p.disaster_type == scenario_id:
                preset = p
                break

    if preset:
        return _preset_to_response(preset, db)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Scenario with ID '{scenario_id}' was not found in registered database or presets.",
    )


@router.post(
    "/simulation/scenarios/{scenario_id}/start",
    response_model=ScenarioResponse,
    summary="Start and activate a scenario",
)
def start_scenario(scenario_id: str, reseed: bool = True, db: Session = Depends(get_db)):
    """Activate scenario, set status to RUNNING, reset clock to T0, and prepare realistic multi-disaster evidence stream."""
    db_item = db.query(DisasterScenarioDB).filter(DisasterScenarioDB.scenario_id == scenario_id).first()
    preset = SCENARIO_PRESETS.get(scenario_id)
    if not preset and not db_item:
        for p in SCENARIO_PRESETS.values():
            if p.disaster_type == scenario_id:
                preset = p
                break

    if not db_item and not preset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario with ID '{scenario_id}' not found.",
        )

    disaster_type = db_item.disaster_type if db_item else preset.disaster_type  # type: ignore
    set_active_disaster(disaster_type=disaster_type, preset_id=scenario_id)
    reset_clock(db)
    clock = get_or_create_clock(db)
    clock.is_running = True
    db.commit()

    if reseed:
        seed_database(db, force=True, disaster_type=disaster_type)

    if db_item:
        db_item.status = "RUNNING"
        db_item.elapsed_hours = 0.0
        db_item.simulated_time = get_simulated_time(db)
        db_item.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_item)
        return _db_to_response(db_item, db)

    return _preset_to_response(preset, db)  # type: ignore


@router.post(
    "/simulation/scenarios/{scenario_id}/advance",
    response_model=ScenarioResponse,
    summary="Advance scenario simulation clock forward",
)
def advance_scenario(
    scenario_id: str,
    payload: Optional[ScenarioAdvanceRequest] = None,
    db: Session = Depends(get_db),
):
    """Advances simulated time for the given scenario by specified hours and minutes."""
    hours = payload.hours if payload and payload.hours is not None else 1.0
    minutes = payload.minutes if payload and payload.minutes is not None else 0
    if hours == 0.0 and minutes == 0:
        hours = 1.0

    advance_clock(db, hours=hours, minutes=minutes)
    sim_t = get_simulated_time(db)

    db_item = db.query(DisasterScenarioDB).filter(DisasterScenarioDB.scenario_id == scenario_id).first()
    if db_item:
        db_item.elapsed_hours += hours + (minutes / 60.0)
        db_item.simulated_time = sim_t
        db_item.status = "RUNNING"
        db_item.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_item)
        return _db_to_response(db_item, db)

    preset = SCENARIO_PRESETS.get(scenario_id)
    if not preset:
        for p in SCENARIO_PRESETS.values():
            if p.disaster_type == scenario_id:
                preset = p
                break

    if preset:
        return _preset_to_response(preset, db)

    raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")


@router.post(
    "/simulation/scenarios/{scenario_id}/reset",
    response_model=ScenarioResponse,
    summary="Reset scenario to initial T0 state",
)
def reset_scenario(scenario_id: str, db: Session = Depends(get_db)):
    """Reset the scenario and simulation replay clock back to initial conditions."""
    reset_clock(db)
    clock = get_or_create_clock(db)
    clock.is_running = False
    db.commit()
    sim_t = get_simulated_time(db)

    db_item = db.query(DisasterScenarioDB).filter(DisasterScenarioDB.scenario_id == scenario_id).first()
    if db_item:
        db_item.status = "RESET"
        db_item.elapsed_hours = 0.0
        db_item.simulated_time = sim_t
        db_item.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_item)
        return _db_to_response(db_item, db)

    preset = SCENARIO_PRESETS.get(scenario_id)
    if not preset:
        for p in SCENARIO_PRESETS.values():
            if p.disaster_type == scenario_id:
                preset = p
                break

    if preset:
        return _preset_to_response(preset, db)

    raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")


# =============================================================
# Legacy Presets & Simulation Clock Endpoints (Full Backward Compatibility)
# =============================================================

@router.get("/simulation/state", response_model=SimulationStateResponse, summary="Get simulation clock state")
def get_state(db: Session = Depends(get_db)):
    """Get current simulated time, elapsed hours, active disaster category, and visible reports count."""
    return get_simulation_state(db)


@router.get("/simulation/presets", summary="List all 5 predefined disaster scenario presets")
def get_presets():
    """Returns all 5 predefined disaster scenarios (Gorkha, Melamchi, Rasuwa, Kathmandu Fire, Terai Cyclone)."""
    return {
        "presets": [p.model_dump() for p in list_all_scenario_presets()],
        "active_preset_id": get_active_preset_id(),
        "active_disaster_type": get_active_disaster_type(),
    }


@router.post("/simulation/preset/{preset_id}", response_model=SimulationStateResponse, summary="Load and activate a predefined disaster scenario preset")
def load_preset(preset_id: str, reseed: bool = True, db: Session = Depends(get_db)):
    """
    Activates a predefined scenario preset:
    - Sets disaster type and coordinates
    - Resets simulation replay clock to T0
    - Automatically re-seeds realistic multi-disaster evidence stream if reseed=True
    """
    preset = get_scenario_preset(preset_id)
    set_active_disaster(disaster_type=preset.disaster_type, preset_id=preset.preset_id)
    reset_clock(db)
    if reseed:
        seed_database(db, force=True, disaster_type=preset.disaster_type)
    return get_simulation_state(db)


@router.post("/simulation/disaster_type", response_model=SimulationStateResponse, summary="Switch active disaster category")
def switch_disaster_type(disaster_type: str, reseed: bool = True, db: Session = Depends(get_db)):
    """
    Switches the operational disaster category (earthquake, flash_flood, cyclone, landslide, urban_fire).
    """
    preset = get_scenario_preset(disaster_type)
    set_active_disaster(disaster_type=preset.disaster_type, preset_id=preset.preset_id)
    reset_clock(db)
    if reseed:
        seed_database(db, force=True, disaster_type=preset.disaster_type)
    return get_simulation_state(db)


@router.post("/simulation/advance", response_model=SimulationStateResponse, summary="Advance simulation replay clock")
def advance_simulation(payload: Optional[SimulationAdvanceRequest] = None, db: Session = Depends(get_db)):
    """
    Advance the simulation replay clock forward in time.
    If payload is omitted or empty, advances by 1.0 simulated hour by default.
    """
    hours = payload.hours if payload and payload.hours is not None else 0.0
    minutes = payload.minutes if payload and payload.minutes is not None else 0
    if hours == 0.0 and minutes == 0:
        hours = 1.0

    advance_clock(db, hours=hours, minutes=minutes)
    return get_simulation_state(db)


@router.post("/simulation/reset", response_model=SimulationStateResponse, summary="Reset simulation clock to T0")
def reset_simulation(db: Session = Depends(get_db)):
    """Reset the simulation replay clock back to the initial disaster start time (T0)."""
    reset_clock(db)
    return get_simulation_state(db)


@router.post("/simulation/set_time", response_model=SimulationStateResponse, summary="Set simulation clock to exact timestamp")
def set_simulation_time(payload: SimulationSetTimeRequest, db: Session = Depends(get_db)):
    """Set simulation clock to an explicit timestamp."""
    set_clock_time(db, payload.simulated_time)
    return get_simulation_state(db)


@router.post("/seed", response_model=SeedResponse, summary="Seed synthetic disaster reports")
def seed_data(force: bool = True, disaster_type: str = "earthquake", db: Session = Depends(get_db)):
    """
    Seed the database with rich synthetic reports for the selected disaster category.
    Defaults to force=True to reset fresh synthetic data.
    """
    count = seed_database(db, force=force, disaster_type=disaster_type)
    sim_t = get_simulated_time(db)
    return SeedResponse(
        message=f"Successfully seeded {count} synthetic reports into database for {disaster_type}.",
        reports_seeded=count,
        simulated_time=sim_t,
    )
