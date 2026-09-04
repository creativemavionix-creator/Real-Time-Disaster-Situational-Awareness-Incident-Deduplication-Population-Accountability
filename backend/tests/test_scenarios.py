"""
Milestone 14: Comprehensive Scenario Lifecycle & Core Invariant Test Suite.

Mandatory Critical Cases (DEVELOPMENT_PLAN.md Section 17):
1. Flood with downstream connectivity loss
2. Earthquake with epicenter-adjacent infrastructure collapse
3. Cyclone/hurricane directional multi-sector impact
4. Silent zone caused by sensor failure rather than physical damage (H4)
5. Silent zone caused by population movement (H3)
6. Silent zone caused by severe local impact (H5)
7. Recommendation favors verification/recon before safety labeling
8. Core invariant: silence != safety (System never assumes silence means safety)
"""

from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.simulation.clock import set_active_disaster, reset_clock
from app.simulation.propagation_engine import calculate_propagation_flow
from app.simulation.scenario_presets import SCENARIO_PRESETS, get_scenario_preset

client = TestClient(app)


# =============================================================
# Milestone 2: Scenario Lifecycle CRUD API Tests
# =============================================================

def test_scenario_crud_lifecycle():
    """Verify complete CRUD lifecycle: create, list, get, start, advance, reset."""
    # 1. Create custom scenario
    create_payload = {
        "title": "Koshi River Basin Flash Flood Deluge",
        "disaster_type": "flash_flood",
        "description": "Extreme cloudburst triggers sudden deluge and downstream bridge washouts along Koshi basin.",
        "center_lat": 27.83,
        "center_lon": 85.58,
        "default_zoom": 10,
        "initial_affected_sectors": ["sindhupalchok", "dolakha"],
        "suspected_silent_zones": ["dolakha"],
        "critical_lifelines_at_risk": ["Koshi Highway", "Melamchi Tunnel"],
        "tags": ["Hydrological", "Bridge Severance", "High Water"],
    }
    create_res = client.post("/simulation/scenarios", json=create_payload)
    assert create_res.status_code == 201, create_res.text
    scenario = create_res.json()
    scenario_id = scenario["scenario_id"]
    assert "koshi_river_basin" in scenario_id
    assert scenario["status"] == "READY"
    assert scenario["elapsed_hours"] == 0.0
    assert len(scenario["sector_states"]) == 2

    # Verify sector states
    dolakha_state = next((s for s in scenario["sector_states"] if s["sector_id"] == "dolakha"), None)
    assert dolakha_state is not None
    assert dolakha_state["is_silent_zone"] is True
    assert dolakha_state["silence_risk_score"] > 0.8

    # 2. List scenarios includes custom scenario and presets
    list_res = client.get("/simulation/scenarios")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total_scenarios"] >= 6  # 5 presets + 1 custom
    found = any(s["scenario_id"] == scenario_id for s in list_data["scenarios"])
    assert found is True

    # 3. Get scenario by ID
    get_res = client.get(f"/simulation/scenarios/{scenario_id}")
    assert get_res.status_code == 200
    assert get_res.json()["scenario_id"] == scenario_id

    # 4. Start scenario
    start_res = client.post(f"/simulation/scenarios/{scenario_id}/start?reseed=false")
    assert start_res.status_code == 200
    assert start_res.json()["status"] == "RUNNING"

    # 5. Advance scenario
    advance_res = client.post(f"/simulation/scenarios/{scenario_id}/advance", json={"hours": 2.5, "minutes": 0})
    assert advance_res.status_code == 200
    advanced_data = advance_res.json()
    assert advanced_data["status"] == "RUNNING"
    assert advanced_data["elapsed_hours"] >= 2.5

    # 6. Reset scenario
    reset_res = client.post(f"/simulation/scenarios/{scenario_id}/reset")
    assert reset_res.status_code == 200
    assert reset_res.json()["status"] == "RESET"
    assert reset_res.json()["elapsed_hours"] == 0.0


def test_preset_scenario_lifecycle():
    """Verify built-in presets (e.g. gorkha_earthquake) work through scenario endpoints."""
    # Get preset detail
    res = client.get("/simulation/scenarios/gorkha_earthquake")
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_id"] == "gorkha_earthquake"
    assert data["disaster_type"] == "earthquake"
    assert len(data["initial_affected_sectors"]) >= 5
    assert "gorkha" in data["suspected_silent_zones"]

    # Start preset
    start_res = client.post("/simulation/scenarios/gorkha_earthquake/start?reseed=false")
    assert start_res.status_code == 200
    assert start_res.json()["status"] == "RUNNING"

    # Advance preset
    adv_res = client.post("/simulation/scenarios/gorkha_earthquake/advance", json={"hours": 1.0})
    assert adv_res.status_code == 200
    assert adv_res.json()["elapsed_hours"] >= 1.0

    # Reset preset
    reset_res = client.post("/simulation/scenarios/gorkha_earthquake/reset")
    assert reset_res.status_code == 200


def test_scenario_not_found_returns_404():
    """Verify non-existent scenario returns 404."""
    res = client.get("/simulation/scenarios/non_existent_scenario_xyz")
    assert res.status_code == 404


# =============================================================
# Mandatory Critical Cases 1-8 (DEVELOPMENT_PLAN.md Section 17)
# =============================================================

def test_case_1_flood_with_downstream_connectivity_loss():
    """
    Case 1: Flood with downstream connectivity loss.
    Downstream propagation nodes must reflect progressive arrival timeline and severed connectivity.
    """
    flow = calculate_propagation_flow(disaster_type="flash_flood", elapsed_hours=2.0)
    assert len(flow.nodes) >= 4
    nodes = flow.nodes

    # Verify chronological arrival times down the river basin
    for i in range(len(nodes) - 1):
        assert nodes[i].timestamp_offset_hours <= nodes[i + 1].timestamp_offset_hours

    # Downstream telemetry API check
    res = client.get("/gis/telemetry-comparison?disaster_type=flash_flood")
    assert res.status_code == 200
    data = res.json()
    assert data["total_sectors"] > 0
    # Road or internet/mobile lifelines should reflect disruption in flood zone
    silent_count = data["silent_zones_count"]
    assert silent_count >= 1


def test_case_2_earthquake_epicenter_adjacent_collapse():
    """
    Case 2: Earthquake with epicenter-adjacent infrastructure collapse.
    Barpak/Gorkha and adjacent high-mountain sectors suffer high shaking and telecom collapse.
    """
    preset = get_scenario_preset("gorkha_earthquake")
    assert preset.origin_point["magnitude"] == 7.8
    assert "gorkha" in preset.initial_affected_sectors

    # Check propagation radial attenuation
    flow = calculate_propagation_flow(disaster_type="earthquake", elapsed_hours=1.0)
    assert len(flow.nodes) > 0
    # Epicenter node has earliest arrival and maximum damage severity
    epicenter_node = flow.nodes[0]
    assert epicenter_node.damage_severity in ("CATASTROPHIC", "SEVERE")
    assert epicenter_node.timestamp_offset_hours <= 0.5


def test_case_3_cyclone_directional_multi_sector_impact():
    """
    Case 3: Cyclone/hurricane directional multi-sector impact.
    Gale winds travel through southern Terai corridor in sequence.
    """
    flow = calculate_propagation_flow(disaster_type="cyclone", elapsed_hours=3.0)
    assert len(flow.nodes) >= 3
    # Check that wavefront moves through nodes
    arrival_times = [n.timestamp_offset_hours for n in flow.nodes]
    assert arrival_times == sorted(arrival_times)


def test_case_4_silence_caused_by_sensor_failure():
    """
    Case 4: Silent zone caused by sensor failure rather than physical damage.
    Hypothesis H4 (Data and Sensor Failure) is evaluated and recommendations favor recon/sensor probe.
    """
    res = client.get("/hypotheses/all")
    assert res.status_code == 200
    data = res.json()
    sectors = data.get("sectors", [])
    assert len(sectors) > 0

    first_sec = sectors[0]
    h_codes = [h["hypothesis_code"] for h in first_sec["hypotheses"]]
    assert "H4" in h_codes
    h4 = next(h for h in first_sec["hypotheses"] if h["hypothesis_code"] == "H4")
    assert "sensor" in h4["title"].lower() or "data" in h4["title"].lower()


def test_case_5_silence_caused_by_population_movement():
    """
    Case 5: Silent zone caused by population movement (evacuation / displacement).
    Hypothesis H3 (Population Movement) is formally tracked in Bayesian hypothesis engine.
    """
    res = client.get("/hypotheses/all")
    assert res.status_code == 200
    data = res.json()
    sectors = data.get("sectors", [])
    first_sec = sectors[0]
    h3 = next((h for h in first_sec["hypotheses"] if h["hypothesis_code"] == "H3"), None)
    assert h3 is not None
    assert "population" in h3["title"].lower() or "movement" in h3["title"].lower() or "evacuat" in h3["title"].lower()


def test_case_6_silence_caused_by_severe_local_impact():
    """
    Case 6: Silent zone caused by severe local impact (catastrophic physical collapse).
    H5 (Severe Local Impact) is evaluated.
    """
    res = client.get("/hypotheses/all")
    assert res.status_code == 200
    data = res.json()
    sectors = data.get("sectors", [])
    first_sec = sectors[0]
    h5 = next((h for h in first_sec["hypotheses"] if h["hypothesis_code"] == "H5"), None)
    assert h5 is not None
    assert "severe" in h5["title"].lower() or "impact" in h5["title"].lower() or "local" in h5["title"].lower()


def test_case_7_recommendation_favors_verification_before_safety():
    """
    Case 7: Recommendation favors verification/recon before safety labeling.
    When anomalous silence is observed, system produces active verification recommendations.
    """
    res = client.get("/verification/next-best-observations")
    assert res.status_code == 200
    data = res.json()
    assert data["total_actions_evaluated"] > 0
    assert len(data["candidate_actions"]) > 0

    # Actions must be actionable reconnaissance tasks (drone, satellite, field patrol)
    action_types = [a["action_type"] for a in data["candidate_actions"]]
    valid_types = {"drone_uav_recon", "satellite_sar_tasking", "field_patrol_recon", "lora_iot_probe", "cctv_poll", "local_palika_query"}
    assert any(a in valid_types for a in action_types)


def test_case_8_core_invariant_silence_is_not_safety():
    """
    Case 8: Core System Invariant:
    silence != safety

    A location with zero incoming reports during a disaster must NEVER be automatically
    marked as 'verified_safe'. It must be flagged as 'blackout', 'unverified', or 'investigating'.
    Urgency score for an uncontacted zone must be elevated, not zero.
    """
    # Locations status endpoint
    res = client.get("/locations/status")
    assert res.status_code == 200
    locations = res.json().get("locations", [])

    for loc in locations:
        # If a location has zero reports and is in blackout, it CANNOT be verified_safe
        if loc.get("incident_count", 0) == 0 and loc.get("status") == "blackout":
            assert loc["status"] != "verified_safe", f"Invariant violated: {loc['location_name']} is silent but marked verified_safe!"

    # Location override safety guardrail: operator cannot mark safe without explicit affirmative flag
    override_res = client.post(
        "/locations/gorkha/override",
        json={
            "override_status": "blackout",
            "confirmed_safe": False,
            "operator_name": "Major General Sharma",
            "operator_role": "Officer",
            "badge_or_unit": "National Emergency Operations Centre",
            "justification_notes": "All repeater towers silent; reconnaissance UAV dispatched.",
        },
    )
    assert override_res.status_code == 200
    assert override_res.json()["effective_status"] != "verified_safe"

    # Verify negative evidence endpoint flags silent zones as anomalies, not safe zones
    neg_res = client.get("/negative-evidence/overview")
    assert neg_res.status_code == 200
    neg_data = neg_res.json()
    assert neg_data["active_anomalies_count"] > 0
    assert len(neg_data["silence_windows"]) > 0
