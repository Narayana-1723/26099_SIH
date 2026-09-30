import re
from typing import Optional, Tuple, Dict, Any

# Standard unit conversion factors to base units (length to mm, voltage to V, etc.)
LENGTH_CONVERSIONS = {
    "mm": 1.0,
    "cm": 10.0,
    "m": 1000.0,
    "meter": 1000.0,
    "inch": 25.4,
    "in": 25.4,
    "ft": 304.8,
}

VOLTAGE_CONVERSIONS = {
    "v": 1.0,
    "volt": 1.0,
    "kv": 1000.0,
}

POWER_CONVERSIONS = {
    "w": 1.0,
    "kw": 1000.0,
    "mw": 1000000.0,
    "hp": 745.7,
}

PRESSURE_CONVERSIONS = {
    "bar": 1.0,
    "psi": 0.0689476,
    "kpa": 0.01,
    "mpa": 10.0,
}

CRITICAL_ATTRIBUTES = {
    "itemType",
    "material",
    "grade",
    "diameter",
    "length",
    "voltage",
    "current",
    "pressureClass",
}


def parse_numeric_with_unit(text: str) -> Tuple[Optional[float], Optional[str]]:
    """
    Parses a string like '50 mm', '2.5 inch', '1/2 inch', '11 kv' into numeric value and unit.
    """
    if not text:
        return None, None

    text = text.strip().lower()

    # Handle fractional inches (e.g. 1/2 inch, 3/4 inch, 1-1/2 inch)
    frac_match = re.match(r"^(\d+)?(?:\s*[- ]\s*)?(\d+)/(\d+)\s*([a-z\"\'\#]+)?$", text)
    if frac_match:
        whole = float(frac_match.group(1)) if frac_match.group(1) else 0.0
        numerator = float(frac_match.group(2))
        denominator = float(frac_match.group(3))
        unit = frac_match.group(4) or "inch"
        val = whole + (numerator / denominator)
        return val, unit

    # Handle decimal / integer notation
    match = re.match(r"^(\d+(?:\.\d+)?)\s*([a-z\"\'\#]+)?$", text)
    if match:
        val = float(match.group(1))
        unit = match.group(2)
        return val, unit

    return None, None


def normalize_dimension_to_mm(value_str: str) -> Optional[float]:
    """Convert dimension string to millimeters for standardized comparison."""
    if not value_str:
        return None
    val, unit = parse_numeric_with_unit(value_str)
    if val is None:
        return None
    if not unit:
        # Default assume mm in engineering context if not specified
        return val
    factor = LENGTH_CONVERSIONS.get(unit)
    if factor:
        return val * factor
    return None


def are_dimensions_compatible(dim1: str, dim2: str, tolerance_pct: float = 0.03) -> Tuple[bool, Optional[str]]:
    """
    Compare two dimension strings (e.g. '50 mm' vs '5 cm', '50 mm' vs '100 mm', 'M16' vs 'M16').
    Returns (is_compatible, explanation_message).
    """
    if not dim1 or not dim2:
        return True, None  # Cannot confirm mismatch if one is missing

    s1 = dim1.strip().upper()
    s2 = dim2.strip().upper()

    # Exact string match
    if s1 == s2:
        return True, f"Identical: {dim1}"

    # Check metric thread notation (e.g. M16 vs M20)
    if s1.startswith("M") or s2.startswith("M"):
        if s1 != s2:
            return False, f"Thread/diameter differs: {dim1} vs {dim2}"
        return True, f"Identical thread: {dim1}"

    # Check DN (nominal diameter) notation (e.g. DN50 vs DN100)
    if s1.startswith("DN") or s2.startswith("DN"):
        if s1 != s2:
            return False, f"Nominal diameter differs: {dim1} vs {dim2}"
        return True, f"Identical nominal diameter: {dim1}"

    # Try numeric unit conversion to mm
    mm1 = normalize_dimension_to_mm(dim1)
    mm2 = normalize_dimension_to_mm(dim2)

    if mm1 is not None and mm2 is not None:
        if mm1 == 0 and mm2 == 0:
            return True, "Identical: 0"
        diff = abs(mm1 - mm2)
        rel_diff = diff / max(mm1, mm2)
        if rel_diff <= tolerance_pct:
            return True, f"Equivalent dimensions: {dim1} ≈ {dim2}"
        else:
            return False, f"Dimension differs: {dim1} vs {dim2}"

    # Fallback to normalized lowercase string comparison
    if dim1.strip().lower() == dim2.strip().lower():
        return True, f"Equivalent: {dim1}"

    return False, f"Different values: {dim1} vs {dim2}"


def are_materials_compatible(mat1: str, mat2: str) -> Tuple[bool, Optional[str]]:
    """Compare material specifications (e.g. 'Stainless Steel' vs 'Stainless Steel')."""
    if not mat1 or not mat2:
        return True, None

    m1 = mat1.strip().lower()
    m2 = mat2.strip().lower()

    if m1 == m2:
        return True, f"Same material: {mat1}"

    # Common aliases
    aliases = [
        {"stainless steel", "ss", "inox"},
        {"carbon steel", "cs"},
        {"mild steel", "ms"},
        {"galvanized iron", "gi"},
        {"copper", "cu"},
        {"aluminum", "aluminium", "al"},
    ]

    for group in aliases:
        if m1 in group and m2 in group:
            return True, f"Equivalent material: {mat1} / {mat2}"

    return False, f"Material differs: {mat1} vs {mat2}"


def are_grades_compatible(grade1: str, grade2: str) -> Tuple[bool, Optional[str]]:
    """Compare material grades (e.g. '316' vs '316', '316' vs '304')."""
    if not grade1 or not grade2:
        return True, None

    g1 = grade1.strip().lower()
    g2 = grade2.strip().lower()

    if g1 == g2:
        return True, f"Same grade: {grade1}"

    # Low carbon variant equivalence checks (e.g. 316 vs 316L, 304 vs 304L)
    if (g1 == "316" and g2 == "316l") or (g1 == "316l" and g2 == "316"):
        return True, f"Compatible grade variant: {grade1} ≈ {grade2}"
    if (g1 == "304" and g2 == "304l") or (g1 == "304l" and g2 == "304"):
        return True, f"Compatible grade variant: {grade1} ≈ {grade2}"

    return False, f"Grade differs: {grade1} vs {grade2}"


def are_item_types_compatible(type1: str, type2: str) -> Tuple[bool, Optional[str]]:
    """Compare item types (e.g. 'Hex Bolt' vs 'Hexagonal Bolt')."""
    if not type1 or not type2:
        return True, None

    t1 = type1.strip().lower()
    t2 = type2.strip().lower()

    if t1 == t2:
        return True, f"Same item type: {type1}"

    # Synonyms
    synonyms = [
        {"hex bolt", "hexagonal bolt", "bolt hex"},
        {"ball valve", "valve ball"},
        {"gate valve", "valve gate"},
        {"pipe", "seamless pipe", "erw pipe"},
        {"flange", "weld neck flange", "blind flange", "slip on flange"},
    ]

    for group in synonyms:
        if t1 in group and t2 in group:
            return True, f"Equivalent item type: {type1} ≈ {type2}"

    # Word overlap
    words1 = set(t1.split())
    words2 = set(t2.split())
    if words1 == words2:
        return True, f"Same item type: {type1}"

    # Core noun check: if one is 'bolt' and other is 'nut', incompatible
    if ("bolt" in t1 and "nut" in t2) or ("nut" in t1 and "bolt" in t2):
        return False, f"Incompatible item types: {type1} vs {type2}"
    if ("valve" in t1 and "pipe" in t2) or ("pipe" in t1 and "valve" in t2):
        return False, f"Incompatible item types: {type1} vs {type2}"

    return False, f"Item type differs: {type1} vs {type2}"
