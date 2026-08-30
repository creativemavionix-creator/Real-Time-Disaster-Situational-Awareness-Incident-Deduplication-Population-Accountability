"""
Negative Evidence & Silence Windows Router for PRATYAKSH-Ω.
"""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    NegativeEvidenceAnomalyItem,
    SilenceWindowItem,
    NegativeEvidenceOverviewResponse,
)
from app.pipeline.negative_evidence import (
    detect_negative_evidence_anomalies,
    get_all_silence_windows,
    get_negative_evidence_overview,
)
from app.pipeline.gazetteer import LOCATIONS

router = APIRouter(prefix="/negative-evidence", tags=["Negative Evidence & Silence Intelligence"])


@router.get("/overview", response_model=NegativeEvidenceOverviewResponse)
def get_negative_evidence_overview_endpoint():
    """Consolidated negative evidence intelligence briefing across all sectors."""
    now = datetime.now(timezone.utc)
    return get_negative_evidence_overview(now)


@router.get("/anomalies", response_model=list[NegativeEvidenceAnomalyItem])
def get_negative_evidence_anomalies_endpoint():
    """Retrieves all active unexpected signal gap anomalies."""
    now = datetime.now(timezone.utc)
    return detect_negative_evidence_anomalies(now)


@router.get("/silence-windows", response_model=list[SilenceWindowItem])
def get_silence_windows_endpoint():
    """Retrieves monitored sector silence window durations and expected lost events."""
    now = datetime.now(timezone.utc)
    return get_all_silence_windows(now)


@router.get("/sector/{sector_id}", response_model=SilenceWindowItem)
def get_sector_silence_window(sector_id: str):
    """Retrieves silence window metrics for a specific sector."""
    sec = sector_id.lower()
    if sec not in LOCATIONS:
        raise HTTPException(status_code=404, detail=f"Sector '{sector_id}' not found in gazetteer.")

    now = datetime.now(timezone.utc)
    windows = get_all_silence_windows(now)
    for w in windows:
        if w.sector_id == sec:
            return w

    raise HTTPException(status_code=404, detail="Sector silence window record not found.")
