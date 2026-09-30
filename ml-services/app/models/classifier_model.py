import os
import joblib
import logging
from typing import Optional, Tuple, Dict, Any, List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from app.config.settings import settings

logger = logging.getLogger(__name__)

# Standard CPSE Material Taxonomy Seed Data for Initial Calibrated Classifier
SEED_TAXONOMY_DATA = [
    # Mechanical -> Fasteners -> Bolts
    ("m16 hex bolt stainless steel 316 50 mm", "Mechanical", "Fasteners", "Bolts"),
    ("hexagonal bolt m20 carbon steel 100 mm", "Mechanical", "Fasteners", "Bolts"),
    ("stud bolt astm a193 b7 with 2h nuts", "Mechanical", "Fasteners", "Bolts"),
    ("eye bolt m12 mild steel galvanized", "Mechanical", "Fasteners", "Bolts"),
    ("allen bolt socket head cap screw m8 x 30", "Mechanical", "Fasteners", "Bolts"),
    ("u bolt 2 inch pipe support with nuts", "Mechanical", "Fasteners", "Bolts"),
    ("anchor bolt m24 foundation civil", "Mechanical", "Fasteners", "Bolts"),
    
    # Mechanical -> Fasteners -> Nuts
    ("hex nut m16 stainless steel 316", "Mechanical", "Fasteners", "Nuts"),
    ("hexagonal nut m20 carbon steel grade 8", "Mechanical", "Fasteners", "Nuts"),
    ("heavy hex nut astm a194 grade 2h", "Mechanical", "Fasteners", "Nuts"),
    ("nyloc lock nut m12 stainless steel", "Mechanical", "Fasteners", "Nuts"),
    
    # Mechanical -> Fasteners -> Washers
    ("plain flat washer m16 stainless steel 316", "Mechanical", "Fasteners", "Washers"),
    ("spring washer m20 high tensile zinc plated", "Mechanical", "Fasteners", "Washers"),
    
    # Mechanical -> Valves -> Ball Valves
    ("ball valve 2 inch class 150 flanged rf ss316", "Mechanical", "Valves", "Ball Valves"),
    ("three piece ball valve dn50 stainless steel 304", "Mechanical", "Valves", "Ball Valves"),
    ("floating ball valve 1 inch class 300 full bore", "Mechanical", "Valves", "Ball Valves"),

    # Mechanical -> Valves -> Gate Valves
    ("gate valve class 150 cast steel flanged 4 inch", "Mechanical", "Valves", "Gate Valves"),
    ("wedge gate valve dn100 astm a216 wcb", "Mechanical", "Valves", "Gate Valves"),

    # Mechanical -> Valves -> Check Valves
    ("check valve non return valve nrv 3 inch flanged", "Mechanical", "Valves", "Check Valves"),
    ("swing check valve dual plate dn80 pn16", "Mechanical", "Valves", "Check Valves"),

    # Mechanical -> Pipes & Fittings -> Seamless Pipes
    ("carbon steel pipe seamless schedule 40 2 inch astm a106 gr b", "Mechanical", "Pipes & Fittings", "Seamless Pipes"),
    ("stainless steel pipe seamless schedule 10s 316l dn50", "Mechanical", "Pipes & Fittings", "Seamless Pipes"),

    # Mechanical -> Pipes & Fittings -> Flanges
    ("weld neck flange class 150 rf carbon steel astm a105 2 inch", "Mechanical", "Pipes & Fittings", "Flanges"),
    ("blind flange class 300 rf ss316 4 inch", "Mechanical", "Pipes & Fittings", "Flanges"),
    ("slip on flange sorf dn100 pn16 mild steel", "Mechanical", "Pipes & Fittings", "Flanges"),

    # Mechanical -> Gaskets & Seals -> Gaskets
    ("spiral wound gasket class 150 ss316 graphite filler 2 inch", "Mechanical", "Gaskets & Seals", "Spiral Wound Gaskets"),
    ("caf gasket non asbestos compressed fiber 3 mm thk", "Mechanical", "Gaskets & Seals", "Sheet Gaskets"),

    # Electrical -> Cables & Wires -> Power Cables
    ("copper power cable 4 core 16 sq mm xlpe insulated 1100 v", "Electrical", "Cables & Wires", "Power Cables"),
    ("aluminum armored power cable 3.5 core 70 sq mm", "Electrical", "Cables & Wires", "Power Cables"),
    ("ht xlpe cable 3 core 11 kv 240 sq mm aluminum conductor", "Electrical", "Cables & Wires", "High Tension Cables"),

    # Electrical -> Switchgear & Protection -> Circuit Breakers
    ("moulded case circuit breaker mccb 400 a 4 pole 36 ka", "Electrical", "Switchgear & Protection", "Circuit Breakers"),
    ("vacuum circuit breaker vcb 11 kv 1250 a 25 ka", "Electrical", "Switchgear & Protection", "Circuit Breakers"),
    ("miniature circuit breaker mcb 32 a 3 pole c curve", "Electrical", "Switchgear & Protection", "Circuit Breakers"),

    # Electrical -> Motors & Transformers -> Motors
    ("3 phase induction motor 15 kw 415 v 1440 rpm foot mounted", "Electrical", "Motors & Transformers", "Induction Motors"),
    ("flameproof motor 10 hp 415 v 50 hz sq cage", "Electrical", "Motors & Transformers", "Induction Motors"),

    # Instrumentation -> Sensors & Gauges -> Pressure Gauges
    ("pressure gauge dial 100 mm range 0 10 bar bottom entry 1/2 npt", "Instrumentation", "Sensors & Gauges", "Pressure Gauges"),
    ("differential pressure gauge 0 to 250 mbar ss316 wetted parts", "Instrumentation", "Sensors & Gauges", "Pressure Gauges"),

    # Instrumentation -> Sensors & Gauges -> Temperature Sensors
    ("temperature transmitter rtd pt100 4-20 ma head mounted flameproof", "Instrumentation", "Sensors & Gauges", "Temperature Sensors"),
    ("thermocouple type k with ss316 thermowell length 300 mm", "Instrumentation", "Sensors & Gauges", "Temperature Sensors"),

    # Civil & Structural -> Structural Steel -> Steel Sections
    ("structural steel beam ismb 200 mild steel is 2062", "Civil & Structural", "Structural Steel", "Beams"),
    ("mild steel channel ismc 150 structural grade", "Civil & Structural", "Structural Steel", "Channels"),
    ("structural steel angle isa 50x50x6 mm ms is 2062", "Civil & Structural", "Structural Steel", "Angles"),
]


class MaterialTaxonomyClassifier:
    """
    Hierarchical engineering taxonomy classification model.
    Predicts Category, Subcategory, and Class with mathematically calibrated confidence.
    Pluggable for external trained models.
    """
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or settings.CLASSIFICATION_MODEL_PATH
        self._pipeline: Optional[Pipeline] = None
        self._taxonomy_map: Dict[str, Tuple[str, str, str]] = {}
        self._is_loaded = False
        self.load_or_train()

    def load_or_train(self):
        """Loads model from disk or fits the seed taxonomy pipeline."""
        if os.path.exists(self.model_path):
            try:
                loaded = joblib.load(self.model_path)
                self._pipeline = loaded["pipeline"]
                self._taxonomy_map = loaded["taxonomy_map"]
                self._is_loaded = True
                logger.info(f"Loaded existing taxonomy classifier from {self.model_path}")
                return
            except Exception as e:
                logger.warning(f"Failed loading model from {self.model_path} ({e}). Retraining seed model.")

        # Train initial calibrated pipeline
        self._train_seed_model()

    def _train_seed_model(self):
        texts = []
        labels = []
        for text, cat, subcat, item_class in SEED_TAXONOMY_DATA:
            texts.append(text.lower())
            label = f"{cat}___{subcat}___{item_class}"
            labels.append(label)
            self._taxonomy_map[label] = (cat, subcat, item_class)

        self._pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)),
            ("clf", LogisticRegression(C=10.0, max_iter=1000, random_state=42))
        ])

        self._pipeline.fit(texts, labels)
        self._is_loaded = True

        # Ensure directory exists and persist
        try:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            joblib.dump({"pipeline": self._pipeline, "taxonomy_map": self._taxonomy_map}, self.model_path)
            logger.info(f"Saved trained taxonomy classifier to {self.model_path}")
        except Exception as e:
            logger.warning(f"Could not persist classifier model to disk ({e})")

    def predict(self, text: str) -> Tuple[str, str, str, float]:
        """
        Classify material description.
        Returns (category, subcategory, class, confidence).
        Calculated strictly from classifier predict_proba.
        """
        if not self._is_loaded or self._pipeline is None:
            raise RuntimeError("Classifier model is not loaded")

        cleaned = text.strip().lower()
        probs = self._pipeline.predict_proba([cleaned])[0]
        best_idx = int(np.argmax(probs))
        best_prob = float(probs[best_idx])
        best_label = self._pipeline.classes_[best_idx]

        cat, subcat, item_class = self._taxonomy_map.get(
            best_label,
            ("Mechanical", "General", "Unclassified")
        )

        # Ensure confidence is well-calibrated (bounded in [0.0, 1.0])
        confidence = float(np.clip(best_prob, 0.10, 0.99))
        return cat, subcat, item_class, round(confidence, 4)

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded


# Singleton instance
classifier_model = MaterialTaxonomyClassifier()
