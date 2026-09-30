import os
import sys

# Ensure root directory is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import numpy as np
from typing import List, Dict, Any, Tuple
from app.services.matching_service import matching_service
from app.schemas.matching import MatchRequest, MaterialItem


def evaluate_matching_benchmark(test_pairs: List[Tuple[Dict[str, str], Dict[str, str], bool]], threshold: float = 0.75) -> Dict[str, Any]:
    """
    Evaluates matching accuracy, precision, recall, F1, FPR, and FNR against ground truth pairs.
    Ground truth format: (source_dict, candidate_dict, is_equivalent_bool)
    """
    tp = 0
    fp = 0
    tn = 0
    fn = 0

    for src_data, cand_data, ground_truth in test_pairs:
        req = MatchRequest(
            sourceMaterial=MaterialItem(materialCode=src_data["code"], description=src_data["desc"]),
            candidateMaterials=[MaterialItem(materialCode=cand_data["code"], description=cand_data["desc"])],
        )
        res = matching_service.match(req)
        match_item = res.matches[0]
        pred_match = (match_item.finalConfidence >= threshold and match_item.matchType.value in {"EXACT", "POTENTIAL_EQUIVALENT"})

        if pred_match and ground_truth:
            tp += 1
        elif pred_match and not ground_truth:
            fp += 1
        elif not pred_match and not ground_truth:
            tn += 1
        elif not pred_match and ground_truth:
            fn += 1

    total = tp + fp + tn + fn
    accuracy = (tp + tn) / total if total > 0 else 0.0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0

    return {
        "totalSamples": total,
        "truePositives": tp,
        "falsePositives": fp,
        "trueNegatives": tn,
        "falseNegatives": fn,
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1Score": round(f1, 4),
        "falsePositiveRate": round(fpr, 4),
        "falseNegativeRate": round(fnr, 4),
    }


if __name__ == "__main__":
    benchmark_dataset = [
        # Equivalent pairs (Ground truth: True)
        (
            {"code": "SRC-1", "desc": "M16 HEX BOLT SS316 X 50MM"},
            {"code": "CAND-1", "desc": "STAINLESS STEEL 316 HEX BOLT M16 50MM"},
            True
        ),
        (
            {"code": "SRC-2", "desc": "BALL VALVE 2 INCH CLASS 150 FLANGED SS316"},
            {"code": "CAND-2", "desc": "2\" FLANGED BALL VALVE CL 150 STAINLESS STEEL 316"},
            True
        ),
        # Incompatible pairs (Ground truth: False)
        (
            {"code": "SRC-3", "desc": "M16 HEX BOLT SS316 X 50MM"},
            {"code": "CAND-3", "desc": "M16 HEX BOLT SS316 X 100MM"},
            False
        ),
        (
            {"code": "SRC-4", "desc": "M16 HEX BOLT SS316 X 50MM"},
            {"code": "CAND-4", "desc": "M20 HEX BOLT SS316 X 50MM"},
            False
        ),
        (
            {"code": "SRC-5", "desc": "M16 HEX BOLT SS316 X 50MM"},
            {"code": "CAND-5", "desc": "M16 HEX NUT SS316"},
            False
        ),
    ]

    metrics = evaluate_matching_benchmark(benchmark_dataset)
    print("=== MODEL EVALUATION REPORT ===")
    print("NOTE: Model Confidence != Model Accuracy")
    for k, v in metrics.items():
        print(f"  {k}: {v}")
