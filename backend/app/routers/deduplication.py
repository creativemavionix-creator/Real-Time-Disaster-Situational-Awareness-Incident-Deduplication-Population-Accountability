"""API router for Multi-Agency Deduplication & Unified Truth resolution."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.db import ReportDB
from app.models.schemas import (
    UnifiedTruthResponse,
    UnifiedTruthRecord,
    AgencyReportBreakdown,
)
from app.pipeline.gazetteer import get_all_locations
from app.pipeline.clustering import ReportItem, cluster_reports
from app.pipeline.embedder import deserialize_embedding
from app.pipeline.scoring import score_cluster
from app.simulation.clock import get_simulated_time
from app.pipeline.satellite_evidence import find_satellite_evidence
from app.pipeline.before_after_engine import get_before_after_showcase

router = APIRouter(prefix="/deduplication", tags=["Unified Truth & Deduplication"])


def _db_to_report_item(r: ReportDB) -> ReportItem:
    emb = deserialize_embedding(r.embedding_json)
    return ReportItem(
        id=r.id,
        source_type=r.source_type,
        raw_text=r.raw_text,
        reported_lat=r.reported_lat,
        reported_lon=r.reported_lon,
        timestamp=r.timestamp,
        resolved_location_id=r.resolved_location_id,
        location_resolved_by=r.location_resolved_by,
        extracted_casualties=r.extracted_casualties,
        extracted_damage_type=r.extracted_damage_type,
        confidence_hint=r.confidence_hint,
        embedding=emb,
    )


@router.get("/unified-truth", response_model=UnifiedTruthResponse, summary="Get multi-agency deduplicated unified truth ledger")
def get_unified_truth(
    sim_time: Optional[datetime] = Query(default=None, description="Optional simulated time override"),
    db: Session = Depends(get_db),
):
    """
    Cross-reference reports from Police, Hospitals, Citizens, and Social Media to establish
    a single corroborated unified truth record, cross-validated against UNOSAT and Sentinel satellite evidence.
    """
    effective_time = sim_time or get_simulated_time(db)
    db_reports = db.query(ReportDB).filter(ReportDB.timestamp <= effective_time).all()
    report_items = [_db_to_report_item(r) for r in db_reports]

    all_locs = get_all_locations()
    unified_records: list[UnifiedTruthRecord] = []
    disputed_count = 0
    corroborated_count = 0

    trust_weights = {"hospital": 0.95, "police": 0.90, "citizen": 0.60, "social_media": 0.35}

    global_cluster_id = 1
    for loc in all_locs:
        loc_reports = [r for r in report_items if r.resolved_location_id == loc.id]
        if not loc_reports:
            continue

        clusters = cluster_reports(loc_reports)
        for cluster in clusters:
            score_cluster(cluster, simulated_now=effective_time)

            # Analyze agency breakdowns
            agency_map: dict[str, list[int]] = {}
            valid_lats: list[float] = []
            valid_lons: list[float] = []

            for r in cluster.reports:
                cas = r.extracted_casualties if r.extracted_casualties is not None else -1
                agency_map.setdefault(r.source_type, []).append(cas)
                if r.reported_lat is not None:
                    valid_lats.append(r.reported_lat)
                if r.reported_lon is not None:
                    valid_lons.append(r.reported_lon)

            # Calculate cluster centroid
            c_lat = sum(valid_lats) / len(valid_lats) if valid_lats else loc.lat
            c_lon = sum(valid_lons) / len(valid_lons) if valid_lons else loc.lon

            # Remote sensing satellite cross-validation
            sat_evidence = find_satellite_evidence(lat=c_lat, lon=c_lon, sector_id=loc.id, radius_km=4.0)

            breakdowns: list[AgencyReportBreakdown] = []
            all_valid_cas: list[int] = []

            for src, claims in agency_map.items():
                valid = [c for c in claims if c >= 0]
                all_valid_cas.extend(valid)
                consensus = max(valid) if valid else None
                breakdowns.append(
                    AgencyReportBreakdown(
                        source_type=src,
                        report_count=len(claims),
                        trust_weight=trust_weights.get(src, 0.5),
                        casualty_claims=[c for c in claims if c >= 0],
                        consensus_claim=consensus,
                    )
                )

            # Determine conflict / dispute
            unique_claims = set(all_valid_cas)
            has_conflicts = len(unique_claims) > 1
            min_cas = min(unique_claims) if unique_claims else 0
            max_cas = max(unique_claims) if unique_claims else 0

            confidence = round(cluster.confidence_score, 2)
            if has_conflicts:
                disputed_count += 1
                conflict_summary = f"Casualty variance detected across {len(breakdowns)} sources ({min_cas} to {max_cas} reported). Hospital records prioritized."
                v_status = "disputed_variance"
            elif len(breakdowns) >= 2 or sat_evidence["satellite_corroborated"]:
                corroborated_count += 1
                conflict_summary = "Multi-agency consensus established with zero conflicting claims."
                v_status = "multi_source_corroborated"
            else:
                conflict_summary = "Single-source report awaiting secondary agency corroboration."
                v_status = "single_source_pending"

            # Weighted consensus calculation
            if breakdowns:
                weighted_sum = 0.0
                total_weight = 0.0
                for b in breakdowns:
                    if b.consensus_claim is not None:
                        w = b.trust_weight * b.report_count
                        weighted_sum += b.consensus_claim * w
                        total_weight += w
                unified_cas = round(weighted_sum / total_weight) if total_weight > 0 else (cluster.casualty_estimate or 0)
            else:
                unified_cas = cluster.casualty_estimate or 0

            unified_records.append(
                UnifiedTruthRecord(
                    cluster_id=global_cluster_id,
                    sector_id=loc.id,
                    sector_name=loc.name,
                    consensus_damage_type=cluster.damage_type,
                    unified_casualty_estimate=unified_cas,
                    casualty_dispute_range=(min_cas, max_cas),
                    has_conflicts=has_conflicts,
                    conflict_summary=conflict_summary,
                    agency_breakdown=breakdowns,
                    confidence_score=confidence,
                    representative_truth_text=cluster.representative_text,
                    verification_status=v_status,
                    satellite_corroborated=sat_evidence["satellite_corroborated"],
                    satellite_damage_points_count=sat_evidence["satellite_damage_points_count"],
                    satellite_sensor_source=sat_evidence["sensor_source"],
                    satellite_evidence_summary=sat_evidence["satellite_evidence_summary"],
                )
            )
            global_cluster_id += 1

    # Standardize sort order descending by casualty impact & confidence
    unified_records.sort(key=lambda r: (r.unified_casualty_estimate, r.confidence_score), reverse=True)

    return UnifiedTruthResponse(
        simulated_time=effective_time,
        total_clusters=len(unified_records),
        disputed_clusters_count=disputed_count,
        corroborated_clusters_count=corroborated_count,
        unified_records=unified_records,
    )


@router.get("/before-after-showcase", summary="Get 20 raw chaotic messages condensed into 3 prioritized rescue tasks")
def get_before_after_demo():
    """
    Demonstrates the end-to-end AI pipeline transforming 20 messy, duplicated, spelling-error laden
    messages into 3 actionable rescue directives.
    """
    return get_before_after_showcase()
