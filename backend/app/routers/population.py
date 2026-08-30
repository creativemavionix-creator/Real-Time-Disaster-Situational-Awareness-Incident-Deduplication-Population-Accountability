"""API router for Dynamic Population Exposure, Missing Persons, and Probabilistic Reconciliation Ledger."""

from datetime import datetime, timezone
from typing import Optional, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import MissingPersonDB
from app.models.schemas import (
    AllPopulationExposureResponse,
    MissingPersonCreate,
    MissingPersonResponse,
    SectorPalikasResponse,
)
from app.pipeline.population_exposure import (
    calculate_all_population_exposure,
    register_missing_person,
    get_sector_palika_breakdown,
)
from app.pipeline.reconciliation import calculate_hybrid_match_score
from app.pipeline.gazetteer import get_location_by_id
from app.simulation.clock import get_simulated_time

router = APIRouter(prefix="/population", tags=["Population Exposure & Probabilistic Reconciliation"])


# Mock shelter and hospital check-in records for Entity Resolution Ledger
SHELTER_CHECKINS: list[dict[str, Any]] = [
    {
        "checkin_id": 101,
        "facility_name": "Patan Hospital Emergency Triage",
        "facility_type": "hospital",
        "person_name": "Aarav S.",
        "age": 30,
        "gender": "Male",
        "identifying_features": "Navy fleece jacket, mild concussion, treated at ER",
        "sector_id": "kathmandu",
        "health_status": "stable_admitted",
        "timestamp": "2026-08-30T10:30:00Z",
    },
    {
        "checkin_id": 102,
        "facility_name": "Tundikhel Red Cross Shelter Camp B",
        "facility_type": "shelter",
        "person_name": "Rajesh K.",
        "age": 35,
        "gender": "Male",
        "identifying_features": "Red shirt, bruised right elbow, arrived with local group",
        "sector_id": "bhaktapur",
        "health_status": "uninjured",
        "timestamp": "2026-08-30T11:15:00Z",
    },
    {
        "checkin_id": 103,
        "facility_name": "Dhunche Community Relief Post",
        "facility_type": "shelter",
        "person_name": "Pema Tamang",
        "age": 34,
        "gender": "Female",
        "identifying_features": "Langtang mountain guide, black backpack, 4 tourists safe",
        "sector_id": "rasuwa",
        "health_status": "safe_exhausted",
        "timestamp": "2026-08-30T12:00:00Z",
    },
    {
        "checkin_id": 104,
        "facility_name": "Melamchi Field Clinic Tent 3",
        "facility_type": "hospital",
        "person_name": "Sunita Karki",
        "age": 22,
        "gender": "Female",
        "identifying_features": "College student, minor abrasions, evacuated from bus",
        "sector_id": "sindhupalchok",
        "health_status": "outpatient_treated",
        "timestamp": "2026-08-30T12:45:00Z",
    },
]


class ShelterCheckinCreate(BaseModel):
    facility_name: str
    facility_type: str = "shelter"  # shelter, hospital, transit_camp
    person_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    identifying_features: Optional[str] = None
    sector_id: str
    health_status: str = "uninjured"


class MatchConfirmationRequest(BaseModel):
    missing_person_id: int
    checkin_id: int
    confirmed: bool = True


@router.get("/exposure", response_model=AllPopulationExposureResponse, summary="Get dynamic population exposure per sector")
def get_population_exposure(
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """Get real-time exposed population figures factoring in diurnal commuter influx and evacuations."""
    effective_time = sim_time or get_simulated_time(db)
    return calculate_all_population_exposure(db=db, simulated_now=effective_time)


@router.get("/missing-persons", response_model=list[MissingPersonResponse], summary="List and search missing persons registry")
def list_missing_persons(
    query: Optional[str] = Query(default=None, description="Search by name, reporter, or notes"),
    sector_id: Optional[str] = Query(default=None, description="Filter by sector ID"),
    status_filter: Optional[str] = Query(default=None, description="Filter by status"),
    db: Session = Depends(get_db),
):
    """Search and filter registered missing persons."""
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
    """Register a new missing person inquiry."""
    loc = get_location_by_id(payload.last_known_location_id)
    if not loc:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown sector '{payload.last_known_location_id}'."
        )

    return register_missing_person(db, payload)


@router.get("/reconciliation-ledger", summary="Get Split-View Missing vs. Found Reconciliation Ledger with hybrid entity matches")
def get_reconciliation_ledger(db: Session = Depends(get_db)):
    """
    Cross-references missing inquiries against hospital and shelter check-in streams.
    Returns:
    - Missing Ledger items
    - Found Shelter Check-in items
    - Auto-reconciled matches (Match Score > 0.85)
    - Suggested review queue (Match Score 0.65 - 0.84)
    """
    missing_records = db.query(MissingPersonDB).all()

    auto_matches = []
    suggested_queue = []

    for m in missing_records:
        for c in SHELTER_CHECKINS:
            score = calculate_hybrid_match_score(
                missing_name=m.full_name,
                missing_age=m.age,
                missing_desc=m.physical_description,
                found_name=c["person_name"],
                found_age=c["age"],
                found_desc=c["identifying_features"],
                missing_sector=m.last_known_location_id,
                found_sector=c["sector_id"],
            )

            match_payload = {
                "missing_person_id": m.id,
                "missing_name": m.full_name,
                "missing_age": m.age,
                "missing_sector": m.last_known_location_id,
                "missing_desc": m.physical_description,
                "checkin_id": c["checkin_id"],
                "found_name": c["person_name"],
                "found_age": c["age"],
                "found_facility": c["facility_name"],
                "found_sector": c["sector_id"],
                "found_desc": c["identifying_features"],
                "health_status": c["health_status"],
                "match_score": score,
                "confidence_tier": "HIGH_AUTO_MATCH" if score >= 0.85 else "SUGGESTED_REVIEW",
            }

            if score >= 0.85:
                auto_matches.append(match_payload)
            elif score >= 0.65:
                suggested_queue.append(match_payload)

    return {
        "missing_ledger_count": len(missing_records),
        "found_checkins_count": len(SHELTER_CHECKINS),
        "auto_matched_count": len(auto_matches),
        "suggested_review_count": len(suggested_queue),
        "missing_records": [
            {
                "id": m.id,
                "full_name": m.full_name,
                "age": m.age,
                "gender": m.gender,
                "sector_id": m.last_known_location_id,
                "status": m.status,
                "physical_description": m.physical_description,
                "reported_by": m.reported_by,
                "timestamp": m.timestamp,
            }
            for m in missing_records
        ],
        "found_checkins": SHELTER_CHECKINS,
        "auto_reconciled_matches": auto_matches,
        "suggested_matches_queue": suggested_queue,
    }


@router.post("/confirm-match", summary="Confirm or reject a suggested entity match")
def confirm_match(payload: MatchConfirmationRequest, db: Session = Depends(get_db)):
    """Confirm a suggested match, updating the missing person status to located_safe or hospitalized."""
    person = db.query(MissingPersonDB).filter(MissingPersonDB.id == payload.missing_person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Missing person record not found")

    checkin = next((c for c in SHELTER_CHECKINS if c["checkin_id"] == payload.checkin_id), None)
    if not checkin:
        raise HTTPException(status_code=404, detail="Shelter check-in record not found")

    if payload.confirmed:
        person.status = "located_safe" if "shelter" in checkin["facility_type"] else "hospitalized"
        person.notes = f"Reconciled with {checkin['facility_name']} (Check-in #{checkin['checkin_id']}) on {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}"
        db.commit()

    return {
        "message": "Match successfully confirmed and status updated.",
        "missing_person_id": person.id,
        "new_status": person.status,
        "facility": checkin["facility_name"],
    }


@router.get("/palikas/{sector_id}", response_model=SectorPalikasResponse, summary="Get municipal Palika demographics for a sector")
def get_sector_palikas(sector_id: str, db: Session = Depends(get_db)):
    """Retrieve municipal palika breakdown with household counts and estimated shelter requirements."""
    loc = get_location_by_id(sector_id)
    if not loc:
        raise HTTPException(status_code=404, detail=f"Sector '{sector_id}' not found.")

    res = get_sector_palika_breakdown(loc.id, db)
    if not res:
        raise HTTPException(status_code=404, detail=f"No municipal palika records found for sector '{sector_id}'.")

    return res
