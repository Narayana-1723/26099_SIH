from typing import List, Dict, Any, Optional
from app.pipelines.preprocessing_pipeline import preprocessing_pipeline
from app.models.ner_model import ner_model
from app.models.embedding_model import embedding_manager
from app.models.classifier_model import classifier_model
from app.services.matching_service import matching_service
from app.schemas.matching import MaterialItem, MatchResponse, MatchRequest
from app.schemas.classification import ClassifyResponse


class HarmonizationPipelineResult:
    """Full container for end-to-end harmonization results."""
    def __init__(
        self,
        source_code: str,
        original_description: str,
        normalized_description: str,
        extracted_attributes: Dict[str, Any],
        embedding: List[float],
        taxonomy: ClassifyResponse,
        matches: MatchResponse,
    ):
        self.source_code = source_code
        self.original_description = original_description
        self.normalized_description = normalized_description
        self.extracted_attributes = extracted_attributes
        self.embedding = embedding
        self.taxonomy = taxonomy
        self.matches = matches

    def to_dict(self) -> Dict[str, Any]:
        return {
            "sourceMaterialCode": self.source_code,
            "originalDescription": self.original_description,
            "normalizedDescription": self.normalized_description,
            "attributes": self.extracted_attributes,
            "taxonomy": self.taxonomy.model_dump(by_alias=True),
            "matchResults": self.matches.model_dump(),
        }


class HarmonizationPipeline:
    """
    End-to-End Modular Material Harmonization Pipeline.
    Strictly follows the 13-stage workflow defined in Section 20.
    """

    def process(
        self,
        source_material: MaterialItem,
        candidate_materials: Optional[List[MaterialItem]] = None,
    ) -> HarmonizationPipelineResult:
        # Step 1 & 2: Normalize
        norm_desc = preprocessing_pipeline.process(source_material.description)

        # Step 3: Extract Attributes & NER
        extracted_attrs, entities = ner_model.extract_entities(norm_desc)
        attrs_dict = extracted_attrs.model_dump(exclude_none=True)

        # Step 4: Generate Embedding
        embeddings = embedding_manager.encode([norm_desc])
        src_embedding = embeddings[0]

        # Step 5: Taxonomy Classification
        cat, subcat, item_class, class_conf = classifier_model.predict(norm_desc)
        taxonomy = ClassifyResponse(
            materialCode=source_material.materialCode,
            category=cat,
            subcategory=subcat,
            item_class=item_class,
            confidence=class_conf,
        )

        # Step 6 - 12: Candidate Matching (Semantic + Lexical + Attributes + Domain Rules + Confidence + Explanation)
        candidates = candidate_materials or []
        if candidates:
            match_req = MatchRequest(
                sourceMaterial=source_material,
                candidateMaterials=candidates,
            )
            match_res = matching_service.match(match_req)
        else:
            match_res = MatchResponse(
                sourceMaterialCode=source_material.materialCode,
                matches=[],
            )

        # Step 13: Output
        return HarmonizationPipelineResult(
            source_code=source_material.materialCode,
            original_description=source_material.description,
            normalized_description=norm_desc,
            extracted_attributes=attrs_dict,
            embedding=src_embedding,
            taxonomy=taxonomy,
            matches=match_res,
        )


harmonization_pipeline = HarmonizationPipeline()
