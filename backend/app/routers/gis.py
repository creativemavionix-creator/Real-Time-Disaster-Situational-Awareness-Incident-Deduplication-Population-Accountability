"""API router for Real-Time Situational GIS Telemetry, Spatial Layers, and H3 Hexagonal Grid."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import ReportDB
from app.models.schemas import GisFeatureCollection, GisSectorTelemetry
from app.pipeline.gazetteer import get_all_locations
from app.pipeline.clustering import ReportItem
from app.pipeline.embedder import deserialize_embedding
from app.pipeline.aggregator import aggregate_location
from app.pipeline.blackout_risk import compute_spatial_physics, assess_sector_blackout_risk
from app.pipeline.satellite_evidence import find_satellite_evidence
from app.pipeline.h3_grid import generate_central_nepal_h3_hexagons
from app.simulation.clock import get_simulated_time

router = APIRouter(prefix="/gis", tags=["GIS & Situational Telemetry"])


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


@router.get("/telemetry", response_model=GisFeatureCollection, summary="Get real-time GIS spatial telemetry for all sectors")
def get_gis_telemetry(
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """Retrieve full geospatial telemetry, centroid coordinates, isolation indices, and hazard ratings."""
    effective_time = sim_time or get_simulated_time(db)

    db_reports = db.query(ReportDB).filter(ReportDB.timestamp <= effective_time).all()
    report_items = [_db_to_report_item(r) for r in db_reports]

    all_locs = get_all_locations()
    sectors_telemetry: list[GisSectorTelemetry] = []

    for loc in all_locs:
        agg = aggregate_location(location=loc, reports=report_items, simulated_now=effective_time)
        physics = compute_spatial_physics(loc)
        blackout = assess_sector_blackout_risk(location=loc, reports=report_items, simulated_now=effective_time)
        sat_evidence = find_satellite_evidence(lat=loc.lat, lon=loc.lon, sector_id=loc.id)

        # Total estimated casualties in sector
        cas_sum = sum(c.casualty_estimate or 0 for c in agg.top_incidents)

        # Severity index (0.0 to 10.0)
        sev_index = round(
            (agg.confidence_score * 5.0) +
            (physics.epicenter_distance_hazard * 3.0) +
            (physics.landslide_susceptibility_index * 2.0),
            1
        ) if agg.status == "verified_damaged" else (
            round(blackout.inferred_risk_score / 10.0, 1) if agg.status == "blackout" else 1.5
        )

        sectors_telemetry.append(
            GisSectorTelemetry(
                sector_id=loc.id,
                sector_name=loc.name,
                status=agg.status,
                confidence_score=agg.confidence_score,
                severity_index=min(10.0, max(0.0, sev_index)),
                threat_tier=blackout.threat_tier,
                latitude=loc.lat,
                longitude=loc.lon,
                elevation_meters=physics.elevation_meters,
                distance_to_epicenter_km=physics.epicenter_distance_km,
                active_incidents_count=agg.incident_cluster_count,
                estimated_casualties=cas_sum,
                isolation_index=physics.road_access_impedance,
                last_telemetry_timestamp=agg.last_update,
                satellite_corroborated=sat_evidence["satellite_corroborated"],
                satellite_sensor=sat_evidence["sensor_source"],
            )
        )

    return GisFeatureCollection(
        type="FeatureCollection",
        simulated_time=effective_time,
        sectors=sectors_telemetry,
    )


import math

def _generate_circle_polygon(center_lat: float, center_lon: float, radius_km: float, num_points: int = 36) -> list[list[float]]:
    """Generate polygon coordinates for a circle/ellipse on WGS84."""
    coords = []
    lat_scale = 1.0 / 111.0
    lon_scale = 1.0 / (111.0 * math.cos(math.radians(center_lat)))

    for i in range(num_points):
        angle = math.radians(i * (360.0 / num_points))
        d_lat = radius_km * math.cos(angle) * lat_scale
        d_lon = radius_km * math.sin(angle) * lon_scale
        coords.append([round(center_lat + d_lat, 5), round(center_lon + d_lon, 5)])

    coords.append(coords[0])  # close ring
    return coords


@router.get("/h3-grid", summary="Get dynamic H3 Hexagonal Grid Cells and Silent Sector Exposure Metrics ($E_{cell}$)")
def get_h3_grid(
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """
    Returns H3 Hexagonal Grid Cells (Resolution 8) across Central Nepal with:
    - Status: Critical (Red), Moderate (Yellow), Flashing Blackout (Grey/Black), Safe (Green)
    - Silent Sector Exposure: E_cell = (Baseline Pop) / max(1, Report_Freq) * Adjacent_Hazard_Index
    """
    effective_time = sim_time or get_simulated_time(db)
    hexagons = generate_central_nepal_h3_hexagons(db=db, simulated_time=effective_time)
    return {
        "type": "H3HexagonalGridCollection",
        "total_hexagons": len(hexagons),
        "resolution": 8,
        "blackout_cells_count": sum(1 for h in hexagons if h["is_blackout"]),
        "hexagons": hexagons,
    }


from app.simulation.propagation_engine import (
    calculate_propagation_flow,
    generate_hazard_overlays_for_disaster,
    PROPAGATION_NETWORKS,
)
from app.simulation.clock import get_active_disaster_type, get_or_create_clock
from app.pipeline.telemetry_engine import (
    compute_all_sectors_telemetry,
    compute_sector_telemetry,
)


@router.get("/hazard-overlays", summary="Get dynamic physical disaster hazard extent and isoseismal/inundation overlays")
def get_hazard_overlays(
    disaster_type: Optional[str] = Query(default=None, description="Disaster category"),
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """
    Returns multi-tier physical hazard extent geometry tailored to disaster physics.
    """
    effective_time = sim_time or get_simulated_time(db)
    active_type = get_active_disaster_type()
    chosen_type = disaster_type if disaster_type else active_type

    try:
        clock = get_or_create_clock(db)
        elapsed_hours = max(0.0, (effective_time - clock.start_time).total_seconds() / 3600.0)
    except Exception:
        elapsed_hours = 3.5

    overlays = generate_hazard_overlays_for_disaster(disaster_type=chosen_type, elapsed_hours=elapsed_hours)
    network = PROPAGATION_NETWORKS.get(chosen_type, PROPAGATION_NETWORKS["earthquake"])
    origin = network["origin"]

    return {
        "type": "HazardOverlayCollection",
        "disaster_type": chosen_type,
        "simulated_time": effective_time.isoformat(),
        "origin": {
            "name": origin.name,
            "lat": origin.lat,
            "lon": origin.lon,
            "depth_km": 15.0 if chosen_type == "earthquake" else 0.0,
            "magnitude": 7.8 if chosen_type == "earthquake" else 0.0,
            "metric_label": origin.initial_metric_label,
            "metric_value": origin.initial_metric_value,
        },
        "overlays": [o.model_dump() for o in overlays],
    }


@router.get("/propagation-path", summary="Get directed disaster propagation flow path and village arrival timeline")
def get_propagation_path(
    disaster_type: Optional[str] = Query(default=None, description="Disaster category"),
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """
    Returns the ordered topological disaster movement path, intermediate nodes, and active wavefront.
    """
    effective_time = sim_time or get_simulated_time(db)
    active_type = get_active_disaster_type()
    chosen_type = disaster_type if disaster_type else active_type

    try:
        clock = get_or_create_clock(db)
        elapsed_hours = max(0.0, (effective_time - clock.start_time).total_seconds() / 3600.0)
    except Exception:
        elapsed_hours = 3.5

    flow = calculate_propagation_flow(
        disaster_type=chosen_type,
        elapsed_hours=elapsed_hours,
        simulated_now=effective_time,
    )
    return flow.model_dump()


@router.get("/telemetry-comparison", summary="Get 4-lifeline Expected vs Observed comparison matrix for all sectors")
def get_telemetry_comparison(
    disaster_type: Optional[str] = Query(default=None, description="Disaster category"),
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """
    Returns comparison between Historical Baseline vs Expected vs Observed for:
    - Mobile Connectivity
    - Electricity Grid
    - Internet Availability
    - Road Accessibility
    Calculates Silent Zone Risk Scores and identifies silent zones.
    """
    effective_time = sim_time or get_simulated_time(db)
    active_type = get_active_disaster_type()
    chosen_type = disaster_type if disaster_type else active_type

    # Count observed reports by sector
    db_reports = db.query(ReportDB).filter(ReportDB.timestamp <= effective_time).all()
    counts: dict[str, int] = {}
    for r in db_reports:
        if r.resolved_location_id:
            sec = r.resolved_location_id.lower()
            counts[sec] = counts.get(sec, 0) + 1

    sectors_data = compute_all_sectors_telemetry(
        disaster_type=chosen_type,
        simulated_now=effective_time,
        observed_counts_by_sector=counts,
    )

    return {
        "type": "TelemetryComparisonCollection",
        "disaster_type": chosen_type,
        "simulated_time": effective_time.isoformat(),
        "total_sectors": len(sectors_data),
        "silent_zones_count": sum(1 for s in sectors_data if s.is_silent_zone),
        "sectors": [s.model_dump() for s in sectors_data],
    }


@router.get("/telemetry-comparison/{sector_id}", summary="Get 4-lifeline Expected vs Observed comparison for specific sector")
def get_single_sector_telemetry_comparison(
    sector_id: str,
    disaster_type: Optional[str] = Query(default=None, description="Disaster category"),
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """Returns 4-lifeline Expected vs Observed comparison for a single sector."""
    effective_time = sim_time or get_simulated_time(db)
    active_type = get_active_disaster_type()
    chosen_type = disaster_type if disaster_type else active_type

    db_reports = db.query(ReportDB).filter(
        ReportDB.timestamp <= effective_time,
        ReportDB.resolved_location_id == sector_id.lower(),
    ).count()

    telemetry = compute_sector_telemetry(
        sector_id=sector_id,
        disaster_type=chosen_type,
        simulated_now=effective_time,
        observed_reports_count=db_reports,
    )
    return telemetry.model_dump()


