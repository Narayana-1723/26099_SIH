import uuid
from typing import Optional
from fastapi import Header, HTTPException, status
from app.config.settings import settings
from app.models.embedding_model import embedding_manager
from app.models.ner_model import ner_model
from app.models.classifier_model import classifier_model


async def get_correlation_id(
    x_correlation_id: Optional[str] = Header(None)
) -> str:
    """Extract or generate X-Correlation-ID for request traceability."""
    return x_correlation_id or str(uuid.uuid4())


async def verify_internal_auth(
    x_internal_api_key: Optional[str] = Header(None)
):
    """
    Verifies internal service key if configured.
    Only Spring Boot is permitted to call this service.
    """
    if settings.INTERNAL_API_KEY:
        if not x_internal_api_key or x_internal_api_key != settings.INTERNAL_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: Invalid internal service credentials",
            )


async def check_models_available():
    """Verify that required ML models are ready; return 503 if not."""
    if not embedding_manager.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "errorCode": "MODEL_UNAVAILABLE",
                "message": "Required embedding ML model is currently unavailable",
            }
        )
    if not ner_model.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "errorCode": "MODEL_UNAVAILABLE",
                "message": "Required NER extraction model is currently unavailable",
            }
        )
    if not classifier_model.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "errorCode": "MODEL_UNAVAILABLE",
                "message": "Required classification ML model is currently unavailable",
            }
        )
