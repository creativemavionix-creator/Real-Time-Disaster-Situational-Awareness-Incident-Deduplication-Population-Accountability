"""Unit tests for location status aggregation logic."""

from datetime import datetime, timedelta, timezone
import pytest
from app.pipeline.gazetteer import LOCATIONS
from app.pipeline.clustering import ReportItem
from app.pipeline.aggregator import aggregate_location


def test_blackout_no_reports():
    loc = LOCATIONS["rasuwa"]
    t0 = datetime(2026, 8, 30, 6, 0, tzinfo=timezone.utc)
    
    status = aggregate_location(location=loc, reports=[], simulated_now=t0)
    assert status.status == "blackout"
    assert status.report_count == 0
    assert status.confidence_score == 0.0


def test_blackout_silence_window_exceeded():
    loc = LOCATIONS["rasuwa"]
    t0 = datetime(2026, 8, 30, 6, 0, tzinfo=timezone.utc)
    
    # Report received at T+1h
    r = ReportItem(
        id=1,
        source_type="citizen",
        raw_text="Violent shaking in Dhunche Rasuwa",
        reported_lat=28.15,
        reported_lon=85.30,
        timestamp=t0 + timedelta(hours=1),
        resolved_location_id="rasuwa",
        location_resolved_by="text_keyword",
        extracted_casualties=None,
        extracted_damage_type="structural",
        confidence_hint=0.6,
    )
    
    # Current simulated time is T+6h (5h since last report > 3h blackout window)
    t_now = t0 + timedelta(hours=6)
    status = aggregate_location(location=loc, reports=[r], simulated_now=t_now, blackout_silence_hours=3.0)
    
    assert status.status == "blackout"
    assert status.silence_duration_hours >= 5.0
    assert "silence window exceeded" in status.status_reason.lower()


def test_verified_damaged():
    loc = LOCATIONS["sindhupalchok"]
    t0 = datetime(2026, 8, 30, 6, 0, tzinfo=timezone.utc)
    
    r1 = ReportItem(
        id=1,
        source_type="police",
        raw_text="Police confirms Melamchi river bridge collapsed and road cut off, 2 dead",
        reported_lat=27.95,
        reported_lon=85.70,
        timestamp=t0 + timedelta(minutes=15),
        resolved_location_id="sindhupalchok",
        location_resolved_by="text_keyword",
        extracted_casualties=2,
        extracted_damage_type="road/bridge",
        confidence_hint=0.9,
    )
    r2 = ReportItem(
        id=2,
        source_type="hospital",
        raw_text="Chautara hospital receiving 8 injured from Melamchi landslide",
        reported_lat=27.95,
        reported_lon=85.70,
        timestamp=t0 + timedelta(minutes=25),
        resolved_location_id="sindhupalchok",
        location_resolved_by="text_keyword",
        extracted_casualties=8,
        extracted_damage_type="landslide",
        confidence_hint=0.95,
    )

    t_now = t0 + timedelta(minutes=30)
    status = aggregate_location(location=loc, reports=[r1, r2], simulated_now=t_now)

    assert status.status == "verified_damaged"
    assert status.confidence_score >= 0.60
    assert status.report_count == 2
    assert len(status.top_incidents) >= 1


def test_verified_safe():
    loc = LOCATIONS["bhaktapur"]
    t0 = datetime(2026, 8, 30, 6, 0, tzinfo=timezone.utc)
    
    r1 = ReportItem(
        id=1,
        source_type="police",
        raw_text="Bhaktapur police patrol: Durbar square and surrounding structures inspected, all clear, 0 casualties.",
        reported_lat=27.67,
        reported_lon=85.42,
        timestamp=t0 + timedelta(minutes=20),
        resolved_location_id="bhaktapur",
        location_resolved_by="text_keyword",
        extracted_casualties=0,
        extracted_damage_type="safe_clear",
        confidence_hint=0.9,
    )
    r2 = ReportItem(
        id=2,
        source_type="hospital",
        raw_text="Bhaktapur Hospital confirms normal operations. No earthquake casualties or injuries admitted, verified safe.",
        reported_lat=27.67,
        reported_lon=85.42,
        timestamp=t0 + timedelta(minutes=30),
        resolved_location_id="bhaktapur",
        location_resolved_by="text_keyword",
        extracted_casualties=0,
        extracted_damage_type="safe_clear",
        confidence_hint=0.95,
    )

    t_now = t0 + timedelta(minutes=40)
    status = aggregate_location(location=loc, reports=[r1, r2], simulated_now=t_now)

    assert status.status == "verified_safe"
    assert status.confidence_score >= 0.60


def test_unverified():
    loc = LOCATIONS["sindhuli"]
    t0 = datetime(2026, 8, 30, 6, 0, tzinfo=timezone.utc)
    
    # Single unconfirmed social media rumor
    r = ReportItem(
        id=1,
        source_type="social_media",
        raw_text="Someone on BP Highway near Sindhuli said they saw smoke or dust. Is there a landslide?",
        reported_lat=None,
        reported_lon=None,
        timestamp=t0 + timedelta(minutes=10),
        resolved_location_id="sindhuli",
        location_resolved_by="text_keyword",
        extracted_casualties=None,
        extracted_damage_type="landslide",
        confidence_hint=0.4,
    )

    t_now = t0 + timedelta(minutes=20)
    status = aggregate_location(location=loc, reports=[r], simulated_now=t_now)

    assert status.status == "unverified"
    assert status.confidence_score < 0.60
