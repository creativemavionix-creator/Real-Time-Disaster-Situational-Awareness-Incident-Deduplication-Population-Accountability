"""Probabilistic Population Reconciliation & Entity Resolution Engine.

Implements hybrid scoring for cross-referencing missing person inquiries against
scattered hospital admissions, shelter registrations, and rescue check-ins:

Match Score = w1 * JaroWinkler(Name1, Name2) + w2 * CosineSim(V_attrs1, V_attrs2) + w3 * Delta_Age
- High confidence (> 0.85): Auto-reconciled to Accounted / Sheltered.
- Edge scores (0.65 - 0.84): Surface to dispatchers as "Suggested Match" review queue.
"""

import math
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.models.db import MissingPersonDB
from app.pipeline.gazetteer import get_location_by_id


def jaro_similarity(s1: str, s2: str) -> float:
    """Compute standard Jaro distance between two strings."""
    s1, s2 = s1.lower().strip(), s2.lower().strip()
    if s1 == s2:
        return 1.0
    if not s1 or not s2:
        return 0.0

    len1, len2 = len(s1), len(s2)
    match_distance = max(len1, len2) // 2 - 1
    if match_distance < 0:
        match_distance = 0

    s1_matches = [False] * len1
    s2_matches = [False] * len2
    matches = 0
    transpositions = 0

    for i in range(len1):
        start = max(0, i - match_distance)
        end = min(i + match_distance + 1, len2)
        for j in range(start, end):
            if s2_matches[j] or s1[i] != s2[j]:
                continue
            s1_matches[i] = True
            s2_matches[j] = True
            matches += 1
            break

    if matches == 0:
        return 0.0

    k = 0
    for i in range(len1):
        if not s1_matches[i]:
            continue
        while not s2_matches[k]:
            k += 1
        if s1[i] != s2[k]:
            transpositions += 1
        k += 1

    jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0
    return jaro


def jaro_winkler_similarity(s1: str, s2: str, p: float = 0.1, max_l: int = 4) -> float:
    """Compute Jaro-Winkler string similarity with prefix bonus and abbreviation awareness."""
    s1, s2 = s1.lower().strip(), s2.lower().strip()
    if s1 == s2:
        return 1.0

    # Token-level abbreviation handling (e.g. "Rajesh Kumar" vs "Rajesh K.")
    tokens1 = s1.replace(".", "").split()
    tokens2 = s2.replace(".", "").split()
    if tokens1 and tokens2 and tokens1[0] == tokens2[0]:
        if len(tokens1) > 1 and len(tokens2) > 1:
            t1_last, t2_last = tokens1[-1], tokens2[-1]
            if t1_last[0] == t2_last[0]:
                return 0.95

    j = jaro_similarity(s1, s2)
    if j < 0.7:
        return j

    l = 0
    for c1, c2 in zip(s1, s2):
        if c1 == c2:
            l += 1
            if l == max_l:
                break
        else:
            break

    return j + l * p * (1.0 - j)


def attribute_cosine_similarity(text1: str, text2: str) -> float:
    """Compute word-vector token overlap similarity across physical descriptions."""
    if not text1 or not text2:
        return 0.6

    stop_words = {"and", "the", "with", "near", "wearing", "on", "in", "at", "a", "an", "was"}
    w1 = set(w for w in text1.lower().replace(",", " ").replace(".", " ").split() if w not in stop_words)
    w2 = set(w for w in text2.lower().replace(",", " ").replace(".", " ").split() if w not in stop_words)
    if not w1 or not w2:
        return 0.6

    intersection = w1.intersection(w2)
    if not intersection:
        return 0.2
    return min(1.0, len(intersection) / math.sqrt(len(w1) * len(w2)) + 0.2)


def calculate_age_penalty(age1: Optional[int], age2: Optional[int]) -> float:
    """Calculate age difference score (1.0 for exact, decaying with delta)."""
    if age1 is None or age2 is None:
        return 0.85  # Neutral prior if age missing

    delta = abs(age1 - age2)
    if delta == 0:
        return 1.0
    if delta == 1:
        return 0.95
    if delta <= 3:
        return 0.85
    if delta <= 5:
        return 0.65
    return max(0.1, 1.0 - (delta * 0.15))


def calculate_hybrid_match_score(
    missing_name: str,
    missing_age: Optional[int],
    missing_desc: Optional[str],
    found_name: str,
    found_age: Optional[int],
    found_desc: Optional[str],
    missing_sector: str,
    found_sector: str,
    w1: float = 0.55,
    w2: float = 0.25,
    w3: float = 0.20,
) -> float:
    """
    Hybrid scoring formula from PRATYAKSH-Ω spec:
    Match Score = w1 * JaroWinkler(Name1, Name2) + w2 * CosineSim(V_attrs1, V_attrs2) + w3 * Delta_Age
    With sector proximity bonus.
    """
    jw_name = jaro_winkler_similarity(missing_name, found_name)
    attr_sim = attribute_cosine_similarity(missing_desc or "", found_desc or "")
    age_score = calculate_age_penalty(missing_age, found_age)

    raw_score = (w1 * jw_name) + (w2 * attr_sim) + (w3 * age_score)

    # Geographic proximity bonus if in same sector or adjacent
    if missing_sector.lower() == found_sector.lower():
        raw_score = min(1.0, raw_score + 0.05)

    return round(raw_score, 3)
