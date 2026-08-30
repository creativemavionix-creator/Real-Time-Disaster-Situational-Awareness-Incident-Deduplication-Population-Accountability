"""
Counterfactual Reasoning & Testing Engine for PRATYAKSH-Ω.
Asks: "If this hypothesis were true, what else should we observe?"
Matches predicted observations against multi-modal evidence and classifies:
  - CONFIRMED
  - CONTRADICTED
  - UNTESTED
Calculates consistency scores for hypothesis validation.
"""

from datetime import datetime, timezone
from typing import Optional
from app.models.schemas import (
    CounterfactualPredictionItem,
    SectorCounterfactualResponse,
)
from app.pipeline.gazetteer import LOCATIONS, get_location
from app.pipeline.evidence_model import get_sector_evidence


PREDICTION_TEMPLATES: dict[str, list[dict]] = {
    "H1": [
        {"statement": "Cellular BTS towers should maintain regular signaling with standard traffic.", "obs_type": "normal_pings"},
        {"statement": "Key transport corridors and bridges should remain open with zero landslide blockages.", "obs_type": "road_clear"},
        {"statement": "Satellite SAR interferometry should show minimal or zero surface coherence loss.", "obs_type": "coherence_intact"},
    ],
    "H2": [
        {"statement": "Primary cellular BTS towers and power relays should report hardware alarms or total power loss.", "obs_type": "signal_loss"},
        {"statement": "Adjacent backup radio repeaters or fiber backhauls should show partial or severed throughput.", "obs_type": "tower_down"},
        {"statement": "Local civilian mobile devices should fail to establish handshake with national cellular cores.", "obs_type": "handshake_timeout"},
    ],
    "H3": [
        {"statement": "Primary access bridges over river gorges (e.g. Melamchi/Trishuli) should exhibit physical washouts.", "obs_type": "bridge_severance"},
        {"statement": "High-gradient mountain road cuts should be blocked by debris flows or rockfalls.", "obs_type": "road_blockage"},
        {"statement": "Vehicular GPS tracks and emergency supply convoys should show zero movement across key bottlenecks.", "obs_type": "convoy_halt"},
    ],
    "H4": [
        {"statement": "Open fields, school grounds, and sports stadiums should show high-density population clustering.", "obs_type": "open_ground_cluster"},
        {"statement": "Cellular handshakes should re-register at peripheral gateway towers outside high-hazard zones.", "obs_type": "peripheral_tower_registration"},
    ],
    "H5": [
        {"statement": "Unreinforced masonry and older reinforced concrete structures should show severe Grade 3-5 collapse.", "obs_type": "structural_collapse"},
        {"statement": "Local clinics and regional hospitals should report acute casualty influx and trauma demand.", "obs_type": "casualty_count"},
        {"statement": "Copernicus Sentinel-1 SAR and optical satellite sensors should detect widespread building coherence loss.", "obs_type": "coherence_loss"},
    ],
}


def evaluate_sector_counterfactuals(
    sector_id: str,
    simulated_now: Optional[datetime] = None,
) -> SectorCounterfactualResponse:
    """
    Evaluates counterfactual predictions against current multi-modal evidence store.
    """
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)

    loc = get_location(sector_id)
    sector_name = loc.name if loc else sector_id.title()
    evidence_list = get_sector_evidence(sector_id, simulated_now)

    # Index active observations in sector
    observed_types: dict[str, str] = {}
    for ev in evidence_list:
        observed_types[ev.observation_type] = ev.evidence_id

    predictions: list[CounterfactualPredictionItem] = []
    confirmed_count = 0
    total_predictions = 0

    for h_code, templates in PREDICTION_TEMPLATES.items():
        for i, t in enumerate(templates):
            total_predictions += 1
            pred_id = f"PRED-{sector_id.upper()[:3]}-{h_code}-{i+1}"
            obs_type = t["obs_type"]

            if obs_type in observed_types:
                status = "CONFIRMED"
                matched_id = observed_types[obs_type]
                confirmed_count += 1
            elif (
                (h_code == "H1" and "signal_loss" in observed_types) or
                (h_code == "H1" and "structural_collapse" in observed_types) or
                (h_code == "H2" and "normal_pings" in observed_types)
            ):
                status = "CONTRADICTED"
                matched_id = observed_types.get("signal_loss") or observed_types.get("structural_collapse") or observed_types.get("normal_pings")
            else:
                status = "UNTESTED"
                matched_id = None

            predictions.append(
                CounterfactualPredictionItem(
                    prediction_id=pred_id,
                    hypothesis_code=h_code,
                    sector_id=sector_id.lower(),
                    prediction_statement=t["statement"],
                    expected_observation_type=obs_type,
                    verification_status=status,
                    matched_evidence_id=matched_id,
                    consistency_weight=1.0,
                )
            )

    consistency = round((confirmed_count / max(1, total_predictions)) * 100.0, 1)

    return SectorCounterfactualResponse(
        sector_id=sector_id.lower(),
        sector_name=sector_name,
        consistency_score=consistency,
        predictions=predictions,
    )


# Alias
test_sector_counterfactuals = evaluate_sector_counterfactuals

