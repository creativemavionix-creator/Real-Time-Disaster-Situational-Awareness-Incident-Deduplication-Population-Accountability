<div align="center">

# 🌫️ POST-DISASTER // INFORMATION FOG
### National Disaster Response, Situational Awareness, Incident Deduplication & Population Accountability Platform

**An enterprise-grade, offline-first command platform for resolving post-disaster information asymmetry, deduplicating multi-agency field reports with dense semantic embeddings, calculating spatial physics blackout risk, tracking dynamic population exposure, automating tactical resource dispatch, and generating standardized UN OCHA SITREPs during the first 24 hours of catastrophic disaster.**

---

[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Sentence Transformers](https://img.shields.io/badge/Sentence--Transformers-all--MiniLM--L6--v2-FFA800?style=for-the-badge&logo=huggingface&logoColor=white)](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
[![Tests](https://img.shields.io/badge/Tests-32%20Passing-3FB950?style=for-the-badge&logo=pytest&logoColor=white)](https://pytest.org)

</div>

---

## ⚡ Quick Start: How to Run (Step-by-Step)

To run the complete platform, start both the backend and frontend in **two separate terminal tabs**:

### 1️⃣ Terminal 1: Start the FastAPI AI Backend
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Launch FastAPI server on port 8000
python -m uvicorn app.main:app --reload --port 8000
```
- **API Root**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 2️⃣ Terminal 2: Start the Next.js Multi-Page Frontend
```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies (first time only)
npm install

# 3. Start development server on port 3000
npm run dev -- --port 3000
```
- **Live Command Dashboard**: [http://localhost:3000](http://localhost:3000)

---

### 3️⃣ Running Automated Tests
```bash
python -m pytest -v
```
*(All 32 unit and API integration tests pass).*

## 📑 Table of Contents

1. [Platform Capabilities Overview](#-platform-capabilities-overview)
2. [Multi-Page Frontend Architecture](#-multi-page-frontend-architecture)
3. [AI Pipeline & Mathematical Formulations](#-ai-pipeline--mathematical-formulations)
   - [1. Real-Time Situational GIS Telemetry](#1-real-time-situational-gis-telemetry)
   - [2. Multi-Agency Deduplication & Unified Truth](#2-multi-agency-deduplication--unified-truth)
   - [3. Silent Blackout Risk Intelligence](#3-silent-blackout-risk-intelligence)
   - [4. Dynamic Population Exposure & Missing Persons](#4-dynamic-population-exposure--missing-persons)
   - [5. Tactical Resource Dispatch Engine](#5-tactical-resource-dispatch-engine)
   - [6. 24-Hour Timeline & Automated SITREP Generator](#6-24-hour-timeline--automated-sitrep-generator)
4. [Fixed 8-Location Central Nepal Gazetteer](#-fixed-8-location-central-nepal-gazetteer)
5. [Complete API Contract Reference](#-complete-api-contract-reference)
6. [UI, Stability & Hydration Architecture](#-ui-stability--hydration-architecture)
7. [Automated Verification & Test Matrix](#-automated-verification--test-matrix)
8. [Project Directory Tree](#-project-directory-tree)

---

## 🛡️ Platform Capabilities Overview

The platform implements **6 specialized operational capabilities** designed for disaster command centers (such as the Nepal National Emergency Operations Centre - NEOC):

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      NATIONAL DISASTER COMMAND PLATFORM                         │
├────────────────────────┬────────────────────────┬────────────────────────────────┤
│ 01. SITUATIONAL GIS    │ 02. UNIFIED TRUTH      │ 03. BLACKOUT INTELLIGENCE      │
│ Real-time spatial radar│ Resolves Police vs     │ Spatial physics inferred risk  │
│ & hazard overlays      │ Hospital vs Social     │ for isolated mountain zones    │
├────────────────────────┼────────────────────────┼────────────────────────────────┤
│ 04. POPULATION TRACKER │ 05. TACTICAL DISPATCH  │ 06. 24-HR SITREP GENERATOR     │
│ Commuter & tourist flux│ Priority SAR & air     │ Formal UN OCHA / NDMA          │
│ + Missing registry     │ ambulance deployment   │ official operational reports   │
└────────────────────────┴────────────────────────┴────────────────────────────────┘
```

1. **Real-Time Situational GIS Mapping**: Maps affected regions across Nepal into Verified Severe, Partially Affected, Safe, or Critical Blackout zones using interactive satellite telemetry, hazard heatmaps, and centroid distance coordinates.
2. **Multi-Agency Deduplication & Unified Truth**: Cross-references and resolves conflicting reports from Police, Hospitals, Rescue Teams, Citizen SOS, and Social Media to establish a single reliable record.
3. **Silent Blackout Risk Intelligence**: Calculates an Inferred Risk Score for isolated mountain zones using spatial physics (epicenter proximity, topography, bridge damage) so disconnected areas aren't mistaken for safe zones.
4. **Dynamic Population Exposure & Tracking**: Replaces static census data with real-time exposure estimates—factoring in commuters, tourists, and evacuees—alongside a searchable Missing Persons Registry.
5. **Tactical Resource Dispatch Engine**: Generates priority scores to deploy scarce search-and-rescue (SAR) units, air ambulances, and heavy equipment where risk and uncertainty are highest.
6. **24-Hour Timeline & SITREP Generator**: Simulates time-phased data arrivals and blackout clearance patterns while automatically producing printable Situation Reports (SITREPs) for emergency leaders.

---

## 🖥️ Multi-Page Frontend Architecture

The frontend is built with a high-contrast **command-center brutalist design system** (strict 0-radius borders, 4–8px structural rules, `#0A0A0A`, `#EDEDE8`, `#FFB800`, `#3FB950`, `#E5484D`, `Space Grotesk` headlines, and `JetBrains Mono` telemetry).

| Route | View Code | Functional Purpose |
| :--- | :--- | :--- |
| **`/`** | `[01: OVERVIEW]` | Mission Control Dashboard, Situation Matrix, signature fog lift, replay controls, live report injector. |
| **`/gis-map`** | `[02: GIS MATRIX]` | Interactive satellite positioning radar, spatial coordinates, road isolation index, sector telemetry inspector. |
| **`/deduplication`** | `[03: UNIFIED TRUTH]` | Dispute resolution ledger, casualty conflict range detector (Hospital vs Social Media), agency trust weighting. |
| **`/blackout-intel`** | `[04: BLACKOUT INTEL]` | Spatial physics risk engine (epicenter distance, slope gradient, bridge severance, reconnaissance priority). |
| **`/population`** | `[05: POPULATION]` | Dynamic sector population exposure calculator (census + commuters + tourists - evacuees) & Missing Persons Registry. |
| **`/dispatch`** | `[06: TACTICAL DISPATCH]` | Priority-ranked deployment queue, resource inventory (SAR, MI-17 helicopters, excavators, COWs), and mission assignment console. |
| **`/sitrep`** | `[07: SITREP GEN]` | UN OCHA standard Situation Report generator with printable export, casualty totals, and commander directives. |

---

## 🧮 AI Pipeline & Mathematical Formulations

### 1. Real-Time Situational GIS Telemetry
- Resolves unstructured report locations via exact/fuzzy keyword alias matching and spatial Haversine proximity fallback ($d \le 45\text{ km}$):
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
- Computes per-sector Severity Index ($0.0 \le \text{Sev} \le 10.0$):
  $$\text{Sev} = \min(10.0,\, (\text{Confidence} \times 5.0) + (E_{\text{hazard}} \times 3.0) + (S_{\text{landslide}} \times 2.0))$$

---

### 2. Multi-Agency Deduplication & Unified Truth
- **Sentence Embeddings**: 384-dimensional dense vectors generated with `sentence-transformers/all-MiniLM-L6-v2`.
- **Cosine Distance Clustering**: Clusters duplicate reports with cosine similarity $\ge 0.75$ ($\text{dist} \le 0.25$).
- **Dispute Detection**: Flags casualty discrepancies exceeding threshold (e.g. Social Media claiming 50 dead vs Hospital confirming 3). Prioritizes Hospital logs ($W=0.95$) and Police radios ($W=0.90$) over unverified social posts ($W=0.35$).

---

### 3. Silent Blackout Risk Intelligence
Mountain zones in communication blackout are evaluated using spatial physics rather than assuming lack of news means safety:

$$\text{Inferred Risk} = (E_{\text{hazard}} \times 40.0) + (S_{\text{slope}} \times 30.0) + (I_{\text{road}} \times 30.0)$$

- **Epicenter Proximity Hazard ($E_{\text{hazard}}$)**: Calculated relative to Barpak, Gorkha ($28.00^\circ\text{N}, 84.63^\circ\text{E}$):
  $$E_{\text{hazard}} = \exp\left(-\frac{d_{\text{epi}}}{75.0\text{ km}}\right)$$
- **Slope & Landslide Susceptibility ($S_{\text{slope}}$)**: Topographic gradient and terrain instability.
- **Bridge Severance Multiplier**: $+15\%$ risk penalty if upstream transportation bridges are severed.

---

### 4. Dynamic Population Exposure & Missing Persons
Static census data severely undercounts exposed populations in disaster zones. The platform models:

$$\text{Real-Time Exposed Pop} = \text{Census Baseline} + \text{Commuter Influx} + \text{Tourist Density} - \text{Evacuated}$$

- **Missing Persons Matcher**: Heuristically matches registered missing person cases against incoming hospital intake casualty logs and safe citizen check-ins.

---

### 5. Tactical Resource Dispatch Engine
Computes a deterministic priority score ($0-100$) to allocate scarce rescue assets:

$$\text{Priority Score} = \frac{\max(\text{Verified Threat},\, \text{Inferred Risk}) \times \log_{10}(\text{Exposed Pop}) \times (1.0 + \text{Isolation Index})}{\text{Assigned Missions} + 1}$$

- Automatically matches specialized unit types:
  - `air_ambulance` & `mobile_comms` for severed mountain blackouts.
  - `heavy_excavator` for road blockages and bridge washouts.
  - `sar_heavy` & `medical_triage` for urban multi-story structural collapse.

---

### 6. 24-Hour Timeline & Automated SITREP Generator
- Replay engine manages simulated time ($T_0$ to $T_{24\text{h}}$) with time-phased data arrivals.
- Synthesizes formal UN OCHA Situation Reports detailing:
  - Executive Operational Briefing.
  - Reconciled Casualty Ledger (Fatalities, Injured, Trapped, Missing).
  - Critical Sector Intervention Table.
  - Silent Blackout Threat Briefing.
  - Commander Priority Directives.

---

## 🗺️ Fixed 8-Location Central Nepal Gazetteer

| Sector ID | District / Hub | Centroid Lat | Centroid Lon | Key Municipalities & Landmarks |
| :--- | :--- | :--- | :--- | :--- |
| `kathmandu` | **Kathmandu** | `27.7172° N` | `85.3240° E` | KTM, Thamel, New Road, Bhotahiti, Kalanki, Singha Durbar, Balaju |
| `bhaktapur` | **Bhaktapur** | `27.6710° N` | `85.4298° E` | Bhadgaon, Durbar Square, Sallaghari, Thimi, Madhyapur, Suryabinayak |
| `sindhupalchok`| **Sindhupalchok** | `27.9500° N` | `85.7000° E` | Chautara, Melamchi, Bahrabise, Tatopani, Helambu, Araniko Highway |
| `dolakha` | **Dolakha** | `27.7500° N` | `86.1000° E` | Charikot, Jiri, Tama Koshi, Singati, Bhimeshwor, Kalinchowk |
| `nuwakot` | **Nuwakot** | `27.9167° N` | `85.1667° E` | Bidur, Trishuli, Battar, Devighat, Kakani, Samari |
| `gorkha` | **Gorkha** | `28.0000° N` | `84.6333° E` | Barpak (Epicenter), Arughat, Laprak, Manakamana, Palungtar |
| `rasuwa` | **Rasuwa** | `28.1500° N` | `85.3000° E` | Dhunche, Syabrubesi, Langtang Valley, Timure, Betrawati |
| `sindhuli` | **Sindhuli** | `27.2500° N` | `85.9500° E` | Kamalamai, Sindhulimadhi, BP Highway, Khurkot, Dudhauli |

---

## 📡 Complete API Contract Reference

| Endpoint | Method | Capability Area | Description |
| :--- | :--- | :--- | :--- |
| `/gis/telemetry` | `GET` | Capability 1: GIS | Geospatial telemetry, coordinates, severity, isolation indices. |
| `/deduplication/unified-truth` | `GET` | Capability 2: Truth | Deduplicated multi-agency consensus records and dispute summaries. |
| `/blackout-intel/risk-assessment` | `GET` | Capability 3: Blackout | Spatial physics inferred risk scores for all 8 sectors. |
| `/population/exposure` | `GET` | Capability 4: Population | Real-time exposed population counts with commuter and tourist flux. |
| `/population/missing-persons` | `GET` / `POST` | Capability 4: Population | Search and register missing persons with auto-hospital matching. |
| `/dispatch/dashboard` | `GET` | Capability 5: Dispatch | Priority deployment queue, resource unit status, active missions. |
| `/dispatch/recommendations` | `GET` | Capability 5: Dispatch | Priority-ranked sector dispatch recommendations. |
| `/dispatch/units` | `GET` | Capability 5: Dispatch | Specialized resource inventory (SAR, helicopters, excavators). |
| `/dispatch/assign` | `POST` | Capability 5: Dispatch | Authorize tactical deployment mission. |
| `/sitrep/current` | `GET` | Capability 6: SITREP | Live formal UN OCHA Situation Report document. |
| `/locations/status` | `GET` | Core Matrix | Main situation status per sector. |
| `/locations/{id}/incidents` | `GET` | Core Matrix | Deduplicated cluster dossiers with transparent scoring formulas. |
| `/reports` | `POST` | Core Ingestion | Live field report injection with immediate AI pipeline execution. |
| `/simulation/advance` | `POST` | Core Replay | Step simulation replay clock (+1h, +4h). |
| `/simulation/reset` | `POST` | Core Replay | Reset clock to $T_0$ (`2026-08-30T06:00:00Z`). |

---

## ⚙️ UI, Stability & Hydration Architecture

1. **Hydration Warning Safety**:
   - `suppressHydrationWarning` is configured on root `<html>` and `<body>` elements in `app/layout.tsx` to handle browser extension attributes (such as `cz-shortcut-listen="true"`).
2. **Conflict-Free Composite React Keys**:
   - Across all multi-page grids and tables, mapped elements use sector-scoped composite keys (e.g. `${record.sector_id}-${record.cluster_id}-${index}`) preventing collision warnings across regional clusters.
3. **Live State Synchronization**:
   - Polling engine synchronizes status changes every 2.5s with non-blocking async background timers.

---

## 🧪 Automated Verification & Test Matrix

Run the automated test suite across all 6 capabilities and pipeline modules:
```bash
python -m pytest -v
```

### Test Results (32/32 Passing):
```
tests/test_aggregator.py::test_blackout_no_reports PASSED                [  3%]
tests/test_aggregator.py::test_blackout_silence_window_exceeded PASSED   [  6%]
tests/test_aggregator.py::test_verified_damaged PASSED                   [  9%]
tests/test_aggregator.py::test_verified_safe PASSED                      [ 12%]
tests/test_aggregator.py::test_unverified PASSED                         [ 15%]
tests/test_api.py::test_root_endpoint PASSED                             [ 18%]
tests/test_api.py::test_get_locations PASSED                             [ 21%]
tests/test_api.py::test_all_locations_status PASSED                      [ 25%]
tests/test_api.py::test_single_location_status PASSED                    [ 28%]
tests/test_api.py::test_location_incidents PASSED                        [ 31%]
tests/test_api.py::test_post_report_valid_and_invalid PASSED             [ 34%]
tests/test_api.py::test_simulation_clock_lifecycle PASSED                [ 37%]
tests/test_api.py::test_seed_endpoint PASSED                             [ 40%]
tests/test_capabilities.py::test_gis_telemetry PASSED                    [ 43%]
tests/test_capabilities.py::test_deduplication_unified_truth PASSED      [ 46%]
tests/test_capabilities.py::test_blackout_risk_intelligence PASSED       [ 50%]
tests/test_capabilities.py::test_population_exposure_and_missing_persons PASSED [ 53%]
tests/test_capabilities.py::test_tactical_resource_dispatch PASSED       [ 56%]
tests/test_capabilities.py::test_timeline_sitrep_generator PASSED        [ 59%]
tests/test_clustering.py::test_clustering_near_duplicates PASSED         [ 62%]
tests/test_clustering.py::test_clustering_distinct_events PASSED         [ 65%]
tests/test_clustering.py::test_clustering_empty_and_single PASSED        [ 68%]
tests/test_extractor.py::test_extract_location_by_keyword PASSED         [ 71%]
tests/test_extractor.py::test_extract_location_by_coordinates_fallback PASSED [ 75%]
tests/test_extractor.py::test_extract_location_unresolved PASSED         [ 78%]
tests/test_extractor.py::test_extract_casualties PASSED                  [ 81%]
tests/test_extractor.py::test_extract_damage_type PASSED                 [ 84%]
tests/test_extractor.py::test_extract_all_edge_cases PASSED              [ 87%]
tests/test_scoring.py::test_source_trust_weights PASSED                  [ 90%]
tests/test_scoring.py::test_coordinate_bonus PASSED                      [ 93%]
tests/test_scoring.py::test_staleness_decay_half_life PASSED             [ 96%]
tests/test_scoring.py::test_corroboration_bonus PASSED                   [100%]

============================= 32 passed in 15.41s =============================
```

---

## 📁 Project Directory Tree

```
.
├── app/                                # FastAPI Backend Application
│   ├── config.py                       # Project configuration & scoring weights
│   ├── database.py                     # SQLite engine & session management
│   ├── main.py                         # FastAPI lifespan, CORS, error handlers, router mounting
│   ├── models/
│   │   ├── db.py                       # SQLAlchemy ORM models (Reports, Clock, MissingPerson, ResourceUnit, DispatchMission)
│   │   └── schemas.py                  # Pydantic v2 schemas for all 6 capabilities
│   ├── pipeline/
│   │   ├── gazetteer.py                # 8 Nepal locations, aliases, Haversine fallback
│   │   ├── extractor.py                # Regex extraction (places, casualties, damage tags)
│   │   ├── embedder.py                 # SentenceTransformer embedding with caching
│   │   ├── clustering.py               # Cosine similarity clustering (≥ 0.75)
│   │   ├── scoring.py                  # Explainable reliability scoring & exponential decay
│   │   ├── aggregator.py               # Per-location status machine & blackout detection
│   │   ├── blackout_risk.py            # Spatial physics inferred risk engine for silent zones
│   │   ├── population_exposure.py      # Dynamic population exposure & missing persons matcher
│   │   ├── dispatch_engine.py          # Tactical resource dispatch recommendation ranking
│   │   └── sitrep_generator.py         # Automated UN OCHA Situation Report compiler
│   ├── routers/
│   │   ├── locations.py                # /locations, /status, /{id}/status, /{id}/incidents
│   │   ├── reports.py                  # POST /reports (live ingest) & GET /reports
│   │   ├── simulation.py               # /simulation/state, advance, reset, seed
│   │   ├── gis.py                      # /gis/telemetry
│   │   ├── deduplication.py            # /deduplication/unified-truth
│   │   ├── blackout_intel.py           # /blackout-intel/risk-assessment
│   │   ├── population.py               # /population/exposure, /missing-persons
│   │   ├── dispatch.py                 # /dispatch/dashboard, recommendations, assign
│   │   └── sitrep.py                   # /sitrep/current
│   └── simulation/
│       ├── clock.py                    # 24-hour replay clock manager
│       └── generator.py                # 280+ realistic synthetic disaster dataset generator
├── frontend/                           # Next.js 16 Brutalist Multi-Page App
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css             # Brutalist theme tokens, zero-radius, CSS variables
│   │   │   ├── layout.tsx              # Root layout with global Navbar & font loaders
│   │   │   ├── page.tsx                # [01: OVERVIEW] Mission Control & Situation Matrix
│   │   │   ├── gis-map/page.tsx        # [02: GIS MATRIX] Satellite Telemetry & Spatial Heatmap
│   │   │   ├── deduplication/page.tsx  # [03: UNIFIED TRUTH] Multi-Agency Conflict Resolver
│   │   │   ├── blackout-intel/page.tsx # [04: BLACKOUT INTEL] Spatial Physics Risk Engine
│   │   │   ├── population/page.tsx     # [05: POPULATION] Exposure Tracker & Missing Registry
│   │   │   ├── dispatch/page.tsx       # [06: TACTICAL DISPATCH] Resource Allocation Center
│   │   │   └── sitrep/page.tsx         # [07: SITREP GEN] Official Printable Situation Report
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Global navigation bar across all 7 pages
│   │   │   ├── HeroFog.tsx             # Signature hero with scroll/time-based fog lift
│   │   │   ├── SimulationControls.tsx  # Persistent replay toolbar (+1h, +4h, reset, re-seed)
│   │   │   ├── StatusGrid.tsx          # 8-sector situation matrix cards
│   │   │   ├── LocationDetailModal.tsx # Incident cluster dossiers & scoring formulas
│   │   │   ├── ReportInjectionForm.tsx # Field report injector with instant AI feedback
│   │   │   └── SystemArchitecture.tsx  # Gazetteer reference & formula specifications
│   │   └── lib/
│   │       └── api.ts                  # Type-safe API client for all backend capabilities
│   ├── package.json
│   └── tsconfig.json
├── tests/                              # Pytest Automated Test Suite
│   ├── conftest.py                     # Shared test fixtures (TestClient, DB setup)
│   ├── test_extractor.py               # Regex extraction tests
│   ├── test_clustering.py              # Dense vector clustering tests
│   ├── test_scoring.py                 # Source weights & staleness decay tests
│   ├── test_aggregator.py              # Status state machine & silence window tests
│   ├── test_api.py                     # Core API integration tests
│   └── test_capabilities.py            # Integration tests for all 6 new capabilities
├── requirements.txt                    # Python dependencies
├── .gitignore                          # Monorepo gitignore rules
└── README.md                           # Master Documentation
```

---

<div align="center">

**Post-Disaster Information Fog** — Built as a reliable, load-bearing national disaster-response command system.

</div>
