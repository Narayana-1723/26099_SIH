def test_generate_embeddings_endpoint(client):
    payload = {
        "texts": [
            "M16 hex bolt stainless steel 316 50 mm",
            "SS316 M16 hexagonal bolt length 50mm"
        ]
    }
    response = client.post("/api/embeddings", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "embeddings" in data
    assert len(data["embeddings"]) == 2
    assert data["dimension"] > 0
    assert len(data["embeddings"][0]) == data["dimension"]
    assert "modelVersion" in data
    assert "device" in data


def test_embeddings_empty_validation(client):
    # Pydantic should reject empty list
    response = client.post("/api/embeddings", json={"texts": []})
    assert response.status_code == 422
