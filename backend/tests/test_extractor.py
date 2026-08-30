"""Unit tests for keyword & regex extraction pipeline."""

import pytest
from app.pipeline.extractor import (
    extract_location,
    extract_casualties,
    extract_damage_type,
    extract_all,
)
from app.pipeline.gazetteer import LOCATIONS


def test_extract_location_by_keyword():
    loc, method = extract_location("Large fire in Thamel Kathmandu near New Road")
    assert loc is not None
    assert loc.id == "kathmandu"
    assert method == "text_keyword"

    loc, method = extract_location("Bridge collapsed in Melamchi bazaar")
    assert loc is not None
    assert loc.id == "sindhupalchok"
    assert method == "text_keyword"

    loc, method = extract_location("Stone houses damaged in Barpak village")
    assert loc is not None
    assert loc.id == "gorkha"
    assert method == "text_keyword"

    loc, method = extract_location("Rockfall near Syabrubesi along Langtang route")
    assert loc is not None
    assert loc.id == "rasuwa"
    assert method == "text_keyword"

    loc, method = extract_location("Inspection completed in Bhaktapur Durbar Square")
    assert loc is not None
    assert loc.id == "bhaktapur"
    assert method == "text_keyword"

    loc, method = extract_location("Trishuli bridge sound in Bidur")
    assert loc is not None
    assert loc.id == "nuwakot"
    assert method == "text_keyword"

    loc, method = extract_location("Charikot market road blocked")
    assert loc is not None
    assert loc.id == "dolakha"
    assert method == "text_keyword"

    loc, method = extract_location("Kamalamai area dust rising")
    assert loc is not None
    assert loc.id == "sindhuli"
    assert method == "text_keyword"


def test_extract_location_by_coordinates_fallback():
    # Kathmandu centroid lat/lon with text that has no location mention
    loc, method = extract_location("Severe shaking felt in my room", reported_lat=27.7180, reported_lon=85.3250)
    assert loc is not None
    assert loc.id == "kathmandu"
    assert method == "coordinates"

    # Far away coordinates should resolve to None / unresolved
    loc, method = extract_location("Random text", reported_lat=10.0, reported_lon=10.0)
    assert loc is None
    assert method == "unresolved"


def test_extract_location_unresolved():
    loc, method = extract_location("Unknown place in deep forest", reported_lat=None, reported_lon=None)
    assert loc is None
    assert method == "unresolved"


def test_extract_casualties():
    assert extract_casualties("3 dead and 8 injured pulled out from rubble") == 11
    assert extract_casualties("At least 5 killed in collapse") == 5
    assert extract_casualties("12 injured admitted to hospital") == 12
    assert extract_casualties("No casualties reported, all safe") == 0
    assert extract_casualties("Zero fatalities confirmed") == 0
    assert extract_casualties("Two dead and five injured") == 7
    assert extract_casualties("Fatalities: 4, injured: 6") == 10
    assert extract_casualties("Just tremors felt, buildings shaking") is None


def test_extract_damage_type():
    assert extract_damage_type("Four-story building collapsed in rubble") == "structural"
    assert extract_damage_type("Massive landslide and rockfall blocking highway") == "landslide"
    assert extract_damage_type("River overflowed causing flash flood and submerged houses") == "flood"
    assert extract_damage_type("Transformer explosion and massive fire spreading") == "fire"
    assert extract_damage_type("Concrete bridge collapsed and road blocked") == "road/bridge"
    assert extract_damage_type("Cell tower down and complete power outage, no signal") == "communication"
    assert extract_damage_type("Inspection complete: all clear, no damage, operational") == "safe_clear"
    assert extract_damage_type("Tremor felt for 10 seconds") == "unspecified"


def test_extract_all_edge_cases():
    # Empty string
    res = extract_all("")
    assert res.location_id is None
    assert res.damage_type == "unspecified"
    assert res.casualties is None

    # None
    res = extract_all(None)
    assert res.location_id is None
    assert res.damage_type == "unspecified"
    assert res.casualties is None

    # Full report
    res = extract_all("Commercial building collapsed in Kathmandu New Road. 3 dead and 7 injured.", reported_lat=27.7172, reported_lon=85.3240)
    assert res.location_id == "kathmandu"
    assert res.damage_type == "structural"
    assert res.casualties == 10
    assert res.confidence_hint > 0.7


def test_extract_devanagari_nepali_locations():
    """Test location resolution from native Devanagari script."""
    loc, method = extract_location("काठमाडौँ न्यु रोडमा ठूलो आगलागी")
    assert loc is not None
    assert loc.id == "kathmandu"
    assert method == "text_keyword"

    loc, method = extract_location("गोरखा बारपाकमा ढुङ्गाको घर भत्कियो")
    assert loc is not None
    assert loc.id == "gorkha"
    assert method == "text_keyword"

    loc, method = extract_location("सिन्धुपाल्चोक मेलम्चीमा बाढी")
    assert loc is not None
    assert loc.id == "sindhupalchok"
    assert method == "text_keyword"

    loc, method = extract_location("रसुवा धुन्चेमा पहिरोले बाटो बन्द")
    assert loc is not None
    assert loc.id == "rasuwa"
    assert method == "text_keyword"

    loc, method = extract_location("दोलखा चरीकोट बजार सुरक्षित")
    assert loc is not None
    assert loc.id == "dolakha"
    assert method == "text_keyword"

    loc, method = extract_location("भक्तपुर दरबार स्क्वायर सामान्य अवस्था")
    assert loc is not None
    assert loc.id == "bhaktapur"
    assert method == "text_keyword"

    loc, method = extract_location("नुवाकोट विदुरमा त्रिशुली पुल सञ्चालनमा छ")
    assert loc is not None
    assert loc.id == "nuwakot"
    assert method == "text_keyword"

    loc, method = extract_location("सिन्धुली कमलामाई बिपी राजमार्ग")
    assert loc is not None
    assert loc.id == "sindhuli"
    assert method == "text_keyword"


def test_extract_devanagari_nepali_casualties():
    """Test casualty parsing with Devanagari digits and Nepali number words."""
    # Devanagari numerals (३ -> 3, ५ -> 5)
    assert extract_casualties("गोरखामा ३ जनाको मृत्यु र ५ जना घाइते") == 8
    assert extract_casualties("सिन्धुपाल्चोकमा १२ जना घाइते अस्पताल भर्ना") == 12
    assert extract_casualties("रसुवामा २ जना सम्पर्कविहीन") == 2
    
    # Nepali number words
    assert extract_casualties("पाँच जना घाइते भएका छन्") == 5
    assert extract_casualties("दुई जनाको मृत्यु") == 2
    assert extract_casualties("दश जना पुरिएका") == 10

    # Explicit zero casualties
    assert extract_casualties("सबै सुरक्षित छन्, कुनै क्षति छैन") == 0
    assert extract_casualties("कुनै हताहत छैन") == 0


def test_extract_devanagari_nepali_damage_types():
    """Test damage classification from native Devanagari crisis terms."""
    assert extract_damage_type("घर भत्कियो र संरचना क्षतिग्रस्त") == "structural"
    assert extract_damage_type("ठूलो पहिरो गयो र डाँडा भासियो") == "landslide"
    assert extract_damage_type("नदी उर्लियो र बस्ती डुबानमा पर्यो") == "flood"
    assert extract_damage_type("पुल भत्कियो र सडक अवरुद्ध भयो") == "road/bridge"
    assert extract_damage_type("मोबाइल टावर डाउन र सम्पर्कविहीन") == "communication"
    assert extract_damage_type("आगलागी भएर धुवाँ फैलियो") == "fire"
    assert extract_damage_type("सबै सुरक्षित छन् र सामान्य अवस्था छ") == "safe_clear"


def test_extract_all_devanagari_end_to_end():
    """End-to-end extraction from a full Devanagari field report."""
    res = extract_all("गोरखा बारपाकमा ढुङ्गाको घर भत्किएर ३ जनाको मृत्यु र ४ जना घाइते भएका छन्।")
    assert res.location_id == "gorkha"
    assert res.location_name == "Gorkha"
    assert res.damage_type == "structural"
    assert res.casualties == 7
    assert res.confidence_hint > 0.7

