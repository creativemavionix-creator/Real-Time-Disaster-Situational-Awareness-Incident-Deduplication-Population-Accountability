"""
Active Verification & Next Best Observation Engine for PRATYAKSH-Ω.
Evaluates candidate verification actions using Shannon Entropy Information Gain,
Operational Risk, Resource Cost, and Feasibility to rank the Best Next Observation.
"""

from datetime import datetime, timezone
from typing import Optional
from app.models.schemas import (
    VerificationActionItem,
    RankedObservationsResponse,
)
from app.pipeline.gazetteer import LOCATIONS, get_location
from app.pipeline.hypothesis_engine import evaluate_sector_hypotheses


VERIFICATION_ACTION_TEMPLATES: list[dict] = [
    {
        "action_type": "mobile_comms_cow",
        "title_template": "Deploy NTA Satellite Cell-on-Wheels (COW) Mobile Tower",
        "target_hypotheses": ["H1", "H4"],
        "info_gain": 0.94,
        "risk_score": 0.20,
        "cost_usd": 350.0,
        "eta_minutes": 45,
        "justification": "Restores immediate local cellular coverage to test whether silence is pure telecommunication blackout (H1).",
    },
    {
        "action_type": "drone_uav_recon",
        "title_template": "Task Long-Range VTOL Drone UAV Reconnaissance",
        "target_hypotheses": ["H2", "H3", "H5"],
        "info_gain": 0.88,
        "risk_score": 0.25,
        "cost_usd": 180.0,
        "eta_minutes": 25,
        "justification": "Rapid aerial inspection distinguishing between physical road severance (H2), evacuation (H3), or catastrophic collapse (H5).",
    },
    {
        "action_type": "satellite_sar_tasking",
        "title_template": "Request Copernicus Sentinel-1 SAR & Pleiades Rapid Tile",
        "target_hypotheses": ["H2", "H5"],
        "info_gain": 0.92,
        "risk_score": 0.05,
        "cost_usd": 450.0,
        "eta_minutes": 60,
        "justification": "Wide-area interferometric coherence analysis mapping bridge severance and slope failures without ground risk.",
    },
    {
        "action_type": "field_patrol_recon",
        "title_template": "Deploy APF / Tactical First-Responder Scout Patrol",
        "target_hypotheses": ["H3", "H5"],
        "info_gain": 0.75,
        "risk_score": 0.70,
        "cost_usd": 300.0,
        "eta_minutes": 90,
        "justification": "Physical on-the-ground validation of trapped victims and triage demand along accessible arterial corridors.",
    },
    {
        "action_type": "lora_iot_probe",
        "title_template": "Activate Emergency LoRa Mesh & Acoustic Sensor Probe",
        "target_hypotheses": ["H1", "H4"],
        "info_gain": 0.65,
        "risk_score": 0.10,
        "cost_usd": 50.0,
        "eta_minutes": 5,
        "justification": "Instant telemetry handshake to determine whether mountain bridge/culvert structure is standing or if IoT gateway failed (H4).",
    },
    {
        "action_type": "local_palika_query",
        "title_template": "Query Local Palika Ward Disaster Committee via Satellite VHF",
        "target_hypotheses": ["H3", "H4"],
        "info_gain": 0.58,
        "risk_score": 0.05,
        "cost_usd": 20.0,
        "eta_minutes": 10,
        "justification": "Direct administrative check-in to confirm if civilian evacuation to local open grounds took place (H3).",
    },
]


def evaluate_sector_verification_actions(
    sector_id: str,
    simulated_now: Optional[datetime] = None,
) -> list[VerificationActionItem]:
    """
    Evaluates candidate verification actions for a specific sector and computes multi-criteria ranking scores.
    """
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)

    loc = get_location(sector_id)
    sector_name = loc.name if loc else sector_id.title()
    hyp_resp = evaluate_sector_hypotheses(sector_id, simulated_now)
    entropy = hyp_resp.uncertainty_entropy

    actions: list[VerificationActionItem] = []

    for i, t in enumerate(VERIFICATION_ACTION_TEMPLATES):
        # Information Gain scales with current uncertainty entropy
        raw_gain = t["info_gain"] * (entropy / 2.32)
        info_gain = round(raw_gain, 3)

        risk = t["risk_score"]
        cost = t["cost_usd"]
        eta = t["eta_minutes"]

        # Multi-attribute ranking score: Information Gain (50%), Safety/Low Risk (25%), Cost (15%), Speed (10%)
        norm_cost = min(1.0, cost / 600.0)
        norm_eta = min(1.0, eta / 120.0)
        ranking = (0.50 * (info_gain / 1.0)) + (0.25 * (1.0 - risk)) + (0.15 * (1.0 - norm_cost)) + (0.10 * (1.0 - norm_eta))
        ranking_score = round(ranking * 100.0, 1)

        rec_id = f"REC-{sector_id.upper()[:3]}-{t['action_type'][:4].upper()}-{simulated_now.strftime('%H%M')}"

        actions.append(
            VerificationActionItem(
                recommendation_id=rec_id,
                sector_id=sector_id.lower(),
                sector_name=sector_name,
                action_type=t["action_type"],
                action_title=f"{t['title_template']} ({sector_name})",
                target_hypotheses=t["target_hypotheses"],
                expected_information_gain=info_gain,
                operational_risk_score=risk,
                resource_cost_usd=cost,
                eta_minutes=eta,
                ranking_score=ranking_score,
                justification=t["justification"],
                status="PENDING_REVIEW",
                created_at=simulated_now,
            )
        )

    # Sort descending by ranking score
    actions.sort(key=lambda a: a.ranking_score, reverse=True)
    return actions


def get_ranked_next_best_observations(
    simulated_now: Optional[datetime] = None,
) -> RankedObservationsResponse:
    """
    Ranks candidate verification actions across all sectors to recommend the single Next Best Observation.
    """
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)

    all_actions: list[VerificationActionItem] = []
    for sector_id in LOCATIONS.keys():
        all_actions.extend(evaluate_sector_verification_actions(sector_id, simulated_now))

    all_actions.sort(key=lambda a: a.ranking_score, reverse=True)
    best_action = all_actions[0] if all_actions else None

    return RankedObservationsResponse(
        simulated_time=simulated_now,
        total_actions_evaluated=len(all_actions),
        best_next_observation=best_action,
        candidate_actions=all_actions[:12],  # Top 12 candidate actions
    )
