"""API router for Silent Blackout Risk Intelligence."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import ReportDB
from app.models.schemas import AllBlackoutRisksResponse
from app.pipeline.clustering import ReportItem
from app.pipeline.embedder import deserialize_embedding
from app.pipeline.blackout_risk import assess_all_blackout_risks
from app.simulation.clock import get_simulated_time

router = APIRouter(prefix="/blackout-intel", tags=["Blackout Risk Intelligence"])


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


@router.get("/risk-assessment", response_model=AllBlackoutRisksResponse, summary="Get spatial physics inferred risk assessment for all sectors")
def get_blackout_risk_assessment(
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """
    Compute spatial physics inferred risk scores for all mountain sectors, ensuring
    communication blackout zones are not mistakenly assumed to be safe.
    """
    effective_time = sim_time or get_simulated_time(db)
    db_reports = db.query(ReportDB).filter(ReportDB.timestamp <= effective_time).all()
    report_items = [_db_to_report_item(r) for r in db_reports]

    assessments = assess_all_blackout_risks(reports=report_items, simulated_now=effective_time)

    blackout_count = sum(1 for a in assessments if a.is_in_blackout)
    high_risk_blackout_count = sum(
        1 for a in assessments if a.is_in_blackout and a.threat_tier in ("CRITICAL_INFERRED", "HIGH_INFERRED")
    )

    return AllBlackoutRisksResponse(
        simulated_time=effective_time,
        blackout_sectors_count=blackout_count,
        high_risk_blackout_count=high_risk_blackout_count,
        assessments=assessments,
    )
