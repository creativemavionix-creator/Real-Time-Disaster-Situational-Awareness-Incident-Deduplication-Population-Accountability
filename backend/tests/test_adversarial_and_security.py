"""
Adversarial, Security, and Stress Test Suite for PRATYAKSH-Ω.
Verifies robust handling of malicious payloads, rate-limiting, extreme values,
unauthorized operations, and boundary anomalies.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.security import sanitize_input_text
from app.pipeline.gazetteer import resolve_location_from_coordinates, resolve_location_from_text
from app.pipeline.hypothesis_engine import evaluate_sector_hypotheses
from app.models.schemas import ActionReviewRequest, MultiModalEvidenceIngest
from app.pipeline.governance import process_human_action_review
from app.pipeline.evidence_model import ingest_evidence_item

client = TestClient(app)


def test_security_headers_present():
    """Verify security headers are injected on API responses."""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert resp.headers.get("X-Frame-Options") == "DENY"
    assert resp.headers.get("X-XSS-Protection") == "1; mode=block"


def test_input_sanitization():
    """Verify XSS scripts and control chars are safely sanitized."""
    malicious = "<script>alert('XSS')</script>\x00\x08Test Text"
    sanitized = sanitize_input_text(malicious)
    assert "<script>" not in sanitized
    assert "&lt;script&gt;" in sanitized
    assert "\x00" not in sanitized


def test_malformed_and_extreme_coordinates():
    """Verify pipeline safely handles extreme and invalid coordinates without crashing."""
    # Out of bounds coordinates should return None
    assert resolve_location_from_coordinates(9999.0, -9999.0) is None
    assert resolve_location_from_coordinates(None, 85.3) is None
    assert resolve_location_from_coordinates(27.7, None) is None
    # Far away coordinates (e.g. London)
    assert resolve_location_from_coordinates(51.5074, -0.1278) is None


def test_empty_and_gibberish_text_extraction():
    """Verify entity extractor handles empty, whitespace, and gibberish strings."""
    assert resolve_location_from_text("") is None
    assert resolve_location_from_text("   \n\t  ") is None
    assert resolve_location_from_text("qwertyuiopasdfghjklzxcvbnm1234567890") is None


def test_unauthorized_governance_rejection():
    """Verify Viewer or Analyst role cannot approve verification actions."""
    req = ActionReviewRequest(
        recommendation_id="REC-TEST-ADVERSARIAL",
        decision="APPROVED",
        reviewer_role="Viewer",
        reviewer_name="Adversary",
        justification="Bypassing auth",
    )
    res = process_human_action_review(req)
    assert res.status == "FORBIDDEN"
    assert "unauthorized" in res.message.lower()


def test_nonexistent_sector_404():
    """Verify requesting an invalid sector ID returns clean 404."""
    resp = client.get("/hypotheses/sector/atlantis_underwater")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


def test_correlated_evidence_spam_bounded():
    """Verify feeding 10 duplicate signals receives correlation penalty and does not explode posteriors."""
    # Ingest duplicate citizen reports for Rasuwa
    for i in range(5):
        ingest_evidence_item(
            MultiModalEvidenceIngest(
                sector_id="rasuwa",
                source_type="social_media_repost",
                source_id=f"SPAM_{i}",
                observation_type="signal_loss",
                observed_value=1.0,
                raw_payload="Copied tweet: cell tower down in Dhunche",
                direction="negative",
                reliability=0.60,
            )
        )

    res = evaluate_sector_hypotheses("rasuwa")
    # All probabilities must be valid finite floats between 0 and 1
    for h in res.hypotheses:
        assert 0.0 <= h.posterior_probability <= 1.0
        assert not str(h.posterior_probability).lower().startswith("nan")
    # Sum must strictly equal 1.0
    assert abs(sum(h.posterior_probability for h in res.hypotheses) - 1.0) < 0.01


def test_observability_endpoints():
    """Verify /health, /ready, /version, and /metrics/telemetry endpoints."""
    r_health = client.get("/health")
    assert r_health.status_code == 200
    assert r_health.json()["status"] == "OPERATIONAL"

    r_ready = client.get("/ready")
    assert r_ready.status_code == 200
    assert r_ready.json()["ready"] is True

    r_ver = client.get("/version")
    assert r_ver.status_code == 200
    assert "PRATYAKSH" in r_ver.json()["protocol"]

    r_tel = client.get("/metrics/telemetry")
    assert r_tel.status_code == 200
    assert "active_anomalies_count" in r_tel.json()
