from fastapi import APIRouter
from app.config.settings import settings
from app.models.embedding_model import embedding_manager
from app.models.ner_model import ner_model
from app.models.classifier_model import classifier_model
from app.schemas.common import HealthResponse, ModelStatusResponse

router = APIRouter(tags=["Health & Status"])


@router.get("/health", response_model=HealthResponse)
async def get_health():
    """Health check endpoint to verify microservice readiness."""
    return HealthResponse(
        status="UP",
        version="1.0.0"
    )


@router.get("/model-status", response_model=ModelStatusResponse)
async def get_model_status():
    """Model status endpoint reporting individual model availability."""
    models_status = {
        "embedding": "LOADED" if embedding_manager.is_loaded else "UNAVAILABLE",
        "ner": "LOADED" if ner_model.is_loaded else "UNAVAILABLE",
        "classification": "LOADED" if classifier_model.is_loaded else "UNAVAILABLE",
    }
    overall_status = "UP" if all(v == "LOADED" for v in models_status.values()) else "DEGRADED"

    return ModelStatusResponse(
        status=overall_status,
        models=models_status,
        device=settings.DEVICE
    )
