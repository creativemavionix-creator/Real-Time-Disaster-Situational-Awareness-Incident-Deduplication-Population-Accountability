"""Explainable reliability scoring and staleness decay calculation."""

import math
from datetime import datetime, timezone
from typing import Optional

from app.config import settings
from app.pipeline.clustering import ReportItem, ClusterItem


def compute_report_score(
    report: ReportItem,
    cluster_size: int = 1,
    simulated_now: Optional[datetime] = None,
    half_life_hours: float = settings.DECAY_HALF_LIFE_HOURS,
    source_weights: Optional[dict[str, float]] = None,
    coord_bonus_val: float = settings.COORDINATE_BONUS,
) -> dict:
    """
    Compute transparent, explainable reliability score for a single report.
    Returns a dictionary of all contributing factors and final effective score.
    """
    if source_weights is None:
        source_weights = settings.SOURCE_WEIGHTS
        
    if simulated_now is None:
        simulated_now = datetime.now(timezone.utc)
    elif simulated_now.tzinfo is None:
        simulated_now = simulated_now.replace(tzinfo=timezone.utc)
        
    rep_time = report.timestamp
    if rep_time.tzinfo is None:
        rep_time = rep_time.replace(tzinfo=timezone.utc)
        
    # 1. Source Trust Weight
    source_weight = source_weights.get(report.source_type.lower(), 0.50)
    
    # 2. Coordinates Bonus (if raw GPS coordinates provided vs text-inferred)
    has_coords = report.reported_lat is not None and report.reported_lon is not None
    coord_bonus = coord_bonus_val if has_coords else 0.0
    
    # 3. Cluster Corroboration Bonus (diminishing returns with log2)
    if cluster_size > 1:
        corroboration_bonus = min(
            settings.CORROBORATION_MAX_BONUS,
            settings.CORROBORATION_SCALE_FACTOR * math.log2(cluster_size)
        )
    else:
        corroboration_bonus = 0.0
        
    # 4. Base Score (Pre-decay)
    # Combine source trust + coord bonus, scaled by corroboration
    raw_base = (source_weight + coord_bonus) * (1.0 + corroboration_bonus)
    base_score = min(1.0, max(0.0, raw_base))
    
    # 5. Staleness Decay (Exponential Half-Life)
    elapsed_seconds = max(0.0, (simulated_now - rep_time).total_seconds())
    elapsed_hours = elapsed_seconds / 3600.0
    
    decay_constant = 0.69314718056  # ln(2)
    staleness_decay = math.exp(-decay_constant * (elapsed_hours / half_life_hours))
    
    # 6. Effective Score
    effective_score = min(1.0, max(0.0, base_score * staleness_decay))
    
    formula_explanation = (
        f"base_score = min(1.0, (source_weight({source_weight:.2f}) + coord_bonus({coord_bonus:.2f})) "
        f"* (1.0 + corroboration_bonus({corroboration_bonus:.2f}))) = {base_score:.3f}; "
        f"staleness_decay = exp(-ln(2) * {elapsed_hours:.1f}h / {half_life_hours:.1f}h) = {staleness_decay:.3f}; "
        f"effective_score = {effective_score:.3f}"
    )
    
    breakdown = {
        "source_trust_weight": round(source_weight, 4),
        "has_coordinates_bonus": round(coord_bonus, 4),
        "corroboration_bonus": round(corroboration_bonus, 4),
        "base_score": round(base_score, 4),
        "elapsed_hours": round(elapsed_hours, 2),
        "staleness_decay": round(staleness_decay, 4),
        "effective_score": round(effective_score, 4),
        "formula_explanation": formula_explanation,
    }
    
    report.score_breakdown = breakdown
    return breakdown


def score_cluster(
    cluster: ClusterItem,
    simulated_now: Optional[datetime] = None,
    half_life_hours: float = settings.DECAY_HALF_LIFE_HOURS,
) -> float:
    """
    Score all reports in a cluster and compute the overall cluster confidence score.
    """
    if not cluster.reports:
        cluster.confidence_score = 0.0
        return 0.0
        
    cluster_size = len(cluster.reports)
    
    effective_scores: list[float] = []
    for r in cluster.reports:
        bd = compute_report_score(
            report=r,
            cluster_size=cluster_size,
            simulated_now=simulated_now,
            half_life_hours=half_life_hours,
        )
        effective_scores.append(bd["effective_score"])
        
    # Cluster confidence combines:
    # 1. The highest effective individual score in the cluster (anchor)
    # 2. Corroboration boost from multiple distinct sources
    max_individual = max(effective_scores) if effective_scores else 0.0
    
    # Source diversity bonus: if multiple different source types reported this
    distinct_sources_count = len(cluster.sources_breakdown)
    source_diversity_bonus = 0.05 * (distinct_sources_count - 1) if distinct_sources_count > 1 else 0.0
    
    # Corroboration volume boost with diminishing returns
    volume_boost = 0.06 * math.log2(cluster_size) if cluster_size > 1 else 0.0
    
    combined = max_individual + source_diversity_bonus + volume_boost
    cluster_confidence = min(1.0, max(0.0, combined))
    
    cluster.confidence_score = round(cluster_confidence, 4)
    return cluster.confidence_score
