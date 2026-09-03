"""API router for simulation replay clock and dataset seeding."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import (
    SimulationStateResponse,
    SimulationAdvanceRequest,
    SimulationSetTimeRequest,
    SeedResponse,
)
from app.simulation.clock import (
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
)

router = APIRouter(prefix="", tags=["Simulation & Replay"])


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
def advance_simulation(payload: SimulationAdvanceRequest = None, db: Session = Depends(get_db)):
    """
    Advance the simulation replay clock forward in time.
    If payload is omitted or empty, advances by 1.0 simulated hour by default.
    """
    hours = payload.hours if payload and payload.hours is not None else 0.0
    minutes = payload.minutes if payload and payload.minutes is not None else 0
    if hours == 0.0 and minutes == 0:
        hours = 1.0  # Default 1 hour step
        
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
    Seed the database with 250-350 rich synthetic reports for the selected disaster category.
    Defaults to force=True to reset fresh synthetic data.
    """
    count = seed_database(db, force=force, disaster_type=disaster_type)
    sim_t = get_simulated_time(db)
    return SeedResponse(
        message=f"Successfully seeded {count} synthetic reports into database for {disaster_type}.",
        reports_seeded=count,
        simulated_time=sim_t,
    )

