"""Incident deduplication and clustering using cosine distance on sentence embeddings."""

from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional
import numpy as np
from sklearn.cluster import AgglomerativeClustering, DBSCAN

from app.config import settings
from app.pipeline.embedder import embed_text, deserialize_embedding


@dataclass
class ReportItem:
    id: int
    source_type: str
    raw_text: str
    reported_lat: Optional[float]
    reported_lon: Optional[float]
    timestamp: datetime
    resolved_location_id: Optional[str]
    location_resolved_by: str
    extracted_casualties: Optional[int]
    extracted_damage_type: str
    confidence_hint: float
    embedding: Optional[list[float]] = None
    # Computed during scoring
    score_breakdown: Optional[dict[str, Any]] = None
    cluster_id: Optional[int] = None


@dataclass
class ClusterItem:
    cluster_id: int
    location_id: str
    reports: list[ReportItem] = field(default_factory=list)
    representative_text: str = ""
    damage_type: str = "unspecified"
    casualty_estimate: Optional[int] = None
    report_count: int = 0
    sources_breakdown: dict[str, int] = field(default_factory=dict)
    confidence_score: float = 0.0
    first_reported: Optional[datetime] = None
    last_reported: Optional[datetime] = None


def cluster_reports(
    reports: list[ReportItem],
    distance_threshold: float = settings.COSINE_DISTANCE_THRESHOLD
) -> list[ClusterItem]:
    """
    Cluster a list of reports belonging to the same location based on cosine distance.
    Cosine similarity >= 0.75 implies cosine distance <= 0.25.
    Returns a list of ClusterItem instances with aggregated metadata.
    """
    if not reports:
        return []
        
    if len(reports) == 1:
        # Single report forms its own cluster
        r = reports[0]
        r.cluster_id = 1
        return [_build_cluster(cluster_id=1, reports=[r])]

    # Prepare embedding matrix
    embeddings: list[list[float]] = []
    for r in reports:
        if r.embedding is None:
            r.embedding = embed_text(r.raw_text)
        embeddings.append(r.embedding)
        
    emb_matrix = np.array(embeddings, dtype=np.float32)
    
    # Normalize vectors to ensure valid cosine metric
    norms = np.linalg.norm(emb_matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    normalized_matrix = emb_matrix / norms
    
    # Perform clustering using DBSCAN or AgglomerativeClustering with cosine distance
    try:
        # DBSCAN with eps=0.25 (1 - similarity 0.75), min_samples=1 so everything is clustered
        clustering = DBSCAN(eps=distance_threshold, min_samples=1, metric="cosine")
        labels = clustering.fit_predict(normalized_matrix)
    except Exception:
        try:
            # Fallback to AgglomerativeClustering
            agg = AgglomerativeClustering(
                n_clusters=None,
                distance_threshold=distance_threshold,
                metric="cosine",
                linkage="average"
            )
            labels = agg.fit_predict(normalized_matrix)
        except Exception:
            # Absolute fallback: sequential similarity matching
            labels = _greedy_cosine_cluster(normalized_matrix, 1.0 - distance_threshold)

    # Group reports by label
    cluster_map: dict[int, list[ReportItem]] = {}
    for idx, label in enumerate(labels):
        cid = int(label) + 1  # 1-indexed cluster id
        reports[idx].cluster_id = cid
        cluster_map.setdefault(cid, []).append(reports[idx])
        
    # Build ClusterItem objects
    clusters: list[ClusterItem] = []
    for cid, members in sorted(cluster_map.items()):
        clusters.append(_build_cluster(cluster_id=cid, reports=members))
        
    return clusters


def _greedy_cosine_cluster(vectors: np.ndarray, sim_threshold: float = 0.75) -> list[int]:
    """Greedy sequential cosine clustering fallback."""
    labels = [-1] * len(vectors)
    current_label = 0
    for i in range(len(vectors)):
        if labels[i] != -1:
            continue
        labels[i] = current_label
        for j in range(i + 1, len(vectors)):
            if labels[j] == -1:
                sim = np.dot(vectors[i], vectors[j])
                if sim >= sim_threshold:
                    labels[j] = current_label
        current_label += 1
    return labels


def _build_cluster(cluster_id: int, reports: list[ReportItem]) -> ClusterItem:
    """Aggregate cluster properties, find representative report and consensus tags."""
    assert len(reports) > 0
    location_id = reports[0].resolved_location_id or "unresolved"
    
    # Sources breakdown
    sources_count = Counter(r.source_type for r in reports)
    
    # Representative report selection:
    # Prefer reports from higher trust sources (hospital/police > citizen > social_media),
    # then longer descriptive text.
    trust_order = {"hospital": 4, "police": 3, "citizen": 2, "social_media": 1}
    sorted_reps = sorted(
        reports,
        key=lambda r: (
            trust_order.get(r.source_type, 0),
            len(r.raw_text.strip()),
            r.extracted_damage_type != "unspecified"
        ),
        reverse=True
    )
    representative_text = sorted_reps[0].raw_text
    
    # Aggregate damage type (most frequent non-unspecified, or most severe)
    damage_types = [r.extracted_damage_type for r in reports if r.extracted_damage_type != "unspecified"]
    if damage_types:
        most_common_damage = Counter(damage_types).most_common(1)[0][0]
    else:
        most_common_damage = "unspecified"
        
    # Aggregate casualty estimate (maximum credible casualty estimate reported in cluster)
    cas_list = [r.extracted_casualties for r in reports if r.extracted_casualties is not None]
    casualty_estimate = max(cas_list) if cas_list else None
    
    # Timestamps
    timestamps = [r.timestamp for r in reports if r.timestamp is not None]
    first_reported = min(timestamps) if timestamps else datetime.utcnow()
    last_reported = max(timestamps) if timestamps else datetime.utcnow()
    
    return ClusterItem(
        cluster_id=cluster_id,
        location_id=location_id,
        reports=reports,
        representative_text=representative_text,
        damage_type=most_common_damage,
        casualty_estimate=casualty_estimate,
        report_count=len(reports),
        sources_breakdown=dict(sources_count),
        confidence_score=0.0,  # Will be populated during scoring
        first_reported=first_reported,
        last_reported=last_reported
    )
