"""Devanagari Nepali NLP module for crisis entity extraction, digit normalization, and hazard classification."""

import re
from typing import Optional

# Unicode range for Devanagari script: U+0900 to U+097F
DEVANAGARI_REGEX = re.compile(r"[\u0900-\u097F]")

# Devanagari digits to ASCII digits mapping
DEVANAGARI_DIGITS_MAP = str.maketrans({
    "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
    "५": "5", "६": "6", "७": "7", "८": "8", "९": "9"
})

# Nepali number words to integer values
NEPALI_WORD_TO_NUM: dict[str, int] = {
    "शुन्य": 0, "कुनै": 0, "एक": 1, "एउटा": 1, "दुई": 2, "दुइ": 2,
    "तीन": 3, "चार": 4, "पाँच": 5, "पाच": 5, "छ": 6, "सात": 7,
    "आठ": 8, "नौ": 9, "दश": 10, "एघार": 11, "बाह्र": 12, "तेह्र": 13,
    "चौध": 14, "पन्ध्र": 15, "सोह्र": 16, "सत्र": 17, "अठार": 18,
    "उन्नाइस": 19, "बीस": 20, "तिस": 30, "तीस": 30, "चालीस": 40,
    "पचास": 50, "साठी": 60, "सत्तरी": 70, "असी": 80, "नब्बे": 90, "सय": 100
}

# Devanagari disaster hazard classification patterns
NEPALI_DAMAGE_PATTERNS: list[tuple[str, list[str]]] = [
    (
        "safe_clear",
        [
            r"सबै\s+सुरक्षित", r"कुनै\s+क्षति\s+छैन", r"सामान्य\s+अवस्था", r"सकुशल",
            r"शान्त\s+छ", r"कुनै\s+हताहत\s+छैन", r"क्षति\s+पुगेको\s+छैन", r"स्थिति\s+सामान्य",
            r"सुरक्षित\s+छन्", r"सबै\s+ठीक\s+छ"
        ]
    ),
    (
        "landslide",
        [
            r"पहिरो", r"ढुङ्गा\s+खस्यो", r"ढुंगा\s+खस्यो", r"माटो\s+खस्यो",
            r"डाँडा\s+भासियो", r"चट्टान\s+खस्यो", r"पहिरोका\s+कारण"
        ]
    ),
    (
        "flood",
        [
            r"बाढी", r"नदी\s+उर्लियो", r"डुबान", r"पानी\s+पस्यो",
            r"बगायो", r"नदी\s+बढ्यो", r"खोला\s+उर्लियो", r"जलमग्न"
        ]
    ),
    (
        "fire",
        [
            r"आगलागी", r"आगो\s+लाग्यो", r"आगो", r"धुवाँ", r"विस्फोट",
            r"सिलिन्डर\s+विस्फोट", r"ज्वाला"
        ]
    ),
    (
        "road/bridge",
        [
            r"पुल\s+(?:भत्कि|भाँचि|बगायो|क्षतिग्रस्त|भाचियो)",
            r"सडक\s+(?:अवरुद्ध|भासियो|बन्द|क्षतिग्रस्त)",
            r"बाटो\s+बन्द", r"राजमार्ग\s+ठप्प", r"यातायात\s+ठप्प",
            r"सवारी\s+आवागमन\s+रोकियो"
        ]
    ),
    (
        "communication",
        [
            r"सम्पर्कविहीन", r"सम्पर्क\s+हुन\s+सकेन", r"फोन\s+लागेन", r"मोबाइल\s+टावर\s+डाउन",
            r"बिजुली\s+गयो", r"नेटवर्क\s+गयो", r"बत्ती\s+गयो", r"सञ्चार\s+विच्छेद"
        ]
    ),
    (
        "structural",
        [
            r"घर\s+(?:भत्कि|ढल|चर्कि|क्षतिग्रस्त)",
            r"भवन\s+(?:भत्कि|ढल|चर्कि|क्षतिग्रस्त)",
            r"पर्खाल\s+(?:भत्कि|ढल)",
            r"संरचना\s+(?:भत्कि|क्षतिग्रस्त|ढल)",
            r"ढुङ्गाको\s+घर", r"ढुंगाको\s+घर", r"माटोको\s+घर",
            r"भग्नावशेष", r"पुरिएका", r"च्यापिएका", r"ढलेको"
        ]
    ),
]


def contains_devanagari(text: Optional[str]) -> bool:
    """Return True if the text contains any Devanagari Unicode characters."""
    if not text:
        return False
    return bool(DEVANAGARI_REGEX.search(text))


def normalize_devanagari_digits(text: Optional[str]) -> str:
    """Translate Devanagari numerals (०-९) to standard ASCII digits (0-9)."""
    if not text:
        return ""
    return text.translate(DEVANAGARI_DIGITS_MAP)
