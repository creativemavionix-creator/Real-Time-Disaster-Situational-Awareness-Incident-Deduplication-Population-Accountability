"""
Telemetry & Silent Zone Engine for PRATYAKSH-Ω.
Implements Requirement 4: Silent Zone Detection and Telemetry Comparison.
Compares Historical Baseline vs Expected vs Observed evidence across 4 concrete lifelines:
1. Mobile Connectivity (cellular towers, call attempts, BTS uptime)
2. Electricity Grid (substation load MW, feeder status, outage duration)
3. Internet Availability (ISP fiber uplinks, packet loss %, latency)
4. Road Accessibility (arterial corridor passability %, bridge status, choke blockages)
"""

import math
from datetime import datetime, timezone
from typing import Optional, Literal, Any
from pydantic import BaseModel, Field

from app.pipeline.gazetteer import LOCATIONS, get_location
from app.pipeline.expected_reality import get_diurnal_multiplier


class LifelineMetricComparison(BaseModel):
    lifeline_type: Literal["mobile_connectivity", "electricity_grid", "internet_availability", "road_accessibility"]
    metric_label: str
    unit: str
    historical_baseline: float
    expected_value: float
    observed_value: float
    gap_percentage: float
    z_score: float
    status: str  # "OPERATIONAL", "DEGRADED", "CRITICAL_OUTAGE", "TOTAL_SEVERANCE"
    explanation: str


class SectorTelemetryComparison(BaseModel):
    sector_id: str
    sector_name: str
    simulated_time: str
    mobile: LifelineMetricComparison
    electricity: LifelineMetricComparison
    internet: LifelineMetricComparison
    road: LifelineMetricComparison
    overall_observed_reports: int
    expected_hourly_reports: float
    silent_zone_risk_score: float  # 0.0 to 10.0
    silent_zone_tier: Literal["NORMAL_TELEMETRY", "MODERATE_ANOMALY", "ELEVATED_SILENT_RISK", "CRITICAL_SILENT_ZONE"]
    is_silent_zone: bool
    negative_evidence_reason: str


# Static Sector Infrastructure Baseline Configuration
SECTOR_BASELINES: dict[str, dict[str, Any]] = {
    "gorkha": {
        "mobile_towers": 24,
        "mobile_baseline_pct": 98.5,
        "power_substations": 3,
        "power_baseline_mw": 14.5,
        "internet_baseline_mbps": 850.0,
        "road_arterials_total": 4,
        "base_hourly_reports": 6.0,
    },
    "rasuwa": {
        "mobile_towers": 16,
        "mobile_baseline_pct": 97.0,
        "power_substations": 2,
        "power_baseline_mw": 8.2,
        "internet_baseline_mbps": 420.0,
        "road_arterials_total": 2,
        "base_hourly_reports": 2.5,
    },
    "sindhupalchok": {
        "mobile_towers": 32,
        "mobile_baseline_pct": 98.0,
        "power_substations": 4,
        "power_baseline_mw": 18.0,
        "internet_baseline_mbps": 1100.0,
        "road_arterials_total": 4,
        "base_hourly_reports": 7.0,
    },
    "kathmandu": {
        "mobile_towers": 280,
        "mobile_baseline_pct": 99.8,
        "power_substations": 22,
        "power_baseline_mw": 145.0,
        "internet_baseline_mbps": 18500.0,
        "road_arterials_total": 18,
        "base_hourly_reports": 45.0,
    },
    "bhaktapur": {
        "mobile_towers": 64,
        "mobile_baseline_pct": 99.4,
        "power_substations": 6,
        "power_baseline_mw": 32.0,
        "internet_baseline_mbps": 3800.0,
        "road_arterials_total": 6,
        "base_hourly_reports": 12.0,
    },
    "nuwakot": {
        "mobile_towers": 28,
        "mobile_baseline_pct": 97.5,
        "power_substations": 3,
        "power_baseline_mw": 12.0,
        "internet_baseline_mbps": 780.0,
        "road_arterials_total": 4,
        "base_hourly_reports": 5.0,
    },
    "dolakha": {
        "mobile_towers": 22,
        "mobile_baseline_pct": 96.5,
        "power_substations": 3,
        "power_baseline_mw": 11.5,
        "internet_baseline_mbps": 650.0,
        "road_arterials_total": 3,
        "base_hourly_reports": 4.0,
    },
    "sindhuli": {
        "mobile_towers": 26,
        "mobile_baseline_pct": 97.8,
        "power_substations": 3,
        "power_baseline_mw": 13.0,
        "internet_baseline_mbps": 820.0,
        "road_arterials_total": 4,
        "base_hourly_reports": 5.5,
    },
}


# Disaster-Specific Degradation Multipliers [Mobile, Power, Internet, Road]
DISASTER_SECTOR_DEGRADATION: dict[str, dict[str, tuple[float, float, float, float]]] = {
    "earthquake": {
        "gorkha": (0.04, 0.00, 0.00, 0.15),       # Severe silent zone: BTS down, grid collapsed, fiber severed, road blocked
        "rasuwa": (0.06, 0.00, 0.00, 0.10),       # Severe silent zone: Total rockfall cutoff
        "sindhupalchok": (0.40, 0.25, 0.30, 0.35),# Damaged but intermittent
        "kathmandu": (0.75, 0.65, 0.70, 0.60),    # Shaken, high active reporting
        "bhaktapur": (0.70, 0.60, 0.65, 0.55),
        "nuwakot": (0.50, 0.40, 0.45, 0.40),
        "dolakha": (0.60, 0.50, 0.55, 0.50),
        "sindhuli": (0.85, 0.80, 0.85, 0.75),
    },
    "flash_flood": {
        "sindhupalchok": (0.08, 0.00, 0.00, 0.05), # Catastrophic: Bridges gone, riverside poles swept
        "nuwakot": (0.55, 0.45, 0.50, 0.40),
        "bhaktapur": (0.80, 0.75, 0.80, 0.65),
        "dolakha": (0.70, 0.60, 0.65, 0.55),
        "kathmandu": (0.95, 0.90, 0.92, 0.85),
        "gorkha": (0.90, 0.85, 0.88, 0.85),
        "rasuwa": (0.85, 0.80, 0.82, 0.75),
        "sindhuli": (0.60, 0.50, 0.55, 0.45),
    },
    "cyclone": {
        "sindhuli": (0.05, 0.00, 0.00, 0.20),      # Catastrophic: Gale storm center, pylon collapse, trees down
        "dolakha": (0.35, 0.20, 0.25, 0.35),
        "bhaktapur": (0.65, 0.50, 0.55, 0.50),
        "kathmandu": (0.70, 0.55, 0.60, 0.60),
        "nuwakot": (0.80, 0.75, 0.80, 0.70),
        "gorkha": (0.90, 0.85, 0.90, 0.85),
        "rasuwa": (0.85, 0.80, 0.85, 0.80),
        "sindhupalchok": (0.75, 0.65, 0.70, 0.60),
    },
    "landslide": {
        "rasuwa": (0.02, 0.00, 0.00, 0.00),        # Total Cleavage: Highway shelf sheared into 500m gorge
        "nuwakot": (0.45, 0.35, 0.40, 0.30),
        "gorkha": (0.75, 0.70, 0.75, 0.60),
        "sindhupalchok": (0.80, 0.75, 0.80, 0.70),
        "kathmandu": (0.95, 0.92, 0.95, 0.90),
        "bhaktapur": (0.95, 0.92, 0.95, 0.90),
        "dolakha": (0.85, 0.80, 0.85, 0.75),
        "sindhuli": (0.90, 0.85, 0.90, 0.85),
    },
    "urban_fire": {
        "kathmandu": (0.15, 0.10, 0.05, 0.10),     # Historic core firestorm: Rooftop cell melted, alleys blocked
        "bhaktapur": (0.70, 0.65, 0.70, 0.65),
        "gorkha": (0.98, 0.98, 0.98, 0.98),
        "rasuwa": (0.98, 0.98, 0.98, 0.98),
        "sindhupalchok": (0.98, 0.98, 0.98, 0.98),
        "nuwakot": (0.95, 0.95, 0.95, 0.95),
        "dolakha": (0.98, 0.98, 0.98, 0.98),
        "sindhuli": (0.98, 0.98, 0.98, 0.98),
    },
}


def compute_sector_telemetry(
    sector_id: str,
    disaster_type: str = "earthquake",
    simulated_now: Optional[datetime] = None,
    observed_reports_count: int = 0,
) -> SectorTelemetryComparison:
    """
    Computes rigorous Historical vs Expected vs Observed comparison for all 4 lifelines.
    Calculates the Silent Zone Risk Score based on signal gap and physical infrastructure collapse.
    """
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)

    hour = simulated_now.hour
    diurnal = get_diurnal_multiplier(hour)

    clean_sec = sector_id.lower().strip()
    clean_dis = disaster_type.lower().strip()
    if clean_dis not in DISASTER_SECTOR_DEGRADATION:
        clean_dis = "earthquake"

    base_cfg = SECTOR_BASELINES.get(clean_sec, SECTOR_BASELINES["gorkha"])
    loc_info = get_location(clean_sec)
    sec_name = loc_info.name if loc_info else clean_sec.title()

    deg_map = DISASTER_SECTOR_DEGRADATION[clean_dis]
    deg_tuple = deg_map.get(clean_sec, (0.80, 0.80, 0.80, 0.80))
    mob_factor, pwr_factor, net_factor, road_factor = deg_tuple

    # 1. Mobile Connectivity
    mob_hist = base_cfg["mobile_baseline_pct"]
    mob_exp = round(mob_hist * min(1.0, 0.95 + 0.05 * diurnal), 1)
    mob_obs = round(mob_exp * mob_factor, 1)
    mob_gap = round(((mob_exp - mob_obs) / mob_exp) * 100.0, 1)
    mob_z = round(-1.0 * (mob_gap / 20.0), 2)
    mob_status = "CRITICAL_OUTAGE" if mob_obs < 15.0 else "DEGRADED" if mob_obs < 70.0 else "OPERATIONAL"
    mob_expl = f"{round(mob_obs, 1)}% BTS operational ({int(base_cfg['mobile_towers'] * (mob_obs / 100.0))}/{base_cfg['mobile_towers']} towers active)."

    # 2. Electricity Grid
    pwr_hist = base_cfg["power_baseline_mw"]
    pwr_exp = round(pwr_hist * diurnal, 1)
    pwr_obs = round(pwr_exp * pwr_factor, 1)
    pwr_gap = round(((pwr_exp - pwr_obs) / max(0.1, pwr_exp)) * 100.0, 1)
    pwr_z = round(-1.0 * (pwr_gap / 20.0), 2)
    pwr_status = "TOTAL_SEVERANCE" if pwr_obs == 0 else "DEGRADED" if pwr_obs < (pwr_exp * 0.6) else "OPERATIONAL"
    pwr_expl = f"{round(pwr_obs, 1)} MW active draw across {base_cfg['power_substations']} substations."

    # 3. Internet Availability
    net_hist = base_cfg["internet_baseline_mbps"]
    net_exp = round(net_hist * diurnal, 1)
    net_obs = round(net_exp * net_factor, 1)
    net_gap = round(((net_exp - net_obs) / max(1.0, net_exp)) * 100.0, 1)
    net_z = round(-1.0 * (net_gap / 20.0), 2)
    net_status = "TOTAL_SEVERANCE" if net_obs == 0 else "DEGRADED" if net_obs < (net_exp * 0.5) else "OPERATIONAL"
    net_loss = 100.0 if net_obs == 0 else round((1.0 - net_factor) * 80.0, 1)
    net_expl = f"{round(net_obs, 1)} Mbps aggregate uplink ({net_loss}% packet loss)."

    # 4. Road Accessibility
    road_hist = 100.0
    road_exp = 100.0
    road_obs = round(100.0 * road_factor, 1)
    road_gap = round(100.0 - road_obs, 1)
    road_z = round(-1.0 * (road_gap / 20.0), 2)
    road_status = "TOTAL_SEVERANCE" if road_obs < 10.0 else "RESTRICTED" if road_obs < 75.0 else "OPERATIONAL"
    road_expl = f"{round(road_obs, 1)}% corridor passability across {base_cfg['road_arterials_total']} strategic highways."

    # Expected vs Observed Citizen & Sensor Reports
    exp_reports = round(base_cfg["base_hourly_reports"] * diurnal, 1)
    report_deficit = max(0.0, exp_reports - observed_reports_count)
    report_deficit_norm = min(1.0, report_deficit / max(1.0, exp_reports))

    # Rigorous Silent Zone Risk Score Formulation:
    # 30% reporting deficit + 25% mobile loss + 20% power loss + 15% fiber loss + 10% road cut
    raw_risk = (
        (0.30 * report_deficit_norm) +
        (0.25 * (1.0 - (mob_obs / max(1.0, mob_exp)))) +
        (0.20 * (1.0 - (pwr_obs / max(0.1, pwr_exp)))) +
        (0.15 * (1.0 - (net_obs / max(1.0, net_exp)))) +
        (0.10 * (1.0 - (road_obs / 100.0)))
    ) * 10.0

    silent_risk = min(10.0, max(0.0, round(raw_risk, 1)))

    if silent_risk >= 7.5:
        tier = "CRITICAL_SILENT_ZONE"
        reason = (
            f"Acute Telemetry Extinction: 0 incoming reports while mobile connectivity dropped {mob_gap}% "
            f"and power grid is at {pwr_obs} MW. High probability of catastrophic physical damage."
        )
        is_silent = True
    elif silent_risk >= 5.0:
        tier = "ELEVATED_SILENT_RISK"
        reason = (
            f"Significant Telemetry Deficit: Observed reports {observed_reports_count} vs expected {exp_reports}. "
            f"Lifelines degraded by ~{round((mob_gap + pwr_gap) / 2, 0)}%."
        )
        is_silent = True
    elif silent_risk >= 2.5:
        tier = "MODERATE_ANOMALY"
        reason = "Minor baseline variance in telemetry or reporting throughput."
        is_silent = False
    else:
        tier = "NORMAL_TELEMETRY"
        reason = "All 4 infrastructure vectors operating within normal expected confidence bounds."
        is_silent = False

    return SectorTelemetryComparison(
        sector_id=clean_sec,
        sector_name=sec_name,
        simulated_time=simulated_now.isoformat(),
        mobile=LifelineMetricComparison(
            lifeline_type="mobile_connectivity",
            metric_label="Cellular BTS Operational %",
            unit="%",
            historical_baseline=mob_hist,
            expected_value=mob_exp,
            observed_value=mob_obs,
            gap_percentage=mob_gap,
            z_score=mob_z,
            status=mob_status,
            explanation=mob_expl,
        ),
        electricity=LifelineMetricComparison(
            lifeline_type="electricity_grid",
            metric_label="Substation Load Draw",
            unit="MW",
            historical_baseline=pwr_hist,
            expected_value=pwr_exp,
            observed_value=pwr_obs,
            gap_percentage=pwr_gap,
            z_score=pwr_z,
            status=pwr_status,
            explanation=pwr_expl,
        ),
        internet=LifelineMetricComparison(
            lifeline_type="internet_availability",
            metric_label="ISP Gateway Bandwidth Throughput",
            unit="Mbps",
            historical_baseline=net_hist,
            expected_value=net_exp,
            observed_value=net_obs,
            gap_percentage=net_gap,
            z_score=net_z,
            status=net_status,
            explanation=net_expl,
        ),
        road=LifelineMetricComparison(
            lifeline_type="road_accessibility",
            metric_label="Highway Arterial Passability",
            unit="%",
            historical_baseline=road_hist,
            expected_value=road_exp,
            observed_value=road_obs,
            gap_percentage=road_gap,
            z_score=road_z,
            status=road_status,
            explanation=road_expl,
        ),
        overall_observed_reports=observed_reports_count,
        expected_hourly_reports=exp_reports,
        silent_zone_risk_score=silent_risk,
        silent_zone_tier=tier,
        is_silent_zone=is_silent,
        negative_evidence_reason=reason,
    )


def compute_all_sectors_telemetry(
    disaster_type: str = "earthquake",
    simulated_now: Optional[datetime] = None,
    observed_counts_by_sector: Optional[dict[str, int]] = None,
) -> list[SectorTelemetryComparison]:
    """Computes telemetry matrix for all 8 strategic sectors."""
    counts = observed_counts_by_sector or {}
    results = []
    for s_id in SECTOR_BASELINES.keys():
        obs_cnt = counts.get(s_id, 0)
        tele = compute_sector_telemetry(
            sector_id=s_id,
            disaster_type=disaster_type,
            simulated_now=simulated_now,
            observed_reports_count=obs_cnt,
        )
        results.append(tele)
    return results
