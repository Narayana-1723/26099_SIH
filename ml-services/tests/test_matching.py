def test_matching_equivalent_materials(client):
    payload = {
        "sourceMaterial": {
            "materialCode": "BOLT001",
            "description": "M16 HEX BOLT SS316 X 50MM"
        },
        "candidateMaterials": [
            {
                "materialCode": "BOLT200",
                "description": "STAINLESS STEEL 316 HEX BOLT M16 50MM"
            }
        ]
    }
    response = client.post("/api/match", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["sourceMaterialCode"] == "BOLT001"
    assert len(data["matches"]) == 1

    match = data["matches"][0]
    assert match["materialCode"] == "BOLT200"
    assert match["matchType"] in ["EXACT", "POTENTIAL_EQUIVALENT"]
    assert match["finalConfidence"] >= 0.75
    assert match["attributeScore"] >= 0.85

    # Check explanation structure
    expl = match["explanation"]
    assert len(expl["matchedAttributes"]) >= 3
    assert len(expl["criticalMismatches"]) == 0
    assert any("itemType" in a for a in expl["matchedAttributes"])


def test_matching_dimensional_difference_enforced(client):
    """
    CRITICAL TEST:
    Material A: M16 × 50 mm SS316 Bolt
    Material B: M16 × 100 mm SS316 Bolt
    Must NOT be considered equivalent solely because text is similar.
    Dimensional difference must be identified and confidence penalized.
    """
    payload = {
        "sourceMaterial": {
            "materialCode": "BOLT-50",
            "description": "M16 HEX BOLT SS316 X 50MM"
        },
        "candidateMaterials": [
            {
                "materialCode": "BOLT-100",
                "description": "M16 HEX BOLT SS316 X 100MM"
            }
        ]
    }
    response = client.post("/api/match", json=payload)
    assert response.status_code == 200
    data = response.json()
    match = data["matches"][0]

    # Must NOT be EXACT or POTENTIAL_EQUIVALENT
    assert match["matchType"] in ["SIMILAR", "NOT_MATCH"]
    assert match["matchType"] != "EXACT"
    assert match["matchType"] != "POTENTIAL_EQUIVALENT"

    # Explanation must clearly show length difference
    expl = match["explanation"]
    assert len(expl["criticalMismatches"]) > 0
    assert any("length" in str(diff).lower() for diff in expl["differences"])
    assert any("length" in str(neg).lower() for neg in expl["negativeFactors"])


def test_matching_diameter_difference(client):
    payload = {
        "sourceMaterial": {
            "materialCode": "BOLT-M16",
            "description": "M16 HEX BOLT SS316 X 50MM"
        },
        "candidateMaterials": [
            {
                "materialCode": "BOLT-M20",
                "description": "M20 HEX BOLT SS316 X 50MM"
            }
        ]
    }
    response = client.post("/api/match", json=payload)
    assert response.status_code == 200
    data = response.json()
    match = data["matches"][0]

    assert match["matchType"] in ["SIMILAR", "NOT_MATCH"]
    expl = match["explanation"]
    assert any("diameter" in str(diff).lower() for diff in expl["differences"])


def test_matching_incompatible_item_type(client):
    payload = {
        "sourceMaterial": {
            "materialCode": "BOLT-1",
            "description": "M16 HEX BOLT SS316 X 50MM"
        },
        "candidateMaterials": [
            {
                "materialCode": "NUT-1",
                "description": "M16 HEX NUT SS316"
            }
        ]
    }
    response = client.post("/api/match", json=payload)
    assert response.status_code == 200
    data = response.json()
    match = data["matches"][0]

    assert match["matchType"] == "NOT_MATCH"
    assert match["finalConfidence"] < 0.50
    expl = match["explanation"]
    assert any("itemtype" in str(cm).lower() for cm in expl["criticalMismatches"])


def test_confidence_scores_are_valid_and_non_random(client):
    """Verify confidence values are strictly non-random and computed from algorithms."""
    payload = {
        "sourceMaterial": {
            "materialCode": "BOLT001",
            "description": "M16 HEX BOLT SS316 X 50MM"
        },
        "candidateMaterials": [
            {
                "materialCode": "BOLT200",
                "description": "STAINLESS STEEL 316 HEX BOLT M16 50MM"
            }
        ]
    }
    res1 = client.post("/api/match", json=payload).json()["matches"][0]
    res2 = client.post("/api/match", json=payload).json()["matches"][0]

    # Perfectly deterministic
    assert res1["semanticScore"] == res2["semanticScore"]
    assert res1["lexicalScore"] == res2["lexicalScore"]
    assert res1["attributeScore"] == res2["attributeScore"]
    assert res1["finalConfidence"] == res2["finalConfidence"]

    # Valid score ranges
    assert 0.0 <= res1["semanticScore"] <= 1.0
    assert 0.0 <= res1["lexicalScore"] <= 1.0
    assert 0.0 <= res1["attributeScore"] <= 1.0
    assert 0.0 <= res1["finalConfidence"] <= 1.0
