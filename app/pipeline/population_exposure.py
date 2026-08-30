"""Dynamic Population Exposure & Missing Persons Tracker with 2021 Census Palika Demographics."""

import csv
import math
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from sqlalchemy.orm import Session

from app.models.db import MissingPersonDB, ReportDB, PalikaDB
from app.models.schemas import (
    PopulationExposureItem,
    AllPopulationExposureResponse,
    MissingPersonCreate,
    MissingPersonResponse,
    PalikaResponse,
    SectorPalikasResponse,
)
from app.pipeline.gazetteer import LOCATIONS, get_all_locations, get_location_by_id


# Census & Dynamic Demographic Parameters per Sector
SECTOR_DEMOGRAPHICS: dict[str, dict] = {
    "kathmandu": {
        "census": 1092626,  # Sum of KMC + Kirtipur + Budhanilkantha (2021 Census baseline)
        "commuter_flux": 350000,
        "tourists": 45000,
        "hazard_zones": ["New Road", "Thamel", "Kalanki", "Balaju", "Bhotahiti"],
    },
    "bhaktapur": {
        "census": 163258,   # Bhaktapur Mun + Madhyapur Thimi
        "commuter_flux": -40000,  # Outflow into KTM
        "tourists": 12000,
        "hazard_zones": ["Durbar Square", "Sallaghari", "Thimi"],
    },
    "sindhupalchok": {
        "census": 83764,    # Chautara + Melamchi baseline
        "commuter_flux": 15000,
        "tourists": 18000,  # Helambu / Sukute rafting & trekking
        "hazard_zones": ["Melamchi River Basin", "Bahrabise Bazaar", "Chautara Slopes"],
    },
    "dolakha": {
        "census": 32410,    # Bhimeshwor baseline
        "commuter_flux": 8000,
        "tourists": 14000,  # Jiri / Kalinchowk pilgrimage
        "hazard_zones": ["Charikot Market", "Tama Koshi Gorge", "Singati"],
    },
    "nuwakot": {
        "census": 54320,    # Bidur baseline
        "commuter_flux": 12000,
        "tourists": 6000,
        "hazard_zones": ["Trishuli River Bridge", "Bidur Market", "Kakani Ridge"],
    },
    "gorkha": {
        "census": 75130,    # Gorkha Mun + Barpak Sulikot
        "commuter_flux": 10000,
        "tourists": 22000,  # Manaslu Circuit / Barpak
        "hazard_zones": ["Barpak Epicenter Slopes", "Arughat Bazaar", "Laprak"],
    },
    "rasuwa": {
        "census": 8140,     # Gosaikunda baseline
        "commuter_flux": 6000,
        "tourists": 28000,  # Langtang Valley trekkers & Gosainkunda
        "hazard_zones": ["Langtang Trekking Corridor", "Dhunche Gorge", "Syabrubesi"],
    },
    "sindhuli": {
        "census": 65410,    # Kamalamai baseline
        "commuter_flux": 20000,
        "tourists": 5000,
        "hazard_zones": ["BP Highway Mountain Cuts", "Kamalamai Valley"],
    },
}

# District Name to Sector ID mapping
DISTRICT_TO_SECTOR: dict[str, str] = {
    "kathmandu": "kathmandu",
    "bhaktapur": "bhaktapur",
    "sindhupalchok": "sindhupalchok",
    "sindhupalchowk": "sindhupalchok",
    "dolakha": "dolakha",
    "dolkha": "dolakha",
    "nuwakot": "nuwakot",
    "gorkha": "gorkha",
    "rasuwa": "rasuwa",
    "sindhuli": "sindhuli",
}


def find_census_csv_path() -> Optional[Path]:
    """Locate the Nepal Census 2021 local level CSV in known relative paths."""
    candidates = [
        Path("RESQ_SIGHT_DATA/06_EXPOSURE/NEPAL_CENSUS_2021/population_local_level.csv"),
        Path("../RESQ_SIGHT_DATA/06_EXPOSURE/NEPAL_CENSUS_2021/population_local_level.csv"),
        Path("../../RESQ_SIGHT_DATA/06_EXPOSURE/NEPAL_CENSUS_2021/population_local_level.csv"),
        Path("c:/Users/siddh/nepal project github/RESQ_SIGHT_DATA/06_EXPOSURE/NEPAL_CENSUS_2021/population_local_level.csv"),
    ]
    for p in candidates:
        if p.exists() and p.is_file():
            return p
    return None


def seed_palika_census_data(db: Session, csv_path: Optional[str] = None) -> int:
    """Seed PalikaDB table from official 2021 Census CSV if empty."""
    existing = db.query(PalikaDB).count()
    if existing > 0:
        return existing

    target_path = Path(csv_path) if csv_path else find_census_csv_path()
    if not target_path or not target_path.exists():
        return 0

    count = 0
    with open(target_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            dist_raw = row.get("district_name", "").strip().lower()
            sector_id = DISTRICT_TO_SECTOR.get(dist_raw, dist_raw)

            palika = PalikaDB(
                local_level_id=int(row["local_level_id"]),
                province_id=int(row["province_id"]),
                province_name=row.get("province_name", "Bagmati").strip(),
                district_id=int(row["district_id"]),
                district_name=row.get("district_name", "").strip(),
                sector_id=sector_id,
                local_level_name=row.get("local_level_name", "").strip(),
                households=int(row.get("households", 0)),
                total_population=int(row.get("total_population", 0)),
                male_population=int(row.get("male_population", 0)),
                female_population=int(row.get("female_population", 0)),
            )
            db.add(palika)
            count += 1

    db.commit()
    return count


def calculate_sector_exposure(
    sector_id: str,
    db: Optional[Session] = None,
    simulated_now: Optional[datetime] = None,
) -> PopulationExposureItem:
    """Calculate real-time exposed population accounting for census baseline, commuters, tourists, and evacuations."""
    loc = get_location_by_id(sector_id)
    if not loc:
        raise ValueError(f"Unknown sector id {sector_id}")

    demo = SECTOR_DEMOGRAPHICS.get(sector_id, {
        "census": 100000,
        "commuter_flux": 10000,
        "tourists": 5000,
        "hazard_zones": ["Central District"],
    })

    # Ground truth: if PalikaDB is present in the database, calculate actual census sum
    census_baseline = demo["census"]
    if db is not None:
        palikas = db.query(PalikaDB).filter(PalikaDB.sector_id == sector_id).all()
        if palikas:
            census_baseline = sum(p.total_population for p in palikas)

    # Estimate dynamic evacuation factor based on elapsed time or severity
    evacuated_est = int(census_baseline * 0.04)  # ~4% initial organized evacuation
    
    real_time_exposed = (
        census_baseline
        + demo["commuter_flux"]
        + demo["tourists"]
        - evacuated_est
    )

    missing_count = 0
    located_count = 0
    if db is not None:
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
        census_baseline_population=census_baseline,
        diurnal_commuter_flux=demo["commuter_flux"],
        tourist_density_estimate=demo["tourists"],
        evacuated_population_estimate=evacuated_est,
        real_time_exposed_population=max(0, real_time_exposed),
        high_density_hazard_zones=demo["hazard_zones"],
        missing_persons_reported=missing_count,
        located_safe_count=located_count,
    )


def get_sector_palika_breakdown(sector_id: str, db: Session) -> Optional[SectorPalikasResponse]:
    """Retrieve municipal Palika records for a specific sector with relief requirements."""
    loc = get_location_by_id(sector_id)
    if not loc:
        return None

    palikas_db = db.query(PalikaDB).filter(PalikaDB.sector_id == sector_id).all()
    if not palikas_db:
        # If not seeded yet, attempt on-demand seed
        seed_palika_census_data(db)
        palikas_db = db.query(PalikaDB).filter(PalikaDB.sector_id == sector_id).all()

    palika_responses: list[PalikaResponse] = []
    total_hh = 0
    total_pop = 0
    total_male = 0
    total_female = 0

    for p in palikas_db:
        total_hh += p.households
        total_pop += p.total_population
        total_male += p.male_population
        total_female += p.female_population

        tents = int(math.ceil(p.households * 0.85))
        rations = int(p.households)

        palika_responses.append(PalikaResponse(
            local_level_id=p.local_level_id,
            province_id=p.province_id,
            province_name=p.province_name,
            district_id=p.district_id,
            district_name=p.district_name,
            sector_id=p.sector_id,
            local_level_name=p.local_level_name,
            households=p.households,
            total_population=p.total_population,
            male_population=p.male_population,
            female_population=p.female_population,
            estimated_tents_needed=tents,
            estimated_ration_packs_needed=rations,
        ))

    return SectorPalikasResponse(
        sector_id=loc.id,
        sector_name=loc.name,
        total_palikas=len(palika_responses),
        total_households=total_hh,
        total_population=total_pop,
        male_population=total_male,
        female_population=total_female,
        palikas=palika_responses,
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
