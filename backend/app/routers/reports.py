"""API router for raw report ingestion and query."""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import ReportDB
from app.models.schemas import (
    ReportCreateRequest,
    OfficialReportCreateRequest,
    ReportResponse,
    ScoreBreakdownSchema,
)
from app.pipeline.extractor import extract_all
from app.pipeline.embedder import embed_text, serialize_embedding, deserialize_embedding
from app.pipeline.clustering import ReportItem
from app.pipeline.scoring import compute_report_score
from app.security import sanitize_input_text
from app.simulation.clock import get_simulated_time

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post(
    "",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest a new raw disaster report"
)
def create_report(payload: ReportCreateRequest, db: Session = Depends(get_db)):
    """
    Ingest a new raw incident report, extract location/damage/casualties,
    generate sentence embedding, compute explainable reliability score, and persist.
    """
    raw_text = sanitize_input_text(payload.raw_text.strip())
    if not raw_text:
        raise HTTPException(status_code=422, detail="Report raw_text cannot be empty.")
        
    sim_now = get_simulated_time(db)
    rep_time = payload.timestamp or sim_now
    if rep_time.tzinfo is None:
        rep_time = rep_time.replace(tzinfo=timezone.utc)
        
    # 1. Pipeline Extraction (Location, Casualties, Damage Type)
    extraction = extract_all(
        raw_text=raw_text,
        reported_lat=payload.reported_lat,
        reported_lon=payload.reported_lon,
    )
    
    # 2. Embedding Generation
    embedding_vec = embed_text(raw_text)
    embedding_json = serialize_embedding(embedding_vec)
    
    # 3. Store to SQLite DB
    db_report = ReportDB(
        source_type=payload.source_type,
        raw_text=raw_text,
        reported_lat=payload.reported_lat,
        reported_lon=payload.reported_lon,
        timestamp=rep_time,
        resolved_location_id=extraction.location_id,
        location_resolved_by=extraction.location_resolved_by,
        extracted_casualties=extraction.casualties,
        extracted_damage_type=extraction.damage_type,
        confidence_hint=extraction.confidence_hint,
        embedding_json=embedding_json,
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    # 4. Compute Explainable Reliability Score
    rep_item = ReportItem(
        id=db_report.id,
        source_type=db_report.source_type,
        raw_text=db_report.raw_text,
        reported_lat=db_report.reported_lat,
        reported_lon=db_report.reported_lon,
        timestamp=db_report.timestamp,
        resolved_location_id=db_report.resolved_location_id,
        location_resolved_by=db_report.location_resolved_by,
        extracted_casualties=db_report.extracted_casualties,
        extracted_damage_type=db_report.extracted_damage_type,
        confidence_hint=db_report.confidence_hint,
        embedding=embedding_vec,
    )
    
    score_breakdown = compute_report_score(
        report=rep_item,
        cluster_size=1,
        simulated_now=sim_now,
    )
    
    return ReportResponse(
        id=db_report.id,
        source_type=db_report.source_type,
        raw_text=db_report.raw_text,
        reported_lat=db_report.reported_lat,
        reported_lon=db_report.reported_lon,
        timestamp=db_report.timestamp,
        resolved_location_id=db_report.resolved_location_id,
        resolved_location_name=db_report.resolved_location_id.capitalize() if db_report.resolved_location_id else None,
        location_resolved_by=db_report.location_resolved_by,
        extracted_casualties=db_report.extracted_casualties,
        extracted_damage_type=db_report.extracted_damage_type,
        score_breakdown=ScoreBreakdownSchema(**score_breakdown),
        cluster_id=None,
    )


@router.get("", response_model=list[ReportResponse], summary="List ingested reports")
def list_reports(
    location_id: Optional[str] = Query(default=None, description="Filter by location ID"),
    source_type: Optional[str] = Query(default=None, description="Filter by source type"),
    limit: int = Query(default=50, ge=1, le=500),
    sim_time: Optional[datetime] = Query(default=None, description="Filter reports up to simulated time"),
    db: Session = Depends(get_db)
):
    """Retrieve raw reports filtered by location, source type, or simulation time."""
    effective_time = sim_time or get_simulated_time(db)
    
    query = db.query(ReportDB).filter(ReportDB.timestamp <= effective_time)
    
    if location_id:
        query = query.filter(ReportDB.resolved_location_id == location_id.lower())
    if source_type:
        query = query.filter(ReportDB.source_type == source_type.lower())
        
    db_reports = query.order_by(ReportDB.timestamp.desc()).limit(limit).all()
    
    results: list[ReportResponse] = []
    for r in db_reports:
        rep_item = ReportItem(
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
        )
        score_breakdown = compute_report_score(report=rep_item, cluster_size=1, simulated_now=effective_time)
        results.append(
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
                score_breakdown=ScoreBreakdownSchema(**score_breakdown),
                cluster_id=None,
            )
        )
        
    return results


@router.post(
    "/official",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Structured Official First-Responder Intake (Police, APF, Hospitals)"
)
def create_official_report(
    payload: OfficialReportCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Structured official report intake for Police, APF, and District Hospitals.
    Bypasses noisy unstructured NLP heuristics and immediately assigns 1.0 trust.
    """
    loc_id = sanitize_input_text(payload.location_id).lower()
    agency = sanitize_input_text(payload.reporting_agency)
    officer_name = sanitize_input_text(payload.officer_name)
    badge_number = sanitize_input_text(payload.badge_number)
    damage_type = sanitize_input_text(payload.damage_type)
    casualties = payload.casualty_count
    immediate_need = sanitize_input_text(payload.immediate_need)
    default_notes = f"Official dispatch from {agency} ({officer_name} / {badge_number})"
    raw_notes = sanitize_input_text(payload.raw_notes) if payload.raw_notes else default_notes
    lat = payload.reported_lat
    lon = payload.reported_lon

    formatted_text = f"[OFFICIAL DISPATCH - {agency.upper()}] Officer: {officer_name} (Badge: {badge_number}). Damage: {damage_type}. Casualties: {casualties}. Priority Need: {immediate_need}. Notes: {raw_notes}"

    sim_now = get_simulated_time(db)
    embedding_vec = embed_text(formatted_text)
    embedding_json = serialize_embedding(embedding_vec)

    source_type = "hospital" if "hospital" in agency.lower() else "police"

    db_report = ReportDB(
        source_type=source_type,
        raw_text=formatted_text,
        reported_lat=lat,
        reported_lon=lon,
        timestamp=sim_now,
        resolved_location_id=loc_id,
        location_resolved_by="official_structured_form",
        extracted_casualties=casualties,
        extracted_damage_type=damage_type,
        confidence_hint=1.0,
        embedding_json=embedding_json,
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    rep_item = ReportItem(
        id=db_report.id,
        source_type=source_type,
        raw_text=formatted_text,
        reported_lat=lat,
        reported_lon=lon,
        timestamp=sim_now,
        resolved_location_id=loc_id,
        location_resolved_by="official_structured_form",
        extracted_casualties=casualties,
        extracted_damage_type=damage_type,
        confidence_hint=1.0,
    )
    score_breakdown = compute_report_score(report=rep_item, cluster_size=1, simulated_now=sim_now)

    return ReportResponse(
        id=db_report.id,
        source_type=source_type,
        raw_text=formatted_text,
        reported_lat=lat,
        reported_lon=lon,
        timestamp=sim_now,
        resolved_location_id=loc_id,
        resolved_location_name=loc_id.capitalize(),
        location_resolved_by="official_structured_form",
        extracted_casualties=casualties,
        extracted_damage_type=damage_type,
        score_breakdown=ScoreBreakdownSchema(**score_breakdown),
        cluster_id=None,
    )

