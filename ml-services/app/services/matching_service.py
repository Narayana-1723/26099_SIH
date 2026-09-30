import numpy as np
from typing import List, Dict, Any, Tuple
from app.config.settings import settings
from app.models.embedding_model import embedding_manager
from app.models.ner_model import ner_model
from app.utils.text_utils import normalize_material_description
from app.utils.similarity import (
    cosine_similarity_vectors,
    compute_lexical_similarity,
    compare_attributes,
)
from app.utils.attribute_utils import (
    are_dimensions_compatible,
    are_materials_compatible,
    are_grades_compatible,
    are_item_types_compatible,
    CRITICAL_ATTRIBUTES,
)
from app.services.explanation_service import explanation_service
from app.schemas.matching import (
    MaterialItem,
    MatchRequest,
    MatchResponse,
    MatchResult,
    MatchType,
    BatchMatchRequest,
    BatchMatchResponse,
)


class MatchingService:
    """
    Hybrid matching engine combining:
    - Semantic Similarity (Sentence Transformers / TF-IDF Vectorization)
    - Lexical Similarity (Token Jaccard + Character N-grams)
    - Unit-Aware Attribute Comparison
    - Domain Rule Engine with Penalty Logic
    - Explainable AI Output
    """

    def match(self, request: MatchRequest) -> MatchResponse:
        source = request.sourceMaterial
        candidates = request.candidateMaterials

        # 1. Normalize source
        source_norm = normalize_material_description(source.description)
        source_attrs, _ = ner_model.extract_entities(source_norm)
        source_attrs_dict = source_attrs.model_dump(exclude_none=True)

        # 2. Normalize candidates
        cand_norms = [normalize_material_description(c.description) for c in candidates]
        cand_attrs_list = []
        for cn in cand_norms:
            attrs, _ = ner_model.extract_entities(cn)
            cand_attrs_list.append(attrs.model_dump(exclude_none=True))

        # 3. Generate embeddings in a single batch
        all_texts = [source_norm] + cand_norms
        all_embeddings = embedding_manager.encode(all_texts)
        source_embedding = all_embeddings[0]
        cand_embeddings = all_embeddings[1:]

        results: List[MatchResult] = []

        # 4. Evaluate each candidate against source
        for idx, candidate in enumerate(candidates):
            cand_norm = cand_norms[idx]
            cand_attrs_dict = cand_attrs_list[idx]
            cand_embedding = cand_embeddings[idx]

            # Semantic score (Cosine similarity of embeddings)
            semantic_score = cosine_similarity_vectors(source_embedding, cand_embedding)

            # Lexical score (Token overlap & character n-grams)
            lexical_score = compute_lexical_similarity(source_norm, cand_norm)

            # Attribute comparison
            (
                attr_score,
                matched_attrs,
                differences,
                pos_factors,
                neg_factors,
            ) = compare_attributes(source_attrs_dict, cand_attrs_dict)

            # Check domain rules and critical mismatches
            critical_mismatches = self._check_domain_rules(
                source_attrs_dict,
                cand_attrs_dict,
                differences,
                neg_factors
            )

            # Calculate final confidence with domain rules
            final_confidence, match_type, score_breakdown = self._calculate_confidence_and_classification(
                semantic_score=semantic_score,
                lexical_score=lexical_score,
                attribute_score=attr_score,
                critical_mismatches=critical_mismatches,
                matched_attributes=matched_attrs,
                differences=differences,
            )

            # Build transparent explanation
            explanation = explanation_service.build_explanation(
                matched_attributes=matched_attrs,
                differences=differences,
                positive_factors=pos_factors,
                negative_factors=neg_factors,
                critical_mismatches=critical_mismatches,
                score_breakdown=score_breakdown,
            )

            results.append(
                MatchResult(
                    materialCode=candidate.materialCode,
                    matchType=match_type,
                    semanticScore=round(semantic_score, 4),
                    lexicalScore=round(lexical_score, 4),
                    attributeScore=round(attr_score, 4),
                    finalConfidence=round(final_confidence, 4),
                    explanation=explanation,
                    modelVersion=embedding_manager.model_version,
                    pipelineVersion=settings.PIPELINE_VERSION,
                )
            )

        # Sort matches by finalConfidence descending
        results.sort(key=lambda x: x.finalConfidence, reverse=True)

        return MatchResponse(
            sourceMaterialCode=source.materialCode,
            matches=results,
        )

    def match_batch(self, request: BatchMatchRequest) -> BatchMatchResponse:
        results = [self.match(req) for req in request.requests]
        return BatchMatchResponse(results=results)

    def _check_domain_rules(
        self,
        src_attrs: Dict[str, Any],
        cand_attrs: Dict[str, Any],
        differences: List[str],
        negative_factors: List[str]
    ) -> List[str]:
        """
        Executes explicit engineering domain rules.
        Identifies critical incompatibilities (e.g. 50mm vs 100mm, M16 vs M20).
        """
        critical_mismatches: List[str] = []

        # 1. Item Type Check
        t1 = src_attrs.get("itemType")
        t2 = cand_attrs.get("itemType")
        if t1 and t2:
            compat, msg = are_item_types_compatible(str(t1), str(t2))
            if not compat:
                critical_mismatches.append(f"itemType: {t1} != {t2}")

        # 2. Material Compatibility
        m1 = src_attrs.get("material")
        m2 = cand_attrs.get("material")
        if m1 and m2:
            compat, msg = are_materials_compatible(str(m1), str(m2))
            if not compat:
                critical_mismatches.append(f"material: {m1} != {m2}")

        # 3. Grade Compatibility
        g1 = src_attrs.get("grade")
        g2 = cand_attrs.get("grade")
        if g1 and g2:
            compat, msg = are_grades_compatible(str(g1), str(g2))
            if not compat:
                critical_mismatches.append(f"grade: {g1} != {g2}")

        # 4. Dimensional Checks (Diameter, Length, Thickness)
        for dim_key in ["diameter", "length", "thickness"]:
            d1 = src_attrs.get(dim_key)
            d2 = cand_attrs.get(dim_key)
            if d1 and d2:
                compat, msg = are_dimensions_compatible(str(d1), str(d2))
                if not compat:
                    critical_mismatches.append(f"{dim_key}: {d1} != {d2}")

        # 5. Pressure Class
        p1 = src_attrs.get("pressureClass")
        p2 = cand_attrs.get("pressureClass")
        if p1 and p2 and str(p1).lower() != str(p2).lower():
            critical_mismatches.append(f"pressureClass: {p1} != {p2}")

        # 6. Voltage
        v1 = src_attrs.get("voltage")
        v2 = cand_attrs.get("voltage")
        if v1 and v2 and str(v1).lower() != str(v2).lower():
            critical_mismatches.append(f"voltage: {v1} != {v2}")

        return critical_mismatches

    def _calculate_confidence_and_classification(
        self,
        semantic_score: float,
        lexical_score: float,
        attribute_score: float,
        critical_mismatches: List[str],
        matched_attributes: List[str],
        differences: List[str],
    ) -> Tuple[float, MatchType, Dict[str, float]]:
        """
        Combines scores using configurable weights and domain penalties.
        Assigns EXACT, POTENTIAL_EQUIVALENT, SIMILAR, or NOT_MATCH.
        """
        w_sem = settings.SEMANTIC_WEIGHT
        w_lex = settings.LEXICAL_WEIGHT
        w_attr = settings.ATTRIBUTE_WEIGHT

        # Weighted combination
        base_confidence = (w_sem * semantic_score) + (w_lex * lexical_score) + (w_attr * attribute_score)

        score_breakdown = {
            "semanticComponent": round(w_sem * semantic_score, 4),
            "lexicalComponent": round(w_lex * lexical_score, 4),
            "attributeComponent": round(w_attr * attribute_score, 4),
            "rawBaseConfidence": round(base_confidence, 4),
            "domainPenaltyMultiplier": 1.0,
        }

        # Apply domain rule penalties
        if critical_mismatches:
            # Severe penalty for critical mismatch (e.g. 50mm vs 100mm)
            # Each critical mismatch cuts confidence in half
            penalty_multiplier = 0.40 * (0.6 ** (len(critical_mismatches) - 1))
            final_confidence = base_confidence * penalty_multiplier
            score_breakdown["domainPenaltyMultiplier"] = round(penalty_multiplier, 4)

            # Critical mismatch prevents equivalence
            if final_confidence >= settings.SIMILAR_MATCH_THRESHOLD:
                match_type = MatchType.SIMILAR
            else:
                match_type = MatchType.NOT_MATCH
        else:
            # If there are positive matched attributes and no critical mismatches,
            # allow full score
            final_confidence = base_confidence

            # Classification thresholds
            if (
                final_confidence >= settings.EXACT_MATCH_THRESHOLD
                and attribute_score >= 0.85
                and len(differences) == 0
            ):
                match_type = MatchType.EXACT
            elif final_confidence >= settings.EQUIVALENT_MATCH_THRESHOLD and attribute_score >= 0.70:
                match_type = MatchType.POTENTIAL_EQUIVALENT
            elif final_confidence >= settings.SIMILAR_MATCH_THRESHOLD:
                match_type = MatchType.SIMILAR
            else:
                match_type = MatchType.NOT_MATCH

        bounded_confidence = float(np.clip(final_confidence, 0.0, 1.0))
        return bounded_confidence, match_type, score_breakdown


matching_service = MatchingService()
