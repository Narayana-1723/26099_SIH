def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert "version" in data
    assert "timestamp" in data


def test_model_status(client):
    response = client.get("/api/model-status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["UP", "DEGRADED"]
    assert "models" in data
    assert "embedding" in data["models"]
    assert "ner" in data["models"]
    assert "classification" in data["models"]
    assert data["device"] in ["cpu", "cuda"]
