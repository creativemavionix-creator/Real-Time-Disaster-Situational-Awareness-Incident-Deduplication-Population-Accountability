"""API router for location queries, statuses, operator overrides, and verification ranking."""

from collections import Counter
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import ReportDB, LocationOverrideDB
from app.models.schemas import (
    LocationSchema,
    LocationListResponse,
    LocationStatusResponse,
    AllLocationsStatusResponse,
    IncidentClusterResponse,
    ReportResponse,
    ScoreBreakdownSchema,
    LocationOverrideRequest,
    LocationOverrideResponse,
    OperatorOverrideSchema,
    AccountableOfficerSchema,
    BiasAnalysisSchema,
    LocationVerificationRankSchema,
)
from app.pipeline.gazetteer import get_all_locations, get_location_by_id
from app.pipeline.clustering import ReportItem, ClusterItem, cluster_reports
from app.pipeline.embedder import deserialize_embedding
from app.pipeline.scoring import score_cluster
from app.pipeline.aggregator import (
    aggregate_location,
    aggregate_all_locations,
    compute_verification_ranking,
    AggregatedLocationStatus,
)
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


def _get_latest_overrides_dict(db: Session) -> dict[str, dict]:
    """Fetch the latest active human operator override per location."""
    overrides = db.query(LocationOverrideDB).order_by(LocationOverrideDB.timestamp.desc()).all()
    latest_by_loc: dict[str, dict] = {}
    for o in overrides:
        loc_key = o.location_id.lower()
        if loc_key not in latest_by_loc:
            latest_by_loc[loc_key] = {
                "is_overridden": True,
                "override_status": o.override_status,
                "confirmed_safe": o.confirmed_safe,
                "operator_name": o.operator_name,
                "operator_role": o.operator_role,
                "badge_or_unit": o.badge_or_unit,
                "justification_notes": o.justification_notes,
                "timestamp": o.timestamp,
            }
    return latest_by_loc


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


@router.get("/verification-ranking", response_model=list[LocationVerificationRankSchema], summary="Rank sectors by Next Best Observation priority")
def get_locations_verification_ranking(
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db)
):
    """
    Ranks all 8 sectors by 'where should we verify next' instead of just static status.
    Prioritizes: Long silence + high exposed population + high structural fragility + lack of ground truth.
    """
    effective_time = sim_time or get_simulated_time(db)
    db_reports = db.query(ReportDB).filter(ReportDB.timestamp <= effective_time).all()
    report_items = [_db_to_report_item(r) for r in db_reports]

    overrides = _get_latest_overrides_dict(db)
    agg_statuses = aggregate_all_locations(reports=report_items, simulated_now=effective_time, overrides_by_location=overrides)
    rank_items = compute_verification_ranking(agg_statuses)

    return [
        LocationVerificationRankSchema(
            location_id=r.location_id,
            location_name=r.location_name,
            rank=r.rank,
            urgency_score=r.urgency_score,
            silence_duration_hours=r.silence_duration_hours,
            estimated_exposed_population=r.estimated_exposed_population,
            structural_vulnerability_index=r.structural_vulnerability_index,
            recommended_recon_sortie=r.recommended_recon_sortie,
            primary_reason=r.primary_reason,
        )
        for r in rank_items
    ]


@router.get("/status", response_model=AllLocationsStatusResponse, summary="Aggregated status for all 8 locations")
def get_all_locations_status(
    sim_time: Optional[datetime] = Query(
        default=None,
        description="Optional simulation timestamp override (defaults to active replay clock)"
    ),
    db: Session = Depends(get_db)
):
    """
    Get situational awareness status for all 8 locations with Human-in-the-Loop overrides,
    source bias checks, accountable sector commanders, and next-best verification rankings.
    """
    effective_time = sim_time or get_simulated_time(db)
    
    # Query all reports up to effective simulated time
    db_reports = db.query(ReportDB).filter(ReportDB.timestamp <= effective_time).all()
    report_items = [_db_to_report_item(r) for r in db_reports]
    
    overrides = _get_latest_overrides_dict(db)
    agg_statuses = aggregate_all_locations(
        reports=report_items,
        simulated_now=effective_time,
        overrides_by_location=overrides,
    )
    
    loc_responses: list[LocationStatusResponse] = []
    status_counts = Counter()
    
    for agg in agg_statuses:
        status_counts[agg.status] += 1
        top_incidents_schema = [_cluster_item_to_schema(c) for c in agg.top_incidents]
        
        override_schema = OperatorOverrideSchema(**agg.operator_override) if agg.operator_override else None
        officer_schema = AccountableOfficerSchema(
            name=agg.accountable_officer.name,
            agency=agg.accountable_officer.agency,
            role=agg.accountable_officer.role,
            contact_channel=agg.accountable_officer.contact_channel,
            last_attestation=agg.accountable_officer.last_attestation,
        ) if agg.accountable_officer else None

        bias_schema = BiasAnalysisSchema(
            informal_report_pct=agg.bias_analysis.informal_report_pct,
            official_report_pct=agg.bias_analysis.official_report_pct,
            bias_flag=agg.bias_analysis.bias_flag,
            explanation=agg.bias_analysis.explanation,
        ) if agg.bias_analysis else None

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
                operator_override=override_schema,
                accountable_officer=officer_schema,
                bias_analysis=bias_schema,
                human_safe_confirmation_required=agg.human_safe_confirmation_required,
            )
        )
        
    ranking_items = compute_verification_ranking(agg_statuses)
    rankings_schema = [
        LocationVerificationRankSchema(
            location_id=r.location_id,
            location_name=r.location_name,
            rank=r.rank,
            urgency_score=r.urgency_score,
            silence_duration_hours=r.silence_duration_hours,
            estimated_exposed_population=r.estimated_exposed_population,
            structural_vulnerability_index=r.structural_vulnerability_index,
            recommended_recon_sortie=r.recommended_recon_sortie,
            primary_reason=r.primary_reason,
        )
        for r in ranking_items
    ]

    return AllLocationsStatusResponse(
        simulated_time=effective_time,
        locations=loc_responses,
        summary_counts=dict(status_counts),
        verification_ranking=rankings_schema,
    )


@router.get("/{location_id}/status", response_model=LocationStatusResponse, summary="Status for a single location")
def get_single_location_status(
    location_id: str,
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db)
):
    """Retrieve detailed status, confidence, bias analysis, and accountable commander for a single location."""
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
    
    overrides = _get_latest_overrides_dict(db)
    loc_override = overrides.get(loc_info.id.lower())

    agg = aggregate_location(
        location=loc_info,
        reports=report_items,
        simulated_now=effective_time,
        operator_override=loc_override,
    )
    top_incidents_schema = [_cluster_item_to_schema(c) for c in agg.top_incidents]
    
    override_schema = OperatorOverrideSchema(**agg.operator_override) if agg.operator_override else None
    officer_schema = AccountableOfficerSchema(
        name=agg.accountable_officer.name,
        agency=agg.accountable_officer.agency,
        role=agg.accountable_officer.role,
        contact_channel=agg.accountable_officer.contact_channel,
        last_attestation=agg.accountable_officer.last_attestation,
    ) if agg.accountable_officer else None

    bias_schema = BiasAnalysisSchema(
        informal_report_pct=agg.bias_analysis.informal_report_pct,
        official_report_pct=agg.bias_analysis.official_report_pct,
        bias_flag=agg.bias_analysis.bias_flag,
        explanation=agg.bias_analysis.explanation,
    ) if agg.bias_analysis else None

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
        operator_override=override_schema,
        accountable_officer=officer_schema,
        bias_analysis=bias_schema,
        human_safe_confirmation_required=agg.human_safe_confirmation_required,
    )


@router.post(
    "/{location_id}/override",
    response_model=LocationOverrideResponse,
    status_code=status.HTTP_200_OK,
    summary="Human Operator Confirmation or Status Override"
)
def override_location_status(
    location_id: str,
    payload: LocationOverrideRequest,
    db: Session = Depends(get_db)
):
    """
    Human-in-the-Loop Confirmation/Override:
    Allows an authorized Officer/Commander to explicitly confirm an area safe or override
    the AI-inferred status with mandatory justification and immutable audit logging.
    """
    loc_info = get_location_by_id(location_id)
    if not loc_info:
        raise HTTPException(
            status_code=404,
            detail=f"Location '{location_id}' not found. Valid IDs: {[l.id for l in get_all_locations()]}"
        )

    now_time = datetime.now(timezone.utc)
    override_record = LocationOverrideDB(
        location_id=loc_info.id.lower(),
        override_status=payload.override_status,
        confirmed_safe=payload.confirmed_safe or (payload.override_status == "verified_safe"),
        operator_name=payload.operator_name,
        operator_role=payload.operator_role,
        badge_or_unit=payload.badge_or_unit,
        justification_notes=payload.justification_notes,
        timestamp=now_time,
    )
    db.add(override_record)
    db.commit()
    db.refresh(override_record)

    return LocationOverrideResponse(
        success=True,
        location_id=loc_info.id,
        effective_status=payload.override_status,
        confirmed_safe=override_record.confirmed_safe,
        operator_name=payload.operator_name,
        timestamp=now_time,
        message=f"Location '{loc_info.name}' status successfully updated to '{payload.override_status}' by {payload.operator_name}.",
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
