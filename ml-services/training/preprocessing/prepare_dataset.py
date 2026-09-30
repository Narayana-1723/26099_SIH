import json
import os
import sys

# Ensure root directory is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from typing import List, Dict, Any
from app.utils.text_utils import normalize_material_description


def load_and_preprocess_dataset(filepath: str) -> List[Dict[str, Any]]:
    """Loads raw dataset and normalizes descriptions for training pipelines."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Dataset file not found: {filepath}")

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    for item in data:
        item["normalizedDescription"] = normalize_material_description(item["rawDescription"])

    return data


if __name__ == "__main__":
    current_dir = os.path.dirname(__file__)
    data_path = os.path.join(current_dir, "..", "data", "sample_materials.json")
    dataset = load_and_preprocess_dataset(data_path)
    print(f"Loaded and preprocessed {len(dataset)} material records.")
