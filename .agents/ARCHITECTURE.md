# ARCHITECTURE — Disaster Situational Awareness Integration

> **Purpose:** Define the repository-level architecture that Antigravity must preserve while continuing the integration work initiated in Codex.
>
> **Role:** This file is the structural companion to `MASTER_CONTEXT.md`. It explains **how the system is intended to fit together**, which subsystem owns which responsibility, how data should flow, and which architectural boundaries must not be violated.
>
> **Source basis:** The five supplied Codex/product-analysis artifacts and the recorded Codex execution history in this conversation.
>
> **Important:** Where the supplied material describes a planned design rather than an observed implementation, this document labels it as **PLANNED** or **TARGET**. The repository remains the final implementation authority.

---

## 0. ARCHITECTURAL OPERATING CONTRACT

Antigravity MUST treat this file as an architectural constraint, not as permission to redesign the application.

Before changing architecture-sensitive code:

1. Read `MASTER_CONTEXT.md`.
2. Read this file completely.
3. Inspect the actual repository and relevant modules.
4. Determine whether the requested behavior already exists.
5. Prefer additive, backward-compatible changes.
6. Keep domain/simulation logic out of presentation components.
7. Keep API contracts explicit and typed.
8. Preserve legacy flows unless a breaking change is explicitly required.
9. Run focused tests for the modified subsystem before broader regression testing.
10. Do not mark an architectural milestone complete without matching verification evidence.

---

# 1. SYSTEM ARCHITECTURE AT A GLANCE

The intended architecture is a layered integration of an existing disaster-intelligence application with a scenario/simulation layer.

```text
                         EXISTING APPLICATION
                                  │
             ┌────────────────────┴────────────────────┐
             │                                         │
        Frontend                                    Backend
             │                                         │
             │                              ┌──────────┴──────────┐
             │                              │                     │
             │                         Domain / Models      Intelligence
             │                              │                     │
             │                              │          ┌──────────┴──────────┐
             │                              │          │                     │
             │                         Scenario       Evidence          Reasoning
             │                         State          / Signals         / Analysis
             │                              │          │                     │
             │                              └────┬─────┴──────────┬──────────┘
             │                                   │                │
             │                              Simulation       Response Logic
             │                                   │                │
             │                                   └───────┬────────┘
             │                                           │
             └──────────────────────┬────────────────────┘
                                    │
                                 GIS / API
                                    │
                                    ▼
                              Live Demo / SITREP
```

The key conceptual chain is:

```text
Scenario definition
    ↓
Scenario persistence
    ↓
Scenario lifecycle
    ↓
Disaster propagation
    ↓
Expected signal generation
    ↓
Observed-vs-expected analysis
    ↓
Silent-zone assessment
    ↓
Infrastructure + neighboring context
    ↓
Five-cause reasoning
    ↓
Verification / dispatch recommendation
    ↓
GIS + sector status + SITREP
    ↓
Frontend live-demo experience
```

---

# 2. ARCHITECTURAL BOUNDARIES

## 2.1 Scenario / domain layer

**Primary ownership:**

- scenario identity
- disaster type
- origin/location
- severity/profile
- lifecycle status
- scenario timeline/state
- per-sector scenario state
- scenario events
- infrastructure state generated for a scenario
- persisted silent-zone assessments

**Primary repository areas:**

- `backend/app/models/schemas.py`
- `backend/app/models/db.py`

The domain layer should describe and persist state. It should not contain presentation-specific formatting or React/UI behavior.

---

## 2.2 Simulation layer

**Primary ownership:**

- scenario initialization
- disaster-specific propagation
- sector impact evolution
- event generation
- simulation time advancement

**Primary repository areas:**

- `backend/app/simulation/generator.py`
- `backend/app/simulation/clock.py`

The simulation layer should produce scenario state/events. It should not be responsible for deciding how the UI renders those states.

### Disaster behavior contract

The supplied design distinguishes disaster profiles:

```text
Earthquake
    → origin/epicenter-centered impact
    → severity attenuates outward

Flood
    → directional / lowland / downstream style impact
    → flow/path-aware progression

Cyclone
    → directional track / corridor

Hurricane
    → directional track / corridor
```

These are behavioral expectations, not permission to invent unrelated physics or external dependencies.

---

## 2.3 Simulation API layer

**Primary ownership:**

- create scenario
- list scenarios
- retrieve scenario
- start scenario
- advance scenario
- reset scenario
- preserve legacy simulation API behavior

**Primary repository area:**

- `backend/app/routers/simulation.py`

### Target lifecycle API

```text
POST /simulation/scenarios
GET  /simulation/scenarios
GET  /simulation/scenarios/{scenario_id}
POST /simulation/scenarios/{scenario_id}/start
POST /simulation/scenarios/{scenario_id}/advance
POST /simulation/scenarios/{scenario_id}/reset
```

The exact route behavior must be verified against the current repository before changes.

### Backward-compatibility requirement

The legacy simulation endpoints explicitly identified in the supplied material must continue to function:

```text
/simulation/state
/simulation/reset
/simulation/advance
```

Scenario support is an extension of the existing simulation contract, not an automatic replacement.

---

# 3. DATA MODEL ARCHITECTURE

The scenario system introduces a persistent data model around an active disaster event.

## 3.1 Core scenario entities

### `DisasterScenarioDB`

Conceptual responsibility:

- scenario identifier
- disaster type
- origin sector
- severity
- lifecycle state
- start/end metadata

### `SectorScenarioStateDB`

Conceptual responsibility:

- scenario/sector relationship
- current impact level
- silent state
- isolation state
- population risk
- top silence cause

### `InfrastructureStatusDB`

Conceptual responsibility:

- mobile status
- electricity status
- internet status
- road access status
- update time

### `ScenarioEventDB`

Conceptual responsibility:

- timeline events
- spread/impact transitions
- report loss
- verification/recon triggers
- other scenario-driven events

### `SilentZoneAssessmentDB`

Conceptual responsibility:

- expected signal
- observed signal
- silence score
- cause scores
- explanation/context

The source material also proposes optional extensions to `RecommendationLinkDB`, `EvidenceDB`, `HypothesisDB`, and `BaselineDB`.

---

# 4. INTELLIGENCE PIPELINE ARCHITECTURE

The intelligence path should be understood as multiple specialized layers rather than one monolithic “AI” function.

```text
             Scenario State
                  │
                  ▼
       ┌───────────────────────┐
       │ Expected Reality      │
       │ / Baseline Logic      │
       └──────────┬────────────┘
                  │ expected
                  │
                  ▼
       ┌───────────────────────┐
       │ Observed Signals      │
       │ / Evidence            │
       └──────────┬────────────┘
                  │ observed
                  ▼
       ┌───────────────────────┐
       │ Negative Evidence     │
       │ / Silence Scoring     │
       └──────────┬────────────┘
                  │ silence assessment
                  ▼
       ┌───────────────────────┐
       │ Infrastructure +      │
       │ Regional Context      │
       └──────────┬────────────┘
                  │ contextual evidence
                  ▼
       ┌───────────────────────┐
       │ Five-Cause Reasoning  │
       │ + Counterfactuals     │
       └──────────┬────────────┘
                  │ ranked causes
                  ▼
       ┌───────────────────────┐
       │ Verification /        │
       │ Dispatch              │
       └──────────┬────────────┘
                  │ action
                  ▼
             UI / SITREP
```

---

## 4.1 Expected-reality layer

**Primary module:**

- `backend/app/pipeline/expected_reality.py`

Responsibility:

- compute expected signal/activity for a sector under the current scenario
- compare observed behavior with expected behavior
- account for scenario context such as disaster type and impact

The Codex execution added `compute_expected_signal_for_scenario(...)` and upgraded the existing comparison path while keeping the old signature compatible.

**Architectural rule:** Expected-state generation belongs here; UI code must not reconstruct expected values independently.

---

## 4.2 Negative-evidence / silence layer

**Primary module:**

- `backend/app/pipeline/negative_evidence.py`

Responsibility:

- compute a sector-level silence score
- build structured silent-zone assessments
- generate/query scenario silence windows
- persist scenario assessments

Observed Codex symbols include:

```text
compute_sector_silence_score(...)
build_silent_zone_assessment(...)
get_scenario_silence_windows(...)
```

The output is intended to be richer than a Boolean flag.

Conceptually:

```text
expected signal
observed signal
signal gap
silence score
context
explanation
```

### Safety invariant

```text
Silence
≠
Safety
```

No subsystem should convert “no evidence” directly into a safe/green status without supporting evidence.

---

# 5. INFRASTRUCTURE + REGIONAL CONTEXT ARCHITECTURE

**Primary modules:**

- `backend/app/pipeline/blackout_risk.py`
- `backend/app/pipeline/gazetteer.py`

The infrastructure layer enriches silence reasoning with physical/network context.

## 5.1 Infrastructure dimensions

The design explicitly considers:

- mobile connectivity
- internet connectivity
- electricity
- road accessibility
- neighboring-sector connectivity

## 5.2 Neighbor comparison

The intended reasoning pattern is:

```text
Target sector is dark
        │
        ├── nearby sectors also dark
        │      → possible broad regional outage
        │
        └── nearby sectors active
               → stronger evidence for localized failure/isolation
```

The Codex execution added neighbor-distance/location helpers and infrastructure isolation functions.

Observed symbols include:

```text
distance_between_locations_km(...)
get_neighboring_locations(...)
compute_infrastructure_isolation_score(...)
evaluate_neighbor_connectivity_context(...)
build_infrastructure_isolation_context(...)
```

### Boundary rule

Neighbor calculations belong in the backend intelligence layer. Frontend components may display the resulting context but should not become the canonical source of adjacency or isolation calculations.

---

# 6. FIVE-CAUSE REASONING ARCHITECTURE

**Primary modules:**

- `backend/app/pipeline/hypothesis_engine.py`
- `backend/app/pipeline/counterfactual.py`

The five-cause model is the formal reasoning taxonomy required by the product requirements.

```text
1. Communication failure
2. Infrastructure failure
3. Population movement
4. Sensor/data failure
5. Severe local impact
```

## 6.1 Reasoning decomposition

The Codex implementation established a separate scorer per cause and then a combined evaluator.

Observed symbols:

```text
build_silence_cause_priors(...)
score_communication_failure_hypothesis(...)
score_infrastructure_failure_hypothesis(...)
score_population_movement_hypothesis(...)
score_sensor_failure_hypothesis(...)
score_severe_local_impact_hypothesis(...)
evaluate_silent_zone_causes(...)
```

The resulting analysis is expected to provide explainable ranked output, including evidence-for/evidence-against and supporting signal values.

## 6.2 Legacy hypothesis compatibility

A critical Codex architectural decision was to **preserve the legacy hypothesis system**.

The existing H1–H5 semantics were not overwritten because existing tests/pages rely on them. Scenario-aware five-cause reasoning was added as a separate path.

Therefore:

> Do not rename, repurpose, or delete legacy hypothesis semantics merely to make the new scenario model look cleaner.

## 6.3 Counterfactual layer

**Primary module:**

- `backend/app/pipeline/counterfactual.py`

Responsibility:

- test what should be observable if a proposed silence cause were true
- use scenario/infrastructure/sector observations to support or weaken hypotheses

Observed symbol:

```text
evaluate_silence_counterfactuals(...)
```

Conceptual pattern:

```text
Cause hypothesis
      ↓
Expected additional observations
      ↓
Compare with actual context
      ↓
Support / weaken cause
```

---

# 7. AGGREGATION ARCHITECTURE

**Primary module:**

- `backend/app/pipeline/aggregator.py`

The aggregator is the integration point that combines multiple intelligence outputs into sector/location status.

Scenario-aware aggregated status is intended to include fields such as:

- active disaster state
- silence score
- top silence cause
- infrastructure isolation
- recommendation priority

The Codex execution specifically preserved legacy location-status behavior and made scenario context optional through `scenario_id`.

## 7.1 Ranking architecture

A notable implemented correction separates the **displayed score** from the **internal ranking signal**.

The supplied execution history describes:

```text
Displayed score
    → capped at 100

Internal ranking
    → uncapped urgency + scenario priority
```

This avoids misleading ties when a capped score masks differences in urgency.

### Important rule

Do not collapse presentation score and decision/ranking score into one field merely for convenience.

---

# 8. EVIDENCE ARCHITECTURE

**Primary module:**

- `backend/app/pipeline/evidence_model.py`

The product requires multiple evidence streams to coexist under a common reasoning framework.

Target evidence categories include:

- human reports
- police/hospital reports
- telecom/network signals
- infrastructure status
- sensor health
- satellite/remote observations
- neighboring-sector observations

The intended direction is to normalize different evidence types into structured backend representations with reliability/context rather than forcing the frontend to interpret raw source-specific records.

Planned/target functions include:

```text
ingest_infrastructure_evidence(...)
ingest_network_signal_evidence(...)
ingest_sensor_health_evidence(...)
```

These are not recorded as completed in the supplied Codex execution history.

---

# 9. VERIFICATION + RESPONSE ARCHITECTURE

## 9.1 Active verification

**Module:**

- `backend/app/pipeline/active_verification.py`

Responsibility:

- determine what should be observed next
- prioritize dangerous or uncertain silent zones
- translate cause/risk context into verification actions

Target functions:

```text
evaluate_sector_verification_actions(...)
get_ranked_next_best_observations(...)
```

## 9.2 Dispatch

**Module:**

- `backend/app/pipeline/dispatch_engine.py`

Responsibility:

- map diagnosed silence causes to response types
- incorporate disaster type and silence cause into dispatch scoring
- preserve cause-linked mission context

Target functions:

```text
map_silence_cause_to_response_type(...)
calculate_dispatch_recommendations(...)
assign_dispatch_mission(...)
```

Conceptual flow:

```text
Risk + silence cause + exposure + access + resources
                         ↓
                  recommended action
                         ↓
                   mission context
```

---

# 10. API ARCHITECTURE

The API should act as the contract boundary between backend intelligence and frontend presentation.

## 10.1 Scenario APIs

```text
POST   /simulation/scenarios
GET    /simulation/scenarios
GET    /simulation/scenarios/{scenario_id}
POST   /simulation/scenarios/{scenario_id}/start
POST   /simulation/scenarios/{scenario_id}/advance
POST   /simulation/scenarios/{scenario_id}/reset
```

## 10.2 Intelligence APIs

Target/updated endpoints described in the supplied material include:

```text
GET /negative-evidence/scenario/{scenario_id}/assessments
GET /negative-evidence/scenario/{scenario_id}/sector/{sector_id}

GET /hypotheses/scenario/{scenario_id}/sector/{sector_id}/causes
GET /hypotheses/scenario/{scenario_id}/counterfactuals/{sector_id}

GET /blackout-intel/risk-assessment?scenario_id=...
```

The Codex execution explicitly reports the negative-evidence and hypothesis scenario endpoints above as implemented.

## 10.3 Location status APIs

The Codex execution extended location status/ranking routes with an optional `scenario_id` query parameter so scenario intelligence can coexist with existing status behavior.

Do not assume exact response fields solely from this document; inspect the current schemas and route implementations.

---

# 11. GIS BACKEND ARCHITECTURE

**Primary module:**

- `backend/app/routers/gis.py`

Target responsibility:

- expose map-ready scenario telemetry
- expose disaster propagation
- expose silent-zone metadata
- expose infrastructure/context overlays

Target endpoint pattern includes:

```text
GET /gis/telemetry
GET /gis/propagation
```

The GIS API is a **read/transport boundary**. It should not become the location where core simulation, silence scoring, or five-cause inference is recomputed independently.

### Canonical flow

```text
Backend intelligence
        ↓
Scenario-aware status
        ↓
GIS router
        ↓
Typed frontend API client
        ↓
Map renderer
```

---

# 12. SITREP / REPORTING ARCHITECTURE

**Primary backend module:**

- `backend/app/pipeline/sitrep_generator.py`

The SITREP layer consumes scenario/intelligence outputs and converts them into operational narrative.

Target content:

- disaster type
- propagation summary
- affected areas
- silent high-risk zones
- ranked silence causes
- recommended actions
- supervisor/local-authority recommendations

The SITREP is a **consumer** of intelligence, not the source of intelligence calculations.

---

# 13. FRONTEND ARCHITECTURE

The intended UI architecture centers on the GIS page as the unified live-demo canvas.

## 13.1 Central workflow

```text
Homepage / entry
      ↓
Scenario setup
      ↓
GIS live canvas
      ↓
Simulation controls
      ↓
Map propagation
      ↓
Silent-zone selection
      ↓
Sector dossier / detail panel
      ↓
Recommendation
      ↓
SITREP / supporting pages
```

## 13.2 Primary frontend areas

### `frontend/src/app/gis-map/page.tsx`

Owns page-level scenario state and composition of simulation/map/intelligence data.

It should coordinate data; it should not duplicate backend reasoning algorithms.

### `frontend/src/components/SimulationControls.tsx`

Owns user actions such as:

- disaster selection
- scenario start
- advance
- reset
- other scenario controls

### `frontend/src/components/InteractiveVectorMap.tsx`

Owns visualization of:

- disaster propagation
- impact overlays
- silent zones
- infrastructure/context overlays

### `frontend/src/components/ActiveSectorDossier.tsx`

Owns concise sector-focused explanation and response summary.

Expected content includes:

- impact/risk
- likely silence cause
- evidence gap
- recommendation

### `frontend/src/components/SectorDetailPanel.tsx`

Owns deep contextual explanation of:

- expected vs observed
- nearby-region behavior
- silence reasoning

This is the UI location for the core “why is this sector silent?” narrative.

### `frontend/src/components/FloatingCommandBar.tsx`

Supports scenario shortcuts / demo controls.

### `frontend/src/lib/api.ts`

Owns typed communication with backend endpoints.

It should be the canonical frontend API client rather than duplicating fetch logic throughout components.

---

# 14. SUPPORTING FRONTEND PAGES

The broader application should align with the scenario-first story without turning every page into an independent implementation of the reasoning engine.

```text
Home
  → scenario entry

Blackout Intel
  → silent-zone / infrastructure intelligence

Hypotheses
  → five-cause explanation

Dispatch
  → cause-aware action recommendations

SITREP
  → scenario-aware operational summary
```

Primary paths:

- `frontend/src/app/page.tsx`
- `frontend/src/app/blackout-intel/page.tsx`
- `frontend/src/app/hypotheses/page.tsx`
- `frontend/src/app/dispatch/page.tsx`
- `frontend/src/app/sitrep/page.tsx`

---

# 15. CONTRACTS BETWEEN LAYERS

## 15.1 Simulation → Intelligence

Simulation provides:

- active scenario
- sector state
- impact level
- scenario timeline
- generated infrastructure/context where applicable

Intelligence consumes this state to calculate expectations, silence, context, and causes.

## 15.2 Intelligence → Aggregation

Intelligence provides:

- expected/observed gap
- silence score
- cause ranking
- isolation/context
- recommendation priority

Aggregation turns these into sector/location status.

## 15.3 Aggregation / Intelligence → APIs

Routers expose structured, typed payloads. They should not reproduce business calculations that belong in pipeline modules.

## 15.4 APIs → Frontend

The frontend consumes typed API contracts and focuses on state, interaction, and rendering.

## 15.5 Intelligence → Response

Verification/dispatch converts analytical conclusions into operational next steps while preserving the reason for the recommendation.

---

# 16. BACKWARD-COMPATIBILITY ARCHITECTURE

This is a protected design principle.

The Codex implementation repeatedly used additive evolution:

```text
Legacy behavior
      │
      ├── keep working
      │
      └── scenario-aware extension
```

Established examples from the supplied execution history:

1. Expected/observed comparison was upgraded while keeping old-call compatibility.
2. Scenario five-cause reasoning was added without destroying legacy H1–H5 semantics.
3. Blackout responses gained optional infrastructure context.
4. Location status gained optional scenario-aware fields using `scenario_id`.

Therefore:

> A refactor is not automatically justified merely because an alternative architecture is cleaner.

Any breaking change must be explicitly required, tested, and documented.

---

# 17. LEGACY VS SCENARIO-AWARE PATHS

The target architecture is best thought of as two compatible modes sharing infrastructure where safe.

```text
                 EXISTING / LEGACY PATH
                         │
                         ├── old simulation
                         ├── old hypotheses
                         ├── existing pages
                         └── existing APIs

                         +

                 SCENARIO-AWARE PATH
                         │
                         ├── scenario lifecycle
                         ├── multi-disaster simulation
                         ├── scenario silence
                         ├── five-cause reasoning
                         ├── infrastructure context
                         └── scenario response
```

They should converge only where contracts are intentionally shared.

---

# 18. TEST ARCHITECTURE

Testing should follow the same layer boundaries.

```text
Unit tests
    ↓
Subsystem tests
    ↓
API contract tests
    ↓
Integration tests
    ↓
Full backend regression
    ↓
Frontend build/lint
    ↓
End-to-end demo walkthrough
```

Relevant test areas identified by the supplied material include:

- scenario lifecycle
- disaster propagation
- negative evidence
- five-cause hypotheses/counterfactuals
- blackout/infrastructure context
- aggregation/ranking
- dispatch mapping
- GIS overlays
- SITREP scenarios
- frontend API contracts
- regression behavior

### Required architectural invariants

At minimum, tests should protect these invariants:

```text
A silent sector cannot be automatically classified as safe.

Legacy simulation endpoints remain functional.

Legacy hypothesis semantics remain functional.

Scenario-aware outputs do not require scenario mode when legacy mode is being used.

Cause-aware recommendations remain linked to the underlying diagnosis.

Frontend consumes backend contracts rather than reimplementing core reasoning.
```

---

# 19. CURRENT IMPLEMENTATION STATE RELEVANT TO ARCHITECTURE

Based on the supplied Codex execution history:

## Implemented and reported as verified

- Milestone 4 — expected vs observed silence intelligence
- Milestone 5 — infrastructure context and isolation logic
- Milestone 6 — five-cause silence reasoning + counterfactual support

Reported full backend test results at those checkpoints:

```text
After Milestone 4 → 102 passed, 2 warnings
After Milestone 6 → 105 passed, 2 warnings
After Milestone 5 → 109 passed, 2 warnings
```

These are historical execution claims from Codex and should be re-run when continuing from the current repository state.

## Implemented, but not fully verified in the supplied history

### Milestone 7 — scenario-aware aggregation/status

Implemented areas included:

- schema extensions
- aggregator scenario fields
- scenario-aware verification ranking
- location status API support
- ranking tie-break correction

Focused tests were reported passing after the ranking fix.

The subsequent full backend regression command was started, but the supplied history reports a usage-limit interruption before a final result was obtained.

Therefore:

```text
Milestone 7
implementation → reported complete enough to continue
focused verification → PASS
full regression → NOT CONFIRMED
```

Do not mark M7 fully verified without rerunning the full suite.

---

# 20. ARCHITECTURAL ANTI-PATTERNS TO AVOID

Antigravity should stop and reconsider if a proposed change would do any of the following without explicit justification:

### A. Rebuild the existing platform

Wrong direction:

```text
new architecture
    ↓
rewrite existing application
```

Preferred:

```text
existing architecture
    ↓
extend targeted boundaries
```

### B. Put business logic in React components

Do not implement silence scoring, cause ranking, adjacency calculations, or dispatch decisions inside UI components.

### C. Duplicate intelligence calculations in multiple routers/pages

One canonical backend module should own each reasoning function.

### D. Convert silence to safety

Any branch equivalent to:

```text
observed == 0 → safe
```

is architecturally invalid without supporting evidence.

### E. Destroy legacy semantics to make the new scenario model cleaner

Especially avoid repurposing established hypothesis identifiers or legacy API responses without explicit migration work.

### F. Hide decision provenance

Recommendations must retain enough cause/context information to explain why an action was selected.

### G. Treat capped UI scores as canonical decision values

The implemented aggregation correction demonstrates why presentation scores and internal urgency/ranking signals may need to remain distinct.

---

# 21. ARCHITECTURAL CHANGE PROTOCOL

When Antigravity needs to change a core subsystem:

```text
1. Identify current owner of the behavior
2. Inspect existing tests/contracts
3. Identify legacy consumers
4. Identify scenario-aware consumers
5. Define smallest safe change
6. Implement additively where possible
7. Run focused tests
8. Run affected API/integration tests
9. Run full regression when appropriate
10. Update project-state documentation
```

If a proposed change breaks an established contract, the agent must explicitly document:

- what breaks
- why the break is required
- which consumers are affected
- migration/compatibility strategy
- tests proving the new behavior

---

# 22. ARCHITECTURAL NORTH STAR

The integrated product should ultimately behave as one coherent pipeline:

```text
USER
 │
 │ selects disaster / scenario
 ▼
SCENARIO DOMAIN
 │
 ▼
SIMULATION ENGINE
 │
 ▼
SECTOR IMPACT + INFRASTRUCTURE STATE
 │
 ▼
EXPECTED vs OBSERVED
 │
 ▼
SILENCE ASSESSMENT
 │
 ▼
REGIONAL / NEIGHBOR CONTEXT
 │
 ▼
5-CAUSE REASONING + COUNTERFACTUALS
 │
 ▼
VERIFICATION / DISPATCH
 │
 ▼
GIS + STATUS + SITREP
 │
 ▼
USER SEES

"This region is silent,
this is why it is suspicious,
and this is what should happen next."
```

The product's central architectural goal is therefore not merely to simulate disasters. It is to **connect simulated impact, missing information, contextual reasoning, and response action into one traceable chain** while preserving the original platform.

---

# 23. CONTINUATION RULE FOR ANTIGRAVITY

When starting a new implementation task, use this architecture as the structural guide:

```text
Read MASTER_CONTEXT.md
        ↓
Read ARCHITECTURE.md
        ↓
Inspect current repository
        ↓
Locate existing implementation
        ↓
Confirm owner / boundary
        ↓
Make smallest safe change
        ↓
Test affected layer
        ↓
Test contracts across boundaries
        ↓
Update CURRENT_STATE.md / CHANGE_LOG.md
```

Never treat the architecture document as proof that a symbol or file still exists. **Verify against the repository.**
