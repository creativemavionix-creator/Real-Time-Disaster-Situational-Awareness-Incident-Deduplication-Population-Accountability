# API_CONTRACTS — Backend / Frontend Contract Specification

> **Purpose:** Define the durable HTTP/API contracts connecting the FastAPI backend to the Next.js frontend for the scenario-driven disaster simulation, silence intelligence, reasoning, verification, dispatch, GIS, and SITREP workflow.
>
> **Companion files:** `MASTER_CONTEXT.md`, `ARCHITECTURE.md`, `DEVELOPMENT_PLAN.md`, `INTEGRATION_MAP.md`, `DECISIONS.md`, `MILESTONES.md`, `TEST_STRATEGY.md`.
>
> **Contract discipline:** This document records contracts explicitly established or strongly implied by the supplied Codex planning/execution material. Where exact field-level implementation was not verified in the supplied execution history, the item is marked `PROPOSED` and MUST be reconciled with the current repository before implementation.
>
> **Primary compatibility principle:** New scenario-aware contracts must coexist with legacy APIs unless an explicit breaking migration is approved.

---

# 0. CONTRACT STATUS LEGEND

- `IMPLEMENTED` — supplied Codex history explicitly reports the endpoint/type was added or updated.
- `VERIFIED-HISTORICAL` — implementation was exercised in a reported successful test run.
- `PROPOSED` — planning specification; not proof the current repository implements it.
- `COMPATIBILITY-REQUIRED` — existing behavior must remain functional.
- `OPEN` — exact repository contract still requires inspection.

Do not silently convert `PROPOSED` fields into mandatory production behavior.

---

# 1. API DESIGN PRINCIPLES

## 1.1 Backend is authoritative

The backend is the source of truth for:

- scenario lifecycle;
- disaster propagation;
- expected signal;
- observed signal interpretation;
- silence scoring;
- infrastructure isolation;
- five-cause reasoning;
- counterfactuals;
- verification priorities;
- dispatch recommendations;
- SITREP content.

The frontend consumes these results.

It must not reimplement the intelligence algorithms.

---

## 1.2 Scenario context should be explicit

Scenario-aware endpoints should carry:

```text
scenario_id
```

either:

- as a path parameter; or
- as an explicitly documented query parameter where the existing endpoint semantics support it.

Avoid implicit global “current scenario” state when a request can be made explicit.

---

## 1.3 Additive evolution preferred

Where legacy APIs already exist:

```text
old contract
+
optional scenario-aware behavior
```

is preferred over:

```text
old contract
→ breaking replacement
```

Examples from the supplied Codex history include optional scenario context and scenario-specific endpoints.

---

# 2. DOMAIN ENUMS AND SHARED TYPES

## 2.1 `DisasterType`

### Required values

```text
flood
earthquake
cyclone
hurricane
```

### Status

`ESTABLISHED`

### Notes

Future disaster types should be extensible without changing the fundamental scenario lifecycle.

---

## 2.2 `ScenarioStatus`

### Status

`ESTABLISHED`

The supplied task board requires a typed scenario status model.

Exact enum values are `OPEN` unless verified from the current repository.

Likely lifecycle concepts include:

```text
created
started / running
advanced
reset
completed
```

Do not invent exact enum spellings without inspecting `schemas.py`.

---

## 2.3 `InfrastructureStatusType`

### Status

`ESTABLISHED`

Used for infrastructure-state representation.

Exact enum vocabulary is `OPEN` pending current-repository verification.

---

# 3. SCENARIO CREATION CONTRACT

## Endpoint

```http
POST /simulation/scenarios
```

### Status

`PROPOSED BY PLAN / LIFECYCLE SUPPORTED BY LATER EXECUTION`

### Purpose

Create a persistent disaster scenario.

### Proposed request shape

```json
{
  "disaster_type": "flood",
  "origin_sector_id": "sindhupalchok",
  "start_time": "2026-08-31T10:00:00Z",
  "severity_level": "high",
  "propagation_profile": "river_downstream",
  "include_infrastructure_failures": true
}
```

### Known fields from supplied material

| Field | Meaning | Status |
|---|---|---|
| `disaster_type` | selected disaster | established |
| `origin_sector_id` | scenario origin sector | established |
| `start_time` | simulation start time | proposed/established |
| `severity_level` | scenario severity | established |
| `propagation_profile` | propagation behavior selector | proposed |
| `include_infrastructure_failures` | enable scenario-driven infrastructure effects | proposed |

### Response

Intended to return `ScenarioResponse`.

At minimum, the response should expose enough information to identify and inspect the created scenario.

Exact current fields MUST be read from `schemas.py` before frontend implementation.

---

# 4. SCENARIO LIST

## Endpoint

```http
GET /simulation/scenarios
```

### Purpose

List existing scenarios or scenario presets.

### Status

`PROPOSED / PLANNED`

### Contract requirements

A returned scenario should be identifiable by:

```text
scenario_id
disaster_type
status
```

Additional metadata should follow the actual backend schema.

---

# 5. SCENARIO DETAIL

## Endpoint

```http
GET /simulation/scenarios/{scenario_id}
```

### Purpose

Retrieve authoritative current scenario state.

### Status

`PROPOSED / PLANNED`

### Contract intent

The response should be sufficient for the client to know:

- scenario identity;
- selected disaster;
- lifecycle status;
- simulation time/current step;
- origin/severity where modeled;
- current scenario state.

Do not make the frontend reconstruct scenario state from independent endpoints unless required by the actual UX.

---

# 6. SCENARIO START

## Endpoint

```http
POST /simulation/scenarios/{scenario_id}/start
```

### Purpose

Move a created scenario into active execution.

### Acceptance expectations

- correct status transition;
- scenario clock becomes active/consistent;
- initial scenario state becomes available.

### Status

`PROPOSED / PLANNED`

---

# 7. SCENARIO ADVANCE

## Endpoint

```http
POST /simulation/scenarios/{scenario_id}/advance
```

### Purpose

Advance simulation time/state.

### Acceptance expectations

- simulation time changes according to the configured clock;
- impacted sectors can change over time;
- scenario events may be produced;
- downstream intelligence sees the updated state.

### Status

`PROPOSED / LIFECYCLE USED BY LATER CODEX TESTS`

---

# 8. SCENARIO RESET

## Endpoint

```http
POST /simulation/scenarios/{scenario_id}/reset
```

### Purpose

Return scenario state to its defined initial state.

### Acceptance expectations

Reset must remove/restore scenario-specific transient state as defined by the domain.

At minimum:

```text
scenario timeline
impact progression
scenario-derived transient state
```

must not remain stale.

### Status

`PROPOSED / PLANNED`

---

# 9. LEGACY SIMULATION CONTRACTS

The following existing endpoints are protected:

```text
/simulation/state
/simulation/reset
/simulation/advance
```

### Compatibility requirement

Scenario development MUST NOT implicitly break these routes.

### Reason

The supplied Codex material explicitly calls for backward-compatible coexistence of old and new simulation flows.

### Contract status

`COMPATIBILITY-REQUIRED`

---

# 10. SCENARIO PROPAGATION CONTRACT

## Endpoint

```http
GET /gis/propagation
```

### Purpose

Return map-ready disaster progression/impact information.

### Status

`PROPOSED / PLANNED`

### Intended response

Should contain data conforming to:

```text
ScenarioPropagationPointSchema
ScenarioPropagationResponse
```

The exact JSON shape must be taken from the actual backend model.

Conceptually:

```json
{
  "scenario_id": "...",
  "points": [
    {
      "sector_id": "...",
      "timestamp": "...",
      "impact_level": "...",
      "lat": 0.0,
      "lon": 0.0
    }
  ]
}
```

This example is conceptual only; do not implement these exact field names unless present in the repository schema.

---

# 11. GIS TELEMETRY CONTRACT

## Endpoint

```http
GET /gis/telemetry
```

### Purpose

Return sector telemetry enriched with scenario overlays/context.

### Expected content

Potentially:

- sector identity;
- telemetry;
- scenario impact;
- silence metadata;
- infrastructure context;
- risk.

### Status

`PROPOSED / PLANNED`

### Contract rule

GIS telemetry should expose authoritative computed values rather than require the frontend to recompute risk/silence.

---

# 12. H3 / SECTOR GRID CONTRACT

## Endpoint

Existing route associated with:

```text
get_h3_grid(...)
```

### Intended update

Scenario-aware risk/impact should be reflected where appropriate.

### Status

`PROPOSED / PLANNED`

### Contract rule

Do not create a second independent map-risk calculation in the frontend.

---

# 13. SILENT-ZONE ASSESSMENT CONTRACT

## 13.1 Scenario assessment overview

### Endpoint

```http
GET /negative-evidence/scenario/{scenario_id}/assessments
```

### Status

`IMPLEMENTED`

### Historical Codex verification

Included in the M4 focused tests and reported as part of the successful M4 backend suite.

---

## 13.2 Sector-specific assessment

### Endpoint

```http
GET /negative-evidence/scenario/{scenario_id}/sector/{sector_id}
```

### Status

`IMPLEMENTED`

### Purpose

Return the detailed silence assessment for one sector.

---

## 13.3 Conceptual assessment fields

The supplied task/schema material identifies fields such as:

```text
sector_id
scenario_id
expected_signal
observed_signal
silence_score
cause_scores_json
explanation
```

The implementation should use the actual Pydantic/DB schema rather than hard-code this conceptual list.

### Required semantics

A valid assessment should make it possible to answer:

```text
What was expected?
What was observed?
How large is the gap?
Why is this suspicious?
```

### Critical invariant

A silence assessment MUST NOT itself imply:

```text
safe = true
```

merely because observations are absent.

---

# 14. EXPECTED VS OBSERVED COMPARISON CONTRACT

## Backend functions

```text
compute_expected_signal_for_scenario(...)
compare_observed_vs_expected(...)
```

### Responsibility

Produce the expected signal and comparison context used by silence intelligence.

### Status

`IMPLEMENTED`

### Compatibility rule

`compare_observed_vs_expected(...)` was specifically upgraded while retaining old-call compatibility.

Do not remove legacy-compatible behavior without evidence that all consumers have migrated.

---

# 15. SILENCE SCORE CONTRACT

## Backend functions

```text
compute_sector_silence_score(...)
build_silent_zone_assessment(...)
get_scenario_silence_windows(...)
```

### Status

`IMPLEMENTED`

### Semantic contract

The score is an indicator of suspicious information loss, not a direct ground-truth damage probability.

It should be interpreted together with:

- scenario state;
- expected signal;
- observed signal;
- infrastructure;
- nearby sectors;
- cause reasoning.

---

# 16. BLACKOUT / INFRASTRUCTURE CONTEXT CONTRACT

## Endpoint

```http
GET /blackout-intel/risk-assessment?scenario_id={scenario_id}
```

### Status

`IMPLEMENTED` according to supplied Codex history.

### Current response enhancement

The Codex implementation added optional:

```text
infrastructure_context
```

to `BlackoutRiskAssessment`.

### Reported infrastructure context

- mobile status;
- internet status;
- power/electricity status;
- road access;
- neighboring-sector contrast;
- isolation score;
- contextual rationale.

### Why optional

Legacy clients should continue to deserialize older response shapes where supported.

---

# 17. NEIGHBOR / LOCATION CONTEXT

## Backend functions

```text
distance_between_locations_km(...)
get_neighboring_locations(...)
```

### Responsibility

Provide spatial context for infrastructure and silence reasoning.

### API implication

The frontend should not independently redefine which sectors are “neighbors.”

If a UI needs neighbor data, it should consume backend-authoritative information.

---

# 18. FIVE-CAUSE SILENCE ANALYSIS CONTRACT

## Endpoint

```http
GET /hypotheses/scenario/{scenario_id}/sector/{sector_id}/causes
```

### Status

`IMPLEMENTED` according to supplied Codex history.

### Purpose

Return ranked explanations for why the selected sector is silent.

---

## 18.1 Five causes

The contract must represent:

```text
communication failure
infrastructure failure
population movement
sensor/data failure
severe local impact
```

### Status

`LOCKED PRODUCT SEMANTICS`

---

## 18.2 Scenario cause-analysis response

A dedicated response schema was added:

```text
SilentZoneCauseAnalysisResponse
```

### Status

`IMPLEMENTED`

### Codex-reported fields

The execution history reports outputs containing:

- probability;
- confidence;
- evidence-for;
- evidence-against;
- explanation;
- entropy;
- expected signal;
- observed signal;
- signal gap.

These fields should be confirmed against the current schema before frontend binding.

---

# 19. COUNTERFACTUAL CONTRACT

## Endpoint

```http
GET /hypotheses/scenario/{scenario_id}/counterfactuals/{sector_id}
```

### Status

`IMPLEMENTED`

### Backend function

```text
evaluate_silence_counterfactuals(...)
```

### Purpose

Evaluate what evidence would be expected if a specific silence explanation were true.

### Conceptual output

Each cause can expose:

```text
hypothesis
expected evidence
observed evidence
support/contradiction
```

Exact field names must come from the current response schema.

### Semantic requirement

Counterfactuals support or weaken explanations; they do not replace the main five-cause scoring model.

---

# 20. LOCATION STATUS CONTRACT

## Scenario-aware location status

The supplied Codex history added optional scenario intelligence to:

```text
/locations/status
/locations/{id}/status
/locations/verification-ranking
```

using:

```text
scenario_id
```

### Scenario-enriched status concepts

- active disaster state;
- silence score;
- top silence cause;
- infrastructure isolation;
- recommendation priority.

### Status

`IMPLEMENTED / FOCUSED VERIFIED`

### Compatibility

Without scenario context, existing location behavior should remain operational.

---

# 21. AGGREGATION / RANKING CONTRACT

The location aggregation layer intentionally distinguishes:

```text
display score
```

from:

```text
internal ranking signal
```

### Current Codex decision

Displayed score may be capped at `100`.

Internal ranking may use:

```text
uncapped urgency
+
scenario priority
```

### Contract reason

A high-population no-report sector could otherwise tie with a scenario-hit sector after score capping.

### Protected behavior

Do not make the presentation-capped value the sole ranking signal if the current implementation preserves the two-layer model.

---

# 22. VERIFICATION CONTRACT

## Endpoint

```http
GET /verification/next-best-observations
```

### Purpose

Return recommended observations/actions to reduce uncertainty around suspicious sectors.

### Planned scenario-aware behavior

Verification should consider:

- silence score;
- cause ranking;
- scenario state;
- infrastructure context;
- risk;
- operational constraints.

### Status

`PROPOSED / PLANNED`

---

# 23. DISPATCH CONTRACT

## Endpoint

```http
GET /dispatch/recommendations
```

### Purpose

Return scenario-aware operational recommendations.

### Planned inputs

- disaster type;
- sector;
- risk;
- silence cause;
- infrastructure context;
- access;
- exposed population;
- available resources.

### Required output semantics

A recommendation should be explainable:

```text
recommended action
+
why this action
+
causal context
```

### Status

`PROPOSED / PLANNED`

---

# 24. CAUSE → ACTION CONTRACT

The supplied planning material establishes the intended causal relationship:

```text
communication failure
    → connectivity/telecom-oriented response

infrastructure failure
    → restoration/engineering response

population movement
    → population/shelter verification

sensor/data failure
    → technical verification

severe local impact
    → recon / medical / SAR-oriented response
```

These are intended mappings, not exhaustive operational doctrine.

### Contract rule

Changing the top silence cause should be capable of changing downstream recommendation behavior.

That relationship requires tests.

---

# 25. SITREP CONTRACT

## Endpoint

```http
GET /sitrep/current
```

### Purpose

Return scenario-aware current situation reporting.

### Planned content

- disaster type;
- propagation summary;
- impacted sectors;
- high-risk silent zones;
- ranked silence causes;
- recommended actions;
- supervisor/local authority guidance where applicable.

### Status

`PROPOSED / PLANNED`

### Safety requirement

The report must not state that a sector is safe merely because direct reports are absent.

---

# 26. FRONTEND API CLIENT CONTRACT

## File

```text
frontend/src/lib/api.ts
```

### Responsibility

Single typed access layer for backend contracts used by the scenario UI.

### Required scenario types

```text
DisasterType
ScenarioResponse
SilentZoneAssessment
PropagationPoint
```

### Required client methods

```text
createScenario(...)
listScenarios(...)
getScenario(...)
startScenario(...)
advanceScenario(...)
resetScenario(...)
fetchScenarioPropagation(...)
```

### Status

`PROPOSED / PLANNED` according to the supplied frontend task board.

### Rule

Do not duplicate these contracts inside individual React pages.

---

# 27. FRONTEND CONTRACT CONSUMERS

## 27.1 `gis-map/page.tsx`

Primary consumer of:

- scenario lifecycle;
- propagation;
- GIS telemetry;
- silence;
- dispatch/recommendation data.

## 27.2 `InteractiveVectorMap.tsx`

Consumes map-ready propagation and context payloads.

## 27.3 `ActiveSectorDossier.tsx`

Consumes:

- sector impact;
- silence cause;
- evidence gap;
- recommendation.

## 27.4 `SectorDetailPanel.tsx`

Consumes:

- expected;
- observed;
- nearby context;
- infrastructure;
- cause explanation.

## 27.5 Supporting pages

```text
blackout-intel
hypotheses
dispatch
sitrep
```

consume their corresponding backend contracts.

---

# 28. ERROR CONTRACT PRINCIPLES

Exact repository error schemas are not established by the supplied documents.

Therefore:

### Current rule

Do not invent new error envelope formats without inspecting existing FastAPI behavior.

Before adding new endpoints:

```text
inspect existing router error handling
inspect existing HTTP status patterns
inspect existing Pydantic validation behavior
reuse established conventions
```

### Required scenarios to consider

- nonexistent scenario ID;
- invalid disaster type;
- invalid scenario transition;
- invalid sector ID;
- scenario not started;
- scenario already reset/completed;
- malformed request;
- unavailable data;
- internal simulation failure.

Exact HTTP status codes should follow existing project conventions unless explicitly specified by the repository/tests.

---

# 29. BACKWARD-COMPATIBILITY CONTRACT

The new API layer MUST preserve existing functionality unless a change is explicitly authorized.

Protected categories include:

```text
legacy simulation
legacy hypothesis behavior
legacy blackout clients
legacy location status
existing report/SITREP consumers
existing frontend API helpers
existing dataset-backed flows
```

When adding a field:

```text
prefer optional/additive
```

When adding a new semantic domain:

```text
consider a new scenario-specific endpoint
```

When changing a shared response:

```text
inspect all consumers first
```

---

# 30. CONTRACT TEST MATRIX

| Contract | Minimum verification |
|---|---|
| Scenario create | valid request + response schema |
| Scenario list | created scenario discoverable |
| Scenario detail | state matches authoritative storage |
| Scenario start | status transition |
| Scenario advance | time/state progression |
| Scenario reset | initial state restored |
| Legacy simulation | old endpoints still work |
| Propagation | map-ready payload valid |
| Silence overview | assessment collection valid |
| Silence sector | expected/observed/gap present |
| Blackout context | infrastructure fields serialize |
| Five-cause analysis | all five causes present |
| Counterfactual | support/weakening output present |
| Location status | scenario-aware optional fields |
| Verification | cause-aware next observations |
| Dispatch | recommendation + reason |
| SITREP | scenario + silence + actions |

---

# 31. CONTRACT-LEVEL SAFETY / ADVERSARIAL TESTS

These tests should fail the build if violated.

## A. Silent sector incorrectly marked safe

```text
Given:
observed signal = 0
expected signal = high

Then:
silent assessment exists
AND
system does not infer safety solely from silence
```

## B. Cause ranking ignores evidence

Change evidence from:

```text
neighbor towers active
```

to:

```text
neighbor towers also offline
```

and verify the diagnostic result can change appropriately.

## C. Disaster selector has no simulation effect

Selecting different disaster types must produce distinct propagation behavior.

## D. Recommendation ignores cause

Two different dominant causes should be capable of producing different response priorities.

## E. Legacy route regression

Scenario implementation must not make legacy simulation calls fail.

---

# 32. FRONTEND CONTRACT SAFETY

The frontend MUST:

- consume backend response types;
- handle loading;
- handle errors;
- handle empty data;
- reset scenario state when the backend resets;
- avoid stale scenario data after changing scenario;
- avoid polling loops;
- avoid assuming that missing data means “safe.”

### UI state rule

A missing intelligence payload should be rendered as:

```text
unknown / unavailable / requires verification
```

rather than:

```text
safe
```

unless the backend explicitly returns an evidence-backed safety state.

---

# 33. SCENARIO REQUEST EXAMPLE

Conceptual example from the supplied implementation blueprint:

```json
{
  "disaster_type": "flood",
  "origin_sector_id": "sindhupalchok",
  "start_time": "2026-08-31T10:00:00Z",
  "severity_level": "high",
  "propagation_profile": "river_downstream",
  "include_infrastructure_failures": true
}
```

### Important

This is a **reference shape from the supplied planning material**, not a claim that every current field is mandatory or that the exact example should be copied unchanged.

Before frontend implementation, Antigravity MUST inspect the actual Pydantic request model.

---

# 34. API IMPLEMENTATION ORDER

The safe contract rollout is:

```text
1. Scenario schemas
        ↓
2. Scenario persistence
        ↓
3. Scenario lifecycle APIs
        ↓
4. Propagation / scenario state outputs
        ↓
5. Silence assessment APIs
        ↓
6. Infrastructure context
        ↓
7. Five-cause / counterfactual APIs
        ↓
8. Aggregation/status APIs
        ↓
9. Verification/dispatch APIs
        ↓
10. GIS APIs
        ↓
11. SITREP
        ↓
12. Frontend typed client
        ↓
13. Unified GIS workflow
```

This sequence follows the dependency structure established by the supplied development plan.

---

# 35. API CHANGE RULES FOR ANTIGRAVITY

Before modifying any endpoint:

```text
[ ] Find current route implementation
[ ] Find current request schema
[ ] Find current response schema
[ ] Find backend callers
[ ] Find frontend callers
[ ] Find tests
[ ] Check whether scenario_id already exists
[ ] Check whether an equivalent endpoint already exists
[ ] Preserve legacy behavior
[ ] Add focused contract tests
[ ] Run affected regression
```

Never create a duplicate endpoint because the planned document says an endpoint “should exist.” First inspect the repository.

---

# 36. CURRENT CONTRACT STATUS SUMMARY

## Historical/implemented

```text
Scenario domain models                implemented earlier
Scenario lifecycle                    implemented earlier
Scenario simulation                   implemented earlier

GET /negative-evidence/scenario/...   implemented
GET /blackout-intel/...?scenario_id   implemented
GET /hypotheses/scenario/.../causes   implemented
GET /hypotheses/.../counterfactuals   implemented

Scenario-aware location status        implemented
Scenario-aware ranking                implemented
```

## Historically verified in supplied Codex runs

```text
M4 silence intelligence
    → 102 passed, 2 warnings

M6 five-cause reasoning
    → 105 passed, 2 warnings

M5 infrastructure context
    → 109 passed, 2 warnings
```

## Focused verified / full regression unconfirmed

```text
M7 location aggregation
    → focused tests passed
    → full backend run interrupted
```

## Still planned / not established as implemented in supplied history

```text
M8 evidence + verification + dispatch integration
M9 full GIS backend overlay contract
M10 scenario-aware SITREP
M11 frontend API client integration
M12 live GIS workflow
M13 supporting frontend pages
M14 final backend regression coverage
M15 frontend validation/hardening
```

---

# 37. CONTRACT COMPLETION CRITERIA

The API layer is contract-complete when:

- scenario lifecycle is callable and stable;
- propagation is available as structured map data;
- silence assessments expose expected-vs-observed reasoning;
- infrastructure context is available;
- all five causes can be retrieved;
- counterfactuals are exposed where required;
- location status is scenario-aware;
- verification and dispatch are cause-aware;
- SITREP is scenario-aware;
- frontend has one typed API client surface;
- legacy endpoints remain compatible;
- endpoint contract tests pass;
- invalid transitions/errors are handled according to repository conventions;
- frontend and backend agree on request/response shapes.

The final contract must support the end-to-end semantic chain:

```text
Scenario
  ↓
Simulation state
  ↓
Expected vs observed
  ↓
Silence assessment
  ↓
Infrastructure / neighbor context
  ↓
Five-cause ranking
  ↓
Verification / dispatch
  ↓
GIS / SITREP
```

The backend remains authoritative throughout.
