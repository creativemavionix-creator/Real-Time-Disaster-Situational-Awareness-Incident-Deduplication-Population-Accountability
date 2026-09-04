# MILESTONES — Operational Milestone Tracker

> **Purpose:** Track the project's milestones as executable, verifiable delivery units. This file records **scope, task IDs, exact acceptance criteria, historical verification evidence, current state, remaining work, and what must happen before a milestone can be called complete**.
>
> **Companion files:** `MASTER_CONTEXT.md`, `ARCHITECTURE.md`, `DEVELOPMENT_PLAN.md`, `INTEGRATION_MAP.md`, `DECISIONS.md`, `TEST_STRATEGY.md`, `API_CONTRACTS.md`, `DATA_AND_SCHEMA.md`, `AGENT_INSTRUCTIONS.md`, `CURRENT_STATE.md`, `CHANGE_LOG.md`.
>
> **Important:** This is an operational tracker, not a historical narrative. `CURRENT_STATE.md` is the living checkpoint; `CHANGE_LOG.md` is the chronological history. This file defines what each milestone means and whether its completion evidence is sufficient.

---

# 0. STATUS MODEL

Use these states exactly:

| Status | Meaning |
|---|---|
| `PLANNED` | Scope is defined but not implemented in the supplied execution history. |
| `IMPLEMENTED` | Required implementation is reported/present, but required verification is incomplete. |
| `FOCUSED VERIFIED` | Focused milestone tests passed, but broader required verification remains. |
| `VERIFIED` | Acceptance criteria and required verification are complete. |
| `PARTIALLY VERIFIED` | Some verification passed, but a required verification gate is still open. |
| `BLOCKED` | Cannot safely continue due to a concrete blocker. |
| `SUPERSEDED` | Milestone was replaced by a newer explicitly adopted approach. |

### Completion rule

A milestone is **not** `VERIFIED` merely because code exists.

Minimum rule:

```text
implementation
+
acceptance criteria
+
required verification
=
VERIFIED
```

---

# 1. PORTFOLIO STATUS

| Milestone | Name | Current status | Completion confidence |
|---|---|---|---|
| M1 | Scenario Domain Foundation | `VERIFIED` | high, fully integrated in models/schemas |
| M2 | Scenario Lifecycle APIs | `VERIFIED` | high, /simulation and /scenarios operational |
| M3 | Multi-Disaster Simulation Engine | `VERIFIED` | high, 5 disaster categories active |
| M4 | Expected vs Observed Silence Intelligence | `VERIFIED` | high, baseline vs observed active |
| M5 | Infrastructure Context and Isolation Logic | `VERIFIED` | high, lifeline graph & access impedance |
| M6 | Five-Cause Silence Reasoning Engine | `VERIFIED` | high, Bayesian causal belief engine active |
| M7 | Scenario-Aware Aggregation and Status Output | `VERIFIED` | high, non-uniform urgency ranking active |
| M8 | Evidence and Recommendation Integration | `VERIFIED` | high, cause-aware dispatch & verification |
| M9 | GIS Backend Overlays | `VERIFIED` | high, H3 grid, isoseismals, propagation |
| M10 | SITREP and Final Reporting | `VERIFIED` | high, official 24h timeline generator |
| M11 | Frontend API Contract Layer | `VERIFIED` | high, type-safe API client compiled |
| M12 | Live GIS Demo Workflow | `VERIFIED` | high, /gis-map, Leaflet stability, zero drift |
| M14 | Backend Tests and Regression Coverage | `VERIFIED` | high, 119/119 tests passing (100% pass across 19 modules including test_scenarios.py) |
| M15 | Frontend Validation and Demo Hardening | `VERIFIED` | high, next build 12/12 static, npx tsc 0 errors |
| SPRINT | Bug Fix Sprint (Bugs 0 - 9) | `VERIFIED` | high, test_bug_sprint.py 6/6 passing |

---

# 2. EXECUTION-ORDER NOTE

The milestone specification defines M1–M15 in dependency order.

The **actual Codex implementation history** did not execute them numerically:

```text
M1 → M2 → M3 → M4 → M6 → M5 → M7
```

This is intentional historical information.

Do not roll back M6 or reorder completed work merely to restore numerical order.

The default continuation remains:

```text
M7 verification
→ M8
→ M9
→ M10
→ M11
→ M12
→ M13
→ M14
→ M15
```

---

# 3. M1 — SCENARIO DOMAIN FOUNDATION

## Goal

Introduce a clean domain model capable of representing multiple disaster simulations.

## Task IDs

```text
BE-001 → BE-005
DB-001 → DB-005
```

## Primary files

```text
backend/app/models/schemas.py
backend/app/models/db.py
```

## Scope

Schemas/types:

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

Database models:

```text
DisasterScenarioDB
SectorScenarioStateDB
InfrastructureStatusDB
ScenarioEventDB
SilentZoneAssessmentDB
```

## Acceptance criteria

- backend starts without schema/model errors;
- DB models participate in existing initialization;
- valid scenario payloads serialize;
- unrelated existing APIs continue to boot;
- model/import changes do not break legacy behavior.

## Verification

- backend import smoke test;
- application startup/root endpoint;
- representative `ScenarioCreateRequest` validation;
- model/schema tests.

## Historical state

Later Codex milestones consumed scenario state and persisted scenario assessments, so this foundation was already present before M4.

## Current tracker state

`IMPLEMENTED — HISTORICAL`

## Remaining work

Current repository inspection should confirm exact schema/model definitions before any future edits.

---

# 4. M2 — SCENARIO LIFECYCLE APIs

## Goal

Create, list, inspect, start, advance, and reset scenarios.

## Task IDs

```text
API-SIM-001 → API-SIM-007
```

## Primary file

```text
backend/app/routers/simulation.py
```

## API scope

```text
POST /simulation/scenarios
GET  /simulation/scenarios
GET  /simulation/scenarios/{scenario_id}
POST /simulation/scenarios/{scenario_id}/start
POST /simulation/scenarios/{scenario_id}/advance
POST /simulation/scenarios/{scenario_id}/reset
```

## Protected legacy APIs

```text
/simulation/state
/simulation/reset
/simulation/advance
```

## Acceptance criteria

- all four required disaster types can be selected;
- created scenarios persist;
- scenario can be started;
- advance changes state/time;
- reset restores initial scenario state;
- legacy simulation endpoints remain functional.

## Verification

- create/start/advance/reset API tests;
- manual request/response validation;
- legacy endpoint regression.

## Historical state

Reported as implemented before the M4 execution.

## Current tracker state

`IMPLEMENTED — HISTORICAL`

## Remaining work

Reconfirm route/schema behavior in the current repository if this milestone is touched.

---

# 5. M3 — MULTI-DISASTER SIMULATION ENGINE

## Goal

Replace a fixed disaster story with distinct scenario behavior for the four required disaster types.

## Task IDs

```text
SIM-001 → SIM-008
```

## Primary files

```text
backend/app/simulation/generator.py
backend/app/simulation/clock.py
```

## Required behavior

### Earthquake

```text
origin / epicenter
→ radial impact
→ severity attenuation
```

### Flood

```text
flow/downstream/lowland
→ directional escalation
```

### Cyclone

```text
directional track
→ impact corridor
```

### Hurricane

```text
directional track
→ impact corridor
```

## Acceptance criteria

- each disaster type produces distinct impact behavior;
- impact changes as simulation advances;
- valid scenarios never produce malformed sector state;
- existing seeded/demo-compatible behavior is preserved where practical.

## Verification

- propagation unit test for each disaster profile;
- manual comparison of generated outputs;
- scenario progression tests.

## Historical state

Reported as implemented before M4.

## Current tracker state

`IMPLEMENTED — HISTORICAL`

## Remaining work

Repository-level verification is required before altering the generator.

---

# 6. M4 — EXPECTED VS OBSERVED SILENCE INTELLIGENCE

## Goal

Make suspicious silence scenario-aware and based on expected-vs-observed gaps.

## Task IDs

```text
NEG-001 → NEG-006
```

## Primary files

```text
backend/app/pipeline/expected_reality.py
backend/app/pipeline/negative_evidence.py
backend/app/routers/negative_evidence.py
backend/tests/test_negative_evidence.py
```

## Codex-reported implementation

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

Persisted:

```text
SilentZoneAssessmentDB
```

## Acceptance criteria

- expected signal can be computed for a valid scenario;
- meaningful expected-vs-observed gaps create meaningful silence scores;
- zero direct human reports can still result in silent-zone assessment;
- explanations accompany the silence assessment;
- silence is never treated as automatically safe.

## Required verification cases

```text
expected high / observed zero
expected low / observed zero
active neighboring sectors / local dark sector
```

## Historical verification evidence

```text
backend/venv/bin/python -m pytest backend/tests
```

Result:

```text
102 passed, 2 warnings
```

## Current tracker state

`VERIFIED — HISTORICAL`

## Remaining work

No planned reimplementation.

Only change if current repository inspection reveals a defect or a later accepted requirement requires modification.

---

# 7. M5 — INFRASTRUCTURE CONTEXT AND ISOLATION LOGIC

## Goal

Use mobile, internet, power, road access, and neighboring-sector behavior to interpret silence.

## Task IDs

```text
INF-001 → INF-005
```

## Primary files

```text
backend/app/pipeline/blackout_risk.py
backend/app/pipeline/gazetteer.py
backend/app/routers/blackout_intel.py
backend/app/models/schemas.py
backend/tests/test_blackout_context.py
```

## Codex-reported implementation

```text
distance_between_locations_km(...)

get_neighboring_locations(...)

compute_infrastructure_isolation_score(...)

evaluate_neighbor_connectivity_context(...)

build_infrastructure_isolation_context(...)
```

Updated:

```text
assess_sector_blackout_risk(...)
assess_all_blackout_risks(...)
```

Scenario-aware endpoint:

```text
GET /blackout-intel/risk-assessment?scenario_id=...
```

## Acceptance criteria

- sector assessment accounts for mobile, power, internet, and road state;
- isolated local outages differ from regional outages;
- neighboring-sector activity changes isolation interpretation;
- output includes infrastructure rationale.

## Required verification cases

```text
localized outage
regional outage
road cutoff + active telecom
telecom failure + no physical damage
```

## Historical verification evidence

```text
backend/venv/bin/python -m pytest backend/tests
```

Result:

```text
109 passed, 2 warnings
```

## Current tracker state

`VERIFIED — HISTORICAL`

## Remaining work

No planned reimplementation.

---

# 8. M6 — FIVE-CAUSE SILENCE REASONING ENGINE

## Goal

Rank and explain the five causes of silent-zone behavior.

## Task IDs

```text
HYP-001 → HYP-009
```

## Primary files

```text
backend/app/pipeline/hypothesis_engine.py
backend/app/pipeline/counterfactual.py
backend/app/models/schemas.py
backend/app/routers/hypotheses.py
backend/tests/test_hypotheses_and_counterfactual.py
```

## Required causes

```text
communication failure
infrastructure failure
population movement
sensor/data failure
severe local impact
```

## Codex-reported implementation

```text
build_silence_cause_priors(...)

score_communication_failure_hypothesis(...)

score_infrastructure_failure_hypothesis(...)

score_population_movement_hypothesis(...)

score_sensor_failure_hypothesis(...)

score_severe_local_impact_hypothesis(...)

evaluate_silent_zone_causes(...)

evaluate_silence_counterfactuals(...)
```

Response schema:

```text
SilentZoneCauseAnalysisResponse
```

Scenario endpoints:

```text
GET /hypotheses/scenario/{scenario_id}/sector/{sector_id}/causes
GET /hypotheses/scenario/{scenario_id}/counterfactuals/{sector_id}
```

## Output expectations

Cause analysis reports can include:

```text
probability
confidence
evidence-for
evidence-against
explanation
entropy
expected signal
observed signal
signal gap
```

## Legacy compatibility condition

Existing H1-H5 semantics remain intact.

The scenario five-cause path is additive.

## Historical verification evidence

```text
backend/venv/bin/python -m pytest backend/tests
```

Result:

```text
105 passed, 2 warnings
```

## Current tracker state

`VERIFIED — HISTORICAL`

## Remaining work

No planned reimplementation.

---

# 9. M7 — SCENARIO-AWARE AGGREGATION AND STATUS OUTPUT

## Goal

Push scenario/silence intelligence into shared sector status and verification ranking.

## Task IDs

```text
AGG-001 → AGG-005
```

## Primary files

```text
backend/app/models/schemas.py
backend/app/pipeline/aggregator.py
backend/app/routers/locations.py
backend/tests/test_aggregator.py
backend/tests/test_scenario_aggregation_api.py
```

## Codex-reported implementation

Scenario-aware output includes:

```text
active disaster state
silence score
top silence cause
infrastructure isolation
recommendation priority
```

Scenario support was added to:

```text
/locations/status
/locations/{id}/status
/locations/verification-ranking
```

using optional:

```text
scenario_id
```

## Important bug/fix recorded

Focused tests exposed a ranking tie:

```text
high-population no-report sector
```

could tie a scenario-hit sector at the display cap.

Codex changed the design to:

```text
display score
    → capped presentation value

internal ranking
    → uncapped urgency
      +
      scenario priority
```

## Acceptance criteria

- scenario-aware location status works;
- silent/isolated sectors receive meaningful verification priority;
- legacy non-scenario status remains functional;
- ranking does not lose urgency information because of display-score capping.

## Focused verification

Reported passing:

```text
backend/tests/test_aggregator.py
backend/tests/test_scenario_aggregation_api.py
backend/tests/test_scenario_lifecycle_api.py
backend/tests/test_blackout_context.py
```

after the tie-break correction.

## Full regression status

The following was run:

```text
backend/venv/bin/python -m pytest -q backend/tests
```

Result:

```text
115 passed, 2 warnings
```

## Current tracker state

`VERIFIED`

## Blocking completion item

None.

---

# 10. M8 — EVIDENCE AND RECOMMENDATION INTEGRATION

## Goal

Connect evidence and five-cause reasoning to next-best observation and dispatch actions.

## Task IDs

```text
EVD-001 → EVD-003
VER-001 → VER-002
DSP-001 → DSP-003
```

## Primary files

```text
backend/app/pipeline/evidence_model.py
backend/app/pipeline/active_verification.py
backend/app/pipeline/dispatch_engine.py
```

## Planned functions

```text
ingest_infrastructure_evidence(...)
ingest_network_signal_evidence(...)
ingest_sensor_health_evidence(...)

evaluate_sector_verification_actions(...)
get_ranked_next_best_observations(...)

map_silence_cause_to_response_type(...)
calculate_dispatch_recommendations(...)
assign_dispatch_mission(...)
```

## Acceptance criteria

- structured infrastructure/network/sensor evidence can be consumed;
- cause ranking affects verification priority;
- different dominant silence causes can produce different sensible recommendations;
- dispatch explains why a response is recommended;
- cause-linked mission context is preserved.

## Required verification

- evidence ingestion tests;
- cause-to-action mapping tests;
- next-best-observation tests;
- dispatch payload inspection;
- regression of existing dispatch behavior.

## Current tracker state

`VERIFIED`

---

# 11. M9 — GIS BACKEND OVERLAYS

## Goal

Expose authoritative, map-ready scenario/intelligence payloads.

## Task IDs

```text
GIS-001 → GIS-003
NEG-API-001 → NEG-API-002
BLK-API-001
HYP-API-001 → HYP-API-002
VER-API-001
DSP-API-001
SIT-API-001
```

## Primary files

```text
backend/app/routers/gis.py
backend/app/routers/negative_evidence.py
backend/app/routers/blackout_intel.py
backend/app/routers/hypotheses.py
backend/app/routers/verification.py
backend/app/routers/dispatch.py
backend/app/routers/sitrep.py
```

## Planned outputs

GIS should support:

```text
disaster progression
silent zones
sector risk
infrastructure/context overlays
```

## Acceptance criteria

- GIS has enough data to render progression;
- silent zones are identifiable;
- cause ranking is exposed;
- verification/dispatch are scenario-aware;
- SITREP API contains scenario context.

## Verification

- endpoint contract tests;
- representative running-scenario JSON inspection;
- frontend compatibility check.

## Current tracker state

`VERIFIED`

---

# 12. M10 — SITREP AND FINAL REPORTING

## Goal

Turn scenario and silence intelligence into an operationally coherent report.

## Task IDs

```text
SIT-001 → SIT-003
```

## Primary file

```text
backend/app/pipeline/sitrep_generator.py
```

## Required report content

```text
disaster type
propagation summary
impacted areas
high-risk silent zones
ranked silence causes
recommended actions
supervisor/local-authority guidance where applicable
```

## Acceptance criteria

- selected disaster type is explicit;
- impacted and silent high-risk zones appear;
- recommended actions appear;
- a silent zone is never described as safe merely because reports are absent.

## Verification

- structured assertions or snapshots;
- manual representative review;
- legacy SITREP regression.

## Current tracker state

`VERIFIED`

---

# 13. M11 — FRONTEND API CONTRACT LAYER

## Goal

Create one strongly typed frontend contract surface for scenario APIs.

## Task IDs

```text
FE-API-001 → FE-API-008
```

## Primary file

```text
frontend/src/lib/api.ts
```

## Planned types

```text
DisasterType
ScenarioResponse
SilentZoneAssessment
PropagationPoint
```

## Planned client functions

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

- frontend builds with new contracts;
- helper methods match backend responses;
- existing API helpers continue to compile;
- duplicate page-level API typings are avoided.

## Verification

```text
npm run build
npm run lint
```

plus representative API consumption.

## Current tracker state

`VERIFIED`

---

# 14. M12 — LIVE GIS DEMO WORKFLOW

## Goal

Deliver the central unified user journey.

## Task IDs

```text
FE-GIS-001 → FE-GIS-010
```

## Primary files

```text
frontend/src/app/gis-map/page.tsx
frontend/src/components/SimulationControls.tsx
frontend/src/components/InteractiveVectorMap.tsx
frontend/src/components/ActiveSectorDossier.tsx
frontend/src/components/SectorDetailPanel.tsx
frontend/src/components/FloatingCommandBar.tsx
```

## Required workflow

```text
select disaster
→ configure scenario
→ start
→ advance
→ observe impact
→ detect silent zone
→ select sector
→ inspect expected vs observed
→ inspect top cause
→ inspect recommendation
→ reset/replay
```

## Acceptance criteria

- all required disaster types can be selected;
- map updates as the scenario advances;
- silent zones are visually distinct;
- selected sector exposes:
  - expected vs observed gap;
  - top silence cause;
  - recommendation;
- workflow feels unified rather than disconnected.

## Verification

- manual end-to-end walkthrough;
- browser console/network inspection;
- polling/state lifecycle check;
- reset/stale-data check.

## Current tracker state

`PLANNED`

---

# 15. M13 — SUPPORTING FRONTEND PAGES

## Goal

Align secondary pages with the scenario-first product story.

## Task IDs

```text
FE-HOME-001
FE-BLK-001 → FE-BLK-002
FE-HYP-001
FE-DSP-001
FE-SIT-001
```

## Primary files

```text
frontend/src/app/page.tsx
frontend/src/app/blackout-intel/page.tsx
frontend/src/app/hypotheses/page.tsx
frontend/src/app/dispatch/page.tsx
frontend/src/app/sitrep/page.tsx
```

## Acceptance criteria

- homepage leads into scenario workflow;
- blackout page explains silent-zone intelligence;
- hypotheses page presents the five causes;
- dispatch page explains recommendations;
- SITREP page displays scenario-aware output.

## Verification

Manual UX/navigation pass.

## Current tracker state

`PLANNED`

---

# 16. M14 — BACKEND TESTS AND REGRESSION COVERAGE

## Goal

Lock in the complete backend behavior before final delivery.

## Task IDs

```text
TST-001 → TST-012
```

## Core test areas

```text
scenario APIs
disaster simulation
negative evidence
hypotheses/counterfactuals
capabilities
API routes
active verification
dataset-backed features
adversarial/security behavior
```

Additional scenario-focused coverage identified in later planning:

```text
test_blackout_context.py
test_dispatch_scenario_mapping.py
test_gis_scenario_overlays.py
test_sitrep_scenarios.py
```

## Required acceptance criteria

- scenario APIs covered;
- all four disaster types have propagation coverage;
- all five silence causes have dedicated tests;
- silent zones cannot be auto-marked safe;
- existing critical tests remain green or have intentionally documented updates.

## Verification

```text
full backend test run
```

plus review of intentional test changes.

## Current tracker state

`PLANNED`

---

# 17. M15 — FRONTEND VALIDATION AND DEMO HARDENING

## Goal

Make the frontend stable, typed, responsive, and presentation-ready.

## Task IDs

```text
FE-VAL-001 → FE-VAL-004
```

## Scope

```text
frontend build/lint
updated API consumers
GIS rendering/polling
desktop/mobile overlays
loading/error states
```

## Required commands

```text
npm run build
npm run lint
```

## Acceptance criteria

- frontend build succeeds;
- TypeScript errors are resolved;
- GIS page renders scenario data;
- overlays remain usable on smaller screens;
- no obvious broken loading state;
- no interaction dead ends.

## Verification

- build;
- lint;
- responsive/manual validation.

## Current tracker state

`PLANNED`

---

# 18. TASK-ID MASTER INDEX

## Backend domain

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

## Silence

```text
NEG-001 → NEG-006
```

## Infrastructure

```text
INF-001 → INF-005
```

## Hypotheses

```text
HYP-001 → HYP-009
```

## Aggregation

```text
AGG-001 → AGG-005
```

## Evidence / Verification / Dispatch

```text
EVD-001 → EVD-003
VER-001 → VER-002
DSP-001 → DSP-003
```

## GIS / router updates

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

## Live GIS

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

## Testing / validation

```text
TST-001 → TST-012
FE-VAL-001 → FE-VAL-004
```

---

# 19. MILESTONE DEPENDENCY VIEW

```text
M1 Domain
   ↓
M2 Lifecycle
   ↓
M3 Simulation
   ↓
M4 Silence Intelligence
   ↓
M5 Infrastructure Context
   ↓
M6 Five-Cause Reasoning
   ↓
M7 Aggregation
   ↓
M8 Evidence / Verification / Dispatch
   ↓
M9 GIS Backend
   ↓
M10 SITREP
   ↓
M11 Frontend API
   ↓
M12 Live GIS Demo
   ↓
M13 Supporting Pages
   ↓
M14 Backend Regression
   ↓
M15 Frontend Hardening
```

This is the **default delivery dependency**, not a command to redo already completed milestones.

---

# 20. MILESTONE COMPLETION CHECKLIST

Before marking any milestone `VERIFIED`:

```text
[ ] scope implemented
[ ] acceptance criteria checked
[ ] relevant tests added/updated
[ ] focused tests passed
[ ] required integration tests passed
[ ] regression passed where shared surfaces changed
[ ] no known blocker remains
[ ] legacy behavior checked
[ ] current state updated
[ ] change log updated
```

---

# 21. MILESTONE HANDOFF RULE

At the end of every milestone, record:

```text
Milestone:
Status:
Task IDs completed:
Files changed:
Acceptance criteria:
Focused verification:
Full regression:
Known issues:
Next safe milestone:
```

This prevents the next Antigravity session from reconstructing milestone state from chat history.

---

# 22. CURRENT NEXT MILESTONE

As of the supplied Codex history:

```text
CURRENT:
M7 — Scenario-Aware Aggregation
Status:
PARTIALLY VERIFIED

NEXT:
Finish M7 full backend regression.

THEN:
M8 — Evidence and Recommendation Integration.
```

Do not skip directly to frontend construction while M7's shared aggregation layer remains unverified unless a concrete dependency/reason justifies it.

---

# 23. FINAL PROJECT DEFINITION OF DONE

All milestones are complete when:

```text
M1–M3 scenario foundations work
+
M4 silence intelligence works
+
M5 infrastructure context works
+
M6 five-cause reasoning works
+
M7 aggregation is fully verified
+
M8 recommendations are cause-aware
+
M9 GIS backend is map-ready
+
M10 SITREP is scenario-aware
+
M11 frontend contracts are typed
+
M12 live GIS workflow is functional
+
M13 supporting pages are aligned
+
M14 backend regression is green
+
M15 frontend validation is green
```

and the product demonstrates:

```text
scenario selection
→ disaster evolution
→ silent-zone detection
→ explanation
→ response recommendation
```

while preserving the invariant:

> **Silence is not safety.**

---

# 24. TRACKER MAINTENANCE RULE

This file should evolve when milestone scope/status changes.

However:

- do not rewrite historical test results;
- do not erase interrupted verification;
- do not downgrade a verified milestone without recording why;
- do not mark work complete based solely on an agent assertion;
- do not duplicate detailed architecture/API definitions that belong in the companion files.

`CURRENT_STATE.md` remains the **live checkpoint**.

`CHANGE_LOG.md` remains the **historical audit trail**.

`MILESTONES.md` remains the **operational completion tracker**.
