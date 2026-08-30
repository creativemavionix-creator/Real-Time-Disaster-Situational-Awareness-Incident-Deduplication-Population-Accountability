"""Unit tests for Expected Reality Engine (diurnal curves, baselines, and comparison metrics)."""

from datetime import datetime, timezone
from app.pipeline.expected_reality import (
    get_diurnal_multiplier,
    compute_expected_baseline,
    compare_observed_vs_expected,
    get_all_sector_baselines,
)


def test_diurnal_multiplier_curve():
    """Verify diurnal curve produces high values during afternoon and low at deep night."""
    night_val = get_diurnal_multiplier(4)  # 04:00 AM
    afternoon_val = get_diurnal_multiplier(14)  # 02:00 PM

    assert night_val < afternoon_val
    assert 0.10 <= night_val <= 0.30
    assert 0.85 <= afternoon_val <= 1.00


def test_compute_expected_baseline():
    """Verify sector baselines scale with demographics."""
    ktm_baseline = compute_expected_baseline("kathmandu", "telecom_call_rate", hour=14)
    gkh_baseline = compute_expected_baseline("gorkha", "telecom_call_rate", hour=14)

    assert ktm_baseline.expected_mean > gkh_baseline.expected_mean
    assert ktm_baseline.expected_min < ktm_baseline.expected_mean < ktm_baseline.expected_max
    assert ktm_baseline.unit == "calls/hour"


def test_compare_observed_vs_expected_blackout_detection():
    """Verify zero calls during daytime triggers CRITICAL_BLACKOUT."""
    sim_time = datetime(2026, 8, 30, 14, 0, tzinfo=timezone.utc)
    comp = compare_observed_vs_expected("gorkha", observed_value=0.0, simulated_time=sim_time)

    assert comp.is_anomalous is True
    assert comp.status == "CRITICAL_BLACKOUT"
    assert comp.z_score < -2.0
    assert "Silence indicates" in comp.explanation


def test_get_all_sector_baselines():
    """Verify baseline catalog returns metrics for all 8 sectors."""
    baselines = get_all_sector_baselines(12, 0)
    assert len(baselines) == 8 * 3  # 8 sectors * 3 metrics
