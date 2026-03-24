"""
Shared pytest fixtures for all tests.
"""
import pytest
import torch
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.fakey.api.database import Base, get_db
from src.fakey.api.app import app

from src.fakey.api.models import Analysis
from datetime import datetime

TEST_DATABASE_URL = "sqlite:///:memory:"

def create_analysis_in_db(db_session, count: int = 1):
    """Insert analyses directly into DB, bypassing rate limits."""
    for _ in range(count):
        db_session.add(Analysis(
            text="Global leaders discuss climate change policies at international summit.",
            label=1,
            score=0.9,
            model_dir="models/baseline",
            max_length=256,
            created_at=datetime.utcnow(),
        ))
    db_session.commit()

@pytest.fixture(scope="function", autouse=True)
def reset_rate_limits():
    """Reset slowapi storage before each test to clear rate limit counters."""
    from src.fakey.api.app import limiter
    limiter._storage.reset()
    yield


@pytest.fixture(scope="function")
def db_engine():
    """Create a fresh in-memory engine per test function."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(db_engine):
    """Provide a transactional session that rolls back after each test."""
    connection = db_engine.connect()
    transaction = connection.begin()
    SessionLocal = sessionmaker(bind=connection)
    session = SessionLocal()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function", autouse=True)
def override_db(db_session):
    """Override FastAPI's get_db dependency with the test session."""
    def _get_test_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _get_test_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture(scope="function", autouse=True)
def mock_ml_model():
    """
    Mock the ML model and tokenizer globally for all tests.
    Tests never load real model weights — fast and isolated.
    """
    mock_tokenizer = MagicMock()
    mock_tokenizer.return_value = {
        "input_ids": torch.zeros((1, 256), dtype=torch.long),
        "attention_mask": torch.ones((1, 256), dtype=torch.long),
    }

    mock_output = MagicMock()
    mock_output.logits = torch.tensor([[0.1, 0.9]])

    mock_model_instance = MagicMock()
    mock_model_instance.return_value = mock_output

    with patch("src.fakey.api.app.tokenizer", mock_tokenizer), \
         patch("src.fakey.api.app.model", mock_model_instance):
        yield


@pytest.fixture(scope="function")
def client():
    """FastAPI test client — db and model are already mocked via autouse fixtures."""
    return TestClient(app)