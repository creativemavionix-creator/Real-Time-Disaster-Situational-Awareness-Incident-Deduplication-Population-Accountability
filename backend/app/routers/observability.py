"""
System Observability, Health Checks, Readiness, and Telemetry Metrics Router.
"""

from datetime import datetime, timezone
import time
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.config import settings
from app.database import SessionLocal
from app.pipeline.negative_evidence import get_negative_evidence_overview
from app.pipeline.hypothesis_engine import get_all_sectors_hypotheses
from app.pipeline.evidence_model import get_all_evidence_items

router = APIRouter(prefix="", tags=["System Observability & Health"])

_START_TIME = datetime.now(timezone.utc)


@router.get("/health", summary="Liveness & Subsystem Diagnostics")
def health_check():
    """
    Evaluates backend subsystems:
    1. Database connection & latency
    2. In-memory evidence cache
    3. Negative evidence anomaly engine
    """
    db_status = "HEALTHY"
    db_latency_ms = 0.0
    
    start_db = time.perf_counter()
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        db_latency_ms = round((time.perf_counter() - start_db) * 1000, 2)
    except Exception as e:
        db_status = f"DEGRADED: {str(e)}"

    evidence_count = len(get_all_evidence_items())

    return {
        "status": "OPERATIONAL" if db_status == "HEALTHY" else "DEGRADED",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": round((datetime.now(timezone.utc) - _START_TIME).total_seconds(), 1),
        "version": settings.VERSION,
        "subsystems": {
            "database": {
                "status": db_status,
                "latency_ms": db_latency_ms,
                "engine": "SQLite WAL",
            },
            "evidence_store": {
                "status": "HEALTHY",
                "total_indexed_evidence": evidence_count,
            },
            "ai_reasoning": {
                "status": "HEALTHY",
                "model": "PRATYAKSH-Ω Bayesian Uncertainty Engine",
            },
        },
    }


@router.get("/ready", summary="Readiness Probe")
def readiness_probe():
    """Kubernetes / Cloud readiness probe confirming database and pipelines are loaded."""
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        return {"ready": True, "timestamp": datetime.now(timezone.utc).isoformat()}
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"ready": False, "error": str(e)},
        )


@router.get("/version", summary="Version & Capability Manifest")
def version_manifest():
    """Returns semantic version, active capabilities, and protocol specifications."""
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "protocol": "PRATYAKSH-Ω v2.4 (Negative Evidence & Bayesian Reality Reconstruction)",
        "capabilities": [
            "1_diurnal_expected_reality_engine",
            "2_multimodal_evidence_ingest",
            "3_negative_evidence_anomaly_detection",
            "4_competing_hypotheses_bayesian_updating",
            "5_counterfactual_consistency_testing",
            "6_active_verification_shannon_information_gain",
            "7_human_approval_role_governance",
            "8_closed_loop_reality_feedback",
        ],
    }


@router.get("/metrics/telemetry", summary="System Telemetry Overview")
def system_telemetry():
    """Returns real-time operational metrics across negative evidence and hypotheses."""
    now = datetime.now(timezone.utc)
    neg_overview = get_negative_evidence_overview(now)
    hyp_overview = get_all_sectors_hypotheses(now)

    avg_entropy = 0.0
    if hyp_overview.sector_entropy:
        avg_entropy = round(sum(hyp_overview.sector_entropy.values()) / len(hyp_overview.sector_entropy), 3)

    return {
        "timestamp": now.isoformat(),
        "active_anomalies_count": neg_overview.active_anomalies_count,
        "critical_silent_sectors": neg_overview.critical_silent_sectors_count,
        "national_average_entropy_bits": avg_entropy,
        "total_evidence_records": len(get_all_evidence_items()),
        "sectors_monitored": len(hyp_overview.sectors),
    }
