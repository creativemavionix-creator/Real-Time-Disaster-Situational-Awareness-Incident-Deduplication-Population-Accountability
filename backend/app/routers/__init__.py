"""Routers package."""
from app.routers.locations import router as locations_router
from app.routers.reports import router as reports_router
from app.routers.simulation import router as simulation_router
from app.routers.gis import router as gis_router
from app.routers.deduplication import router as deduplication_router
from app.routers.blackout_intel import router as blackout_intel_router
from app.routers.population import router as population_router
from app.routers.dispatch import router as dispatch_router
from app.routers.sitrep import router as sitrep_router
from app.routers.resq_sight import router as resq_sight_router
from app.routers.baselines import router as baselines_router
from app.routers.negative_evidence import router as negative_evidence_router
from app.routers.hypotheses import router as hypotheses_router
from app.routers.verification import router as verification_router
from app.routers.observability import router as observability_router


