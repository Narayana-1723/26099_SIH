from app.pipelines.harmonization_pipeline import harmonization_pipeline
from app.schemas.matching import MaterialItem


def test_end_to_end_harmonization_pipeline():
    src = MaterialItem(materialCode="BOLT001", description="M16 HEX BOLT SS316 X 50MM")
    cands = [
        MaterialItem(materialCode="BOLT200", description="STAINLESS STEEL 316 HEX BOLT M16 50MM"),
        MaterialItem(materialCode="BOLT300", description="M16 HEX BOLT SS316 X 100MM"),
    ]

    result = harmonization_pipeline.process(source_material=src, candidate_materials=cands)
    res_dict = result.to_dict()

    assert res_dict["sourceMaterialCode"] == "BOLT001"
    assert "M16" in res_dict["normalizedDescription"]
    assert res_dict["taxonomy"]["category"] == "Mechanical"
    assert res_dict["taxonomy"]["class"] == "Bolts"
    assert len(res_dict["matchResults"]["matches"]) == 2


def test_classify_endpoint(client):
    payload = {
        "description": "M16 HEX BOLT SS316 X 50MM"
    }
    response = client.post("/api/classify", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["category"] == "Mechanical"
    assert data["subcategory"] == "Fasteners"
    assert data["class"] == "Bolts"
    assert 0.0 <= data["confidence"] <= 1.0
    assert data["modelVersion"] == "classifier-v1"


def test_batch_classify_endpoint(client):
    payload = {
        "materials": [
            {"materialCode": "M1", "description": "COPPER POWER CABLE 4 CORE 16 SQ MM 1100 V"},
            {"materialCode": "M2", "description": "BALL VALVE 2 INCH CLASS 150 FLANGED"}
        ]
    }
    response = client.post("/api/classify/batch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 2
    assert data["results"][0]["category"] == "Electrical"
    assert data["results"][1]["category"] == "Mechanical"


def test_duplicate_detection_endpoint(client):
    payload = {
        "materials": [
            {"materialCode": "A001", "description": "SS316 M16 HEX BOLT 50MM"},
            {"materialCode": "B002", "description": "M16 HEXAGONAL BOLT STAINLESS STEEL 316 50 MM"},
            {"materialCode": "C003", "description": "COPPER POWER CABLE 4 CORE 16 SQ MM 1100 V"}
        ]
    }
    response = client.post("/api/duplicates", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["totalGroups"] >= 1
    # Check that A001 and B002 are clustered together
    found_dup = False
    for group in data["duplicateGroups"]:
        if "A001" in group["materials"] and "B002" in group["materials"]:
            found_dup = True
            assert group["confidence"] >= 0.75
            assert "itemType" in group["commonAttributes"] or "material" in group["commonAttributes"]
    assert found_dup
    assert "C003" in data["unmatchedMaterials"]
