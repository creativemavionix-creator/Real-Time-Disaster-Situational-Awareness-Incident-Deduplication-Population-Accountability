"""
Negative Evidence Detector for PRATYAKSH-Ω.
Enforces the foundational thesis: SILENCE != SAFETY.
Detects unexpected signal gaps, tracks silence windows, and calculates anomaly magnitude.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional
from app.models.schemas import (
    NegativeEvidenceAnomalyItem,
    SilenceWindowItem,
    NegativeEvidenceOverviewResponse,
)
from app.pipeline.gazetteer import LOCATIONS, get_location
from app.pipeline.expected_reality import compare_observed_vs_expected, compute_expected_baseline
from app.pipeline.evidence_model import get_sector_evidence
from app.pipeline.blackout_risk import SECTOR_PHYSICS_PARAMS


# Sector last signal timestamp registry
_SECTOR_LAST_SEEN: dict[str, datetime] = {
    "gorkha": datetime(2026, 8, 30, 6, 15, tzinfo=timezone.utc),  # Silent for ~3.25h at T+3.5h
    "rasuwa": datetime(2026, 8, 30, 5, 45, tzinfo=timezone.utc),  # Silent for ~3.75h
    "sindhupalchok": datetime(2026, 8, 30, 8, 20, tzinfo=timezone.utc),  # Active
    "kathmandu": datetime(2026, 8, 30, 9, 25, tzinfo=timezone.utc),  # Active
    "bhaktapur": datetime(2026, 8, 30, 9, 10, tzinfo=timezone.utc),  # Active
    "nuwakot": datetime(2026, 8, 30, 8, 45, tzinfo=timezone.utc),  # Active
    "dolakha": datetime(2026, 8, 30, 7, 30, tzinfo=timezone.utc),  # Slow reports
    "sindhuli": datetime(2026, 8, 30, 8, 50, tzinfo=timezone.utc),  # Active
}


def update_sector_signal_timestamp(sector_id: str, ts: Optional[datetime] = None):
    """Registers incoming observation timestamp to reset or update silence window."""
    _SECTOR_LAST_SEEN[sector_id.lower()] = ts or datetime.now(timezone.utc)


def detect_negative_evidence_anomalies(
    simulated_now: Optional[datetime] = None,
) -> list[NegativeEvidenceAnomalyItem]:
    """
    Scans all 8 sectors to detect unexpected gaps between expected baseline throughput and observed throughput.
    """
    if simulated_now is None or (simulated_now.year == 2026 and simulated_now.month >= 9):
        simulated_now = datetime(2026, 8, 30, 9, 30, tzinfo=timezone.utc)
    elif simulated_now.tzinfo is None:
        simulated_now = simulated_now.replace(tzinfo=timezone.utc)

    anomalies: list[NegativeEvidenceAnomalyItem] = []

    for sector_id, loc_info in LOCATIONS.items():
        # Get active evidence in the last 1 hour window
        evidence = get_sector_evidence(sector_id, simulated_now)
        recent_evs = [
            e for e in evidence
            if (simulated_now - e.timestamp).total_seconds() <= 3600.0
        ]
        observed_count = float(len(recent_evs))

        # Check against telecom / reporting baseline
        comp = compare_observed_vs_expected(
            sector_id=sector_id,
            observed_value=observed_count,
            metric="telecom_call_rate",
            simulated_time=simulated_now,
        )

        last_seen = _SECTOR_LAST_SEEN.get(sector_id, simulated_now - timedelta(hours=4))
        silence_hours = max(0.0, (simulated_now - last_seen).total_seconds() / 3600.0)

        if comp.is_anomalous:
            severity = "CRITICAL" if (observed_count == 0 and silence_hours >= 2.0) else "HIGH" if comp.z_score <= -2.0 else "MODERATE"
            
            anomalies.append(
                NegativeEvidenceAnomalyItem(
                    anomaly_id=f"ANOM-{sector_id.upper()[:3]}-{simulated_now.strftime('%H%M')}",
                    sector_id=sector_id,
                    sector_name=loc_info.name,
                    metric="telecom_and_citizen_reporting",
                    expected_value=comp.expected_mean,
                    observed_value=observed_count,
                    gap_magnitude=abs(comp.z_score),
                    silence_duration_hours=round(silence_hours, 1),
                    confidence=0.88 if severity == "CRITICAL" else 0.75,
                    severity_tier=severity,
                    explanation=comp.explanation,
                    detected_at=simulated_now,
                    is_active=True,
                )
            )

    return anomalies


def get_all_silence_windows(
    simulated_now: Optional[datetime] = None,
) -> list[SilenceWindowItem]:
    """Calculates silence window durations, expected lost events, and terrain risk for all sectors."""
    if simulated_now is None or (simulated_now.year == 2026 and simulated_now.month >= 9):
        simulated_now = datetime(2026, 8, 30, 9, 30, tzinfo=timezone.utc)
    elif simulated_now.tzinfo is None:
        simulated_now = simulated_now.replace(tzinfo=timezone.utc)

    windows: list[SilenceWindowItem] = []

    for sector_id, loc_info in LOCATIONS.items():
        last_seen = _SECTOR_LAST_SEEN.get(sector_id, simulated_now - timedelta(hours=3))
        silence_hours = max(0.0, (simulated_now - last_seen).total_seconds() / 3600.0)

        # Baseline rate for lost events estimation
        baseline = compute_expected_baseline(sector_id, "telecom_call_rate", simulated_now.hour)
        expected_lost = round(baseline.expected_mean * silence_hours, 1)

        params = SECTOR_PHYSICS_PARAMS.get(sector_id, {})
        landslide_risk = params.get("landslide_susceptibility", 0.5)
        bridge_severed = params.get("bridge_severed", False)

        if silence_hours >= 3.0:
            severity = "PROLONGED_BLACKOUT"
        elif silence_hours >= 1.5:
            severity = "CRITICAL_SILENCE"
        elif silence_hours >= 0.75:
            severity = "ELEVATED_WATCH"
        else:
            severity = "NORMAL"

        windows.append(
            SilenceWindowItem(
                sector_id=sector_id,
                sector_name=loc_info.name,
                last_signal_timestamp=last_seen,
                silence_duration_hours=round(silence_hours, 2),
                expected_events_lost=expected_lost,
                silence_severity=severity,
                landslide_risk=landslide_risk,
                bridge_severed=bridge_severed,
            )
        )

    # Sort descending by silence severity and duration
    windows.sort(key=lambda w: w.silence_duration_hours, reverse=True)
    return windows


def get_negative_evidence_overview(
    simulated_now: Optional[datetime] = None,
) -> NegativeEvidenceOverviewResponse:
    """Consolidated negative evidence intelligence briefing."""
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)

    anomalies = detect_negative_evidence_anomalies(simulated_now)
    windows = get_all_silence_windows(simulated_now)
    critical_count = sum(1 for w in windows if w.silence_severity in ("CRITICAL_SILENCE", "PROLONGED_BLACKOUT"))

    return NegativeEvidenceOverviewResponse(
        simulated_time=simulated_now,
        active_anomalies_count=len(anomalies),
        critical_silent_sectors_count=critical_count,
        anomalies=anomalies,
        silence_windows=windows,
    )
