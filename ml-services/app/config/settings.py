import os
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    DEBUG: bool = False

    # Hardware Acceleration
    DEVICE: str = "cpu"

    # Model Configuration
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    NER_MODEL_NAME: str = "en_core_web_sm"
    CLASSIFICATION_MODEL_PATH: str = "models/classification/taxonomy_classifier.joblib"
    MODEL_CACHE_DIR: str = "models/cache"

    # Traceable Model and Pipeline Versions
    MODEL_VERSION_EMBEDDING: str = "embedding-v1"
    MODEL_VERSION_NER: str = "ner-v1"
    MODEL_VERSION_CLASSIFIER: str = "classifier-v1"
    PIPELINE_VERSION: str = "harmonization-v1"

    # Hybrid Matching Weights
    SEMANTIC_WEIGHT: float = 0.40
    LEXICAL_WEIGHT: float = 0.25
    ATTRIBUTE_WEIGHT: float = 0.35

    # Match Classification Thresholds
    EXACT_MATCH_THRESHOLD: float = 0.90
    EQUIVALENT_MATCH_THRESHOLD: float = 0.75
    SIMILAR_MATCH_THRESHOLD: float = 0.50
    DUPLICATE_THRESHOLD: float = 0.85

    # Internal Security (Spring Boot to ML Service)
    INTERNAL_API_KEY: Optional[str] = None


settings = Settings()
