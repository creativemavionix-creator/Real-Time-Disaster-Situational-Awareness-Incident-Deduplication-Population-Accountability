"""
Active Verification, Human Governance & Dynamic Reality Router for PRATYAKSH-Ω.
"""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    RankedObservationsResponse,
    VerificationActionItem,
    ActionReviewRequest,
    ActionReviewResponse,
    AuditTrailResponse,
    ExecutionResultPayload,
    FeedbackLoopResultResponse,
)
from app.pipeline.active_verification import (
    get_ranked_next_best_observations,
    evaluate_sector_verification_actions,
)
from app.pipeline.governance import (
    process_human_action_review,
    get_all_audit_records,
)
from app.pipeline.feedback_loop import execute_action_and_feed_reality
from app.pipeline.gazetteer import LOCATIONS

router = APIRouter(prefix="/verification", tags=["Active Verification & Governance"])


@router.get("/next-best-observations", response_model=RankedObservationsResponse)
def get_next_best_observations():
    """
    Ranks candidate verification actions across all sectors using Shannon Entropy Information Gain,
    Operational Risk, and Cost to identify the single Best Next Observation.
    """
    now = datetime.now(timezone.utc)
    return get_ranked_next_best_observations(now)


@router.get("/sector/{sector_id}", response_model=list[VerificationActionItem])
def get_sector_verification_actions(sector_id: str):
    """Retrieves ranked candidate verification actions for a specific sector."""
    sec = sector_id.lower()
    if sec not in LOCATIONS:
        raise HTTPException(status_code=404, detail=f"Sector '{sector_id}' not found in gazetteer.")

    now = datetime.now(timezone.utc)
    return evaluate_sector_verification_actions(sec, now)


@router.post("/review", response_model=ActionReviewResponse)
def review_verification_action(request: ActionReviewRequest):
    """
    Human Approval & Governance Endpoint.
    Enforces role-based permissions (Officer/Administrator required to approve/modify).
    Records decision to immutable audit trail.
    """
    return process_human_action_review(request)


@router.post("/execute-and-feed", response_model=FeedbackLoopResultResponse)
def execute_and_feed_reality(payload: ExecutionResultPayload):
    """
    Closed-Loop Dynamic Reality Trigger.
    Executes an approved verification action, feeds the resulting observation back into the evidence corpus,
    and updates Bayesian hypothesis posteriors and reality state in real time.
    """
    now = datetime.now(timezone.utc)
    return execute_action_and_feed_reality(payload, now)


@router.get("/audit-trail", response_model=AuditTrailResponse)
def get_governance_audit_trail():
    """Retrieves full immutable audit trail of all recommendation reviews and decisions."""
    return get_all_audit_records()
