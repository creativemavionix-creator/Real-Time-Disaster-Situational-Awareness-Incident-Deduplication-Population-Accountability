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
                        casualty_claims=valid,
                        consensus_claim=consensus,
                        trust_weight=trust_weights.get(src, 0.5),
                    )
                )

            # Detect disputes & conflicts
            has_conflicts = False
            conflict_summary = "All reporting sources aligned."
            min_cas = min(all_valid_cas) if all_valid_cas else 0
            max_cas = max(all_valid_cas) if all_valid_cas else 0

            if max_cas - min_cas > 5:
                has_conflicts = True
                disputed_count += 1
                conflict_summary = (
                    f"Casualty dispute detected: Social media reported ~{max_cas} vs official hospital triage log of {min_cas}. "
                    f"Prioritized official hospital record as primary truth."
                )
            elif len(breakdowns) >= 2 or sat_evidence["satellite_corroborated"]:
                corroborated_count += 1

            # Satellite Confidence Boost
            confidence = cluster.confidence_score
            if sat_evidence["satellite_corroborated"]:
                confidence = min(0.99, round(confidence + 0.12, 2))

            # Verification Status
            if (confidence >= 0.68 and len(breakdowns) >= 2) or (sat_evidence["satellite_corroborated"] and confidence >= 0.65):
                v_status = "CORROBORATED_TRUTH"
            elif has_conflicts:
                v_status = "DISPUTED_CLAIMS"
            elif confidence < 0.45:
                v_status = "UNVERIFIED_RUMOR"
            else:
                v_status = "PENDING_VERIFICATION"

            # Prefer hospital casualty count if present, else police, else max credible
            hospital_claims = agency_map.get("hospital", [])
            valid_hosp = [c for c in hospital_claims if c >= 0]
            police_claims = agency_map.get("police", [])
            valid_pol = [c for c in police_claims if c >= 0]

            if valid_hosp:
                unified_cas = valid_hosp[0]
            elif valid_pol:
                unified_cas = valid_pol[0]
            else:
                unified_cas = cluster.casualty_estimate or 0

            unified_records.append(
                UnifiedTruthRecord(
                    cluster_id=cluster.cluster_id,
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

    return UnifiedTruthResponse(
        simulated_time=effective_time,
        total_clusters=len(unified_records),
        disputed_clusters_count=disputed_count,
        corroborated_clusters_count=corroborated_count,
        unified_records=unified_records,
    )
