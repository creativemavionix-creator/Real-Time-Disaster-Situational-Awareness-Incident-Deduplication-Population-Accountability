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


@router.get("/h3-grid", summary="Get dynamic H3 Hexagonal Grid Cells and Silent Sector Exposure Metrics ($E_{cell}$)")
def get_h3_grid():
    """
    Returns H3 Hexagonal Grid Cells (Resolution 8) across Central Nepal with:
    - Status: Critical (Red), Moderate (Yellow), Flashing Blackout (Grey/Black), Safe (Green)
    - Silent Sector Exposure: E_cell = (Baseline Pop) / max(1, Report_Freq) * Adjacent_Hazard_Index
    """
    hexagons = generate_central_nepal_h3_hexagons()
    return {
        "type": "H3HexagonalGridCollection",
        "total_hexagons": len(hexagons),
        "resolution": 8,
        "blackout_cells_count": sum(1 for h in hexagons if h["is_blackout"]),
        "hexagons": hexagons,
    }
