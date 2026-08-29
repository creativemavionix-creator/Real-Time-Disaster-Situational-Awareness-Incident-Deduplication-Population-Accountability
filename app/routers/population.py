"""API router for Dynamic Population Exposure & Searchable Missing Persons Registry."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import MissingPersonDB
from app.models.schemas import (
    AllPopulationExposureResponse,
    MissingPersonCreate,
    MissingPersonResponse,
)
from app.pipeline.population_exposure import (
    calculate_all_population_exposure,
    register_missing_person,
)
from app.pipeline.gazetteer import get_location_by_id
from app.simulation.clock import get_simulated_time

router = APIRouter(prefix="/population", tags=["Population Exposure & Missing Persons"])


@router.get("/exposure", response_model=AllPopulationExposureResponse, summary="Get dynamic population exposure per sector")
def get_population_exposure(
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """
    Get real-time exposed population figures factoring in diurnal commuter influx,
    seasonal tourists, and evacuation outflows.
    """
    effective_time = sim_time or get_simulated_time(db)
    return calculate_all_population_exposure(db=db, simulated_now=effective_time)


@router.get("/missing-persons", response_model=list[MissingPersonResponse], summary="List and search missing persons registry")
def list_missing_persons(
    query: Optional[str] = Query(default=None, description="Search by name, reporter, or notes"),
    sector_id: Optional[str] = Query(default=None, description="Filter by sector ID"),
    status_filter: Optional[str] = Query(default=None, description="Filter by status (missing, hospitalized, located_safe)"),
    db: Session = Depends(get_db),
):
    """Search and filter registered missing persons and matched hospital triage logs."""
    q = db.query(MissingPersonDB)

    if sector_id:
        q = q.filter(MissingPersonDB.last_known_location_id == sector_id.lower())
    if status_filter:
        q = q.filter(MissingPersonDB.status == status_filter.lower())
    if query:
        search_term = f"%{query.strip()}%"
        q = q.filter(
            MissingPersonDB.full_name.ilike(search_term)
            | MissingPersonDB.reported_by.ilike(search_term)
            | MissingPersonDB.physical_description.ilike(search_term)
        )

    records = q.order_by(MissingPersonDB.timestamp.desc()).all()

    results: list[MissingPersonResponse] = []
    for r in records:
        loc = get_location_by_id(r.last_known_location_id)
        results.append(
            MissingPersonResponse(
                id=r.id,
                full_name=r.full_name,
                age=r.age,
                gender=r.gender,
                last_known_location_id=r.last_known_location_id,
                last_known_location_name=loc.name if loc else r.last_known_location_id.capitalize(),
                reported_by=r.reported_by,
                contact_number=r.contact_number,
                status=r.status,
                physical_description=r.physical_description,
                matched_hospital_notes=r.notes,
                timestamp=r.timestamp,
            )
        )

    return results


@router.post("/missing-persons", response_model=MissingPersonResponse, status_code=status.HTTP_201_CREATED, summary="Register a missing person")
def create_missing_person(payload: MissingPersonCreate, db: Session = Depends(get_db)):
    """Register a new missing person and attempt automatic cross-matching against hospital logs."""
    loc = get_location_by_id(payload.last_known_location_id)
    if not loc:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown sector '{payload.last_known_location_id}'."
        )

    return register_missing_person(db, payload)
