# INTEGRATION MAP — Existing Repository and New Scenario Intelligence

> **Purpose:** Provide Antigravity with a repository-specific map of **where existing functionality lives, where the new scenario/simulation/silence capabilities attach, what data flows between modules, and which surfaces are protected**.
>
> **Companion files:** `MASTER_CONTEXT.md` = project truth/state; `ARCHITECTURE.md` = structural boundaries; `DEVELOPMENT_PLAN.md` = implementation sequence.
>
> **Source basis:** All supplied Codex/product documents and execution-history artifacts in this conversation.
>
> **Important:** This is a **repo-specific intended integration map**, not a substitute for live repository inspection. Paths and symbols below come from the supplied project material. Antigravity MUST verify them against the actual checkout before editing.

---

# 0. HOW TO USE THIS FILE

Before modifying a module:

```text
1. Locate module in this map
2. Read its stated responsibility
3. Identify upstream inputs
4. Identify downstream consumers
5. Check protected behavior
6. Inspect actual code
7. Make the smallest compatible change
8. Run the module's focused tests
9. Run broader regression when contracts are shared
```

Do not assume that because a module is listed as a planned touchpoint it still requires modification.

The correct question is:

> **Does the current repository still need the intended change, and where is the smallest safe attachment point?**

---

# 1. REPOSITORY TOPOLOGY

The supplied material establishes two primary application surfaces:

```text
project-root/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── simulation/
│   │   ├── pipeline/
│   │   └── routers/
│   └── tests/
│
└── frontend/
    └── src/
        ├── app/
        ├── components/
        └── lib/
```

Conceptually:

```text
                    ┌─────────────────────┐
                    │      FRONTEND       │
                    │       Next.js       │
                    └──────────┬──────────┘
                               │ HTTP/API
                               ▼
                    ┌─────────────────────┐
                    │       BACKEND       │
                    │       FastAPI       │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼──────────────────┐
             ▼                 ▼                  ▼
          Models          Simulation          Pipeline
             │                 │                  │
             │                 │       ┌──────────┼─────────────┐
             │                 │       ▼          ▼             ▼
             │                 │    Evidence   Reasoning     Response
             │                 │
             └─────────────────┴──────────────┬────────────────┘
                                              ▼
                                           Routers
                                              │
                                              ▼
                                          Frontend
```

The exact import graph MUST be inspected in the current repository.

---

# 2. INTEGRATION ZONES

The project can be divided into six practical integration zones.

| Zone | Primary responsibility | Key paths |
|---|---|---|
| Domain & Persistence | Scenario definitions and persistent state | `backend/app/models/*` |
| Simulation | Disaster lifecycle and geographic propagation | `backend/app/simulation/*`, simulation router |
| Intelligence | Expected/observed, silence, infrastructure, hypotheses | `backend/app/pipeline/*` |
| Operational Response | Verification, dispatch, SITREP | `active_verification.py`, `dispatch_engine.py`, `sitrep_generator.py` |
| API / GIS Exposure | Convert backend state into frontend-consumable contracts | `backend/app/routers/*` |
| Frontend Demo | Unified scenario setup, map, explanation, actions | `frontend/src/app/*`, `frontend/src/components/*`, `api.ts` |

---

# 3. DOMAIN & PERSISTENCE LAYER

## 3.1 `backend/app/models/schemas.py`

### Responsibility

Defines typed API/domain schemas used across backend modules and HTTP responses.

### Scenario-related contracts

The supplied plan identifies:

```text
DisasterType
ScenarioStatus
InfrastructureStatusType

ScenarioCreateRequest
ScenarioResponse
ScenarioAdvanceRequest

SectorScenarioStateSchema
SilentZoneCauseScoreSchema
SilentZoneAssessmentSchema

ScenarioPropagationPointSchema
ScenarioPropagationResponse
```

The Codex execution history later added:

```text
SilentZoneCauseAnalysisResponse
InfrastructureIsolationContext
```

and extended shared response models such as `BlackoutRiskAssessment` and location status models.

### Upstream

- business/domain logic
- scenario generator
- intelligence pipelines
- database models
- routers

### Downstream

- FastAPI response validation
- frontend API typing
- tests
- shared backend modules

### Integration rule

This file is a **shared contract surface**.

Changes here can ripple across:

```text
pipeline
→ routers
→ frontend
→ tests
```

Therefore:

- prefer optional/additive fields;
- preserve existing field meaning;
- avoid changing requiredness without an explicit compatibility assessment;
- run broader tests after materially changing shared schemas.

### Protected behavior

The Codex history contains a concrete example of using inline literals for some optional fields to avoid ordering/import issues with scenario type aliases. That historical compatibility fix should not be casually undone.

---

## 3.2 `backend/app/models/db.py`

### Responsibility

Persistence/domain database models.

### Scenario models identified by the supplied plan

```text
DisasterScenarioDB
SectorScenarioStateDB
InfrastructureStatusDB
ScenarioEventDB
SilentZoneAssessmentDB
```

Potential extensions:

```text
EvidenceDB
HypothesisDB
BaselineDB
RecommendationLinkDB (optional)
```

### Upstream

- scenario creation/lifecycle
- simulation generation
- evidence/intelligence pipelines

### Downstream

- scenario retrieval
- assessment endpoints
- aggregation
- GIS
- hypotheses
- dispatch
- SITREP
- tests

### Integration rule

Scenario state should remain persistent and queryable.

Do not create competing in-memory scenario stores unless the existing architecture explicitly requires one.

---

# 4. SIMULATION LAYER

## 4.1 `backend/app/simulation/generator.py`

### Responsibility

Generates scenario seeds, disaster-specific impacts, events, and sector state transitions.

### Codex/task-board targets

```text
build_scenario_seed(disaster_type, origin_sector_id, severity_level)

generate_earthquake_sector_impacts(...)

generate_flood_sector_impacts(...)

generate_cyclone_sector_impacts(...)

generate_hurricane_sector_impacts(...)

generate_scenario_events(...)

seed_database(...)
```

### Disaster behavior contract

```text
Earthquake
    → origin / epicenter centered
    → radial/severity attenuation

Flood
    → directional / lowland / downstream flow behavior

Cyclone
    → directional track / corridor

Hurricane
    → directional track / corridor
```

### Upstream

- scenario lifecycle request
- disaster type
- origin sector
- severity
- scenario configuration

### Downstream

- `SectorScenarioStateDB`
- `ScenarioEventDB`
- infrastructure state
- expected signal logic
- silence inference
- GIS propagation output
- frontend map playback

### Protected behavior

The original seeded demo flow is intended to remain functional where practical.

Do not replace the legacy seeding path merely to support scenario generation.

The supplied task board explicitly contemplated splitting legacy and scenario seed flows if necessary.

---

## 4.2 `backend/app/simulation/clock.py`

### Responsibility

Simulation time and advancement semantics.

### Intended scenario integration

Potential helper:

```text
get_active_scenario_time(...)
```

### Upstream

- scenario lifecycle API
- scenario state

### Downstream

- scenario propagation
- expected signal calculations
- event generation
- frontend playback state

### Integration rule

Time is a cross-cutting dependency.

Changing clock semantics can affect:

- expected baselines
- silence windows
- scenario events
- frontend polling
- existing simulation behavior

Treat clock changes as higher-risk than local helper changes.

---

## 4.3 `backend/app/routers/simulation.py`

### Responsibility

HTTP lifecycle control for simulation/scenarios.

### Scenario endpoints

```text
POST /simulation/scenarios
GET  /simulation/scenarios
GET  /simulation/scenarios/{scenario_id}
POST /simulation/scenarios/{scenario_id}/start
POST /simulation/scenarios/{scenario_id}/advance
POST /simulation/scenarios/{scenario_id}/reset
```

### Legacy endpoints

```text
/simulation/state
/simulation/reset
/simulation/advance
```

### Integration pattern

```text
HTTP request
   ↓
schema validation
   ↓
scenario persistence
   ↓
simulation generator / clock
   ↓
updated scenario state
   ↓
response schema
```

### Protected area

Legacy simulation endpoints are explicitly required to remain operational.

Do not break them to introduce scenario mode.

---

# 5. INTELLIGENCE PIPELINE

## 5.1 `backend/app/pipeline/expected_reality.py`

### Responsibility

Expected-vs-observed baseline logic.

### Codex-reported scenario capability

```text
compute_expected_signal_for_scenario(...)
compare_observed_vs_expected(...)
```

The comparison function was upgraded to accept scenario context while maintaining backward compatibility.

### Upstream

- scenario type
- impact level
- sector
- timeline
- historical/baseline information
- optional expected override

### Downstream

- silence scoring
- silent-zone assessments
- sector status
- hypotheses
- verification
- GIS/UI explanation
- SITREP

### Key semantic rule

Expected signal should reflect scenario context rather than merely the old fixed baseline when scenario mode is active.

---

## 5.2 `backend/app/pipeline/negative_evidence.py`

### Responsibility

Detect and explain missing/negative evidence.

### Codex-reported scenario functions

```text
compute_sector_silence_score(...)
build_silent_zone_assessment(...)
get_scenario_silence_windows(...)
```

### Scenario API surface

```text
GET /negative-evidence/scenario/{scenario_id}/assessments
GET /negative-evidence/scenario/{scenario_id}/sector/{sector_id}
```

### Upstream

- scenario sector state
- expected signal
- observed signal
- infrastructure context
- neighboring context where integrated

### Downstream

- `SilentZoneAssessmentDB`
- hypothesis engine
- aggregation
- verification
- GIS
- frontend sector detail

### Protected semantic invariant

```text
Low/zero observed information
        ≠
Safe
```

Silence is an investigation signal.

---

## 5.3 `backend/app/pipeline/blackout_risk.py`

### Responsibility

Assess blackout/isolation risk using infrastructure and connectivity context.

### Codex-reported capabilities

```text
compute_infrastructure_isolation_score(...)

evaluate_neighbor_connectivity_context(...)

build_infrastructure_isolation_context(...)

assess_sector_blackout_risk(...)

assess_all_blackout_risks(...)
```

### Inputs

- mobile status
- internet status
- electricity/power status
- road accessibility
- neighboring-sector activity
- scenario-generated state
- existing blackout signals

### Outputs

- infrastructure degradation
- isolation score
- neighboring-sector contrast
- rationale
- enhanced blackout/risk assessment

### Downstream

- five-cause reasoning
- aggregation
- GIS
- dispatch
- frontend explanations

### Protected behavior

Do not reduce this subsystem back to a single generic `blackout` indicator.

Its intended role is broader:

> **infrastructure-aware isolation inference**

---

## 5.4 `backend/app/pipeline/gazetteer.py`

### Responsibility

Location/sector geographic relationships.

### Codex-reported additions

```text
distance_between_locations_km(...)
get_neighboring_locations(...)
```

### Integration role

Provides spatial adjacency/nearest-neighbor context to the infrastructure and silence reasoning layers.

### Upstream

- location/sector identifiers
- geographic metadata

### Downstream

- blackout isolation
- neighborhood contrast
- GIS contextual data
- scenario reasoning

### Protected behavior

Neighbor relationships should remain tied to actual project sector geography rather than arbitrary frontend approximations.

---

# 6. FIVE-CAUSE REASONING ZONE

## 6.1 `backend/app/pipeline/hypothesis_engine.py`

### Responsibility

Hypothesis generation, scoring, and explainable ranking.

### Legacy behavior

The current system already contains legacy H1-H5 hypotheses.

The Codex history explicitly states that:

> H1 currently means “area safe”

and that legacy behavior should remain intact.

### Scenario five-cause path

The new scenario-aware reasoning includes:

```text
build_silence_cause_priors(...)

score_communication_failure_hypothesis(...)

score_infrastructure_failure_hypothesis(...)

score_population_movement_hypothesis(...)

score_sensor_failure_hypothesis(...)

score_severe_local_impact_hypothesis(...)

evaluate_silent_zone_causes(...)
```

### Five causes

```text
1. Communication failure
2. Infrastructure failure
3. Population movement
4. Sensor/data failure
5. Severe local impact
```

### Expected output

Codex reported fields include:

- probability
- confidence
- evidence-for
- evidence-against
- explanation
- entropy
- expected signal
- observed signal
- signal gap

### Integration rule

The five-cause model is a **scenario-aware extension**, not a reason to overwrite legacy hypothesis semantics.

---

## 6.2 `backend/app/pipeline/counterfactual.py`

### Responsibility

Counterfactual reasoning over silence explanations.

### Codex-reported scenario capability

```text
evaluate_silence_counterfactuals(...)
```

### Conceptual contract

```text
Hypothesis:
"If cause X is true..."

        ↓

Counterfactual expectation:
"What else should we observe?"

        ↓

Compare against current scenario evidence
        ↓
support / weaken hypothesis
```

### Downstream

- five-cause analysis
- explainability
- hypothesis API
- future frontend reasoning panel

### Protected behavior

Do not turn counterfactuals into an unrelated standalone classifier. They are intended to strengthen/weaken an explanation.

---

# 7. AGGREGATION AND SHARED STATUS

## 7.1 `backend/app/pipeline/aggregator.py`

### Responsibility

Build aggregated sector/location status and verification ranking.

### Codex-reported scenario extensions

Scenario-aware output can carry:

- active disaster state
- silence score
- top silence cause
- infrastructure isolation
- recommendation priority

### Important implementation detail

Codex encountered a ranking tie caused by a capped displayed score.

The adopted rule was:

```text
Displayed urgency score
    → capped at 100

Internal ranking
    → uses uncapped urgency
    + scenario priority
```

Preserve this distinction.

### Upstream

- scenario state
- silence assessments
- infrastructure context
- hypothesis output
- location state

### Downstream

- `/locations/status`
- `/locations/{id}/status`
- `/locations/verification-ranking`
- frontend status/dossier views
- verification workflows

### Protected behavior

Legacy non-scenario location aggregation must continue to work.

---

## 7.2 `backend/app/routers/locations.py`

### Responsibility

Expose aggregated location status and verification ranking.

### Scenario-aware behavior

Codex added optional:

```text
scenario_id
```

to status/ranking flows.

### Integration

```text
location router
    ↓
scenario-aware aggregator
    ↓
scenario + silence + isolation state
    ↓
API response
```

### Protected area

This is a shared router used by multiple pages.

Changes here require regression testing beyond only scenario tests.

---

# 8. EVIDENCE AND OPERATIONAL RESPONSE

## 8.1 `backend/app/pipeline/evidence_model.py`

### Responsibility

Normalize evidence into structured forms suitable for downstream reasoning.

### Planned new evidence inputs

```text
ingest_infrastructure_evidence(...)

ingest_network_signal_evidence(...)

ingest_sensor_health_evidence(...)
```

Potential evidence dimensions:

- mobile/network
- power
- internet
- roads
- sensors
- human reports
- nearby-region evidence

### Downstream

- silence inference
- infrastructure isolation
- hypothesis reasoning
- verification
- dispatch
- reporting

### Integration rule

Evidence normalization belongs here.

Do not make frontend components or routers independently reinterpret raw evidence.

---

## 8.2 `backend/app/pipeline/active_verification.py`

### Responsibility

Choose what should be observed/investigated next when information is insufficient.

### Planned scenario-aware integration

```text
evaluate_sector_verification_actions(...)

get_ranked_next_best_observations(...)
```

### Inputs

- risk
- silence score
- cause ranking
- infrastructure context
- scenario state
- available operational options

### Downstream

- verification API
- dispatch recommendations
- frontend action panel
- SITREP

### Important product behavior

A suspicious silent zone should generally produce an opportunity to gather evidence before being interpreted as safe.

---

## 8.3 `backend/app/pipeline/dispatch_engine.py`

### Responsibility

Translate intelligence into operational actions/missions.

### Planned / intended additions

```text
map_silence_cause_to_response_type(...)

calculate_dispatch_recommendations(...)

assign_dispatch_mission(...)
```

### Intended mapping examples

```text
communication failure
    → telecom / connectivity restoration

road access failure
    → engineering / road-clearance support

severe local impact
    → recon / medical / SAR response

sensor failure
    → sensor verification / technical inspection

population movement
    → shelter/population verification / welfare support
```

These are examples of intended response logic from the supplied project material, not fixed exhaustive operational doctrine.

### Protected behavior

Dispatch recommendations must remain cause-aware and explainable.

---

# 9. REPORTING

## 9.1 `backend/app/pipeline/sitrep_generator.py`

### Responsibility

Generate operational situation reports.

### Planned scenario-aware additions

- disaster type
- propagation summary
- silent-zone section
- ranked causes
- recommended actions
- supervisor/local-authority guidance

### Upstream

- scenario state
- aggregate status
- silence analysis
- hypotheses
- dispatch/verification

### Downstream

- `/sitrep/current`
- SITREP frontend page
- demo/reporting workflow

### Protected semantic rule

A SITREP must not call a silent region safe without supporting evidence.

---

# 10. API / ROUTER INTEGRATION MAP

## 10.1 `backend/app/routers/simulation.py`

### Owns

Scenario lifecycle.

### Produces

- scenario identity
- lifecycle state
- scenario advancement

### Consumers

Frontend API client
GIS workflow
simulation state consumers

---

## 10.2 `backend/app/routers/gis.py`

### Owns

Map-ready geographic telemetry and scenario overlays.

### Planned/target changes

```text
get_gis_telemetry(...)
get_scenario_propagation(...)
get_h3_grid(...)
```

### Should expose

- propagation
- impacted sectors
- silent zones
- sector risk
- infrastructure/context overlays

### Architectural rule

The GIS router should **assemble and expose computed intelligence**, not independently implement scenario or hypothesis algorithms.

---

## 10.3 `backend/app/routers/negative_evidence.py`

### Owns

Scenario-aware silent-zone API exposure.

### Endpoints

```text
GET /negative-evidence/scenario/{scenario_id}/assessments
GET /negative-evidence/scenario/{scenario_id}/sector/{sector_id}
```

### Consumer

GIS/sector detail UI and future intelligence pages.

---

## 10.4 `backend/app/routers/blackout_intel.py`

### Owns

Infrastructure/blackout risk API.

### Scenario-aware behavior

```text
GET /blackout-intel/risk-assessment?scenario_id=...
```

### Should expose

- risk
- infrastructure context
- isolation
- neighbor contrast
- rationale

---

## 10.5 `backend/app/routers/hypotheses.py`

### Owns

Legacy and scenario-aware hypothesis APIs.

### Scenario endpoints

```text
GET /hypotheses/scenario/{scenario_id}/sector/{sector_id}/causes
GET /hypotheses/scenario/{scenario_id}/counterfactuals/{sector_id}
```

### Protected rule

Do not break legacy hypothesis endpoints while adding scenario paths.

---

## 10.6 `backend/app/routers/verification.py`

### Owns

Next-best-observation / verification APIs.

### Intended behavior

Expose scenario-driven verification priorities and actions based on silent-zone reasoning.

---

## 10.7 `backend/app/routers/dispatch.py`

### Owns

Operational recommendation APIs.

### Intended behavior

Expose:

- selected action/unit
- cause linkage
- reasoning for recommendation

---

## 10.8 `backend/app/routers/sitrep.py`

### Owns

Scenario-aware current SITREP endpoint.

### Intended behavior

Return scenario context, silent-zone conclusions, and response narrative.

---

# 11. FRONTEND INTEGRATION MAP

## 11.1 `frontend/src/lib/api.ts`

### Responsibility

Typed frontend/backend API boundary.

### Scenario contracts

Intended types:

```text
DisasterType
ScenarioResponse
SilentZoneAssessment
PropagationPoint
```

### Client helpers

```text
createScenario(...)
listScenarios(...)
getScenario(...)
startScenario(...)
advanceScenario(...)
resetScenario(...)
fetchScenarioPropagation(...)
```

### Protected rule

Do not let individual pages invent duplicate API schemas.

This file should remain the primary typed contract surface.

---

# 12. PRIMARY GIS EXPERIENCE

## 12.1 `frontend/src/app/gis-map/page.tsx`

### Responsibility

Central live scenario workflow.

### Should orchestrate

```text
scenario setup
    ↓
scenario lifecycle
    ↓
data fetching
    ↓
map state
    ↓
selected sector
    ↓
intelligence panels
```

### Expected combined data

The Codex plan calls for the page to consume scenario, propagation, silence, dispatch, and GIS information together.

### Protected rule

Keep orchestration here; do not place core domain calculations in the page component.

---

## 12.2 `frontend/src/components/SimulationControls.tsx`

### Responsibility

Scenario controls.

### Intended UI

- disaster selector
- scenario launch
- advance
- reset
- location/severity controls where applicable

### Data dependency

`api.ts` → simulation endpoints.

---

## 12.3 `frontend/src/components/InteractiveVectorMap.tsx`

### Responsibility

Geographic visualization.

### Intended layers

- disaster propagation
- impacted zones
- silent zones
- infrastructure/network context

### Disaster-specific visual concepts

```text
Earthquake → epicenter/radius
Flood      → flow/downstream path
Cyclone    → track/corridor
Hurricane  → track/corridor
```

### Protected rule

Rendering only.

Backend remains responsible for authoritative scenario/intelligence calculations.

---

## 12.4 `frontend/src/components/ActiveSectorDossier.tsx`

### Responsibility

Selected-sector operational summary.

### Intended scenario-aware content

- impact/risk
- silence state
- likely cause
- evidence gap
- recommendation

---

## 12.5 `frontend/src/components/SectorDetailPanel.tsx`

### Responsibility

Deep reasoning view.

### Intended content

```text
expected
observed
gap
nearby behavior
infrastructure context
top cause
recommendation
```

This is the primary UI surface for answering:

> **Why is this zone silent?**

---

## 12.6 `frontend/src/components/FloatingCommandBar.tsx`

### Responsibility

Fast scenario/demo controls.

### Intended additions

- scenario shortcuts
- quick actions
- demo navigation

Keep it a control surface, not an intelligence engine.

---

# 13. SUPPORTING FRONTEND PAGES

## 13.1 `frontend/src/app/page.tsx`

### Role

Main product entry.

### Intended integration

Lead users into the scenario demo.

---

## 13.2 `frontend/src/app/blackout-intel/page.tsx`

### Role

Infrastructure / silence intelligence.

### Intended evolution

From generic blackout presentation toward:

> **silent-zone intelligence**

Should expose:

- infrastructure context
- isolation
- five-cause reasoning where appropriate

---

## 13.3 `frontend/src/app/hypotheses/page.tsx`

### Role

Explainable reasoning view.

### Intended evolution

Show the five scenario silence causes and evidence.

Do not remove legacy hypothesis behavior simply to make room for the scenario view.

---

## 13.4 `frontend/src/app/dispatch/page.tsx`

### Role

Operational recommendations.

### Intended evolution

Show:

```text
what to do
+
why this response was selected
```

---

## 13.5 `frontend/src/app/sitrep/page.tsx`

### Role

Scenario-aware reporting.

### Intended content

- disaster type
- propagation summary
- silent zones
- causes
- response actions

---

## 13.6 `frontend/src/components/Navbar.tsx`

### Role

Navigation.

### Planned change

Optional:

- explicit “Scenario Demo” entry

or make GIS scenario workflow the primary route.

Do not modify navigation solely for aesthetic reasons without confirming the existing information architecture.

---

## 13.7 `frontend/src/components/LocationDetailModal.tsx`

### Role

Supporting contextual location detail.

### Planned change

May expose quick scenario/silent-zone insights if the existing component is part of the active workflow.

Verify actual current usage before editing.

---

# 14. END-TO-END DATA FLOW

## 14.1 Scenario creation

```text
Frontend SimulationControls
        ↓
api.ts
        ↓
POST /simulation/scenarios
        ↓
schemas.py
        ↓
DisasterScenarioDB
        ↓
ScenarioResponse
```

---

## 14.2 Scenario advancement

```text
Frontend
   ↓
POST /simulation/scenarios/{id}/advance
   ↓
simulation router
   ↓
clock + generator
   ↓
SectorScenarioStateDB
ScenarioEventDB
InfrastructureStatusDB
   ↓
response
```

---

## 14.3 Silence analysis

```text
Scenario state
     ↓
expected_reality.py
     ↓
expected signal
     +
observed signal
     ↓
negative_evidence.py
     ↓
silence score
     ↓
SilentZoneAssessmentDB
```

---

## 14.4 Contextual diagnosis

```text
Silent-zone assessment
        +
InfrastructureStatus
        +
Neighbor relationships
        ↓
blackout_risk.py
        ↓
isolation / neighbor contrast
        ↓
hypothesis_engine.py
        ↓
five-cause ranking
        ↓
counterfactual.py
        ↓
support / weaken causes
```

---

## 14.5 Operational response

```text
Cause ranking
     +
Risk
     +
Population/access
     ↓
active_verification.py
     +
dispatch_engine.py
     ↓
next-best observation
     +
response recommendation
```

---

## 14.6 Frontend visualization

```text
GIS / scenario APIs
        ↓
frontend/src/lib/api.ts
        ↓
gis-map/page.tsx
        ├── SimulationControls
        ├── InteractiveVectorMap
        ├── ActiveSectorDossier
        └── SectorDetailPanel
```

---

# 15. CROSS-SUBSYSTEM DEPENDENCY MATRIX

| Module | Primary inputs | Primary outputs | Critical downstream |
|---|---|---|---|
| `schemas.py` | domain definitions | typed contracts | almost all backend + frontend |
| `db.py` | scenario/state data | persistence | all stateful scenario logic |
| `generator.py` | scenario config | impacts/events | scenario state, GIS, intelligence |
| `clock.py` | lifecycle | time/state | simulation + expected signals |
| `expected_reality.py` | scenario + baseline | expected signal | silence analysis |
| `negative_evidence.py` | expected/observed | silence assessment | hypotheses, GIS, status |
| `gazetteer.py` | location geometry | neighbors/distance | isolation reasoning |
| `blackout_risk.py` | infra + neighbors | isolation/context | hypotheses, recommendations |
| `hypothesis_engine.py` | silence + context | cause ranking | verification, dispatch, UI |
| `counterfactual.py` | hypothesis + evidence | support/weakening | reasoning UI/API |
| `aggregator.py` | scenario/intelligence | sector status | locations APIs/UI |
| `evidence_model.py` | raw evidence | normalized evidence | intelligence |
| `active_verification.py` | risk/reasoning | next observations | verification/dispatch |
| `dispatch_engine.py` | cause/risk/access | response missions | dispatch UI/SITREP |
| `sitrep_generator.py` | all major intelligence | report | SITREP API/UI |
| `gis.py` | scenario/intelligence | map-ready payloads | GIS frontend |
| `simulation.py` | lifecycle commands | scenario state | all scenario consumers |
| `negative_evidence.py` router | assessments | HTTP payloads | GIS/detail UI |
| `hypotheses.py` router | cause analysis | HTTP payloads | hypothesis/detail UI |
| `verification.py` router | next observations | HTTP payloads | response UI |
| `dispatch.py` router | recommendations | HTTP payloads | dispatch UI |
| `sitrep.py` router | report | HTTP payload | SITREP UI |
| `api.ts` | backend responses | typed client methods | all scenario pages |
| `gis-map/page.tsx` | API data | UI state | central demo |
| `InteractiveVectorMap.tsx` | map payloads | visual layers | central demo |

---

# 16. PROTECTED REPOSITORY SURFACES

The following areas deserve explicit caution because the supplied Codex history identified compatibility dependencies.

## 16.1 Legacy simulation

Protect:

```text
/simulation/state
/simulation/reset
/simulation/advance
```

Scenario mode must coexist with legacy behavior.

## 16.2 Legacy hypothesis engine

Do not redefine historical H1-H5 semantics solely to fit the new five-cause model.

Use the scenario-aware path unless the current repository demonstrates a safe consolidation strategy.

## 16.3 Shared schemas

Changes to:

```text
backend/app/models/schemas.py
```

may affect multiple routers and tests.

Prefer optional/additive fields.

## 16.4 Location aggregation

Changes to:

```text
aggregator.py
locations.py
```

can affect many existing pages.

Regression-test non-scenario mode.

## 16.5 Existing seeded simulation

Do not remove the existing deterministic/demo-compatible path solely because scenario mode now exists.

---

# 17. HIGH-RISK INTEGRATION POINTS

## High risk — shared schema changes

Reason:
Broad import/validation fan-out.

Mitigation:
Focused model tests + affected API tests + backend regression.

## High risk — simulation clock

Reason:
Time drives propagation, expected signals, and frontend progression.

Mitigation:
Verify old and new lifecycle semantics.

## High risk — hypothesis engine

Reason:
Legacy behavior and new five-cause reasoning coexist.

Mitigation:
Additive scenario path; legacy regression.

## High risk — aggregator

Reason:
Shared status/ranking consumed by multiple pages.

Mitigation:
Scenario and non-scenario regression; preserve ranking semantics.

## High risk — GIS page

Reason:
Central orchestration and multiple concurrent API states.

Mitigation:
Explicit loading/error/reset states; inspect polling and stale-state behavior.

---

# 18. MODULE-LEVEL "DO NOT PUT THIS HERE" RULES

| Responsibility | Correct home | Do NOT move it into |
|---|---|---|
| Disaster propagation math | `simulation/generator.py` | React components |
| Expected signal calculation | `expected_reality.py` | GIS page |
| Silence scoring | `negative_evidence.py` | frontend |
| Neighbor analysis | `gazetteer.py` / `blackout_risk.py` | frontend |
| Five-cause scoring | `hypothesis_engine.py` | router/UI |
| Counterfactual reasoning | `counterfactual.py` | UI component |
| Dispatch selection | `dispatch_engine.py` | page-level conditional logic |
| API typing | `frontend/src/lib/api.ts` | scattered components |
| Map rendering | `InteractiveVectorMap.tsx` | backend |
| Workflow orchestration | GIS page | database/model layer |

---

# 19. REPOSITORY-TRUTH CHECKLIST BEFORE EVERY EDIT

Antigravity should answer these questions before changing an integration point:

```text
[ ] Does the file still exist?
[ ] Does the named function still exist?
[ ] Is the function already scenario-aware?
[ ] Which callers currently depend on it?
[ ] Is there already an equivalent implementation?
[ ] Is the planned task superseded by a later change?
[ ] What legacy behavior must remain?
[ ] What tests cover this path?
[ ] What downstream API/UI consumes the result?
```

If the answer to any of these is unknown and materially affects the change, inspect the repository before editing.

---

# 20. SAFE CHANGE PATTERN

For a new scenario-aware capability:

```text
Existing behavior
      │
      ├── preserve
      │
      └── scenario-aware path
                ↓
          shared domain model
                ↓
          shared/typed output
                ↓
          router exposure
                ↓
          frontend consumption
```

Avoid:

```text
frontend-specific calculation
        +
duplicate backend logic
        +
duplicate API typing
```

---

# 21. CURRENT INTEGRATION FRONTIER

Based on the supplied Codex execution history, the repository had reached:

```text
Scenario Foundation                 implemented earlier
Scenario Lifecycle                  implemented earlier
Multi-Disaster Simulation           implemented earlier
Expected/Observed Silence           implemented + verified
Infrastructure Context              implemented + verified
Five-Cause Reasoning                implemented + verified
Scenario Aggregation                implemented + focused-verified
                                    full regression unconfirmed
```

Therefore the immediate integration frontier after M7 is:

```text
M8
Evidence + Verification + Dispatch
        ↓
M9
GIS Backend Overlays
        ↓
M10
SITREP
        ↓
M11
Frontend API Contracts
        ↓
M12
Central GIS Demo
        ↓
M13
Supporting Pages
        ↓
M14/M15
Final Validation + Hardening
```

---

# 22. ANTIGRAVITY CONTINUATION RULE

When asked to continue implementation, Antigravity should use this exact conceptual path:

```text
MASTER_CONTEXT
      ↓
ARCHITECTURE
      ↓
DEVELOPMENT_PLAN
      ↓
INTEGRATION_MAP
      ↓
CURRENT_STATE (when available)
      ↓
Inspect current repository
      ↓
Identify smallest unfinished safe task
      ↓
Plan change by module boundary
      ↓
Implement
      ↓
Focused tests
      ↓
Regression where required
      ↓
Update CURRENT_STATE / CHANGE_LOG
```

Do not infer the next task solely from the last chat message.

The repository + project-memory state determines the real next task.

---

# 23. FINAL INTEGRATION PRINCIPLE

The existing codebase should be treated as the **host system**.

The new scenario intelligence is an **integration layer** that progressively connects:

```text
scenario
   ↓
simulation
   ↓
expected behavior
   ↓
observed behavior
   ↓
silence
   ↓
infrastructure context
   ↓
five-cause reasoning
   ↓
verification
   ↓
dispatch
   ↓
GIS
   ↓
SITREP
```

The safest implementation is the one that attaches to the existing host system at clear boundaries, preserves legacy behavior, avoids duplicated business logic, and exposes authoritative backend state to the frontend through stable typed contracts.
