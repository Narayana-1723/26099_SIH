from fastapi import APIRouter, Depends
from app.api.dependencies import verify_internal_auth, check_models_available
from app.services.embedding_service import embedding_service
from app.schemas.embedding import EmbeddingRequest, EmbeddingResponse

router = APIRouter(
    prefix="",
    tags=["Embeddings"],
    dependencies=[Depends(verify_internal_auth), Depends(check_models_available)],
)


@router.post("/embeddings", response_model=EmbeddingResponse)
async def generate_embeddings(request: EmbeddingRequest):
    """Generate dense semantic embedding vectors for material descriptions."""
    return embedding_service.generate_embeddings(request)
