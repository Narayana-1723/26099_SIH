from typing import List
from app.utils.text_utils import normalize_material_description, tokenize


class PreprocessingPipeline:
    """
    Modular text preprocessing pipeline for engineering material descriptions.
    Executes staged text cleaning, symbol normalization, unit standardization,
    abbreviation expansion, and engineering notation preservation.
    """

    def process(self, raw_text: str) -> str:
        return normalize_material_description(raw_text)

    def tokenize(self, text: str) -> List[str]:
        return tokenize(text)


preprocessing_pipeline = PreprocessingPipeline()
