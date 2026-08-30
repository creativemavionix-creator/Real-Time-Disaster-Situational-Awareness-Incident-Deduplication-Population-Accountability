"""Fixed 8-location Nepal gazetteer with spatial and keyword lookup."""

from dataclasses import dataclass, field
import math
import re
from typing import Optional


@dataclass(frozen=True)
class LocationInfo:
    id: str
    name: str
    lat: float
    lon: float
    aliases: list[str] = field(default_factory=list)
    description: str = ""


# The 8 fixed Nepal locations
LOCATIONS: dict[str, LocationInfo] = {
    "kathmandu": LocationInfo(
        id="kathmandu",
        name="Kathmandu",
        lat=27.7172,
        lon=85.3240,
        aliases=[
            # English / Romanized
            "kathmandu", "ktm", "kantipur", "thamel", "new road", "bhotahiti",
            "kalanki", "koteshwor", "maharajgunj", "balaju", "balkhu", "chabahil",
            "patan gate", "singha durbar", "kmc", "tripureshwor", "teku",
            # Devanagari Nepali
            "काठमाडौँ", "काठमाडौं", "कान्तिपुर", "ठमेल", "न्यु रोड", "नयाँ सडक",
            "भोटाहिटी", "कलंकी", "कोटेश्वर", "महाराजगञ्ज", "सिंहदरबार", "सिहदरबार",
            "बालाजु", "बल्खु", "चाबहिल", "टेकु", "त्रिपुरेश्वर"
        ],
        description="Capital valley center & major administrative hub"
    ),
    "bhaktapur": LocationInfo(
        id="bhaktapur",
        name="Bhaktapur",
        lat=27.6710,
        lon=85.4298,
        aliases=[
            # English / Romanized
            "bhaktapur", "bhadgaon", "durbar square", "sallaghari", "thimi",
            "madhyapur", "suryabinayak", "changunarayan", "kamalbinayak",
            # Devanagari Nepali
            "भक्तपुर", "भादगाउँ", "दरबार स्क्वायर", "सलाघारी", "सल्लाघारी",
            "थिमी", "मध्यपुर", "सूर्यविनायक", "चाँगुनारायण", "कमलबिनायक"
        ],
        description="Eastern valley historical district"
    ),
    "sindhupalchok": LocationInfo(
        id="sindhupalchok",
        name="Sindhupalchok",
        lat=27.9500,
        lon=85.7000,
        aliases=[
            # English / Romanized
            "sindhupalchok", "sindhupalchowk", "chautara", "melamchi", "bahrabise",
            "tatopani", "helambu", "sukute", "araniko highway", "balephi", "indrawati",
            # Devanagari Nepali
            "सिन्धुपाल्चोक", "सिन्धुपाल्चोक", "चौतारा", "मेलम्ची", "बाह्रबिसे",
            "तातोपानी", "हेलम्बु", "सुकुटे", "अरनिको राजमार्ग", "बलेफी", "इन्द्रावती"
        ],
        description="High-risk mountainous district northeast of Kathmandu"
    ),
    "dolakha": LocationInfo(
        id="dolakha",
        name="Dolakha",
        lat=27.7500,
        lon=86.1000,
        aliases=[
            # English / Romanized
            "dolakha", "dolkha", "charikot", "jiri", "tama koshi", "tamakoshi",
            "singati", "bhimeshwor", "kalinchowk",
            # Devanagari Nepali
            "दोलखा", "चरीकोट", "चरिकोट", "जिरी", "तामाकोशी", "तामा कोशी",
            "सिंगटी", "सिङ्गटी", "भीमेश्वर", "कालिञ्चोक", "कालिन्चोक"
        ],
        description="Eastern hill district near Tama Koshi river basin"
    ),
    "nuwakot": LocationInfo(
        id="nuwakot",
        name="Nuwakot",
        lat=27.9167,
        lon=85.1667,
        aliases=[
            # English / Romanized
            "nuwakot", "bidur", "trishuli", "battar", "devighat", "ranipauwa",
            "kakani", "samari",
            # Devanagari Nepali
            "नुवाकोट", "विदुर", "बिदुर", "त्रिशुली", "त्रिसुली", "बट्टार",
            "देवीघाट", "रानीपौवा", "ककनी", "सामरी"
        ],
        description="Northwestern valley district connecting Trishuli valley"
    ),
    "gorkha": LocationInfo(
        id="gorkha",
        name="Gorkha",
        lat=28.0000,
        lon=84.6333,
        aliases=[
            # English / Romanized
            "gorkha", "gorkha bazaar", "barpak", "arughat", "laprak", "manakamana",
            "palungtar", "daraundi", "larke",
            # Devanagari Nepali
            "गोरखा", "गोरखा बजार", "बारपाक", "आरुघाट", "लाप्राक", "मनकामना",
            "पालुङटार", "दरौँदी", "दरौदी", "लार्के"
        ],
        description="Epicenter region and western hill corridor"
    ),
    "rasuwa": LocationInfo(
        id="rasuwa",
        name="Rasuwa",
        lat=28.1500,
        lon=85.3000,
        aliases=[
            # English / Romanized
            "rasuwa", "dhunche", "syabrubesi", "langtang", "timure", "rasuwagadhi",
            "chilime", "betrawati", "gosainkunda",
            # Devanagari Nepali
            "रसुवा", "धुन्चे", "धुञ्चे", "स्याफ्रुबेसी", "स्याब्रुबेसी", "लाङटाङ",
            "टिमुरे", "रसुवागढी", "चिलिमे", "बेत्रावती", "गोसाइँकुण्ड", "गोसाइकुण्ड"
        ],
        description="Northern border mountainous district with Langtang valley"
    ),
    "sindhuli": LocationInfo(
        id="sindhuli",
        name="Sindhuli",
        lat=27.2500,
        lon=85.9500,
        aliases=[
            # English / Romanized
            "sindhuli", "kamalamai", "sindhulimadhi", "bp highway", "khurkot",
            "dudhauli", "marin", "sindhuligadhi",
            # Devanagari Nepali
            "सिन्धुली", "कमलामाई", "सिन्धुलीमाढी", "विपि राजमार्ग", "बिपी राजमार्ग",
            "खुर्कोट", "दुधौली", "मरिण", "सिन्धुलीगढी"
        ],
        description="Southeastern gateway connecting BP Highway"
    ),
}


def get_all_locations() -> list[LocationInfo]:
    """Return all 8 fixed locations."""
    return list(LOCATIONS.values())


def get_location_by_id(location_id: str) -> Optional[LocationInfo]:
    """Get location by canonical ID."""
    if not location_id:
        return None
    return LOCATIONS.get(location_id.strip().lower())


def resolve_location_from_text(text: Optional[str]) -> Optional[LocationInfo]:
    """
    Fuzzy/keyword match against text to identify one of the 8 fixed locations.
    Matches longer alias phrases first to avoid false positives.
    Works seamlessly across English, Romanized Nepali, and native Devanagari scripts.
    """
    if not text:
        return None
    
    text_lower = text.lower()
    
    # Sort all aliases across all locations by length descending
    matches: list[tuple[int, LocationInfo]] = []
    
    for loc in LOCATIONS.values():
        for alias in loc.aliases:
            pattern = r'(?:\b|[^\w\u0900-\u097F]|^)' + re.escape(alias.lower()) + r'(?:\b|[^\w\u0900-\u097F]|$)'
            if re.search(pattern, text_lower):
                matches.append((len(alias), loc))
                break
                
    if matches:
        # Pick the most specific (longest) alias match
        matches.sort(key=lambda x: x[0], reverse=True)
        return matches[0][1]
        
    return None


def resolve_location_from_coordinates(
    lat: Optional[float],
    lon: Optional[float],
    max_distance_km: float = 45.0
) -> Optional[LocationInfo]:
    """
    Resolve coordinates to the nearest of the 8 fixed centroids using Haversine distance.
    If closest centroid is beyond max_distance_km, returns None ("unresolved").
    """
    if lat is None or lon is None:
        return None
    
    try:
        lat_f = float(lat)
        lon_f = float(lon)
    except (ValueError, TypeError):
        return None

    def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        r = 6371.0  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return r * c

    closest_loc: Optional[LocationInfo] = None
    min_distance = float("inf")
    
    for loc in LOCATIONS.values():
        dist = haversine_km(lat_f, lon_f, loc.lat, loc.lon)
        if dist < min_distance:
            min_distance = dist
            closest_loc = loc
            
    if min_distance <= max_distance_km:
        return closest_loc
        
    return None


def get_location(location_id: str) -> Optional[LocationInfo]:
    """Retrieve location info by sector ID."""
    return LOCATIONS.get(location_id.lower())


def get_all_locations() -> list[LocationInfo]:
    """Return all 8 fixed location entries."""
    return list(LOCATIONS.values())

