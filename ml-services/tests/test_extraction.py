def test_attribute_extraction_prompt_example(client):
    payload = {
        "materialCode": "BOLT001",
        "description": "M16 HEX BOLT SS316 X 50MM"
    }
    response = client.post("/api/extract-attributes", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["materialCode"] == "BOLT001"
    assert "M16" in data["normalizedDescription"]
    attrs = data["attributes"]

    # Verify extracted core attributes
    assert attrs["itemType"] == "Hex Bolt"
    assert attrs["material"] == "Stainless Steel"
    assert attrs["grade"] == "316"
    assert attrs["diameter"] == "M16"
    assert attrs["length"] == "50 mm"

    # Missing attributes MUST NOT be invented/hallucinated
    assert attrs["voltage"] is None
    assert attrs["current"] is None
    assert attrs["pressureClass"] is None
    assert attrs["power"] is None


def test_valve_and_piping_extraction(client):
    payload = {
        "description": "BALL VALVE 2 INCH CLASS 150 FLANGED RF SS316"
    }
    response = client.post("/api/extract-attributes", json=payload)
    assert response.status_code == 200
    attrs = response.json()["attributes"]

    assert attrs["itemType"] == "Ball Valve"
    assert attrs["material"] == "Stainless Steel"
    assert attrs["grade"] == "316"
    assert "2 inch" in attrs["diameter"]
    assert "150" in attrs["pressureClass"]


def test_electrical_extraction(client):
    payload = {
        "description": "COPPER POWER CABLE 4 CORE 16 SQ MM 1100 V"
    }
    response = client.post("/api/extract-attributes", json=payload)
    assert response.status_code == 200
    attrs = response.json()["attributes"]

    assert attrs["itemType"] == "Power Cable"
    assert attrs["material"] == "Copper"
    assert attrs["voltage"] == "1100 V"
    assert attrs["length"] is None  # Not specified in text


def test_batch_extraction(client):
    payload = {
        "materials": [
            {"materialCode": "B1", "description": "M16 HEX BOLT SS316 50MM"},
            {"materialCode": "V1", "description": "GATE VALVE 4 INCH CLASS 300"}
        ]
    }
    response = client.post("/api/extract-attributes/batch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 2
    assert data["results"][0]["attributes"]["itemType"] == "Hex Bolt"
    assert data["results"][1]["attributes"]["itemType"] == "Gate Valve"
