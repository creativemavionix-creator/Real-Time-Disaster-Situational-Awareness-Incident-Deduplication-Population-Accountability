"""
Competing Hypotheses & Bayesian Belief Updating Engine for PRATYAKSH-Ω.
Implements Requirement 5: Five Silent Zone Hypotheses and AI Reasoning.
Evaluates five competing explanations for observed communication silence:
  H1 — Communication Failure (mobile networks, towers, backhaul down)
  H2 — Infrastructure Failure (physical roads, bridges, transport routes severed)
  H3 — Population Movement (evacuated, migrated, or moved away)
  H4 — Data and Sensor Failure (sensors, gateways failed; physical area may be intact)
  H5 — Severe Local Impact (structural destruction, high exposure, heavy casualties)
Provides Bayesian posterior distributions, Shannon Entropy, and explainable update traces.
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
        "title": "Communication Failure",
        "description": "Failure of mobile communication networks, cellular base station towers, power backhauls, or related telecommunications infrastructure.",
        "recommended_verification": "Deploy Mobile Satellite Cell-on-Wheels (COW) or LoRa tactical gateway.",
    },
    "H2": {
        "title": "Infrastructure Failure",
        "description": "Failure of physical infrastructure such as arterial highways, bridges, transport corridors, and lifelines required for emergency access.",
        "recommended_verification": "Satellite SAR interferometry & high-resolution optical bridge passability assessment.",
    },
    "H3": {
        "title": "Population Movement",
        "description": "Population has evacuated, migrated, or moved away from the affected zone to open fields, elevated ridges, or temporary shelters.",
        "recommended_verification": "Thermal UAV reconnaissance over municipal open grounds and evacuation staging points.",
    },
    "H4": {
        "title": "Data and Sensor Failure",
        "description": "Failure of environmental sensors, IoT telemetry devices, communication gateways, or data collection infrastructure while physical region may remain operational.",
        "recommended_verification": "Direct satellite VHF radio ping to local Palika Ward Disaster Management Committee.",
    },
    "H5": {
        "title": "Severe Local Impact",
        "description": "Severe disaster impact involving widespread structural destruction, high population exposure, major infrastructure damage, and potentially large casualties.",
        "recommended_verification": "Urgent forward tactical scout team insertion and heavy USAR helicopter air reconnaissance.",
    },
}


def compute_priors_for_sector(sector_id: str) -> dict[str, float]:
    """
    Computes prior probabilities for H1..H5 based on physical hazard proximity,
    structural fragility, and terrain isolation indices.
    """
    loc = get_location(sector_id)
    if not loc:
        return {"H1": 0.20, "H2": 0.20, "H3": 0.20, "H4": 0.20, "H5": 0.20}

    physics = compute_spatial_physics(loc)
    epi_hazard = physics.epicenter_distance_hazard
    fragility = physics.structural_fragility_index
    landslide = physics.landslide_susceptibility_index

    # Weight initial priors from physical vulnerability:
    # High hazard -> high H5 (Severe Impact), H1 (Comms Fail), H2 (Infra Fail)
    w_h5 = 0.05 + (0.45 * epi_hazard) + (0.30 * fragility)
    w_h1 = 0.10 + (0.35 * epi_hazard) + (0.20 * landslide)
    w_h2 = 0.08 + (0.30 * landslide) + (0.35 * (1.0 if physics.critical_bridge_severed else 0.0))
    w_h3 = 0.08 + (0.15 * epi_hazard)
    w_h4 = max(0.04, 0.25 - (0.20 * epi_hazard))

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

        # Likelihood updates mapped directly to H1..H5:
        if obs in ("signal_loss", "tower_down", "power_loss", "comms_blackout"):
            # Strong evidence for H1 (Comms failure) & moderate for H5 (Severe impact)
            log_likelihoods["H1"] += 2.2 * rel
            log_likelihoods["H5"] += 1.0 * rel
            log_likelihoods["H4"] -= 1.5 * rel
            traces["H1"].append(HypothesisTraceItem(
                evidence_id=ev.evidence_id,
                evidence_summary=summary,
                delta_contribution=round(2.2 * rel, 3),
                direction="SUPPORTS",
                source_reliability=round(rel, 2),
            ))
            traces["H5"].append(HypothesisTraceItem(
                evidence_id=ev.evidence_id,
                evidence_summary=summary,
                delta_contribution=round(1.0 * rel, 3),
                direction="SUPPORTS",
                source_reliability=round(rel, 2),
            ))
            supporting["H1"].append(ev.evidence_id)
            supporting["H5"].append(ev.evidence_id)

        elif obs in ("bridge_severance", "road_blockage", "landslide", "road_cut"):
            # Strong evidence for H2 (Infrastructure failure) & moderate for H5
            log_likelihoods["H2"] += 2.4 * rel
            log_likelihoods["H5"] += 1.2 * rel
            traces["H2"].append(HypothesisTraceItem(
                evidence_id=ev.evidence_id,
                evidence_summary=summary,
                delta_contribution=round(2.4 * rel, 3),
                direction="SUPPORTS",
                source_reliability=round(rel, 2),
            ))
            supporting["H2"].append(ev.evidence_id)

        elif obs in ("structural_collapse", "casualty_count", "coherence_loss", "heavy_damage"):
            # Decisive evidence for H5 (Severe Local Impact)
            log_likelihoods["H5"] += 2.8 * rel
            log_likelihoods["H4"] -= 2.5 * rel
            traces["H5"].append(HypothesisTraceItem(
                evidence_id=ev.evidence_id,
                evidence_summary=summary,
                delta_contribution=round(2.8 * rel, 3),
                direction="SUPPORTS",
                source_reliability=round(rel, 2),
            ))
            supporting["H5"].append(ev.evidence_id)
            contradicting["H4"].append(ev.evidence_id)

        elif obs in ("evacuation", "population_displacement", "open_camp"):
            # Strong evidence for H3 (Population Movement)
            log_likelihoods["H3"] += 2.6 * rel
            traces["H3"].append(HypothesisTraceItem(
                evidence_id=ev.evidence_id,
                evidence_summary=summary,
                delta_contribution=round(2.6 * rel, 3),
                direction="SUPPORTS",
                source_reliability=round(rel, 2),
            ))
            supporting["H3"].append(ev.evidence_id)

        elif obs in ("sensor_glitch", "gateway_timeout", "telemetry_disconnect"):
            # Supports H4 (Data and Sensor Failure)
            log_likelihoods["H4"] += 2.5 * rel
            log_likelihoods["H5"] -= 2.0 * rel
            traces["H4"].append(HypothesisTraceItem(
                evidence_id=ev.evidence_id,
                evidence_summary=summary,
                delta_contribution=round(2.5 * rel, 3),
                direction="SUPPORTS",
                source_reliability=round(rel, 2),
            ))
            supporting["H4"].append(ev.evidence_id)
            contradicting["H5"].append(ev.evidence_id)

        elif obs in ("normal_pings", "road_clear", "all_clear"):
            # Contradicts catastrophic H5 and H1
            log_likelihoods["H4"] += 1.5 * rel
            log_likelihoods["H5"] -= 2.5 * rel
            log_likelihoods["H1"] -= 2.0 * rel
            traces["H5"].append(HypothesisTraceItem(
                evidence_id=ev.evidence_id,
                evidence_summary=summary,
                delta_contribution=round(-2.5 * rel, 3),
                direction="CONTRADICTS",
                source_reliability=round(rel, 2),
            ))
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

        if post >= 0.45:
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
