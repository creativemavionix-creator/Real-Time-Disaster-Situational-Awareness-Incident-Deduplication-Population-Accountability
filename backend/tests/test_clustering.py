"""Unit tests for embedding deduplication and incident clustering."""

from datetime import datetime, timezone
import pytest
from app.pipeline.clustering import ReportItem, cluster_reports


def test_clustering_near_duplicates():
    t0 = datetime(2026, 8, 30, 6, 30, tzinfo=timezone.utc)
    
    # 3 duplicate reports of the same bridge collapse in Melamchi
    r1 = ReportItem(
        id=1,
        source_type="citizen",
        raw_text="Concrete bridge collapsed in Melamchi Sindhupalchok due to heavy river flooding!",
        reported_lat=27.95,
        reported_lon=85.70,
        timestamp=t0,
        resolved_location_id="sindhupalchok",
        location_resolved_by="text_keyword",
        extracted_casualties=2,
        extracted_damage_type="road/bridge",
        confidence_hint=0.8,
    )
    r2 = ReportItem(
        id=2,
        source_type="police",
        raw_text="Sindhupalchok police confirms Melamchi river bridge collapsed under flash flood waters, 2 injured.",
        reported_lat=27.95,
        reported_lon=85.70,
        timestamp=t0,
        resolved_location_id="sindhupalchok",
        location_resolved_by="text_keyword",
        extracted_casualties=2,
        extracted_damage_type="road/bridge",
        confidence_hint=0.9,
    )
    r3 = ReportItem(
        id=3,
        source_type="social_media",
        raw_text="Melamchi bridge washed away by flood in Sindhupalchok! Road cut off!",
        reported_lat=None,
        reported_lon=None,
        timestamp=t0,
        resolved_location_id="sindhupalchok",
        location_resolved_by="text_keyword",
        extracted_casualties=None,
        extracted_damage_type="road/bridge",
        confidence_hint=0.6,
    )
    
    clusters = cluster_reports([r1, r2, r3])
    
    # All 3 should cluster together into 1 incident cluster
    assert len(clusters) == 1
    c = clusters[0]
    assert c.report_count == 3
    assert c.location_id == "sindhupalchok"
    assert c.damage_type == "road/bridge"
    assert c.casualty_estimate == 2
    assert c.sources_breakdown == {"citizen": 1, "police": 1, "social_media": 1}
    # Police text or descriptive text should be preferred representative
    assert "police" in c.representative_text.lower() or "collapsed" in c.representative_text.lower()


def test_clustering_distinct_events():
    t0 = datetime(2026, 8, 30, 7, 0, tzinfo=timezone.utc)
    
    # Event 1: Building collapse
    r1 = ReportItem(
        id=1,
        source_type="citizen",
        raw_text="Four-story commercial building collapsed in New Road Kathmandu, people trapped in rubble!",
        reported_lat=27.7172,
        reported_lon=85.3240,
        timestamp=t0,
        resolved_location_id="kathmandu",
        location_resolved_by="text_keyword",
        extracted_casualties=5,
        extracted_damage_type="structural",
        confidence_hint=0.8,
    )
    
    # Event 2: Transformer fire
    r2 = ReportItem(
        id=2,
        source_type="citizen",
        raw_text="Electrical transformer fire explosion in Thamel Kathmandu, thick black smoke spreading across roofs!",
        reported_lat=27.7172,
        reported_lon=85.3240,
        timestamp=t0,
        resolved_location_id="kathmandu",
        location_resolved_by="text_keyword",
        extracted_casualties=0,
        extracted_damage_type="fire",
        confidence_hint=0.8,
    )
    
    clusters = cluster_reports([r1, r2])
    
    # Distinct events should form 2 separate clusters
    assert len(clusters) == 2
    damage_types = {c.damage_type for c in clusters}
    assert "structural" in damage_types
    assert "fire" in damage_types


def test_clustering_empty_and_single():
    assert cluster_reports([]) == []
    
    r = ReportItem(
        id=1,
        source_type="police",
        raw_text="Inspection completed, all clear.",
        reported_lat=27.67,
        reported_lon=85.42,
        timestamp=datetime.now(timezone.utc),
        resolved_location_id="bhaktapur",
        location_resolved_by="text_keyword",
        extracted_casualties=0,
        extracted_damage_type="safe_clear",
        confidence_hint=0.9,
    )
    clusters = cluster_reports([r])
    assert len(clusters) == 1
    assert clusters[0].report_count == 1
