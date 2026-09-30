from typing import List, Dict, Any
from app.schemas.matching import MatchExplanation


class ExplanationService:
    """Service to generate transparent, auditable explanations for match decisions."""

    def build_explanation(
        self,
        matched_attributes: List[str],
        differences: List[str],
        positive_factors: List[str],
        negative_factors: List[str],
        critical_mismatches: List[str],
        score_breakdown: Dict[str, float]
    ) -> MatchExplanation:
        """
        Synthesizes raw comparison evidence into a structured, human-readable explanation.
        """
        # Format human-friendly positive factors if empty
        final_positives = list(positive_factors)
        if not final_positives and matched_attributes:
            for attr in matched_attributes:
                final_positives.append(f"Same {attr}")

        final_negatives = list(negative_factors)
        if not final_negatives and differences:
            final_negatives.extend(differences)

        return MatchExplanation(
            matchedAttributes=matched_attributes,
            differences=differences,
            positiveFactors=final_positives,
            negativeFactors=final_negatives,
            criticalMismatches=critical_mismatches,
            scoreBreakdown=score_breakdown,
        )


explanation_service = ExplanationService()
