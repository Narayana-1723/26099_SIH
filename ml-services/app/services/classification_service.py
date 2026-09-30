from app.models.classifier_model import classifier_model
from app.utils.text_utils import normalize_material_description
from app.config.settings import settings
from app.schemas.classification import (
    ClassifyRequest,
    ClassifyResponse,
    BatchClassifyRequest,
    BatchClassifyResponse,
)


class ClassificationService:
    """Service for material taxonomy classification."""

    def classify(self, request: ClassifyRequest) -> ClassifyResponse:
        normalized = normalize_material_description(request.description)
        cat, subcat, item_class, confidence = classifier_model.predict(normalized)

        return ClassifyResponse(
            materialCode=request.materialCode,
            category=cat,
            subcategory=subcat,
            item_class=item_class,
            confidence=confidence,
            modelVersion=settings.MODEL_VERSION_CLASSIFIER,
        )

    def classify_batch(self, request: BatchClassifyRequest) -> BatchClassifyResponse:
        results = [self.classify(item) for item in request.materials]
        return BatchClassifyResponse(results=results)


classification_service = ClassificationService()
