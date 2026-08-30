"""Unit tests for RESQ-SIGHT Multi-Modal Ground Truth & Research APIs."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_resq_sight_manifest():
    """Test /resq-sight/manifest endpoint returns all datasets and metadata."""
    res = client.get("/resq-sight/manifest")
    assert res.status_code == 200
    data = res.json()
    assert "datasets" in data
    assert len(data["datasets"]) >= 5


def test_resq_sight_ground_truth_calibration():
    """Test /resq-sight/ground-truth/calibration returns 260k building stats & sector profiles."""
    res = client.get("/resq-sight/ground-truth/calibration")
    assert res.status_code == 200
    data = res.json()
    assert "dataset_summary" in data
    assert "sector_fragility_profiles" in data
    assert len(data["sector_fragility_profiles"]) == 8
    
    # Check Rasuwa high fragility profile
    rasuwa = next(p for p in data["sector_fragility_profiles"] if p["sector_id"] == "rasuwa")
    assert rasuwa["structural_fragility_index"] >= 0.9
    assert rasuwa["masonry_ratio_pct"] > 80.0


def test_resq_sight_satellite_points():
    """Test /resq-sight/satellite/points returns UNOSAT shapefile point coordinates."""
    res = client.get("/resq-sight/satellite/points")
    assert res.status_code == 200
    data = res.json()
    assert "damage_points" in data
    assert data["points_count"] > 0
    first_pt = data["damage_points"][0]
    assert "lat" in first_pt
    assert "lon" in first_pt
    assert "grading" in first_pt


def test_resq_sight_nlp_benchmarks():
    """Test /resq-sight/nlp/stats returns Ebiquity Devanagari NER stats and CrisisNLP metrics."""
    res = client.get("/resq-sight/nlp/stats")
    assert res.status_code == 200
    data = res.json()
    assert "devanagari_ner_ebiquity" in data
    assert "crisis_nlp_benchmarks" in data
    assert data["devanagari_ner_ebiquity"]["unique_location_entities"] > 0


def test_resq_sight_exposure_summary():
    """Test /resq-sight/exposure/summary returns 2021 Census palika counts."""
    res = client.get("/resq-sight/exposure/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["census_year"] == 2021
    assert data["total_tracked_palikas"] > 0
    assert data["total_monitored_population"] > 100000
