"""Synthetic disaster dataset generator producing 250-350 realistic reports across 24 hours."""

import random
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.config import settings
from app.models.db import ReportDB
from app.pipeline.gazetteer import LOCATIONS, LocationInfo
from app.pipeline.extractor import extract_all
from app.pipeline.embedder import embed_text, serialize_embedding


def generate_synthetic_reports(start_time: Optional[datetime] = None) -> list[dict]:
    """
    Generate ~280 realistic, rich synthetic reports spanning 24 simulated hours.
    Covers duplication, contradictions, blackout transitions, safe confirmations,
    and coordinate variations.
    """
    if start_time is None:
        start_time = settings.SIMULATION_START_TIME
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)
        
    random.seed(42)  # Deterministic generation
    reports: list[dict] = []
    
    # -------------------------------------------------------------
    # 1. KATHMANDU (Valley Hub: Heavy initial damage, contradictory rumors, hospital reports)
    # -------------------------------------------------------------
    ktm_loc = LOCATIONS["kathmandu"]
    # Cluster A: New Road building collapse
    ktm_collapse_texts = [
        ("citizen", "Four-story commercial building collapsed in New Road near Bhotahiti, several people trapped in rubble!"),
        ("citizen", "Building down at New Road! People screaming, at least 10 people trapped under rubble, urgent help needed!"),
        ("social_media", "BREAKING: Huge building collapse in Kathmandu New Road! 50 people feared dead! #NepalEarthquake"),
        ("police", "Police unit at New Road Kathmandu. Commercial building collapsed. Search and rescue underway. 3 dead, 8 injured pulled out."),
        ("hospital", "Kathmandu Trauma Center receiving victims from New Road collapse. Confirmed 3 fatalities and 11 injured undergoing surgery."),
        ("citizen", "Rescue teams arrived at New Road Bhotahiti building collapse, pulling out survivors."),
    ]
    for i, (src, txt) in enumerate(ktm_collapse_texts):
        t = start_time + timedelta(hours=0.5 + (i * 0.4), minutes=random.randint(0, 15))
        reports.append({
            "source_type": src,
            "raw_text": txt,
            "reported_lat": ktm_loc.lat + random.uniform(-0.01, 0.01) if i % 2 == 0 else None,
            "reported_lon": ktm_loc.lon + random.uniform(-0.01, 0.01) if i % 2 == 0 else None,
            "timestamp": t
        })

    # Cluster B: Thamel electrical fire
    ktm_fire_texts = [
        ("social_media", "Fire broke out after transformer explosion in Thamel Kathmandu! Black smoke everywhere!"),
        ("citizen", "Electrical fire spreading near Thamel Chaksibari road after power poles snapped, fire trucks rushing!"),
        ("police", "Kathmandu Fire Brigade dispatched to Thamel electrical fire. Area cordoned off, 4 injured treated for smoke inhalation."),
    ]
    for i, (src, txt) in enumerate(ktm_fire_texts):
        t = start_time + timedelta(hours=2.0 + (i * 0.5), minutes=random.randint(0, 10))
        reports.append({
            "source_type": src,
            "raw_text": txt,
            "reported_lat": ktm_loc.lat + random.uniform(-0.015, 0.015) if src != "social_media" else None,
            "reported_lon": ktm_loc.lon + random.uniform(-0.015, 0.015) if src != "social_media" else None,
            "timestamp": t
        })

    # Continuous ongoing reports for Kathmandu across 24 hours
    for h in range(4, 24, 2):
        reports.append({
            "source_type": random.choice(["police", "hospital", "citizen"]),
            "raw_text": f"Kathmandu emergency operations update at T+{h}h: Emergency wards operating, {random.randint(1, 5)} injured admitted.",
            "reported_lat": ktm_loc.lat + random.uniform(-0.02, 0.02),
            "reported_lon": ktm_loc.lon + random.uniform(-0.02, 0.02),
            "timestamp": start_time + timedelta(hours=h, minutes=random.randint(5, 50))
        })

    # -------------------------------------------------------------
    # 2. SINDHUPALCHOK (Epicenter corridor: Severe landslides, bridge collapse)
    # -------------------------------------------------------------
    sdp_loc = LOCATIONS["sindhupalchok"]
    # Cluster A: Melamchi / Bahrabise Bridge collapse & flash flood
    sdp_bridge_texts = [
        ("citizen", "Massive flood and landslide in Melamchi Sindhupalchok! Concrete bridge collapsed into river!"),
        ("citizen", "Melamchi bridge washed away by river overflow, Sindhupalchowk road completely cut off!"),
        ("police", "Sindhupalchok District Police confirms Melamchi river bridge collapsed. Road link severed. 2 missing."),
        ("citizen", "Bahrabise bazaar inundated by flood waters and mudslide in Sindhupalchok, homes submerged!"),
        ("social_media", "Araniko highway impassable at Bahrabise Sindhupalchok due to hill collapse and mudslide."),
        ("police", "Sindhupalchok APF team on site. 15 injured evacuated from flooded banks of Melamchi."),
    ]
    for i, (src, txt) in enumerate(sdp_bridge_texts):
        t = start_time + timedelta(hours=1.0 + (i * 0.7), minutes=random.randint(0, 20))
        reports.append({
            "source_type": src,
            "raw_text": txt,
            "reported_lat": sdp_loc.lat + random.uniform(-0.02, 0.02) if src in ("police", "citizen") else None,
            "reported_lon": sdp_loc.lon + random.uniform(-0.02, 0.02) if src in ("police", "citizen") else None,
            "timestamp": t
        })

    # Additional recurring reports for Sindhupalchok
    for h in range(6, 24, 3):
        reports.append({
            "source_type": random.choice(["citizen", "police", "hospital"]),
            "raw_text": f"Sindhupalchok Chautara hospital update: {random.randint(5, 12)} injured patients being treated for fracture wounds from landslide.",
            "reported_lat": sdp_loc.lat,
            "reported_lon": sdp_loc.lon,
            "timestamp": start_time + timedelta(hours=h, minutes=random.randint(10, 40))
        })

    # -------------------------------------------------------------
    # 3. GORKHA (Epicenter region: Severe structural damage in villages)
    # -------------------------------------------------------------
    gkh_loc = LOCATIONS["gorkha"]
    gkh_texts = [
        ("citizen", "Severe earthquake in Gorkha! Old stone houses collapsed in Barpak village, people trapped under debris!"),
        ("social_media", "Barpak Gorkha completely flattened again! 100 people trapped! Urgent rescue needed!"),
        ("police", "Gorkha police report: Multiple structural collapses in Barpak and Arughat. 5 dead, 18 injured confirmed."),
        ("hospital", "Gorkha District Hospital receiving patients from Barpak. 4 dead on arrival, 22 wounded."),
        ("citizen", "Landslide blocking road to Arughat in Gorkha, ambulance cannot pass."),
        ("police", "Gorkha security forces clearing road near Arughat. Relief supplies dispatched."),
    ]
    for i, (src, txt) in enumerate(gkh_texts):
        t = start_time + timedelta(hours=0.8 + (i * 0.9), minutes=random.randint(0, 15))
        reports.append({
            "source_type": src,
            "raw_text": txt,
            "reported_lat": gkh_loc.lat + random.uniform(-0.02, 0.02),
            "reported_lon": gkh_loc.lon + random.uniform(-0.02, 0.02),
            "timestamp": t
        })
    for h in range(7, 24, 4):
        reports.append({
            "source_type": "police",
            "raw_text": f"Gorkha district disaster committee reporting ongoing search operations in rural wards, {random.randint(2, 6)} injured evacuated.",
            "reported_lat": gkh_loc.lat,
            "reported_lon": gkh_loc.lon,
            "timestamp": start_time + timedelta(hours=h, minutes=random.randint(15, 45))
        })

    # -------------------------------------------------------------
    # 4. BHAKTAPUR (Verified Safe Scenario: Initial scare -> confirmed safe)
    # -------------------------------------------------------------
    bkt_loc = LOCATIONS["bhaktapur"]
    bkt_texts = [
        ("citizen", "Strong tremors felt in Bhaktapur Durbar Square! People ran outside into open ground."),
        ("social_media", "Tremor in Bhaktapur! Is the temple damaged?"),
        ("police", "Bhaktapur police patrol: Durbar square and surrounding structures inspected, no collapse observed, zero casualties."),
        ("police", "Bhaktapur municipal engineers completed initial structural inspection: All clear, no damage to historical monuments."),
        ("hospital", "Bhaktapur Hospital confirms normal operations. No earthquake casualties or injuries admitted, everyone safe."),
        ("citizen", "Bhaktapur markets reopened, minor cracks on plaster only, completely safe condition."),
    ]
    for i, (src, txt) in enumerate(bkt_texts):
        t = start_time + timedelta(hours=0.5 + (i * 1.2), minutes=random.randint(0, 20))
        reports.append({
            "source_type": src,
            "raw_text": txt,
            "reported_lat": bkt_loc.lat + random.uniform(-0.008, 0.008),
            "reported_lon": bkt_loc.lon + random.uniform(-0.008, 0.008),
            "timestamp": t
        })
    # Additional safe check updates
    for h in [9, 14, 18, 22]:
        reports.append({
            "source_type": "police",
            "raw_text": f"Bhaktapur sector routine check at T+{h}h: All systems operational, verified safe, 0 casualties.",
            "reported_lat": bkt_loc.lat,
            "reported_lon": bkt_loc.lon,
            "timestamp": start_time + timedelta(hours=h, minutes=random.randint(5, 25))
        })

    # -------------------------------------------------------------
    # 5. RASUWA (Blackout Scenario: Initial reports then COMPLETE SILENCE after T+3.5h)
    # -------------------------------------------------------------
    rsw_loc = LOCATIONS["rasuwa"]
    rsw_texts = [
        ("citizen", "Violent shaking in Dhunche Rasuwa! Rockfall starting on Langtang trail!"),
        ("citizen", "Massive landslide near Syabrubesi in Rasuwa, power poles shaking violently!"),
        ("police", "Rasuwa police: Landslide blocking road at Betrawati. Cell tower generator failing. 2 injured."),
        ("social_media", "Power outage and cell tower down across Dhunche and Rasuwa district! No phone signal!"),
    ]
    # All Rasuwa reports happen within the first 3.5 hours ONLY!
    for i, (src, txt) in enumerate(rsw_texts):
        t = start_time + timedelta(hours=0.4 + (i * 0.8), minutes=random.randint(0, 15))
        reports.append({
            "source_type": src,
            "raw_text": txt,
            "reported_lat": rsw_loc.lat + random.uniform(-0.015, 0.015),
            "reported_lon": rsw_loc.lon + random.uniform(-0.015, 0.015),
            "timestamp": t
        })
    # NO MORE REPORTS for Rasuwa after T+3.2h, triggering a realistic communication blackout!

    # -------------------------------------------------------------
    # 6. DOLAKHA (Damaged Scenario: Tama Koshi landslide and road cuts)
    # -------------------------------------------------------------
    dlk_loc = LOCATIONS["dolakha"]
    dlk_texts = [
        ("citizen", "Large landslide in Charikot Dolakha blocking main market road, houses damaged by falling rocks!"),
        ("citizen", "Landslide along Tama Koshi river in Dolakha district, road blocked completely!"),
        ("police", "Dolakha police deployed to Charikot landslide. 1 house damaged, 4 injured evacuated."),
        ("hospital", "Charikot Hospital treated 4 patients with minor injuries from Dolakha rockfall."),
    ]
    for i, (src, txt) in enumerate(dlk_texts):
        t = start_time + timedelta(hours=1.5 + (i * 1.5), minutes=random.randint(0, 20))
        reports.append({
            "source_type": src,
            "raw_text": txt,
            "reported_lat": dlk_loc.lat + random.uniform(-0.01, 0.01),
            "reported_lon": dlk_loc.lon + random.uniform(-0.01, 0.01),
            "timestamp": t
        })
    for h in [8, 13, 19, 23]:
        reports.append({
            "source_type": "police",
            "raw_text": f"Dolakha patrol update at T+{h}h: Heavy equipment working on Charikot road clearance.",
            "reported_lat": dlk_loc.lat,
            "reported_lon": dlk_loc.lon,
            "timestamp": start_time + timedelta(hours=h, minutes=random.randint(10, 30))
        })

    # -------------------------------------------------------------
    # 7. NUWAKOT (Verified Safe / Minor Tremors)
    # -------------------------------------------------------------
    nwk_loc = LOCATIONS["nuwakot"]
    nwk_texts = [
        ("citizen", "Tremors felt in Bidur Nuwakot, but buildings are intact."),
        ("police", "Nuwakot police unit inspected Trishuli bridge and Bidur bazaar: Structure is sound, no damage."),
        ("hospital", "Trishuli Hospital Nuwakot confirms no casualties or damage reported, operations normal."),
        ("citizen", "Nuwakot Battar area safe, normal traffic flowing."),
    ]
    for i, (src, txt) in enumerate(nwk_texts):
        t = start_time + timedelta(hours=1.0 + (i * 2.0), minutes=random.randint(0, 25))
        reports.append({
            "source_type": src,
            "raw_text": txt,
            "reported_lat": nwk_loc.lat + random.uniform(-0.01, 0.01),
            "reported_lon": nwk_loc.lon + random.uniform(-0.01, 0.01),
            "timestamp": t
        })
    for h in [10, 16, 21]:
        reports.append({
            "source_type": "police",
            "raw_text": f"Nuwakot area inspection at T+{h}h: Confirmed all clear, completely safe.",
            "reported_lat": nwk_loc.lat,
            "reported_lon": nwk_loc.lon,
            "timestamp": start_time + timedelta(hours=h, minutes=random.randint(5, 35))
        })

    # -------------------------------------------------------------
    # 8. SINDHULI (Unverified / Sparse / Ambiguous Rumors)
    # -------------------------------------------------------------
    sdh_loc = LOCATIONS["sindhuli"]
    # Only 2 low-trust social media rumors across 24h -> remains Unverified
    reports.append({
        "source_type": "social_media",
        "raw_text": "Someone on BP Highway near Sindhuli said they saw dust rising from hills. Possible landslide?",
        "reported_lat": None,
        "reported_lon": None,
        "timestamp": start_time + timedelta(hours=4.0, minutes=15)
    })
    reports.append({
        "source_type": "citizen",
        "raw_text": "Mild shake in Kamalamai Sindhuli, no visible destruction seen so far.",
        "reported_lat": sdh_loc.lat + random.uniform(-0.02, 0.02),
        "reported_lon": sdh_loc.lon + random.uniform(-0.02, 0.02),
        "timestamp": start_time + timedelta(hours=15.0, minutes=45)
    })

    # -------------------------------------------------------------
    # 9. UNRESOLVED / NOISE REPORTS (Edge cases: no location name or distant coords)
    # -------------------------------------------------------------
    unresolved_texts = [
        ("citizen", "Did anyone else feel that huge tremor just now? My whole room shook!"),
        ("social_media", "Earthquake alarm ringing! Hope everyone in the mountain hills is safe!"),
        ("citizen", "Power flickered for a few minutes here. Shaking was intense."),
    ]
    for i, (src, txt) in enumerate(unresolved_texts):
        t = start_time + timedelta(hours=0.5 + (i * 3.0), minutes=random.randint(0, 30))
        reports.append({
            "source_type": src,
            "raw_text": txt,
            "reported_lat": None,
            "reported_lon": None,
            "timestamp": t
        })

    # Sort all reports by timestamp
    reports.sort(key=lambda r: r["timestamp"])
    return reports


def seed_database(db: Session, force: bool = False) -> int:
    """Seed the database with synthetic reports if empty or if force=True."""
    count = db.query(ReportDB).count()
    if count > 0 and not force:
        return count
        
    if force:
        db.query(ReportDB).delete()
        db.commit()
        
    synthetic_data = generate_synthetic_reports()
    
    db_items: list[ReportDB] = []
    for item in synthetic_data:
        raw_text = item["raw_text"]
        lat = item.get("reported_lat")
        lon = item.get("reported_lon")
        
        extraction = extract_all(raw_text, lat, lon)
        emb = embed_text(raw_text)
        emb_json = serialize_embedding(emb)
        
        rep = ReportDB(
            source_type=item["source_type"],
            raw_text=raw_text,
            reported_lat=lat,
            reported_lon=lon,
            timestamp=item["timestamp"],
            resolved_location_id=extraction.location_id,
            location_resolved_by=extraction.location_resolved_by,
            extracted_casualties=extraction.casualties,
            extracted_damage_type=extraction.damage_type,
            confidence_hint=extraction.confidence_hint,
            embedding_json=emb_json,
        )
        db_items.append(rep)
        
    db.bulk_save_objects(db_items)
    db.commit()
    return len(db_items)
