"""API router for Tactical Resource Dispatch Engine."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import ReportDB, ResourceUnitDB, DispatchMissionDB
from app.models.schemas import (
    DispatchDashboardResponse,
    TacticalDispatchRecommendation,
    ResourceUnitSchema,
    MissionDispatchCreate,
    MissionDispatchResponse,
)
from app.pipeline.clustering import ReportItem
from app.pipeline.embedder import deserialize_embedding
from app.pipeline.dispatch_engine import (
    calculate_dispatch_recommendations,
    assign_dispatch_mission,
)
from app.pipeline.gazetteer import get_location_by_id
from app.simulation.clock import get_simulated_time

router = APIRouter(prefix="/dispatch", tags=["Tactical Resource Dispatch"])


def _db_to_report_item(r: ReportDB) -> ReportItem:
    emb = deserialize_embedding(r.embedding_json)
    return ReportItem(
        id=r.id,
        source_type=r.source_type,
        raw_text=r.raw_text,
        reported_lat=r.reported_lat,
        reported_lon=r.reported_lon,
        timestamp=r.timestamp,
        resolved_location_id=r.resolved_location_id,
        location_resolved_by=r.location_resolved_by,
        extracted_casualties=r.extracted_casualties,
        extracted_damage_type=r.extracted_damage_type,
        confidence_hint=r.confidence_hint,
        embedding=emb,
    )


@router.get("/dashboard", response_model=DispatchDashboardResponse, summary="Get full tactical dispatch control center data")
def get_dispatch_dashboard(
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """Retrieve tactical deployment queue, live unit availability, and active deployment missions."""
    effective_time = sim_time or get_simulated_time(db)
    db_reports = db.query(ReportDB).filter(ReportDB.timestamp <= effective_time).all()
    report_items = [_db_to_report_item(r) for r in db_reports]

    recommendations = calculate_dispatch_recommendations(db=db, reports=report_items, simulated_now=effective_time)
    units_db = db.query(ResourceUnitDB).all()
    units_schema = [ResourceUnitSchema.model_validate(u) for u in units_db]

    missions_db = db.query(DispatchMissionDB).order_by(DispatchMissionDB.dispatched_at.desc()).all()
    missions_schema: list[MissionDispatchResponse] = []

    for m in missions_db:
        loc = get_location_by_id(m.target_location_id)
        unit = db.query(ResourceUnitDB).filter(ResourceUnitDB.id == m.assigned_unit_id).first()
        missions_schema.append(
            MissionDispatchResponse(
                id=m.id,
                mission_code=m.mission_code,
                target_location_id=m.target_location_id,
                target_location_name=loc.name if loc else m.target_location_id.capitalize(),
                assigned_unit_id=m.assigned_unit_id,
                assigned_unit_name=unit.unit_name if unit else f"Unit #{m.assigned_unit_id}",
                priority_score=m.priority_score,
                threat_tier=m.threat_tier,
                justification=m.justification,
                status=m.status,
                dispatched_at=m.dispatched_at,
            )
        )

    available_count = sum(1 for u in units_schema if u.status == "available")
    active_missions_count = sum(1 for m in missions_schema if m.status in ("dispatched", "en_route", "on_scene"))

    return DispatchDashboardResponse(
        simulated_time=effective_time,
        available_units_count=available_count,
        active_missions_count=active_missions_count,
        recommendations=recommendations,
        resource_units=units_schema,
        active_missions=missions_schema,
    )


@router.get("/recommendations", response_model=list[TacticalDispatchRecommendation], summary="Get prioritized tactical dispatch queue")
def get_dispatch_recommendations(
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """Calculate priority dispatch score across all sectors based on spatial risk and exposed population."""
    effective_time = sim_time or get_simulated_time(db)
    db_reports = db.query(ReportDB).filter(ReportDB.timestamp <= effective_time).all()
    report_items = [_db_to_report_item(r) for r in db_reports]
    return calculate_dispatch_recommendations(db=db, reports=report_items, simulated_now=effective_time)


@router.get("/units", response_model=list[ResourceUnitSchema], summary="List all specialized resource units")
def list_resource_units(db: Session = Depends(get_db)):
    """Retrieve full inventory of specialized SAR teams, helicopters, heavy machinery, and mobile comms."""
    units = db.query(ResourceUnitDB).all()
    return [ResourceUnitSchema.model_validate(u) for u in units]


@router.post("/assign", response_model=MissionDispatchResponse, status_code=status.HTTP_201_CREATED, summary="Assign and dispatch resource unit")
def create_mission_dispatch(payload: MissionDispatchCreate, db: Session = Depends(get_db)):
    """Authorize deployment mission assigning a specialized resource unit to a crisis sector."""
    loc = get_location_by_id(payload.target_location_id)
    if not loc:
        raise HTTPException(status_code=422, detail=f"Invalid target sector '{payload.target_location_id}'")

    unit = db.query(ResourceUnitDB).filter(ResourceUnitDB.id == payload.assigned_unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail=f"Unit ID {payload.assigned_unit_id} not found")

    return assign_dispatch_mission(
        db=db,
        target_location_id=payload.target_location_id,
        assigned_unit_id=payload.assigned_unit_id,
        justification=payload.justification,
    )


from app.pipeline.supply_engine import (
    compute_all_emergency_supplies,
    compute_emergency_supplies_for_sector,
)
from app.pipeline.multi_source_fusion import (
    get_all_active_conflicts,
    detect_and_fuse_multi_source_data,
)
from app.simulation.clock import get_active_disaster_type


@router.get("/supplies", summary="Get nationwide emergency supply allocation recommendations")
def get_supply_allocations(
    disaster_type: Optional[str] = Query(default=None, description="Disaster category"),
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """
    Returns prioritized emergency supply allocation (drinking water, food rations, trauma kits,
    satellite terminals, all-weather tents) with elevated priority for silent zones.
    """
    effective_time = sim_time or get_simulated_time(db)
    active_type = get_active_disaster_type()
    chosen_type = disaster_type if disaster_type else active_type

    overview = compute_all_emergency_supplies(
        disaster_type=chosen_type,
        simulated_now=effective_time,
    )
    return overview.model_dump()


@router.get("/supplies/{sector_id}", summary="Get emergency supply allocation for specific sector")
def get_single_sector_supply_allocation(
    sector_id: str,
    disaster_type: Optional[str] = Query(default=None, description="Disaster category"),
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """Returns sector-specific emergency supply demands, delivery mode, and staging hub."""
    effective_time = sim_time or get_simulated_time(db)
    active_type = get_active_disaster_type()
    chosen_type = disaster_type if disaster_type else active_type

    allocation = compute_emergency_supplies_for_sector(
        sector_id=sector_id,
        disaster_type=chosen_type,
        simulated_now=effective_time,
    )
    return allocation.model_dump()


@router.get("/conflicts", summary="Get multi-source intelligence conflicts and discrepancy resolution alerts")
def get_intelligence_conflicts(
    sector_id: Optional[str] = Query(default=None, description="Optional sector filter"),
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """
    Returns identified contradictions between citizen reports, social media, hospital records,
    police radio, and satellite observations with recommended supervisor resolution strategies.
    """
    effective_time = sim_time or get_simulated_time(db)
    summaries = detect_and_fuse_multi_source_data(sector_id=sector_id, simulated_now=effective_time)
    all_conflicts = get_all_active_conflicts()
    if sector_id:
        all_conflicts = [c for c in all_conflicts if c.sector_id.lower() == sector_id.lower()]

    return {
        "simulated_time": effective_time.isoformat(),
        "total_active_conflicts": len(all_conflicts),
        "conflicts": [c.model_dump() for c in all_conflicts],
        "sector_summaries": [s.model_dump() for s in summaries],
    }

