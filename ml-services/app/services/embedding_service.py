from typing import List
from app.models.embedding_model import embedding_manager
from app.config.settings import settings
from app.schemas.embedding import EmbeddingRequest, EmbeddingResponse


class EmbeddingService:
    """Service for generating dense semantic embeddings."""

    def generate_embeddings(self, request: EmbeddingRequest) -> EmbeddingResponse:
        embeddings = embedding_manager.encode(request.texts)
        return EmbeddingResponse(
            embeddings=embeddings,
            dimension=embedding_manager.dimension,
            modelVersion=embedding_manager.model_version,
            device=settings.DEVICE,
        )

    def encode_texts(self, texts: List[str]) -> List[List[float]]:
        """Convenience method for internal services."""
        return embedding_manager.encode(texts)


embedding_service = EmbeddingService()
