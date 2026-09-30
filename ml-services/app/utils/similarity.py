import numpy as np
from typing import Dict, Any, List, Tuple
from app.utils.text_utils import tokenize
from app.utils.attribute_utils import (
    are_dimensions_compatible,
    are_materials_compatible,
    are_grades_compatible,
    are_item_types_compatible,
    CRITICAL_ATTRIBUTES,
)


def cosine_similarity_vectors(vec1: List[float], vec2: List[float]) -> float:
    """
    Computes mathematical cosine similarity between two vector embeddings.
    Bounded between 0.0 and 1.0.
    """
    if not vec1 or not vec2:
        return 0.0

    a = np.array(vec1, dtype=np.float32)
    b = np.array(vec2, dtype=np.float32)

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    sim = float(np.dot(a, b) / (norm_a * norm_b))
    # Clip between 0.0 and 1.0
    return float(np.clip(sim, 0.0, 1.0))


def compute_token_jaccard(text1: str, text2: str) -> float:
    """Compute token-level Jaccard similarity: |A ∩ B| / |A ∪ B|."""
    tokens1 = set(tokenize(text1))
    tokens2 = set(tokenize(text2))

    if not tokens1 or not tokens2:
        return 0.0

    intersection = len(tokens1.intersection(tokens2))
    union = len(tokens1.union(tokens2))

    if union == 0:
        return 0.0

    return float(intersection / union)


def compute_character_ngram_similarity(text1: str, text2: str, n: int = 3) -> float:
    """
    Computes character n-gram Dice similarity coefficient:
    2 * |N(text1) ∩ N(text2)| / (|N(text1)| + |N(text2)|)
    """
    t1 = "".join(text1.split()).lower()
    t2 = "".join(text2.split()).lower()

    if not t1 or not t2:
        return 0.0

    if t1 == t2:
        return 1.0

    if len(t1) < n or len(t2) < n:
        return 1.0 if t1 == t2 else 0.0

    ngrams1 = [t1[i:i + n] for i in range(len(t1) - n + 1)]
    ngrams2 = [t2[i:i + n] for i in range(len(t2) - n + 1)]

    set1 = set(ngrams1)
    set2 = set(ngrams2)

    intersection = len(set1.intersection(set2))
    total = len(set1) + len(set2)

    if total == 0:
        return 0.0

    return float((2.0 * intersection) / total)


def compute_lexical_similarity(text1: str, text2: str) -> float:
    """
    Combines token Jaccard and character n-gram similarity for robust lexical comparison.
    Returns score strictly between 0.0 and 1.0.
    """
    if not text1 or not text2:
        return 0.0

    t1 = text1.strip().lower()
    t2 = text2.strip().lower()

    if t1 == t2:
        return 1.0

    jaccard = compute_token_jaccard(t1, t2)
    ngram_sim = compute_character_ngram_similarity(t1, t2, n=3)

    # Weighted lexical blend
    lexical_score = (0.45 * jaccard) + (0.55 * ngram_sim)
    return float(np.clip(lexical_score, 0.0, 1.0))


# Specific attribute weights for attribute similarity calculation
ATTRIBUTE_WEIGHT_MAP = {
    "itemType": 0.25,
    "material": 0.20,
    "grade": 0.15,
    "diameter": 0.15,
    "length": 0.15,
    "thickness": 0.10,
    "pressureClass": 0.15,
    "voltage": 0.15,
    "current": 0.10,
    "power": 0.10,
    "standard": 0.10,
}


def compare_attributes(
    attrs1: Dict[str, Any],
    attrs2: Dict[str, Any]
) -> Tuple[float, List[str], List[str], List[str], List[str]]:
    """
    Compares two attribute dictionaries.
    Returns:
    - attribute_score: float [0.0, 1.0]
    - matched_attributes: List[str]
    - differences: List[str]
    - positive_factors: List[str]
    - negative_factors: List[str]
    """
    matched_attributes: List[str] = []
    differences: List[str] = []
    positive_factors: List[str] = []
    negative_factors: List[str] = []
    critical_mismatches: List[str] = []

    # Get all distinct non-empty keys across both
    all_keys = [
        k for k in ["itemType", "material", "grade", "diameter", "length", "width", "height", "thickness", "pressureClass", "voltage", "current", "power", "standard", "specification", "unit", "manufacturer", "model"]
        if (attrs1.get(k) is not None and attrs1.get(k) != "") or (attrs2.get(k) is not None and attrs2.get(k) != "")
    ]

    # Add any extra keys
    extra_keys = sorted(list(
        (set(k for k, v in attrs1.items() if v is not None and v != "" and v != {}) |
         set(k for k, v in attrs2.items() if v is not None and v != "" and v != {})) - set(all_keys) - {"additionalAttributes"}
    ))
    all_keys.extend(extra_keys)

    if not all_keys:
        # No extracted attributes to compare - neutral neutral score
        return 0.5, [], [], [], []

    weighted_score = 0.0
    total_weight = 0.0

    for key in all_keys:
        val1 = attrs1.get(key)
        val2 = attrs2.get(key)
        weight = ATTRIBUTE_WEIGHT_MAP.get(key, 0.08)

        if val1 is not None and val2 is not None:
            total_weight += weight
            v1_str = str(val1).strip()
            v2_str = str(val2).strip()

            is_compat = False
            msg = None

            if key == "itemType":
                is_compat, msg = are_item_types_compatible(v1_str, v2_str)
            elif key == "material":
                is_compat, msg = are_materials_compatible(v1_str, v2_str)
            elif key == "grade":
                is_compat, msg = are_grades_compatible(v1_str, v2_str)
            elif key in {"diameter", "length", "width", "height", "thickness"}:
                is_compat, msg = are_dimensions_compatible(v1_str, v2_str)
            else:
                is_compat = (v1_str.lower() == v2_str.lower())
                msg = f"Same {key}: {val1}" if is_compat else f"{key} differs: {val1} vs {val2}"

            if is_compat:
                weighted_score += weight * 1.0
                matched_attributes.append(key)
                if msg:
                    positive_factors.append(msg)
            else:
                diff_desc = f"{key.capitalize()} differs: {val1} vs {val2}"
                differences.append(diff_desc)
                negative_factors.append(diff_desc)
                if key in CRITICAL_ATTRIBUTES:
                    critical_mismatches.append(f"{key}: {val1} != {val2}")
        else:
            # One has the attribute and the other does not.
            # Mild missing penalty to total weight
            total_weight += weight * 0.4
            present_key = key
            val = val1 if val1 is not None else val2
            # Missing attribute is recorded as neutral or slight difference
            differences.append(f"{present_key} specified only in one material ({val})")

    if total_weight > 0:
        base_attr_score = weighted_score / total_weight
    else:
        base_attr_score = 0.5

    # If critical mismatches occurred (e.g. length 50mm vs 100mm, or M16 vs M20),
    # penalize attribute score substantially
    if critical_mismatches:
        penalty_factor = 0.5 ** len(critical_mismatches)
        final_attr_score = base_attr_score * penalty_factor
    else:
        final_attr_score = base_attr_score

    return float(np.clip(final_attr_score, 0.0, 1.0)), matched_attributes, differences, positive_factors, negative_factors
