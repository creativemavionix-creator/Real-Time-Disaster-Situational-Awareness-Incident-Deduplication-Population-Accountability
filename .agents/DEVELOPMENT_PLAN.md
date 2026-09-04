# DEVELOPMENT PLAN — Disaster Situational Awareness Integration

> **Purpose:** Durable, execution-oriented development plan for continuing the existing disaster-response platform from the current Codex state using Antigravity.
>
> **Relationship to other handoff files:** `MASTER_CONTEXT.md` is the canonical project/state summary; `ARCHITECTURE.md` defines subsystem boundaries and design rules; this document defines **what to build, in what order, how to verify it, and what constitutes completion**.
>
> **Source basis:** Consolidated from the supplied Codex/product documents and Codex execution history provided in this conversation.
>
> **Important:** This plan distinguishes planned work from work already reported as implemented. It does not assume historical implementation claims are still true without repository verification.

---

## 0. EXECUTION CONTRACT

Before starting any milestone, Antigravity MUST:

1. Read `MASTER_CONTEXT.md`.
2. Read `ARCHITECTURE.md`.
3. Inspect the actual repository.
4. Confirm the current implementation status of the milestone's files/symbols.
5. Reuse completed work rather than recreating it.
6. Preserve legacy behavior unless a breaking change is explicitly required.
7. Work within the current milestone scope; do not opportunistically redesign unrelated subsystems.
8. Run focused verification before advancing.
9. Run broader regression when the milestone affects shared contracts.
10. Update project-state documentation after meaningful completion or interruption.

### Status vocabulary

Use these states consistently:

- `PLANNED` — intended future work; no supplied evidence of implementation.
- `IMPLEMENTED` — Codex history says the change was made, but verification may be incomplete.
- `VERIFIED` — implementation was followed by a reported passing verification run.
- `PARTIALLY VERIFIED` — focused tests passed but broader verification was not confirmed.
- `BLOCKED` — cannot safely continue without resolving a concrete issue.
- `REGRESSED` — previously working behavior now fails.

Never upgrade `IMPLEMENTED` to `VERIFIED` solely because the code exists.

---

# 1. DELIVERY OBJECTIVE

The project is complete when it delivers a unified scenario-driven disaster intelligence workflow:

```text
Choose disaster
    ↓
Create / select scenario
    ↓
Start scenario
    ↓
Advance simulation
    ↓
Observe geographic impact
    ↓
Detect suspicious silent sectors
    ↓
Compare expected vs observed vs historical context
    ↓
Evaluate infrastructure + neighboring-region context
    ↓
Rank five possible silence causes
    ↓
Generate verification / dispatch recommendations
    ↓
Visualize everything through the GIS workflow
    ↓
Generate scenario-aware SITREP / operational summary
```

The core product invariant is:

> **Silence is not evidence of safety.**

---

# 2. CURRENT STARTING POINT

The supplied Codex execution history establishes a non-greenfield starting point.

### Milestones reported as implemented and fully backend-verified

- **M4 — Expected vs Observed Silence Intelligence**
- **M5 — Infrastructure Context and Isolation Logic**
- **M6 — Five-Cause Silence Reasoning**

Historical Codex full-suite checkpoints reported:

- M4: `102 passed, 2 warnings`
- M6: `105 passed, 2 warnings`
- M5: `109 passed, 2 warnings`

These are historical claims and MUST be revalidated when appropriate against the current repository.

### Milestone reported as implemented but not fully verified

- **M7 — Scenario-Aware Aggregation and Status Output**
  - Focused Milestone 7 tests passed after a ranking tie-break fix.
  - The subsequent full backend regression run was interrupted by the Codex usage limit before a final result was available.
  - Therefore M7 is **PARTIALLY VERIFIED** until the current repository passes the full relevant suite.

### Broad work remaining after M7

The supplied plan identifies the remaining major areas as:

- M8 — Evidence and Recommendation Integration
- M9 — GIS Backend Overlays
- M10 — SITREP and Final Reporting
- M11 — Frontend API Contract Layer
- M12 — Live GIS Demo Workflow
- M13 — Supporting Frontend Pages
- M14 — Backend Tests and Regression Coverage
- M15 — Frontend Validation and Demo Hardening

---

# 3. MILESTONE MAP

| Milestone | Name | Current target state |
|---|---|---|
| M1 | Scenario Domain Foundation | Implemented earlier; verify repository before relying on it |
| M2 | Scenario Lifecycle APIs | Implemented earlier; verify repository before relying on it |
| M3 | Multi-Disaster Simulation Engine | Implemented earlier; verify repository before relying on it |
| M4 | Expected vs Observed Silence Intelligence | Implemented + historically verified |
| M5 | Infrastructure Context and Isolation Logic | Implemented + historically verified |
| M6 | Five-Cause Silence Reasoning Engine | Implemented + historically verified |
| M7 | Scenario-Aware Aggregation and Status Output | Implemented + focused verified; full regression unconfirmed |
| M8 | Evidence and Recommendation Integration | PLANNED |
| M9 | GIS Backend Overlays | PLANNED |
| M10 | SITREP and Final Reporting | PLANNED |
| M11 | Frontend API Contract Layer | PLANNED |
| M12 | Live GIS Demo Workflow | PLANNED |
| M13 | Supporting Frontend Pages | PLANNED |
| M14 | Backend Tests and Regression Coverage | PLANNED |
| M15 | Frontend Validation and Demo Hardening | PLANNED |

The original milestone dependency order remains the default execution order, except where the Codex history already established that M6 was completed before M5. Do not undo that completed work merely to restore the original numerical order.

---

# 4. MILESTONE 1 — SCENARIO DOMAIN FOUNDATION

## Objective

Represent multiple disaster simulations using typed domain objects and persistent scenario state.

## Primary scope

- `backend/app/models/schemas.py`
- `backend/app/models/db.py`

## Intended capabilities

Add or preserve:

- `DisasterType`
- `ScenarioStatus`
- `InfrastructureStatusType`
- `ScenarioCreateRequest`
- `ScenarioResponse`
- `ScenarioAdvanceRequest`
- `SectorScenarioStateSchema`
- `SilentZoneCauseScoreSchema`
- `SilentZoneAssessmentSchema`
- `ScenarioPropagationPointSchema`
- `ScenarioPropagationResponse`

Persistence entities:

- `DisasterScenarioDB`
- `SectorScenarioStateDB`
- `InfrastructureStatusDB`
- `ScenarioEventDB`
- `SilentZoneAssessmentDB`

## Acceptance criteria

- Backend starts without model/schema errors.
- DB initialization can create the required models.
- Sample scenario payloads validate and serialize.
- Existing unrelated APIs still boot.
- Existing model imports are not broken.

## Verification

- backend import smoke test
- application startup / root endpoint
- representative Pydantic validation
- targeted schema/model tests

## Current state note

Historical later milestones demonstrate that scenario state/models existed and were consumed successfully. Treat M1 as already implemented unless repository inspection proves otherwise. Do not recreate it blindly.

---

# 5. MILESTONE 2 — SCENARIO LIFECYCLE APIs

## Objective

Make scenarios callable through a stable API lifecycle.

## Primary scope

`backend/app/routers/simulation.py`

## Required endpoints

```text
POST /simulation/scenarios
GET  /simulation/scenarios
GET  /simulation/scenarios/{scenario_id}
POST /simulation/scenarios/{scenario_id}/start
POST /simulation/scenarios/{scenario_id}/advance
POST /simulation/scenarios/{scenario_id}/reset
```

Legacy endpoints that must remain functional:

```text
/simulation/state
/simulation/reset
/simulation/advance
```

## Acceptance criteria

- Scenario can be created for:
  - flood
  - earthquake
  - cyclone
  - hurricane
- Scenario persists and can be fetched.
- Start changes scenario status correctly.
- Advance changes simulated time/state.
- Reset returns scenario to its initial state.
- Legacy simulation flow continues to operate.

## Verification

- scenario API tests
- request/response validation
- legacy endpoint regression tests

## Current state note

Reported as part of the earlier completed scenario foundation. Verify before proceeding, then reuse.

---

# 6. MILESTONE 3 — MULTI-DISASTER SIMULATION ENGINE

## Objective

Generate disaster-specific geographic impact over time rather than relying on one fixed seeded flow.

## Primary scope

- `backend/app/simulation/generator.py`
- `backend/app/simulation/clock.py`

## Required logical capabilities

- `build_scenario_seed(...)`
- earthquake impact generation
- flood impact generation
- cyclone impact generation
- hurricane impact generation
- scenario event generation
- scenario-aware time helpers where required

### Expected propagation semantics

**Earthquake**
- origin/epicenter centered
- radial/severity attenuation

**Flood**
- directional / flow-path / lowland behavior

**Cyclone / Hurricane**
- directional track / impact corridor

## Acceptance criteria

- Each disaster type produces distinct behavior.
- Scenario advancement changes impacted sectors over time.
- Valid scenarios never produce malformed/empty sector state.
- Existing seeded demo behavior is preserved where practical.

## Verification

- one propagation test per disaster family
- comparison of representative generated outputs
- scenario advance/state progression tests

## Current state note

Reported as already implemented before M4/M6/M5. Verify repository state before touching it.

---

# 7. MILESTONE 4 — EXPECTED VS OBSERVED SILENCE INTELLIGENCE

## Objective

Make silence detection scenario-aware and explicitly driven by expected-vs-observed gaps.

## Primary scope

- `backend/app/pipeline/expected_reality.py`
- `backend/app/pipeline/negative_evidence.py`
- `backend/app/routers/negative_evidence.py`

## Codex-reported implementation

Functions added/upgraded:

```text
compute_expected_signal_for_scenario(...)
compare_observed_vs_expected(...)
compute_sector_silence_score(...)
build_silent_zone_assessment(...)
get_scenario_silence_windows(...)
```

Scenario-aware endpoints:

```text
GET /negative-evidence/scenario/{scenario_id}/assessments
GET /negative-evidence/scenario/{scenario_id}/sector/{sector_id}
```

## Acceptance criteria

- Expected signal can be computed for a valid scenario/sector.
- Significant observed-vs-expected reduction produces a meaningful silence score.
- Zero direct human reports can still produce a silent-zone assessment.
- Assessment includes explanatory fields.
- Silence is never auto-labeled safe.

## Verification

Required cases:

1. expected high / observed zero
2. expected low / observed zero
3. neighboring sectors active / one sector dark
4. safety-state regression check

## Historical verification

Codex reported:

```text
102 passed, 2 warnings
```

against the full backend suite at M4 completion.

## Continuation rule

Do not rewrite this subsystem unless current repository inspection reveals a concrete defect or later requirements demand a change.

---

# 8. MILESTONE 5 — INFRASTRUCTURE CONTEXT AND ISOLATION LOGIC

## Objective

Use infrastructure degradation and neighboring-sector contrast to interpret silence.

## Primary scope

- `backend/app/pipeline/blackout_risk.py`
- `backend/app/pipeline/gazetteer.py`
- `backend/app/routers/blackout_intel.py`
- related schema definitions

## Codex-reported implementation

Added/extended:

```text
distance_between_locations_km(...)
get_neighboring_locations(...)

compute_infrastructure_isolation_score(...)
evaluate_neighbor_connectivity_context(...)
build_infrastructure_isolation_context(...)
assess_sector_blackout_risk(...)
assess_all_blackout_risks(...)
```

Context includes:

- mobile
- internet
- power
- road access
- neighboring-sector contrast

Scenario-aware blackout endpoint:

```text
GET /blackout-intel/risk-assessment?scenario_id=...
```

## Acceptance criteria

- Infrastructure context includes at least mobile/power/internet/road.
- Isolated local outages differ from broad regional outages.
- Neighboring-sector activity changes isolation interpretation.
- Blackout output includes rationale.

## Verification

Required cases:

- localized outage
- broad regional outage
- road cutoff with active telecom
- telecom failure without physical damage

## Historical verification

Codex reported:

```text
109 passed, 2 warnings
```

against the full backend suite after M5.

## Continuation rule

Preserve the neighbor-based context. Do not replace actual location/centroid relationships with frontend-only heuristics.

---

# 9. MILESTONE 6 — FIVE-CAUSE SILENCE REASONING ENGINE

## Objective

Turn a silent-zone assessment into an explainable ranked hypothesis distribution over the five boss-defined causes.

## Primary scope

- `backend/app/pipeline/hypothesis_engine.py`
- `backend/app/pipeline/counterfactual.py`
- `backend/app/models/schemas.py`
- `backend/app/routers/hypotheses.py`

## Codex-reported implementation

Cause scorers:

```text
build_silence_cause_priors(...)
score_communication_failure_hypothesis(...)
score_infrastructure_failure_hypothesis(...)
score_population_movement_hypothesis(...)
score_sensor_failure_hypothesis(...)
score_severe_local_impact_hypothesis(...)
evaluate_silent_zone_causes(...)
```

Counterfactual:

```text
evaluate_silence_counterfactuals(...)
```

Response model:

```text
SilentZoneCauseAnalysisResponse
```

Scenario APIs:

```text
GET /hypotheses/scenario/{scenario_id}/sector/{sector_id}/causes
GET /hypotheses/scenario/{scenario_id}/counterfactuals/{sector_id}
```

## Required output properties

Each cause result should retain enough information for explanation, including the Codex-reported fields:

- probability
- confidence
- evidence-for
- evidence-against
- explanation
- entropy
- expected signal
- observed signal
- signal gap

## Legacy compatibility rule

The historical H1–H5 hypothesis semantics must not be casually overwritten. Codex deliberately added scenario-aware five-cause reasoning as a parallel path so legacy pages/tests continue to work.

## Acceptance criteria

- All five causes receive normalized/consistent scores.
- One cause can be top-ranked.
- Rankings change when evidence changes.
- Counterfactual logic can support or weaken a cause.
- Results remain explainable.

## Verification

- one dominant-evidence test per cause
- mixed-evidence competition test
- stability / explainability assertions

## Historical verification

Codex reported:

```text
105 passed, 2 warnings
```

against the full backend suite after M6.

---

# 10. MILESTONE 7 — SCENARIO-AWARE AGGREGATION AND STATUS OUTPUT

## Objective

Push scenario and silence intelligence into shared sector/location status outputs.

## Primary scope

- `backend/app/pipeline/aggregator.py`
- `backend/app/routers/locations.py`
- related schemas

## Codex-reported implementation

Scenario fields include:

- active disaster state
- silence score
- top cause
- infrastructure isolation
- recommendation priority

Scenario-aware status/ranking support was added to:

```text
/locations/status
/locations/{id}/status
/locations/verification-ranking
```

using optional `scenario_id`.

## Important ranking decision

Codex identified a tie caused by capped display scores.

The implemented approach was:

- keep displayed score capped at 100
- rank internally using uncapped urgency plus scenario priority

This distinction should be preserved.

## Acceptance criteria

- Scenario status contains relevant intelligence.
- Silent/isolated sectors receive increased verification priority.
- Legacy non-scenario location rollups still function.
- Scenario-aware output remains compatible with existing consumers.

## Verification status

Focused M7 tests were reported passing after the ranking tie-break correction.

The subsequent full backend run was interrupted before a final result.

### Required action before considering M7 complete

Run the full backend regression suite on the current repository.

Until then:

```text
M7 = PARTIALLY VERIFIED
```

---

# 11. MILESTONE 8 — EVIDENCE AND RECOMMENDATION INTEGRATION

## Objective

Connect the new reasoning layer to structured evidence, next-best observations, and dispatch actions.

## Primary scope

- `backend/app/pipeline/evidence_model.py`
- `backend/app/pipeline/active_verification.py`
- `backend/app/pipeline/dispatch_engine.py`

## Planned changes

Evidence ingestion:

```text
ingest_infrastructure_evidence(...)
ingest_network_signal_evidence(...)
ingest_sensor_health_evidence(...)
```

Verification:

```text
evaluate_sector_verification_actions(...)
get_ranked_next_best_observations(...)
```

Dispatch:

```text
map_silence_cause_to_response_type(...)
calculate_dispatch_recommendations(...)
assign_dispatch_mission(...)
```

## Acceptance criteria

- Evidence types are structured and normalized.
- Cause ranking influences verification recommendations.
- A communication-failure scenario can produce a different action from a severe-local-impact scenario.
- Dispatch output explains why an action/unit was chosen.
- Cause-linked mission context is preserved.

## Verification

- unit tests for evidence ingestion
- cause-to-action mapping tests
- next-best-observation tests
- dispatch payload inspection
- regression of existing dispatch behavior

## Design guardrail

Recommendations must be downstream of evidence/reasoning. Do not bypass the cause model with a UI-only rule table.

---

# 12. MILESTONE 9 — GIS BACKEND OVERLAYS

## Objective

Expose all scenario intelligence required by the live map.

## Primary scope

- `backend/app/routers/gis.py`
- `backend/app/routers/negative_evidence.py`
- `backend/app/routers/blackout_intel.py`
- `backend/app/routers/hypotheses.py`
- `backend/app/routers/verification.py`
- `backend/app/routers/dispatch.py`
- `backend/app/routers/sitrep.py`

## Planned API behavior

GIS should expose enough structured data to draw:

- disaster progression
- silent zones
- sector risk
- infrastructure/context overlays

Relevant endpoint:

```text
GET /gis/propagation
```

Updated GIS telemetry should be scenario-aware.

Other endpoints should expose:

- silent-zone assessments
- five-cause rankings
- scenario-driven verification
- cause-aware dispatch
- scenario-aware SITREP

## Acceptance criteria

- Map clients can render propagation without reimplementing backend calculations.
- Silent-zone payloads carry enough information for UI explanation.
- Cause ranking is explicit.
- Verification/dispatch APIs are scenario-aware.
- SITREP endpoint includes scenario context.

## Verification

- endpoint contract tests
- representative live-scenario JSON inspection
- frontend-consumption compatibility check

---

# 13. MILESTONE 10 — SITREP AND FINAL REPORTING

## Objective

Turn scenario intelligence into operationally readable final reporting.

## Primary scope

`backend/app/pipeline/sitrep_generator.py`

## Required content

SITREP should include:

- selected disaster type
- propagation summary
- affected/impacted zones
- silent high-risk zones
- ranked silence causes
- recommended actions
- supervisor/local-authority guidance where applicable

## Acceptance criteria

- Disaster type is explicit.
- Silent high-risk sectors are included.
- Causes and recommendations are represented.
- Report does not call a silent zone safe without supporting evidence.

## Verification

- structured assertions / snapshots
- manual review of representative SITREP output
- regression of legacy SITREP generation

---

# 14. MILESTONE 11 — FRONTEND API CONTRACT LAYER

## Objective

Give the frontend strongly typed access to scenario lifecycle, propagation, and intelligence APIs.

## Primary scope

`frontend/src/lib/api.ts`

## Required client contracts

Types/interfaces:

```text
DisasterType
ScenarioResponse
SilentZoneAssessment
PropagationPoint
```

Helpers:

```text
createScenario(...)
listScenarios(...)
getScenario(...)
startScenario(...)
advanceScenario(...)
resetScenario(...)
fetchScenarioPropagation(...)
```

## Acceptance criteria

- frontend builds without new API typing errors
- helper methods match backend payloads
- existing helpers continue to compile
- no duplicate ad-hoc API contracts emerge across pages

## Verification

- TypeScript build
- lint
- representative API fetch from a page

---

# 15. MILESTONE 12 — LIVE GIS DEMO WORKFLOW

## Objective

Build the central end-to-end user journey that demonstrates the product thesis.

## Primary scope

- `frontend/src/app/gis-map/page.tsx`
- `frontend/src/components/SimulationControls.tsx`
- `frontend/src/components/InteractiveVectorMap.tsx`
- `frontend/src/components/ActiveSectorDossier.tsx`
- `frontend/src/components/SectorDetailPanel.tsx`
- `frontend/src/components/FloatingCommandBar.tsx`

## User journey

```text
Select disaster
    ↓
Select scenario/location/severity
    ↓
Start simulation
    ↓
Advance simulation
    ↓
Map shows impact progression
    ↓
Silent sectors become visible
    ↓
Select sector
    ↓
Inspect expected vs observed
    ↓
Inspect top cause
    ↓
Inspect recommendation
```

## Required UI behavior

### Simulation controls

- disaster selector
- start
- advance
- reset
- scenario state visibility

### Map

- propagation overlays
- silent-zone differentiation
- infrastructure/network/context overlays
- sector selection

### Sector dossier

- impact/risk
- likely silence cause
- evidence gap
- recommendation

### Sector detail

- expected vs observed
- nearby-region evidence
- explanation of suspicious silence

## Acceptance criteria

- User can select all four required disaster types.
- Scenario can be started and advanced.
- Map changes as simulation advances.
- Silent zones are visually distinct.
- Sector click exposes expected-vs-observed gap, top cause, and recommendation.
- Experience feels like one unified workflow rather than unrelated pages.

## Verification

- manual end-to-end local walkthrough
- inspect browser console/network behavior
- verify polling/state lifecycle
- confirm no stale scenario state after reset

---

# 16. MILESTONE 13 — SUPPORTING FRONTEND PAGES

## Objective

Make the rest of the application tell the same scenario-first story.

## Primary scope

- `frontend/src/app/page.tsx`
- `frontend/src/app/blackout-intel/page.tsx`
- `frontend/src/app/hypotheses/page.tsx`
- `frontend/src/app/dispatch/page.tsx`
- `frontend/src/app/sitrep/page.tsx`

## Intended changes

### Home

Lead clearly into the scenario demo.

### Blackout intelligence

Reframe from generic blackout status toward silent-zone intelligence.

### Hypotheses

Show the five cause categories and their ranking/explanations.

### Dispatch

Show not only what action is recommended, but why.

### SITREP

Expose scenario type, propagation, silent zones, causes, and actions.

## Acceptance criteria

- Each page has a coherent role in the same overall story.
- Reasoning language is consistent across pages.
- No page duplicates the backend reasoning engine.

---

# 17. MILESTONE 14 — BACKEND TESTS AND REGRESSION COVERAGE

## Objective

Lock in the new behavior without sacrificing the original platform.

## Required test areas

Recommended / supplied test files include:

```text
backend/tests/test_scenarios.py
backend/tests/test_disaster_simulation.py
backend/tests/test_negative_evidence.py
backend/tests/test_hypotheses_and_counterfactual.py
backend/tests/test_blackout_context.py
backend/tests/test_dispatch_scenario_mapping.py
backend/tests/test_gis_scenario_overlays.py
backend/tests/test_sitrep_scenarios.py
```

plus existing regression suites.

## Mandatory critical cases

1. Flood with downstream connectivity loss.
2. Earthquake with epicenter-adjacent infrastructure collapse.
3. Cyclone/hurricane directional multi-sector impact.
4. Silent zone caused by sensor failure rather than physical damage.
5. Silent zone caused by population movement.
6. Silent zone caused by severe local impact.
7. Recommendation favors verification/recon before safety labeling.
8. System never assumes silence means safety.

## Required invariant

```text
silence ≠ safety
```

must have an explicit regression test.

## Completion criteria

- new scenario APIs covered
- every disaster type has propagation coverage
- every silence cause has dedicated coverage
- negative-evidence safety invariant tested
- existing critical tests remain green or have intentional, documented updates

---

# 18. MILESTONE 15 — FRONTEND VALIDATION AND DEMO HARDENING

## Objective

Make the experience technically stable and presentation-ready.

## Validation targets

- frontend build
- lint
- TypeScript consistency
- GIS rendering
- scenario state transitions
- polling
- loading/error states
- responsive behavior

## Required commands from the supplied plan

```text
npm run build
npm run lint
```

## Acceptance criteria

- build succeeds
- no scenario-related TypeScript errors
- GIS scenario rendering works
- overlays remain usable on smaller screens
- no obvious broken loading states
- no interaction dead ends during the demo

---

# 19. DEPENDENCY GRAPH FOR REMAINING WORK

The intended dependency chain is:

```text
M7 Aggregation
      ↓
M8 Evidence + Recommendation
      ↓
M9 GIS Backend
      ↓
M10 SITREP
      ↓
M11 Frontend API Contracts
      ↓
M12 Live GIS Workflow
      ↓
M13 Supporting Pages
      ↓
M14 Backend Regression Lock
      ↓
M15 Frontend Hardening
```

Some verification can and should happen in parallel, but downstream implementation must not depend on undocumented behavior.

---

# 20. TASK BOARD CROSS-REFERENCE

The supplied task board uses these IDs.

## Domain / persistence

```text
BE-001 → BE-005
DB-001 → DB-007
```

## Simulation

```text
SIM-001 → SIM-008
```

## Scenario API

```text
API-SIM-001 → API-SIM-007
```

## Silence / expected-vs-observed

```text
NEG-001 → NEG-006
```

## Infrastructure context

```text
INF-001 → INF-005
```

## Five-cause reasoning

```text
HYP-001 → HYP-009
```

## Aggregation

```text
AGG-001 → AGG-005
```

## Evidence / verification / dispatch

```text
EVD-001 → EVD-003
VER-001 → VER-002
DSP-001 → DSP-003
```

## GIS / related APIs

```text
GIS-001 → GIS-003
NEG-API-001 → NEG-API-002
BLK-API-001
HYP-API-001 → HYP-API-002
VER-API-001
DSP-API-001
SIT-API-001
```

## SITREP

```text
SIT-001 → SIT-003
```

## Frontend API

```text
FE-API-001 → FE-API-008
```

## Live GIS demo

```text
FE-GIS-001 → FE-GIS-010
```

## Supporting frontend

```text
FE-HOME-001
FE-BLK-001 → FE-BLK-002
FE-HYP-001
FE-DSP-001
FE-SIT-001
```

## Tests / validation

```text
TST-001 → TST-012
FE-VAL-001 → FE-VAL-004
```

---

# 21. EXECUTION RULES FOR EACH INDIVIDUAL TASK

For every task, Antigravity should produce a compact internal execution record:

```text
Task:
Current repository state:
Files inspected:
Existing behavior:
Planned change:
Compatibility impact:
Tests to run:
Result:
State after change:
```

Do not start implementation based only on the task ID.

The repository must be inspected first.

---

# 22. SAFE CHANGE STRATEGY

For changes to shared modules:

```text
Inspect consumers
    ↓
Define compatibility envelope
    ↓
Add/extend fields or paths
    ↓
Preserve old calls where possible
    ↓
Run focused tests
    ↓
Run affected integration tests
    ↓
Run full regression when the surface is broad
```

Prefer:

```text
optional scenario_id
optional scenario fields
new scenario-aware endpoints
parallel scenario-aware reasoning
```

over breaking changes to legacy APIs.

---

# 23. TEST GATES

No milestone should be considered complete merely because implementation finished.

Use these gates:

### Gate A — Static integrity

- imports
- typing
- syntax
- startup

### Gate B — Focused behavior

Tests for the modified subsystem.

### Gate C — Contract integrity

Tests for APIs/models/components that consume the modified subsystem.

### Gate D — Regression

Existing critical test suite, especially when shared schemas/routers/pipelines changed.

### Gate E — Demonstration validation

For user-facing milestones:
- real scenario creation
- simulation progression
- map rendering
- silent-zone explanation
- recommendation
- reset / replay

---

# 24. SPECIAL CASE: WHEN A MILESTONE WAS IMPLEMENTED OUT OF ORDER

Codex history demonstrates a real case:

```text
M4 → M6 → M5 → M7
```

This is acceptable.

The numerical milestone order is a default dependency plan, not a license to revert completed work.

Antigravity MUST:

- preserve M6 because it is already implemented and verified;
- use M5 as supporting context for further reasoning;
- never reimplement M6 merely because M5 was completed later;
- use actual repository dependencies to decide the next safe change.

---

# 25. SPECIAL CASE: WHEN HISTORICAL DOCUMENTATION AND CODE DISAGREE

Use this decision rule:

```text
Documentation says implemented
        ↓
Inspect repository
        ↓
Code exists + expected tests exist
        ↓
Run verification
        ↓
Update state
```

If the documented symbol/file no longer exists:

- do not recreate blindly;
- inspect Git history/current architecture;
- determine whether the implementation was renamed/moved/replaced;
- document the discrepancy.

The project memory is historical evidence, not a substitute for repository truth.

---

# 26. IMMEDIATE NEXT ACTION

Given the supplied Codex history, the safest continuation point is:

## Step A — Verify M7

Run the full backend suite and inspect the scenario aggregation changes.

Do not proceed as though M7 is fully green until this is confirmed.

## Step B — Begin M8

After M7 regression is clean, implement:

1. structured infrastructure/network/sensor evidence;
2. cause-aware next-best observations;
3. cause-aware dispatch mapping;
4. tests for the cause-to-action relationship.

## Step C — Then M9

Expose the new intelligence through GIS-ready backend payloads.

## Step D — Then frontend integration

M10/M11 can be developed with clear backend contracts; M12 should consume those contracts rather than recreate backend logic.

---

# 27. DEFINITION OF DONE — WHOLE PROJECT

The project is complete only when all of the following are true:

- user can select `flood`, `earthquake`, `cyclone`, or `hurricane`;
- scenario can be created, started, advanced, and reset;
- impact evolves geographically over time;
- silent sectors are detected from expected-vs-observed gaps;
- historical/contextual evidence can support interpretation;
- infrastructure and neighboring-sector state influence diagnosis;
- every silent zone can receive a ranked five-cause analysis;
- counterfactual reasoning is available where implemented by the architecture;
- verification/dispatch recommendations are cause-aware;
- GIS exposes the full scenario story;
- the live map presents one coherent workflow;
- SITREP reflects scenario state, silent zones, causes, and actions;
- legacy functionality remains operational;
- backend and frontend validation gates pass;
- the final demonstration clearly proves that:

> **Silence is not safety.**

---

# 28. HANDOFF UPDATE REQUIREMENTS

After completing any meaningful milestone/task, update the project-state layer with:

```text
Current milestone:
Completed tasks:
Files changed:
Tests run:
Test result:
Known issues:
Next safe task:
Unverified assumptions:
```

Never leave the next agent to infer the current checkpoint from Git diff alone.

---

# 29. FINAL DEVELOPMENT PRINCIPLE

The project should evolve as:

```text
existing platform
      +
scenario capability
      +
simulation intelligence
      +
silence reasoning
      +
operational response
      +
unified GIS experience
```

—not as a replacement application.

The best implementation is the **smallest change that completes the intended capability, preserves prior behavior, remains explainable, and can be verified independently**.
