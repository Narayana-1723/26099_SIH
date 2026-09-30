import os
import sys
import pytest

# Ensure root directory is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from starlette.testclient import TestClient
from app.main import app
from app.models.embedding_model import embedding_manager


@pytest.fixture(scope="session", autouse=True)
def initialize_models():
    """Ensure all models are initialized before running tests."""
    embedding_manager.initialize()


@pytest.fixture
def client():
    """Synchronous test client for FastAPI endpoints."""
    with TestClient(app) as test_client:
        yield test_client
