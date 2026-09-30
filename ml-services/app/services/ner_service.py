from app.models.ner_model import ner_model
from app.utils.text_utils import normalize_material_description
from app.schemas.extraction import (
    ExtractAttributesRequest,
    ExtractAttributesResponse,
    BatchExtractAttributesRequest,
    BatchExtractAttributesResponse,
)


class NERService:
    """Service for CPSE engineering entity extraction and attribute parsing."""

    def extract(self, request: ExtractAttributesRequest) -> ExtractAttributesResponse:
        original = request.description
        normalized = normalize_material_description(original)

        # Extract attributes from normalized description
        attributes, entities = ner_model.extract_entities(normalized)

        return ExtractAttributesResponse(
            materialCode=request.materialCode,
            originalDescription=original,
            normalizedDescription=normalized,
            attributes=attributes,
            entities=entities,
        )

    def extract_batch(self, request: BatchExtractAttributesRequest) -> BatchExtractAttributesResponse:
        results = [self.extract(item) for item in request.materials]
        return BatchExtractAttributesResponse(results=results)


ner_service = NERService()
