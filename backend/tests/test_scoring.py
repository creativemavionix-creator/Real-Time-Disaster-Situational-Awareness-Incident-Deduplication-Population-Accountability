"""Unit tests for explainable reliability scoring and staleness decay."""

from datetime import datetime, timedelta, timezone
import pytest
from app.pipeline.clustering import ReportItem, ClusterItem
from app.pipeline.scoring import compute_report_score, score_cluster


def test_source_trust_weights():
    t0 = datetime(2026, 8, 30, 6, 0, tzinfo=timezone.utc)
    
    def make_rep(src: str, has_coords: bool = False):
        return ReportItem(
            id=1,
            source_type=src,
            raw_text="Test incident report",
            reported_lat=27.7 if has_coords else None,
            reported_lon=85.3 if has_coords else None,
            timestamp=t0,
            resolved_location_id="kathmandu",
            location_resolved_by="text_keyword",
            extracted_casualties=None,
            extracted_damage_type="structural",
            confidence_hint=0.5,
        )

    score_hosp = compute_report_score(make_rep("hospital"), simulated_now=t0)
    score_pol = compute_report_score(make_rep("police"), simulated_now=t0)
    score_cit = compute_report_score(make_rep("citizen"), simulated_now=t0)
    score_soc = compute_report_score(make_rep("social_media"), simulated_now=t0)

    assert score_hosp["source_trust_weight"] == 0.95
    assert score_pol["source_trust_weight"] == 0.90
    assert score_cit["source_trust_weight"] == 0.60
    assert score_soc["source_trust_weight"] == 0.35

    assert score_hosp["effective_score"] > score_pol["effective_score"]
    assert score_pol["effective_score"] > score_cit["effective_score"]
    assert score_cit["effective_score"] > score_soc["effective_score"]


def test_coordinate_bonus():
    t0 = datetime(2026, 8, 30, 6, 0, tzinfo=timezone.utc)
    
    rep_without_coords = ReportItem(
        id=1,
        source_type="citizen",
        raw_text="Test report without coords",
        reported_lat=None,
        reported_lon=None,
        timestamp=t0,
        resolved_location_id="kathmandu",
        location_resolved_by="text_keyword",
        extracted_casualties=None,
        extracted_damage_type="structural",
        confidence_hint=0.5,
    )
    rep_with_coords = ReportItem(
        id=2,
        source_type="citizen",
        raw_text="Test report with coords",
        reported_lat=27.7172,
        reported_lon=85.3240,
        timestamp=t0,
        resolved_location_id="kathmandu",
        location_resolved_by="text_keyword",
        extracted_casualties=None,
        extracted_damage_type="structural",
        confidence_hint=0.5,
    )

    s1 = compute_report_score(rep_without_coords, simulated_now=t0)
    s2 = compute_report_score(rep_with_coords, simulated_now=t0)

    assert s1["has_coordinates_bonus"] == 0.0
    assert s2["has_coordinates_bonus"] == 0.10
    assert s2["base_score"] > s1["base_score"]


def test_staleness_decay_half_life():
    t0 = datetime(2026, 8, 30, 6, 0, tzinfo=timezone.utc)
    
    rep = ReportItem(
        id=1,
        source_type="police",
        raw_text="Police incident",
        reported_lat=27.7,
        reported_lon=85.3,
        timestamp=t0,
        resolved_location_id="kathmandu",
        location_resolved_by="text_keyword",
        extracted_casualties=None,
        extracted_damage_type="structural",
        confidence_hint=0.5,
    )

    # At T=0h (immediate): decay factor ~ 1.0
    s_0h = compute_report_score(rep, simulated_now=t0, half_life_hours=6.0)
    assert abs(s_0h["staleness_decay"] - 1.0) < 0.01

    # At T=6h (one half-life elapsed): decay factor ~ 0.50
    t_6h = t0 + timedelta(hours=6)
    s_6h = compute_report_score(rep, simulated_now=t_6h, half_life_hours=6.0)
    assert abs(s_6h["staleness_decay"] - 0.50) < 0.02
    assert abs(s_6h["effective_score"] - (s_0h["base_score"] * 0.50)) < 0.02

    # At T=12h (two half-lives elapsed): decay factor ~ 0.25
    t_12h = t0 + timedelta(hours=12)
    s_12h = compute_report_score(rep, simulated_now=t_12h, half_life_hours=6.0)
    assert abs(s_12h["staleness_decay"] - 0.25) < 0.02


def test_corroboration_bonus():
    t0 = datetime(2026, 8, 30, 6, 0, tzinfo=timezone.utc)
    rep = ReportItem(
        id=1,
        source_type="citizen",
        raw_text="Citizen report",
        reported_lat=None,
        reported_lon=None,
        timestamp=t0,
        resolved_location_id="kathmandu",
        location_resolved_by="text_keyword",
        extracted_casualties=None,
        extracted_damage_type="structural",
        confidence_hint=0.5,
    )

    s_single = compute_report_score(rep, cluster_size=1, simulated_now=t0)
    s_clustered = compute_report_score(rep, cluster_size=4, simulated_now=t0)

    assert s_single["corroboration_bonus"] == 0.0
    assert s_clustered["corroboration_bonus"] > 0.0
    assert s_clustered["base_score"] > s_single["base_score"]
    assert "formula_explanation" in s_clustered
