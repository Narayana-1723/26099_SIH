from fastapi import APIRouter, Depends
from app.api.dependencies import verify_internal_auth, check_models_available
from app.services.matching_service import matching_service
from app.schemas.matching import (
    MatchRequest,
    MatchResponse,
    BatchMatchRequest,
    BatchMatchResponse,
)

router = APIRouter(
    prefix="",
    tags=["Matching & Harmonization"],
    dependencies=[Depends(verify_internal_auth), Depends(check_models_available)],
)


@router.post("/match", response_model=MatchResponse)
async def match_materials(request: MatchRequest):
    """
    Perform hybrid matching of a source material against candidate materials.
    Evaluates semantic embeddings, lexical similarity, unit-aware attribute comparison,
    and domain rules to produce explainable match classifications and confidence scores.
    """
    return matching_service.match(request)


@router.post("/match/batch", response_model=BatchMatchResponse)
async def match_materials_batch(request: BatchMatchRequest):
    """Batch match multiple source materials against candidate sets."""
    return matching_service.match_batch(request)
