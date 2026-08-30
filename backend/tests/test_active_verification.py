"""Unit tests for Active Verification, Information Gain, Human Governance, and Dynamic Feedback."""

from datetime import datetime, timezone
from app.models.schemas import ActionReviewRequest, ExecutionResultPayload
from app.pipeline.active_verification import (
    evaluate_sector_verification_actions,
    get_ranked_next_best_observations,
)
from app.pipeline.governance import (
    process_human_action_review,
    get_all_audit_records,
)
from app.pipeline.feedback_loop import execute_action_and_feed_reality


def test_evaluate_verification_actions_ranking():
    """Verify candidate verification actions are ranked by multi-attribute score."""
    actions = evaluate_sector_verification_actions("gorkha")

    assert len(actions) > 0
    # Top action should have highest ranking score
    assert actions[0].ranking_score >= actions[-1].ranking_score
    assert actions[0].expected_information_gain > 0.0
    assert actions[0].status == "PENDING_REVIEW"


def test_get_ranked_next_best_observations():
    """Verify system selects single Best Next Observation across all sectors."""
    resp = get_ranked_next_best_observations()

    assert resp.total_actions_evaluated > 0
    assert resp.best_next_observation is not None
    assert resp.best_next_observation.action_type in (
        "drone_uav_recon", "satellite_sar_tasking", "field_patrol_recon", "lora_iot_probe", "local_palika_query"
    )


def test_human_governance_role_permissions():
    """Verify unauthorized roles (Viewer/Analyst) cannot approve, while Officer can."""
    req_viewer = ActionReviewRequest(
        recommendation_id="REC-GKH-DRON-1200",
        decision="APPROVED",
        reviewer_role="Viewer",
        reviewer_name="Field Observer",
        justification="Approved from field",
    )
    resp_viewer = process_human_action_review(req_viewer)
    assert resp_viewer.status == "FORBIDDEN"

    req_officer = ActionReviewRequest(
        recommendation_id="REC-GKH-DRON-1200",
        decision="APPROVED",
        reviewer_role="Officer",
        reviewer_name="Duty Commander",
        justification="High information gain justifies drone sortie.",
    )
    resp_officer = process_human_action_review(req_officer)
    assert resp_officer.status == "RECORDED"

    # Verify audit trail recorded
    audits = get_all_audit_records()
    assert audits.total_audits > 0
    assert audits.records[0].reviewer_name == "Duty Commander"


def test_closed_loop_feedback_reality_update():
    """Verify executing action feeds observation back and converges Bayesian entropy."""
    payload = ExecutionResultPayload(
        recommendation_id="REC-GKH-DRON-1200",
        observed_finding="VTOL Drone confirms multiple masonry collapses and road cut blocked in Barpak.",
        damage_confirmed=True,
        reliability=0.96,
    )
    res = execute_action_and_feed_reality(payload)

    assert res.success is True
    assert res.generated_evidence_id.startswith("EVD-")
    assert len(res.updated_hypotheses) == 5
    assert "successfully ingested" in res.message
