import re
from typing import List, Tuple, Dict

# Standard engineering abbreviation expansions
ABBREVIATIONS: Dict[str, str] = {
    r"\bSS\b": "stainless steel",
    r"\bS\.S\.\b": "stainless steel",
    r"\bCS\b": "carbon steel",
    r"\bC\.S\.\b": "carbon steel",
    r"\bMS\b": "mild steel",
    r"\bM\.S\.\b": "mild steel",
    r"\bGI\b": "galvanized iron",
    r"\bG\.I\.\b": "galvanized iron",
    r"\bDI\b": "ductile iron",
    r"\bD\.I\.\b": "ductile iron",
    r"\bCI\b": "cast iron",
    r"\bC\.I\.\b": "cast iron",
    r"\bCU\b": "copper",
    r"\bAL\b": "aluminum",
    r"\bHEX\b": "hexagonal",
    r"\bHDG\b": "hot dip galvanized",
    r"\bHT\b": "high tensile",
    r"\bTHK\b": "thickness",
    r"\bTHICK\b": "thickness",
    r"\bOD\b": "outer diameter",
    r"\bO\.D\.\b": "outer diameter",
    r"\bID\b": "inner diameter",
    r"\bI\.D\.\b": "inner diameter",
    r"\bNB\b": "nominal bore",
    r"\bSCH\b": "schedule",
    r"\bSCH\.\b": "schedule",
    r"\bSTD\b": "standard",
    r"\bSPEC\b": "specification",
    r"\bQTY\b": "quantity",
    r"\bNO\b": "number",
    r"\bNOS\b": "numbers",
    r"\bREQ\b": "required",
    r"\bRF\b": "raised face",
    r"\bFF\b": "flat face",
    r"\bRTJ\b": "ring type joint",
    r"\bSW\b": "socket weld",
    r"\bBW\b": "butt weld",
    r"\bNPT\b": "national pipe taper",
    r"\bBSP\b": "british standard pipe",
    r"\bBSPT\b": "british standard pipe taper",
}

# Unit regex standardization rules
UNIT_PATTERNS: List[Tuple[str, str]] = [
    # Length & Dimensions
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:mm|m\.m\.|millimeter(?:s)?)\b", r"\1 mm"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:cm|c\.m\.|centimeter(?:s)?)\b", r"\1 cm"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:m|mtr|meter(?:s)?)\b", r"\1 m"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:inch(?:es)?|in|\")\b", r"\1 inch"),
    (r"(?i)\b(\d+/\d+)\s*(?:inch(?:es)?|in|\")\b", r"\1 inch"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|\')\b", r"\1 ft"),
    
    # Metric thread notation (e.g., M 16 -> M16)
    (r"(?i)\bM\s*(\d+(?:\.\d+)?)\b", r"M\1"),
    
    # Nominal Diameter (e.g., DN 50 -> DN50)
    (r"(?i)\bDN\s*(\d+)\b", r"DN\1"),
    
    # Pressure
    (r"(?i)\bPN\s*(\d+)\b", r"PN\1"),
    (r"(?i)\b(\d+)\s*(?:#|lbs?|pound(?:s)?)\b", r"class \1"),
    (r"(?i)\b(?:cl|class)\.?\s*(\d+)\b", r"class \1"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:bar)\b", r"\1 bar"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:psi)\b", r"\1 psi"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:kpa)\b", r"\1 kpa"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:mpa)\b", r"\1 mpa"),

    # Electrical units
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:kv|k\.v\.|kilovolt(?:s)?)\b", r"\1 kv"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:v|volt(?:s)?)\b", r"\1 v"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:ka|k\.a\.|kiloamp(?:s)?|kiloampere(?:s)?)\b", r"\1 ka"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:a|amp(?:s)?|ampere(?:s)?)\b", r"\1 a"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:kw|k\.w\.|kilowatt(?:s)?)\b", r"\1 kw"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:mw|m\.w\.|megawatt(?:s)?)\b", r"\1 mw"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:hp|h\.p\.|horsepower)\b", r"\1 hp"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:hz|hertz)\b", r"\1 hz"),

    # Weight
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilogram(?:s)?)\b", r"\1 kg"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:gm|gms|g|gram(?:s)?)\b", r"\1 g"),
    (r"(?i)\b(\d+(?:\.\d+)?)\s*(?:mt|ton(?:ne)?(?:s)?)\b", r"\1 mt"),
]

# Material & Grade patterns (e.g., SS316, 316SS, 316 SS -> stainless steel 316)
GRADE_REPLACEMENTS: List[Tuple[str, str]] = [
    (r"(?i)\b(?:SS|STAINLESS\s+STEEL)\s*[-_]?\s*(316L)\b", r"stainless steel 316l"),
    (r"(?i)\b(316L)\s*[-_]?\s*(?:SS|STAINLESS\s+STEEL)\b", r"stainless steel 316l"),
    (r"(?i)\b(?:SS|STAINLESS\s+STEEL)\s*[-_]?\s*(316)\b", r"stainless steel 316"),
    (r"(?i)\b(316)\s*[-_]?\s*(?:SS|STAINLESS\s+STEEL)\b", r"stainless steel 316"),
    
    (r"(?i)\b(?:SS|STAINLESS\s+STEEL)\s*[-_]?\s*(304L)\b", r"stainless steel 304l"),
    (r"(?i)\b(304L)\s*[-_]?\s*(?:SS|STAINLESS\s+STEEL)\b", r"stainless steel 304l"),
    (r"(?i)\b(?:SS|STAINLESS\s+STEEL)\s*[-_]?\s*(304)\b", r"stainless steel 304"),
    (r"(?i)\b(304)\s*[-_]?\s*(?:SS|STAINLESS\s+STEEL)\b", r"stainless steel 304"),
    
    (r"(?i)\b(?:SS|STAINLESS\s+STEEL)\s*[-_]?\s*(410)\b", r"stainless steel 410"),
    (r"(?i)\b(410)\s*[-_]?\s*(?:SS|STAINLESS\s+STEEL)\b", r"stainless steel 410"),
    
    (r"(?i)\b(?:CS|CARBON\s+STEEL)\s*[-_]?\s*(A105|A106|A53)\b", r"carbon steel \1"),
    (r"(?i)\b(A105|A106|A53)\s*[-_]?\s*(?:CS|CARBON\s+STEEL)\b", r"carbon steel \1"),
]


def clean_symbols_and_delimiters(text: str) -> str:
    """Normalize symbols, engineering delimiters, and multiple spaces."""
    if not text:
        return ""

    # Replace diameter symbols
    text = re.sub(r"[Øø]", " diameter ", text)
    
    # Replace dimension multiplier symbols (e.g. 16x50, 16 X 50, 16*50, 16 × 50)
    text = re.sub(r"(\d+)\s*[xX\*×]\s*(\d+)", r"\1 x \2", text)
    text = re.sub(r"\s+[xX\*×]\s+", " x ", text)

    # Normalize slashes with spaces around numbers (e.g. 1 / 2 inch -> 1/2 inch)
    text = re.sub(r"(\d+)\s*/\s*(\d+)", r"\1/\2", text)

    # Remove uncommon non-ascii / weird punctuation but keep dashes and dots
    text = re.sub(r"[^\w\s\.\-\/\#\"\']", " ", text)

    # Collapse multiple dots or dashes
    text = re.sub(r"\.{2,}", ".", text)
    text = re.sub(r"\-{2,}", "-", text)

    # Collapse whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def expand_abbreviations(text: str) -> str:
    """Expand domain-specific abbreviations to standardized full forms."""
    if not text:
        return ""
    
    for pattern, replacement in ABBREVIATIONS.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    return text


def standardize_grades(text: str) -> str:
    """Normalize grade and material expressions like SS316 or 316 SS."""
    if not text:
        return ""
    for pattern, replacement in GRADE_REPLACEMENTS:
        text = re.sub(pattern, replacement, text)
    return text


def standardize_units(text: str) -> str:
    """Standardize units with uniform space and casing."""
    if not text:
        return ""
    for pattern, replacement in UNIT_PATTERNS:
        text = re.sub(pattern, replacement, text)
    return text


def normalize_material_description(description: str) -> str:
    """
    Complete material description normalization pipeline.
    Standardizes casing, punctuation, abbreviations, material grades, units, and engineering notation.
    """
    if not description or not description.strip():
        return ""

    text = description.strip()

    # Step 1: Standardize grades and materials (handles SS316, 316 SS before abbreviation expansion)
    text = standardize_grades(text)

    # Step 2: Expand domain abbreviations (SS -> stainless steel, HEX -> hexagonal)
    text = expand_abbreviations(text)

    # Step 3: Clean symbols, delimiters, multipliers
    text = clean_symbols_and_delimiters(text)

    # Step 4: Standardize engineering units and dimensions
    text = standardize_units(text)

    # Step 5: Lowercase and clean excess spaces
    text = text.lower()
    text = re.sub(r"\s+", " ", text).strip()

    # Preserve special capitalized prefixes if standard (e.g. M16, DN50, PN16)
    def capitalize_standards(match):
        return match.group(0).upper()

    text = re.sub(r"\b(m\d+(?:\.\d+)?|dn\d+|pn\d+)\b", capitalize_standards, text)

    return text


def tokenize(text: str) -> List[str]:
    """Tokenize normalized text into clean tokens."""
    if not text:
        return []
    return [t for t in re.split(r"[\s\-_,]+", text) if t]
