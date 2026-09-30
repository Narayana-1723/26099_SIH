def test_text_normalization_abbreviations_and_grades(client):
    payload = {
        "materialCode": "BOLT001",
        "description": "SS316 M16 HEX BOLT 50MM"
    }
    response = client.post("/api/normalize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["materialCode"] == "BOLT001"
    assert data["originalDescription"] == "SS316 M16 HEX BOLT 50MM"

    norm = data["normalizedDescription"]
    # Check that SS316 expanded or normalized with stainless steel
    assert "stainless steel 316" in norm
    assert "M16" in norm
    assert "hexagonal bolt" in norm or "hex bolt" in norm
    assert "50 mm" in norm
    assert len(data["tokens"]) > 0


def test_grade_representations(client):
    """Ensure SS316, 316 SS, and STAINLESS STEEL 316 all normalize to consistent format."""
    inputs = [
        "SS316 M16 BOLT",
        "316 SS M16 BOLT",
        "STAINLESS STEEL 316 M16 BOLT",
    ]
    outputs = []
    for text in inputs:
        res = client.post("/api/normalize", json={"description": text})
        assert res.status_code == 200
        outputs.append(res.json()["normalizedDescription"])

    # All should contain 'stainless steel 316' and 'M16' and 'bolt'
    for out in outputs:
        assert "stainless steel 316" in out
        assert "M16" in out
        assert "bolt" in out


def test_unit_normalization(client):
    """Ensure 50MM, 50 MM, and 50 mm normalize to identical '50 mm'."""
    variations = ["50MM", "50 MM", "50 mm"]
    normalized_results = []
    for v in variations:
        res = client.post("/api/normalize", json={"description": f"BOLT {v}"})
        assert res.status_code == 200
        normalized_results.append(res.json()["normalizedDescription"])

    # All normalized strings should end in '50 mm'
    for norm in normalized_results:
        assert norm.endswith("50 mm")


def test_batch_normalization(client):
    payload = {
        "materials": [
            {"materialCode": "M1", "description": "CS PIPE 2 INCH SCH 40"},
            {"materialCode": "M2", "description": "SS304 NUT M12"}
        ]
    }
    response = client.post("/api/normalize/batch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 2
    assert data["results"][0]["materialCode"] == "M1"
    assert "carbon steel" in data["results"][0]["normalizedDescription"]
