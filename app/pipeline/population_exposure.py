"""Dynamic Population Exposure & Missing Persons Tracker."""

from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.models.db import MissingPersonDB, ReportDB
from app.models.schemas import (
    PopulationExposureItem,
    AllPopulationExposureResponse,
    MissingPersonCreate,
    MissingPersonResponse,
)
from app.pipeline.gazetteer import LOCATIONS, get_all_locations, get_location_by_id


# Census & Dynamic Demographic Parameters per Sector
SECTOR_DEMOGRAPHICS: dict[str, dict] = {
    "kathmandu": {
        "census": 1442271,
        "commuter_flux": 350000,
        "tourists": 45000,
        "hazard_zones": ["New Road", "Thamel", "Kalanki", "Balaju", "Bhotahiti"],
    },
    "bhaktapur": {
        "census": 304651,
        "commuter_flux": -40000,  # Outflow into KTM
        "tourists": 12000,
        "hazard_zones": ["Durbar Square", "Sallaghari", "Thimi"],
    },
    "sindhupalchok": {
        "census": 287798,
        "commuter_flux": 15000,
        "tourists": 18000,  # Helambu / Sukute rafting & trekking
        "hazard_zones": ["Melamchi River Basin", "Bahrabise Bazaar", "Chautara Slopes"],
    },
    "dolakha": {
        "census": 186557,
        "commuter_flux": 8000,
        "tourists": 14000,  # Jiri / Kalinchowk pilgrimage
        "hazard_zones": ["Charikot Market", "Tama Koshi Gorge", "Singati"],
    },
    "nuwakot": {
        "census": 277471,
        "commuter_flux": 12000,
        "tourists": 6000,
        "hazard_zones": ["Trishuli River Bridge", "Bidur Market", "Kakani Ridge"],
    },
    "gorkha": {
        "census": 271061,
        "commuter_flux": 10000,
        "tourists": 22000,  # Manaslu Circuit / Barpak
        "hazard_zones": ["Barpak Epicenter Slopes", "Arughat Bazaar", "Laprak"],
    },
    "rasuwa": {
        "census": 43300,
        "commuter_flux": 6000,
        "tourists": 28000,  # Langtang Valley trekkers & Gosainkunda
        "hazard_zones": ["Langtang Trekking Corridor", "Dhunche Gorge", "Syabrubesi"],
    },
    "sindhuli": {
        "census": 296192,
        "commuter_flux": 20000,
        "tourists": 5000,
        "hazard_zones": ["BP Highway Mountain Cuts", "Kamalamai Valley"],
    },
}


def calculate_sector_exposure(
    sector_id: str,
    db: Optional[Session] = None,
    simulated_now: Optional[datetime] = None,
) -> PopulationExposureItem:
    """Calculate real-time exposed population accounting for commuters, tourists, and evacuations."""
    loc = get_location_by_id(sector_id)
    if not loc:
        raise ValueError(f"Unknown sector id {sector_id}")

    demo = SECTOR_DEMOGRAPHICS.get(sector_id, {
        "census": 100000,
        "commuter_flux": 10000,
        "tourists": 5000,
        "hazard_zones": ["Central District"],
    })

    # Estimate dynamic evacuation factor based on elapsed time or severity
    evacuated_est = int(demo["census"] * 0.04)  # ~4% initial organized evacuation
    
    real_time_exposed = (
        demo["census"]
        + demo["commuter_flux"]
        + demo["tourists"]
        - evacuated_est
    )

    missing_count = 0
    located_count = 0
    if db:
        missing_count = db.query(MissingPersonDB).filter(
            MissingPersonDB.last_known_location_id == sector_id,
            MissingPersonDB.status == "missing"
        ).count()
        located_count = db.query(MissingPersonDB).filter(
            MissingPersonDB.last_known_location_id == sector_id,
            MissingPersonDB.status.in_(["located_safe", "hospitalized"])
        ).count()

    return PopulationExposureItem(
        sector_id=loc.id,
        sector_name=loc.name,
        census_baseline_population=demo["census"],
        diurnal_commuter_flux=demo["commuter_flux"],
        tourist_density_estimate=demo["tourists"],
        evacuated_population_estimate=evacuated_est,
        real_time_exposed_population=max(0, real_time_exposed),
        high_density_hazard_zones=demo["hazard_zones"],
        missing_persons_reported=missing_count,
        located_safe_count=located_count,
    )


def calculate_all_population_exposure(
    db: Optional[Session] = None,
    simulated_now: Optional[datetime] = None,
) -> AllPopulationExposureResponse:
    """Compute national and sector-level exposed population metrics."""
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)

    all_locs = get_all_locations()
    exposures = [calculate_sector_exposure(loc.id, db, simulated_now) for loc in all_locs]

    total_national = sum(e.real_time_exposed_population for e in exposures)
    total_missing = sum(e.missing_persons_reported for e in exposures)
    total_located = sum(e.located_safe_count for e in exposures)

    return AllPopulationExposureResponse(
        simulated_time=simulated_now,
        total_national_exposed_population=total_national,
        total_missing_persons=total_missing,
        total_located_safe=total_located,
        sector_exposures=exposures,
    )


def register_missing_person(db: Session, payload: MissingPersonCreate) -> MissingPersonResponse:
    """Register a new missing person and attempt heuristic match against hospital logs."""
    loc = get_location_by_id(payload.last_known_location_id)
    if not loc:
        raise ValueError(f"Invalid sector {payload.last_known_location_id}")

    # Check if there are hospital reports mentioning this person or casualties in that sector
    matched_notes = None
    hospital_match_id = None
    
    # Auto-match heuristics
    hospital_rep = db.query(ReportDB).filter(
        ReportDB.resolved_location_id == loc.id,
        ReportDB.source_type == "hospital"
    ).order_by(ReportDB.timestamp.desc()).first()

    if hospital_rep and "admitted" in hospital_rep.raw_text.lower():
        matched_notes = f"Auto-matched with {loc.name} Hospital triage intake log (Report #{hospital_rep.id}). Verification pending."
        hospital_match_id = hospital_rep.id

    person_db = MissingPersonDB(
        full_name=payload.full_name.strip(),
        age=payload.age,
        gender=payload.gender,
        last_known_location_id=loc.id,
        reported_by=payload.reported_by.strip(),
        contact_number=payload.contact_number,
        status="missing",
        physical_description=payload.physical_description,
        hospital_match_id=hospital_match_id,
        notes=matched_notes or payload.notes,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(person_db)
    db.commit()
    db.refresh(person_db)

    return MissingPersonResponse(
        id=person_db.id,
        full_name=person_db.full_name,
        age=person_db.age,
        gender=person_db.gender,
        last_known_location_id=person_db.last_known_location_id,
        last_known_location_name=loc.name,
        reported_by=person_db.reported_by,
        contact_number=person_db.contact_number,
        status=person_db.status,
        physical_description=person_db.physical_description,
        matched_hospital_notes=person_db.notes,
        timestamp=person_db.timestamp,
    )


def seed_initial_missing_persons(db: Session) -> int:
    """Pre-seed sample realistic missing persons registry records."""
    if db.query(MissingPersonDB).count() > 0:
        return db.query(MissingPersonDB).count()

    samples = [
        MissingPersonCreate(
            full_name="Aarav Shrestha",
            age=29,
            gender="Male",
            last_known_location_id="kathmandu",
            reported_by="Sita Shrestha (Spouse)",
            contact_number="+977-9841234567",
            physical_description="5'8\", wearing navy blue fleece jacket near New Road shopping arcade.",
            notes="Was inside commercial building during morning tremor."
        ),
        MissingPersonCreate(
            full_name="Pema Tamang",
            age=34,
            gender="Female",
            last_known_location_id="rasuwa",
            reported_by="Langtang Trekking Association",
            contact_number="+977-9851098765",
            physical_description="Trekking guide leading a 4-person group on Langtang trail near Syabrubesi.",
            notes="Lost communication after cell tower went down."
        ),
        MissingPersonCreate(
            full_name="Bikram Gurung",
            age=45,
            gender="Male",
            last_known_location_id="gorkha",
            reported_by="Barpak Ward Office",
            contact_number="+977-9801239876",
            physical_description="Local farmer residing in upper Barpak village.",
            notes="Neighbor reported stone house collapsed."
        ),
        MissingPersonCreate(
            full_name="Sunita Karki",
            age=22,
            gender="Female",
            last_known_location_id="sindhupalchok",
            reported_by="Ramesh Karki (Father)",
            contact_number="+977-9860112233",
            physical_description="Student traveling on Araniko Highway bus near Melamchi bridge.",
            notes="Bus halted due to flash flood."
        ),
    ]

    for s in samples:
        register_missing_person(db, s)

    return len(samples)
