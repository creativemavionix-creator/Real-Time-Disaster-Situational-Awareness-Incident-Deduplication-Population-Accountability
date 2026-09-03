"""
Comprehensive Test Suite for PRATYAKSH-Ω Requirements 2 through 7.
Tests:
- Requirement 2: Five Selectable Disaster Types
- Requirement 3: Disaster Propagation & Flow Tracking
- Requirement 4: Silent Zone Detection & 4-Lifeline Telemetry Comparison
- Requirement 5: Five Silent Zone Hypotheses & AI Bayesian Reasoning
- Requirement 6: Multi-Source Data Fusion, Conflicts & Supply Allocation
- Requirement 7: Scenario Presets & Location-Based Loading
"""

import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.simulation.disaster_types import DISASTER_PROFILES, get_disaster_profile
from app.simulation.scenario_presets import SCENARIO_PRESETS, get_scenario_preset, list_all_scenario_presets
from app.simulation.propagation_engine import calculate_propagation_flow, generate_hazard_overlays_for_disaster
from app.pipeline.telemetry_engine import compute_sector_telemetry, compute_all_sectors_telemetry
from app.pipeline.hypothesis_engine import evaluate_sector_hypotheses, CANONICAL_HYPOTHESIS_METADATA
from app.pipeline.active_verification import evaluate_sector_verification_actions
from app.pipeline.multi_source_fusion import detect_and_fuse_multi_source_data, get_all_active_conflicts
from app.pipeline.supply_engine import compute_emergency_supplies_for_sector, compute_all_emergency_supplies

client = TestClient(app)


# ---------------------------------------------------------------------------
# Requirement 2 Tests: Five Selectable Disaster Types
# ---------------------------------------------------------------------------

def test_requirement_2_five_disaster_types_defined():
    """Verify all 5 disaster categories have full physical specifications and profiles."""
    expected_types = ["earthquake", "flash_flood", "cyclone", "landslide", "urban_fire"]
    for d_type in expected_types:
        assert d_type in DISASTER_PROFILES
        profile = get_disaster_profile(d_type)
        assert profile.disaster_type == d_type
        assert len(profile.headline) > 5
        assert len(profile.core_physics_description) > 20
        assert len(profile.primary_hazard_metric) > 5
        assert len(profile.secondary_hazards) >= 3
        assert len(profile.lifeline_failure_modes) >= 3
        assert len(profile.recommended_primary_units) >= 3
        assert len(profile.essential_supplies) >= 3


def test_requirement_2_distinct_hazard_overlays_per_disaster():
    """Verify each disaster category generates distinct hazard overlay geometries and types."""
    for d_type in ["earthquake", "flash_flood", "cyclone", "landslide", "urban_fire"]:
        overlays = generate_hazard_overlays_for_disaster(disaster_type=d_type, elapsed_hours=3.5)
        assert len(overlays) >= 2
        for o in overlays:
            assert len(o.polygon_coordinates) >= 4
            assert o.severity in ("CRITICAL", "HIGH", "MODERATE", "WATCH")


# ---------------------------------------------------------------------------
# Requirement 3 Tests: Disaster Propagation & Flow Tracking
# ---------------------------------------------------------------------------

def test_requirement_3_propagation_timeline_and_wavefront():
    """Verify spatial propagation tracks origin, active wavefront, and node arrival history."""
    for d_type in ["earthquake", "flash_flood", "cyclone", "landslide", "urban_fire"]:
        flow = calculate_propagation_flow(disaster_type=d_type, elapsed_hours=2.0)
        assert flow.disaster_type == d_type
        assert flow.origin is not None
        assert len(flow.nodes) >= 5
        assert len(flow.path_coordinates) >= 6
        assert flow.active_wavefront is not None
        # At T=2.0h, nodes before 2.0h should be IMPACTED or ACTIVE_WAVEFRONT
        impacted_nodes = [n for n in flow.nodes if n.timestamp_offset_hours <= 2.0]
        assert len(impacted_nodes) > 0
        for n in impacted_nodes:
            assert n.status in ("IMPACTED", "ACTIVE_WAVEFRONT")


def test_requirement_3_propagation_api_endpoint():
    """Verify /gis/propagation-path API endpoint responds for multi-disaster parameters."""
    res = client.get("/gis/propagation-path?disaster_type=flash_flood")
    assert res.status_code == 200
    data = res.json()
    assert data["type"] == "PropagationPathCollection"
    assert data["disaster_type"] == "flash_flood"
    assert len(data["nodes"]) >= 5
    assert "movement_history" in data


# ---------------------------------------------------------------------------
# Requirement 4 Tests: Silent Zone Detection & Telemetry Comparison
# ---------------------------------------------------------------------------

def test_requirement_4_four_lifelines_telemetry_matrix():
    """Verify 4 lifelines (mobile, electricity, internet, road) are compared and silent zone risk is computed."""
    # Gorkha in earthquake should exhibit severe drop across lifelines -> CRITICAL_SILENT_ZONE
    telemetry = compute_sector_telemetry(
        sector_id="gorkha",
        disaster_type="earthquake",
        simulated_now=datetime(2026, 8, 30, 9, 30, tzinfo=timezone.utc),
        observed_reports_count=0,
    )
    assert telemetry.sector_id == "gorkha"
    assert telemetry.mobile.observed_value < telemetry.mobile.expected_value
    assert telemetry.electricity.observed_value < telemetry.electricity.expected_value
    assert telemetry.internet.observed_value < telemetry.internet.expected_value
    assert telemetry.road.observed_value < telemetry.road.expected_value
    assert telemetry.silent_zone_risk_score >= 7.0
    assert telemetry.silent_zone_tier == "CRITICAL_SILENT_ZONE"
    assert telemetry.is_silent_zone is True


def test_requirement_4_telemetry_api_endpoints():
    """Verify /gis/telemetry-comparison endpoints return valid data."""
    res_all = client.get("/gis/telemetry-comparison?disaster_type=earthquake")
    assert res_all.status_code == 200
    data_all = res_all.json()
    assert data_all["type"] == "TelemetryComparisonCollection"
    assert data_all["total_sectors"] == 8
    assert data_all["silent_zones_count"] >= 1

    res_single = client.get("/gis/telemetry-comparison/gorkha?disaster_type=earthquake")
    assert res_single.status_code == 200
    data_single = res_single.json()
    assert data_single["sector_id"] == "gorkha"
    assert "mobile" in data_single
    assert "electricity" in data_single
    assert "internet" in data_single
    assert "road" in data_single


# ---------------------------------------------------------------------------
# Requirement 5 Tests: Five Silent Zone Hypotheses & AI Reasoning
# ---------------------------------------------------------------------------

def test_requirement_5_five_canonical_hypotheses():
    """Verify H1..H5 are exactly Communication, Infrastructure, Population, Sensor, and Severe Impact."""
    assert CANONICAL_HYPOTHESIS_METADATA["H1"]["title"] == "Communication Failure"
    assert CANONICAL_HYPOTHESIS_METADATA["H2"]["title"] == "Infrastructure Failure"
    assert CANONICAL_HYPOTHESIS_METADATA["H3"]["title"] == "Population Movement"
    assert CANONICAL_HYPOTHESIS_METADATA["H4"]["title"] == "Data and Sensor Failure"
    assert CANONICAL_HYPOTHESIS_METADATA["H5"]["title"] == "Severe Local Impact"

    hyp_resp = evaluate_sector_hypotheses("gorkha")
    codes = [h.hypothesis_code for h in hyp_resp.hypotheses]
    assert set(codes) == {"H1", "H2", "H3", "H4", "H5"}

    # Probabilities sum to 1.0
    tot_prob = sum(h.posterior_probability for h in hyp_resp.hypotheses)
    assert abs(tot_prob - 1.0) < 0.02


def test_requirement_5_active_verification_ranking():
    """Verify active verification engine ranks next best observations tailored to hypotheses."""
    actions = evaluate_sector_verification_actions("gorkha")
    assert len(actions) >= 5
    # First action should have high ranking score
    assert actions[0].ranking_score >= actions[-1].ranking_score
    action_types = {a.action_type for a in actions}
    assert "mobile_comms_cow" in action_types
    assert "drone_uav_recon" in action_types
    assert "satellite_sar_tasking" in action_types


# ---------------------------------------------------------------------------
# Requirement 6 Tests: Multi-Source Fusion, Conflicts & Supply Engine
# ---------------------------------------------------------------------------

def test_requirement_6_multi_source_conflicts_detection():
    """Verify multi-source fusion identifies contradictions and provides supervisor resolution."""
    conflicts = get_all_active_conflicts()
    assert len(conflicts) >= 3
    first_c = conflicts[0]
    assert first_c.primary_claim != first_c.competing_claim
    assert len(first_c.resolution_recommendation) > 10

    res = client.get("/dispatch/conflicts")
    assert res.status_code == 200
    data = res.json()
    assert data["total_active_conflicts"] >= 3


def test_requirement_6_emergency_supply_allocation():
    """Verify emergency supply allocation prioritizes silent zones with high population exposure."""
    overview = compute_all_emergency_supplies(disaster_type="earthquake")
    assert overview.total_water_liters_demanded > 0
    assert overview.total_food_rations_demanded > 0
    assert overview.total_trauma_kits_demanded > 0
    assert overview.total_comms_terminals_demanded > 0
    assert overview.total_tents_demanded > 0

    res = client.get("/dispatch/supplies")
    assert res.status_code == 200
    data = res.json()
    assert "allocations" in data
    assert len(data["allocations"]) == 8


# ---------------------------------------------------------------------------
# Requirement 7 Tests: Scenario Presets & Instant Loading
# ---------------------------------------------------------------------------

def test_requirement_7_scenario_presets_listing_and_loading():
    """Verify all 5 presets exist and can be loaded via API."""
    presets = list_all_scenario_presets()
    assert len(presets) == 5
    preset_ids = {p.preset_id for p in presets}
    assert "gorkha_earthquake" in preset_ids
    assert "melamchi_flood" in preset_ids
    assert "rasuwa_landslide" in preset_ids
    assert "kathmandu_fire" in preset_ids
    assert "terai_cyclone" in preset_ids

    # Test GET presets endpoint
    res = client.get("/simulation/presets")
    assert res.status_code == 200
    data = res.json()
    assert len(data["presets"]) == 5

    # Test POST preset loading endpoint
    res_load = client.post("/simulation/preset/melamchi_flood?reseed=false")
    assert res_load.status_code == 200
    state = res_load.json()
    assert state["disaster_type"] == "flash_flood"
    assert state["active_preset_id"] == "melamchi_flood"
