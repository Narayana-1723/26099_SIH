from fastapi import APIRouter, Depends
from app.api.dependencies import verify_internal_auth, check_models_available
from app.services.ner_service import ner_service
from app.schemas.extraction import (
    ExtractAttributesRequest,
    ExtractAttributesResponse,
    BatchExtractAttributesRequest,
    BatchExtractAttributesResponse,
)

router = APIRouter(
    prefix="",
    tags=["Attribute Extraction & NER"],
    dependencies=[Depends(verify_internal_auth), Depends(check_models_available)],
)


@router.post("/extract-attributes", response_model=ExtractAttributesResponse)
async def extract_attributes(request: ExtractAttributesRequest):
    """
    Extract engineering attributes (itemType, material, grade, dimensions, etc.)
    and named entities from a material description.
    """
    return ner_service.extract(request)


@router.post("/extract-attributes/batch", response_model=BatchExtractAttributesResponse)
async def extract_attributes_batch(request: BatchExtractAttributesRequest):
    """Batch extract engineering attributes from multiple material descriptions."""
    return ner_service.extract_batch(request)
