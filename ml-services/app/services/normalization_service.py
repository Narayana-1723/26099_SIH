from typing import List
from app.utils.text_utils import normalize_material_description, tokenize
from app.schemas.normalization import (
    NormalizeRequest,
    NormalizeResponse,
    BatchNormalizeRequest,
    BatchNormalizeResponse,
)


class NormalizationService:
    """Service for standardizing material descriptions."""

    def normalize(self, request: NormalizeRequest) -> NormalizeResponse:
        original = request.description
        normalized = normalize_material_description(original)
        tokens = tokenize(normalized)

        return NormalizeResponse(
            materialCode=request.materialCode,
            originalDescription=original,
            normalizedDescription=normalized,
            tokens=tokens,
        )

    def normalize_batch(self, request: BatchNormalizeRequest) -> BatchNormalizeResponse:
        results = [self.normalize(item) for item in request.materials]
        return BatchNormalizeResponse(results=results)


normalization_service = NormalizationService()
