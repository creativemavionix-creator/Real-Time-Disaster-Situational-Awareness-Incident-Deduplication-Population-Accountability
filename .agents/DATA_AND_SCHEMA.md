# DATA_AND_SCHEMA — Domain, Persistence, and Data-Flow Specification

> **Purpose:** Define the durable data model for the scenario-driven disaster situational-awareness platform: entities, fields, relationships, state transitions, evidence, silence assessments, hypotheses, baselines, persistence, and ownership boundaries.
>
> **Companion files:** `MASTER_CONTEXT.md`, `ARCHITECTURE.md`, `DEVELOPMENT_PLAN.md`, `INTEGRATION_MAP.md`, `DECISIONS.md`, `MILESTONES.md`, `TEST_STRATEGY.md`, `API_CONTRACTS.md`.
>
> **Source discipline:** Entity names, field names, and semantics below are derived from the supplied planning and Codex execution material. Where the sources only proposed a field or model and did not prove its current implementation, it is explicitly marked `PROPOSED` or `OPEN`. Antigravity MUST inspect the current repository before assuming an exact schema.
>
> **Primary design principle:** Scenario state is a first-class domain concept, but the new model must coexist with the existing disaster/reporting/deduplication/population-accountability system rather than silently replacing it.

---

# 0. DATA MODEL RULES

## 0.1 Source of truth

Use the following hierarchy when resolving data-model questions:

```text
Current repository schema/code
        ↓
Verified tests
        ↓
Latest documented implementation state
        ↓
Earlier planning specification
```

A planning field MUST NOT override the actual repository schema.

---

## 0.2 Status vocabulary

- `IMPLEMENTED` — supplied Codex history explicitly reports implementation.
- `VERIFIED-HISTORICAL` — implementation was followed by a reported successful verification run.
- `PROPOSED` — planning specification only.
- `OPEN` — exact current schema needs repository inspection.
- `COMPATIBILITY-REQUIRED` — legacy behavior must continue.

---

## 0.3 Persistence principle

Scenario state that must survive API requests or simulation advancement should be represented in persistent domain/database state.

Do not create an unrelated second state store merely to support the new scenario workflow.

---

# 1. DOMAIN MODEL AT A GLANCE

The supplied material identifies the following core scenario-related entities:

```text
DisasterScenarioDB
        │
        ├───────────────┐
        │               │
        ▼               ▼
SectorScenarioStateDB  ScenarioEventDB
        │
        ├───────────────┐
        │               │
        ▼               ▼
InfrastructureStatusDB  SilentZoneAssessmentDB
        │                       │
        │                       ▼
        │                five-cause reasoning
        │                       │
        └──────────────┬────────┘
                       ▼
                verification / dispatch
```

Supporting/extended entities:

```text
EvidenceDB
HypothesisDB
BaselineDB
RecommendationLinkDB (optional)
```

---

# 2. CORE ENTITY: DISASTER SCENARIO

## Entity

```text
DisasterScenarioDB
```

### Responsibility

Represents one configurable disaster simulation instance.

### Status

`ESTABLISHED AS DOMAIN REQUIREMENT`

### Supplied field specification

| Field | Meaning | Status |
|---|---|---|
| `scenario_id` | persistent scenario identifier | established |
| `disaster_type` | flood / earthquake / cyclone / hurricane | established |
| `origin_sector_id` | geographic origin/starting sector | established |
| `severity_level` | scenario severity | established |
| `status` | lifecycle state | established |
| `started_at` | actual scenario start | established |
| `ended_at` | scenario end, if applicable | established |

The request blueprint also proposes:

```text
start_time
propagation_profile
```

These exact field names must be reconciled with the current schema.

### Relationships

```text
DisasterScenarioDB
    1 ──── N SectorScenarioStateDB
    1 ──── N ScenarioEventDB
    1 ──── N SilentZoneAssessmentDB
```

Potentially:

```text
DisasterScenarioDB
    1 ──── N RecommendationLinkDB
```

if that model is implemented.

### Lifecycle concepts

```text
created
   ↓
started/running
   ↓
advanced repeatedly
   ↓
completed/ended OR reset
```

Exact status values are implementation-specific.

---

# 3. ENTITY: SECTOR SCENARIO STATE

## Entity

```text
SectorScenarioStateDB
```

### Responsibility

Stores the current scenario-specific state of an individual sector.

### Supplied field specification

| Field | Meaning |
|---|---|
| `scenario_id` | parent scenario |
| `sector_id` | geographic sector |
| `impact_level` | current scenario impact |
| `is_silent` | current silence state |
| `is_isolated` | current inferred isolation state |
| `population_risk` | population exposure/risk |
| `top_silence_cause` | current leading cause |

### Status

`PROPOSED BY IMPLEMENTATION BLUEPRINT / USED BY CODEX EXECUTION`

The Codex history explicitly states that Milestone 3 scenario states contained expected/observed signal information and that later M4/M5/M6 logic consumed generated sector/infrastructure state.

Therefore the concept definitely exists in the implemented system, but every field above should be verified against the actual current DB model.

### Relationships

```text
DisasterScenarioDB
       1
       │
       N
       ▼
SectorScenarioStateDB
       │
       ├── sector/location
       ├── infrastructure context
       └── silence assessment
```

---

# 4. ENTITY: INFRASTRUCTURE STATUS

## Entity

```text
InfrastructureStatusDB
```

### Responsibility

Represents infrastructure/connectivity condition for a sector during a scenario.

### Supplied fields

| Field | Meaning |
|---|---|
| `sector_id` | affected sector |
| `mobile_status` | mobile/network availability |
| `electricity_status` | power availability |
| `internet_status` | internet availability |
| `road_access_status` | road accessibility |
| `last_updated` | freshness timestamp |

### Status

`PROPOSED / SCENARIO STATE USED BY CODEX`

The Codex execution history explicitly states that Milestone 5 pulled generated scenario/infrastructure rows and reasoned over mobile, internet, power, and road access.

### Relationship

```text
Sector
   1 ──── N InfrastructureStatusDB

DisasterScenarioDB
   1 ──── N scenario-relevant infrastructure state
```

The exact scenario foreign-key relationship must be verified from the current DB implementation.

---

# 5. ENTITY: SCENARIO EVENT

## Entity

```text
ScenarioEventDB
```

### Responsibility

Stores timeline events generated during a simulation.

### Examples from supplied material

```text
impact propagation
report loss
recon trigger
scenario state transition
```

### Status

`PROPOSED`

### Expected conceptual fields

The source material does not provide a complete exact field list.

A repository implementation must establish at minimum a way to associate an event with:

```text
scenario
sector/location where relevant
event time
event type
event payload/state
```

Exact names and types are `OPEN`.

### Why persistence matters

Events provide the historical timeline needed for:

- propagation playback;
- debugging;
- replay;
- auditability;
- scenario-aware reporting.

---

# 6. ENTITY: SILENT ZONE ASSESSMENT

## Entity

```text
SilentZoneAssessmentDB
```

### Responsibility

Persist a structured assessment of suspicious information loss for a sector in a scenario.

### Supplied fields

| Field | Meaning | Status |
|---|---|---|
| `sector_id` | affected sector | established |
| `scenario_id` | parent scenario | established |
| `expected_signal` | expected reporting/telemetry level | established |
| `observed_signal` | observed reporting/telemetry level | established |
| `silence_score` | suspicious silence magnitude | established |
| `cause_scores_json` | cause scores / ranked explanations | established in planning |
| `explanation` | human-readable reasoning | established |

### Codex-reported behavior

M4 implemented:

```text
build_silent_zone_assessment(...)
```

and persisted scenario assessments into:

```text
silent_zone_assessments
```

### Semantic invariant

This entity represents:

```text
suspicious information absence
```

not:

```text
confirmed physical destruction
```

and never inherently means:

```text
safe
```

---

# 7. SILENCE ASSESSMENT DATA FLOW

```text
Scenario state
      +
historical/baseline context
      +
scenario expected signal
      +
observed signal
      ↓
Expected-vs-observed comparison
      ↓
silence score
      ↓
SilentZoneAssessmentDB
      ↓
infrastructure context
      ↓
five-cause reasoning
```

This separation is intentional.

Do not collapse all of these concepts into one `risk` field.

---

# 8. ENTITY: EVIDENCE

## Entity

```text
EvidenceDB
```

### Responsibility

Store/represent evidence entering the situational-awareness pipeline.

### Existing role

The original project already has evidence/report-oriented capabilities.

### Planned scenario-aware extensions

The supplied material proposes structured evidence for:

```text
telecom/network
power
road
sensor health
```

alongside existing evidence sources such as:

- human reports
- police/hospital reports
- infrastructure
- sensors
- remote observations
- neighboring regions

### Status

`EXTEND EXISTING ENTITY`

### Integration rule

Do not create a separate scenario-only evidence universe if existing `EvidenceDB` can safely represent the new evidence.

Prefer an additive schema evolution.

---

# 9. EVIDENCE TYPES

The product requirement identifies these broad evidence streams:

```text
Human reports
Network/mobile signals
Infrastructure status
Sensors
Satellite/remote observations
Neighboring-region activity
```

The implementation blueprint specifically calls for structured ingestion functions:

```text
ingest_infrastructure_evidence(...)
ingest_network_signal_evidence(...)
ingest_sensor_health_evidence(...)
```

### Evidence semantics

Evidence can be:

```text
positive
negative / absent
degraded
stale
conflicting
```

The absence of expected evidence can itself become evidence for investigation, but must not automatically become evidence of safety.

---

# 10. ENTITY: HYPOTHESIS

## Entity

```text
HypothesisDB
```

### Responsibility

Persist or represent reasoning hypotheses used by the existing system.

### Compatibility requirement

The original system contains legacy H1-H5 hypotheses.

The Codex execution explicitly avoided overwriting them because:

> H1 currently means “area safe” for legacy/non-scenario analysis.

### Scenario extension

Scenario five-cause reasoning introduces:

```text
communication failure
infrastructure failure
population movement
sensor/data failure
severe local impact
```

### Supplied planning change

Extend `HypothesisDB` if current fields are insufficient so the hypothesis code/title align with the five scenario silence causes.

### Critical rule

Do not change the semantic meaning of legacy hypotheses merely to reuse their storage.

A safe implementation may:

```text
retain legacy hypotheses
+
add scenario cause metadata/path
```

if that is what the current repository supports.

---

# 11. FIVE-CAUSE SCORE DATA

The Codex execution reports scenario cause results containing:

```text
probability
confidence
evidence_for
evidence_against
explanation
entropy
expected_signal
observed_signal
signal_gap
```

These may be persisted directly, nested in assessment records, or returned through response schemas depending on the current implementation.

### Important distinction

These are **diagnostic scores**, not ground-truth labels.

For example:

```text
P(communication failure | current evidence)
```

does not prove that communication failure actually occurred.

---

# 12. ENTITY: BASELINE

## Entity

```text
BaselineDB
```

### Responsibility

Represent historical/expected behavior against which observed activity can be compared.

### Supplied extension

Add disaster-type applicability or contextual weighting where needed.

### Conceptual dimensions

```text
historical behavior
expected behavior
observed behavior
```

### Relationship to scenarios

```text
Baseline
    +
Scenario context
    ↓
Expected signal
    ↓
Observed vs expected gap
    ↓
Silence analysis
```

### Important rule

Do not treat the current scenario's synthetic generated state as historical truth.

Keep:

```text
historical baseline
```

separate from:

```text
scenario-generated expectation
```

when both are available.

---

# 13. EXPECTED SIGNAL DATA

Expected behavior may depend on:

```text
sector
disaster type
scenario
simulation hour/time
day of week
historical baseline
impact level
optional expected override
```

The supplied task board explicitly identifies:

```text
compute_expected_signal_for_scenario(
    sector_id,
    disaster_type,
    hour,
    day_of_week
)
```

as the intended scenario-aware calculation.

### Status

`IMPLEMENTED` according to the Codex execution history, but exact argument contract should be verified in the current code.

---

# 14. OBSERVED SIGNAL DATA

Observed signal may represent the incoming activity actually available from the platform.

Examples from the supplied project requirements:

```text
mobile/network
electricity
internet
road availability
reports/messages
sensor output
```

### Semantic rule

Observed data may be zero because:

- the area is truly quiet;
- infrastructure failed;
- people moved;
- sensors failed;
- communication failed;
- severe damage disrupted reporting.

Therefore:

```text
observed = 0
```

must not be treated as equivalent to:

```text
impact = 0
```

---

# 15. ENTITY: RECOMMENDATION LINK

## Entity

```text
RecommendationLinkDB
```

### Status

`OPTIONAL / PROPOSED`

### Purpose

Potentially connect:

```text
scenario
sector
silence cause
recommendation
mission
```

### Conceptual relationship

```text
SilentZoneAssessment
        ↓
top cause
        ↓
RecommendationLink
        ↓
Dispatch mission
```

Do not create this table if the current project already has a stable dispatch/recommendation relationship that can represent the same information safely.

---

# 16. ENTITY RELATIONSHIP MODEL

The intended logical model is:

```text
                         ┌─────────────────────────┐
                         │   DisasterScenarioDB    │
                         │─────────────────────────│
                         │ scenario_id             │
                         │ disaster_type           │
                         │ origin_sector_id        │
                         │ severity_level          │
                         │ status                  │
                         │ started_at              │
                         │ ended_at                │
                         └────────────┬────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
          ┌─────────────────┐ ┌───────────────┐ ┌────────────────────┐
          │ SectorScenario  │ │ ScenarioEvent │ │ SilentZoneAssessment│
          │ StateDB         │ │ DB            │ │ DB                 │
          └────────┬────────┘ └───────────────┘ └─────────┬──────────┘
                   │                                      │
                   │                                      ▼
                   │                              Five-cause scores
                   │                                      │
                   ▼                                      ▼
          InfrastructureStatusDB               Verification / Dispatch
                   │
                   ▼
            Neighbor context
```

Supporting:

```text
EvidenceDB ───────→ expected/observed + reasoning
BaselineDB ───────→ expected signal
HypothesisDB ─────→ legacy/scenario hypothesis representation
```

---

# 17. SCENARIO STATE LIFECYCLE

## Creation

```text
ScenarioCreateRequest
        ↓
validate domain inputs
        ↓
DisasterScenarioDB(created)
```

## Start

```text
created
  ↓
started/running
  ↓
initial sector states + timeline
```

## Advance

```text
running
  ↓
clock advances
  ↓
generator computes impact
  ↓
SectorScenarioStateDB updated
  ↓
ScenarioEventDB records events
  ↓
InfrastructureStatusDB updated/consulted
  ↓
intelligence pipeline runs
```

## Reset

```text
scenario reset
    ↓
initial scenario state
    ↓
transient scenario progression restored
    ↓
frontend receives fresh authoritative state
```

Exact transaction semantics must follow the current implementation.

---

# 18. DATA FLOW DURING SCENARIO ADVANCE

The intended data sequence is:

```text
Scenario
   ↓
Disaster generator
   ↓
Impact timeline
   ↓
Sector scenario state
   ↓
Infrastructure state
   ↓
Expected signal
   +
Observed signal
   ↓
Silence assessment
   ↓
Neighbor / isolation context
   ↓
Five-cause reasoning
   ↓
Aggregation
   ↓
Verification / Dispatch
   ↓
GIS / SITREP
```

This sequence is the core cross-entity integration contract.

---

# 19. TEMPORAL SEMANTICS

The system contains at least three temporal concepts:

### Scenario time

Where the simulation currently is.

### Evidence time

When a report/telemetry/evidence item was observed.

### Persistence/update time

When the database record was written or updated.

These should not automatically be treated as the same timestamp.

For example:

```text
scenario_time ≠ observed_at ≠ updated_at
```

where the current repository supports those distinctions.

---

# 20. DATA FRESHNESS

Infrastructure, network, sensor, and report information may become stale.

The existing planning material explicitly includes:

```text
last_updated
```

for infrastructure status.

Scenario-aware reasoning should be capable of distinguishing:

```text
active outage
```

from:

```text
unknown / stale information
```

where the current evidence model supports it.

Do not infer a strong causal conclusion from stale evidence without qualification.

---

# 21. SPATIAL DATA RELATIONSHIPS

The project uses sector/location geography.

Relevant relationships include:

```text
sector
   ↓
neighbor sectors
   ↓
distance / adjacency
   ↓
regional contrast
```

Codex added:

```text
distance_between_locations_km(...)
get_neighboring_locations(...)
```

to the gazetteer layer.

### Data-model implication

Sector identity must remain stable enough to be referenced consistently by:

- scenario state
- infrastructure state
- silence assessment
- evidence
- hypotheses
- GIS
- dispatch

Avoid duplicate identifiers for the same geographic unit.

---

# 22. POPULATION DATA

The existing system already includes population-exposure and population-accountability capabilities.

Scenario-aware state may add:

```text
population_risk
```

and the recommendation layer can use population exposure when prioritizing actions.

### Compatibility rule

Do not duplicate population master data inside `SectorScenarioStateDB`.

Prefer:

```text
existing population/location data
        +
scenario-specific impact/risk
```

rather than copying the full population dataset into each scenario row.

---

# 23. DISASTER PROFILE DATA

The system must distinguish disaster types:

```text
flood
earthquake
cyclone
hurricane
```

Disaster-specific parameters may include:

```text
propagation pattern
impact attenuation
communication disruption
infrastructure damage
population displacement
```

These should be represented as scenario/profile configuration rather than scattered constants across unrelated modules.

Exact profile schema is still `OPEN` unless present in the current repository.

---

# 24. LOCATION PROFILE DATA

The supplied requirements state that the platform should eventually vary by:

```text
disaster type
location
```

Therefore the data architecture should permit:

```text
location profile
+
disaster profile
+
scenario instance
```

without requiring a new code branch for every possible geographic area.

---

# 25. NORMALIZATION RULE

Where possible, normalize data around stable entities:

```text
Location/Sector
Scenario
Evidence
Infrastructure state
Assessment
Hypothesis
Recommendation
Event
```

Avoid storing the same derived fact independently in multiple unrelated tables unless there is a clear persistence/audit reason.

For example:

```text
top_silence_cause
```

may be materialized in sector state for fast status display, but the authoritative detailed reasoning should remain in the assessment/reasoning layer according to current architecture.

---

# 26. DERIVED VS AUTHORITATIVE DATA

## Authoritative state

Examples:

- scenario identity
- scenario lifecycle
- persisted sector state
- infrastructure records
- raw/normalized evidence

## Derived state

Examples:

- silence score
- isolation score
- top cause
- recommendation priority
- ranked hypotheses
- verification priority

### Rule

Derived values should be recomputable or traceable to their inputs where the current architecture allows.

Do not treat a cached `top_silence_cause` as the only source of truth for reasoning.

---

# 27. MATERIALIZED FIELDS

The supplied models include several fields that may be useful for fast UI queries:

```text
is_silent
is_isolated
top_silence_cause
population_risk
silence_score
recommendation_priority
```

These are useful materialized values, but they must remain semantically aligned with the underlying assessment/intelligence pipeline.

If a materialized field becomes stale, the system should not silently present it as freshly recomputed truth.

---

# 28. DATABASE MIGRATION PRINCIPLES

Scenario schema changes must be additive where practical.

Preferred sequence:

```text
Add table/column
    ↓
Preserve old columns/paths
    ↓
Populate/derive new data
    ↓
Update readers
    ↓
Update writers
    ↓
Test
```

Avoid destructive migration during incremental development unless explicitly required.

Before changing a shared table:

```text
inspect all readers
inspect all writers
inspect tests
inspect startup/initialization logic
```

---

# 29. SERIALIZATION BOUNDARY

The database representation and API representation need not be identical.

Use:

```text
DB model
   ↓
domain/pipeline logic
   ↓
Pydantic response schema
   ↓
JSON
```

For example:

```text
cause_scores_json
```

may be a persistence representation while the API may return structured cause objects.

Do not leak raw DB implementation details into the frontend solely for convenience.

---

# 30. DATA INTEGRITY CONSTRAINTS

The following invariants should hold wherever the current DB/API design supports them.

### Scenario identity

A sector scenario state must refer to a valid scenario and sector.

### Assessment identity

A silent-zone assessment must refer to a valid scenario and sector.

### Cause completeness

When a scenario cause analysis is generated, all five defined causes must be represented in the analytical output.

### Temporal coherence

Scenario-derived state should correspond to a coherent scenario point in time.

### Safety semantics

No amount of missing information by itself may convert the sector into a confirmed safe state.

### Backward compatibility

Legacy entities and consumers must retain valid semantics.

---

# 31. DATA QUALITY / EDGE CASES

Antigravity must account for:

```text
missing observed signal
missing expected signal
zero expected signal
zero observed signal
stale telemetry
conflicting evidence
missing infrastructure record
isolated sector with active neighbors
regional outage with inactive neighbors
sensor failure without physical damage
population movement without equivalent infrastructure collapse
severe local damage with communication loss
```

Do not silently coerce missing data into zero.

In particular:

```text
missing
≠
zero
```

unless the actual domain model explicitly defines that equivalence.

---

# 32. FIVE-CAUSE DATA MODEL

The five causes are part of the **product semantic contract**:

```text
COMMUNICATION_FAILURE
INFRASTRUCTURE_FAILURE
POPULATION_MOVEMENT
SENSOR_DATA_FAILURE
SEVERE_LOCAL_IMPACT
```

Exact enum identifiers should follow the current repository's naming convention.

Each cause analysis should be capable of carrying:

```text
score/probability
confidence
evidence-for
evidence-against
explanation
```

and scenario-level context:

```text
expected signal
observed signal
signal gap
```

---

# 33. COUNTERFACTUAL DATA

Counterfactual evaluation can be represented conceptually as:

```text
Cause hypothesis
      ↓
Expected supporting observations
      ↓
Observed observations
      ↓
support / contradiction
```

The system added:

```text
evaluate_silence_counterfactuals(...)
```

but the supplied material does not establish a permanent DB entity dedicated solely to counterfactuals.

Therefore:

> Do not create a `CounterfactualDB` unless repository inspection or later project material establishes a persistence need.

Counterfactuals may remain derived analysis.

---

# 34. EVIDENCE → HYPOTHESIS TRACEABILITY

A high-quality assessment should preserve enough linkage to explain:

```text
Why was this cause ranked first?
```

The system should conceptually support:

```text
assessment
   ↓
cause
   ↓
supporting evidence
   ↓
contradicting evidence
   ↓
explanation
```

This is particularly important for the product's explainability story.

---

# 35. DATA RETENTION / AUDITABILITY

The supplied material does not define formal production retention policies.

Therefore:

- preserve scenario/event history where necessary for replay and debugging;
- preserve assessment/reasoning output where required by current database design;
- do not invent regulatory retention periods;
- follow the existing project's persistence conventions.

---

# 36. DATABASE INITIALIZATION

The scenario models are expected to participate in the existing DB initialization flow.

Milestone 1 acceptance explicitly requires:

> New DB models are created by existing DB initialization flow.

Therefore the scenario schema must not depend on a completely separate initialization mechanism unless the repository explicitly adopts one.

---

# 37. CURRENT DATA-MODEL IMPLEMENTATION STATUS

Based on the supplied Codex history:

### Implemented earlier / used by later code

```text
DisasterScenarioDB
SectorScenarioStateDB
InfrastructureStatusDB
ScenarioEventDB
SilentZoneAssessmentDB
```

The exact current definitions must still be inspected.

### Implemented/extended behavior reported by Codex

```text
SilentZoneAssessmentDB persistence
scenario-aware infrastructure rows
scenario-aware hypothesis response schema
InfrastructureIsolationContext
scenario-aware location status fields
```

### Still planned / may require extension

```text
EvidenceDB structured scenario evidence
HypothesisDB five-cause alignment
BaselineDB scenario/disaster contextual weighting
RecommendationLinkDB optional
```

---

# 38. DATA-MODEL VERIFICATION CHECKLIST

Before modifying `db.py`:

```text
[ ] Inspect current SQLAlchemy model definitions
[ ] Inspect primary keys
[ ] Inspect foreign keys
[ ] Inspect indexes
[ ] Inspect existing initialization
[ ] Inspect relationship declarations
[ ] Inspect migration strategy if any
[ ] Find all readers
[ ] Find all writers
[ ] Find test fixtures
```

Before modifying `schemas.py`:

```text
[ ] Inspect actual Pydantic model names
[ ] Inspect required vs optional fields
[ ] Inspect enum values
[ ] Find API consumers
[ ] Find serialization tests
```

---

# 39. NO DUPLICATE SOURCE OF TRUTH

Avoid situations such as:

```text
Scenario state in DB
+
Scenario state in arbitrary global dict
+
Scenario state independently reconstructed in React
```

Prefer:

```text
Persistent scenario state
        ↓
API
        ↓
frontend local/UI state
```

Frontend state is a view/cache, not the authoritative scenario domain.

---

# 40. DATA CONSISTENCY ACROSS MODULES

A sector identifier should mean the same geographic entity in:

```text
scenario state
infrastructure status
evidence
silence assessment
hypothesis
aggregation
GIS
dispatch
```

A disaster type should mean the same scenario family across:

```text
scenario
generator
expected-reality
hypothesis
dispatch
SITREP
frontend
```

The five silence causes must retain stable semantic meaning across:

```text
hypothesis engine
API
frontend
SITREP
dispatch
```

---

# 41. DATA MODEL AND GIS

Map rendering should consume derived geographic data from the backend.

The backend may combine:

```text
sector geometry
+
scenario state
+
impact
+
silence
+
infrastructure
+
risk
```

into map-ready payloads.

The frontend should not become the system of record for scenario geography.

---

# 42. DATA MODEL AND REPORTING

SITREP/reporting should derive from authoritative/current backend state:

```text
scenario
+
sector status
+
silent-zone assessments
+
cause ranking
+
recommendations
```

Do not create an independent report-only copy of scenario truth unless required for historical snapshots.

---

# 43. DATA MODEL AND DISPATCH

A dispatch action should be traceable back toward:

```text
scenario
→ sector
→ risk/silence state
→ cause
→ evidence/context
→ response recommendation
```

If `RecommendationLinkDB` is not used, an equivalent trace must remain available through existing dispatch entities/fields.

---

# 44. DATA MODEL AND RESET

Scenario reset is a data-state operation, not merely a frontend button.

The backend must determine what is:

```text
scenario-persistent metadata
```

versus:

```text
scenario-transient state
```

A reset must restore transient state consistently across:

- sector scenario state;
- timeline/events;
- infrastructure simulation state;
- silence assessments;
- derived rankings where scenario-specific.

Do not leave stale derived rows that the UI can accidentally display after reset.

Exact reset persistence semantics are `OPEN` until the current implementation is inspected.

---

# 45. DATA MODEL AND REPLAY

Because the scenario evolves through a simulation clock and event timeline, a well-formed implementation should make it possible to understand:

```text
what happened
when
in which sector
under which scenario
```

This supports:

- debugging;
- verification;
- demo playback;
- SITREP generation;
- reproducibility.

The supplied planning material does not establish a complete event-sourcing architecture, so do not introduce one unless required.

---

# 46. SOURCE/DERIVATION MATRIX

| Data | Source / owner | Derived by | Consumers |
|---|---|---|---|
| Scenario identity | `DisasterScenarioDB` | scenario lifecycle | all scenario services |
| Sector scenario state | `SectorScenarioStateDB` | simulation | intelligence/GIS/status |
| Infrastructure state | `InfrastructureStatusDB` | simulation/evidence | isolation/hypotheses |
| Scenario events | `ScenarioEventDB` | simulation | timeline/report/debug |
| Historical baseline | `BaselineDB` / existing baseline system | baseline logic | expected signal |
| Observed evidence | `EvidenceDB` / existing evidence | ingestion | silence/reasoning |
| Expected signal | `expected_reality.py` | expected-model logic | silence |
| Silence score | `negative_evidence.py` | assessment logic | hypothesis/status/GIS |
| Cause scores | hypothesis engine | scenario reasoning | verification/dispatch/UI |
| Isolation score | blackout risk | infra/neighbor logic | hypotheses/status |
| Recommendation priority | aggregator/dispatch logic | downstream reasoning | UI/dispatch |
| SITREP | `sitrep_generator.py` | reporting pipeline | API/frontend |

---

# 47. FINAL DATA PRINCIPLE

The core data semantics should remain:

```text
WHAT IS HAPPENING?
    ↓
scenario + observed state

WHAT SHOULD BE HAPPENING?
    ↓
baseline + scenario expectation

WHAT IS MISSING?
    ↓
silence assessment

WHY MIGHT IT BE MISSING?
    ↓
infrastructure + neighboring context + five causes

WHAT SHOULD WE DO?
    ↓
verification + dispatch

HOW DO WE SHOW IT?
    ↓
GIS + SITREP
```

The database model exists to preserve the state needed for that chain without creating duplicate or contradictory sources of truth.

---

# 48. ANTIGRAVITY DATA-MODEL OPERATING RULE

When a task requires a schema/database change:

```text
1. Inspect the current model.
2. Confirm whether the entity already exists.
3. Confirm actual fields/relationships.
4. Identify every reader/writer.
5. Check legacy consumers.
6. Make an additive compatible change where possible.
7. Add migration/init coverage if required.
8. Add schema/API tests.
9. Add behavioral tests.
10. Verify persistence and reset semantics.
11. Update project state.
```

Never create a new table/entity simply because the planning document lists one if the current code already represents the same concept safely.

The target is a **single coherent data model**, not maximal table count.
