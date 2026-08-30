"""Unit tests for Competing Hypotheses, Bayesian Updating, and Counterfactual Testing."""

from datetime import datetime, timezone
from app.pipeline.hypothesis_engine import (
    evaluate_sector_hypotheses,
    compute_priors_for_sector,
    compute_shannon_entropy,
    get_all_sectors_hypotheses,
)
from app.pipeline.counterfactual import evaluate_sector_counterfactuals


def test_compute_priors():
    """Verify physical priors sum to 1.0 and prioritize hazard zones."""
    priors = compute_priors_for_sector("gorkha")
    assert abs(sum(priors.values()) - 1.0) < 0.01
    # Gorkha is near Barpak epicenter, so H5/H2/H3 priors should dominate H1
    assert priors["H5"] > priors["H1"]
    assert priors["H2"] > priors["H1"]


def test_shannon_entropy_calculation():
    """Verify Shannon uncertainty entropy is maximal for uniform and 0 for certainty."""
    uniform_p = [0.2, 0.2, 0.2, 0.2, 0.2]
    certain_p = [1.0, 0.0, 0.0, 0.0, 0.0]

    max_entropy = compute_shannon_entropy(uniform_p)
    min_entropy = compute_shannon_entropy(certain_p)

    assert max_entropy > 2.0
    assert min_entropy == 0.0


def test_evaluate_sector_hypotheses_bayesian_updates():
    """Verify multi-modal evidence updates posterior probabilities and explanation traces."""
    resp = evaluate_sector_hypotheses("gorkha")

    assert resp.sector_id == "gorkha"
    assert len(resp.hypotheses) == 5
    # Posteriors must sum to ~1.0
    total_post = sum(h.posterior_probability for h in resp.hypotheses)
    assert abs(total_post - 1.0) < 0.02

    # Leading hypothesis should be H5 or H2 in Gorkha
    leading_code = resp.hypotheses[0].hypothesis_code
    assert leading_code in ("H5", "H2", "H3")

    # Verify explanation traces exist
    h_leading = resp.hypotheses[0]
    assert len(h_leading.explanation_traces) > 0
    assert h_leading.explanation_traces[0].delta_contribution != 0.0


def test_counterfactual_predictions():
    """Verify counterfactual tests generate CONFIRMED, CONTRADICTED, or UNTESTED predictions."""
    cf_resp = evaluate_sector_counterfactuals("gorkha")

    assert cf_resp.sector_id == "gorkha"
    assert len(cf_resp.predictions) > 0
    assert 0.0 <= cf_resp.consistency_score <= 100.0

    statuses = {p.verification_status for p in cf_resp.predictions}
    assert "CONFIRMED" in statuses or "UNTESTED" in statuses


def test_all_sectors_hypotheses():
    """Verify national dominant hypothesis summary across 8 sectors."""
    overview = get_all_sectors_hypotheses()
    assert len(overview.sectors) == 8
    assert len(overview.national_dominant_hypotheses) == 8
    assert len(overview.sector_entropy) == 8
