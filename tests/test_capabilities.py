"""Integration tests for all 6 new platform capabilities."""

from fastapi.testclient import TestClient
import pytest


def test_gis_telemetry(client: TestClient):
    """Test Capability 1: GIS Telemetry."""
    response = client.get("/gis/telemetry")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert "sectors" in data
    assert len(data["sectors"]) == 8
    first = data["sectors"][0]
    assert "sector_id" in first
    assert "severity_index" in first
    assert "distance_to_epicenter_km" in first
    assert "isolation_index" in first


def test_deduplication_unified_truth(client: TestClient):
    """Test Capability 2: Multi-Agency Deduplication & Unified Truth."""
    response = client.get("/deduplication/unified-truth")
    assert response.status_code == 200
    data = response.json()
    assert "total_clusters" in data
    assert "unified_records" in data
    if data["unified_records"]:
        rec = data["unified_records"][0]
        assert "consensus_damage_type" in rec
        assert "unified_casualty_estimate" in rec
        assert "agency_breakdown" in rec
        assert "verification_status" in rec


def test_blackout_risk_intelligence(client: TestClient):
    """Test Capability 3: Silent Blackout Risk Intelligence."""
    response = client.get("/blackout-intel/risk-assessment")
    assert response.status_code == 200
    data = response.json()
    assert "assessments" in data
    assert len(data["assessments"]) == 8
    for a in data["assessments"]:
        assert "inferred_risk_score" in a
        assert 0.0 <= a["inferred_risk_score"] <= 100.0
        assert "spatial_physics" in a
        assert "epicenter_distance_km" in a["spatial_physics"]
        assert "slope_gradient_degrees" in a["spatial_physics"]


def test_population_exposure_and_missing_persons(client: TestClient):
    """Test Capability 4: Dynamic Population Exposure & Missing Persons."""
    # 1. Exposure
    exp_res = client.get("/population/exposure")
    assert exp_res.status_code == 200
    exp_data = exp_res.json()
    assert exp_data["total_national_exposed_population"] > 0
    assert len(exp_data["sector_exposures"]) == 8

    # 2. List missing persons
    mp_res = client.get("/population/missing-persons")
    assert mp_res.status_code == 200
    mps = mp_res.json()
    assert len(mps) >= 1

    # 3. Create missing person
    new_mp = {
        "full_name": "Deepak Khadka",
        "age": 31,
        "gender": "Male",
        "last_known_location_id": "kathmandu",
        "reported_by": "Radha Khadka",
        "contact_number": "+977-9849999999",
        "physical_description": "Green jacket, red backpack.",
        "notes": "Last seen near Kalanki bus stop."
    }
    create_res = client.post("/population/missing-persons", json=new_mp)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["full_name"] == "Deepak Khadka"
    assert created_data["status"] == "missing"


def test_tactical_resource_dispatch(client: TestClient):
    """Test Capability 5: Tactical Resource Dispatch Engine."""
    # 1. Dashboard
    dash_res = client.get("/dispatch/dashboard")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert "recommendations" in dash_data
    assert "resource_units" in dash_data
    assert len(dash_data["resource_units"]) >= 1

    # 2. Recommendations
    rec_res = client.get("/dispatch/recommendations")
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert len(recs) == 8
    assert recs[0]["priority_score"] >= recs[-1]["priority_score"]

    # 3. Units
    units_res = client.get("/dispatch/units")
    assert units_res.status_code == 200
    units = units_res.json()
    assert len(units) >= 1
    target_unit_id = units[0]["id"]

    # 4. Assign mission
    assign_payload = {
        "target_location_id": "sindhupalchok",
        "assigned_unit_id": target_unit_id,
        "justification": "Urgent bridge clearing on Melamchi corridor."
    }
    assign_res = client.post("/dispatch/assign", json=assign_payload)
    assert assign_res.status_code == 201
    assign_data = assign_res.json()
    assert assign_data["target_location_id"] == "sindhupalchok"
    assert assign_data["assigned_unit_id"] == target_unit_id
    assert assign_data["status"] == "dispatched"


def test_timeline_sitrep_generator(client: TestClient):
    """Test Capability 6: 24-Hour Timeline & SITREP Generator."""
    response = client.get("/sitrep/current")
    assert response.status_code == 200
    data = response.json()
    assert "sitrep_id" in data
    assert "executive_summary" in data
    assert "casualty_toll" in data
    assert "confirmed_fatalities" in data["casualty_toll"]
    assert "confirmed_injured" in data["casualty_toll"]
    assert "critical_sectors_summary" in data
    assert "priority_operational_directives" in data
    assert len(data["priority_operational_directives"]) >= 1
