from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import config
from app.database import initialize_database
from app.main import app


@pytest.fixture(autouse=True)
def test_db(tmp_path: Path):
    original_db = config.DB_PATH
    config.DB_PATH = tmp_path / "test.db"
    initialize_database()
    yield
    config.DB_PATH = original_db


@pytest.fixture
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client
