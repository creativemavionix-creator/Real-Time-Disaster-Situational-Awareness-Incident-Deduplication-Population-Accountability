# AGENT_INSTRUCTIONS — Antigravity Operating Constitution

> **Purpose:** Define the mandatory operating behavior for any coding agent continuing this project, with particular emphasis on Antigravity. This file is the project's agent-level execution constitution.
>
> **Primary problem being solved:** Preserve the accumulated engineering context from prior Codex work so that a new agent can continue the repository safely without reconstructing the project from transient chat memory.
>
> **Companion source-of-truth files:**  
> `MASTER_CONTEXT.md`  
> `ARCHITECTURE.md`  
> `DEVELOPMENT_PLAN.md`  
> `INTEGRATION_MAP.md`  
> `DECISIONS.md`  
> `MILESTONES.md`  
> `TEST_STRATEGY.md`  
> `API_CONTRACTS.md`  
> `DATA_AND_SCHEMA.md`  
> `CURRENT_STATE.md`  
> `CHANGE_LOG.md`
>
> **Core principle:** The agent must treat the repository and persistent project-memory files as the durable context. Chat history is supplemental, not the primary state store.

---

# 0. AGENT MISSION

You are continuing an existing disaster situational-awareness platform.

The project is **not greenfield**.

The original platform was built before this integration effort, and the current objective is to add/configure:

- multi-disaster scenarios;
- disaster propagation simulation;
- expected-vs-observed silence intelligence;
- infrastructure and neighbor context;
- five-cause silence reasoning;
- counterfactual reasoning;
- evidence-aware verification;
- cause-aware dispatch;
- GIS visualization;
- scenario-aware SITREP/reporting;
- a coherent live demonstration flow.

Your job is to **extend the existing system safely**.

Your job is NOT to:

- rewrite the project because another architecture appears cleaner;
- replace working subsystems without evidence;
- infer missing requirements casually;
- treat historical planning text as current repository truth;
- mark work complete without verification.

---

# 1. MANDATORY CONTEXT LOADING

Before making any substantive change, read:

```text
1. MASTER_CONTEXT.md
2. ARCHITECTURE.md
3. DEVELOPMENT_PLAN.md
4. INTEGRATION_MAP.md
5. DECISIONS.md
6. MILESTONES.md
7. TEST_STRATEGY.md
8. API_CONTRACTS.md
9. DATA_AND_SCHEMA.md
10. CURRENT_STATE.md    (when present)
11. CHANGE_LOG.md       (when present)
```

Then inspect the relevant repository files directly.

## Context precedence

When documents differ:

```text
CURRENT REPOSITORY CODE
        ↓
CURRENT TEST RESULTS
        ↓
CURRENT_STATE.md
        ↓
CHANGE_LOG.md
        ↓
DECISIONS.md
        ↓
ARCHITECTURE.md
        ↓
DEVELOPMENT_PLAN.md
        ↓
INTEGRATION_MAP.md
        ↓
older planning/specification material
```

This does NOT mean ignoring the documented architecture. It means that historical documentation must be reconciled against current repository reality before a change is made.

---

# 2. NEVER START FROM CHAT MEMORY ALONE

Do not assume:

> “I remember what the previous agent did.”

Instead:

```text
Read persistent context
        ↓
Inspect code
        ↓
Inspect tests
        ↓
Determine current state
```

Chat messages may contain useful intent, but they are not sufficient to establish implementation state.

---

# 3. DISTINGUISH FACT FROM PLAN

Every important statement should implicitly belong to one of these categories:

```text
FACT
    Current repository/test confirms it.

IMPLEMENTED
    Prior agent says it was implemented.

VERIFIED
    A recorded test/result confirms it.

PROPOSED
    The plan says it should exist.

OPEN
    Current repository inspection is still required.

UNKNOWN
    Evidence is insufficient.
```

Never convert:

```text
PROPOSED
```

into:

```text
IMPLEMENTED
```

without inspecting the repository.

Never convert:

```text
IMPLEMENTED
```

into:

```text
VERIFIED
```

without appropriate tests.

---

# 4. PROJECT SAFETY INVARIANT

The strongest product/engineering invariant is:

> **Silence is not safety.**

Therefore:

```text
no reports
        ≠
safe

zero observed signal
        ≠
zero impact

missing telemetry
        ≠
no disaster
```

A silent zone may represent:

- communication failure;
- infrastructure failure;
- population movement;
- sensor/data failure;
- severe local impact.

This semantic distinction must survive every layer:

```text
database
→ backend
→ API
→ frontend
→ SITREP
→ dispatch
```

Do not introduce logic that silently turns absence of information into a confirmed safe state.

---

# 5. EXISTING SYSTEM PRESERVATION RULE

The existing project is the host system.

Unless explicitly authorized:

```text
DO:
- extend
- integrate
- add scenario-aware behavior
- add optional fields
- add scenario-specific paths
- preserve current consumers

DO NOT:
- rewrite the system
- replace legacy semantics casually
- remove old APIs
- rename shared contracts without migration
- refactor unrelated modules
- replace working logic solely for stylistic reasons
```

The preferred pattern is:

```text
existing behavior
      +
scenario-aware extension
```

not:

```text
existing behavior
      ↓
destructive replacement
```

---

# 6. LEGACY SYSTEM PROTECTION

Treat these as protected surfaces unless explicit authorization says otherwise.

## Legacy simulation

```text
/simulation/state
/simulation/reset
/simulation/advance
```

## Legacy hypothesis semantics

The supplied Codex execution explicitly preserved the legacy H1-H5 hypothesis behavior because H1 currently means “area safe” in the existing system.

Do not redefine legacy hypothesis meanings merely to reuse them for the five scenario silence causes.

## Legacy location aggregation

Existing non-scenario location/status behavior must continue to operate.

## Existing seeded simulation

Preserve the original seeded/demo-compatible path where practical.

## Existing evidence/reporting/deduplication/population flows

Do not break unrelated existing functionality while implementing scenario intelligence.

---

# 7. MINIMUM-CHANGE PRINCIPLE

For every implementation task, prefer:

```text
smallest safe change
```

that satisfies:

1. current requirement;
2. existing architecture;
3. backward compatibility;
4. testability;
5. explainability.

Do not introduce a larger refactor merely because it is aesthetically attractive.

If a refactor is genuinely required, state:

```text
why current design blocks the required capability
what alternatives were considered
why this change is the minimum safe architectural intervention
```

---

# 8. REPOSITORY-FIRST WORKFLOW

Before editing:

```text
A. Locate target file
B. Locate target function/class
C. Read surrounding implementation
D. Find callers
E. Find downstream consumers
F. Find tests
G. Check whether equivalent work already exists
H. Compare actual code with project-memory documents
I. Identify compatibility constraints
J. Only then plan the change
```

Never create a function merely because a task document names it if the repository already has an equivalent function under another name.

---

# 9. TASK EXECUTION PROTOCOL

For every non-trivial task:

## Step 1 — State the current repository reality

Identify:

```text
What already exists?
What is missing?
What is partially implemented?
What is unverified?
```

## Step 2 — Define scope

State:

```text
Files to change
Functions/classes to change
Files explicitly not changing
Tests required
```

## Step 3 — Implement

Work only within the agreed scope unless a blocking dependency is discovered.

## Step 4 — Verify

Run:

```text
static/import checks
focused tests
contract tests
broader regression where necessary
```

## Step 5 — Record state

Update persistent project memory when appropriate.

---

# 10. BEFORE MODIFYING SHARED MODULES

Shared modules include, but are not limited to:

```text
backend/app/models/schemas.py
backend/app/models/db.py
backend/app/simulation/clock.py
backend/app/pipeline/aggregator.py
backend/app/pipeline/hypothesis_engine.py
backend/app/pipeline/expected_reality.py
backend/app/routers/*
frontend/src/lib/api.ts
frontend/src/app/gis-map/page.tsx
```

Before changing one:

```text
[ ] identify all importers
[ ] identify all API consumers
[ ] identify all frontend consumers
[ ] identify relevant tests
[ ] identify legacy semantics
[ ] assess compatibility
```

After changing one:

```text
[ ] focused tests
[ ] affected integration tests
[ ] broader regression if risk warrants
```

---

# 11. SCENARIO DOMAIN RULES

Scenario is a first-class domain concept.

Core entities include:

```text
DisasterScenarioDB
SectorScenarioStateDB
InfrastructureStatusDB
ScenarioEventDB
SilentZoneAssessmentDB
```

Potential supporting entities/extensions include:

```text
EvidenceDB
HypothesisDB
BaselineDB
RecommendationLinkDB
```

Do not create duplicate scenario stores.

The authoritative scenario lifecycle should flow through the existing backend domain/API architecture.

---

# 12. DISASTER TYPE RULES

Required initial disaster types:

```text
flood
earthquake
cyclone
hurricane
```

The simulation must not treat these merely as labels.

The expected propagation semantics are:

```text
EARTHQUAKE
    epicenter/origin
    radial/severity attenuation

FLOOD
    directional / flow / downstream / lowland behavior

CYCLONE
    directional track / impact corridor

HURRICANE
    directional track / impact corridor
```

Different disaster types must produce meaningfully different scenario behavior.

---

# 13. SIMULATION ENGINE RULES

Simulation logic belongs in the backend simulation layer, principally:

```text
backend/app/simulation/generator.py
backend/app/simulation/clock.py
```

Do NOT move disaster propagation algorithms into:

```text
React components
routers
database models
presentation code
```

The frontend renders authoritative simulation output.

It does not become the simulation engine.

---

# 14. EXPECTED VS OBSERVED RULES

Scenario-aware expectation belongs in:

```text
backend/app/pipeline/expected_reality.py
```

Scenario silence logic belongs in:

```text
backend/app/pipeline/negative_evidence.py
```

The conceptual chain is:

```text
scenario context
+
historical baseline
        ↓
expected signal

observed data
        ↓

expected vs observed comparison
        ↓
silence score
        ↓
silent-zone assessment
```

Keep these concepts distinguishable:

```text
historical
expected
observed
derived silence
```

---

# 15. INFRASTRUCTURE CONTEXT RULES

Infrastructure/context logic belongs in the backend.

Relevant dimensions include:

```text
mobile
internet
electricity/power
road access
neighbor connectivity
```

Relevant existing/new functions include:

```text
distance_between_locations_km(...)
get_neighboring_locations(...)

compute_infrastructure_isolation_score(...)
evaluate_neighbor_connectivity_context(...)
build_infrastructure_isolation_context(...)
```

Do not approximate these relationships independently in the frontend.

---

# 16. FIVE-CAUSE REASONING RULES

The scenario silence model has exactly five required product causes:

```text
1. communication failure
2. infrastructure failure
3. population movement
4. sensor/data failure
5. severe local impact
```

The scenario reasoning path includes:

```text
build_silence_cause_priors(...)

score_communication_failure_hypothesis(...)

score_infrastructure_failure_hypothesis(...)

score_population_movement_hypothesis(...)

score_sensor_failure_hypothesis(...)

score_severe_local_impact_hypothesis(...)

evaluate_silent_zone_causes(...)
```

All five causes must remain semantically distinct.

A cause score is a diagnostic inference, not ground-truth certainty.

---

# 17. EXPLAINABILITY RULE

A reasoning system must answer:

```text
What did the system expect?
What did it observe?
What is missing?
What evidence supports this cause?
What evidence argues against it?
Why is this cause ranked highly?
What should be checked next?
```

A bare label such as:

```text
cause = infrastructure_failure
```

is insufficient for the product's intended explainability.

---

# 18. COUNTERFACTUAL RULE

Counterfactual analysis is supporting reasoning.

Current reported function:

```text
evaluate_silence_counterfactuals(...)
```

The intended logic is:

```text
If cause X were true,
what additional observations should we expect?

Compare:
expected supporting observations
vs.
actual observations

Then:
support / weaken hypothesis
```

Do not turn counterfactuals into an unrelated replacement for five-cause scoring.

---

# 19. AGGREGATION RULES

The aggregation layer is shared infrastructure.

When extending:

```text
backend/app/pipeline/aggregator.py
```

preserve:

- existing location aggregation;
- existing consumers;
- non-scenario behavior.

The Codex implementation distinguished:

```text
display score
```

from:

```text
internal ranking signal
```

where the displayed value may be capped while internal urgency remains uncapped and scenario priority contributes to ranking.

Do not collapse these into one value without evidence.

---

# 20. EVIDENCE RULES

Evidence belongs in the evidence model rather than UI logic.

Relevant scenario-aware evidence categories include:

```text
human reports
network/mobile
infrastructure
power
roads
sensors
remote/satellite observation
neighboring-region activity
```

Evidence may be:

```text
positive
negative
missing
stale
conflicting
```

Do not silently convert:

```text
missing
```

into:

```text
zero
```

unless the domain explicitly defines that behavior.

---

# 21. RECOMMENDATION RULES

The operational pipeline should flow through:

```text
evidence
   ↓
silence assessment
   ↓
cause reasoning
   ↓
verification priority
   ↓
dispatch recommendation
```

Do not bypass reasoning with arbitrary UI-level recommendation conditionals.

Recommendations should be capable of reflecting differences between causes.

Example:

```text
communication failure
    ≠
severe local impact
```

therefore the recommended next action may differ.

---

# 22. API CONTRACT RULES

Use the backend as the authoritative API contract.

The frontend API client is:

```text
frontend/src/lib/api.ts
```

Do not create duplicate request/response structures in individual components.

Before adding an endpoint:

```text
[ ] inspect router conventions
[ ] inspect schema conventions
[ ] inspect existing route
[ ] inspect frontend consumers
[ ] inspect tests
```

Use additive evolution where practical.

---

# 23. FRONTEND RULES

Frontend responsibilities:

```text
render
orchestrate workflow
show state
request backend data
display explanations
display recommendations
```

Frontend MUST NOT become the authoritative source for:

```text
disaster propagation
silence scoring
cause ranking
infrastructure isolation
dispatch logic
```

### Central workflow

The GIS page is the primary live demonstration surface:

```text
frontend/src/app/gis-map/page.tsx
```

Supporting components:

```text
SimulationControls.tsx
InteractiveVectorMap.tsx
ActiveSectorDossier.tsx
SectorDetailPanel.tsx
FloatingCommandBar.tsx
```

Keep the experience unified.

---

# 24. MAP RENDERING RULES

Map rendering belongs in:

```text
InteractiveVectorMap.tsx
```

The map should visualize backend-provided:

```text
impact progression
silent zones
risk
infrastructure/network context
```

Do not rebuild backend intelligence inside map rendering code.

The map is a visualization surface, not the analytical source of truth.

---

# 25. POLLING / ASYNC STATE RULES

Scenario progression can create stale-state risks.

Antigravity must explicitly verify:

```text
loading state
error state
empty state
scenario change
scenario reset
polling cleanup
stale response handling
duplicate request prevention
```

Never assume the latest response is still valid after:

```text
scenario changed
scenario reset
component unmounted
```

---

# 26. DATABASE CHANGE RULES

Before changing `db.py`:

```text
inspect models
inspect relationships
inspect initialization
inspect indexes/keys
inspect readers
inspect writers
inspect tests
```

Prefer additive migration.

Do not introduce a duplicate table merely because a plan names one.

For every proposed entity ask:

> Does this concept already have a safe existing representation?

---

# 27. SCHEMA CHANGE RULES

For `schemas.py`:

```text
prefer optional/additive fields where compatibility allows
preserve existing response semantics
avoid unnecessary required-field changes
check model declaration ordering/import behavior
```

The supplied Codex history contains a specific compatibility adjustment using inline literals because of schema type-alias ordering.

Do not reintroduce ordering/import issues.

---

# 28. ERROR HANDLING RULE

Do not invent a new global error envelope without repository evidence.

First inspect:

```text
existing HTTP status conventions
existing validation errors
existing exception handlers
existing router patterns
existing tests
```

Then follow project conventions.

Expected error cases include:

```text
invalid scenario ID
invalid disaster type
invalid lifecycle transition
invalid sector
scenario not started
scenario unavailable
malformed request
internal simulation failure
```

Exact response status/schema must follow the repository.

---

# 29. TEST-FIRST MINDSET

Tests are part of implementation, not post-processing.

For every new behavior:

```text
define expected behavior
        ↓
implement
        ↓
test
        ↓
inspect failure
        ↓
correct
        ↓
retest
```

Do not remove tests merely because they fail after a change.

First determine whether:

```text
implementation is wrong
test expectation is obsolete
contract intentionally changed
```

Only then modify the test.

---

# 30. MILESTONE GATE RULE

A milestone is not complete because code was written.

Use:

```text
IMPLEMENTED
```

when the change exists.

Use:

```text
VERIFIED
```

only after required verification succeeds.

Use:

```text
PARTIALLY VERIFIED
```

when only a focused subset has passed.

The known example is:

```text
M7
    implementation present
    focused tests passed
    full regression historically unconfirmed
```

Do not report M7 as fully verified until the current full regression is actually run successfully.

---

# 31. VERIFICATION HIERARCHY

### Gate 1 — Static integrity

```text
syntax
imports
type/schema creation
startup
```

### Gate 2 — Focused tests

Tests for the changed module.

### Gate 3 — Contract/integration tests

Tests for downstream consumers.

### Gate 4 — Regression tests

Required when shared modules/contracts are modified.

### Gate 5 — User-flow validation

For frontend/demo work:

```text
scenario selection
start
advance
map update
silent-zone inspection
cause explanation
recommendation
reset
```

---

# 32. FAILURE RESPONSE

When a test fails:

```text
STOP assuming the code is correct.

1. Read failure.
2. Identify affected contract.
3. Determine whether failure is:
   - implementation bug
   - compatibility regression
   - stale test
   - stale documentation
   - environment issue
4. Fix only after establishing the cause.
5. Re-run focused test.
6. Re-run affected broader tests.
```

Do not hide failures by weakening assertions without justification.

---

# 33. NO “FIX IT BY GUESSING” RULE

When repository evidence is ambiguous:

```text
inspect
```

rather than:

```text
guess
```

Examples:

Do not guess:

- current enum values;
- current API response shape;
- whether a table already exists;
- whether a function was renamed;
- whether a legacy page depends on a field;
- whether a test is still authoritative.

The persistent documents help identify what to investigate; they do not eliminate the need to inspect the current code.

---

# 34. NO UNRELATED REFACTOR RULE

While working on:

```text
scenario API
```

do not automatically refactor:

```text
authentication
```

While working on:

```text
silence scoring
```

do not automatically redesign:

```text
database initialization
```

unless the change is genuinely required.

Record unrelated cleanup separately rather than mixing it into milestone implementation.

---

# 35. NO DUPLICATE BUSINESS LOGIC RULE

Do not create:

```text
backend silence score
+
frontend silence score
```

or:

```text
backend recommendation mapping
+
frontend recommendation mapping
```

or:

```text
backend neighbor calculation
+
frontend neighbor calculation
```

One authoritative implementation should exist for each business rule wherever practical.

---

# 36. CURRENT SCENARIO WORKFLOW

The intended end-to-end operational flow is:

```text
Scenario creation
      ↓
Scenario start
      ↓
Simulation advancement
      ↓
Sector impact state
      ↓
Expected signal
      +
Observed signal
      ↓
Silence score
      ↓
Infrastructure / neighboring context
      ↓
Five-cause reasoning
      ↓
Counterfactual support/weakening
      ↓
Aggregation
      ↓
Verification
      ↓
Dispatch
      ↓
GIS
      ↓
SITREP
```

Do not skip layers without documenting why.

---

# 37. FRONTEND USER-JOURNEY CONTRACT

The central demo should feel like one story:

```text
1. Select disaster
2. Configure scenario/location/severity where supported
3. Start
4. Watch impact progression
5. Advance
6. Observe silent zones
7. Select sector
8. See expected vs observed
9. See nearby/infrastructure context
10. See five-cause explanation
11. See recommended action
12. Reset/replay
```

Avoid disconnected feature pages that require the user to understand the backend architecture.

---

# 38. CODE QUALITY RULES

Prefer:

- clear names;
- typed interfaces;
- small composable functions;
- deterministic behavior where possible;
- explainable scoring;
- explicit error handling;
- tests adjacent to changed behavior;
- comments that explain **why**, not obvious **what**.

Avoid:

- speculative abstraction;
- hidden global state;
- magic numbers without semantic names;
- duplicated business logic;
- broad rewrites.

---

# 39. DETERMINISM / DEMO RELIABILITY

For demo scenarios, prefer deterministic or seeded behavior when the project architecture permits it.

A demo must be:

```text
repeatable
understandable
stable
debuggable
```

Randomness must not make the core reasoning impossible to verify.

If stochastic behavior is required, use controlled seeds/configuration where appropriate and document it.

---

# 40. SECURITY / ADVERSARIAL INVARIANTS

At minimum protect against:

```text
silent sector auto-marked safe
invalid scenario state transition
cross-scenario state leakage
stale scenario result shown after reset
invalid sector references
malformed scenario input
```

Test these explicitly where relevant.

---

# 41. DATA OWNERSHIP RULE

Use this conceptual ownership model:

```text
scenario lifecycle
    → simulation/domain

expected signal
    → expected_reality

silence
    → negative_evidence

infrastructure/isolation
    → blackout_risk + gazetteer

cause reasoning
    → hypothesis_engine

counterfactuals
    → counterfactual

aggregation
    → aggregator

verification
    → active_verification

dispatch
    → dispatch_engine

report generation
    → sitrep_generator

visualization
    → frontend
```

Do not move ownership simply to avoid touching the correct module.

---

# 42. COMMIT / CHANGE BOUNDARY GUIDANCE

When Git is available, prefer coherent changes such as:

```text
milestone-7-aggregation
milestone-8-evidence-dispatch
milestone-9-gis-api
```

rather than unrelated mixed commits.

Each implementation checkpoint should ideally be:

```text
small enough to understand
large enough to represent one coherent behavior
tested
reproducible
```

Do not rewrite history or discard prior work without explicit authorization.

---

# 43. STATE DOCUMENTATION RULE

After meaningful implementation:

Update:

```text
CURRENT_STATE.md
```

with:

```text
current milestone
completed tasks
changed files
tests run
result
known issues
next safe task
unverified assumptions
```

Update:

```text
CHANGE_LOG.md
```

with the durable historical change record.

Never leave the next agent to infer the checkpoint from a Git diff alone.

---

# 44. INTERRUPTION / TOKEN-LIMIT RULE

If execution is interrupted before full verification:

Do NOT report:

```text
complete
```

Instead report:

```text
implemented
focused tests: PASS/FAIL
full regression: NOT RUN / INTERRUPTED
remaining verification:
...
```

This rule exists specifically because earlier Codex execution encountered a usage limit while validating Milestone 7.

---

# 45. CONTEXT-COMPACTION RULE

If your context becomes large or is compacted:

Immediately recover using:

```text
MASTER_CONTEXT.md
CURRENT_STATE.md
DEVELOPMENT_PLAN.md
INTEGRATION_MAP.md
```

Then inspect the current repository.

Do not reconstruct the project from memory.

The persistent markdown files are intentionally the durable memory layer.

---

# 46. CURRENT FRONTIER RULE

At the time this constitution was created, the supplied Codex history indicates:

```text
M1  implemented earlier
M2  implemented earlier
M3  implemented earlier
M4  implemented + historically verified
M5  implemented + historically verified
M6  implemented + historically verified
M7  implemented + focused verified
    full regression unconfirmed
M8+ planned
```

Therefore, unless the current repository proves otherwise:

> **The next safe engineering checkpoint is to verify/finalize M7, then continue with M8.**

Do not reimplement M4/M5/M6 merely because they appear in earlier milestone plans.

---

# 47. M8 CONTINUATION CONTRACT

Once M7 full regression is green, the next intended engineering focus is:

```text
M8 — Evidence and Recommendation Integration
```

Primary files:

```text
backend/app/pipeline/evidence_model.py
backend/app/pipeline/active_verification.py
backend/app/pipeline/dispatch_engine.py
```

Primary objectives:

```text
structured infrastructure/network/sensor evidence
        ↓
cause-aware verification
        ↓
cause-aware dispatch
```

Required validation includes proving that different silence causes can result in meaningfully different recommended actions.

---

# 48. AGENT RESPONSE FORMAT BEFORE IMPLEMENTATION

For any substantial coding task, first produce a compact internal plan of:

```text
CURRENT STATE
- what exists

TARGET
- what this task will add/change

SCOPE
- files/functions affected

PROTECTED
- behavior that must not change

VERIFICATION
- tests to run

RISKS
- likely compatibility issues
```

Do not begin with a broad architectural rewrite proposal unless the user explicitly asks for redesign.

---

# 49. AGENT RESPONSE FORMAT AFTER IMPLEMENTATION

Record:

```text
IMPLEMENTED
- exact capability added/changed

FILES
- exact paths

VERIFICATION
- exact commands/tests
- exact result

REMAINING
- anything not fully verified

STATE
- milestone status
- next safe task
```

Use precise status terms.

Example:

```text
M7
IMPLEMENTED
FOCUSED VERIFIED
FULL REGRESSION PENDING
```

not:

```text
M7 DONE
```

---

# 50. DO NOT OVERCLAIM

Never claim:

```text
tested
verified
complete
production-ready
fully integrated
```

unless the evidence supports the claim.

Examples:

If only static checks passed:

```text
static validation passed
```

If focused tests passed:

```text
focused tests passed
```

If full suite passed:

```text
full suite passed
```

If frontend was not manually exercised:

```text
manual UI validation remains
```

---

# 51. WHEN DOCUMENTATION IS WRONG

If:

```text
MASTER_CONTEXT.md
```

says one thing and the current repository clearly shows another:

1. inspect the current code;
2. inspect recent tests/change history;
3. determine whether the documentation is stale;
4. preserve working code unless there is a clear requirement to change it;
5. update `CURRENT_STATE.md` / `CHANGE_LOG.md`;
6. do not silently pretend the contradiction never existed.

Documentation drift is a recoverable project-state issue, not a reason to guess.

---

# 52. WHEN AN ALTERNATIVE ARCHITECTURE LOOKS “BETTER”

Ask:

```text
Does the current architecture actually prevent the required feature?
```

If no:

> Do not redesign it.

If yes:

```text
identify blocking constraint
identify smallest architectural change
preserve legacy interfaces where possible
define migration/compatibility strategy
test before/after
```

The goal is not architectural perfection.

The goal is:

> **safe, explainable, incremental completion of the required capability.**

---

# 53. FINAL AGENT CHECKLIST

Before claiming a task complete:

```text
[ ] Read relevant project-memory files
[ ] Inspected current repository
[ ] Confirmed target code really needed changing
[ ] Preserved legacy semantics
[ ] Avoided duplicate business logic
[ ] Implemented within scope
[ ] Added/updated tests
[ ] Ran focused verification
[ ] Ran broader regression when required
[ ] Checked API/schema compatibility
[ ] Checked state/reset behavior when relevant
[ ] Updated current state
[ ] Recorded unresolved issues
[ ] Reported verification truthfully
```

---

# 54. FINAL CONSTITUTION

The agent must continuously optimize for this:

```text
PERSISTENT CONTEXT
        +
REPOSITORY TRUTH
        +
MINIMAL SAFE CHANGE
        +
BACKWARD COMPATIBILITY
        +
EXPLAINABLE LOGIC
        +
VERIFIABLE IMPLEMENTATION
```

The project is an integration project.

The agent is a custodian of accumulated engineering context.

Therefore:

> **Read before changing.**
>
> **Inspect before assuming.**
>
> **Extend before replacing.**
>
> **Test before declaring success.**
>
> **Document before handing off.**
>
> **Never turn silence into safety without evidence.**
