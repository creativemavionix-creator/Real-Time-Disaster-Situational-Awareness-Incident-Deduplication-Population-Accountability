"""Test suite for GIS layers, H3 Grid, Hazard Overlays, and Propagation Flow Vectors."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_h3_grid_endpoint():
    response = client.get("/gis/h3-grid")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "H3HexagonalGridCollection"
    assert data["resolution"] == 8
    assert "hexagons" in data
    assert len(data["hexagons"]) >= 24

    first_hex = data["hexagons"][0]
    assert "h3_index" in first_hex
    assert "baseline_population" in first_hex
    assert "silent_exposure_metric_ecell" in first_hex
    assert "status" in first_hex
    assert len(first_hex["polygon_coordinates"]) >= 6


def test_hazard_overlays_endpoint():
    response = client.get("/gis/hazard-overlays?disaster_type=earthquake")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "HazardOverlayCollection"
    assert data["disaster_type"] == "earthquake"
    assert "origin" in data
    assert len(data["overlays"]) == 3

    mmi_viii = next((o for o in data["overlays"] if o["id"] == "mmi_viii_critical"), None)
    assert mmi_viii is not None
    assert mmi_viii["severity"] == "CRITICAL"
    assert len(mmi_viii["polygon_coordinates"]) >= 30


def test_propagation_path_endpoint():
    response = client.get("/gis/propagation-path?disaster_type=earthquake")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "PropagationPathCollection"
    assert "origin" in data
    assert "nodes" in data
    assert len(data["nodes"]) >= 8
    assert len(data["path_coordinates"]) >= 8
    assert "active_wavefront" in data
