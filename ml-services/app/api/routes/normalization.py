from fastapi import APIRouter, Depends
from app.api.dependencies import verify_internal_auth
from app.services.normalization_service import normalization_service
from app.schemas.normalization import (
    NormalizeRequest,
    NormalizeResponse,
    BatchNormalizeRequest,
    BatchNormalizeResponse,
)

router = APIRouter(prefix="", tags=["Normalization"], dependencies=[Depends(verify_internal_auth)])


@router.post("/normalize", response_model=NormalizeResponse)
async def normalize_description(request: NormalizeRequest):
    """Normalize a single engineering material description."""
    return normalization_service.normalize(request)


@router.post("/normalize/batch", response_model=BatchNormalizeResponse)
async def normalize_descriptions_batch(request: BatchNormalizeRequest):
    """Batch normalize multiple engineering material descriptions."""
    return normalization_service.normalize_batch(request)
