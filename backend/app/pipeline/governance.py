"""
Human Approval Workflow & 5-Tier Role Governance for PRATYAKSH-Ω.
Enforces the mandatory requirement: Life-safety decisions require human review.
Roles: Viewer, Analyst, Officer, Administrator, Auditor.
Maintains an immutable audit trail of all recommendation reviews.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional
from app.models.schemas import (
    ActionReviewRequest,
    ActionReviewResponse,
    ActionAuditItem,
    AuditTrailResponse,
)

# In-memory audit trail log
_AUDIT_LOGS: list[ActionAuditItem] = []

# Action review status cache
_ACTION_STATUS_REGISTRY: dict[str, str] = {}


ROLE_PERMISSIONS = {
    "Viewer": {"can_view": True, "can_approve": False, "can_modify": False, "can_audit": False},
    "Analyst": {"can_view": True, "can_approve": False, "can_modify": False, "can_audit": False},
    "Officer": {"can_view": True, "can_approve": True, "can_modify": True, "can_audit": True},
    "Administrator": {"can_view": True, "can_approve": True, "can_modify": True, "can_audit": True},
    "Auditor": {"can_view": True, "can_approve": False, "can_modify": False, "can_audit": True},
}


def process_human_action_review(request: ActionReviewRequest) -> ActionReviewResponse:
    """
    Validates reviewer role permissions and records human approval / modification / rejection.
    """
    role = request.reviewer_role
    perms = ROLE_PERMISSIONS.get(role, ROLE_PERMISSIONS["Viewer"])

    if request.decision in ("APPROVED", "MODIFIED") and not perms["can_approve"]:
        return ActionReviewResponse(
            audit_id="",
            recommendation_id=request.recommendation_id,
            decision="DENIED",
            reviewer_role=role,
            status="FORBIDDEN",
            message=f"Role '{role}' is unauthorized to approve or modify operational recommendations. Requires 'Officer' or 'Administrator'.",
            timestamp=datetime.now(timezone.utc),
        )

    audit_id = f"AUD-{uuid.uuid4().hex[:8].upper()}"
    ts = datetime.now(timezone.utc)
    
    # Extract sector ID from recommendation ID prefix
    sector_id = "gorkha"
    parts = request.recommendation_id.split("-")
    if len(parts) >= 2:
        prefix = parts[1].lower()
        sector_mapping = {
            "gkh": "gorkha", "rsw": "rasuwa", "sdp": "sindhupalchok",
            "ktm": "kathmandu", "bkt": "bhaktapur", "nwk": "nuwakot",
            "dlk": "dolakha", "sdl": "sindhuli",
        }
        sector_id = sector_mapping.get(prefix, "gorkha")

    audit_item = ActionAuditItem(
        audit_id=audit_id,
        recommendation_id=request.recommendation_id,
        sector_id=sector_id,
        action_type="active_verification",
        decision=request.decision,
        reviewer_role=role,
        reviewer_name=request.reviewer_name,
        justification=request.justification,
        resulting_evidence_id=None,
        timestamp=ts,
    )

    _AUDIT_LOGS.insert(0, audit_item)
    _ACTION_STATUS_REGISTRY[request.recommendation_id] = request.decision

    return ActionReviewResponse(
        audit_id=audit_id,
        recommendation_id=request.recommendation_id,
        decision=request.decision,
        reviewer_role=role,
        status="RECORDED",
        message=f"Action recommendation '{request.recommendation_id}' successfully {request.decision.lower()} by {request.reviewer_name} ({role}).",
        timestamp=ts,
    )


def get_all_audit_records() -> AuditTrailResponse:
    """Retrieves full immutable audit trail."""
    return AuditTrailResponse(
        total_audits=len(_AUDIT_LOGS),
        records=_AUDIT_LOGS,
    )


def get_recommendation_status(recommendation_id: str) -> str:
    """Checks human review state of a recommendation."""
    return _ACTION_STATUS_REGISTRY.get(recommendation_id, "PENDING_REVIEW")
