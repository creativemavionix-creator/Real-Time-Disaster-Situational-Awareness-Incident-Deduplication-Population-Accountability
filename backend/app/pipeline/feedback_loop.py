"""
Closed-Loop Dynamic Reality Feedback Engine for PRATYAKSH-Ω.
Connects Action Execution -> New Observation Ingestion -> Bayesian Updating -> Reality State Convergence.
"""

from datetime import datetime, timezone
from typing import Optional
from app.models.schemas import (
    ExecutionResultPayload,
    FeedbackLoopResultResponse,
    MultiModalEvidenceIngest,
)
from app.pipeline.evidence_model import ingest_evidence_item
from app.pipeline.negative_evidence import update_sector_signal_timestamp
from app.pipeline.hypothesis_engine import evaluate_sector_hypotheses
from app.pipeline.governance import get_recommendation_status, _AUDIT_LOGS


def execute_action_and_feed_reality(
    payload: ExecutionResultPayload,
    simulated_now: Optional[datetime] = None,
) -> FeedbackLoopResultResponse:
    """
    Executes an approved verification action, feeds the newly captured multi-modal observation back
    into the evidence corpus, and recalculates hypothesis posteriors and Shannon entropy.
    """
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)

    # Extract sector ID from recommendation ID prefix
    sector_id = "gorkha"
    parts = payload.recommendation_id.split("-")
    if len(parts) >= 2:
        prefix = parts[1].lower()
        sector_mapping = {
            "gkh": "gorkha", "rsw": "rasuwa", "sdp": "sindhupalchok",
            "ktm": "kathmandu", "bkt": "bhaktapur", "nwk": "nuwakot",
            "dlk": "dolakha", "sdl": "sindhuli",
        }
        sector_id = sector_mapping.get(prefix, "gorkha")

    # Evaluate previous hypothesis state
    prev_hyp = evaluate_sector_hypotheses(sector_id, simulated_now)
    prev_dominant = prev_hyp.dominant_hypothesis
    prev_entropy = prev_hyp.uncertainty_entropy

    # Determine observation type based on findings
    obs_type = "structural_collapse" if payload.damage_confirmed else "signal_loss"
    if "bridge" in payload.observed_finding.lower():
        obs_type = "bridge_severance"
    elif "drone" in payload.recommendation_id.lower():
        obs_type = "structural_collapse" if payload.damage_confirmed else "road_clear"

    # 1. Ingest new observation into Multi-Modal Evidence Corpus
    new_ev = ingest_evidence_item(
        MultiModalEvidenceIngest(
            sector_id=sector_id,
            source_type="active_verification_recon",
            source_id=f"RECON_{payload.recommendation_id}",
            observation_type=obs_type,
            observed_value=1.0 if payload.damage_confirmed else 0.0,
            expected_value=0.0,
            raw_payload=payload.observed_finding,
            direction=payload.evidence_direction,
            reliability=payload.reliability,
            timestamp=simulated_now,
        )
    )

    # 2. Reset / update sector signal timestamp to reflect active verification contact
    update_sector_signal_timestamp(sector_id, simulated_now)

    # 3. Recalculate Bayesian hypothesis posteriors with new evidence
    updated_hyp = evaluate_sector_hypotheses(sector_id, simulated_now)
    updated_dominant = updated_hyp.dominant_hypothesis
    updated_entropy = updated_hyp.uncertainty_entropy
    entropy_reduction = round(max(0.0, prev_entropy - updated_entropy), 3)

    # 4. Link resulting evidence to audit trail if exists
    for audit in _AUDIT_LOGS:
        if audit.recommendation_id == payload.recommendation_id:
            audit.resulting_evidence_id = new_ev.evidence_id
            break

    return FeedbackLoopResultResponse(
        success=True,
        recommendation_id=payload.recommendation_id,
        generated_evidence_id=new_ev.evidence_id,
        sector_id=sector_id,
        previous_dominant_hypothesis=prev_dominant,
        updated_dominant_hypothesis=updated_dominant,
        entropy_reduction=entropy_reduction,
        updated_hypotheses=updated_hyp.hypotheses,
        message=(
            f"Observation '{new_ev.evidence_id}' successfully ingested. "
            f"Bayesian hypothesis posteriors converged with {entropy_reduction} bits entropy reduction."
        ),
    )
