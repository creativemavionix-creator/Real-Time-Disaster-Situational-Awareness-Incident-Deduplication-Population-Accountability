"""Extraction module for location, casualties, and damage type from raw incident reports."""

import re
from typing import Optional
from dataclasses import dataclass

from app.pipeline.gazetteer import (
    LocationInfo,
    resolve_location_from_text,
    resolve_location_from_coordinates,
)
from app.pipeline.nepali_nlp import (
    contains_devanagari,
    normalize_devanagari_digits,
    NEPALI_WORD_TO_NUM,
    NEPALI_DAMAGE_PATTERNS,
)


@dataclass
class ExtractionResult:
    location_id: Optional[str]
    location_name: Optional[str]
    location_resolved_by: str  # "text_keyword", "coordinates", or "unresolved"
    casualties: Optional[int]
    damage_type: str
    confidence_hint: float


# Word to number mapping for casualty parsing
WORD_TO_NUM: dict[str, int] = {
    "zero": 0, "no": 0, "none": 0,
    "one": 1, "a": 1, "an": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "dozen": 12, "thirteen": 13, "fourteen": 14,
    "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
    "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50,
    "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90, "hundred": 100
}

# Damage type keyword rules (evaluated in priority order)
DAMAGE_PATTERNS: list[tuple[str, list[str]]] = [
    (
        "safe_clear",
        [
            r"\ball clear\b", r"\bno damage\b", r"\bminor tremor\b", r"\bcompletely safe\b",
            r"\bintact\b", r"\bnormal condition\b", r"\boperations normal\b", r"\bverified safe\b",
            r"\bno casualties or damage\b", r"\bstructure is sound\b", r"\binspected and clear\b"
        ]
    ),
    (
        "landslide",
        [
            r"\blandslide\b", r"\bmudslide\b", r"\brockfall\b", r"\bdebris flow\b",
            r"\bslope failure\b", r"\bhill collapsed\b", r"\bmountain slid\b"
        ]
    ),
    (
        "flood",
        [
            r"\bflood\b", r"\bflooding\b", r"\bflash flood\b", r"\binundat(ed|ion)\b",
            r"\bsubmerged\b", r"\briver overflow\b", r"\bwater logging\b", r"\bwashed away\b"
        ]
    ),
    (
        "fire",
        [
            r"\bfire\b", r"\bblaze\b", r"\bflames\b", r"\bexplosion\b",
            r"\bgas leak\b", r"\bburning\b", r"\bsmoke rising\b"
        ]
    ),
    (
        "road/bridge",
        [
            r"\bbridge (collapsed|damaged|cracked|broken)\b", r"\broad (blocked|cut|cracked|severed)\b",
            r"\bhighway blocked\b", r"\bimpassable\b", r"\broute closed\b", r"\btransport cutoff\b"
        ]
    ),
    (
        "communication",
        [
            r"\bpower outage\b", r"\bcell tower down\b", r"\bno signal\b", r"\bblackout\b",
            r"\bnetwork down\b", r"\btransmission line\b", r"\bno phone\b", r"\bcomms cutoff\b"
        ]
    ),
    (
        "structural",
        [
            r"\bcollaps(e|ed|ing)\b", r"\bbuilding down\b", r"\brubble\b", r"\bcracked wall\b",
            r"\bpillar cracked\b", r"\broof caved\b", r"\bstructure damage\b", r"\bhouse destroyed\b",
            r"\bseverely damaged\b", r"\bdebris\b", r"\btrapped under\b"
        ]
    ),
]


def extract_location(
    raw_text: Optional[str],
    reported_lat: Optional[float] = None,
    reported_lon: Optional[float] = None,
) -> tuple[Optional[LocationInfo], str]:
    """
    Extract location from raw text keyword/alias matching first.
    If no text match, fall back to reported coordinates if present.
    Returns: (LocationInfo or None, resolution_method)
    """
    # 1. Try text extraction
    loc_from_text = resolve_location_from_text(raw_text)
    if loc_from_text is not None:
        return loc_from_text, "text_keyword"
        
    # 2. Fall back to reported coordinates
    if reported_lat is not None and reported_lon is not None:
        loc_from_coords = resolve_location_from_coordinates(reported_lat, reported_lon)
        if loc_from_coords is not None:
            return loc_from_coords, "coordinates"
            
    return None, "unresolved"


def extract_casualties(raw_text: Optional[str]) -> Optional[int]:
    """
    Extract casualty/injury count from text using regex heuristics.
    Handles 'no casualties', explicit numbers (ASCII and Devanagari), and word numbers.
    """
    if not raw_text:
        return None
        
    # Normalize Devanagari digits (e.g. ५ -> 5)
    text_normalized = normalize_devanagari_digits(raw_text).lower()
    
    # Check for explicit zero casualties (English + Devanagari)
    zero_patterns = [
        r"\bno\s+(casualties|injuries|deaths|fatalities|harm)\b",
        r"\bzero\s+(casualties|injuries|deaths|fatalities)\b",
        r"\b0\s+(casualties|injuries|deaths|fatalities|dead|injured)\b",
        r"\beveryone\s+(is\s+)?safe\b",
        r"\bno\s+one\s+(was\s+)?hurt\b",
        # Devanagari zero casualty phrases
        r"सबै\s+सुरक्षित",
        r"कुनै\s+(?:पनि\s+)?(?:हताहत|क्षति|घाइते|मृत्यु)\s+छैन",
        r"०\s*(?:जना|व्यक्ति)?\s*(?:घाइते|मृत्यु|हताहत)",
        r"कुनै\s+हताहती\s+छैन",
    ]
    for zp in zero_patterns:
        if re.search(zp, text_normalized):
            return 0

    total_casualties = 0
    found_any = False

    # English & standard digit patterns
    digit_patterns = [
        r"(?:(?:at least|approx|around|over|nearly|up to)\s+)?(\d{1,4})\s*(?:people|persons|citizens)?\s*(?:dead|killed|fatalities|deaths|deceased)",
        r"(?:(?:at least|approx|around|over|nearly|up to)\s+)?(\d{1,4})\s*(?:people|persons|citizens)?\s*(?:injured|wounded|hurt|hospitalized)",
        r"(?:(?:at least|approx|around|over|nearly|up to)\s+)?(\d{1,4})\s*(?:people|persons|citizens)?\s*(?:trapped|buried|under rubble)",
        r"(?:(?:at least|approx|around|over|nearly|up to)\s+)?(\d{1,4})\s*(?:people|persons|citizens)?\s*(?:missing|unaccounted|isolated)",
        r"(?:(?:at least|approx|around|over|nearly|up to)\s+)?(\d{1,4})\s*(?:casualties|victims)",
        r"(?:dead|fatalities|casualties|injured|deaths|missing|unaccounted):\s*(\d{1,4})",
        # Devanagari normalized digit patterns (e.g., "५ जना घाइते", "३ जनाको मृत्यु", "२ जना बेपत्ता")
        r"(\d{1,4})\s*(?:जना|व्यक्ति|मानिस)?\s*(?:मृत्यु|मरे|हताहत|मृतक|को\s+मृत्यु)",
        r"(\d{1,4})\s*(?:जना|व्यक्ति|मानिस)?\s*(?:घाइते|अस्पताल\s+भर्ना|चोटपटक)",
        r"(\d{1,4})\s*(?:जना|व्यक्ति|मानिस)?\s*(?:पुरिएका|सम्पर्कविहीन|बेपत्ता|च्यापिएका)",
        r"(?:मृत्यु|घाइते|बेपत्ता|हताहत):\s*(\d{1,4})",
    ]
    
    for pat in digit_patterns:
        matches = re.finditer(pat, text_normalized)
        for m in matches:
            val = int(m.group(1))
            total_casualties += val
            found_any = True
            
    # English word numbers e.g. "two dead", "two missing", "five injured"
    if not found_any:
        word_num_pattern = r"\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|fifty)\s+(?:people\s+)?(?:dead|killed|injured|fatalities|casualties|trapped|missing|unaccounted)\b"
        matches = re.finditer(word_num_pattern, text_normalized)
        for m in matches:
            word = m.group(1)
            if word in WORD_TO_NUM:
                total_casualties += WORD_TO_NUM[word]
                found_any = True

    # Nepali word numbers e.g. "पाँच जना घाइते", "तीन जनाको मृत्यु"
    if not found_any and contains_devanagari(raw_text):
        nepali_words_pat = r"(?:^|[^\w\u0900-\u097F])(एक|एउटा|दुई|दुइ|तीन|चार|पाँच|पाच|छ|सात|आठ|नौ|दश|एघार|बाह्र|पन्ध्र|बीस|तीस|तिस|चालीस|पचास|सय)\s*(?:जना|व्यक्ति|मानिस)?(?:\s*को)?\s*(?:मृत्यु|मरे|हताहत|मृतक|घाइते|पुरिएका|बेपत्ता|सम्पर्कविहीन)"
        matches = re.finditer(nepali_words_pat, text_normalized)
        for m in matches:
            word = m.group(1)
            if word in NEPALI_WORD_TO_NUM:
                total_casualties += NEPALI_WORD_TO_NUM[word]
                found_any = True

    return total_casualties if found_any else None


def extract_damage_type(raw_text: Optional[str]) -> str:
    """
    Extract damage type from text against fixed damage category patterns.
    Handles English, Romanized Nepali, and native Devanagari script.
    """
    if not raw_text:
        return "unspecified"
        
    text_lower = raw_text.lower()
    
    # 1. Check Devanagari patterns first if Devanagari is present
    if contains_devanagari(raw_text):
        for category, patterns in NEPALI_DAMAGE_PATTERNS:
            for pat in patterns:
                if re.search(pat, text_lower):
                    return category
                    
    # 2. Check English patterns
    for category, patterns in DAMAGE_PATTERNS:
        for pat in patterns:
            if re.search(pat, text_lower):
                return category
                
    return "unspecified"


def extract_all(
    raw_text: Optional[str],
    reported_lat: Optional[float] = None,
    reported_lon: Optional[float] = None,
) -> ExtractionResult:
    """
    Run full extraction pipeline on a report.
    Gracefully handles empty strings, None, or irregular formats.
    """
    safe_text = raw_text.strip() if raw_text else ""
    
    loc_info, res_method = extract_location(safe_text, reported_lat, reported_lon)
    casualties = extract_casualties(safe_text)
    damage_type = extract_damage_type(safe_text)
    
    # Calculate an extraction confidence hint
    confidence_hint = 0.5
    if loc_info:
        confidence_hint += 0.25 if res_method == "text_keyword" else 0.20
    if damage_type != "unspecified":
        confidence_hint += 0.15
    if casualties is not None:
        confidence_hint += 0.10
        
    return ExtractionResult(
        location_id=loc_info.id if loc_info else None,
        location_name=loc_info.name if loc_info else None,
        location_resolved_by=res_method,
        casualties=casualties,
        damage_type=damage_type,
        confidence_hint=min(1.0, confidence_hint),
    )
