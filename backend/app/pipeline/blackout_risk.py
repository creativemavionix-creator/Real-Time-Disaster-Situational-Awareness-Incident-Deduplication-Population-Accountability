"""Silent Blackout Risk Intelligence Engine using spatial physics and terrain modeling."""

import math
from datetime import datetime, timezone
from typing import Optional

from app.config import settings
from app.pipeline.gazetteer import LocationInfo, LOCATIONS, get_all_locations
from app.pipeline.clustering import ReportItem
from app.pipeline.aggregator import aggregate_location
from app.models.schemas import SpatialPhysicsFactors, BlackoutRiskAssessment


# Central Nepal Epicenter Reference (Barpak / Gorkha)
EPICENTER_LAT = 28.0000
EPICENTER_LON = 84.6333

# Sector Topographic & Structural Parameters
SECTOR_PHYSICS_PARAMS: dict[str, dict] = {
    "gorkha": {
        "elevation_meters": 1400,
        "slope_gradient": 38.0,
        "landslide_susceptibility": 0.95,
        "bridge_severed": True,
        "road_access_impedance": 0.85,
    },
    "rasuwa": {
        "elevation_meters": 1960,
        "slope_gradient": 44.0,
        "landslide_susceptibility": 0.92,
        "bridge_severed": True,
        "road_access_impedance": 0.95,
    },
    "sindhupalchok": {
        "elevation_meters": 1600,
        "slope_gradient": 40.0,
        "landslide_susceptibility": 0.90,
        "bridge_severed": True,
        "road_access_impedance": 0.90,
    },
    "dolakha": {
        "elevation_meters": 1550,
        "slope_gradient": 35.0,
        "landslide_susceptibility": 0.78,
        "bridge_severed": False,
        "road_access_impedance": 0.70,
    },
    "nuwakot": {
        "elevation_meters": 1020,
        "slope_gradient": 24.0,
        "landslide_susceptibility": 0.45,
        "bridge_severed": False,
        "road_access_impedance": 0.35,
    },
    "kathmandu": {
        "elevation_meters": 1350,
        "slope_gradient": 12.0,
        "landslide_susceptibility": 0.25,
        "bridge_severed": False,
        "road_access_impedance": 0.40,
    },
    "bhaktapur": {
        "elevation_meters": 1330,
        "slope_gradient": 10.0,
        "landslide_susceptibility": 0.20,
        "bridge_severed": False,
        "road_access_impedance": 0.20,
    },
    "sindhuli": {
        "elevation_meters": 980,
        "slope_gradient": 26.0,
        "landslide_susceptibility": 0.50,
        "bridge_severed": False,
        "road_access_impedance": 0.50,
    },
}


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine distance in km."""
    r = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def compute_spatial_physics(location: LocationInfo) -> SpatialPhysicsFactors:
    """Calculate geographic and topological hazard factors for a sector."""
    dist_km = haversine_km(location.lat, location.lon, EPICENTER_LAT, EPICENTER_LON)
    
    # Epicenter hazard: inverse exponential with distance
    # Max hazard near epicenter (~1.0), decaying with distance
    epi_hazard = max(0.0, min(1.0, math.exp(-dist_km / 75.0)))
    
    params = SECTOR_PHYSICS_PARAMS.get(location.id, {
        "elevation_meters": 1200,
        "slope_gradient": 25.0,
        "landslide_susceptibility": 0.5,
        "bridge_severed": False,
        "road_access_impedance": 0.5,
    })
    
    return SpatialPhysicsFactors(
        epicenter_distance_km=round(dist_km, 1),
        epicenter_distance_hazard=round(epi_hazard, 3),
        slope_gradient_degrees=params["slope_gradient"],
        landslide_susceptibility_index=params["landslide_susceptibility"],
        critical_bridge_severed=params["bridge_severed"],
        road_access_impedance=params["road_access_impedance"],
        elevation_meters=params["elevation_meters"],
    )


def assess_sector_blackout_risk(
    location: LocationInfo,
    reports: list[ReportItem],
    simulated_now: Optional[datetime] = None,
) -> BlackoutRiskAssessment:
    """
    Evaluate blackout intelligence and compute Inferred Risk Score using spatial physics.
    Prevents disconnected silent zones from being mistakenly assumed safe.
    """
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)
    elif simulated_now.tzinfo is None:
        simulated_now = simulated_now.replace(tzinfo=timezone.utc)

    agg = aggregate_location(location=location, reports=reports, simulated_now=simulated_now)
    physics = compute_spatial_physics(location)
    
    is_blackout = (agg.status == "blackout")
    
    # Spatial Physics Inferred Risk Formulation:
    # 40% Epicenter proximity hazard + 30% Landslide/slope susceptibility + 30% Isolation/road impedance
    base_inferred_risk = (
        (physics.epicenter_distance_hazard * 40.0) +
        (physics.landslide_susceptibility_index * 30.0) +
        (physics.road_access_impedance * 30.0)
    )
    
    # Bridge severance multiplier
    if physics.critical_bridge_severed:
        base_inferred_risk = min(100.0, base_inferred_risk * 1.15)
        
    inferred_risk_score = round(base_inferred_risk, 1)

    # Determine Threat Tier
    threat_tier: str
    risk_explanation: str
    recon_priority: int

    if not is_blackout and agg.status == "verified_safe":
        threat_tier = "VERIFIED_SAFE"
        risk_explanation = "Sector communication active. Confirmed safe via field inspection."
        recon_priority = 5
    elif is_blackout:
        if inferred_risk_score >= 75.0:
            threat_tier = "CRITICAL_INFERRED"
            risk_explanation = (
                f"CRITICAL SILENT ZONE: Total communication blackout ({agg.silence_duration_hours or 0:.1f}h silence). "
                f"High inferred risk ({inferred_risk_score}/100) due to epicenter proximity ({physics.epicenter_distance_km}km) "
                f"and steep terrain slope ({physics.slope_gradient_degrees}°). High probability of uncontacted mass casualties."
            )
            recon_priority = 1
        elif inferred_risk_score >= 50.0:
            threat_tier = "HIGH_INFERRED"
            risk_explanation = (
                f"HIGH-RISK BLACKOUT: Sector severed from comms. Inferred risk {inferred_risk_score}/100. "
                f"Road impedance ({physics.road_access_impedance * 100:.0f}%) suggests physical isolation."
            )
            recon_priority = 2
        else:
            threat_tier = "MODERATE"
            risk_explanation = (
                f"MODERATE INFERRED RISK: Comms blackout in peripheral sector. "
                f"Distance to epicenter: {physics.epicenter_distance_km}km."
            )
            recon_priority = 3
    else:
        # Sector has reports
        if agg.status == "verified_damaged":
            threat_tier = "CRITICAL_INFERRED" if inferred_risk_score >= 70 else "HIGH_INFERRED"
            risk_explanation = f"Active corroborated damage: {agg.status_reason}"
            recon_priority = 1
        else:
            threat_tier = "MODERATE" if inferred_risk_score >= 50 else "LOW"
            risk_explanation = f"Unverified reports with moderate risk factors ({inferred_risk_score}/100)."
            recon_priority = 4

    return BlackoutRiskAssessment(
        sector_id=location.id,
        sector_name=location.name,
        is_in_blackout=is_blackout,
        silence_duration_hours=agg.silence_duration_hours,
        spatial_physics=physics,
        inferred_risk_score=inferred_risk_score,
        threat_tier=threat_tier,
        risk_explanation=risk_explanation,
        recommended_recon_priority=recon_priority,
    )


def assess_all_blackout_risks(
    reports: list[ReportItem],
    simulated_now: Optional[datetime] = None,
) -> list[BlackoutRiskAssessment]:
    """Assess blackout risks across all 8 central Nepal sectors."""
    all_locs = get_all_locations()
    return [assess_sector_blackout_risk(loc, reports, simulated_now) for loc in all_locs]
