"""API router for 24-Hour Timeline & Automated SITREP Generator."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import ReportDB
from app.models.schemas import SitrepReportResponse
from app.pipeline.clustering import ReportItem
from app.pipeline.embedder import deserialize_embedding
from app.pipeline.sitrep_generator import generate_live_sitrep
from app.simulation.clock import get_simulated_time

router = APIRouter(prefix="/sitrep", tags=["24-Hour Timeline & SITREP Generator"])


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


@router.get("/current", response_model=SitrepReportResponse, summary="Generate live official Situation Report (SITREP)")
def get_current_sitrep(
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """
    Compile a formal military/UN OCHA-standard Situation Report (SITREP) synthesizing
    casualty totals, critical blackout zones, resource deficits, and operational directives.
    """
    effective_time = sim_time or get_simulated_time(db)
    db_reports = db.query(ReportDB).filter(ReportDB.timestamp <= effective_time).all()
    report_items = [_db_to_report_item(r) for r in db_reports]

    return generate_live_sitrep(db=db, reports=report_items, simulated_now=effective_time)
