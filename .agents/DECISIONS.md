# DECISIONS — Architectural Decision Record / Institutional Memory

> **Purpose:** Preserve the durable architectural and implementation decisions established during the Codex planning/execution phase so a new agent does not repeatedly reconsider already-settled choices.
>
> **Decision discipline:** This document records decisions actually supported by the supplied project material. A proposed design that was never adopted is not promoted to `LOCKED`.
>
> **Companion files:** `MASTER_CONTEXT.md`, `ARCHITECTURE.md`, `DEVELOPMENT_PLAN.md`, `INTEGRATION_MAP.md`, `MILESTONES.md`, `TEST_STRATEGY.md`, `API_CONTRACTS.md`, `DATA_AND_SCHEMA.md`, `AGENT_INSTRUCTIONS.md`, `CURRENT_STATE.md`, `CHANGE_LOG.md`.
>
> **Status vocabulary:**
> - `LOCKED` — must not be changed casually; changing it requires explicit architectural justification.
> - `ADOPTED` — implementation direction was chosen and should be preserved unless repository evidence requires revision.
> - `COMPATIBILITY` — behavior exists primarily to preserve legacy consumers.
> - `PROPOSED` — planning idea; not yet a durable decision.
> - `OPEN` — exact decision remains repository-dependent or unresolved.

---

# 0. DECISION REGISTER

| ID | Decision | Status |
|---|---|---|
| ADR-001 | Treat the project as an incremental integration, not a greenfield rewrite | LOCKED |
| ADR-002 | Preserve legacy behavior through additive scenario-aware extensions | LOCKED |
| ADR-003 | Scenario becomes a first-class domain concept | ADOPTED |
| ADR-004 | Support four initial disaster modes with distinct propagation semantics | LOCKED PRODUCT CONTRACT |
| ADR-005 | Preserve the core invariant: silence is not safety | LOCKED PRODUCT/SAFETY SEMANTIC |
| ADR-006 | Keep expected, observed, historical, and derived silence concepts separate | LOCKED |
| ADR-007 | Interpret silence using infrastructure and neighboring-sector context | ADOPTED |
| ADR-008 | Use five explicit silence-cause categories | LOCKED PRODUCT CONTRACT |
| ADR-009 | Add five-cause reasoning beside legacy H1-H5 semantics | LOCKED COMPATIBILITY DECISION |
| ADR-010 | Use counterfactual reasoning to support/weaken causes rather than replace the cause model | ADOPTED |
| ADR-011 | Keep backend authoritative for simulation/intelligence; frontend renders/orchestrates | LOCKED |
| ADR-012 | Prefer additive/optional API evolution over breaking legacy contracts | LOCKED |
| ADR-013 | Keep business logic in owning backend modules, not routers/UI | LOCKED |
| ADR-014 | Keep displayed urgency score distinct from internal ranking signal | ADOPTED |
| ADR-015 | Require focused verification and broader regression according to change surface | LOCKED |
| ADR-016 | Never claim verification that was not actually run | LOCKED |
| ADR-017 | Preserve deterministic/seeded demo behavior where practical | ADOPTED |
| ADR-018 | Use persistent project-memory files as durable agent context | LOCKED FOR AGENT WORKFLOW |
| ADR-019 | Treat current repository truth as higher priority than historical documentation | LOCKED FOR AGENT WORKFLOW |
| ADR-020 | Do not create duplicate representations when an existing model safely supports the concept | LOCKED |
| ADR-021 | Keep M7 as partially verified until full regression succeeds | LOCKED CURRENT-STATE RULE |
| ADR-022 | Complete M7 verification before moving into M8 unless a concrete blocker changes the dependency | ADOPTED CURRENT NEXT STEP |

---

# 1. ADR-001 — INCREMENTAL INTEGRATION, NOT GREENFIELD REWRITE

## Status

`LOCKED`

## Decision

The existing disaster situational-awareness platform is the **host system**.

The new work is an integration/extension effort.

## Context

The project was originally built by someone else. The current objective is to add simulation/engine capabilities and connect them to the existing platform.

The supplied planning material repeatedly frames the work as extending the existing system rather than rebuilding it.

## Consequences

The agent should prefer:

```text
existing subsystem
      +
new capability
```

over:

```text
rewrite existing subsystem
```

## Rejected alternative

A broad rewrite justified by “cleaner architecture” is rejected unless the current implementation demonstrably blocks the required behavior.

## Rule

A redesign requires explicit justification:

```text
current design limitation
+
impact
+
alternative options
+
migration/compatibility plan
```

---

# 2. ADR-002 — ADDITIVE BACKWARD-COMPATIBLE EXTENSIONS

## Status

`LOCKED`

## Decision

Where practical, new scenario functionality must be introduced **additively**.

Preferred patterns:

```text
existing API
+
optional scenario_id
```

or:

```text
legacy behavior
+
new scenario-specific endpoint/path
```

## Evidence from Codex execution

The following examples were explicitly implemented with compatibility in mind:

- `compare_observed_vs_expected(...)` retained old-call compatibility;
- scenario-aware hypothesis analysis was added without redefining legacy H1-H5;
- `BlackoutRiskAssessment` received optional infrastructure context;
- location status received optional scenario-aware behavior.

## Consequences

This reduces regression risk and allows existing pages/consumers to survive while the scenario workflow is introduced.

## Rejected alternative

Breaking all existing contracts and migrating the whole application in one step.

---

# 3. ADR-003 — SCENARIO AS A FIRST-CLASS DOMAIN CONCEPT

## Status

`ADOPTED`

## Decision

A disaster scenario is represented as a persistent domain concept rather than merely a frontend mode or label.

Core entities identified by the supplied material:

```text
DisasterScenarioDB
SectorScenarioStateDB
InfrastructureStatusDB
ScenarioEventDB
SilentZoneAssessmentDB
```

## Context

The simulation needs:

- lifecycle;
- time;
- propagation;
- per-sector state;
- scenario-specific infrastructure effects;
- scenario-specific silence assessments.

## Consequences

Scenario identity should be propagated through the backend where scenario-aware calculations are required.

The frontend should not invent a separate scenario state model that competes with the backend.

---

# 4. ADR-004 — FOUR INITIAL DISASTER TYPES WITH DISTINCT PROPAGATION

## Status

`LOCKED PRODUCT CONTRACT`

## Decision

Initial scenario selector must support:

```text
flood
earthquake
cyclone
hurricane
```

These are not simple labels; they imply distinct simulation behavior.

## Propagation semantics

### Earthquake

Epicenter/origin-centered behavior with radial/severity attenuation.

### Flood

Directional, lowland/downstream/flow-path behavior.

### Cyclone

Directional track/corridor behavior.

### Hurricane

Directional track/corridor behavior.

## Rejected alternative

A single generic random-impact generator with only the disaster label changed.

## Consequence

Simulation logic must branch by disaster semantics at the simulation layer.

---

# 5. ADR-005 — SILENCE IS NOT SAFETY

## Status

`LOCKED PRODUCT/SAFETY SEMANTIC`

## Decision

The absence of reports/telemetry must never by itself be interpreted as evidence that a sector is safe.

Formally:

```text
no reports ≠ safe
zero observed signal ≠ zero impact
missing telemetry ≠ no disaster
```

## Context

This is the central product thesis identified in the supplied boss interpretation and repeatedly preserved through implementation.

## Consequences

Every layer must respect it:

```text
database
backend
reasoning
API
frontend
dispatch
SITREP
```

## Rejected alternative

Binary logic such as:

```text
no incident/report
→ safe
```

---

# 6. ADR-006 — SEPARATE EXPECTED, OBSERVED, HISTORICAL, AND DERIVED STATE

## Status

`LOCKED`

## Decision

These concepts are distinct:

```text
historical
expected
observed
silence/derived assessment
```

They must not be collapsed into one generic signal/risk field.

## Context

The product explicitly asks for previous/historical, expected, and observed information.

Scenario-aware expected signal is then computed and compared against observed behavior.

## Consequences

The conceptual chain remains:

```text
historical baseline
+
scenario context
        ↓
expected

observed
        ↓
expected-vs-observed gap
        ↓
silence assessment
```

## Rejected alternative

Treating scenario-generated expectations as historical truth.

---

# 7. ADR-007 — SPATIAL / INFRASTRUCTURE CONTEXT IS PART OF SILENCE INTERPRETATION

## Status

`ADOPTED`

## Decision

A silent sector must be interpreted using contextual evidence such as:

```text
mobile
internet
power
road access
neighboring-sector activity
```

## Context

The boss requirement explicitly calls for nearby-region and tower/network context.

The Codex implementation added:

```text
distance_between_locations_km(...)
get_neighboring_locations(...)

compute_infrastructure_isolation_score(...)
evaluate_neighbor_connectivity_context(...)
build_infrastructure_isolation_context(...)
```

## Consequence

The same observed silence can mean different things depending on whether neighboring regions remain active.

---

# 8. ADR-008 — FIVE SILENCE CAUSES ARE THE PRODUCT TAXONOMY

## Status

`LOCKED PRODUCT CONTRACT`

## Decision

Scenario-aware silence reasoning must use these five categories:

```text
1. communication failure
2. infrastructure failure
3. population movement
4. sensor/data failure
5. severe local impact
```

## Context

These categories were explicitly identified in the boss-derived requirements and then implemented as separate scenario-aware scorers.

## Consequence

New agents must preserve these semantic categories even if internal class/function names change.

## Rejected alternative

Replacing the five categories with a generic “unknown cause” classifier without preserving the required taxonomy.

---

# 9. ADR-009 — PRESERVE LEGACY H1-H5; ADD SCENARIO FIVE-CAUSE REASONING

## Status

`LOCKED COMPATIBILITY DECISION`

## Decision

The scenario five-cause model is an additional reasoning path, not a reason to overwrite the existing legacy H1-H5 semantics.

## Context

Codex explicitly observed that legacy H1 currently represents “area safe” and that existing tests/pages depend on the old semantics.

## Adopted structure

```text
legacy hypothesis system
        +
scenario-aware five-cause reasoning
```

## Rejected alternative

Renaming/reinterpreting the existing legacy H1-H5 hypotheses just to make them match the new scenario taxonomy.

## Consequence

Any future consolidation requires proof that all legacy consumers are migrated safely.

---

# 10. ADR-010 — COUNTERFACTUALS SUPPORT REASONING; THEY DO NOT REPLACE IT

## Status

`ADOPTED`

## Decision

Counterfactual analysis should evaluate:

```text
“If cause X is true,
what else should we observe?”
```

and use the comparison to support or weaken a cause.

## Implemented concept

```text
evaluate_silence_counterfactuals(...)
```

## Consequence

Counterfactuals enhance explainability and hypothesis confidence.

They are not a separate replacement for the five-cause evaluation.

---

# 11. ADR-011 — BACKEND IS AUTHORITATIVE FOR SIMULATION AND INTELLIGENCE

## Status

`LOCKED`

## Decision

The backend is authoritative for:

```text
scenario lifecycle
disaster propagation
expected signal
silence scoring
infrastructure isolation
cause reasoning
counterfactuals
aggregation
verification
dispatch
SITREP
```

The frontend:

```text
renders
orchestrates
requests
displays
```

## Rejected alternative

Implementing business logic independently in React components.

## Consequence

Frontend components must consume authoritative API output instead of recreating backend reasoning.

---

# 12. ADR-012 — ADDITIVE API EVOLUTION

## Status

`LOCKED`

## Decision

Preserve legacy contracts where possible by:

```text
optional scenario context
new scenario-specific endpoints
additive response fields
```

## Protected legacy routes

```text
/simulation/state
/simulation/reset
/simulation/advance
```

## Consequences

Changes to shared response schemas require consumer and regression analysis.

---

# 13. ADR-013 — KEEP BUSINESS LOGIC IN ITS OWNING MODULE

## Status

`LOCKED`

## Decision

Use clear ownership boundaries.

```text
simulation propagation
    → simulation/generator.py

expected signal
    → expected_reality.py

silence scoring
    → negative_evidence.py

infrastructure isolation
    → blackout_risk.py

neighbor relationships
    → gazetteer.py

five-cause reasoning
    → hypothesis_engine.py

counterfactuals
    → counterfactual.py

aggregation
    → aggregator.py

verification
    → active_verification.py

dispatch
    → dispatch_engine.py

report generation
    → sitrep_generator.py

visual rendering
    → frontend
```

## Rejected alternative

Putting domain logic into:

```text
routers
React components
page-level handlers
```

because those locations are convenient.

## Consequence

This keeps testing, reuse, and reasoning traceability manageable.

---

# 14. ADR-014 — DISPLAY SCORE VS INTERNAL RANKING

## Status

`ADOPTED`

## Decision

The M7 aggregation implementation deliberately separates:

```text
displayed score
```

from:

```text
internal ranking signal
```

The displayed value may remain capped, while internal urgency remains available for ranking and scenario priority can break ties.

## Context

Codex found that a high-population no-report sector could tie with a scenario-hit sector after score capping.

## Adopted behavior

```text
display
→ capped presentation value

ranking
→ uncapped urgency + scenario priority
```

## Consequence

Do not collapse these values casually.

---

# 15. ADR-015 — VERIFICATION GATES SCALE WITH CHANGE SURFACE

## Status

`LOCKED`

## Decision

Validation is staged:

```text
static/import/startup
        ↓
focused tests
        ↓
contract/integration tests
        ↓
broader regression
        ↓
manual user-flow validation
```

The broader the modified surface, the stronger the required regression.

## Consequence

A shared schema/router/pipeline change should not be considered safe merely because one unit test passes.

---

# 16. ADR-016 — NEVER OVERCLAIM VERIFICATION

## Status

`LOCKED`

## Decision

Agent reports must distinguish:

```text
implemented
focused verified
fully verified
partially verified
interrupted
unconfirmed
```

## Historical example

M7 focused tests passed, but the full backend run was interrupted.

Therefore:

```text
M7 = implemented + focused verified
```

not:

```text
M7 = fully verified
```

## Consequence

Future agents must not “upgrade” historical status without running the missing verification.

---

# 17. ADR-017 — PRESERVE SEEDED / DETERMINISTIC DEMO BEHAVIOR WHERE PRACTICAL

## Status

`ADOPTED`

## Decision

New scenario simulation should preserve the current seeded/demo-compatible flow where practical.

## Context

The task board explicitly calls for coexistence with the legacy seeded flow.

## Consequence

The system can remain reproducible and demo-safe while adding configurable scenario behavior.

## Rejected alternative

Replacing the old deterministic demo path wholesale with uncontrolled stochastic behavior.

---

# 18. ADR-018 — PERSISTENT PROJECT-MEMORY FILES ARE DURABLE AGENT CONTEXT

## Status

`LOCKED FOR AGENT WORKFLOW`

## Decision

The `.md` handoff system is the durable context layer replacing dependence on one agent's chat memory.

The intended stack is:

```text
MASTER_CONTEXT.md
ARCHITECTURE.md
DEVELOPMENT_PLAN.md
INTEGRATION_MAP.md
DECISIONS.md
MILESTONES.md
TEST_STRATEGY.md
API_CONTRACTS.md
DATA_AND_SCHEMA.md
AGENT_INSTRUCTIONS.md
CURRENT_STATE.md
CHANGE_LOG.md
```

## Context

The project is being transferred from Codex to Antigravity.

## Consequence

A new agent should reconstruct state from these documents plus the repository, rather than requiring the original Codex conversation.

---

# 19. ADR-019 — CURRENT REPOSITORY TRUTH OUTRANKS HISTORICAL DOCUMENTATION

## Status

`LOCKED FOR AGENT WORKFLOW`

## Decision

When documentation and the actual repository disagree:

```text
inspect current code
inspect current tests
determine current truth
update checkpoint/history
```

Do not blindly recreate historical code.

## Consequence

The handoff documents are durable memory, not an excuse to ignore repository evolution.

---

# 20. ADR-020 — AVOID DUPLICATE REPRESENTATIONS OF THE SAME CONCEPT

## Status

`LOCKED`

## Decision

Before creating a new table/function/component/contract, ask:

> Does the current repository already represent this concept safely?

## Examples

Do not automatically create:

```text
a second scenario store
a second neighbor engine
a second silence scorer
a second API type definition
a second recommendation mapper
```

when an existing representation can be extended safely.

## Consequence

The system should converge toward one authoritative representation per business concept.

---

# 21. ADR-021 — M7 REMAINS PARTIALLY VERIFIED

## Status

`LOCKED CURRENT-STATE RULE`

## Decision

Until a full backend regression run succeeds on the current repository:

```text
M7
= IMPLEMENTED
+ FOCUSED VERIFIED
+ FULL REGRESSION UNCONFIRMED
```

## Context

The final full-suite M7 command was interrupted by the Codex usage limit.

## Consequence

Do not state that the full backend suite is green at M7.

---

# 22. ADR-022 — VERIFY M7 BEFORE M8

## Status

`ADOPTED CURRENT NEXT STEP`

## Decision

The immediate safe continuation is:

```text
M7 full backend regression
        ↓
if green
        ↓
M8 Evidence + Recommendation Integration
```

If M7 regression fails:

```text
stop
diagnose
fix/document
rerun
```

## Reason

M8 consumes shared aggregation/status behavior, so moving forward with an unverified shared layer increases regression risk.

---

# 23. LOCKED VS CONFIGURABLE

## 23.1 LOCKED PRODUCT/SEMANTIC ITEMS

```text
silence is not safety

five silence-cause categories

four initial disaster types

distinct disaster propagation semantics

legacy behavior must not be casually broken

legacy H1-H5 semantics must be preserved

backend remains authoritative for intelligence

frontend must not recreate domain reasoning
```

## 23.2 CONFIGURABLE / IMPLEMENTATION-LEVEL ITEMS

The supplied material does not require these to have one immutable implementation:

```text
exact scenario parameter names
exact enum spelling
exact database indexing strategy
exact serialization structure
exact scoring formula implementation
exact counterfactual persistence
exact neighbor-distance threshold
exact UI styling/layout
exact internal class/function decomposition
```

These may evolve when repository evidence or implementation needs justify the change.

---

# 24. REJECTED / DISCOURAGED APPROACHES REGISTER

The following approaches are not supported by the project direction:

### Rewrite the original platform

Rejected because the requested work is integration.

### Treat disaster type as a cosmetic label

Rejected because each disaster requires different propagation behavior.

### Treat no reports as safety

Explicitly rejected by the product thesis.

### Replace legacy H1-H5

Rejected because existing consumers depend on legacy semantics.

### Put reasoning in React

Rejected because backend is authoritative.

### Duplicate logic between backend and frontend

Rejected because it creates divergent truth.

### Mark a milestone complete merely because code was edited

Rejected because verification is required.

### Claim a full regression pass after an interrupted run

Explicitly rejected.

### Rebuild already implemented milestones

Rejected unless current repository inspection proves the previous implementation is missing or invalid.

---

# 25. DECISION CHANGE PROTOCOL

A `LOCKED` decision should not be changed casually.

Before proposing a change:

```text
1. Identify the existing decision.
2. Explain why it blocks or harms the current requirement.
3. Inspect all affected consumers.
4. Identify alternatives.
5. Compare compatibility impact.
6. Define migration strategy.
7. Update this ADR entry.
8. Update architecture/contracts/state as necessary.
9. Run affected tests.
```

Do not silently change a locked decision in code.

---

# 26. DECISION RECORD FORMAT FOR FUTURE AGENTS

New decisions should use:

```text
## ADR-XXX — TITLE

Status:
PROPOSED / ADOPTED / LOCKED / SUPERSEDED

Context:
Why this decision is needed.

Decision:
What was chosen.

Alternatives:
What was considered/rejected.

Consequences:
What this choice changes.

Compatibility:
What legacy behavior is affected.

Verification:
What proves the decision works.

Supersedes:
Earlier ADR, if applicable.
```

---

# 27. CURRENT DECISION SUMMARY FOR ANTIGRAVITY

When beginning work, assume:

```text
THE PROJECT IS AN INTEGRATION
NOT A REWRITE

SCENARIO IS FIRST-CLASS

FOUR INITIAL DISASTERS ARE REQUIRED

PROPAGATION MUST BE DISASTER-SPECIFIC

SILENCE ≠ SAFETY

EXPECTED ≠ OBSERVED ≠ HISTORICAL

INFRASTRUCTURE + NEIGHBORS MATTER

FIVE CAUSES ARE FIXED SEMANTIC CATEGORIES

LEGACY H1-H5 MUST SURVIVE

BACKEND OWNS INTELLIGENCE

FRONTEND CONSUMES AUTHORITATIVE RESULTS

APIs SHOULD EVOLVE ADDITIVELY

BUSINESS LOGIC STAYS IN ITS OWNING MODULE

VERIFICATION STATUS MUST BE TRUTHFUL

M7 FULL REGRESSION IS STILL PENDING
```

---

# 28. FINAL DECISION PRINCIPLE

The project's architecture should change only when the evidence requires it.

The default posture is:

```text
preserve
      ↓
extend
      ↓
verify
      ↓
document
```

not:

```text
replace
      ↓
refactor broadly
      ↓
hope regression is acceptable
```

These decisions exist to make the project **transferable between coding agents without losing the engineering reasoning accumulated by the previous agent**.
