from datetime import datetime, timezone
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Post-Disaster Information Fog AI Backend"
    VERSION: str = "1.0.0"
    API_PREFIX: str = ""
    
    # Database
    DATABASE_URL: str = "sqlite:///./disaster_fog.db"
    
    # Embedding & Clustering
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    SIMILARITY_THRESHOLD: float = 0.75  # Cosine similarity threshold for clustering
    COSINE_DISTANCE_THRESHOLD: float = 0.25  # 1.0 - 0.75
    
    # Scoring & Decay
    DECAY_HALF_LIFE_HOURS: float = 6.0
    BLACKOUT_SILENCE_HOURS: float = 3.0
    COORDINATE_BONUS: float = 0.10
    CORROBORATION_MAX_BONUS: float = 0.25
    CORROBORATION_SCALE_FACTOR: float = 0.08
    VERIFIED_CONFIDENCE_THRESHOLD: float = 0.60
    
    # Source Weights
    SOURCE_WEIGHTS: dict[str, float] = {
        "hospital": 0.95,
        "police": 0.90,
        "citizen": 0.60,
        "social_media": 0.35,
    }
    
    # Default Simulation Clock Time
    SIMULATION_START_TIME: datetime = datetime(2026, 8, 30, 6, 0, 0, tzinfo=timezone.utc)
    SIMULATION_DURATION_HOURS: float = 24.0


settings = Settings()
