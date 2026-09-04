"""Per-location aggregation and situational status determination with Human-in-the-Loop & Bias Detection."""

from datetime import datetime, timezone
import math
from typing import Optional, Any
from dataclasses import dataclass, field

from app.config import settings
from app.pipeline.gazetteer import LocationInfo, get_all_locations, get_location_by_id
from app.pipeline.clustering import ReportItem, ClusterItem, cluster_reports
from app.pipeline.scoring import compute_report_score, score_cluster


@dataclass
class BiasAnalysisInfo:
    informal_report_pct: float
    official_report_pct: float
    bias_flag: str  # INFORMAL_SKEW_HIGH, OFFICIALLY_CONFIRMED, BALANCED, BLACKOUT_NO_TELEMETRY
    explanation: str


@dataclass
class AccountableOfficerInfo:
    name: str
    agency: str
    role: str
    contact_channel: str
    last_attestation: Optional[datetime] = None


@dataclass
class AggregatedLocationStatus:
    location_id: str
    location_name: str
    lat: float
    lon: float
    status: str  # "verified_safe", "verified_damaged", "unverified", "blackout", "investigating"
    confidence_score: float
    report_count: int
    incident_cluster_count: int
    last_update: Optional[datetime] = None
    silence_duration_hours: Optional[float] = None
    top_incidents: list[ClusterItem] = field(default_factory=list)
    status_reason: str = ""
    operator_override: Optional[dict[str, Any]] = None
    accountable_officer: Optional[AccountableOfficerInfo] = None
    bias_analysis: Optional[BiasAnalysisInfo] = None
    human_safe_confirmation_required: bool = False


@dataclass
class LocationVerificationRankItem:
    location_id: str
    location_name: str
    rank: int
    urgency_score: float
    silence_duration_hours: float
    estimated_exposed_population: int
    structural_vulnerability_index: float
    recommended_recon_sortie: str
    primary_reason: str


SECTOR_OFFICER_REGISTRY: dict[str, AccountableOfficerInfo] = {
    "gorkha": AccountableOfficerInfo(
        name="DSP Bikram Basnet",
        agency="Armed Police Force (APF) - No. 29 Battalion Gorkha",
        role="Epicenter Tactical Sector Lead",
        contact_channel="VHF Ch-04 / SAT-GORKHA-01",
    ),
    "sindhupalchok": AccountableOfficerInfo(
        name="Major Anita Adhikari",
        agency="Nepal Army - 14th Brigade Chautara",
        role="High-Altitude Ridgeline Commander",
        contact_channel="VHF Ch-06 / HF-CORRIDOR-2",
    ),
    "kathmandu": AccountableOfficerInfo(
        name="SSP Rajan Shrestha",
        agency="Nepal Police - Valley Crisis Command Singha Durbar",
        role="Metropolitan High-Density Lead",
        contact_channel="Tetra Trunking / Hotline 100",
    ),
    "bhaktapur": AccountableOfficerInfo(
        name="DSP Prakash KC",
        agency="Nepal Police - Bhaktapur District Command",
        role="Heritage & Dense Masonry Lead",
        contact_channel="VHF Ch-02 / NEOC-08",
    ),
    "rasuwa": AccountableOfficerInfo(
        name="Captain Deepak Rana",
        agency="Armed Police Force (APF) - Dhunche Border Security",
        role="Mountain Landslide Isolation Lead",
        contact_channel="SAT-RASUWA-09 / VHF Ch-11",
    ),
    "nuwakot": AccountableOfficerInfo(
        name="DSP Suman Pokharel",
        agency="Nepal Police - Bidur Territorial Division",
        role="Mid-Hills Access Corridor Lead",
        contact_channel="VHF Ch-03 / Landline Backup",
    ),
    "dolakha": AccountableOfficerInfo(
        name="Inspector Kamala Gurung",
        agency="Nepal Police - Charikot Operations Center",
        role="Eastern Seismic Corridor Lead",
        contact_channel="VHF Ch-07 / SAT-DOLAKHA-04",
    ),
    "sindhuli": AccountableOfficerInfo(
        name="DSP Arjun Thapa",
        agency="Armed Police Force (APF) - Kamalamai Unit",
        role="Highway Lifeline & Transit Lead",
        contact_channel="BP Highway VHF Repeater Ch-05",
    ),
}

SECTOR_DEMOGRAPHICS: dict[str, dict[str, Any]] = {
    "gorkha": {"exposed_pop": 271061, "vulnerability": 0.88, "recon": "VTOL UAV High-Altitude Recon & APF Forward Patrol"},
    "sindhupalchok": {"exposed_pop": 287798, "vulnerability": 0.94, "recon": "Satellite SAR Interferometry & Mountain Tactical Patrol"},
    "kathmandu": {"exposed_pop": 2041587, "vulnerability": 0.55, "recon": "Metropolitan Drone Survey & Police Motor Recon"},
    "bhaktapur": {"exposed_pop": 432132, "vulnerability": 0.72, "recon": "Heritage Core Quadcopter & APF Triage Team"},
    "rasuwa": {"exposed_pop": 43300, "vulnerability": 0.91, "recon": "Helicopter Landslide Survey & LoRa IoT Probe"},
    "nuwakot": {"exposed_pop": 263391, "vulnerability": 0.79, "recon": "APF Highway Patrol & Drone Bridge Inspection"},
    "dolakha": {"exposed_pop": 186557, "vulnerability": 0.85, "recon": "Satellite High-Res Optical & Local Palika Sat-Phone"},
    "sindhuli": {"exposed_pop": 296201, "vulnerability": 0.65, "recon": "BP Highway Mobile Recon & VHF Radio Sweep"},
}


def compute_bias_analysis(reports: list[ReportItem]) -> BiasAnalysisInfo:
    """Detect informal smartphone vs official first-responder distribution to guard against urban connectivity bias."""
    if not reports:
        return BiasAnalysisInfo(
            informal_report_pct=0.0,
            official_report_pct=0.0,
            bias_flag="BLACKOUT_NO_TELEMETRY",
            explanation="No incoming telemetry from this sector. Total communication gap.",
        )

    informal_count = sum(1 for r in reports if r.source_type in ("citizen", "social_media"))
    official_count = sum(1 for r in reports if r.source_type in ("police", "hospital"))
    total = len(reports)

    informal_pct = round((informal_count / total) * 100.0, 1)
    official_pct = round((official_count / total) * 100.0, 1)

    if official_count >= 1:
        flag = "OFFICIALLY_CONFIRMED"
        explanation = f"Ground truth corroborated by {official_count} official first-responder report(s)."
    elif informal_pct >= 85.0:
        flag = "INFORMAL_SKEW_HIGH"
        explanation = "High reliance on informal smartphone/social streams. Risk may be underestimated in cut-off pockets without 4G connectivity."
    else:
        flag = "BALANCED"
        explanation = "Mixed multi-source telemetry without critical skew."

    return BiasAnalysisInfo(
        informal_report_pct=informal_pct,
        official_report_pct=official_pct,
        bias_flag=flag,
        explanation=explanation,
    )


def aggregate_location(
    location: LocationInfo,
    reports: list[ReportItem],
    simulated_now: Optional[datetime] = None,
    blackout_silence_hours: float = settings.BLACKOUT_SILENCE_HOURS,
    half_life_hours: float = settings.DECAY_HALF_LIFE_HOURS,
    verified_threshold: float = settings.VERIFIED_CONFIDENCE_THRESHOLD,
    operator_override: Optional[dict[str, Any]] = None,
) -> AggregatedLocationStatus:
    """
    Compute situational awareness status for a single location given its visible reports at simulated_now.
    Enforces strict Human-in-the-Loop policy: AI never auto-declares 'verified_safe' without human confirmation.
    """
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)
    elif simulated_now.tzinfo is None:
        simulated_now = simulated_now.replace(tzinfo=timezone.utc)

    officer_info = SECTOR_OFFICER_REGISTRY.get(location.id.lower(), AccountableOfficerInfo(
        name="Operations Commander",
        agency="NEOC Central Crisis Command",
        role="Sector Lead",
        contact_channel="NEOC Hotline",
    ))

    # Filter reports belonging to this location
    loc_reports = [
        r for r in reports
        if r.resolved_location_id and r.resolved_location_id.lower() == location.id.lower()
    ]
    report_count = len(loc_reports)
    bias_info = compute_bias_analysis(loc_reports)

    # 1. Check for Blackout (No reports at all, or silence window exceeded)
    if report_count == 0:
        base_status = "blackout"
        status_reason = "Complete communication blackout: No reports received for this sector."
        effective_status = operator_override.get("override_status", base_status) if operator_override else base_status
        return AggregatedLocationStatus(
            location_id=location.id,
            location_name=location.name,
            lat=location.lat,
            lon=location.lon,
            status=effective_status,
            confidence_score=0.0,
            report_count=0,
            incident_cluster_count=0,
            last_update=None,
            silence_duration_hours=None,
            top_incidents=[],
            status_reason=status_reason,
            operator_override=operator_override,
            accountable_officer=officer_info,
            bias_analysis=bias_info,
            human_safe_confirmation_required=False,
        )

    # Find the most recent report timestamp
    timestamps = [
        r.timestamp if r.timestamp.tzinfo else r.timestamp.replace(tzinfo=timezone.utc)
        for r in loc_reports
    ]
    last_update = max(timestamps)
    silence_seconds = max(0.0, (simulated_now - last_update).total_seconds())
    silence_hours = round(silence_seconds / 3600.0, 2)

    # If the time since last report exceeds blackout threshold -> Blackout
    if silence_hours > blackout_silence_hours:
        clusters = cluster_reports(loc_reports)
        for c in clusters:
            score_cluster(c, simulated_now=simulated_now, half_life_hours=half_life_hours)
        sorted_clusters = sorted(clusters, key=lambda c: c.confidence_score, reverse=True)

        base_status = "blackout"
        status_reason = f"Silence window exceeded ({silence_hours:.1f}h > {blackout_silence_hours:.1f}h threshold). Potential communication failure or isolated sector."
        effective_status = operator_override.get("override_status", base_status) if operator_override else base_status

        return AggregatedLocationStatus(
            location_id=location.id,
            location_name=location.name,
            lat=location.lat,
            lon=location.lon,
            status=effective_status,
            confidence_score=round(max((c.confidence_score for c in clusters), default=0.0) * 0.5, 4),
            report_count=report_count,
            incident_cluster_count=len(clusters),
            last_update=last_update,
            silence_duration_hours=silence_hours,
            top_incidents=sorted_clusters[:3],
            status_reason=status_reason,
            operator_override=operator_override,
            accountable_officer=officer_info,
            bias_analysis=bias_info,
            human_safe_confirmation_required=False,
        )

    # 2. Deduplicate & Cluster Reports
    clusters = cluster_reports(loc_reports)
    for c in clusters:
        score_cluster(c, simulated_now=simulated_now, half_life_hours=half_life_hours)
    sorted_clusters = sorted(clusters, key=lambda c: c.confidence_score, reverse=True)

    location_confidence = round(sorted_clusters[0].confidence_score, 4) if sorted_clusters else 0.0

    # 3. Categorize damage vs safe clusters
    damage_clusters = [c for c in sorted_clusters if c.damage_type not in ("safe_clear", "unspecified")]
    safe_clusters = [c for c in sorted_clusters if c.damage_type == "safe_clear"]

    max_damage_conf = max((c.confidence_score for c in damage_clusters), default=0.0)
    max_safe_conf = max((c.confidence_score for c in safe_clusters), default=0.0)

    human_safe_required = False

    if max_damage_conf >= verified_threshold:
        base_status = "verified_damaged"
        top_dmg = damage_clusters[0]
        cas_text = f" (casualties: ~{top_dmg.casualty_estimate})" if top_dmg.casualty_estimate else ""
        status_reason = (
            f"High-confidence verified damage ({max_damage_conf:.2f} >= {verified_threshold:.2f}): "
            f"{top_dmg.damage_type.capitalize()} incidents corroborated across {top_dmg.report_count} reports{cas_text}."
        )
    elif max_safe_conf >= verified_threshold and max_damage_conf < 0.40:
        # HUMAN-IN-THE-LOOP SAFETY GUARDRAIL:
        # Never auto-declare safe without explicit operator confirmation
        if operator_override and operator_override.get("confirmed_safe"):
            base_status = "verified_safe"
            status_reason = (
                f"Operator Confirmed Safe ({max_safe_conf:.2f} confidence): "
                f"Sector confirmed clear by {operator_override.get('operator_name', 'Duty Commander')}."
            )
        else:
            base_status = "unverified"
            human_safe_required = True
            status_reason = (
                f"Safe/Clear signals detected ({max_safe_conf:.2f} confidence). "
                f"Safety Policy Guardrail: Awaiting mandatory human operator confirmation before declaring sector safe."
            )
    else:
        base_status = "unverified"
        if max_damage_conf > 0:
            status_reason = (
                f"Unverified situation: Damage reports present but confidence ({max_damage_conf:.2f}) "
                f"below verification threshold ({verified_threshold:.2f}). Needs reconnaissance."
            )
        else:
            status_reason = (
                f"Unverified situation: Sparse or ambiguous reports with overall confidence ({location_confidence:.2f}) "
                f"below verification threshold ({verified_threshold:.2f})."
            )

    effective_status = operator_override.get("override_status", base_status) if operator_override else base_status

    return AggregatedLocationStatus(
        location_id=location.id,
        location_name=location.name,
        lat=location.lat,
        lon=location.lon,
        status=effective_status,
        confidence_score=location_confidence,
        report_count=report_count,
        incident_cluster_count=len(clusters),
        last_update=last_update,
        silence_duration_hours=silence_hours,
        top_incidents=sorted_clusters[:5],
        status_reason=status_reason,
        operator_override=operator_override,
        accountable_officer=officer_info,
        bias_analysis=bias_info,
        human_safe_confirmation_required=human_safe_required,
    )


def compute_verification_ranking(aggregated_statuses: list[AggregatedLocationStatus]) -> list[LocationVerificationRankItem]:
    """
    Ranks locations by 'where should we verify next' rather than just static status.
    Prioritizes: Long silence + high exposed population + high structural fragility + lack of official ground truth.
    """
    ranked_items: list[tuple[float, LocationVerificationRankItem]] = []

    for agg in aggregated_statuses:
        demo = SECTOR_DEMOGRAPHICS.get(agg.location_id.lower(), {"exposed_pop": 100000, "vulnerability": 0.70, "recon": "APF Ground Patrol"})
        silence = agg.silence_duration_hours if agg.silence_duration_hours is not None else 24.0
        exposed_pop = demo["exposed_pop"]
        fragility = demo["vulnerability"]

        # Non-saturating status severity weight mapping
        status_severity = {
            "blackout": 1.00,
            "unverified": 0.75,
            "investigating": 0.50,
            "verified_damaged": 0.35,
            "verified_safe": 0.05,
        }.get(agg.status, 0.50)

        # Logarithmic population exposure scaling: 1k -> ~0.50, 50k -> ~0.78, 1M+ -> 1.00
        pop_weight = min(1.0, max(0.10, math.log10(max(1000.0, float(exposed_pop))) / 6.0))
        silence_weight = min(1.0, max(0.0, silence / 12.0))
        fragility_weight = min(1.0, max(0.10, float(fragility)))

        # Bounded Urgency Score [5.0 - 99.5] ensuring dynamic variance across all sectors
        # Weights: 30% silence, 30% population exposure, 25% structural fragility, 15% status severity
        raw_score = (
            (0.30 * silence_weight) +
            (0.30 * pop_weight) +
            (0.25 * fragility_weight) +
            (0.15 * status_severity)
        ) * 100.0

        urgency_score = round(min(99.5, max(5.0, raw_score)), 1)

        if agg.status == "blackout":
            reason = f"Critical {silence:.1f}h communication blackout with high structural fragility ({fragility:.2f}) and {exposed_pop:,} exposed residents."
        elif agg.status == "unverified":
            reason = f"Ambiguous informal telemetry ({agg.report_count} reports). Awaiting official physical verification."
        else:
            reason = f"Sector monitoring active under {agg.status} status."

        item = LocationVerificationRankItem(
            location_id=agg.location_id,
            location_name=agg.location_name,
            rank=0,
            urgency_score=urgency_score,
            silence_duration_hours=silence,
            estimated_exposed_population=exposed_pop,
            structural_vulnerability_index=fragility,
            recommended_recon_sortie=demo["recon"],
            primary_reason=reason,
        )
        ranked_items.append((urgency_score, item))

    # Sort descending by urgency score
    ranked_items.sort(key=lambda x: x[0], reverse=True)

    final_ranking: list[LocationVerificationRankItem] = []
    for rank_idx, (_, item) in enumerate(ranked_items, start=1):
        item.rank = rank_idx
        final_ranking.append(item)

    return final_ranking


def aggregate_all_locations(
    reports: list[ReportItem],
    simulated_now: Optional[datetime] = None,
    blackout_silence_hours: float = settings.BLACKOUT_SILENCE_HOURS,
    half_life_hours: float = settings.DECAY_HALF_LIFE_HOURS,
    overrides_by_location: Optional[dict[str, dict[str, Any]]] = None,
) -> list[AggregatedLocationStatus]:
    """Compute aggregated statuses for all 8 fixed Nepal locations with optional operator overrides."""
    all_locs = get_all_locations()
    results: list[AggregatedLocationStatus] = []
    overrides = overrides_by_location or {}

    for loc in all_locs:
        loc_override = overrides.get(loc.id.lower())
        agg = aggregate_location(
            location=loc,
            reports=reports,
            simulated_now=simulated_now,
            blackout_silence_hours=blackout_silence_hours,
            half_life_hours=half_life_hours,
            operator_override=loc_override,
        )
        results.append(agg)

    return results
