"""
Competing Hypotheses & Bayesian Belief Updating Engine for PRATYAKSH-Ω.
Generates and maintains competing explanations for unexpected reality gaps:
  H1 — Area is safe / normal variation
  H2 — Communication / power grid failure
  H3 — Critical infrastructure / access isolation
  H4 — Population evacuated / displaced
  H5 — Severe physical disaster & structural collapse
Provides explainable Bayesian probability update traces and Shannon Entropy calculations.
"""

import math
from datetime import datetime, timezone
from typing import Optional
from app.models.schemas import (
    CompetingHypothesisItem,
    HypothesisTraceItem,
    SectorHypothesesResponse,
    AllHypothesesOverviewResponse,
)
from app.pipeline.gazetteer import LOCATIONS, get_location
from app.pipeline.evidence_model import get_sector_evidence
from app.pipeline.blackout_risk import compute_spatial_physics


CANONICAL_HYPOTHESIS_METADATA = {
    "H1": {
        "title": "Area Safe / Normal Variation",
        "description": "Sector experienced minimal shaking or damage. Low reporting reflects standard baseline variation.",
    },
    "H2": {
        "title": "Telecommunications & Power Grid Failure",
        "description": "Cellular BTS towers, power transmission, or fiber backhauls are severed, causing reporting blackout.",
    },
    "H3": {
        "title": "Critical Infrastructure & Access Isolation",
        "description": "Key bridges, highways, or mountain passes are severed, physically trapping or isolating the community.",
    },
    "H4": {
        "title": "Population Pre-Emptively Evacuated",
        "description": "Residents self-evacuated to open fields, temporary shelters, or lower elevations before distress calls.",
    },
    "H5": {
        "title": "Severe Physical Disaster & High Casualty Toll",
        "description": "Widespread structural collapse, trapped individuals, and severe damage requiring immediate heavy USAR.",
    },
}


def compute_priors_for_sector(sector_id: str) -> dict[str, float]:
    """
    Computes prior probabilities for H1..H5 based on seismic physics, structural fragility, and distance to Barpak epicenter.
    """
    loc = get_location(sector_id)
    if not loc:
        return {"H1": 0.20, "H2": 0.20, "H3": 0.20, "H4": 0.20, "H5": 0.20}

    physics = compute_spatial_physics(loc)
    epi_hazard = physics.epicenter_distance_hazard
    fragility = physics.structural_fragility_index
    landslide = physics.landslide_susceptibility_index

    # Weight initial priors from physical vulnerability
    w_h5 = 0.05 + (0.45 * epi_hazard) + (0.30 * fragility)
    w_h2 = 0.10 + (0.35 * epi_hazard) + (0.20 * landslide)
    w_h3 = 0.05 + (0.30 * landslide) + (0.30 * (1.0 if physics.critical_bridge_severed else 0.0))
    w_h4 = 0.10 + (0.15 * epi_hazard)
    w_h1 = max(0.02, 1.0 - (w_h5 + w_h2 + w_h3 + w_h4))

    total = w_h1 + w_h2 + w_h3 + w_h4 + w_h5
    return {
        "H1": round(w_h1 / total, 3),
        "H2": round(w_h2 / total, 3),
        "H3": round(w_h3 / total, 3),
        "H4": round(w_h4 / total, 3),
        "H5": round(w_h5 / total, 3),
    }


def compute_shannon_entropy(probabilities: list[float]) -> float:
    """Calculates Shannon Uncertainty Entropy H(P) = -sum(p * log2(p)). Max ~2.32 for 5 uniform states."""
    entropy = 0.0
    for p in probabilities:
        if p > 0.0001:
            entropy -= p * math.log2(p)
    return round(entropy, 3)


def evaluate_sector_hypotheses(
    sector_id: str,
    simulated_now: Optional[datetime] = None,
) -> SectorHypothesesResponse:
    """
    Performs Bayesian belief updating over competing hypotheses H1..H5 for a sector.
    Returns posterior distributions, confidence, and explainable mathematical update traces.
    """
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)

    loc = get_location(sector_id)
    sector_name = loc.name if loc else sector_id.title()

    priors = compute_priors_for_sector(sector_id)
    evidence_list = get_sector_evidence(sector_id, simulated_now)

    # Initialize log-likelihood accumulators and explanation traces
    log_likelihoods = {k: math.log(max(0.01, v)) for k, v in priors.items()}
    traces: dict[str, list[HypothesisTraceItem]] = {k: [] for k in priors.keys()}
    supporting: dict[str, list[str]] = {k: [] for k in priors.keys()}
    contradicting: dict[str, list[str]] = {k: [] for k in priors.keys()}

    seen_sources: dict[str, int] = {}

    for ev in evidence_list:
        # Correlation penalty: multiple reports of the same observation type receive diminishing weight
        obs_key = f"{ev.source_type}:{ev.observation_type}"
        repeat_count = seen_sources.get(obs_key, 0)
        seen_sources[obs_key] = repeat_count + 1
        correlation_penalty = 1.0 / (1.0 + (0.35 * repeat_count))

        rel = ev.reliability * ev.freshness_weight * correlation_penalty
        obs = ev.observation_type
        summary = ev.raw_payload or f"{ev.source_type}: {obs}"

        # Likelihood updates based on multi-modal evidence patterns
        if obs in ("signal_loss", "tower_down", "power_loss"):
            # Strong evidence for H2 (Comms failure) & moderate for H5 (Disaster)
            log_likelihoods["H2"] += 1.8 * rel
            log_likelihoods["H5"] += 0.8 * rel
            log_likelihoods["H1"] -= 2.2 * rel
            traces["H2"].append(HypothesisTraceItem(
                evidence_id=ev.evidence_id,
                evidence_summary=summary,
                delta_contribution=round(1.8 * rel, 3),
                direction="SUPPORTS",
                source_reliability=round(rel, 2),
            ))
            traces["H1"].append(HypothesisTraceItem(
                evidence_id=ev.evidence_id,
                evidence_summary=summary,
                delta_contribution=round(-2.2 * rel, 3),
                direction="CONTRADICTS",
                source_reliability=round(rel, 2),
            ))
            supporting["H2"].append(ev.evidence_id)
            contradicting["H1"].append(ev.evidence_id)

        elif obs in ("structural_collapse", "casualty_count", "coherence_loss"):
            # Strong evidence for H5 (Severe Disaster)
            log_likelihoods["H5"] += 2.4 * rel
            log_likelihoods["H1"] -= 3.0 * rel
            traces["H5"].append(HypothesisTraceItem(
                evidence_id=ev.evidence_id,
                evidence_summary=summary,
                delta_contribution=round(2.4 * rel, 3),
                direction="SUPPORTS",
                source_reliability=round(rel, 2),
            ))
            supporting["H5"].append(ev.evidence_id)
            contradicting["H1"].append(ev.evidence_id)

        elif obs in ("bridge_severance", "road_blockage", "landslide"):
            # Strong evidence for H3 (Infrastructure isolation)
            log_likelihoods["H3"] += 2.2 * rel
            log_likelihoods["H5"] += 1.0 * rel
            traces["H3"].append(HypothesisTraceItem(
                evidence_id=ev.evidence_id,
                evidence_summary=summary,
                delta_contribution=round(2.2 * rel, 3),
                direction="SUPPORTS",
                source_reliability=round(rel, 2),
            ))
            supporting["H3"].append(ev.evidence_id)

        elif obs in ("normal_pings", "road_clear", "all_clear"):
            # Supports H1 (Safe)
            log_likelihoods["H1"] += 2.5 * rel
            log_likelihoods["H5"] -= 2.5 * rel
            traces["H1"].append(HypothesisTraceItem(
                evidence_id=ev.evidence_id,
                evidence_summary=summary,
                delta_contribution=round(2.5 * rel, 3),
                direction="SUPPORTS",
                source_reliability=round(rel, 2),
            ))
            supporting["H1"].append(ev.evidence_id)
            contradicting["H5"].append(ev.evidence_id)

    # Softmax normalization to convert log-likelihoods to valid posterior probabilities
    max_log = max(log_likelihoods.values())
    exp_scores = {k: math.exp(v - max_log) for k, v in log_likelihoods.items()}
    sum_exp = max(1e-6, sum(exp_scores.values()))
    raw_posteriors = {k: v / sum_exp for k, v in exp_scores.items()}
    posteriors = {k: round(v, 3) for k, v in raw_posteriors.items()}
    # Fix residual rounding delta on dominant hypothesis
    diff = round(1.0 - sum(posteriors.values()), 3)
    if diff != 0.0:
        max_k = max(posteriors, key=posteriors.get)
        posteriors[max_k] = round(posteriors[max_k] + diff, 3)


    # Assemble hypothesis items
    hypotheses: list[CompetingHypothesisItem] = []
    for code in ["H1", "H2", "H3", "H4", "H5"]:
        post = posteriors[code]
        prior = priors[code]

        if post >= 0.50:
            status = "leading"
        elif post >= 0.20:
            status = "plausible"
        elif post <= 0.05:
            status = "refuted"
        else:
            status = "unlikely"

        meta = CANONICAL_HYPOTHESIS_METADATA[code]
        hypotheses.append(
            CompetingHypothesisItem(
                hypothesis_code=code,
                sector_id=sector_id.lower(),
                title=meta["title"],
                description=meta["description"],
                prior_probability=prior,
                posterior_probability=post,
                confidence=round(min(1.0, post + 0.15), 2),
                status=status,
                supporting_evidence=supporting[code],
                contradicting_evidence=contradicting[code],
                explanation_traces=traces[code],
            )
        )

    # Sort so leading hypothesis is first
    hypotheses.sort(key=lambda h: h.posterior_probability, reverse=True)
    dominant = hypotheses[0]
    entropy = compute_shannon_entropy([h.posterior_probability for h in hypotheses])

    return SectorHypothesesResponse(
        sector_id=sector_id.lower(),
        sector_name=sector_name,
        simulated_time=simulated_now,
        dominant_hypothesis=f"{dominant.hypothesis_code}: {dominant.title} ({int(dominant.posterior_probability * 100)}%)",
        uncertainty_entropy=entropy,
        hypotheses=hypotheses,
    )


def get_all_sectors_hypotheses(
    simulated_now: Optional[datetime] = None,
) -> AllHypothesesOverviewResponse:
    """Evaluates competing hypotheses and Shannon entropy across all 8 sectors."""
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)

    sector_responses: list[SectorHypothesesResponse] = []
    dominant_dict: dict[str, str] = {}
    entropy_dict: dict[str, float] = {}

    for sector_id in LOCATIONS.keys():
        resp = evaluate_sector_hypotheses(sector_id, simulated_now)
        sector_responses.append(resp)
        dominant_dict[sector_id] = resp.dominant_hypothesis
        entropy_dict[sector_id] = resp.uncertainty_entropy

    return AllHypothesesOverviewResponse(
        simulated_time=simulated_now,
        national_dominant_hypotheses=dominant_dict,
        sector_entropy=entropy_dict,
        sectors=sector_responses,
    )
