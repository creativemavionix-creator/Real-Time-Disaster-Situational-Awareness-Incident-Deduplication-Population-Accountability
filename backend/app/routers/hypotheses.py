"""
Competing Hypotheses & Counterfactuals Router for PRATYAKSH-Ω.
"""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    SectorHypothesesResponse,
    AllHypothesesOverviewResponse,
    SectorCounterfactualResponse,
)
from app.pipeline.hypothesis_engine import (
    evaluate_sector_hypotheses,
    get_all_sectors_hypotheses,
)
from app.pipeline.counterfactual import test_sector_counterfactuals
from app.pipeline.gazetteer import LOCATIONS

router = APIRouter(prefix="/hypotheses", tags=["Competing Hypotheses & Counterfactuals"])


@router.get("/all", response_model=AllHypothesesOverviewResponse)
def get_all_hypotheses_overview():
    """National overview of competing hypotheses (H1..H5) and uncertainty entropy across all sectors."""
    now = datetime.now(timezone.utc)
    return get_all_sectors_hypotheses(now)


@router.get("/sector/{sector_id}", response_model=SectorHypothesesResponse)
def get_sector_hypotheses(sector_id: str):
    """
    Evaluates Bayesian posterior probability distribution over H1..H5 for a sector,
    with step-by-step mathematical evidence update traces.
    """
    sec = sector_id.lower()
    if sec not in LOCATIONS:
        raise HTTPException(status_code=404, detail=f"Sector '{sector_id}' not found in gazetteer.")

    now = datetime.now(timezone.utc)
    return evaluate_sector_hypotheses(sec, now)


@router.get("/counterfactuals/{sector_id}", response_model=SectorCounterfactualResponse)
def get_sector_counterfactuals(sector_id: str):
    """
    Evaluates counterfactual predictions ("If H_i, what else should we observe?")
    and validates them against the multi-modal evidence store.
    """
    sec = sector_id.lower()
    if sec not in LOCATIONS:
        raise HTTPException(status_code=404, detail=f"Sector '{sector_id}' not found in gazetteer.")

    now = datetime.now(timezone.utc)
    return test_sector_counterfactuals(sec, now)
