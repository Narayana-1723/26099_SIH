from fastapi import APIRouter, Depends
from app.api.dependencies import verify_internal_auth, check_models_available
from app.services.duplicate_service import duplicate_service
from app.schemas.duplicate import (
    DuplicateDetectionRequest,
    DuplicateDetectionResponse,
)

router = APIRouter(
    prefix="",
    tags=["Duplicate Detection"],
    dependencies=[Depends(verify_internal_auth), Depends(check_models_available)],
)


@router.post("/duplicates", response_model=DuplicateDetectionResponse)
async def detect_duplicates(request: DuplicateDetectionRequest):
    """
    Detect duplicate and equivalent material records across CPSE datasets using
    pairwise hybrid matching and connected-component graph clustering.
    """
    return duplicate_service.detect_duplicates(request)
