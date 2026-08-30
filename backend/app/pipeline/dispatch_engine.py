"""Tactical Resource Dispatch Engine with asset inventory and priority scoring."""

import math
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.models.db import ResourceUnitDB, DispatchMissionDB, ReportDB
from app.models.schemas import (
    ResourceUnitSchema,
    TacticalDispatchRecommendation,
    MissionDispatchResponse,
    DispatchDashboardResponse,
)
from app.pipeline.gazetteer import get_all_locations, get_location_by_id
from app.pipeline.clustering import ReportItem
from app.pipeline.aggregator import aggregate_location
from app.pipeline.blackout_risk import assess_sector_blackout_risk
from app.pipeline.population_exposure import calculate_sector_exposure


def seed_initial_resource_units(db: Session) -> int:
    """Seed elite search and rescue, air ambulance, and heavy engineering units."""
    if db.query(ResourceUnitDB).count() > 0:
        return db.query(ResourceUnitDB).count()

    initial_units = [
        ResourceUnitDB(
            unit_code="SAR-ALPHA-01",
            unit_name="Nepal Army Urban SAR Heavy Battalion (NDRF Team 1)",
            unit_type="sar_heavy",
            home_base="Chhauni Barracks, Kathmandu",
            current_location_id="kathmandu",
            status="available",
            capacity=45,
        ),
        ResourceUnitDB(
            unit_code="SAR-BRAVO-02",
            unit_name="Armed Police Force Disaster Response Taskforce (APF Unit 2)",
            unit_type="sar_heavy",
            home_base="Kurintar Disaster Center",
            current_location_id="nuwakot",
            status="available",
            capacity=35,
        ),
        ResourceUnitDB(
            unit_code="AIR-MED-01",
            unit_name="Nepal Army Aviation MI-17 Heavy Air Ambulance (Callsign: GARUDA-1)",
            unit_type="air_ambulance",
            home_base="Tribhuvan Army Aviation Base, TIA",
            current_location_id="kathmandu",
            status="available",
            capacity=18,
        ),
        ResourceUnitDB(
            unit_code="AIR-RECON-02",
            unit_name="High-Altitude Mountain Rescue Bell 407 (Callsign: RESCUE-9)",
            unit_type="air_ambulance",
            home_base="Pokhara Aviation Base",
            current_location_id="gorkha",
            status="available",
            capacity=6,
        ),
        ResourceUnitDB(
            unit_code="ENG-HEAVY-01",
            unit_name="DoR Heavy Hydraulic Excavator & Bulldozer Column",
            unit_type="heavy_excavator",
            home_base="Araniko Highway Division, Chautara",
            current_location_id="sindhupalchok",
            status="available",
            capacity=12,
        ),
        ResourceUnitDB(
            unit_code="ENG-HEAVY-02",
            unit_name="Mechanical Clearing Unit (Prithvi & Trishuli Highway)",
            unit_type="heavy_excavator",
            home_base="Bidur Division",
            current_location_id="nuwakot",
            status="available",
            capacity=10,
        ),
        ResourceUnitDB(
            unit_code="COMMS-COW-01",
            unit_name="NTA Satellite Cell-on-Wheels (COW) Mobile Tower",
            unit_type="mobile_comms",
            home_base="Singha Durbar Telecommunications Hub",
            current_location_id="kathmandu",
            status="available",
            capacity=5000,
        ),
        ResourceUnitDB(
            unit_code="MED-TRIAGE-01",
            unit_name="WHO Mobile Surgical Field Hospital & Trauma Unit",
            unit_type="medical_triage",
            home_base="Patan Hospital Disaster Reserves",
            current_location_id="bhaktapur",
            status="available",
            capacity=60,
        ),
    ]

    db.bulk_save_objects(initial_units)
    db.commit()
    return len(initial_units)


def calculate_dispatch_recommendations(
    db: Session,
    reports: list[ReportItem],
    simulated_now: Optional[datetime] = None,
) -> list[TacticalDispatchRecommendation]:
    """
    Calculate tactical dispatch priority score for every sector:
    Priority = (MaxThreat * log10(ExposedPopulation) * (1.0 + IsolationIndex)) / (AssignedUnits + 1)
    """
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)

    all_locs = get_all_locations()
    recommendations: list[TacticalDispatchRecommendation] = []

    available_units = db.query(ResourceUnitDB).filter(ResourceUnitDB.status == "available").all()
    available_schemas = [ResourceUnitSchema.model_validate(u) for u in available_units]

    for loc in all_locs:
        agg = aggregate_location(location=loc, reports=reports, simulated_now=simulated_now)
        blackout = assess_sector_blackout_risk(location=loc, reports=reports, simulated_now=simulated_now)
        exposure = calculate_sector_exposure(sector_id=loc.id, db=db, simulated_now=simulated_now)

        # Assigned active missions for this sector
        active_missions = db.query(DispatchMissionDB).filter(
            DispatchMissionDB.target_location_id == loc.id,
            DispatchMissionDB.status.in_(["dispatched", "en_route", "on_scene"])
        ).count()

        # Threat magnitude (0 to 100)
        verified_threat = agg.confidence_score * 100.0 if agg.status == "verified_damaged" else (
            0.0 if agg.status == "verified_safe" else 35.0
        )
        effective_threat = max(verified_threat, blackout.inferred_risk_score)

        # Population weight (logarithmic scaling)
        pop_weight = math.log10(max(1000, exposure.real_time_exposed_population))  # ~3.0 to ~6.2

        # Isolation index
        isolation = blackout.spatial_physics.road_access_impedance

        # Priority calculation
        raw_priority = (effective_threat * pop_weight * (1.0 + isolation)) / (active_missions + 1.0)
        priority_score = round(min(100.0, raw_priority / 7.5), 1)

        # Tailor recommended unit types
        recommended_types: list[str] = []
        if blackout.is_in_blackout:
            recommended_types.extend(["air_ambulance", "mobile_comms"])
        if "structural" in [c.damage_type for c in agg.top_incidents]:
            recommended_types.extend(["sar_heavy", "medical_triage"])
        if "road/bridge" in [c.damage_type for c in agg.top_incidents] or "landslide" in [c.damage_type for c in agg.top_incidents]:
            recommended_types.append("heavy_excavator")
        if not recommended_types:
            recommended_types = ["sar_heavy", "medical_triage"]

        # Rationale string
        rationale = (
            f"Threat Tier: {blackout.threat_tier}. Exposed Pop: ~{exposure.real_time_exposed_population:,}. "
            f"Blackout: {'YES' if blackout.is_in_blackout else 'NO'}. "
            f"Active missions: {active_missions}. Priority derived from spatial risk and population exposure."
        )

        # Filter matching available units
        matching_units = [u for u in available_schemas if u.unit_type in recommended_types]

        recommendations.append(
            TacticalDispatchRecommendation(
                target_sector_id=loc.id,
                target_sector_name=loc.name,
                priority_score=priority_score,
                threat_tier=blackout.threat_tier,
                is_blackout=blackout.is_in_blackout,
                rationale=rationale,
                recommended_unit_types=list(set(recommended_types)),
                available_matching_units=matching_units,
                assigned_missions_count=active_missions,
            )
        )

    # Sort descending by priority score
    recommendations.sort(key=lambda r: r.priority_score, reverse=True)
    return recommendations


def assign_dispatch_mission(
    db: Session,
    target_location_id: str,
    assigned_unit_id: int,
    justification: str,
) -> MissionDispatchResponse:
    """Deploy a tactical resource unit to a crisis sector."""
    loc = get_location_by_id(target_location_id)
    if not loc:
        raise ValueError(f"Invalid target sector {target_location_id}")

    unit = db.query(ResourceUnitDB).filter(ResourceUnitDB.id == assigned_unit_id).first()
    if not unit:
        raise ValueError(f"Unit ID {assigned_unit_id} not found")

    unit.status = "dispatched"
    unit.current_location_id = loc.id

    mission_code = f"MSN-{loc.id[:3].upper()}-{datetime.now().strftime('%H%M%S')}"
    mission = DispatchMissionDB(
        mission_code=mission_code,
        target_location_id=loc.id,
        assigned_unit_id=unit.id,
        priority_score=85.0,
        threat_tier="CRITICAL_DEPLOYMENT",
        justification=justification.strip(),
        status="dispatched",
        dispatched_at=datetime.now(timezone.utc),
    )
    db.add(mission)
    db.commit()
    db.refresh(mission)

    return MissionDispatchResponse(
        id=mission.id,
        mission_code=mission.mission_code,
        target_location_id=mission.target_location_id,
        target_location_name=loc.name,
        assigned_unit_id=unit.id,
        assigned_unit_name=unit.unit_name,
        priority_score=mission.priority_score,
        threat_tier=mission.threat_tier,
        justification=mission.justification,
        status=mission.status,
        dispatched_at=mission.dispatched_at,
    )
