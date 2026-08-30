import sys
from pathlib import Path
import pytest

# Ensure backend root directory is in sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, SessionLocal
from app.simulation.clock import get_or_create_clock
from app.simulation.generator import seed_database
from app.pipeline.population_exposure import (
    seed_initial_missing_persons,
    seed_palika_census_data,
)
from app.pipeline.dispatch_engine import seed_initial_resource_units


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Initialize database and seed initial test data for full test session."""
    init_db()
    db = SessionLocal()
    try:
        get_or_create_clock(db)
        seed_database(db, force=True)
        seed_initial_missing_persons(db)
        seed_initial_resource_units(db)
        seed_palika_census_data(db)
    finally:
        db.close()


@pytest.fixture(scope="session")
def client():
    """Test client within lifespan context."""
    with TestClient(app) as test_client:
        yield test_client
