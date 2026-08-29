"""Integration tests for all FastAPI API endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, SessionLocal
from app.simulation.clock import get_or_create_clock
from app.simulation.generator import seed_database


@pytest.fixture(scope="module", autouse=True)
def setup_test_database():
    """Initialize database and seed initial test data."""
    init_db()
    db = SessionLocal()
    try:
        get_or_create_clock(db)
        seed_database(db, force=True)
    finally:
        db.close()


@pytest.fixture(scope="module")
def client():
    """Test client within lifespan context."""
    with TestClient(app) as test_client:
        yield test_client


def test_root_endpoint(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "endpoints" in data


def test_get_locations(client: TestClient):
    response = client.get("/locations")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 8
    assert len(data["locations"]) == 8
    
    loc_ids = [l["id"] for l in data["locations"]]
    expected_ids = ["kathmandu", "bhaktapur", "sindhupalchok", "dolakha", "nuwakot", "gorkha", "rasuwa", "sindhuli"]
    for expected in expected_ids:
        assert expected in loc_ids


def test_all_locations_status(client: TestClient):
    response = client.get("/locations/status")
    assert response.status_code == 200
    data = response.json()
    assert "simulated_time" in data
    assert "locations" in data
    assert len(data["locations"]) == 8
    assert "summary_counts" in data
    
    for loc in data["locations"]:
        assert loc["status"] in ["verified_safe", "verified_damaged", "unverified", "blackout"]
        assert 0.0 <= loc["confidence_score"] <= 1.0


def test_single_location_status(client: TestClient):
    response = client.get("/locations/kathmandu/status")
    assert response.status_code == 200
    data = response.json()
    assert data["location_id"] == "kathmandu"
    assert data["location_name"] == "Kathmandu"
    assert "confidence_score" in data
    assert "top_incidents" in data

    # Test invalid location
    bad_resp = client.get("/locations/nonexistent_city/status")
    assert bad_resp.status_code == 404


def test_location_incidents(client: TestClient):
    response = client.get("/locations/kathmandu/incidents")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        inc = data[0]
        assert "cluster_id" in inc
        assert "representative_text" in inc
        assert "sources_breakdown" in inc
        assert "confidence_score" in inc


def test_post_report_valid_and_invalid(client: TestClient):
    # Valid report
    payload = {
        "source_type": "police",
        "raw_text": "Kathmandu police reporting road cleared at Kalanki, 0 casualties.",
        "reported_lat": 27.7172,
        "reported_lon": 85.3240,
    }
    response = client.post("/reports", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["source_type"] == "police"
    assert data["resolved_location_id"] == "kathmandu"
    assert "score_breakdown" in data
    assert data["score_breakdown"]["source_trust_weight"] == 0.90
    assert data["score_breakdown"]["has_coordinates_bonus"] == 0.10

    # Invalid report (empty raw_text -> 422)
    bad_payload = {
        "source_type": "police",
        "raw_text": "   ",
    }
    bad_resp = client.post("/reports", json=bad_payload)
    assert bad_resp.status_code == 422

    # Invalid source_type -> 422
    bad_src_payload = {
        "source_type": "unregistered_drone",
        "raw_text": "Some text",
    }
    bad_src_resp = client.post("/reports", json=bad_src_payload)
    assert bad_src_resp.status_code == 422


def test_simulation_clock_lifecycle(client: TestClient):
    # 1. Reset simulation
    reset_resp = client.post("/simulation/reset")
    assert reset_resp.status_code == 200
    reset_data = reset_resp.json()
    assert reset_data["elapsed_hours"] == 0.0

    # 2. Get state
    state_resp = client.get("/simulation/state")
    assert state_resp.status_code == 200
    state_data = state_resp.json()
    assert state_data["elapsed_hours"] == 0.0

    # 3. Advance by 4 hours
    adv_resp = client.post("/simulation/advance", json={"hours": 4.0})
    assert adv_resp.status_code == 200
    adv_data = adv_resp.json()
    assert adv_data["elapsed_hours"] == 4.0
    assert adv_data["reports_visible_at_current_time"] > 0

    # 4. Advance by 30 minutes
    adv_resp2 = client.post("/simulation/advance", json={"minutes": 30})
    assert adv_resp2.status_code == 200
    adv_data2 = adv_resp2.json()
    assert adv_data2["elapsed_hours"] == 4.5


def test_seed_endpoint(client: TestClient):
    response = client.post("/seed")
    assert response.status_code == 200
    data = response.json()
    assert data["reports_seeded"] > 0
    assert "Successfully seeded" in data["message"]
