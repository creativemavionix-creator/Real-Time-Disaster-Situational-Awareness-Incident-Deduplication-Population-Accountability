<div align="center">

# 🌐 PROJECT PRISM
### Post-Disaster Real-Time Intelligence & Situational Mapping
**Autonomous Crisis Reality Reconstruction • Multi-Agency Deduplication • Spatial Physics Blackout Intelligence • Dynamic Population Accountability**

*"Chaos outside. Clarity inside."*

---

[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3%20(Turbopack)-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Uber H3](https://img.shields.io/badge/Uber%20H3-Res%208%20Hexagons-09090B?style=for-the-badge&logo=uber&logoColor=white)](https://h3geo.org)
[![Tests](https://img.shields.io/badge/Tests-43%20Passed%20(100%25)-3FB950?style=for-the-badge&logo=pytest&logoColor=white)](https://pytest.org)

</div>

---

## 📖 Executive Summary

During catastrophic earthquakes and flash floods, emergency operations centers are paralyzed by the **Information Fog**:
- **Massive Noise & Contradiction**: Hundreds of citizen SMS, emergency dispatch calls, and social media posts report the same incident with conflicting casualty estimates and inaccurate locations.
- **The Silent Zone Fallacy**: Traditional dashboards mistake a total absence of reports for safety, whereas zero reports in an epicentral mountain ridge often indicates severed communications and total physical isolation.
- **Fragmented Missing Records**: Missing inquiries from families cannot be matched against hospital admissions and emergency shelter intake logs.

**Project PRISM** turns raw, chaotic disaster signals into verified rescue priorities using **Three Core AI Intelligence Engines**:
1. **Noise Reduction & Time-Decay Triage Engine**: Deduplicates messages within a ~200m radius and applies continuous exponential confidence decay ($C_t = C_0 \cdot e^{-\lambda(t-t_0)}$).
2. **"Silent Zone" (Blackout) & Risk Estimator**: Computes the Silent Sector Exposure Metric ($E_{cell}$) across Uber H3 hexagonal grid cells to identify cut-off mountain communities.
3. **Dynamic Population Reconciliation Ledger**: Executes hybrid entity resolution using Jaro-Winkler phonetic similarity, attribute cosine token overlap, and age delta scoring to reconcile missing person reports against shelter and hospital intake check-ins.

---

## ⚡ Quick Start: How to Run the Platform

### 1️⃣ Start the FastAPI AI Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI server on port 8000
python -m uvicorn app.main:app --reload --port 8000
```
- **API Root**: [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI / Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Interactive Specs**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 2️⃣ Start the Next.js Calm Crisis Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start Next.js Turbopack development server on port 3000
npm run dev -- --port 3000
```
- **Live Command Matrix**: [http://localhost:3000](http://localhost:3000)

---

### 3️⃣ Run Automated Test Suite
```bash
cd backend
pytest -v
```
*(All 43 unit, mathematical formula, entity resolution, and API integration tests pass in ~2.8s).*

---

## 🧠 The 3 Core AI Intelligence Engines

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               1. MULTI-SOURCE INGESTION LAYER                          │
│        [Citizen SMS]   [Police Radios]   [Hospital ER Feeds]   [Social / Twitter]      │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Raw Unstructured Ingestion
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              2. INTELLIGENCE PROCESSING CORE                           │
│  ┌─────────────────────────┐  ┌──────────────────────────┐  ┌───────────────────────┐  │
│  │ 1. Triage & Decay       │  │ 2. Blackout & Risk       │  │ 3. Population Ledger  │  │
│  │ • 200m Deduplication    │  │ • H3 Hexagonal Grid      │  │ • Jaro-Winkler Match  │  │
│  │ • Confidence Decay      │  │ • Silent Exposure E_cell │  │ • Shelter Reconciliation│ │
│  │ • Stale Verification    │  │ • Terrain Physics Inversion│• Review Queue (65-84%) │  │
│  └────────────┬────────────┘  └─────────────┬────────────┘  └───────────┬───────────┘  │
└───────────────┼─────────────────────────────┼───────────────────────────┼──────────────┘
                │                             │                           │
                ▼                             ▼                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       3. OPERATIONAL CRISIS COMMAND CENTER                             │
│       • Geospatial Cartography       • Active Sector Dossier       • SITREP Briefing   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 1. Information Triage & Time-Decay Engine

#### Spatial & Semantic Deduplication
- **Spatial Clustering**: Groups reports within a ~200m aperture into a single `MasterIncident` to prevent emergency responders from duplicating rescue deployments.
- **Multi-Agency Consensus**: Reconciles varying casualty claims across Police, Hospital triage, and Citizen reports into a single weighted consensus record.

#### Continuous Exponential Confidence Decay
Damage states in disaster zones evolve rapidly. The engine applies an active Confidence Score ($C_t$) that decays over elapsed time ($t - t_0$):
$$C_t = C_0 \cdot e^{-\lambda \cdot (t - t_0)}$$

Where:
- $C_0$: Source credibility weight (Hospital ER = 0.95, Police Dispatch = 0.90, Citizen SMS = 0.60, Social Media = 0.35).
- $t - t_0$: Hours elapsed since original report ingestion.
- $\lambda$: Hazard volatility decay rate ($\lambda = 0.25$).
- **Stale Threshold**: When $C_t < 0.35$ or when a report is $>6\text{h}$ old without re-confirmation, the UI automatically flags it as `"Stale / Needs Ground Verification"`.

#### The "Before & After" Showcase
Demonstrates feeding **20 unstructured, chaotic, and duplicated messages** (with typos, conflicting casualty counts, and stale claims) and condensing them into **3 prioritized, actionable rescue tasks** with an **85.0% noise reduction ratio**:
- **Task #1 (Patan Square)**: 4-story masonry collapse with 4 trapped individuals corroborated by Patan Hospital ER triage.
- **Task #2 (Melamchi River Basin)**: Severe bridge severance isolating 15 families on the eastern riverbank.
- **Task #3 (Barpak Epicenter)**: Inferred critical blackout requiring urgent UAV reconnaissance and airborne cellular restoration.

---

### 2. "Silent Zone" (Blackout) & Risk Estimator

#### The Silent Sector Exposure Metric ($E_{cell}$)
Instead of interpreting zero incoming messages as "safe", the engine calculates inferred risk by comparing baseline population against report frequency and adjacent seismic hazard:

$$E_{cell} = \frac{\text{Baseline Population}_{cell}}{\max(1, \text{Report Frequency}_{cell, \Delta t})} \times \text{Adjacent Hazard Index}$$

#### Flashing Grey/Black Silent Zone Detection
- If a high-density sector suddenly drops to 0 incoming messages while surrounding sectors report severe shaking or bridge damage, the cell transitions to **Flashing Grey/Black: Critical Unverified Blackout Zone**.
- This automatically triggers an emergency **Aerial UAV Reconnaissance Sortie** with mesh cellular restoration.

#### Dynamic H3 Hexagonal Grid (Resolution 8)
- Overlays regular hexagonal grid cells across Central Nepal with dynamic status color-coding:
  - **Red**: Critical Severity ($E_{cell} \ge 0.75$).
  - **Yellow**: Moderate Risk ($E_{cell} \ge 0.50$).
  - **Flashing Grey/Black**: Critical Silent Blackout Zone.
  - **Green**: Monitored Safe.

---

### 3. Dynamic Population Reconciliation Ledger

#### Probabilistic Entity Resolution
Cross-references missing person inquiries from families against scattered hospital admissions, shelter registrations, and rescue team check-ins.

#### Hybrid Matching Scoring Formula
$$\text{Match Score} = w_1 \cdot \text{JaroWinkler}(\text{Name}_1, \text{Name}_2) + w_2 \cdot \text{CosineSim}(\vec{V}_{\text{attrs}1}, \vec{V}_{\text{attrs}2}) + w_3 \cdot \Delta_{\text{age}}$$

- **Weights**: $w_1 = 0.55$ (Name Similarity), $w_2 = 0.25$ (Attribute Token Overlap), $w_3 = 0.20$ (Age Proximity), with a $+0.05$ geographic sector bonus.
- **Abbreviation Awareness**: Automatically links variations like `"Rajesh Kumar, 34"` and `"Rajesh K., 35, Red Shirt"`.
- **Classification Tiers**:
  - **High-Confidence Auto-Match ($\text{Score} \ge 0.85$)**: Automatically reconciles the record to `"Accounted / Sheltered"` or `"In Hospital Triage"`.
  - **Suggested Match Review Queue ($0.65 \le \text{Score} < 0.85$)**: Surfaces to dispatchers in a dedicated review queue with 1-click confirmation.

---

## 🗺️ Fixed 8-Location Central Nepal Gazetteer

The system focuses on the 8 most critical disaster sectors across Central Nepal:

| Sector ID | Sector Name | Lat / Lon | Elevation | Baseline Pop (2021 Census) | Critical Hazard Axis |
|---|---|---|---|---|---|
| `gorkha` | Gorkha | 28.00°N, 84.63°E | 1,900m | 75,130 | Barpak M7.8 Epicenter & Mountain Slopes |
| `sindhupalchok` | Sindhupalchok | 27.77°N, 85.70°E | 1,450m | 83,764 | Melamchi River Basin & Araniko Highway |
| `kathmandu` | Kathmandu | 27.72°N, 85.32°E | 1,400m | 1,092,626 | High-Density Masonry & Commuter Flux |
| `bhaktapur` | Bhaktapur | 27.67°N, 85.43°E | 1,401m | 163,258 | Heritage Durbar Square & Clay Soil Shaking |
| `rasuwa` | Rasuwa | 28.13°N, 85.30°E | 1,960m | 8,140 | Langtang Trekking Corridor & Dhunche Gorge |
| `nuwakot` | Nuwakot | 27.91°N, 85.16°E | 1,020m | 54,320 | Trishuli Highway River Blockages & Bidur |
| `dolakha` | Dolakha | 27.70°N, 86.05°E | 1,650m | 32,410 | Charikot Market & Tama Koshi Valley |
| `sindhuli` | Sindhuli | 27.25°N, 85.92°E | 550m | 65,410 | BP Highway Mountain Cuts & Kamalamai Valley |

---

## 🎨 Calm Crisis Intelligence UX Architecture

The frontend follows the philosophy of **"Calm Crisis Intelligence"** (*Chaos outside. Clarity inside*):
- **Editorial Typography**: `Newsreader` (narrative subtitles & quotes), `Plus Jakarta Sans` (display headlines), `Inter` (high-readability operational prose), and `JetBrains Mono` (telemetry & coordinates).
- **Default Dark Mode**: Obsidian charcoal (`#0C0E12`) surfaces with warm off-white typography, quiet slate borders, restrained blue (`#2563EB`), amber (`#D97706`), crimson (`#E11D48`), and emerald (`#059669`).
- **Spatial Command Arena**:
  - **Left (7 Columns)**: Vector cartography with pulsating Barpak epicenter, smooth camera `flyTo` transitions, and toggleable H3 Hexagonal Grid.
  - **Right (5 Columns)**: Active Sector Operational Action Dossier answering the 5 key operator questions in plain, non-jargon language.
- **4 Operational Pillars in Navigation**:
  1. `01 SITUATION` (`/` Command Matrix, `/gis-map` Full Cartography)
  2. `02 INTELLIGENCE` (`/deduplication` Consensus Ledger, `/blackout-intel` Silent Risk, `/population` Population Exposure)
  3. `03 RESPONSE` (`/dispatch` Tactical Queue)
  4. `04 REPORT` (`/sitrep` Automated UN OCHA SITREP)

---

## 🔌 API Endpoint Reference

### 1. Ingestion & Simulation
- `POST /reports`: Ingest raw emergency report (English / Nepali) with instant NLP extraction and deduplication.
- `POST /simulation/advance`: Advance simulated clock timeline (`+1.0h`, `+4.0h`).
- `POST /simulation/reset`: Reset simulation clock to $T_0$ (2026-08-30 06:00 UTC).
- `POST /seed`: Seed 84 realistic multi-agency disaster reports.

### 2. GIS & H3 Hexagonal Cartography
- `GET /gis/telemetry`: Retrieve real-time GIS spatial telemetry for all 8 sectors.
- `GET /gis/h3-grid`: Retrieve Uber H3 hexagonal grid cells (Resolution 8) with $E_{cell}$ Silent Exposure metrics.

### 3. Deduplication & Unified Truth
- `GET /deduplication/unified-truth`: Retrieve multi-agency deduplicated consensus records with dispute ranges and satellite cross-validation.
- `GET /deduplication/before-after-showcase`: Retrieve the 20 raw chaotic messages condensed into 3 prioritized rescue tasks.

### 4. Silent Blackout Intelligence
- `GET /blackout-intel/risk-assessment`: Retrieve spatial physics inferred risk scores, terrain slopes, and reconnaissance priority queues.

### 5. Population Exposure & Entity Resolution
- `GET /population/exposure`: Dynamic exposed population accounting for commuters, tourists, and evacuations.
- `GET /population/missing-persons`: Searchable missing persons inquiries registry.
- `POST /population/missing-persons`: Register a new missing person inquiry.
- `GET /population/reconciliation-ledger`: Split-view Missing vs. Found table with auto-matches ($>0.85$) and suggested review queue ($0.65-0.84$).
- `POST /population/confirm-match`: Confirm a suggested entity match and update victim status.
- `GET /population/palikas/{sector_id}`: Official 2021 NSO Census municipal breakdown with shelter tent requirements.

### 6. Tactical Dispatch & SITREP
- `GET /dispatch/dashboard`: Priority-ranked dispatch queue with resource inventory.
- `POST /dispatch/assign`: Authorize and deploy a specialized response unit.
- `GET /sitrep/current`: Automated UN OCHA / NDMA standardized Situation Report.

---

## 🧪 Automated Verification & Test Matrix

```bash
cd backend
pytest -v
```

| Test Suite | Tests | Description |
|---|---|---|
| `test_reconciliation_and_showcases.py` | 5 | Jaro-Winkler similarity, hybrid entity scoring, H3 grid, Before/After showcase |
| `test_extractor.py` | 10 | Bilingual regex & NLP extraction (casualties, damage types, locations) |
| `test_clustering.py` | 3 | Agglomerative clustering on cosine distance & 200m spatial deduplication |
| `test_scoring.py` | 4 | Source trust weighting, coordinate bonuses, and exponential confidence decay |
| `test_aggregator.py` | 5 | Location status transitions (`verified_damaged`, `blackout`, `verified_safe`) |
| `test_capabilities.py` | 7 | GIS telemetry, population exposure, blackout risk, tactical dispatch, SITREP |
| `test_api.py` | 9 | FastAPI HTTP routes, payload validation, simulation clock controls |
| **Total** | **43 Passing** | **100% Passing in ~2.8 seconds** |

---

## 📁 Repository Directory Structure

```
.
├── backend/
│   ├── app/
│   │   ├── config.py                 # System configuration & thresholds
│   │   ├── database.py               # SQLite / SQLAlchemy connection
│   │   ├── main.py                   # FastAPI application & middleware
│   │   ├── models/
│   │   │   ├── db.py                 # SQLAlchemy ORM database models
│   │   │   └── schemas.py            # Pydantic v2 validation models
│   │   ├── pipeline/
│   │   │   ├── aggregator.py         # Location status aggregation
│   │   │   ├── before_after_engine.py# 20 raw messages -> 3 rescue tasks engine
│   │   │   ├── blackout_risk.py      # Spatial physics & Bayesian silence model
│   │   │   ├── clustering.py         # Cosine semantic & spatial clustering
│   │   │   ├── dispatch_engine.py    # Resource priority ranking & allocation
│   │   │   ├── embedder.py           # Dense sentence-transformers embedding
│   │   │   ├── extractor.py          # Bilingual NLP info extraction
│   │   │   ├── gazetteer.py          # Central Nepal 8-sector gazetteer
│   │   │   ├── h3_grid.py            # Uber H3 Hexagonal Grid & E_cell generator
│   │   │   ├── nepali_nlp.py         # Devanagari transliteration dictionary
│   │   │   ├── population_exposure.py# 2021 Census & dynamic exposure
│   │   │   ├── reconciliation.py     # Jaro-Winkler hybrid entity resolution
│   │   │   ├── satellite_evidence.py # Copernicus Sentinel-1 radar cross-validation
│   │   │   ├── scoring.py            # Source credibility & time-decay scoring
│   │   │   ├── sitrep_generator.py   # UN OCHA SITREP briefing generator
│   │   │   └── structural_fragility.py# 260K building census fragility priors
│   │   ├── routers/                  # Modular FastAPI route handlers
│   │   └── simulation/               # 24-hour simulation clock engine
│   ├── tests/                        # 43 automated pytest unit & integration tests
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx            # Next.js Root Layout with Newsreader & Inter fonts
    │   │   ├── globals.css           # Calm Crisis design tokens & dark theme
    │   │   ├── page.tsx              # Unified Command Arena & 4-Pillar Hub
    │   │   ├── gis-map/page.tsx      # Full GIS Cartography with H3 overlay
    │   │   ├── deduplication/page.tsx# Unified Truth Consensus Ledger
    │   │   ├── blackout-intel/page.tsx# Silent Blackout Intelligence Dossier
    │   │   ├── population/page.tsx   # Population & Probabilistic Reconciliation
    │   │   ├── dispatch/page.tsx     # Tactical Resource Dispatch Queue
    │   │   └── sitrep/page.tsx       # Automated UN OCHA Situation Report
    │   ├── components/               # React components (Map, Dossier, Showcase, Ledger)
    │   ├── context/                  # ThemeContext & ViewModeContext
    │   └── lib/                      # Type-safe API client (api.ts)
    └── package.json
```

---

<div align="center">
  <sub>Built for the National Emergency Operations Centre (NEOC) • Project PRISM 2026</sub>
</div>
