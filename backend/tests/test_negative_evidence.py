"""Unit tests for Negative Evidence & Silence Window Detector."""

from datetime import datetime, timezone, timedelta
from app.pipeline.negative_evidence import (
    detect_negative_evidence_anomalies,
    get_all_silence_windows,
    update_sector_signal_timestamp,
    get_negative_evidence_overview,
)


def test_detect_negative_evidence_anomalies():
    """Verify anomaly detector finds unexpected signal gaps."""
    sim_time = datetime(2026, 8, 30, 14, 0, tzinfo=timezone.utc)
    anomalies = detect_negative_evidence_anomalies(sim_time)

    assert isinstance(anomalies, list)
    assert len(anomalies) > 0
    # Gorkha or Rasuwa should be detected as anomalous due to silence
    gorkha_anom = next((a for a in anomalies if a.sector_id == "gorkha"), None)
    assert gorkha_anom is not None
    assert gorkha_anom.severity_tier in ("CRITICAL", "HIGH")


def test_silence_windows_calculation():
    """Verify silence windows track hours elapsed since last signal."""
    sim_time = datetime(2026, 8, 30, 12, 0, tzinfo=timezone.utc)
    windows = get_all_silence_windows(sim_time)

    assert len(windows) == 8
    # Windows should be sorted descending by silence duration
    assert windows[0].silence_duration_hours >= windows[-1].silence_duration_hours
    assert windows[0].expected_events_lost >= 0.0


def test_update_sector_signal_resets_silence():
    """Verify incoming signal updates last seen timestamp."""
    sim_time = datetime(2026, 8, 30, 15, 0, tzinfo=timezone.utc)
    update_sector_signal_timestamp("gorkha", sim_time)

    windows = get_all_silence_windows(sim_time)
    gkh_window = next(w for w in windows if w.sector_id == "gorkha")
    assert gkh_window.silence_duration_hours == 0.0
    assert gkh_window.silence_severity == "NORMAL"


def test_negative_evidence_overview():
    """Verify consolidated negative evidence overview."""
    overview = get_negative_evidence_overview()
    assert overview.active_anomalies_count >= 0
    assert overview.critical_silent_sectors_count >= 0
    assert len(overview.silence_windows) == 8
