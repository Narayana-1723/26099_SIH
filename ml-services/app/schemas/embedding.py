from typing import List
from pydantic import BaseModel, Field


class EmbeddingRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=200, description="List of normalized or raw texts to embed")


class EmbeddingResponse(BaseModel):
    embeddings: List[List[float]] = Field(..., description="Dense semantic embedding vectors")
    dimension: int = Field(..., description="Dimensionality of the embedding vectors")
    modelVersion: str = Field(..., description="Traceable model version")
    device: str = Field(default="cpu", description="Compute device used")
