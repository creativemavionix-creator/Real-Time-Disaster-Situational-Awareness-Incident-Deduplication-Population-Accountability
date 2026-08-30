"""
Multi-Modal Evidence Model for PRATYAKSH-Ω.
Structures, normalizes, and indexes heterogeneous observations (human, IoT, telecom, satellite).
Tracks evidence direction (positive vs negative), freshness decay, reliability, and contradictions.
"""

import math
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from app.models.schemas import EvidenceItemSchema, MultiModalEvidenceIngest
from app.pipeline.gazetteer import LOCATIONS


# In-memory evidence cache for real-time hypothesis scoring
_EVIDENCE_STORE: list[EvidenceItemSchema] = []


def initialize_default_evidence_corpus():
    """Initializes the multi-modal evidence store with authentic and baseline calibrated observations."""
    global _EVIDENCE_STORE
    if _EVIDENCE_STORE:
        return

    now = datetime(2026, 8, 30, 9, 30, tzinfo=timezone.utc)

    sample_evidence = [
        # Gorkha Epicenter multi-modal evidence
        EvidenceItemSchema(
            evidence_id="EVD-GKH-001",
            sector_id="gorkha",
            source_type="telecom_cdr",
            source_id="NTC_BTS_BARPAK_01",
            timestamp=now - timedelta(hours=3, minutes=15),
            observation_type="signal_loss",
            observed_value=0.0,
            expected_value=24.0,
            raw_payload="BTS Tower #01 Barpak power loss telemetry: 0 active registrations.",
            direction="negative",
            reliability=0.95,
            freshness_weight=0.90,
            status="active",
            contradictions=[],
            provenance="NTC Cellular Core Telemetry Feed",
        ),
        EvidenceItemSchema(
            evidence_id="EVD-GKH-002",
            sector_id="gorkha",
            source_type="remote_sensing_sar",
            source_id="SENTINEL_1_SAR_IW_20150429",
            timestamp=now - timedelta(hours=2),
            observation_type="coherence_loss",
            observed_value=0.88,
            expected_value=0.15,
            raw_payload="Copernicus Sentinel-1 C-band SAR interferometric coherence loss = 0.88 across Barpak slopes.",
            direction="positive",
            reliability=0.92,
            freshness_weight=0.95,
            status="active",
            contradictions=[],
            provenance="ESA Copernicus Open Access Hub",
        ),
        EvidenceItemSchema(
            evidence_id="EVD-GKH-003",
            sector_id="gorkha",
            source_type="police_radio",
            source_id="APF_GORKHA_HQ",
            timestamp=now - timedelta(minutes=45),
            observation_type="road_blockage",
            observed_value=1.0,
            expected_value=0.0,
            raw_payload="APF Unit reports Prithvi Highway feeder road to Barpak severed by massive rockfall.",
            direction="positive",
            reliability=0.88,
            freshness_weight=0.98,
            status="active",
            contradictions=[],
            provenance="Armed Police Force VHF Log #114",
        ),
        # Sindhupalchok multi-modal evidence
        EvidenceItemSchema(
            evidence_id="EVD-SDP-001",
            sector_id="sindhupalchok",
            source_type="optical_satellite",
            source_id="UNOSAT_UNITAR_PLEIADES_01",
            timestamp=now - timedelta(hours=4),
            observation_type="bridge_severance",
            observed_value=1.0,
            expected_value=0.0,
            raw_payload="UNOSAT 0.5m GSD imagery confirms Melamchi river suspension bridge washed out.",
            direction="positive",
            reliability=0.96,
            freshness_weight=0.85,
            status="active",
            contradictions=[],
            provenance="UNOSAT UNITAR Damage Assessment",
        ),
        EvidenceItemSchema(
            evidence_id="EVD-SDP-002",
            sector_id="sindhupalchok",
            source_type="human_report",
            source_id="CITIZEN_SMS_984102",
            timestamp=now - timedelta(hours=1, minutes=10),
            observation_type="casualty_count",
            observed_value=15.0,
            expected_value=0.0,
            raw_payload="Chautara bazaar hospital overwhelmed, multiple masonry buildings collapsed.",
            direction="positive",
            reliability=0.65,
            freshness_weight=0.92,
            status="active",
            contradictions=[],
            provenance="Disaster SMS Ingestion Gateway",
        ),
        # Rasuwa multi-modal evidence
        EvidenceItemSchema(
            evidence_id="EVD-RSW-001",
            sector_id="rasuwa",
            source_type="telecom_cdr",
            source_id="NCELL_BTS_DHUNCHE",
            timestamp=now - timedelta(hours=5),
            observation_type="signal_loss",
            observed_value=0.0,
            expected_value=9.0,
            raw_payload="Zero cellular heartbeat from Langtang / Dhunche relay towers for >5 hours.",
            direction="negative",
            reliability=0.95,
            freshness_weight=0.80,
            status="active",
            contradictions=[],
            provenance="Ncell NOC Outage Alarm",
        ),
        # Kathmandu multi-modal evidence
        EvidenceItemSchema(
            evidence_id="EVD-KTM-001",
            sector_id="kathmandu",
            source_type="sensor_iot",
            source_id="USGS_STRONG_MOTION_KTM01",
            timestamp=now - timedelta(hours=3, minutes=30),
            observation_type="peak_ground_acceleration",
            observed_value=0.22,
            expected_value=0.01,
            raw_payload="USGS Strong Motion Station recorded PGA = 0.22g in Kathmandu clay basin.",
            direction="positive",
            reliability=0.99,
            freshness_weight=0.90,
            status="active",
            contradictions=[],
            provenance="USGS Global Seismographic Network",
        ),
    ]

    _EVIDENCE_STORE.extend(sample_evidence)


def ingest_evidence_item(payload: MultiModalEvidenceIngest) -> EvidenceItemSchema:
    """Ingests a new multi-modal observation and indexes it into the evidence store."""
    initialize_default_evidence_corpus()

    evd_id = f"EVD-{payload.sector_id[:3].upper()}-{uuid.uuid4().hex[:6].upper()}"
    ts = payload.timestamp or datetime.now(timezone.utc)

    item = EvidenceItemSchema(
        evidence_id=evd_id,
        sector_id=payload.sector_id.lower(),
        source_type=payload.source_type,
        source_id=payload.source_id,
        timestamp=ts,
        observation_type=payload.observation_type,
        observed_value=payload.observed_value,
        expected_value=payload.expected_value,
        raw_payload=payload.raw_payload,
        direction=payload.direction,
        reliability=max(0.1, min(1.0, payload.reliability)),
        freshness_weight=1.0,
        status="active",
        contradictions=[],
        provenance=f"Direct Ingestion via {payload.source_type}",
    )

    _EVIDENCE_STORE.insert(0, item)
    return item


def get_sector_evidence(
    sector_id: str,
    simulated_now: Optional[datetime] = None,
    include_stale: bool = True,
) -> list[EvidenceItemSchema]:
    """Retrieves all evidence items for a given sector with freshness weights computed."""
    initialize_default_evidence_corpus()
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)

    sector_items: list[EvidenceItemSchema] = []
    for ev in _EVIDENCE_STORE:
        if ev.sector_id.lower() == sector_id.lower():
            # Compute exponential freshness decay (lambda = 0.15 / hour)
            age_hours = max(0.0, (simulated_now - ev.timestamp).total_seconds() / 3600.0)
            freshness = max(0.2, math.exp(-0.15 * age_hours))
            
            status = ev.status
            if age_hours > 8.0 and status == "active":
                status = "stale"

            updated_ev = ev.model_copy(update={
                "freshness_weight": round(freshness, 3),
                "status": status,
            })
            if include_stale or status == "active":
                sector_items.append(updated_ev)

    return sector_items


def get_all_evidence(simulated_now: Optional[datetime] = None) -> list[EvidenceItemSchema]:
    """Retrieves all multi-modal evidence across all monitored sectors."""
    initialize_default_evidence_corpus()
    all_evs: list[EvidenceItemSchema] = []
    for loc_id in LOCATIONS.keys():
        all_evs.extend(get_sector_evidence(loc_id, simulated_now))
    return all_evs


get_all_evidence_items = get_all_evidence

