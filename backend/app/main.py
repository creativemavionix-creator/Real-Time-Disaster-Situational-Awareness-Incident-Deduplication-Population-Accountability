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
from app.pipeline.population_exposure import seed_initial_missing_persons
from app.pipeline.dispatch_engine import seed_initial_resource_units
from app.routers import (
    locations_router,
    reports_router,
    simulation_router,
    gis_router,
    deduplication_router,
    blackout_intel_router,
    population_router,
    dispatch_router,
    sitrep_router,
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("disaster_fog")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown initialization."""
    logger.info("Initializing Post-Disaster Information Fog & National Disaster Platform...")
    
    # 1. Initialize SQLite Database
    init_db()
    
    # 2. Initialize simulation clock, seed synthetic reports, missing persons, and tactical units
    db = SessionLocal()
    try:
        get_or_create_clock(db)
        seeded_count = seed_database(db, force=False)
        mp_count = seed_initial_missing_persons(db)
        units_count = seed_initial_resource_units(db)
        sim_time = get_simulated_time(db)
        logger.info(
            f"Database initialized. Reports: {seeded_count}, Missing Persons: {mp_count}, "
            f"Resource Units: {units_count}, Sim Time: {sim_time.isoformat()}"
        )
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
        "National Multi-Agency Disaster Response & Situational Awareness Platform covering 6 core capabilities: "
        "Real-Time GIS Mapping, Multi-Agency Deduplication & Unified Truth, Silent Blackout Risk Intelligence, "
        "Dynamic Population Exposure & Missing Persons, Tactical Resource Dispatch, and 24-Hour Timeline SITREP Generator."
    ),
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Enable CORS for Vercel production domains, preview branches, and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
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


# Mount routers for all 6 capabilities
app.include_router(locations_router)
app.include_router(reports_router)
app.include_router(simulation_router)
app.include_router(gis_router)
app.include_router(deduplication_router)
app.include_router(blackout_intel_router)
app.include_router(population_router)
app.include_router(dispatch_router)
app.include_router(sitrep_router)


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
        },
        "capabilities": {
            "1_gis_mapping": "/gis/telemetry",
            "2_unified_truth_deduplication": "/deduplication/unified-truth",
            "3_silent_blackout_intelligence": "/blackout-intel/risk-assessment",
            "4_population_and_missing_persons": {
                "exposure": "/population/exposure",
                "missing_persons": "/population/missing-persons"
            },
            "5_tactical_resource_dispatch": {
                "dashboard": "/dispatch/dashboard",
                "recommendations": "/dispatch/recommendations",
                "units": "/dispatch/units",
                "assign": "POST /dispatch/assign"
            },
            "6_timeline_and_sitrep_generator": "/sitrep/current"
        }
    }
