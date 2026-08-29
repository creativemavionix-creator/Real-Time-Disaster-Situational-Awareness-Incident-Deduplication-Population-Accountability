"""FastAPI main application entrypoint for Post-Disaster Information Fog system."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.database import init_db, SessionLocal
from app.pipeline.embedder import get_model
from app.simulation.clock import get_or_create_clock, get_simulated_time
from app.simulation.generator import seed_database
from app.routers import locations_router, reports_router, simulation_router

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("disaster_fog")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown initialization."""
    logger.info("Initializing Post-Disaster Information Fog backend...")
    
    # 1. Initialize SQLite Database
    init_db()
    
    # 2. Initialize simulation clock and seed synthetic reports if DB is fresh
    db = SessionLocal()
    try:
        get_or_create_clock(db)
        seeded_count = seed_database(db, force=False)
        sim_time = get_simulated_time(db)
        logger.info(f"Database ready. Active reports: {seeded_count}, Current Sim Time: {sim_time.isoformat()}")
    finally:
        db.close()
        
    # 3. Preload SentenceTransformer embedding model in memory
    try:
        logger.info("Pre-warming SentenceTransformer model...")
        get_model()
        logger.info("Model pre-warming complete.")
    except Exception as e:
        logger.warning(f"Model pre-warm note: {e}")
        
    yield
    
    logger.info("Shutting down Post-Disaster Information Fog backend.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "AI-driven disaster-response backend prototype for disambiguating, clustering, "
        "and scoring incident reports in the first 24 hours post-disaster across 8 Nepal locations. "
        "Provides transparent reliability scoring, staleness decay, situational awareness status "
        "('verified_safe', 'verified_damaged', 'unverified', 'blackout'), and a 24-hour simulation replay clock."
    ),
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Enable CORS for all origins (frontend dev running on different port/host)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle 422 validation errors with clear structured details."""
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Unprocessable Entity",
            "message": "Malformed request payload. Please check field types and constraints.",
            "details": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Fallback handler to prevent unhandled crashes."""
    logger.error(f"Unhandled error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred in the pipeline. Check logs for details.",
            "details": str(exc),
        },
    )


# Mount routers
app.include_router(locations_router)
app.include_router(reports_router)
app.include_router(simulation_router)


@app.get("/", summary="API Root Status & Metadata")
def root_status():
    """Root health and system metadata overview."""
    db = SessionLocal()
    try:
        sim_time = get_simulated_time(db)
    except Exception:
        sim_time = None
    finally:
        db.close()
        
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "simulated_time": sim_time.isoformat() if sim_time else None,
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "endpoints": {
            "locations": "/locations",
            "all_locations_status": "/locations/status",
            "single_location_status": "/locations/{id}/status",
            "location_incidents": "/locations/{id}/incidents",
            "ingest_report": "POST /reports",
            "simulation_state": "/simulation/state",
            "advance_simulation": "POST /simulation/advance",
            "reset_simulation": "POST /simulation/reset",
            "seed_data": "POST /seed",
        }
    }
