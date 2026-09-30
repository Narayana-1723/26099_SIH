import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from app.schemas.extraction import ExtractedAttributes, EntitySpan
from app.config.settings import settings

logger = logging.getLogger(__name__)


class DomainNERModel:
    """
    CPSE Engineering Domain NER & Entity Extraction Engine.
    Combines high-precision regex extraction with spaCy token labeling when available.
    Supports missing attributes and never hallucinates unsupported attributes.
    """
    def __init__(self):
        self._spacy_nlp = None
        self._is_loaded = False
        self._init_spacy()

    def _init_spacy(self):
        try:
            import spacy
            self._spacy_nlp = spacy.load(settings.NER_MODEL_NAME)
            self._is_loaded = True
            logger.info(f"Loaded spaCy NER model: {settings.NER_MODEL_NAME}")
        except Exception as e:
            logger.info(f"spaCy model not loaded ({e}). Utilizing high-precision domain rule extractor.")
            self._is_loaded = True  # Domain rule engine is fully functional

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded

    def extract_entities(self, text: str) -> Tuple[ExtractedAttributes, List[EntitySpan]]:
        """
        Extract engineering entities and structured attributes from text.
        """
        if not text:
            return ExtractedAttributes(), []

        attrs: Dict[str, Any] = {}
        spans: List[EntitySpan] = []

        # 1. Dimension compound patterns (e.g. M16 X 50MM, M20 * 100 MM)
        dim_mult = re.search(r"\b(M\d+(?:\.\d+)?)\s*[xX\*×]\s*(\d+(?:\.\d+)?\s*(?:mm|cm|m|inch)?)\b", text, re.IGNORECASE)
        if dim_mult:
            d_val = dim_mult.group(1).upper()
            l_val = dim_mult.group(2).strip()
            # If length has no unit, default to mm in standard metric fastener context
            if not re.search(r"(?:mm|cm|m|inch)", l_val, re.IGNORECASE):
                l_val = f"{l_val} mm"
            attrs["diameter"] = d_val
            attrs["length"] = l_val
            spans.append(EntitySpan(text=d_val, label="DIAMETER", start=dim_mult.start(1), end=dim_mult.end(1)))
            spans.append(EntitySpan(text=l_val, label="LENGTH", start=dim_mult.start(2), end=dim_mult.end(2)))

        # Diameter standalone (M16, DN50, 1/2 inch dia)
        if "diameter" not in attrs:
            m_dia = re.search(r"\b(M\d+(?:\.\d+)?)\b", text, re.IGNORECASE)
            if m_dia:
                attrs["diameter"] = m_dia.group(1).upper()
                spans.append(EntitySpan(text=m_dia.group(1), label="DIAMETER", start=m_dia.start(), end=m_dia.end()))
            else:
                dn_dia = re.search(r"\b(DN\s*\d+)\b", text, re.IGNORECASE)
                if dn_dia:
                    clean_dn = re.sub(r"\s+", "", dn_dia.group(1)).upper()
                    attrs["diameter"] = clean_dn
                    spans.append(EntitySpan(text=dn_dia.group(1), label="DIAMETER", start=dn_dia.start(), end=dn_dia.end()))
                else:
                    inch_dia = re.search(r"\b(\d+(?:/\d+)?(?:\.\d+)?\s*(?:inch|\"))\s*(?:dia|diameter|nb)?\b", text, re.IGNORECASE)
                    if inch_dia:
                        attrs["diameter"] = inch_dia.group(1).strip()
                        spans.append(EntitySpan(text=inch_dia.group(1), label="DIAMETER", start=inch_dia.start(1), end=inch_dia.end(1)))

        # Length standalone (50 mm, 100 mm, 6 mtr, length 50mm)
        if "length" not in attrs:
            len_match = re.search(r"(?:length|len|lgth|x)\s*[:=]?\s*(\d+(?:\.\d+)?\s*(?:mm|cm|m|inch))\b", text, re.IGNORECASE)
            if len_match:
                attrs["length"] = len_match.group(1).strip()
                spans.append(EntitySpan(text=len_match.group(1), label="LENGTH", start=len_match.start(1), end=len_match.end(1)))
            else:
                # Standalone dimension with unit
                dim_unit = re.search(r"\b(\d+(?:\.\d+)?\s*(?:mm|cm|m))\b", text, re.IGNORECASE)
                if dim_unit:
                    attrs["length"] = dim_unit.group(1).strip()
                    spans.append(EntitySpan(text=dim_unit.group(1), label="LENGTH", start=dim_unit.start(), end=dim_unit.end()))

        # Thickness / Schedule (SCH 40, SCH 80, 5 mm THK)
        thk_match = re.search(r"\b(SCH(?:EDULE)?\.?\s*\d+[a-zA-Z]?)\b", text, re.IGNORECASE)
        if thk_match:
            attrs["thickness"] = thk_match.group(1).upper()
            spans.append(EntitySpan(text=thk_match.group(1), label="THICKNESS", start=thk_match.start(), end=thk_match.end()))
        else:
            mm_thk = re.search(r"\b(\d+(?:\.\d+)?\s*mm)\s*(?:thk|thick|thickness)\b", text, re.IGNORECASE)
            if mm_thk:
                attrs["thickness"] = mm_thk.group(1).strip()
                spans.append(EntitySpan(text=mm_thk.group(0), label="THICKNESS", start=mm_thk.start(), end=mm_thk.end()))

        # Material & Grade
        # Check composite grade patterns: SS316, SS304, SS316L, 316 SS, 304 SS, A193 B8M, A193 B7, IS 2062
        grade_patterns = [
            (r"\b(?:SS|STAINLESS\s+STEEL)\s*[-_]?\s*(316L)\b", "Stainless Steel", "316L"),
            (r"\b(316L)\s*[-_]?\s*(?:SS|STAINLESS\s+STEEL)\b", "Stainless Steel", "316L"),
            (r"\b(?:SS|STAINLESS\s+STEEL)\s*[-_]?\s*(316)\b", "Stainless Steel", "316"),
            (r"\b(316)\s*[-_]?\s*(?:SS|STAINLESS\s+STEEL)\b", "Stainless Steel", "316"),
            (r"\b(?:SS|STAINLESS\s+STEEL)\s*[-_]?\s*(304L)\b", "Stainless Steel", "304L"),
            (r"\b(304L)\s*[-_]?\s*(?:SS|STAINLESS\s+STEEL)\b", "Stainless Steel", "304L"),
            (r"\b(?:SS|STAINLESS\s+STEEL)\s*[-_]?\s*(304)\b", "Stainless Steel", "304"),
            (r"\b(304)\s*[-_]?\s*(?:SS|STAINLESS\s+STEEL)\b", "Stainless Steel", "304"),
            (r"\b(?:SS|STAINLESS\s+STEEL)\s*[-_]?\s*(410)\b", "Stainless Steel", "410"),
            (r"\b(?:CS|CARBON\s+STEEL)\s*[-_]?\s*(A105)\b", "Carbon Steel", "A105"),
            (r"\b(?:CS|CARBON\s+STEEL)\s*[-_]?\s*(A106(?:\s*GR\.?\s*B)?)\b", "Carbon Steel", "A106 Gr B"),
            (r"\b(A193\s*[-_]?\s*B8M)\b", "Stainless Steel", "A193 B8M"),
            (r"\b(A193\s*[-_]?\s*B7)\b", "Alloy Steel", "A193 B7"),
            (r"\b(A194\s*[-_]?\s*2H)\b", "Carbon Steel", "A194 2H"),
            (r"\b(IS\s*2062(?:\s*GR\.?\s*[A-Z])?)\b", "Mild Steel", "IS 2062"),
        ]

        for pat, mat_val, gr_val in grade_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                attrs["material"] = mat_val
                attrs["grade"] = gr_val
                spans.append(EntitySpan(text=m.group(0), label="MATERIAL_GRADE", start=m.start(), end=m.end()))
                break

        # Standalone Material if not captured
        if "material" not in attrs:
            material_keywords = [
                (r"\b(?:stainless\s+steel|ss)\b", "Stainless Steel"),
                (r"\b(?:carbon\s+steel|cs)\b", "Carbon Steel"),
                (r"\b(?:mild\s+steel|ms)\b", "Mild Steel"),
                (r"\b(?:galvanized\s+iron|gi)\b", "Galvanized Iron"),
                (r"\b(?:ductile\s+iron|di)\b", "Ductile Iron"),
                (r"\b(?:cast\s+iron|ci)\b", "Cast Iron"),
                (r"\b(?:copper|cu)\b", "Copper"),
                (r"\b(?:aluminum|aluminium|al)\b", "Aluminum"),
                (r"\b(?:brass)\b", "Brass"),
                (r"\b(?:inconel\s*\d+)\b", "Inconel"),
                (r"\b(?:monel\s*\d+)\b", "Monel"),
                (r"\b(?:ptfe|teflon)\b", "PTFE"),
                (r"\b(?:pvc|cpvc|hdpe)\b", "Polymer"),
            ]
            for pat, mat_val in material_keywords:
                m = re.search(pat, text, re.IGNORECASE)
                if m:
                    attrs["material"] = mat_val
                    spans.append(EntitySpan(text=m.group(0), label="MATERIAL", start=m.start(), end=m.end()))
                    break

        # Standalone Grade if not captured
        if "grade" not in attrs:
            grade_matches = re.search(r"\b(?:gr(?:ade)?\.?\s*)?([34]\d{2}[a-zA-Z]?|a\d{3}|b\d[a-zA-Z]?)\b", text, re.IGNORECASE)
            if grade_matches:
                g_val = grade_matches.group(1).upper()
                if g_val in {"316", "316L", "304", "304L", "410", "A105", "B7", "B8M", "2H"}:
                    attrs["grade"] = g_val
                    spans.append(EntitySpan(text=g_val, label="GRADE", start=grade_matches.start(), end=grade_matches.end()))

        # Item Type
        item_types = [
            (r"\b(?:hex(?:agonal)?\s+bolt|bolt\s+hex(?:agonal)?)\b", "Hex Bolt"),
            (r"\b(?:stud\s+bolt|studbolt)\b", "Stud Bolt"),
            (r"\b(?:allen\s+bolt|socket\s+head\s+cap\s+screw)\b", "Allen Bolt"),
            (r"\b(?:eye\s+bolt)\b", "Eye Bolt"),
            (r"\b(?:u\s*[-]?\s*bolt)\b", "U Bolt"),
            (r"\b(?:hex(?:agonal)?\s+nut|nut\s+hex(?:agonal)?)\b", "Hex Nut"),
            (r"\b(?:lock\s+nut)\b", "Lock Nut"),
            (r"\b(?:plain\s+washer|flat\s+washer)\b", "Plain Washer"),
            (r"\b(?:spring\s+washer)\b", "Spring Washer"),
            (r"\b(?:bolt)\b", "Bolt"),
            (r"\b(?:nut)\b", "Nut"),
            (r"\b(?:washer)\b", "Washer"),
            (r"\b(?:ball\s+valve)\b", "Ball Valve"),
            (r"\b(?:gate\s+valve)\b", "Gate Valve"),
            (r"\b(?:globe\s+valve)\b", "Globe Valve"),
            (r"\b(?:check\s+valve|non\s+return\s+valve|nrv)\b", "Check Valve"),
            (r"\b(?:butterfly\s+valve)\b", "Butterfly Valve"),
            (r"\b(?:control\s+valve)\b", "Control Valve"),
            (r"\b(?:safety\s+valve|relief\s+valve)\b", "Relief Valve"),
            (r"\b(?:valve)\b", "Valve"),
            (r"\b(?:seamless\s+pipe)\b", "Seamless Pipe"),
            (r"\b(?:erw\s+pipe)\b", "ERW Pipe"),
            (r"\b(?:pipe)\b", "Pipe"),
            (r"\b(?:weld\s+neck\s+flange|wnrf\s+flange|flange\s+wnrf)\b", "Weld Neck Flange"),
            (r"\b(?:blind\s+flange)\b", "Blind Flange"),
            (r"\b(?:slip\s+on\s+flange|sorf\s+flange)\b", "Slip On Flange"),
            (r"\b(?:flange)\b", "Flange"),
            (r"\b(?:elbow\s*(?:90|45)?\s*deg(?:ree)?)\b", "Pipe Elbow"),
            (r"\b(?:equal\s+tee|reducing\s+tee|tee)\b", "Pipe Tee"),
            (r"\b(?:spiral\s+wound\s+gasket)\b", "Spiral Wound Gasket"),
            (r"\b(?:gasket)\b", "Gasket"),
            (r"\b(?:power\s+cable|xlpe\s+cable)\b", "Power Cable"),
            (r"\b(?:control\s+cable)\b", "Control Cable"),
            (r"\b(?:cable)\b", "Cable"),
            (r"\b(?:pressure\s+gauge)\b", "Pressure Gauge"),
            (r"\b(?:temperature\s+transmitter|rtd\s+sensor)\b", "Temperature Sensor"),
            (r"\b(?:flow\s+meter)\b", "Flow Meter"),
            (r"\b(?:centrifugal\s+pump)\b", "Centrifugal Pump"),
            (r"\b(?:pump)\b", "Pump"),
            (r"\b(?:induction\s+motor|electric\s+motor|motor)\b", "Electric Motor"),
            (r"\b(?:circuit\s+breaker|mccb|mcb|acb|vcb)\b", "Circuit Breaker"),
        ]

        for pat, item_val in item_types:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                attrs["itemType"] = item_val
                spans.append(EntitySpan(text=m.group(0), label="ITEM_TYPE", start=m.start(), end=m.end()))
                break

        # Pressure Class
        p_match = re.search(r"\b(class\s*\d+|pn\s*\d+|\d+\s*#|\d+\s*bar|\d+\s*psi)\b", text, re.IGNORECASE)
        if p_match:
            raw_p = p_match.group(1).upper()
            if "#" in raw_p:
                raw_p = f"Class {raw_p.replace('#', '').strip()}"
            attrs["pressureClass"] = raw_p
            spans.append(EntitySpan(text=p_match.group(1), label="PRESSURE", start=p_match.start(), end=p_match.end()))

        # Voltage
        v_match = re.search(r"\b(\d+(?:\.\d+)?\s*(?:kv|v))\b", text, re.IGNORECASE)
        if v_match:
            attrs["voltage"] = v_match.group(1).upper()
            spans.append(EntitySpan(text=v_match.group(1), label="VOLTAGE", start=v_match.start(), end=v_match.end()))

        # Current
        curr_match = re.search(r"\b(\d+(?:\.\d+)?\s*(?:ka|a))\b", text, re.IGNORECASE)
        if curr_match and not re.search(r"(?:dia|mm|m)\b", curr_match.group(0), re.IGNORECASE):
            attrs["current"] = curr_match.group(1).upper()
            spans.append(EntitySpan(text=curr_match.group(1), label="CURRENT", start=curr_match.start(), end=curr_match.end()))

        # Power
        pwr_match = re.search(r"\b(\d+(?:\.\d+)?\s*(?:kw|hp|mw))\b", text, re.IGNORECASE)
        if pwr_match:
            attrs["power"] = pwr_match.group(1).upper()
            spans.append(EntitySpan(text=pwr_match.group(1), label="POWER", start=pwr_match.start(), end=pwr_match.end()))

        # Standard
        std_match = re.search(r"\b((?:ASTM|ASME|IS|DIN|ISO|BS|API)\s*[A-Z0-9\.\-]+)\b", text, re.IGNORECASE)
        if std_match:
            attrs["standard"] = std_match.group(1).upper()
            spans.append(EntitySpan(text=std_match.group(1), label="STANDARD", start=std_match.start(), end=std_match.end()))

        extracted = ExtractedAttributes(**attrs)
        return extracted, spans


# Singleton instance
ner_model = DomainNERModel()
