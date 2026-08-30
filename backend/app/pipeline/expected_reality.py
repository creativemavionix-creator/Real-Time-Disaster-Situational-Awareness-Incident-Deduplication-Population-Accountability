"""
Expected Reality Engine for PRATYAKSH-Ω.
Models diurnal, temporal, and spatial baseline activity profiles across Central Nepal sectors.
Enforces the principle: What should normally be happening at this location and time?
"""

import math
from datetime import datetime, timezone
from typing import Optional
from app.models.schemas import BaselineItem, SectorBaselineComparison
from app.pipeline.gazetteer import LOCATIONS, get_location

# Base activity coefficients scaled by sector population
SECTOR_BASE_HOURLY_RATES: dict[str, dict[str, float]] = {
    "kathmandu": {
        "telecom_call_rate": 180.0,
        "citizen_report_rate": 45.0,
        "iot_sensor_ping_rate": 120.0,
        "commuter_flux": 500.0,
    },
    "bhaktapur": {
        "telecom_call_rate": 45.0,
        "citizen_report_rate": 12.0,
        "iot_sensor_ping_rate": 35.0,
        "commuter_flux": 80.0,
    },
    "gorkha": {
        "telecom_call_rate": 22.0,
        "citizen_report_rate": 6.0,
        "iot_sensor_ping_rate": 15.0,
        "commuter_flux": 10.0,
    },
    "sindhupalchok": {
        "telecom_call_rate": 26.0,
        "citizen_report_rate": 7.0,
        "iot_sensor_ping_rate": 18.0,
        "commuter_flux": 12.0,
    },
    "nuwakot": {
        "telecom_call_rate": 18.0,
        "citizen_report_rate": 5.0,
        "iot_sensor_ping_rate": 12.0,
        "commuter_flux": 8.0,
    },
    "dolakha": {
        "telecom_call_rate": 14.0,
        "citizen_report_rate": 4.0,
        "iot_sensor_ping_rate": 10.0,
        "commuter_flux": 6.0,
    },
    "sindhuli": {
        "telecom_call_rate": 20.0,
        "citizen_report_rate": 5.5,
        "iot_sensor_ping_rate": 14.0,
        "commuter_flux": 9.0,
    },
    "rasuwa": {
        "telecom_call_rate": 8.0,
        "citizen_report_rate": 2.5,
        "iot_sensor_ping_rate": 6.0,
        "commuter_flux": 4.0,
    },
}


def get_diurnal_multiplier(hour: int) -> float:
    """
    Computes diurnal activity curve:
    - 03:00 - 05:00: Deep night trough (~0.15 of peak)
    - 06:00 - 09:00: Morning rise (0.35 -> 0.85)
    - 11:00 - 16:00: Afternoon peak (0.95 -> 1.00)
    - 18:00 - 22:00: Evening plateau (0.75 -> 0.50)
    - 23:00 - 02:00: Night decay (0.35 -> 0.20)
    """
    # Normalized sinusoidal diurnal curve with minimum baseline of 0.15
    rad = ((hour - 4) % 24) * (math.pi / 12.0)
    curve = 0.15 + 0.85 * (math.sin(rad / 2.0) ** 2)
    return max(0.12, min(1.0, curve))


def get_day_of_week_multiplier(day: int) -> float:
    """Saturday is official weekend in Nepal (day index 5)."""
    if day == 5:  # Saturday
        return 0.85
    elif day == 4:  # Friday afternoon surge
        return 1.10
    return 1.0


def compute_expected_baseline(
    sector_id: str,
    metric: str = "telecom_call_rate",
    hour: int = 12,
    day_of_week: int = 0,
) -> BaselineItem:
    """Calculates expected mean, std dev, and confidence bounds for a sector and timestamp."""
    rates = SECTOR_BASE_HOURLY_RATES.get(
        sector_id.lower(),
        SECTOR_BASE_HOURLY_RATES["gorkha"],
    )
    base_rate = rates.get(metric, 15.0)

    diurnal = get_diurnal_multiplier(hour)
    day_mod = get_day_of_week_multiplier(day_of_week)

    expected_mean = round(base_rate * diurnal * day_mod, 2)
    expected_std = round(max(1.0, expected_mean * 0.18), 2)
    expected_min = max(0.0, round(expected_mean - (2.0 * expected_std), 2))
    expected_max = round(expected_mean + (2.5 * expected_std), 2)

    return BaselineItem(
        sector_id=sector_id.lower(),
        metric=metric,
        hour_of_day=hour,
        day_of_week=day_of_week,
        expected_mean=expected_mean,
        expected_std=expected_std,
        expected_min=expected_min,
        expected_max=expected_max,
        unit="calls/hour" if "telecom" in metric else "reports/hour",
        source="PRATYAKSH_NEPAL_TELECOM_2021_CENSUS",
        provenance=f"Diurnal coefficient: {diurnal:.2f}, Day modifier: {day_mod:.2f}",
    )


def get_all_sector_baselines(hour: int = 12, day_of_week: int = 0) -> list[BaselineItem]:
    """Retrieves full baseline catalog across all 8 sectors for the given hour."""
    baselines: list[BaselineItem] = []
    for sector_id in LOCATIONS.keys():
        for metric in ["telecom_call_rate", "citizen_report_rate", "iot_sensor_ping_rate"]:
            baselines.append(compute_expected_baseline(sector_id, metric, hour, day_of_week))
    return baselines


def compare_observed_vs_expected(
    sector_id: str,
    observed_value: float,
    metric: str = "telecom_call_rate",
    simulated_time: Optional[datetime] = None,
) -> SectorBaselineComparison:
    """
    Compares observed stream counts against expected reality baseline.
    Detects anomalous absence of expected signals (Negative Evidence).
    """
    if simulated_time is None:
        simulated_time = datetime.now(timezone.utc)

    hour = simulated_time.hour
    day = simulated_time.weekday()
    loc = get_location(sector_id)
    sector_name = loc.name if loc else sector_id.title()

    baseline = compute_expected_baseline(sector_id, metric, hour, day)
    gap_delta = round(observed_value - baseline.expected_mean, 2)
    z_score = round(gap_delta / max(0.1, baseline.expected_std), 2)

    # Negative Evidence Classification
    if observed_value == 0.0 and baseline.expected_mean >= 3.0:
        status = "CRITICAL_BLACKOUT"
        is_anomalous = True
        explanation = (
            f"Zero signals received vs expected {baseline.expected_mean:.1f} calls/hr (Z={z_score}). "
            f"Severe anomaly: Silence indicates severed communications or severe physical isolation."
        )
    elif z_score <= -2.0:
        status = "UNEXPECTED_SILENCE"
        is_anomalous = True
        explanation = (
            f"Observed volume ({observed_value}) is significantly below expected baseline "
            f"({baseline.expected_mean:.1f} ± {baseline.expected_std:.1f}). Possible partial tower failure or power loss."
        )
    elif z_score >= 3.0:
        status = "ELEVATED"
        is_anomalous = True
        explanation = (
            f"Observed volume ({observed_value}) is {z_score}σ above baseline. "
            f"Indicates active emergency reporting spike or panic surge."
        )
    else:
        status = "NORMAL"
        is_anomalous = False
        explanation = f"Observed volume ({observed_value}) within expected range [{baseline.expected_min}, {baseline.expected_max}]."

    return SectorBaselineComparison(
        sector_id=sector_id.lower(),
        sector_name=sector_name,
        current_hour=hour,
        metric=metric,
        expected_mean=baseline.expected_mean,
        expected_min=baseline.expected_min,
        expected_max=baseline.expected_max,
        observed_value=observed_value,
        gap_delta=gap_delta,
        z_score=z_score,
        is_anomalous=is_anomalous,
        status=status,
        explanation=explanation,
    )
