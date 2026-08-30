"""Unit tests for Probabilistic Reconciliation, H3 Grid, and Before & After Showcase."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.pipeline.reconciliation import (
    jaro_similarity,
    jaro_winkler_similarity,
    attribute_cosine_similarity,
    calculate_age_penalty,
    calculate_hybrid_match_score,
)
from app.pipeline.before_after_engine import get_before_after_showcase
from app.pipeline.h3_grid import generate_central_nepal_h3_hexagons

client = TestClient(app)


def test_jaro_winkler_entity_resolution():
    # Exact match
    assert jaro_winkler_similarity("Rajesh Kumar", "Rajesh Kumar") == 1.0

    # Abbreviation match (spec example: Rajesh Kumar vs Rajesh K.)
    score = jaro_winkler_similarity("Rajesh Kumar", "Rajesh K.")
    assert score >= 0.90

    # Phonetic / minor typo match
    typo_score = jaro_winkler_similarity("Aarav Shrestha", "Arav Shrestha")
    assert typo_score >= 0.94


def test_hybrid_matching_score():
    # Rajesh Kumar 34 vs Rajesh K. 35 with overlapping clothing description
    match_score = calculate_hybrid_match_score(
        missing_name="Rajesh Kumar",
        missing_age=34,
        missing_desc="Wearing red shirt and blue jeans near market",
        found_name="Rajesh K.",
        found_age=35,
        found_desc="Red shirt, minor bruises on arm",
        missing_sector="kathmandu",
        found_sector="kathmandu",
    )
    assert match_score >= 0.85  # Must qualify as High Confidence Auto-Match


def test_before_after_showcase_api():
    res = client.get("/deduplication/before-after-showcase")
    assert res.status_code == 200
    data = res.json()
    assert data["raw_messages_count"] == 20
    assert data["condensed_directives_count"] == 3
    assert "85.0%" in data["compression_ratio"]


def test_h3_grid_api():
    res = client.get("/gis/h3-grid")
    assert res.status_code == 200
    data = res.json()
    assert data["total_hexagons"] == 24
    assert data["blackout_cells_count"] >= 2
    assert len(data["hexagons"]) > 0
    # Check E_cell metric exists
    assert "silent_exposure_metric_ecell" in data["hexagons"][0]


def test_population_reconciliation_ledger_api():
    res = client.get("/population/reconciliation-ledger")
    assert res.status_code == 200
    data = res.json()
    assert data["missing_ledger_count"] >= 0
    assert data["found_checkins_count"] == 4
    assert "auto_reconciled_matches" in data
    assert "suggested_matches_queue" in data
