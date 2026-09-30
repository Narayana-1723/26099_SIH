from collections import defaultdict
from typing import List, Dict, Set, Any
import numpy as np
from app.config.settings import settings
from app.models.embedding_model import embedding_manager
from app.models.ner_model import ner_model
from app.utils.text_utils import normalize_material_description
from app.services.matching_service import matching_service
from app.schemas.matching import MaterialItem
from app.schemas.duplicate import (
    DuplicateDetectionRequest,
    DuplicateDetectionResponse,
    DuplicateGroup,
)


class DuplicateService:
    """
    Duplicate detection service using graph-based clustering over
    pairwise hybrid matching scores and domain rules.
    """

    def detect_duplicates(self, request: DuplicateDetectionRequest) -> DuplicateDetectionResponse:
        materials = request.materials
        threshold = request.similarityThreshold or settings.DUPLICATE_THRESHOLD
        n = len(materials)

        if n < 2:
            return DuplicateDetectionResponse(
                duplicateGroups=[],
                unmatchedMaterials=[m.materialCode for m in materials],
                totalGroups=0,
                totalDuplicates=0,
            )

        # 1. Normalize and extract attributes
        normalized_texts = [normalize_material_description(m.description) for m in materials]
        extracted_attrs = []
        for norm in normalized_texts:
            attrs, _ = ner_model.extract_entities(norm)
            extracted_attrs.append(attrs.model_dump(exclude_none=True))

        # 2. Compute embeddings in batch
        embeddings = embedding_manager.encode(normalized_texts)

        # 3. Pairwise matching graph
        adj: Dict[int, List[int]] = defaultdict(list)
        pair_confidences: Dict[tuple, float] = {}

        for i in range(n):
            for j in range(i + 1, n):
                # Calculate scores between i and j
                sem_score = float(np.dot(embeddings[i], embeddings[j]))
                # Use matching service internal evaluator
                source_item = materials[i]
                cand_item = materials[j]

                match_resp = matching_service.match_batch(
                    request=matching_service.match(
                        request=type("Req", (), {
                            "sourceMaterial": source_item,
                            "candidateMaterials": [cand_item]
                        })()
                    )
                ) if False else matching_service.match(
                    request=type("Req", (), {
                        "sourceMaterial": source_item,
                        "candidateMaterials": [cand_item]
                    })()
                )

                if match_resp.matches:
                    match_res = match_resp.matches[0]
                    conf = match_res.finalConfidence
                    # Only group if matchType is EXACT or POTENTIAL_EQUIVALENT and meets threshold
                    if conf >= threshold and match_res.matchType.value in {"EXACT", "POTENTIAL_EQUIVALENT"}:
                        adj[i].append(j)
                        adj[j].append(i)
                        pair_confidences[(min(i, j), max(i, j))] = conf

        # 4. Connected components via BFS
        visited: Set[int] = set()
        duplicate_groups: List[DuplicateGroup] = []
        in_cluster: Set[str] = set()
        group_counter = 1

        for node in range(n):
            if node not in visited:
                component = []
                queue = [node]
                visited.add(node)

                while queue:
                    curr = queue.pop(0)
                    component.append(curr)
                    for neighbor in adj[curr]:
                        if neighbor not in visited:
                            visited.add(neighbor)
                            queue.append(neighbor)

                if len(component) >= 2:
                    # Calculate average confidence in component
                    confs = []
                    for u_idx in range(len(component)):
                        for v_idx in range(u_idx + 1, len(component)):
                            u, v = component[u_idx], component[v_idx]
                            pair_key = (min(u, v), max(u, v))
                            if pair_key in pair_confidences:
                                confs.append(pair_confidences[pair_key])

                    avg_conf = float(np.mean(confs)) if confs else threshold

                    # Find common attributes
                    common_attrs: Dict[str, Any] = {}
                    first_attrs = extracted_attrs[component[0]]
                    for k, v in first_attrs.items():
                        if all(extracted_attrs[idx].get(k) == v for idx in component):
                            common_attrs[k] = v

                    # Pick representative description (most detailed/standardized)
                    rep_desc = max((materials[idx].description for idx in component), key=len)

                    member_codes = [materials[idx].materialCode for idx in component]
                    for code in member_codes:
                        in_cluster.add(code)

                    duplicate_groups.append(
                        DuplicateGroup(
                            groupId=f"DUP-{group_counter:03d}",
                            materials=member_codes,
                            confidence=round(avg_conf, 4),
                            representativeDescription=rep_desc,
                            commonAttributes=common_attrs,
                        )
                    )
                    group_counter += 1

        unmatched = [m.materialCode for m in materials if m.materialCode not in in_cluster]
        total_duplicates = sum(len(g.materials) for g in duplicate_groups)

        return DuplicateDetectionResponse(
            duplicateGroups=duplicate_groups,
            unmatchedMaterials=unmatched,
            totalGroups=len(duplicate_groups),
            totalDuplicates=total_duplicates,
        )


duplicate_service = DuplicateService()
