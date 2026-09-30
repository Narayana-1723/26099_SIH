from fastapi import APIRouter, Depends
from app.api.dependencies import verify_internal_auth, check_models_available
from app.services.classification_service import classification_service
from app.schemas.classification import (
    ClassifyRequest,
    ClassifyResponse,
    BatchClassifyRequest,
    BatchClassifyResponse,
)

router = APIRouter(
    prefix="",
    tags=["Taxonomy Classification"],
    dependencies=[Depends(verify_internal_auth), Depends(check_models_available)],
)


@router.post("/classify", response_model=ClassifyResponse)
async def classify_material(request: ClassifyRequest):
    """
    Classify a material description into the CPSE engineering taxonomy hierarchy
    (Category -> Subcategory -> Class) with mathematically calibrated confidence.
    """
    return classification_service.classify(request)


@router.post("/classify/batch", response_model=BatchClassifyResponse)
async def classify_materials_batch(request: BatchClassifyRequest):
    """Batch classify multiple material descriptions into taxonomy classes."""
    return classification_service.classify_batch(request)
