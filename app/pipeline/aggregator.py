"""Per-location aggregation and situational status determination."""

from datetime import datetime, timezone
from typing import Optional
from dataclasses import dataclass, field

from app.config import settings
from app.pipeline.gazetteer import LocationInfo, get_all_locations, get_location_by_id
from app.pipeline.clustering import ReportItem, ClusterItem, cluster_reports
from app.pipeline.scoring import compute_report_score, score_cluster


@dataclass
class AggregatedLocationStatus:
    location_id: str
    location_name: str
    lat: float
    lon: float
    status: str  # "verified_safe", "verified_damaged", "unverified", "blackout"
    confidence_score: float
    report_count: int
    incident_cluster_count: int
    last_update: Optional[datetime] = None
    silence_duration_hours: Optional[float] = None
    top_incidents: list[ClusterItem] = field(default_factory=list)
    status_reason: str = ""


def aggregate_location(
    location: LocationInfo,
    reports: list[ReportItem],
    simulated_now: Optional[datetime] = None,
    blackout_silence_hours: float = settings.BLACKOUT_SILENCE_HOURS,
    half_life_hours: float = settings.DECAY_HALF_LIFE_HOURS,
    verified_threshold: float = settings.VERIFIED_CONFIDENCE_THRESHOLD,
) -> AggregatedLocationStatus:
    """
    Compute situational awareness status for a single location given its visible reports at simulated_now.
    """
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)
    elif simulated_now.tzinfo is None:
        simulated_now = simulated_now.replace(tzinfo=timezone.utc)

    # Filter reports belonging to this location
    loc_reports = [
        r for r in reports
        if r.resolved_location_id and r.resolved_location_id.lower() == location.id.lower()
    ]
    
    report_count = len(loc_reports)

    # 1. Check for Blackout (No reports at all, or silence window exceeded)
    if report_count == 0:
        return AggregatedLocationStatus(
            location_id=location.id,
            location_name=location.name,
            lat=location.lat,
            lon=location.lon,
            status="blackout",
            confidence_score=0.0,
            report_count=0,
            incident_cluster_count=0,
            last_update=None,
            silence_duration_hours=None,
            top_incidents=[],
            status_reason="Complete communication blackout: No reports received for this location."
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
        # Cluster past reports anyway for historical context
        clusters = cluster_reports(loc_reports)
        for c in clusters:
            score_cluster(c, simulated_now=simulated_now, half_life_hours=half_life_hours)
        sorted_clusters = sorted(clusters, key=lambda c: c.confidence_score, reverse=True)

        return AggregatedLocationStatus(
            location_id=location.id,
            location_name=location.name,
            lat=location.lat,
            lon=location.lon,
            status="blackout",
            confidence_score=round(max((c.confidence_score for c in clusters), default=0.0) * 0.5, 4),
            report_count=report_count,
            incident_cluster_count=len(clusters),
            last_update=last_update,
            silence_duration_hours=silence_hours,
            top_incidents=sorted_clusters[:3],
            status_reason=f"Silence window exceeded ({silence_hours:.1f}h > {blackout_silence_hours:.1f}h threshold). Potential communication failure or isolated sector."
        )

    # 2. Deduplicate & Cluster Reports
    clusters = cluster_reports(loc_reports)
    
    # 3. Score all clusters with staleness decay
    for c in clusters:
        score_cluster(c, simulated_now=simulated_now, half_life_hours=half_life_hours)
        
    # Sort clusters by confidence descending
    sorted_clusters = sorted(clusters, key=lambda c: c.confidence_score, reverse=True)
    
    # Calculate overall location confidence
    if sorted_clusters:
        # Highest confidence cluster provides anchor, plus corroboration from other clusters
        top_conf = sorted_clusters[0].confidence_score
        location_confidence = round(top_conf, 4)
    else:
        location_confidence = 0.0

    # 4. Determine Situational Status (verified_safe vs verified_damaged vs unverified)
    # Check if there are damage reports vs safe/clear reports
    damage_clusters = [c for c in sorted_clusters if c.damage_type not in ("safe_clear", "unspecified")]
    safe_clusters = [c for c in sorted_clusters if c.damage_type == "safe_clear"]
    
    max_damage_conf = max((c.confidence_score for c in damage_clusters), default=0.0)
    max_safe_conf = max((c.confidence_score for c in safe_clusters), default=0.0)
    
    status: str
    status_reason: str
    
    if max_damage_conf >= verified_threshold:
        status = "verified_damaged"
        top_dmg = damage_clusters[0]
        cas_text = f" (casualties reported: ~{top_dmg.casualty_estimate})" if top_dmg.casualty_estimate else ""
        status_reason = (
            f"High-confidence verified damage ({max_damage_conf:.2f} >= {verified_threshold:.2f}): "
            f"{top_dmg.damage_type.capitalize()} incidents corroborated across {top_dmg.report_count} reports{cas_text}."
        )
    elif max_safe_conf >= verified_threshold and max_damage_conf < 0.40:
        status = "verified_safe"
        top_safe = safe_clusters[0]
        status_reason = (
            f"Verified safe/clear ({max_safe_conf:.2f} >= {verified_threshold:.2f}): "
            f"Official/corroborated reports confirm structure integrity and normal operations with no severe damage."
        )
    else:
        status = "unverified"
        if max_damage_conf > 0:
            status_reason = (
                f"Unverified situation: Damage reports present but confidence ({max_damage_conf:.2f}) "
                f"below verification threshold ({verified_threshold:.2f}). Needs further corroboration."
            )
        else:
            status_reason = (
                f"Unverified situation: Sparse or ambiguous reports with overall confidence ({location_confidence:.2f}) "
                f"below verification threshold ({verified_threshold:.2f})."
            )

    return AggregatedLocationStatus(
        location_id=location.id,
        location_name=location.name,
        lat=location.lat,
        lon=location.lon,
        status=status,
        confidence_score=location_confidence,
        report_count=report_count,
        incident_cluster_count=len(clusters),
        last_update=last_update,
        silence_duration_hours=silence_hours,
        top_incidents=sorted_clusters[:5],
        status_reason=status_reason
    )


def aggregate_all_locations(
    reports: list[ReportItem],
    simulated_now: Optional[datetime] = None,
    blackout_silence_hours: float = settings.BLACKOUT_SILENCE_HOURS,
    half_life_hours: float = settings.DECAY_HALF_LIFE_HOURS,
) -> list[AggregatedLocationStatus]:
    """Compute aggregated statuses for all 8 fixed Nepal locations."""
    all_locs = get_all_locations()
    results: list[AggregatedLocationStatus] = []
    
    for loc in all_locs:
        agg = aggregate_location(
            location=loc,
            reports=reports,
            simulated_now=simulated_now,
            blackout_silence_hours=blackout_silence_hours,
            half_life_hours=half_life_hours,
        )
        results.append(agg)
        
    return results
