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


@router.get("/hazard-overlays", summary="Get dynamic physical disaster hazard extent and isoseismal/inundation overlays")
def get_hazard_overlays(
    disaster_type: str = Query(default="earthquake", description="Disaster category"),
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """
    Returns multi-tier physical hazard extent geometry (e.g., MMI VIII, VII, VI isoseismal shaking contours).
    """
    effective_time = sim_time or get_simulated_time(db)
    epicenter_lat = 28.147
    epicenter_lon = 84.708

    # Generate isoseismal ground shaking attenuation rings
    ring_severe = _generate_circle_polygon(epicenter_lat, epicenter_lon, radius_km=38.0)
    ring_heavy = _generate_circle_polygon(epicenter_lat, epicenter_lon, radius_km=82.0)
    ring_moderate = _generate_circle_polygon(epicenter_lat, epicenter_lon, radius_km=145.0)

    overlays = [
        {
            "id": "mmi_viii_critical",
            "name": "Violent Shaking (MMI VIII+ / Heavy Collapse)",
            "hazard_type": "seismic_isoseismal",
            "severity": "CRITICAL",
            "color": "#EF4444",
            "fill_opacity": 0.22,
            "border_color": "#DC2626",
            "border_weight": 2.5,
            "radius_km": 38.0,
            "center": [epicenter_lat, epicenter_lon],
            "polygon_coordinates": ring_severe,
            "description": "Peak Ground Acceleration > 0.45g. Severe unreinforced masonry collapse, widespread bridge/rockfall failures.",
        },
        {
            "id": "mmi_vii_heavy",
            "name": "Very Strong Shaking (MMI VII / Structural Damage)",
            "hazard_type": "seismic_isoseismal",
            "severity": "HIGH",
            "color": "#F97316",
            "fill_opacity": 0.14,
            "border_color": "#EA580C",
            "border_weight": 1.8,
            "radius_km": 82.0,
            "center": [epicenter_lat, epicenter_lon],
            "polygon_coordinates": ring_heavy,
            "description": "Peak Ground Acceleration 0.22g - 0.45g. Moderate-to-heavy masonry damage and partial utility power tripping.",
        },
        {
            "id": "mmi_vi_moderate",
            "name": "Strong Shaking (MMI VI / Moderate Alarm)",
            "hazard_type": "seismic_isoseismal",
            "severity": "MODERATE",
            "color": "#FBBF24",
            "fill_opacity": 0.08,
            "border_color": "#D97706",
            "border_weight": 1.2,
            "radius_km": 145.0,
            "center": [epicenter_lat, epicenter_lon],
            "polygon_coordinates": ring_moderate,
            "description": "Peak Ground Acceleration 0.10g - 0.22g. Felt violently by all, minor plaster falls and telephone line congestion.",
        },
    ]

    return {
        "type": "HazardOverlayCollection",
        "disaster_type": disaster_type,
        "simulated_time": effective_time.isoformat(),
        "origin": {
            "name": "M7.8 Barpak Epicenter",
            "lat": epicenter_lat,
            "lon": epicenter_lon,
            "depth_km": 15.0,
            "magnitude": 7.8,
        },
        "overlays": overlays,
    }


@router.get("/propagation-path", summary="Get directed disaster propagation flow path and village arrival timeline")
def get_propagation_path(
    disaster_type: str = Query(default="earthquake", description="Disaster category"),
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """
    Returns the ordered topological disaster movement path, intermediate nodes, and active wavefront.
    """
    effective_time = sim_time or get_simulated_time(db)
    
    # Calculate elapsed hours from baseline start (assumed 2026-08-30 06:00:00)
    try:
        from app.simulation.clock import get_or_create_clock
        clock = get_or_create_clock(db)
        elapsed_hours = max(0.0, (effective_time - clock.start_time).total_seconds() / 3600.0)
    except Exception:
        elapsed_hours = 3.5

    origin = {
        "node_id": "orig_barpak",
        "name": "Barpak Epicenter Ridge (Gorkha)",
        "lat": 28.147,
        "lon": 84.708,
        "timestamp_offset_hours": 0.0,
        "status": "IMPACTED",
        "lifeline_impact": "Initial Rupture Origin & Severe Mountain Spur Severance",
    }

    raw_nodes = [
        {
            "node_id": "node_gorkha_bazar",
            "name": "Gorkha Bazar Core",
            "lat": 28.00,
            "lon": 84.63,
            "timestamp_offset_hours": 0.3,
            "lifeline_impact": "Cellular BTS Tower Outage & Access Trail Loss",
        },
        {
            "node_id": "node_rasuwa_dhunche",
            "name": "Dhunche Mountain Pass (Rasuwa)",
            "lat": 28.13,
            "lon": 85.30,
            "timestamp_offset_hours": 1.0,
            "lifeline_impact": "Massive Rockfall Corridor & Highway Severance",
        },
        {
            "node_id": "node_nuwakot_bidur",
            "name": "Bidur Highway Choke Point (Nuwakot)",
            "lat": 27.91,
            "lon": 85.16,
            "timestamp_offset_hours": 1.8,
            "lifeline_impact": "Trishuli River Bridge Deck Failure & Power Trip",
        },
        {
            "node_id": "node_ktm_valley",
            "name": "Kathmandu Valley Core",
            "lat": 27.7172,
            "lon": 85.3240,
            "timestamp_offset_hours": 2.5,
            "lifeline_impact": "Dense Masonry Collapse & High Civilian 911 Surge",
        },
        {
            "node_id": "node_bhaktapur_heritage",
            "name": "Bhaktapur Heritage Core",
            "lat": 27.6710,
            "lon": 85.4298,
            "timestamp_offset_hours": 2.9,
            "lifeline_impact": "Historic Brick Masonry Collapse & Street Blockage",
        },
        {
            "node_id": "node_sindhupalchok_chautara",
            "name": "Chautara / Melamchi Ridgeline (Sindhupalchok)",
            "lat": 27.77,
            "lon": 85.70,
            "timestamp_offset_hours": 3.4,
            "lifeline_impact": "Araniko Highway Severed & Total Comms Blackout",
        },
        {
            "node_id": "node_dolakha_charikot",
            "name": "Charikot Eastern Spur (Dolakha)",
            "lat": 27.70,
            "lon": 86.05,
            "timestamp_offset_hours": 4.8,
            "lifeline_impact": "High-Altitude Slope Failure & Secondary Aftershock Fault",
        },
        {
            "node_id": "node_sindhuli_highway",
            "name": "BP Highway Corridor (Sindhuli)",
            "lat": 27.25,
            "lon": 85.92,
            "timestamp_offset_hours": 6.0,
            "lifeline_impact": "Southern Evacuation Choke Point & Landslide Debris",
        },
    ]

    processed_nodes = []
    active_wavefront_node = None

    for node in raw_nodes:
        offset = node["timestamp_offset_hours"]
        if elapsed_hours >= offset:
            # Impacted or active wavefront
            if active_wavefront_node is None or offset > active_wavefront_node["timestamp_offset_hours"]:
                status = "ACTIVE_WAVEFRONT"
            else:
                status = "IMPACTED"
        else:
            status = "PROJECTED_IMPACT"

        n_dict = {
            **node,
            "status": status,
        }
        processed_nodes.append(n_dict)
        if status == "ACTIVE_WAVEFRONT":
            active_wavefront_node = n_dict

    # Construct ordered polyline path coordinates
    path_coords = [[origin["lat"], origin["lon"]]] + [[n["lat"], n["lon"]] for n in processed_nodes]

    return {
        "type": "PropagationPathCollection",
        "disaster_type": disaster_type,
        "simulated_time": effective_time.isoformat(),
        "elapsed_hours": round(elapsed_hours, 1),
        "origin": origin,
        "nodes": processed_nodes,
        "path_coordinates": path_coords,
        "active_wavefront": active_wavefront_node or processed_nodes[0],
    }

