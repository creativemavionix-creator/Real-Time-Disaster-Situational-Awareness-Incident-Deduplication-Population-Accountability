# TEST_STRATEGY — Research/SDE-Grade Verification Strategy

> **Purpose:** Define the verification system for the disaster situational-awareness integration so every important behavior is testable, regressions are caught early, and completion claims are evidence-based.
>
> **Scope:** backend domain, simulation, APIs, intelligence pipelines, infrastructure context, five-cause reasoning, counterfactuals, aggregation, verification, dispatch, GIS contracts, SITREP, frontend contracts, live GIS workflow, adversarial cases, and final demo validation.
>
> **Companion files:** `MASTER_CONTEXT.md`, `ARCHITECTURE.md`, `DEVELOPMENT_PLAN.md`, `INTEGRATION_MAP.md`, `DECISIONS.md`, `MILESTONES.md`, `API_CONTRACTS.md`, `DATA_AND_SCHEMA.md`, `AGENT_INSTRUCTIONS.md`, `CURRENT_STATE.md`, `CHANGE_LOG.md`.
>
> **Core testing thesis:** The system must prove not only that expected signals can be generated and disasters can be simulated, but that **missing information is handled as uncertainty/investigation evidence rather than incorrectly converted into safety**.

---

# 0. VERIFICATION PHILOSOPHY

The project uses a layered verification model:

```text
Static Integrity
      ↓
Unit Behavior
      ↓
Domain / Integration Behavior
      ↓
API Contract
      ↓
Cross-Subsystem Regression
      ↓
End-to-End User Flow
      ↓
Adversarial / Invariant Testing
      ↓
Demo Hardening
```

No single test layer is sufficient.

A passing unit test does not prove API compatibility.

A passing API test does not prove frontend behavior.

A working demo does not prove regression safety.

---

# 1. TEST STATUS VOCABULARY

Use these terms precisely:

| Status | Meaning |
|---|---|
| `NOT RUN` | No verification executed |
| `PASS` | Required test target passed |
| `FAIL` | Test target failed |
| `PARTIAL` | Only part of the required verification passed |
| `BLOCKED` | Verification could not run for a concrete reason |
| `UNCONFIRMED` | Historical claim exists but current verification is missing |
| `REGRESSION` | Previously valid behavior failed after a change |

Never report `PASS` for a test that was interrupted before its result was produced.

---

# 2. VERIFICATION GATES

## Gate A — Static Integrity

Validate:

```text
syntax
imports
module loading
schema construction
type checking
application startup
```

Examples:

```text
Python import smoke tests
FastAPI startup
Pydantic model construction
TypeScript compilation
frontend lint
```

---

## Gate B — Focused Unit Verification

Run tests nearest to the changed subsystem.

Examples:

```text
negative evidence
blackout context
hypotheses/counterfactuals
aggregator
simulation
```

Purpose:

- rapid defect localization;
- protect local behavior;
- catch scoring/shape regressions early.

---

## Gate C — Integration Verification

Test boundaries between modules.

Examples:

```text
scenario → simulation
simulation → silence
silence → infrastructure
infrastructure → hypotheses
hypotheses → verification
hypotheses → dispatch
backend → GIS payload
backend → frontend client
```

---

## Gate D — Contract Verification

Verify request/response compatibility for:

- scenario lifecycle;
- silence assessment;
- hypothesis/counterfactual APIs;
- infrastructure context;
- location status;
- verification;
- dispatch;
- GIS;
- SITREP.

---

## Gate E — Regression

Run existing relevant backend/frontend suites after shared changes.

This is mandatory for high-fan-out modules such as:

```text
schemas.py
db.py
aggregator.py
locations.py
simulation/clock.py
hypothesis_engine.py
api.ts
central GIS page
```

---

## Gate F — End-to-End User Flow

The central demo must work as one coherent sequence:

```text
select disaster
→ create scenario
→ start
→ advance
→ observe map impact
→ detect silent zone
→ inspect sector
→ inspect expected vs observed
→ inspect cause
→ inspect recommendation
→ reset/replay
```

---

## Gate G — Adversarial / Invariant Testing

The system must resist dangerous or logically invalid interpretations such as:

```text
silence → safe
missing → zero
capped score → authoritative urgency ranking
stale response → current scenario
cause change → unchanged recommendation
```

---

# 3. TEST PYRAMID

The preferred balance is:

```text
             E2E / Demo
            /-----------\
        API / Contract
      /-------------------\
   Integration / Domain
 /---------------------------\
       Unit / Utility
/------------------------------\
```

Use unit tests for high-volume deterministic logic.

Use integration tests for data/logic boundaries.

Use API tests for external contracts.

Use E2E tests for the central user journey.

Do not attempt to test the entire product only through browser tests.

---

# 4. TEST DATA STRATEGY

Use three data classes:

## 4.1 Deterministic fixture data

Stable test sectors, scenario IDs, infrastructure states, and evidence.

Used for:

- unit tests;
- regression tests;
- API contracts.

## 4.2 Seeded scenario data

Controlled scenario generation for:

- earthquake;
- flood;
- cyclone;
- hurricane.

Used for:

- propagation tests;
- live demo;
- repeatability.

## 4.3 Adversarial synthetic data

Purposefully constructed edge cases:

```text
expected high + observed zero
expected low + observed zero
one dark sector + active neighbors
regional blackout
sensor failure without physical damage
population movement
severe local impact
stale evidence
conflicting evidence
missing infrastructure data
```

---

# 5. TEST DATA INVARIANTS

Test fixtures should make these distinctions explicit:

```text
missing ≠ zero
zero observed ≠ zero impact
historical ≠ scenario expectation
expected ≠ observed
derived ≠ authoritative
```

Never make a fixture ambiguous about what `None`, zero, or absent evidence means.

---

# 6. SCENARIO DOMAIN TESTS

## Target

```text
backend/app/models/schemas.py
backend/app/models/db.py
```

## Verify

- valid disaster types;
- valid scenario payloads;
- status transitions;
- serialization/deserialization;
- DB model creation;
- required relationships;
- invalid input handling.

## Core cases

```text
valid flood
valid earthquake
valid cyclone
valid hurricane
invalid disaster type
missing required scenario field
invalid severity
invalid sector
```

---

# 7. SCENARIO LIFECYCLE TESTS

## Target

```text
backend/tests/test_scenarios.py
```

## Required cases

### Create

```text
POST /simulation/scenarios
```

Verify:

- valid scenario accepted;
- scenario persisted;
- returned ID can be used later.

### List

```text
GET /simulation/scenarios
```

Verify created scenario is discoverable.

### Detail

```text
GET /simulation/scenarios/{scenario_id}
```

Verify state matches authoritative stored state.

### Start

```text
POST /simulation/scenarios/{scenario_id}/start
```

Verify correct status transition.

### Advance

```text
POST /simulation/scenarios/{scenario_id}/advance
```

Verify:

- time changes;
- sector state can change;
- scenario state remains coherent.

### Reset

```text
POST /simulation/scenarios/{scenario_id}/reset
```

Verify:

- transient progression is restored;
- stale UI/API data does not survive;
- scenario can be started/advanced again according to repository semantics.

---

# 8. LEGACY SIMULATION REGRESSION

Protected endpoints:

```text
/simulation/state
/simulation/reset
/simulation/advance
```

## Test principle

Scenario functionality must not break legacy simulation behavior.

Run legacy tests:

```text
before scenario changes
after scenario changes
```

where baseline comparison is available.

---

# 9. MULTI-DISASTER SIMULATION TESTS

## Target

```text
backend/app/simulation/generator.py
backend/app/simulation/clock.py
backend/tests/test_disaster_simulation.py
```

## Required disaster tests

### Earthquake

Verify:

- impact is centered around origin/epicenter;
- severity attenuates outward;
- progression changes with simulation time.

### Flood

Verify:

- impact has directional/flow/downstream character;
- lowland/flow-path behavior is distinct from earthquake radial behavior.

### Cyclone

Verify:

- directional track/corridor behavior.

### Hurricane

Verify:

- directional track/corridor behavior.

## Cross-disaster discrimination test

Given identical broad scenario inputs:

```text
earthquake
vs
flood
vs
cyclone
vs
hurricane
```

assert that their spatial impact patterns are not all equivalent.

---

# 10. SIMULATION DETERMINISM TESTS

Where seeded behavior is intended:

```text
same seed
+
same scenario config
+
same initial state
```

should produce reproducible output.

Test:

```text
run A
compare
run B
```

Any intended stochastic component must document its tolerance/seed semantics.

---

# 11. EXPECTED SIGNAL TESTS

## Target

```text
backend/app/pipeline/expected_reality.py
```

## Function

```text
compute_expected_signal_for_scenario(...)
```

## Cases

```text
high-impact scenario
low-impact scenario
different disaster types
different scenario times
different sectors
expected override where supported
```

## Invariant

Expected signal must not simply equal observed signal.

It is a model of what should be occurring.

---

# 12. EXPECTED VS OBSERVED TEST MATRIX

Required cases from the supplied project plan:

| Expected | Observed | Expected interpretation |
|---:|---:|---|
| High | Zero | Strong suspicious silence |
| Low | Zero | Different / weaker silence context |
| High | Near expected | Low suspicious gap |
| High | Reduced | Intermediate silence |
| Active neighbors | Local zero | Localized anomaly candidate |
| Inactive neighbors | Local zero | Regional outage candidate |

The exact numerical score is implementation-specific, but the **directional behavior** must remain correct.

---

# 13. NEGATIVE-EVIDENCE TESTS

## Target

```text
backend/app/pipeline/negative_evidence.py
backend/tests/test_negative_evidence.py
```

## Required functions

```text
compute_sector_silence_score(...)
build_silent_zone_assessment(...)
get_scenario_silence_windows(...)
```

## Assertions

- significant gap can create an assessment;
- zero direct human reports can still produce an assessment;
- explanations are present;
- scenario context propagates;
- silence never directly produces “safe.”

---

# 14. SILENCE / SAFETY INVARIANT TEST

This is a mandatory adversarial regression test.

```text
Given:
expected signal = high
observed signal = zero

Then:
silent-zone assessment exists
AND
zone is not automatically classified safe
```

Also test:

```text
No direct reports
+
high expected activity
```

must not produce:

```text
safe = true
```

without explicit independent evidence.

---

# 15. INFRASTRUCTURE CONTEXT TESTS

## Target

```text
backend/app/pipeline/blackout_risk.py
backend/app/pipeline/gazetteer.py
backend/tests/test_blackout_context.py
```

## Required dimensions

```text
mobile
internet
power
road
neighbor connectivity
```

## Cases

### Localized outage

One sector loses connectivity while neighbors remain active.

Expected:

```text
high local isolation contrast
```

### Regional outage

Many neighboring sectors are simultaneously offline.

Expected:

```text
different interpretation from isolated local outage
```

### Road cutoff + active telecom

Expected:

```text
road/infrastructure explanation strengthened
```

### Telecom failure + no physical damage

Expected:

```text
communication failure can dominate
```

The exact score is implementation-specific; directional ranking behavior matters.

---

# 16. NEIGHBORHOOD / SPATIAL TESTS

## Target

```text
distance_between_locations_km(...)
get_neighboring_locations(...)
```

Verify:

- valid sectors return sensible neighbors;
- distance relationships are consistent;
- unrelated distant sectors are not accidentally treated as local neighbors;
- the same sector does not become its own neighbor unless explicitly allowed.

Use project geography rather than arbitrary UI-defined proximity.

---

# 17. FIVE-CAUSE HYPOTHESIS TESTS

## Target

```text
backend/app/pipeline/hypothesis_engine.py
backend/tests/test_hypotheses_and_counterfactual.py
```

Required cause-specific tests:

```text
communication failure
infrastructure failure
population movement
sensor/data failure
severe local impact
```

For each cause, construct a scenario where its evidence profile should dominate.

Verify:

- cause exists in output;
- score/probability is valid;
- confidence is valid;
- evidence-for is populated;
- evidence-against is available where supported;
- explanation is understandable;
- top-ranked cause can change as evidence changes.

---

# 18. MIXED-EVIDENCE HYPOTHESIS TESTS

Construct at least one case where:

```text
cause A
vs
cause B
```

compete.

Verify that:

- ranking is deterministic or appropriately tolerance-bounded;
- changing relevant evidence changes ranking;
- unrelated evidence does not arbitrarily dominate.

---

# 19. HYPOTHESIS NORMALIZATION TESTS

Where the implementation represents normalized scores/probabilities:

Verify:

```text
all values finite
all values within documented bounds
normalization is consistent
no NaN
no negative probability
```

If the implementation deliberately uses another scoring interpretation, tests must follow the actual contract rather than forcing probability semantics.

---

# 20. COUNTERFACTUAL TESTS

## Target

```text
backend/app/pipeline/counterfactual.py
```

## Required behavior

For a given cause:

```text
"If this cause were true,
what should we observe?"
```

Test:

- supporting evidence increases support;
- contradictory evidence weakens support;
- counterfactual output remains tied to the selected scenario/sector;
- counterfactuals do not silently overwrite the primary cause ranking.

---

# 21. LEGACY HYPOTHESIS REGRESSION

Before/after scenario reasoning changes:

Verify legacy H1-H5 behavior where covered by existing tests/pages.

The new five-cause model must not accidentally convert:

```text
legacy H1 semantics
```

into:

```text
scenario communication/infrastructure/etc.
```

---

# 22. AGGREGATION TESTS

## Target

```text
backend/app/pipeline/aggregator.py
backend/tests/test_aggregator.py
backend/tests/test_scenario_aggregation_api.py
```

Verify scenario-aware status includes:

```text
active disaster state
silence score
top cause
infrastructure isolation
recommendation priority
```

Also verify legacy non-scenario aggregation.

---

# 23. RANKING TIE-BREAK TEST

This test documents the M7 bug discovered during Codex execution.

Construct:

```text
high-population no-report sector
+
scenario-hit sector
```

where both display at the score cap.

Verify:

```text
display score may tie
BUT
internal ranking favors the more urgent scenario-priority sector
```

This protects the distinction between:

```text
presentation score
```

and:

```text
ranking signal
```

---

# 24. EVIDENCE INGESTION TESTS

## Target

```text
backend/app/pipeline/evidence_model.py
```

Planned functions:

```text
ingest_infrastructure_evidence(...)
ingest_network_signal_evidence(...)
ingest_sensor_health_evidence(...)
```

Verify:

- valid evidence normalizes correctly;
- missing fields behave according to the schema;
- stale evidence does not become falsely current;
- evidence type is preserved;
- downstream consumers can distinguish evidence categories.

---

# 25. VERIFICATION ENGINE TESTS

## Target

```text
backend/app/pipeline/active_verification.py
```

Planned functions:

```text
evaluate_sector_verification_actions(...)
get_ranked_next_best_observations(...)
```

## Required behavior

Test that suspicious silent sectors can rise in verification priority.

Verify recommendations are influenced by:

```text
risk
silence
cause
infrastructure
scenario
operational context
```

Do not require one exact action for every case unless the product contract says so; test causal consistency.

---

# 26. DISPATCH TESTS

## Target

```text
backend/app/pipeline/dispatch_engine.py
```

Planned functions:

```text
map_silence_cause_to_response_type(...)
calculate_dispatch_recommendations(...)
assign_dispatch_mission(...)
```

## Required test principle

Different dominant causes should be capable of producing different response recommendations.

Example:

```text
communication failure
→ communication restoration / connectivity-oriented response

severe local impact
→ reconnaissance / medical / SAR-oriented response
```

Test the causal relationship rather than only exact text.

---

# 27. API CONTRACT TESTS

Test each scenario endpoint:

```text
POST /simulation/scenarios
GET /simulation/scenarios
GET /simulation/scenarios/{scenario_id}
POST /simulation/scenarios/{scenario_id}/start
POST /simulation/scenarios/{scenario_id}/advance
POST /simulation/scenarios/{scenario_id}/reset
```

And each scenario-intelligence endpoint:

```text
GET /negative-evidence/scenario/{scenario_id}/assessments
GET /negative-evidence/scenario/{scenario_id}/sector/{sector_id}

GET /hypotheses/scenario/{scenario_id}/sector/{sector_id}/causes
GET /hypotheses/scenario/{scenario_id}/counterfactuals/{sector_id}

GET /blackout-intel/risk-assessment?scenario_id=...

GET /locations/status?scenario_id=...
GET /locations/{id}/status?scenario_id=...
GET /locations/verification-ranking?scenario_id=...
```

For planned endpoints such as GIS/verification/dispatch/SITREP, add tests when implementation begins.

---

# 28. API NEGATIVE TESTS

Every new endpoint should have invalid-input coverage where applicable:

```text
unknown scenario ID
unknown sector ID
invalid disaster type
invalid transition
malformed request
missing required field
scenario not started
scenario reset/completed where operation is invalid
```

Follow existing repository HTTP status/error conventions.

Do not invent a new global error envelope solely for these tests.

---

# 29. API BACKWARD-COMPATIBILITY TESTS

For any endpoint that existed before scenario mode:

```text
request without scenario_id
```

should continue to follow legacy semantics unless explicitly documented otherwise.

Test:

```text
legacy response
scenario-aware response
```

for compatible behavior.

---

# 30. DATABASE PERSISTENCE TESTS

Verify:

```text
scenario created
→ record persists

sector state generated
→ record persists

assessment generated
→ record persists

scenario retrieved later
→ state remains coherent
```

Do not rely only on in-memory objects.

---

# 31. RESET / STALE-DATA TESTS

Critical scenario lifecycle test:

```text
create
→ start
→ advance
→ generate intelligence
→ reset
```

Verify stale:

```text
impact
silence
cause
recommendation
```

does not remain associated with the reset scenario state in a way that can mislead the client.

---

# 32. CROSS-SCENARIO ISOLATION TEST

Run:

```text
Scenario A
+
Scenario B
```

and ensure:

- A's sector state does not leak into B;
- A's assessments do not appear in B;
- A's cause analysis does not appear in B;
- resetting A does not reset B.

This is a high-value state-management test even if the UI initially supports only one active scenario.

---

# 33. TEMPORAL CONSISTENCY TESTS

Verify scenario-derived outputs correspond to the correct simulation point.

Example:

```text
t0
→ state0

advance
→ t1
→ state1

advance
→ t2
→ state2
```

Assert:

```text
t0 output ≠ accidentally labeled t2
```

where the data should differ.

---

# 34. STALE RESPONSE / ASYNC TESTS

Frontend scenario lifecycle must handle:

```text
request A starts
scenario changes
request A returns late
```

The late result must not overwrite the newer scenario state.

Also test:

```text
component unmount
polling continues?
```

Expected:

```text
polling/request cleanup
```

according to the frontend implementation.

---

# 35. GIS CONTRACT TESTS

## Target

```text
backend/app/routers/gis.py
```

Verify map-ready payloads contain sufficient data for:

```text
propagation
silent zones
sector risk
infrastructure context
```

Do not test only that JSON exists.

Test that required fields are coherent and correctly associated with scenario/sector IDs.

---

# 36. FRONTEND API TYPE TESTS

## Target

```text
frontend/src/lib/api.ts
```

Verify:

- interfaces match backend response structures;
- helper methods use correct endpoints;
- existing helper methods still compile;
- no duplicate scenario contract types are created in pages/components.

Minimum:

```text
npm run build
npm run lint
```

plus available frontend tests.

---

# 37. FRONTEND COMPONENT TESTS

Where a component test framework exists, cover:

## `SimulationControls.tsx`

- disaster selection;
- start;
- advance;
- reset;
- loading/error states.

## `InteractiveVectorMap.tsx`

- propagation rendering;
- silent-zone rendering;
- selected sector;
- missing/empty overlay handling.

## `ActiveSectorDossier.tsx`

- cause display;
- evidence gap;
- recommendation.

## `SectorDetailPanel.tsx`

- expected vs observed;
- neighbor context;
- infrastructure explanation.

---

# 38. CENTRAL GIS E2E TEST

The most important frontend integration test should simulate:

```text
1. Open GIS page
2. Select disaster
3. Start scenario
4. Advance
5. Verify map updates
6. Identify/select silent sector
7. Verify expected vs observed
8. Verify top cause
9. Verify recommendation
10. Reset
11. Verify stale state disappears
```

This is the primary demo-path acceptance test.

---

# 39. SUPPORTING PAGE VALIDATION

Validate:

```text
home
blackout-intel
hypotheses
dispatch
sitrep
```

for:

- correct scenario context;
- coherent terminology;
- no stale data;
- no broken navigation;
- no contradictory safety language.

---

# 40. ADVERSARIAL TEST SUITE

Create a dedicated adversarial suite covering:

### A1 — Silence ≠ safety

```text
expected high
observed zero
```

### A2 — Missing ≠ zero

```text
missing telemetry
```

must not automatically become numeric zero.

### A3 — Sensor failure

Silent sector has sensor failure but no corresponding physical damage.

### A4 — Population movement

Sector loses population while activity changes in adjacent shelter/areas.

### A5 — Severe local impact

Sector goes silent with strong local damage evidence.

### A6 — Communication failure

Neighboring sectors active while target connectivity is down.

### A7 — Regional outage

Many neighbors are simultaneously offline.

### A8 — Stale evidence

Old evidence must not automatically outrank fresher contradictory evidence.

### A9 — Cross-scenario leakage

Scenario A data must not appear in B.

### A10 — Reset leakage

Post-reset UI/API must not show pre-reset scenario intelligence.

---

# 41. PROPERTY / INVARIANT TESTS

Where practical, use property-based or invariant-style tests for:

```text
probabilities are finite and bounded
scores remain within documented ranges
scenario IDs remain consistent across derived outputs
sector IDs remain consistent
reset returns valid initial state
same deterministic seed yields same deterministic output
```

For probabilistic/scoring functions, test invariants rather than brittle exact values when formulas are intentionally adjustable.

---

# 42. PERFORMANCE TEST TARGETS

The supplied project material does not define hard production SLAs.

Therefore do not invent numeric SLAs without user/project requirements.

Still measure:

```text
scenario creation latency
scenario advance latency
silence-assessment latency
cause-analysis latency
GIS payload generation latency
frontend map update responsiveness
```

Track regressions between milestones.

For demo purposes, prioritize responsiveness and predictable behavior.

---

# 43. SECURITY / ROBUSTNESS TESTS

At minimum test:

```text
invalid scenario ID
invalid sector ID
malformed scenario request
invalid lifecycle transition
cross-scenario access
unexpected empty data
unexpected stale data
```

Also preserve the existing project security/adversarial test suite.

The test objective is logical integrity as well as conventional input validation.

---

# 44. REGRESSION MATRIX BY CHANGE TYPE

| Change type | Minimum verification |
|---|---|
| Local helper | focused unit |
| Pipeline function | unit + affected integration |
| Shared schema | schema + API + broader regression |
| DB model | persistence + startup + affected regression |
| Simulation generator | disaster tests + scenario tests + regression |
| Scenario router | API contract + lifecycle + regression |
| Hypothesis engine | cause + counterfactual + legacy regression |
| Aggregator | aggregation + API + full backend regression |
| `api.ts` | build + lint + client tests |
| GIS page | component/E2E + build |
| Shared frontend component | component + build + relevant flow |
| Final demo changes | E2E + manual walkthrough |

---

# 45. MILESTONE-SPECIFIC TEST GATES

## M1

Schema/model startup and validation.

## M2

Create/start/advance/reset + legacy simulation.

## M3

Four disaster propagation profiles.

## M4

Expected vs observed + silence behavior.

## M5

Infrastructure/neighbor contextual diagnosis.

## M6

Five causes + counterfactuals + legacy hypothesis regression.

## M7

Scenario-aware aggregation + ranking tie-break + full backend regression.

## M8

Evidence → cause → verification/dispatch causal integration.

## M9

Map-ready backend payloads.

## M10

SITREP semantic correctness.

## M11

Frontend API contract/build.

## M12

Central GIS end-to-end workflow.

## M13

Supporting-page consistency.

## M14

Full backend regression lock.

## M15

Frontend build/lint/responsive/demo hardening.

---

# 46. M7 SPECIAL VERIFICATION REQUIREMENT

M7 is the current unfinished verification boundary.

Required command from the supplied execution history:

```text
backend/venv/bin/python -m pytest -q backend/tests
```

The historical M7 run was interrupted before completion.

Therefore:

```text
M7
focused tests = PASS
full regression = UNCONFIRMED
```

Do not update this to fully verified until the current repository produces a complete passing result.

---

# 47. HISTORICAL TEST RESULTS

The supplied Codex execution history reports:

```text
M4
102 passed, 2 warnings

M6
105 passed, 2 warnings

M5
109 passed, 2 warnings
```

These totals reflect different points in the evolving suite and must not be interpreted as directly comparable benchmark metrics.

M7 focused tests passed after a ranking tie-break fix.

M7 full regression was interrupted.

---

# 48. TEST NAMING / ORGANIZATION

Prefer names that describe behavior:

```text
test_create_scenario
test_start_and_advance_scenario
test_earthquake_propagation_profile
test_flood_propagation_profile
test_cyclone_hurricane_directional_impact
test_scenario_aware_silence_inference
test_each_silence_cause
test_localized_vs_regional_outage
test_silence_never_implies_safety
test_cause_to_dispatch_mapping
```

Avoid test names that describe implementation details only.

---

# 49. TEST FIXTURE OWNERSHIP

Keep reusable fixtures centralized according to the existing test architecture.

Useful fixture concepts:

```text
valid scenario
running scenario
reset scenario
sample sector
neighbor sectors
high expected signal
zero observed signal
infrastructure outage
sensor failure
population movement
severe impact
legacy baseline
```

Do not mutate global fixtures in ways that cause order-dependent tests.

---

# 50. TEST ISOLATION

Each test should control or reset:

```text
database state
scenario state
clock state
in-memory caches
network mocks
frontend state
```

Avoid test-order dependence.

A test that passes only after another test ran is not reliable.

---

# 51. MOCKING / STUBBING RULES

Mock external dependencies when necessary for deterministic unit tests.

Do not mock the subsystem under test so extensively that the test proves only that mocks return expected values.

Use:

```text
unit tests
→ mocks/stubs where appropriate

integration tests
→ real internal module boundaries

E2E
→ real application contracts
```

---

# 52. EXACT-VALUE VS BEHAVIORAL ASSERTIONS

Prefer exact assertions when the contract is fixed:

```text
enum values
endpoint paths
required response fields
state transitions
```

Prefer behavioral/range assertions when formulas are intentionally tunable:

```text
silence score increases as gap increases
cause ranking changes when evidence changes
isolation rises when active neighbors contrast with a dark sector
```

This avoids brittle tests that prevent legitimate model refinement.

---

# 53. TESTING CAUSALITY, NOT JUST OUTPUT

The intelligence layer is explainable.

Tests should therefore ask:

```text
Did the output change for the right reason?
```

Example:

```text
Scenario A:
neighbor connectivity active
target sector dark

Scenario B:
neighbor connectivity also dark
```

The interpretation should change.

Likewise:

```text
sensor failure evidence
```

vs.

```text
severe local damage evidence
```

should influence the cause ranking differently.

---

# 54. OBSERVABILITY DURING TESTS

Where practical, preserve enough diagnostics to identify:

```text
scenario_id
sector_id
simulation time
expected signal
observed signal
silence score
top cause
infrastructure state
recommendation
```

When a test fails, the output should help answer:

> Which scenario state produced the wrong result?

Avoid opaque assertions when structured diagnostic output can be added safely.

---

# 55. TEST FAILURE TRIAGE

When a test fails:

```text
1. Reproduce the failure.
2. Read the exact assertion/stack trace.
3. Identify the contract.
4. Determine whether the failure is:
   - implementation bug
   - regression
   - stale test
   - stale documentation
   - environment issue
5. Fix root cause.
6. Re-run focused test.
7. Re-run affected integration tests.
8. Re-run broader regression.
```

Do not weaken tests just to make the suite green.

---

# 56. FULL-SUITE INTERPRETATION

A full suite passing means:

```text
all tests that were actually discovered and executed passed
```

It does not mean:

```text
all possible behaviors are correct
```

For demo readiness, combine:

```text
test suite
+
manual scenario walkthrough
+
adversarial tests
```

---

# 57. DEMO VALIDATION CHECKLIST

Before calling the project demo-ready:

```text
[ ] clean application startup
[ ] scenario selector visible
[ ] all four disaster types selectable
[ ] scenario starts
[ ] scenario advances
[ ] map visibly changes
[ ] silent zone appears under designed conditions
[ ] clicking sector reveals expected vs observed
[ ] five-cause explanation renders
[ ] recommendation renders
[ ] reset works
[ ] no stale scenario data remains
[ ] no console/runtime errors
[ ] no broken polling loops
[ ] supporting pages remain navigable
[ ] SITREP reflects the active scenario
```

---

# 58. MANUAL DEMO SCENARIOS

At least these should be rehearsed:

## Scenario A — Earthquake

```text
epicenter
→ nearby damage
→ infrastructure disruption
→ silent sector
→ cause reasoning
→ response
```

## Scenario B — Flood

```text
flow/downstream impact
→ connectivity/infrastructure degradation
→ silent zone
→ explanation
→ response
```

## Scenario C — Cyclone/Hurricane

```text
directional track
→ multiple sectors affected
→ selective communication loss
→ cause ranking
→ response
```

## Scenario D — False silence

```text
sensor/communication failure
without equivalent physical damage
```

The system should not overstate severe local impact solely because data disappeared.

---

# 59. DEMO FAILURE CONDITIONS

Do not call the demo ready if any of these occur:

```text
map does not change after advance
silent zone is treated as safe without evidence
cause panel shows empty/contradictory ranking
recommendation does not match causal context
reset leaves stale data
scenario A leaks into scenario B
legacy pages break
frontend polls indefinitely after unmount/reset
backend returns malformed map payload
SITREP contradicts current scenario state
```

---

# 60. EXIT CRITERIA FOR THE WHOLE PROJECT

The project can move to final completion only when:

```text
scenario lifecycle passes
+
four disaster propagation tests pass
+
silence intelligence passes
+
infrastructure context passes
+
five-cause reasoning passes
+
aggregation passes
+
evidence/verification/dispatch passes
+
GIS contracts pass
+
SITREP passes
+
frontend build/lint passes
+
central GIS E2E/manual demo passes
+
backend regression passes
+
adversarial safety invariants pass
```

And the primary semantic invariant remains true:

```text
silence ≠ safety
```

---

# 61. VERIFICATION REPORT FORMAT

For each milestone, record:

```text
Milestone:
Date:
Commit/working state:

Focused tests:
Command:
Result:

Integration tests:
Command:
Result:

Full regression:
Command:
Result:

Manual validation:
Result:

Known failures:
...

Status:
NOT RUN / PASS / PARTIAL / BLOCKED
```

---

# 62. CURRENT TESTING STATE

Based on the supplied Codex history:

```text
M4
    implementation ✅
    full backend verification ✅
    102 passed, 2 warnings

M5
    implementation ✅
    full backend verification ✅
    109 passed, 2 warnings

M6
    implementation ✅
    full backend verification ✅
    105 passed, 2 warnings

M7
    implementation ✅
    focused verification ✅
    full backend verification ⚠ unconfirmed
```

The M7 full-suite command must be rerun against the current repository.

---

# 63. FUTURE TEST EXPANSION

The supplied task board identifies additional files/tests as implementation progresses:

```text
backend/tests/test_scenarios.py
backend/tests/test_disaster_simulation.py
backend/tests/test_negative_evidence.py
backend/tests/test_hypotheses_and_counterfactual.py
backend/tests/test_capabilities.py
backend/tests/test_api.py
backend/tests/test_active_verification.py
backend/tests/test_resq_sight.py
backend/tests/test_adversarial_and_security.py

backend/tests/test_blackout_context.py
backend/tests/test_dispatch_scenario_mapping.py
backend/tests/test_gis_scenario_overlays.py
backend/tests/test_sitrep_scenarios.py
```

These should be created/extended only when the corresponding functionality actually exists.

---

# 64. FINAL TESTING RULES FOR ANTIGRAVITY

```text
1. Test the behavior you changed.
2. Test the contracts you touched.
3. Test legacy consumers when shared surfaces changed.
4. Test adversarial interpretations of missing information.
5. Test scenario reset and isolation.
6. Test causality, not just output shape.
7. Prefer deterministic fixtures.
8. Do not weaken assertions to hide defects.
9. Do not call interrupted verification successful.
10. Record exact commands and results.
```

The objective is not maximum test count.

The objective is **credible evidence that the integrated system behaves correctly, remains compatible, and preserves the project's central semantic guarantee**.
