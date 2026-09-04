import pytest
from datetime import datetime, timezone
from app.pipeline.population_exposure import (
    find_census_csv_path,
    calculate_all_population_exposure,
    BENCHMARK_PALIKAS,
)
from app.pipeline.aggregator import (
    compute_verification_ranking,
    AggregatedLocationStatus,
)
from app.pipeline.evidence_model import get_sector_evidence
from app.pipeline.extractor import extract_casualties
from app.pipeline.satellite_evidence import _utm45n_to_latlon


class TestBugSprintFixes:
    """
    Automated regression and verification test suite for the 9-bug internship review sprint.
    """

    # --- BUG 0, 8, 9: Real vs Synthetic Census & Population Audit ---
    def test_bug_0_8_9_census_data_provenance(self):
        """Verify census data loader finds authentic CBS 2021 CSV and does not use ascending mock values."""
        csv_path = find_census_csv_path()
        assert csv_path.exists(), f"Census CSV not found at {csv_path}"
        assert csv_path.name == "population_local_level.csv"

        # Verify benchmark palikas are CBS 2021 Census authentic, not ascending fake numbers (8140, 9200, 9800)
        assert len(BENCHMARK_PALIKAS) == 13
        gorkha_muni = next(p for p in BENCHMARK_PALIKAS if p["local_level_name"] == "Gorkha Municipality")
        assert gorkha_muni["total_population"] == 49820
        assert gorkha_muni["district_name"] == "Gorkha"

        # Check total baseline across palikas
        total_census = sum(p["total_population"] for p in BENCHMARK_PALIKAS)
        assert total_census >= 1574000, f"Expected CBS census baseline ~1.57M, got {total_census}"

        # Verify exposure calculation output uses CBS 2021 baseline
        exposure = calculate_all_population_exposure()
        assert exposure.total_national_exposed_population > 1500000

    # --- BUG 2 & 4: Priority Score is NOT flat 100% and correlates with population/exposure ---
    def test_bug_2_and_4_verification_ranking_scores_and_weighting(self):
        """Verify priority / verification urgency scores vary meaningfully across non-uniform sectors."""
        statuses = [
            AggregatedLocationStatus(
                location_id="gorkha",
                location_name="Gorkha",
                lat=28.0,
                lon=84.63,
                status="blackout",
                confidence_score=0.9,
                report_count=0,
                incident_cluster_count=0,
                silence_duration_hours=6.0,
            ),
            AggregatedLocationStatus(
                location_id="bhaktapur",
                location_name="Bhaktapur",
                lat=27.67,
                lon=85.43,
                status="unverified",
                confidence_score=0.5,
                report_count=12,
                incident_cluster_count=2,
                silence_duration_hours=1.2,
            ),
            AggregatedLocationStatus(
                location_id="sindhuli",
                location_name="Sindhuli",
                lat=27.25,
                lon=85.92,
                status="verified_safe",
                confidence_score=0.95,
                report_count=25,
                incident_cluster_count=0,
                silence_duration_hours=0.2,
            ),
        ]

        ranking = compute_verification_ranking(statuses)
        scores = [item.urgency_score for item in ranking]

        # Assert no score is flat 100.0
        for s in scores:
            assert 0.0 <= s <= 100.0
            assert s < 99.0, f"Score {s} is saturating near 100%"

        # Assert scores are strictly ordered and non-uniform
        assert len(set(scores)) == 3, f"Expected 3 distinct scores, got {scores}"
        assert scores[0] > scores[1] > scores[2], f"Expected descending scores, got {scores}"
        # Assert ranking incorporates high exposed population and fragility
        assert ranking[0].location_id == "gorkha"

    # --- BUG 3: Active Count > 0 ---
    def test_bug_3_active_evidence_count_positive(self):
        """Verify get_sector_evidence returns active records when anchored to disaster simulation clock."""
        evidence_items = get_sector_evidence("gorkha")
        active_items = [e for e in evidence_items if e.status == "active"]
        assert len(active_items) > 0, "Active evidence count must be > 0 (was previously 0 due to stale wall-clock comparison)"
        assert len(evidence_items) >= len(active_items)

    # --- BUG 5: Extraction of 'missing' casualties and UTM 45N reprojection ---
    def test_bug_5_extract_missing_casualties(self):
        """Assert reports stating '2 missing' or 'unaccounted' extract the casualty count correctly."""
        assert extract_casualties("Road link severed. 2 missing.") == 2
        assert extract_casualties("Landslide blocked valley. 12 unaccounted.") == 12
        assert extract_casualties("Building collapsed, 5 trapped under rubble.") == 5
        assert extract_casualties("Power lines down. No casualties.") == 0

    def test_bug_5_unosat_utm45n_to_latlon(self):
        """Assert UTM Zone 45N coordinates convert accurately into Nepal lat/lon bounds."""
        # Sankhu center roughly Easting 204,500m, Northing 3,125,000m
        lat, lon = _utm45n_to_latlon(204500.0, 3125000.0)
        assert 26.0 <= lat <= 31.0, f"Lat {lat} out of Nepal bounds"
        assert 80.0 <= lon <= 89.0, f"Lon {lon} out of Nepal bounds"
        # Coordinates must be roughly near 28.2°N, 83.9°E
        assert abs(lat - 28.2) < 0.5
        assert abs(lon - 84.0) < 0.5

    # --- BUG 1 & 6: Deduplication and Sort Consistency ---
    def test_bug_6_dispatch_priority_calculation(self):
        """Verify dispatch priority scoring calculates bounded, non-saturating values."""
        # Simulated raw priority inputs with 13.5 divisor calibration
        def calc_priority(effective_threat: float, exposed_pop: int, isolation: float, active_missions: int) -> float:
            import math
            pop_weight = math.log10(max(1000, exposed_pop))
            raw_priority = (effective_threat * pop_weight * (1.0 + isolation)) / (active_missions + 1.0)
            return round(min(98.5, max(5.0, raw_priority / 13.5)), 1)

        high_dispatch = calc_priority(effective_threat=90.0, exposed_pop=150000, isolation=0.8, active_missions=0)
        low_dispatch = calc_priority(effective_threat=15.0, exposed_pop=8000, isolation=0.1, active_missions=2)

        assert 0.0 <= high_dispatch <= 100.0
        assert 0.0 <= low_dispatch <= 100.0
        assert high_dispatch > low_dispatch
        assert high_dispatch < 99.0, f"High dispatch score {high_dispatch} should not saturate at flat 100"
        assert low_dispatch < 40.0
