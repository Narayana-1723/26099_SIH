import os
import json


def train_ner_pipeline(training_data_path: str = "training/data/sample_materials.json", output_dir: str = "models/ner"):
    """
    Offline training script for custom spaCy / HuggingFace domain NER models.
    Converts CPSE labeled material entities into training format.
    """
    print(f"Reading labeled entity samples from {training_data_path}...")
    if not os.path.exists(training_data_path):
        print(f"File {training_data_path} does not exist.")
        return

    with open(training_data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Found {len(data)} training examples.")
    print("Preparing entity spans...")

    spacy_training_data = []
    for item in data:
        text = item["rawDescription"]
        entities = []
        attrs = item.get("attributes", {})
        for attr_key, attr_val in attrs.items():
            if attr_val and str(attr_val) in text:
                start = text.index(str(attr_val))
                end = start + len(str(attr_val))
                entities.append((start, end, attr_key.upper()))
        spacy_training_data.append((text, {"entities": entities}))

    print(f"Formatted {len(spacy_training_data)} training items for spaCy / transformer NER.")
    print(f"Target directory for saved NER weights: {output_dir}")
    os.makedirs(output_dir, exist_ok=True)
    print("To train with spaCy CLI, execute: python -m spacy train config.cfg --output models/ner")


if __name__ == "__main__":
    train_ner_pipeline()
