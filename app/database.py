"""Database connection and session management."""

from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.config import settings
from app.models.db import Base

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency for obtaining database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
