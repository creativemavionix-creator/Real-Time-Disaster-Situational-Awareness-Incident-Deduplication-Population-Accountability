"""API router for location queries, statuses, and incident clusters."""

from collections import Counter
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import ReportDB
from app.models.schemas import (
    LocationSchema,
    LocationListResponse,
    LocationStatusResponse,
    AllLocationsStatusResponse,
    IncidentClusterResponse,
    ReportResponse,
    ScoreBreakdownSchema,
)
from app.pipeline.gazetteer import get_all_locations, get_location_by_id
from app.pipeline.clustering import ReportItem, ClusterItem, cluster_reports
from app.pipeline.embedder import deserialize_embedding
from app.pipeline.scoring import score_cluster
from app.pipeline.aggregator import aggregate_location, aggregate_all_locations
from app.simulation.clock import get_simulated_time

router = APIRouter(prefix="/locations", tags=["Locations"])


def _db_to_report_item(r: ReportDB) -> ReportItem:
    """Convert DB model to pipeline ReportItem."""
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


def _cluster_item_to_schema(c: ClusterItem) -> IncidentClusterResponse:
    """Convert pipeline ClusterItem to IncidentClusterResponse schema."""
    report_schemas: list[ReportResponse] = []
    for r in c.reports:
        bd = r.score_breakdown or {
            "source_trust_weight": 0.5,
            "has_coordinates_bonus": 0.0,
            "corroboration_bonus": 0.0,
            "base_score": 0.5,
            "elapsed_hours": 0.0,
            "staleness_decay": 1.0,
            "effective_score": 0.5,
            "formula_explanation": "Default scoring",
        }
        report_schemas.append(
            ReportResponse(
                id=r.id,
                source_type=r.source_type,
                raw_text=r.raw_text,
                reported_lat=r.reported_lat,
                reported_lon=r.reported_lon,
                timestamp=r.timestamp,
                resolved_location_id=r.resolved_location_id,
                resolved_location_name=r.resolved_location_id.capitalize() if r.resolved_location_id else None,
                location_resolved_by=r.location_resolved_by,
                extracted_casualties=r.extracted_casualties,
                extracted_damage_type=r.extracted_damage_type,
                score_breakdown=ScoreBreakdownSchema(**bd),
                cluster_id=c.cluster_id,
            )
        )

    return IncidentClusterResponse(
        cluster_id=c.cluster_id,
        location_id=c.location_id,
        representative_text=c.representative_text,
        damage_type=c.damage_type,
        casualty_estimate=c.casualty_estimate,
        report_count=c.report_count,
        sources_breakdown=c.sources_breakdown,
        confidence_score=c.confidence_score,
        first_reported=c.first_reported,
        last_reported=c.last_reported,
        reports=report_schemas,
    )


@router.get("", response_model=LocationListResponse, summary="List the 8 fixed locations")
def list_locations():
    """Retrieve metadata, centroids, and descriptions for all 8 fixed Nepal locations."""
    locs = get_all_locations()
    items = [
        LocationSchema(
            id=loc.id,
            name=loc.name,
            lat=loc.lat,
            lon=loc.lon,
            description=loc.description,
            aliases=loc.aliases,
        )
        for loc in locs
    ]
    return LocationListResponse(locations=items, total=len(items))


@router.get("/status", response_model=AllLocationsStatusResponse, summary="Aggregated status for all 8 locations")
def get_all_locations_status(
    sim_time: Optional[datetime] = Query(
        default=None,
        description="Optional simulation timestamp override (defaults to active replay clock)"
    ),
    db: Session = Depends(get_db)
):
    """
    Get situational awareness status for all 8 locations at current simulated time.
    Statuses include: verified_safe, verified_damaged, unverified, blackout.
    """
    effective_time = sim_time or get_simulated_time(db)
    
    # Query all reports up to effective simulated time
    db_reports = db.query(ReportDB).filter(ReportDB.timestamp <= effective_time).all()
    report_items = [_db_to_report_item(r) for r in db_reports]
    
    agg_statuses = aggregate_all_locations(reports=report_items, simulated_now=effective_time)
    
    loc_responses: list[LocationStatusResponse] = []
    status_counts = Counter()
    
    for agg in agg_statuses:
        status_counts[agg.status] += 1
        top_incidents_schema = [_cluster_item_to_schema(c) for c in agg.top_incidents]
        
        loc_responses.append(
            LocationStatusResponse(
                location_id=agg.location_id,
                location_name=agg.location_name,
                lat=agg.lat,
                lon=agg.lon,
                status=agg.status,
                confidence_score=agg.confidence_score,
                report_count=agg.report_count,
                incident_cluster_count=agg.incident_cluster_count,
                last_update=agg.last_update,
                silence_duration_hours=agg.silence_duration_hours,
                top_incidents=top_incidents_schema,
                status_reason=agg.status_reason,
            )
        )
        
    return AllLocationsStatusResponse(
        simulated_time=effective_time,
        locations=loc_responses,
        summary_counts=dict(status_counts),
    )


@router.get("/{location_id}/status", response_model=LocationStatusResponse, summary="Status for a single location")
def get_single_location_status(
    location_id: str,
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db)
):
    """Retrieve detailed status, confidence, and top incidents for a single location."""
    loc_info = get_location_by_id(location_id)
    if not loc_info:
        raise HTTPException(
            status_code=404,
            detail=f"Location '{location_id}' not found. Valid IDs: {[l.id for l in get_all_locations()]}"
        )
        
    effective_time = sim_time or get_simulated_time(db)
    
    db_reports = db.query(ReportDB).filter(
        ReportDB.resolved_location_id == loc_info.id,
        ReportDB.timestamp <= effective_time
    ).all()
    report_items = [_db_to_report_item(r) for r in db_reports]
    
    agg = aggregate_location(location=loc_info, reports=report_items, simulated_now=effective_time)
    top_incidents_schema = [_cluster_item_to_schema(c) for c in agg.top_incidents]
    
    return LocationStatusResponse(
        location_id=agg.location_id,
        location_name=agg.location_name,
        lat=agg.lat,
        lon=agg.lon,
        status=agg.status,
        confidence_score=agg.confidence_score,
        report_count=agg.report_count,
        incident_cluster_count=agg.incident_cluster_count,
        last_update=agg.last_update,
        silence_duration_hours=agg.silence_duration_hours,
        top_incidents=top_incidents_schema,
        status_reason=agg.status_reason,
    )


@router.get("/{location_id}/incidents", response_model=list[IncidentClusterResponse], summary="Incident clusters for a location")
def get_location_incidents(
    location_id: str,
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db)
):
    """
    Get all deduplicated incident clusters for a specific location with
    representative text, confidence, source breakdown, and individual reports.
    """
    loc_info = get_location_by_id(location_id)
    if not loc_info:
        raise HTTPException(
            status_code=404,
            detail=f"Location '{location_id}' not found. Valid IDs: {[l.id for l in get_all_locations()]}"
        )
        
    effective_time = sim_time or get_simulated_time(db)
    
    db_reports = db.query(ReportDB).filter(
        ReportDB.resolved_location_id == loc_info.id,
        ReportDB.timestamp <= effective_time
    ).all()
    
    report_items = [_db_to_report_item(r) for r in db_reports]
    clusters = cluster_reports(report_items)
    
    for c in clusters:
        score_cluster(c, simulated_now=effective_time)
        
    sorted_clusters = sorted(clusters, key=lambda c: c.confidence_score, reverse=True)
    return [_cluster_item_to_schema(c) for c in sorted_clusters]
