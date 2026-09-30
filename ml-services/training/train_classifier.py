import os
import sys

# Ensure root directory is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from training.preprocessing.prepare_dataset import load_and_preprocess_dataset
from app.models.classifier_model import SEED_TAXONOMY_DATA


def train_classifier(output_path: str = "models/classification/taxonomy_classifier.joblib"):
    """
    Offline training script for taxonomy classifier.
    Combines seed taxonomy with any domain-specific data from training/data/.
    """
    print("Preparing training corpus...")
    texts = []
    labels = []
    taxonomy_map = {}

    for text, cat, subcat, item_class in SEED_TAXONOMY_DATA:
        texts.append(text.lower())
        label = f"{cat}___{subcat}___{item_class}"
        labels.append(label)
        taxonomy_map[label] = (cat, subcat, item_class)

    # Ingest extra domain materials if available
    data_file = os.path.join(os.path.dirname(__file__), "data", "sample_materials.json")
    if os.path.exists(data_file):
        extra_data = load_and_preprocess_dataset(data_file)
        for item in extra_data:
            t = item["normalizedDescription"]
            label = f"{item['category']}___{item['subcategory']}___{item['class']}"
            texts.append(t)
            labels.append(label)
            taxonomy_map[label] = (item["category"], item["subcategory"], item["class"])

    print(f"Training Logistic Regression pipeline on {len(texts)} samples...")
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)),
        ("clf", LogisticRegression(C=10.0, max_iter=1000, random_state=42))
    ])

    pipeline.fit(texts, labels)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    joblib.dump({"pipeline": pipeline, "taxonomy_map": taxonomy_map}, output_path)
    print(f"Classifier saved successfully to {output_path}")


if __name__ == "__main__":
    train_classifier()
