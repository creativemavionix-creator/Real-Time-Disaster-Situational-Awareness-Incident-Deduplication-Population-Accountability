# MASTER CONTEXT — Disaster Situational Awareness Integration

> **Purpose:** Canonical context package for transferring an existing disaster-response project from one coding agent (Codex) to another (Antigravity) without losing architectural intent, implementation history, constraints, or verification state.
>
> **Source basis:** Consolidated from the supplied Codex/product-analysis documents and execution history in this conversation.
>
> **Status:** Handoff master document — this file describes the state captured from the supplied material. It is not itself an instruction to redesign the system.

---

## 0. AGENT READ-THIS-FIRST CONTRACT

Before making code changes, the agent MUST:

1. Read this file completely.
2. Read the more specific project-memory files in `.agent/` when present.
3. Inspect the actual repository and verify that documented paths, symbols, and current implementation state still exist.
4. Distinguish between:
   - **IMPLEMENTED** — described as changed in the Codex execution history.
   - **VERIFIED** — explicitly supported by a reported passing test run.
   - **PARTIALLY VERIFIED** — implemented and focused-tested, but broader verification was not confirmed.
   - **PLANNED** — specified as future work but not shown as implemented in the execution history.
5. Never recreate work that is already implemented merely because an earlier plan mentions it.
6. Preserve existing functionality and backward compatibility unless a requirement explicitly authorizes a breaking change.
7. Treat the repository as the ultimate implementation authority if it differs from historical notes; when a material mismatch exists, inspect and document it rather than guessing.

---

# 1. PROJECT IDENTITY

## 1.1 Existing system

The project is an existing disaster situational-awareness / incident-intelligence platform. It was originally built before the current integration work.

The current work is an **extension/integration effort**, not a greenfield rebuild.

The supplied product interpretation describes the existing platform as already containing substantial infrastructure, including:

- FastAPI backend
- Next.js frontend
- GIS/map functionality
- simulation clock
- report ingestion
- extraction pipeline
- deduplication
- expected-vs-observed / baseline logic
- negative-evidence / silence analysis
- blackout intelligence
- population exposure
- missing-person reconciliation
- dispatch recommendations
- SITREP generation
- hypotheses / counterfactual logic
- dataset-backed research features

The exact current implementation must still be treated as repository truth and inspected before assuming any of the above remains unchanged.

## 1.2 Current integration objective

The intended evolution is from a mostly fixed, earthquake-oriented disaster demonstration into a configurable multi-disaster simulation and AI-assisted response-intelligence platform.

The target demo story is:

```text
Choose disaster
    ↓
Choose / create scenario
    ↓
Run and advance simulation
    ↓
Visualize geographic impact on the map
    ↓
Detect suspicious silent zones
    ↓
Compare expected vs observed behavior
    ↓
Use neighboring/infrastructure context
    ↓
Rank five possible causes of silence
    ↓
Recommend verification / response actions
    ↓
Produce operational summary / SITREP
```

## 1.3 Central product thesis

> **Silence is not proof of safety.**

Absence of reports, connectivity, or telemetry is intended to be treated as an evidence gap / potential risk signal that warrants investigation rather than being automatically interpreted as safety.

---

# 2. BUSINESS / PRODUCT REQUIREMENTS

The supplied requirements identify these core capabilities.

## 2.1 Full map integration

The map is intended to be a first-class part of the main workflow, not an isolated feature.

The live map should ultimately support visualization of:

- disaster impact / propagation
- affected sectors
- silent zones
- telecom / network state
- infrastructure-access context
- severity/risk
- response recommendations

## 2.2 Multi-disaster scenario selection

Minimum explicitly named disaster modes:

- `flood`
- `earthquake`
- `cyclone`
- `hurricane`

The architecture is intended to permit additional disaster types later.

## 2.3 Disaster propagation simulation

The simulation should evolve geographically over time and be distinguishable by disaster type rather than appearing as arbitrary random damage.

The supplied design describes these intended behaviors:

- **Earthquake:** epicenter/origin centered, radial/severity attenuation.
- **Flood:** directional / lowland / river-flow-path behavior.
- **Cyclone:** directional track / impact corridor.
- **Hurricane:** directional track / impact corridor.

## 2.4 Silent-zone detection

The system should identify sectors whose observed signals/reporting are unexpectedly low relative to what should be expected.

Possible absence/silence indicators explicitly mentioned include:

- no mobile signal
- no electricity
- no internet
- no road access
- no complaints
- no messages
- lack of expected reporting

A sector can be suspicious even with zero direct human reports.

## 2.5 Expected vs observed vs historical reasoning

Three evidence perspectives are explicitly described:

- **Historical / previous:** what is normally seen in the region or comparable history.
- **Expected:** what the scenario/disaster model predicts should be observed.
- **Observed:** what the system is actually receiving.

The difference between expected and observed behavior is a key input to silence reasoning.

## 2.6 Spatial / neighboring context

Silence is not intended to be evaluated in isolation.

The system should consider:

- neighboring-sector reporting state
- nearby towers / network health
- adjacent areas that remain active
- road accessibility
- infrastructure state
- whether darkness is isolated or regional

## 2.7 Multi-source evidence

Potential evidence sources explicitly identified include:

- human reports
- police / hospital reports
- network signals
- infrastructure status
- sensors
- satellite / remote observations
- neighboring-region behavior

## 2.8 Five-cause silence reasoning

The boss-defined reasoning taxonomy is fixed in the supplied requirements as:

1. **Communication failure**
2. **Infrastructure failure**
3. **Population movement**
4. **Sensor/data failure**
5. **Severe local impact**

The intended system ranks or scores these causes rather than returning only a binary “silent/not silent” result.

## 2.9 Action recommendations

The system should move from diagnosis to operational action, potentially recommending:

- reconnaissance
- supplies
- medical support
- telecom restoration
- road-clearance / engineering support
- supervisor / local-authority notification

Recommendations should be influenced by:

- risk
- silence cause
- population exposure
- access constraints
- available resources
- disaster type

## 2.10 Scenario and location configurability

The system is intended to support disaster- and location-specific scenarios rather than a single hardcoded event narrative.

---

# 3. ARCHITECTURAL PRINCIPLES

## 3.1 Integration over rewrite

The original system is not to be casually replaced or redesigned merely because a new architecture could be cleaner.

The intended implementation pattern repeatedly used in the supplied Codex history is **additive extension with backward compatibility**.

Examples from the execution history:

- scenario-aware expected/observed logic was added while preserving compatibility with the old comparison signature;
- scenario-specific five-cause reasoning was added alongside legacy hypothesis behavior instead of replacing it;
- blackout responses gained optional infrastructure context;
- location status gained optional scenario-aware behavior via `scenario_id`.

Therefore:

> **Prefer extending existing pathways over rewriting them.**

## 3.2 Preserve legacy behavior

The scenario layer should coexist with older simulation / analysis flows where practical.

Legacy endpoints explicitly called out for backward compatibility include:

- `/simulation/state`
- `/simulation/reset`
- `/simulation/advance`

Legacy hypothesis behavior is also explicitly preserved in the supplied Codex execution history.

## 3.3 Separate domain, intelligence, and presentation

The intended system layering is:

```text
Scenario / domain state
        ↓
Simulation engine
        ↓
Expected vs observed analysis
        ↓
Infrastructure + regional context
        ↓
Five-cause reasoning / counterfactuals
        ↓
Aggregation / verification / dispatch
        ↓
GIS/API output
        ↓
Frontend visualization
```

Business reasoning should not be moved wholesale into frontend components.

## 3.4 Scenario is a first-class domain concept

The planned / implemented architecture introduces persistent scenario entities rather than treating simulation as a purely transient frontend animation.

Core scenario-related models named in the material:

- `DisasterScenarioDB`
- `SectorScenarioStateDB`
- `InfrastructureStatusDB`
- `ScenarioEventDB`
- `SilentZoneAssessmentDB`

A possible optional `RecommendationLinkDB` is described in the blueprint, but is not established by the execution history as implemented.

---

# 4. CURRENT VERIFIED / IMPLEMENTED STATE FROM CODEX HISTORY

This section is intentionally conservative.

## 4.1 Milestone 1 — Scenario Domain Foundation

**Status:** `IMPLEMENTED` (covered indirectly by later milestones) 

The execution history states that scenario states/models created in the earlier milestones were successfully consumed by later milestone work.

Planned/identified artifacts include:

- scenario enums/types in `backend/app/models/schemas.py`
- scenario DB models in `backend/app/models/db.py`

The material does not contain a fresh standalone M1 test report in the supplied execution-history excerpt, so do not infer a separate M1 verification result beyond the later successful use of the scenario layer.

## 4.2 Milestone 2 — Scenario Lifecycle APIs

**Status:** `IMPLEMENTED` (subsequent milestones depend on scenario creation/advance behavior)

The supplied plans define lifecycle endpoints for create/list/get/start/advance/reset. The execution history shows later tests invoking scenario lifecycle behavior successfully.

Do not recreate these APIs without first inspecting their current repository implementation.

## 4.3 Milestone 3 — Multi-Disaster Simulation Engine

**Status:** `IMPLEMENTED` in the supplied Codex history.

Milestone 4 explicitly states that Milestone 3 scenario states already contain expected and observed signals, and later milestone tests include disaster-simulation coverage.

The intended scenario engine work includes disaster-specific builders in:

- `backend/app/simulation/generator.py`
- `backend/app/simulation/clock.py`

The exact current implementation must be inspected before modification.

## 4.4 Milestone 4 — Expected vs Observed Silence Intelligence

**Status:** `IMPLEMENTED + VERIFIED`

Codex reported the following additions.

### Expected-reality layer

File:

`backend/app/pipeline/expected_reality.py`

Functions named in the execution report:

- `compute_expected_signal_for_scenario(...)`
- upgraded `compare_observed_vs_expected(...)`

The latter was explicitly described as remaining backward-compatible.

### Negative-evidence layer

File:

`backend/app/pipeline/negative_evidence.py`

Functions named:

- `compute_sector_silence_score(...)`
- `build_silent_zone_assessment(...)`
- `get_scenario_silence_windows(...)`

Scenario assessments are persisted through `SilentZoneAssessmentDB`.

### API

File:

`backend/app/routers/negative_evidence.py`

Scenario-aware endpoints reported by Codex:

- `GET /negative-evidence/scenario/{scenario_id}/assessments`
- `GET /negative-evidence/scenario/{scenario_id}/sector/{sector_id}`

### Verification

Codex reported:

```text
backend/venv/bin/python -m pytest backend/tests
102 passed, 2 warnings
```

Therefore the supplied history supports treating M4 as implemented and full-backend-tested at that point in time.

## 4.5 Milestone 5 — Infrastructure Context and Isolation Logic

**Status:** `IMPLEMENTED + VERIFIED`

### Schema

`backend/app/models/schemas.py`

Added / extended:

- `InfrastructureIsolationContext`
- optional `infrastructure_context` on `BlackoutRiskAssessment`

### Gazetteer

`backend/app/pipeline/gazetteer.py`

Added:

- `distance_between_locations_km(...)`
- `get_neighboring_locations(...)`

The execution report states these use actual centroid-distance logic tied to the project's Nepal sectors.

### Blackout/isolation reasoning

`backend/app/pipeline/blackout_risk.py`

Added / changed:

- `compute_infrastructure_isolation_score(...)`
- `evaluate_neighbor_connectivity_context(...)`
- `build_infrastructure_isolation_context(...)`
- `assess_sector_blackout_risk(...)`
- `assess_all_blackout_risks(...)`

The updated logic incorporates:

- mobile
- internet
- power
- road access
- neighboring-sector contrast
- scenario-generated infrastructure/state rows

### API

`backend/app/routers/blackout_intel.py`

Reported endpoint behavior:

`GET /blackout-intel/risk-assessment?scenario_id=...`

### Verification

Codex reported:

```text
backend/venv/bin/python -m pytest backend/tests
109 passed, 2 warnings
```

## 4.6 Milestone 6 — Five-Cause Silence Reasoning

**Status:** `IMPLEMENTED + VERIFIED`

### Compatibility decision

The existing legacy hypothesis engine had H1–H5, with H1 representing “area safe.” Codex explicitly chose to preserve that legacy path and add scenario-aware five-cause reasoning as a new path.

This is a **LOCKED compatibility principle unless later source material explicitly supersedes it**.

### Schema

`backend/app/models/schemas.py`

Added:

- `SilentZoneCauseAnalysisResponse`

### Hypothesis engine

`backend/app/pipeline/hypothesis_engine.py`

Added:

- `build_silence_cause_priors(...)`
- `score_communication_failure_hypothesis(...)`
- `score_infrastructure_failure_hypothesis(...)`
- `score_population_movement_hypothesis(...)`
- `score_sensor_failure_hypothesis(...)`
- `score_severe_local_impact_hypothesis(...)`
- `evaluate_silent_zone_causes(...)`

The model returns ranked/explainable results including, per the execution report:

- probability
- confidence
- evidence-for
- evidence-against
- explanation
- entropy
- expected signal
- observed signal
- signal gap

### Counterfactual reasoning

`backend/app/pipeline/counterfactual.py`

Added:

- `evaluate_silence_counterfactuals(...)`

### API

`backend/app/routers/hypotheses.py`

Reported scenario endpoints:

- `GET /hypotheses/scenario/{scenario_id}/sector/{sector_id}/causes`
- `GET /hypotheses/scenario/{scenario_id}/counterfactuals/{sector_id}`

### Verification

Codex reported:

```text
backend/venv/bin/python -m pytest backend/tests
105 passed, 2 warnings
```

Therefore M6 is supported as implemented and fully backend-tested in the supplied history.

## 4.7 Milestone 7 — Scenario-Aware Aggregation and Status Output

**Status:** `IMPLEMENTED / PARTIALLY VERIFIED`

The execution history shows substantial implementation work completed.

### Schema

`backend/app/models/schemas.py`

Scenario fields were added to location-status structures. A schema-ordering issue was addressed by using inline literals so model creation/imports remained safe.

### Aggregator

`backend/app/pipeline/aggregator.py`

Scenario state can now be attached to sector status, and verification ranking can prioritize dangerous silent/isolated scenario sectors.

A ranking edge case was found and corrected:

- displayed score remains capped at 100;
- internal ranking uses uncapped urgency plus scenario priority so scenario-priority sectors win otherwise misleading ties.

### Locations API

`backend/app/routers/locations.py`

Scenario-aware fields were wired through:

- `/locations/status`
- `/locations/{id}/status`
- `/locations/verification-ranking`

with an optional `scenario_id` query parameter.

### Verification state

The focused Milestone 7 suite was reported as passing after the ranking fix.

However, the subsequent attempt to run the full backend suite was interrupted by the agent usage limit before a final result was obtained.

Therefore:

```text
Milestone 7
Implementation:        YES
Focused verification: YES
Full regression proof: NOT CONFIRMED
```

**Do not mark M7 fully verified until a fresh full backend suite passes in the current repository.**

---

# 5. CURRENT NEXT WORK

Based on the supplied execution history and roadmap, the next uncompleted milestones are:

- **M8:** Evidence and Recommendation Integration
- **M9:** GIS Backend Overlays
- **M10:** SITREP / Final Reporting
- **M11:** Frontend API Contract Layer
- **M12:** Live GIS Demo Workflow
- **M13:** Supporting Frontend Pages
- **M14:** Backend Tests / Regression Coverage
- **M15:** Frontend Validation / Demo Hardening

The first immediate verification task before building further functionality should be:

> Run the full backend test suite in the current repository and establish a fresh post-M7 baseline.

Expected command from the supplied history:

```bash
backend/venv/bin/python -m pytest backend/tests
```

Do not assume the historical `109 passed` state remains true until rerun.

---

# 6. IMPORTANT REPOSITORY TOUCHPOINTS

## Backend

```text
backend/app/models/schemas.py
backend/app/models/db.py
backend/app/simulation/generator.py
backend/app/simulation/clock.py
backend/app/routers/simulation.py
backend/app/pipeline/expected_reality.py
backend/app/pipeline/negative_evidence.py
backend/app/pipeline/blackout_risk.py
backend/app/pipeline/gazetteer.py
backend/app/pipeline/hypothesis_engine.py
backend/app/pipeline/counterfactual.py
backend/app/pipeline/aggregator.py
backend/app/pipeline/evidence_model.py
backend/app/pipeline/active_verification.py
backend/app/pipeline/dispatch_engine.py
backend/app/pipeline/sitrep_generator.py
backend/app/routers/gis.py
backend/app/routers/negative_evidence.py
backend/app/routers/blackout_intel.py
backend/app/routers/hypotheses.py
backend/app/routers/verification.py
backend/app/routers/dispatch.py
backend/app/routers/sitrep.py
backend/app/routers/locations.py
```

## Frontend

```text
frontend/src/app/page.tsx
frontend/src/app/gis-map/page.tsx
frontend/src/app/blackout-intel/page.tsx
frontend/src/app/hypotheses/page.tsx
frontend/src/app/dispatch/page.tsx
frontend/src/app/sitrep/page.tsx
frontend/src/components/InteractiveVectorMap.tsx
frontend/src/components/SimulationControls.tsx
frontend/src/components/ActiveSectorDossier.tsx
frontend/src/components/SectorDetailPanel.tsx
frontend/src/components/FloatingCommandBar.tsx
frontend/src/components/Navbar.tsx
frontend/src/components/LocationDetailModal.tsx
frontend/src/lib/api.ts
```

---

# 7. IMPORTANT API CONTRACTS CAPTURED FROM THE SUPPLIED MATERIAL

## Scenario lifecycle

```text
POST /simulation/scenarios
GET  /simulation/scenarios
GET  /simulation/scenarios/{scenario_id}
POST /simulation/scenarios/{scenario_id}/start
POST /simulation/scenarios/{scenario_id}/advance
POST /simulation/scenarios/{scenario_id}/reset
```

## Scenario-aware intelligence

```text
GET /negative-evidence/scenario/{scenario_id}/assessments
GET /negative-evidence/scenario/{scenario_id}/sector/{sector_id}
GET /hypotheses/scenario/{scenario_id}/sector/{sector_id}/causes
GET /hypotheses/scenario/{scenario_id}/counterfactuals/{sector_id}
GET /blackout-intel/risk-assessment?scenario_id=...
```

## Planned / updated downstream endpoints

The source plans also identify scenario-aware or enriched endpoints for:

```text
GET /gis/telemetry
GET /gis/propagation
GET /negative-evidence/overview
GET /negative-evidence/sector/{sector_id}
GET /hypotheses/sector/{sector_id}
GET /verification/next-best-observations
GET /dispatch/recommendations
GET /sitrep/current
GET /baselines/{sector_id}/comparison
```

**Important:** The latter group is not all established as implemented by the execution history. Verify each one in the repository before relying on it.

---

# 8. DATA / DOMAIN OBJECTS CAPTURED BY THE DESIGN

Core named objects:

```text
DisasterScenarioDB
SectorScenarioStateDB
InfrastructureStatusDB
ScenarioEventDB
SilentZoneAssessmentDB
```

The blueprint also identifies extensions to:

```text
EvidenceDB
HypothesisDB
BaselineDB
```

Potential scenario fields described in the supplied blueprint include:

### DisasterScenario

```text
scenario_id
disaster_type
origin_sector_id
severity_level
status
started_at
ended_at
```

### SectorScenarioState

```text
scenario_id
sector_id
impact_level
is_silent
is_isolated
population_risk
top_silence_cause
```

### InfrastructureStatus

```text
sector_id
mobile_status
electricity_status
internet_status
road_access_status
last_updated
```

### SilentZoneAssessment

```text
sector_id
scenario_id
expected_signal
observed_signal
silence_score
cause_scores_json
explanation
```

Treat these as design-source fields. Inspect current schemas before adding duplicates or modifying field names.

---

# 9. CRITICAL INVARIANTS

These invariants should remain visible to every coding agent.

## INV-001 — Silence is not safety

Never automatically conclude that a zone is safe solely because reports/signals are absent.

## INV-002 — Preserve legacy flows

New scenario-aware behavior should not casually break legacy simulation, reporting, hypothesis, or location-status behavior.

## INV-003 — Legacy hypothesis semantics remain protected

Do not repurpose the legacy H1–H5 meanings solely to implement the new five-cause model. The supplied Codex execution history explicitly chose an additional scenario-aware reasoning path.

## INV-004 — Scenario reasoning should be explainable

Where cause ranking is exposed, retain evidence-for, evidence-against, confidence/probability, and explanatory context where the current schema supports them.

## INV-005 — Spatial context matters

A sector's silence must be interpreted against surrounding sector/network/infrastructure behavior when those signals are available.

## INV-006 — Display score and ranking signal may differ

The M7 ranking fix demonstrates that a capped user-facing score may need a separate uncapped internal urgency/ranking key.

Do not “simplify” that distinction without verifying the intended ranking semantics.

## INV-007 — Verify before claiming completion

A feature is not fully complete merely because code was edited. Acceptance criteria and the relevant tests must be executed.

## INV-008 — Do not infer current state solely from plans

Historical plans are not proof that code exists. The execution history is stronger evidence of implementation, but the live repository is authoritative for present state.

## INV-009 — Prefer additive changes

When an existing module already provides working legacy behavior, extend it in place or introduce an explicit scenario-aware path rather than replacing the legacy contract without evidence.

## INV-010 — Do not redesign architecture opportunistically

The integration objective does not grant permission to refactor unrelated systems.

---

# 10. DEMO NARRATIVE / USER JOURNEY

The intended boss-facing demonstration is a single coherent flow rather than a collection of independent feature pages.

```text
1. User enters scenario/demo flow
2. Selects disaster type
3. Selects location/origin/severity as supported
4. Starts scenario
5. Map begins showing impact
6. User advances simulation
7. Impacted sectors evolve
8. Some sectors become silent
9. System compares expected vs observed
10. System adds regional/infrastructure context
11. System ranks five silence causes
12. User inspects a sector
13. System explains why the sector is suspicious
14. System recommends next action
15. SITREP / operational summary reflects the scenario
```

The desired user experience should feel unified rather than like disconnected pages.

---

# 11. TESTING PHILOSOPHY

Testing is an integral part of the build sequence.

The supplied plans and execution history define coverage around:

- scenario create/list/start/advance/reset
- disaster-specific propagation
- expected-vs-observed silence
- all five silence causes
- counterfactual reasoning
- infrastructure isolation
- neighboring-sector context
- scenario-aware aggregation
- verification ranking
- dispatch mapping
- GIS overlays
- SITREP output
- frontend API contract
- legacy/regression behavior

Critical adversarial cases explicitly described include:

1. flood with downstream connectivity loss
2. earthquake with infrastructure collapse near the epicenter
3. cyclone/hurricane with directional multi-sector impact
4. silent zone caused by sensor failure rather than real damage
5. silent zone caused by population movement
6. silent zone caused by severe local impact
7. recommendation favors reconnaissance / verification rather than declaring safety
8. the system never assumes silence means safe

---

# 12. KNOWN LIMITATIONS / DESIGN CAUTIONS

## 12.1 “AI model training” does not automatically mean retraining

The supplied product interpretation explicitly warns against assuming that “train the AI” means full ML retraining is the immediate requirement.

Possible near-term interpretations include:

- improving inference logic
- probabilistic/rule-based reasoning
- extending scoring/hypothesis layers
- using existing datasets more effectively

Do not introduce a model-training pipeline unless the actual project/remainder of the source material requires it.

## 12.2 Data realism for non-earthquake scenarios

The existing assets are described as Nepal/earthquake-heavy.

Flood, cyclone, and hurricane behavior may therefore initially need synthetic, heuristic, or scenario-profile-driven data generation before real disaster datasets are integrated.

## 12.3 Demo-first posture

The product request appears primarily demo-oriented in the supplied interpretation.

Immediate priorities include:

- visual clarity
- coherent reasoning
- plausible scenario behavior
- deterministic/stable demo behavior

This does not imply that scientific or operational correctness can be ignored; it means demo completeness is an explicit short-term objective.

---

# 13. STATUS TABLE — CONSOLIDATED HANDOFF VIEW

| Milestone | Capability | Current status from supplied Codex history | Verification state |
|---|---|---|---|
| M1 | Scenario domain foundation | Implemented | Indirectly supported by later milestones; fresh standalone verification not captured here |
| M2 | Scenario lifecycle APIs | Implemented | Later tests demonstrate lifecycle use; verify fresh suite |
| M3 | Multi-disaster simulation engine | Implemented | Used by later scenario-aware tests; verify fresh suite |
| M4 | Expected vs observed silence intelligence | Implemented | Full backend run reported: 102 passed |
| M5 | Infrastructure / isolation context | Implemented | Full backend run reported: 109 passed |
| M6 | Five-cause silence reasoning | Implemented | Full backend run reported: 105 passed |
| M7 | Scenario-aware aggregation/status | Implemented | Focused tests passed; final full-regression result interrupted/not confirmed |
| M8 | Evidence + recommendation integration | Planned / not shown implemented in supplied history | Not verified |
| M9 | GIS backend overlays | Planned / not shown implemented in supplied history | Not verified |
| M10 | SITREP / final reporting | Planned / not shown implemented in supplied history | Not verified |
| M11 | Frontend API contract layer | Planned / not shown implemented in supplied history | Not verified |
| M12 | Live GIS demo workflow | Planned / not shown implemented in supplied history | Not verified |
| M13 | Supporting frontend pages | Planned / not shown implemented in supplied history | Not verified |
| M14 | Backend final testing/regression | Planned | Not completed in supplied history |
| M15 | Frontend validation/demo hardening | Planned | Not completed in supplied history |

---

# 14. SAFE CONTINUATION RULE FOR ANTIGRAVITY

When continuing development from this handoff:

```text
READ MASTER CONTEXT
        ↓
VERIFY LIVE REPOSITORY
        ↓
RUN CURRENT REGRESSION BASELINE
        ↓
IDENTIFY CURRENT MILESTONE
        ↓
READ THAT MILESTONE'S ACCEPTANCE CRITERIA
        ↓
INSPECT EXISTING IMPLEMENTATION
        ↓
MAKE SMALLEST NECESSARY CHANGE
        ↓
RUN FOCUSED TESTS
        ↓
RUN REGRESSION TESTS
        ↓
UPDATE PROJECT MEMORY
        ↓
ONLY THEN MARK MILESTONE COMPLETE
```

Do not skip repository inspection because a historical Codex note gives an exact path or function name.

Do not use historical line numbers as permanent truth; line numbers are snapshots and can move after edits.

Do not assume that a planned endpoint is present simply because it appears in the blueprint.

Do not rewrite previously implemented milestone work unless current tests/repository inspection show a defect or the user explicitly requests redesign.

---

# 15. HANDOFF PRINCIPLE

The agent is inheriting **a project with history**, not receiving permission to start over.

The essential continuity requirements are:

```text
Preserve the existing system
        +
Continue from verified implementation state
        +
Respect locked compatibility decisions
        +
Use milestone acceptance criteria
        +
Test after each meaningful change
        +
Keep the “silence is not safety” thesis intact
```

This document is the high-level source of truth for those principles. More granular `.md` files should refine this context rather than contradict it.
