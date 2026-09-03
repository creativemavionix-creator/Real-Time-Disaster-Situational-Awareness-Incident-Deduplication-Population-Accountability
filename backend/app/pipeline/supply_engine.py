"""
Emergency Supply Allocation Engine for PRATYAKSH-Ω.
Implements Requirement 6: Emergency Supply Recommendation.
Calculates sector-wise allocation priorities for:
- Potable Drinking Water (liters / day)
- High-Energy Food Rations (MRE units)
- Trauma Medical Emergency Kits
- Satellite & LoRa Emergency Communication Terminals
- High-Altitude Emergency Shelters & Blankets
Elevates response priority for Silent Zones with high population exposure and severe road severance.
"""

from datetime import datetime, timezone
from typing import Optional, Literal, Any
from pydantic import BaseModel, Field

from app.pipeline.gazetteer import LOCATIONS, get_location
from app.pipeline.telemetry_engine import compute_sector_telemetry


class EmergencySupplyAllocationItem(BaseModel):
    sector_id: str
    sector_name: str
    priority_tier: Literal["CRITICAL_IMMEDIATE", "HIGH_PRIORITY", "STANDARD", "ROUTINE"]
    priority_score: float  # 0.0 to 100.0
    affected_population: int
    drinking_water_liters: int
    food_rations_mre: int
    trauma_medical_kits: int
    emergency_comms_terminals: int
    emergency_tents: int
    recommended_delivery_mode: Literal[
        "AIR_DROP_HELICOPTER",
        "4WD_MOUNTAIN_CONVOY",
        "GROUND_HEAVY_CONVOY",
        "UAV_DRONE_PAYLOAD",
    ]
    staging_hub: str
    eta_hours: float
    rationale: str


class EmergencySupplyOverviewResponse(BaseModel):
    simulated_time: str
    total_water_liters_demanded: int
    total_food_rations_demanded: int
    total_trauma_kits_demanded: int
    total_comms_terminals_demanded: int
    total_tents_demanded: int
    critical_sectors_count: int
    allocations: list[EmergencySupplyAllocationItem]


# Population baseline and staging base mappings
SECTOR_POP_AND_STAGING: dict[str, dict[str, Any]] = {
    "gorkha": {
        "baseline_pop": 271061,
        "staging_hub": "Pokhara Regional Air Base / Kurintar Staging",
        "primary_transport": "AIR_DROP_HELICOPTER",
    },
    "rasuwa": {
        "baseline_pop": 46689,
        "staging_hub": "Trishuli Army Camp / Dhunche Forward Staging",
        "primary_transport": "AIR_DROP_HELICOPTER",
    },
    "sindhupalchok": {
        "baseline_pop": 262624,
        "staging_hub": "Dhulikhel Forward Supply Depot",
        "primary_transport": "4WD_MOUNTAIN_CONVOY",
    },
    "kathmandu": {
        "baseline_pop": 2041587,
        "staging_hub": "Tribhuvan International Airport Humanitarian Staging Cell",
        "primary_transport": "GROUND_HEAVY_CONVOY",
    },
    "bhaktapur": {
        "baseline_pop": 432132,
        "staging_hub": "Sallaghari Open Ground Central Logistics Depot",
        "primary_transport": "GROUND_HEAVY_CONVOY",
    },
    "nuwakot": {
        "baseline_pop": 263391,
        "staging_hub": "Bidur Municipal Sports Complex",
        "primary_transport": "4WD_MOUNTAIN_CONVOY",
    },
    "dolakha": {
        "baseline_pop": 172767,
        "staging_hub": "Charikot District Emergency Logistics Cell",
        "primary_transport": "4WD_MOUNTAIN_CONVOY",
    },
    "sindhuli": {
        "baseline_pop": 300026,
        "staging_hub": "Kamalamai High School Logistics Staging Hub",
        "primary_transport": "GROUND_HEAVY_CONVOY",
    },
}


def compute_emergency_supplies_for_sector(
    sector_id: str,
    disaster_type: str = "earthquake",
    simulated_now: Optional[datetime] = None,
) -> EmergencySupplyAllocationItem:
    """
    Calculates supply allocation based on population exposure, road isolation,
    and silent zone severity.
    """
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)

    clean_sec = sector_id.lower().strip()
    loc = get_location(clean_sec)
    sec_name = loc.name if loc else clean_sec.title()

    cfg = SECTOR_POP_AND_STAGING.get(clean_sec, SECTOR_POP_AND_STAGING["gorkha"])
    base_pop = cfg["baseline_pop"]

    telemetry = compute_sector_telemetry(
        sector_id=clean_sec,
        disaster_type=disaster_type,
        simulated_now=simulated_now,
    )

    silent_risk = telemetry.silent_zone_risk_score
    road_passability = telemetry.road.observed_value  # 0.0 to 100.0%

    # Priority formula: Silent Zone Risk (45%) + Road Severance (35%) + Population Density Factor (20%)
    pop_scale = min(1.0, base_pop / 500000.0)
    priority_score = round(
        (0.45 * (silent_risk * 10.0)) +
        (0.35 * (100.0 - road_passability)) +
        (0.20 * (pop_scale * 100.0)),
        1
    )

    # Determine priority tier
    if priority_score >= 70.0 or (telemetry.is_silent_zone and road_passability < 25.0):
        tier = "CRITICAL_IMMEDIATE"
        deliv_mode = "AIR_DROP_HELICOPTER"
        eta = 1.5
    elif priority_score >= 50.0:
        tier = "HIGH_PRIORITY"
        deliv_mode = "4WD_MOUNTAIN_CONVOY" if road_passability < 60.0 else "GROUND_HEAVY_CONVOY"
        eta = 3.5
    elif priority_score >= 30.0:
        tier = "STANDARD"
        deliv_mode = "GROUND_HEAVY_CONVOY"
        eta = 6.0
    else:
        tier = "ROUTINE"
        deliv_mode = "GROUND_HEAVY_CONVOY"
        eta = 12.0

    # Supply demand calculations tailored to the sector's exposed population & isolation
    exposed_pop = int(base_pop * min(1.0, 0.15 + (priority_score / 150.0)))
    
    # Sphere standards: 3 liters drinking water/person/day for initial survival
    water_liters = exposed_pop * 3
    # 2 MRE meals/person/day for isolated populations
    food_mre = exposed_pop * 2
    # 1 trauma kit per 150 exposed persons in high-risk zones
    trauma_kits = max(15, int(exposed_pop / 120))
    # Emergency communication terminals (Iridium/InReach/LoRa): critical for silent zones
    comms_terminals = 25 if tier == "CRITICAL_IMMEDIATE" else 12 if tier == "HIGH_PRIORITY" else 4
    # All-weather emergency tents: 1 tent per 5 displaced persons
    tents = max(50, int(exposed_pop / 5))

    rationale = (
        f"Assigned {tier} based on Silent Zone Severity {silent_risk}/10 and road accessibility of "
        f"{road_passability}%. Immediate delivery via {deliv_mode} from {cfg['staging_hub']} "
        f"to support an estimated {exposed_pop:,} isolated civilians."
    )

    return EmergencySupplyAllocationItem(
        sector_id=clean_sec,
        sector_name=sec_name,
        priority_tier=tier,
        priority_score=priority_score,
        affected_population=exposed_pop,
        drinking_water_liters=water_liters,
        food_rations_mre=food_mre,
        trauma_medical_kits=trauma_kits,
        emergency_comms_terminals=comms_terminals,
        emergency_tents=tents,
        recommended_delivery_mode=deliv_mode,
        staging_hub=cfg["staging_hub"],
        eta_hours=eta,
        rationale=rationale,
    )


def compute_all_emergency_supplies(
    disaster_type: str = "earthquake",
    simulated_now: Optional[datetime] = None,
) -> EmergencySupplyOverviewResponse:
    """Computes comprehensive national emergency supply allocations across all 8 sectors."""
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)

    allocations: list[EmergencySupplyAllocationItem] = []
    for s_id in SECTOR_POP_AND_STAGING.keys():
        item = compute_emergency_supplies_for_sector(
            sector_id=s_id,
            disaster_type=disaster_type,
            simulated_now=simulated_now,
        )
        allocations.append(item)

    # Sort descending by priority score
    allocations.sort(key=lambda a: a.priority_score, reverse=True)

    tot_water = sum(a.drinking_water_liters for a in allocations)
    tot_food = sum(a.food_rations_mre for a in allocations)
    tot_trauma = sum(a.trauma_medical_kits for a in allocations)
    tot_comms = sum(a.emergency_comms_terminals for a in allocations)
    tot_tents = sum(a.emergency_tents for a in allocations)
    crit_count = sum(1 for a in allocations if a.priority_tier == "CRITICAL_IMMEDIATE")

    return EmergencySupplyOverviewResponse(
        simulated_time=simulated_now.isoformat(),
        total_water_liters_demanded=tot_water,
        total_food_rations_demanded=tot_food,
        total_trauma_kits_demanded=tot_trauma,
        total_comms_terminals_demanded=tot_comms,
        total_tents_demanded=tot_tents,
        critical_sectors_count=crit_count,
        allocations=allocations,
    )
