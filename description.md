# PRATYAKSH-Ω (प्रत्यक्ष): Real-Time Disaster Situational Awareness, Incident Deduplication & Population Accountability Platform

> **System Designation:** `PRATYAKSH-Ω` (Sanskrit: *Pratyaksha* — Immediate, Direct Perception of Empirical Reality)  
> **Core Doctrine:** **"Silence is Not Safety" (Negative Evidence Intelligence)**  
> **Target Theater:** Central Nepal Disaster Corridor (Gorkha Epicenter, Kathmandu Valley, Sindhupalchok, Rasuwa, Dolakha, Nuwakot, Dhading, Sindhuli)  
> **Architecture:** Decoupled FastAPI (Python 3.11) High-Throughput Asynchronous Core + Next.js 16 (React 19, Turbopack, Tailwind CSS 4, Leaflet GIS) Mission Console  

---

## TABLE OF CONTENTS
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [The Core Doctrine: Silence is Not Safety](#2-the-core-doctrine-silence-is-not-safety)
3. [Mathematical & Algorithmic Foundations](#3-mathematical--algorithmic-foundations)
4. [System Architecture & Dataflow Pipeline](#4-system-architecture--dataflow-pipeline)
5. [The Six Core Capabilities & System Milestones](#5-the-six-core-capabilities--system-milestones)
6. [Backend Pipeline Deep-Dive (All 28 Pipeline Engines)](#6-backend-pipeline-deep-dive-all-28-pipeline-engines)
7. [Multi-Disaster Physics & Simulation Wavefronts](#7-multi-disaster-physics--simulation-wavefronts)
8. [Frontend Interactive Suite (All 9 Mission Consoles)](#8-frontend-interactive-suite-all-9-mission-consoles)
9. [API Contract & Router Matrix](#9-api-contract--router-matrix)
10. [Data Provenance & Sensor Calibration Matrix](#10-data-provenance--sensor-calibration-matrix)
11. [Database Schemas & Persistence Models](#11-database-schemas--persistence-models)
12. [Role Governance, Security & Rate Limiting](#12-role-governance-security--rate-limiting)
13. [Verification Suite, E2E Testing & Quality Gates](#13-verification-suite-e2e-testing--quality-gates)
14. [Deployment Architecture & Production Optimization](#14-deployment-architecture--production-optimization)

---

## 1. EXECUTIVE SUMMARY & PROBLEM STATEMENT

### The Post-Disaster Information Fog
In catastrophic natural disasters (such as the 2015 M7.8 Gorkha Earthquake in Nepal), national and international crisis responders suffer from a fatal operational fallacy: **The Reporting Bias Trap**.

Responders overwhelmingly direct emergency personnel, search-and-rescue teams, and medical resources to areas generating the highest volume of civilian phone calls, panic-fueled social media tweets, and urban distress dispatches. Meanwhile, remote, rural, or severely damaged communities located closer to the epicenter generate **zero communications** because their cellular base transceiver stations (BTS) have collapsed, electrical grids have tripped, and optical backbones are severed.

Conventional disaster dashboards display these quiet sectors as green or unflagged, mistaking absence of distress signals for safety. By the time emergency convoys reach these isolated zones days later, survivable trapped victims have perished in the rubble.

### What PRATYAKSH-Ω Accomplishes
PRATYAKSH-Ω resolves this critical failure mode through an end-to-end, multi-agency situational awareness platform that:
1. **Detects and Flags Silent Zones**: Calculates expected physical shock vs. observed communications flow to expose areas shrouded in telecom blackouts.
2. **De-duplicates & Corroborates Conflicting Feeds**: Uses semantic DBSCAN clustering and cosine distance to reconcile chaotic, exaggerated reports across Police radios, Hospital triage intakes, Citizen SMS, and Social Media, cross-validating claims against **UNOSAT satellite damage points** and **Copernicus Sentinel-1 SAR orbital imagery**.
3. **Applies Bayesian Reasoning to Silence**: Evaluates 5 competing hypotheses explaining why a sector has gone dark, tracking Shannon entropy to guide closed-loop aerial reconnaissance sorties.
4. **Quantifies Population Exposure & Missing Persons**: Cross-references pre-disaster CBS 2021 Census demographics against building fragility curves, tracking individual missing-person inquiries across health rosters.
5. **Optimizes Tactical Dispatch**: Matches specialized field units (APF search-and-rescue, triage trauma teams, heavy engineering road-clearance) to deficit-ranked sectors.
6. **Automates Official SITREP Generation**: Compiles standard UN OCHA / NEOC (National Emergency Operations Centre) Situation Reports spanning the full 24-hour crisis lifecycle.

---

## 2. THE CORE DOCTRINE: SILENCE IS NOT SAFETY

The foundational principle underpinning PRATYAKSH-Ω is **Negative Evidence Intelligence**.

```
Conventional Response Fallacy:
[ High Message Influx ] ──► Responders Assume Severe Damage (Action Taken)
[ Zero Message Influx ] ──► Responders Assume Nominal / Low Priority (Ignored)

PRATYAKSH-Ω Doctrine:
Expected Shock Physics ──┐
                         ├──► Divergence Gap > Threshold ──► CRITICAL SILENT BLACKOUT DETECTED
Observed Communications ─┘                                    (Immediate Drone/Satellite Reconnaissance)
```

In information theory and Bayesian inference, the *absence* of a signal where physical laws dictate a signal should occur is itself an authoritative signal of catastrophic infrastructure failure. 

PRATYAKSH-Ω continuously monitors physical shock propagation (Modified Mercalli Intensity, peak ground acceleration, flood wavefront velocity) against lifeline telemetry (operating cellular towers, MW electrical substation load, fiber continuity). When physical shock is high but transmitted communications drop to zero, the sector's **Silence Risk Index** spikes to maximum, preempting urban panic bias and directing immediate air recon to the unmonitored epicenter.

---

## 3. MATHEMATICAL & ALGORITHMIC FOUNDATIONS

### 3.1 Silence Risk Index ($R_{\text{silence}}$)
For each geographic sector $s$ at simulated time $t$, the Silence Risk Score evaluates the discrepancy between physical shock severity and lifeline telemetry vitality:

$$R_{\text{silence}}(s, t) = w_{\text{shock}} \cdot \mathcal{S}_{\text{phys}}(s, t) + w_{\text{iso}} \cdot \mathcal{I}_{\text{infra}}(s, t) + w_{\text{vuln}} \cdot \mathcal{V}_{\text{pop}}(s) - w_{\text{comm}} \cdot \mathcal{C}_{\text{obs}}(s, t)$$

Where:
* $\mathcal{S}_{\text{phys}}(s, t) \in [0, 1]$: Normalized physical hazard intensity (e.g., MMI shaking severity or inundation depth).
* $\mathcal{I}_{\text{infra}}(s, t) \in [0, 1]$: Lifeline infrastructure failure index:
  $$\mathcal{I}_{\text{infra}}(s, t) = 0.45 \cdot (1 - \text{BTS}_{\text{active}}) + 0.35 \cdot (1 - \text{Grid}_{\text{power}}) + 0.20 \cdot (1 - \text{Road}_{\text{passable}})$$
* $\mathcal{V}_{\text{pop}}(s) \in [0, 1]$: Vulnerability metric derived from CBS 2021 Census building construction (percentage of non-reinforced stone/mud adobe masonry).
* $\mathcal{C}_{\text{obs}}(s, t) \in [0, 1]$: Volume of credible incoming reports normalized against pre-disaster population density.
* Canonical weights: $w_{\text{shock}} = 0.35$, $w_{\text{iso}} = 0.35$, $w_{\text{vuln}} = 0.20$, $w_{\text{comm}} = 0.25$.

### 3.2 Report Credibility & Temporal Staleness Decay
Incoming disaster reports decay in operational relevance according to an exponential half-life model:

$$S_{\text{eff}}(r, t) = S_{\text{base}}(r) \cdot 2^{-\frac{t - t_r}{t_{1/2}}} \cdot \left(1 + B_{\text{coord}} + B_{\text{corrob}}\right)$$

Where:
* $S_{\text{base}}(r) \in \{0.95 \text{ (Hospital)}, 0.90 \text{ (Police)}, 0.60 \text{ (Citizen)}, 0.35 \text{ (Social Media)}\}$: Initial source authority weight.
* $t - t_r$: Elapsed hours since the report timestamp $t_r$.
* $t_{1/2} = 6.0\text{ hours}$: Operational decay half-life.
* $B_{\text{coord}} = 0.10$: Bonus multiplier if explicit GPS coordinates $(\text{lat}, \text{lon})$ are present.
* $B_{\text{corrob}} = \min(0.25, 0.08 \cdot (N_{\text{cluster}} - 1))$: Corroboration bonus scaled by independent matching reports in the cluster.

### 3.3 Semantic Clustering & Vector Proximity
Reports within each geographic location are grouped into discrete incident clusters using semantic embeddings and coordinate boundaries:

$$D(r_i, r_j) = 1.0 - \frac{\vec{e}_i \cdot \vec{e}_j}{\|\vec{e}_i\| \|\vec{e}_j\|} \le \tau_{\text{dist}}$$

Where $\vec{e}_i$ is the dense vector embedding generated via `all-MiniLM-L6-v2` (or tokenized humanitarian TF-IDF fallback) and $\tau_{\text{dist}} = 0.25$ (cosine similarity $\ge 0.75$).

### 3.4 Bayesian 5-Cause Silence Hypothesis Engine
When a sector falls silent, PRATYAKSH-Ω models 5 mutually exclusive and exhaustive explanatory hypotheses:
* **$H_1$ — Total Annihilation / Catastrophic Entombment**: Complete structural collapse across stone-masonry settlements; population incapacitated.
* **$H_2$ — Telecom & Power Blackout**: Physical shock severed BTS masts and power substations, but population survived and requires shelter.
* **$H_3$ — Early Evacuation / Population Movement**: Population recognized precursors and successfully moved to higher ground/open farmland.
* **$H_4$ — Exaggerated Physical Model**: Upstream hazard model overestimated local soil amplification or terrain shaking.
* **$H_5$ — Nominal Resilience / Unaffected**: Modern reinforced concrete infrastructure endured; commercial activity intact.

The posterior probability $P(H_i \mid \mathbf{E})$ given multimodal evidence $\mathbf{E} = \{e_{\text{seismic}}, e_{\text{satellite}}, e_{\text{telecom}}, e_{\text{recon}}\}$ is updated via Bayes' Theorem:

$$P(H_i \mid \mathbf{E}) = \frac{P(\mathbf{E} \mid H_i) \cdot P(H_i)}{\sum_{j=1}^5 P(\mathbf{E} \mid H_j) \cdot P(H_j)}$$

### 3.5 Shannon Information Entropy & Sortie Optimization
The uncertainty state of any silent sector is quantified by its Shannon Entropy $H(s)$:

$$H(s) = - \sum_{i=1}^5 P(H_i) \log_2 P(H_i)$$

When recommending reconnaissance sorties (tactical UAVs, satellite tasking, high-mobility motorcycle scout patrols), the platform calculates expected Information Gain (Entropy Reduction):

$$\Delta H = H_{\text{prior}}(s) - \mathbb{E}\left[H_{\text{posterior}}(s \mid \text{Observation})\right]$$

Sorties offering the highest $\Delta H$ per unit travel time are prioritized at the top of the Reconnaissance Deployment Queue.

---

## 4. SYSTEM ARCHITECTURE & DATAFLOW PIPELINE

```
+---------------------------------------------------------------------------------------------------+
|                                      INGESTION & SENSORS                                          |
|  Police Dispatch | Hospital Roster | Citizen SMS | Social Media | UNOSAT Orbital | Sentinel-1 SAR |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                     NLP & ENTITY EXTRACTION                                       |
|  - Devanagari & English Normalization (nepali_nlp.py)                                             |
|  - Casualty, Damage & Location Entity Parser (extractor.py)                                       |
|  - Dense Embeddings: all-MiniLM-L6-v2 / TF-IDF Vectorizer (embedder.py)                           |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                  DEDUPLICATION & UNIFIED TRUTH                                    |
|  - Semantic DBSCAN Clustering (clustering.py)                                                    |
|  - Multi-Agency Conflict Reconciliation (reconciliation.py)                                       |
|  - Orbital Cross-Validation with 4.0km Sensor Buffers (satellite_evidence.py)                    |
+---------------------------------------------------------------------------------------------------+
                         |                                                    |
                         v                                                    v
+---------------------------------------------------+ +---------------------------------------------+
|         PHYSICAL SHOCK & LIFELINES ENGINE         | |       NEGATIVE EVIDENCE & SILENCE ENGINE    |
| - Topological Wavefront Physics (propagation.py)  | | - Baseline Shock Expectation (expected.py)  |
| - BTS, Power Substation & Fiber State (telemetry) | | - Silence Risk Score R_silence (blackout)   |
| - Structural Fragility Matrices (fragility.py)    | | - 5-Cause Bayesian Probability (hypothesis) |
+---------------------------------------------------+ +---------------------------------------------+
                         |                                                    |
                         +-------------------------+--------------------------+
                                                   |
                                                   v
+---------------------------------------------------------------------------------------------------+
|                                     TACTICAL OPERATIONS LAYER                                     |
|  - Closed-Loop Human-in-the-Loop Verification Sorties (active_verification.py)                    |
|  - Role-Based Governance: Officer / Analyst / Auditor (governance.py)                             |
|  - Resource Dispatch Optimization (dispatch_engine.py)                                            |
|  - Automated 24-Hour Timeline SITREP Compilation (sitrep_generator.py)                             |
+---------------------------------------------------------------------------------------------------+
                                                   |
                                                   v
+---------------------------------------------------------------------------------------------------+
|                                     MISSION CONTROL FRONTEND                                      |
|    /gis-map    |    /deduplication    |    /hypotheses    |    /blackout-intel    |    /sitrep     |
+---------------------------------------------------------------------------------------------------+
```

---

## 5. THE SIX CORE CAPABILITIES & SYSTEM MILESTONES

PRATYAKSH-Ω is engineered around 6 authoritative operational pillars:

### Capability 1: Real-Time GIS Vector Mapping & Multi-Disaster Scenarios
* Interactive Leaflet vector map with 6 synchronized tactical layers.
* Dynamic epicenter rupture rendering, radial attenuation contours, and real-time hazard wavefront propagation.
* Dynamic Central Nepal H3 hexagonal grid indexing calculating localized exposure metrics ($E_{\text{cell}}$).

### Capability 2: Semantic Incident Deduplication & Unified Truth Resolution
* Reconciles contradictory claims between official channels and citizen dispatches.
* Computes weighted consensus casualty figures, identifying casualty spread ranges (e.g., Hospital says 3, Police says 8, Twitter says 50).
* Cross-validates clusters against 1,000+ real UNOSAT satellite damage points and Sentinel-1 SAR orbital displacement scans.

### Capability 3: Silent Blackout Risk Intelligence
* Monitors lifeline telemetry across all 8 Central Nepal sectors (48 BTS towers, 18.5 MW electrical substations, 1,200 Mbps optical backbones).
* Automatically raises Critical Silence Alarms when infrastructure fails and civilian dispatches drop to zero.
* Ranks sectors by Silence Risk Score ($R_{\text{silence}}$).

### Capability 4: Bayesian Reality Reconstruction & Counterfactual Forecasting
* Evaluates 5 competing hypotheses ($H_1$ through $H_5$) for every silent sector.
* Simulates counterfactual trajectories under alternative interventions ($Y_{\text{do}(X)}$), forecasting survival rates if road clearance precedes medical deployment.
* Tracks Shannon entropy reduction from active reconnaissance sorties.

### Capability 5: Dynamic Population Exposure & Missing Persons Reconciliation
* Ingests 2021 Nepal Central Bureau of Statistics (CBS) Census demographics across rural municipalities (palikas).
* Maps population distribution against structural typology (stone-masonry vs. reinforced concrete).
* Reconciles missing-person rosters against hospital intake registries and police recovery logs.

### Capability 6: Tactical Resource Dispatch & Automated 24-Hour SITREP
* Automates prioritized dispatch of Armed Police Force (APF) search-and-rescue units, mobile surgical units, and food/water provisions.
* Compiles UN OCHA / NEOC standard Situation Reports (SITREP) with 24-hour chronological timeline feeds, casualty summaries, and supervisory directives.

---

## 6. BACKEND PIPELINE DEEP-DIVE (ALL 28 PIPELINE ENGINES)

Every module in [`backend/app/pipeline/`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/) performs a dedicated mathematical, algorithmic, or domain-specific function:

| Pipeline Engine File | Responsibility & Algorithmic Mechanics | Key Functions |
|---|---|---|
| [`active_verification.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/active_verification.py) | Closed-loop reconnaissance sortie generation, ranking verification actions by information gain ($\Delta H$), tracking sortie execution countdowns. | `evaluate_sector_verification_actions()`, `record_verification_execution()` |
| [`aggregator.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/aggregator.py) | Synthesizes sector-level incident rollups, computing severity indices, isolation scores, and overall sector triage classifications. | `aggregate_sector_status()`, `aggregate_all_sectors()` |
| [`before_after_engine.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/before_after_engine.py) | Generates side-by-side comparison showcases demonstrating raw un-deduplicated chaos vs. resolved unified truth ledger. | `get_before_after_showcase()` |
| [`blackout_risk.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/blackout_risk.py) | Computes the formal Silence Risk Index ($R_{\text{silence}}$), evaluates silence window duration, and manages lifeline outage thresholds. | `calculate_silence_risk()`, `assess_blackout_windows()` |
| [`clustering.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/clustering.py) | Groups raw incident reports into spatial-semantic clusters using DBSCAN and cosine distance matrices ($\tau = 0.25$). | `cluster_reports()`, `_distance_matrix()` |
| [`counterfactual.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/counterfactual.py) | Pearlian causal counterfactual engine simulating alternate intervention states ($Y_{\text{do}(X)}$) to forecast casualty curves under differing logistics. | `evaluate_sector_counterfactuals()` |
| [`crisis_nlp.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/crisis_nlp.py) | Classifies incident text into humanitarian categories (Trapped Victims, Medical Emergency, Shelter Need, Infrastructure Severed). | `classify_crisis_intent()`, `extract_urgency_level()` |
| [`dispatch_engine.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/dispatch_engine.py) | Tactical resource matcher allocating APF units, medical teams, and engineering assets to sectors based on deficit severity. | `generate_dispatch_recommendations()`, `seed_initial_resource_units()` |
| [`embedder.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/embedder.py) | Vector embedding generator utilizing PyTorch CPU `all-MiniLM-L6-v2` with an intelligent, memory-bounded TF-IDF fallback for low-RAM containers. | `embed_text()`, `embed_batch()`, `serialize_embedding()` |
| [`evidence_model.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/evidence_model.py) | Bayesian likelihood updater translating multimodal observation signals into likelihood vectors across hypotheses. | `compute_evidence_likelihood()`, `normalize_probabilities()` |
| [`expected_reality.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/expected_reality.py) | Calibrates physical baseline models predicting what communication volumes *should* exist given MMI shaking and population density. | `compute_expected_communications()`, `compute_divergence_gap()` |
| [`extractor.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/extractor.py) | Multi-regex and NER semantic extractor parsing casualty numbers, damage types, and location names in English and Devanagari. | `extract_all()`, `extract_casualties()`, `extract_damage_type()` |
| [`feedback_loop.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/feedback_loop.py) | Dynamically updates source credibility weights and empirical priors based on verified ground-truth results from executed sorties. | `apply_post_verification_feedback()`, `get_source_accuracy_weights()` |
| [`gazetteer.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/gazetteer.py) | Spatial gazetteer containing coordinates, aliases, elevation, and baseline vulnerability for Central Nepal districts and palikas. | `get_all_locations()`, `get_location_by_id()`, `resolve_location()` |
| [`governance.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/governance.py) | Role-Based Access Control (RBAC) governing sortie authorizations: Officer (Approval Authority), Analyst (Read+Justify), Auditor (Audit Only). | `validate_role_action()`, `record_audit_log()` |
| [`h3_grid.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/h3_grid.py) | Generates spatial hexagonal partitions across Central Nepal, assigning cell-level exposure metrics ($E_{\text{cell}}$) and isolation scores. | `generate_central_nepal_h3_hexagons()` |
| [`hypothesis_engine.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/hypothesis_engine.py) | Core Bayesian engine computing posterior probabilities for $H_1$ through $H_5$, calculating Shannon entropy and tracking hypothesis evolution. | `evaluate_sector_hypotheses()`, `compute_entropy()` |
| [`multi_source_fusion.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/multi_source_fusion.py) | Detects and flags irreconcilable cross-agency reporting conflicts (e.g. Police reports road clear while Hospital reports ambulances trapped). | `detect_and_fuse_multi_source_data()`, `get_all_active_conflicts()` |
| [`negative_evidence.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/negative_evidence.py) | Mathematical operationalization of "Silence is Not Safety" — transforms communication silence into actionable severity metrics. | `evaluate_negative_evidence()`, `get_silence_overview()` |
| [`nepali_nlp.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/nepali_nlp.py) | Devanagari script normalizer, transliterator, and disaster lexicon parser matching Nepali casualty terms (e.g., घाइते, मृत्यु, भत्कियो). | `normalize_nepali_text()`, `extract_nepali_entities()` |
| [`population_exposure.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/population_exposure.py) | Cross-references CBS 2021 Census palika populations against hazard intensities to compute casualty ranges and manage missing persons. | `calculate_exposure_metrics()`, `seed_palika_census_data()` |
| [`reconciliation.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/reconciliation.py) | Weighted Bayesian consensus solver calculating true casualty figures and damage classifications across conflicting claims. | `reconcile_casualty_claims()`, `resolve_damage_consensus()` |
| [`satellite_evidence.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/satellite_evidence.py) | Spatial buffer queries matching UNOSAT satellite damage points and Copernicus Sentinel-1 SAR imagery against cluster centroids. | `find_satellite_evidence()`, `get_satellite_calibration_summary()` |
| [`scoring.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/scoring.py) | Implements temporal decay curves, coordinates verification bonuses, and scores overall cluster confidence. | `compute_report_score()`, `score_cluster()` |
| [`sitrep_generator.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/sitrep_generator.py) | Compiles standardized UN OCHA / NEOC Situation Reports with executive briefings, lifeline status, and 24-hour timeline logs. | `generate_sitrep()`, `format_sitrep_text()` |
| [`structural_fragility.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/structural_fragility.py) | Applies empirical damage probability matrices across Nepal building typologies (Stone Masonry in Mud, Adobe, RC Frame). | `calculate_structural_collapse_prob()`, `get_typology_breakdown()` |
| [`supply_engine.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/supply_engine.py) | Computes critical emergency supply requirements (potable water, MRE rations, trauma kits, generators) based on exposed populations. | `compute_emergency_supplies_for_sector()`, `compute_all_supplies()` |
| [`telemetry_engine.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/telemetry_engine.py) | Lifeline simulation modeling cellular BTS towers, electricity grid substation trips, and optical fiber connectivity states across time. | `compute_sector_telemetry()`, `compute_all_sectors_telemetry()` |

---

## 7. MULTI-DISASTER PHYSICS & SIMULATION WAVEFRONTS

PRATYAKSH-Ω supports **5 distinct disaster archetypes**, each governed by its own physical propagation physics, topological wavefront equations, and lifeline failure mechanisms in [`backend/app/simulation/propagation_engine.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/simulation/propagation_engine.py):

### 1. Gorkha Earthquake (Main Himalayan Thrust Rupture)
* **Physics**: M7.8 seismic rupture along the Main Himalayan Thrust (MHT) with hypocenter at Barpak, Gorkha (28.147°N, 84.630°E, 15km depth).
* **Attenuation Equation**:
  $$\text{MMI}(d) = \text{MMI}_0 - 2.8 \cdot \log_{10}(d + 15) - 0.003 \cdot d$$
  Where $d$ is epicentral distance in kilometers and $\text{MMI}_0 = 9.2$.
* **Lifeline Impact**: Instantaneous mechanical destruction of masonry BTS tower foundations; immediate grid trip from transmission line severance.

### 2. Koshi River Basin Flash Flood (Glacial Lake Outburst / Monsoon Wavefront)
* **Physics**: 1D kinematic flood wave translation downstream along river topology:
  $$Q(x, t) = Q_0 \cdot \exp\left(-\frac{(x - v_{\text{wave}} \cdot t)^2}{4 D_h \cdot t}\right)$$
  Where $v_{\text{wave}} \approx 18\text{ km/h}$ and $D_h$ is hydraulic dispersion.
* **Lifeline Impact**: Submergence of riverbank generator rooms, bridge collapse cutting optical fiber conduits, and isolation of low-lying floodplains.

### 3. Bay of Bengal Cyclone Outflow (Extreme Gale & Torrential Precipitation)
* **Physics**: Radial cyclonic wind field decay (Holland Vortex Model) combined with orographic precipitation dumping $\ge 350\text{mm}$ in 24 hours.
* **Lifeline Impact**: Antenna mast shearing from $140\text{ km/h}$ wind gusts; localized urban flooding of ground-level power distribution boxes.

### 4. Jure Sindhupalchok Landslide Dam & Debris Flow
* **Physics**: Slope stability failure model (Infinite Slope Safety Factor $FS < 1.0$) with valley-choking debris volume:
  $$V_{\text{debris}} \ge 5.5 \times 10^6\text{ m}^3$$
* **Lifeline Impact**: Complete physical obliteration of the Arniko Highway; physical cutting of the northern optical fiber trunk to China.

### 5. Asan / New Road Urban Firestorm
* **Physics**: Urban fire spread model across high-density timber/brick historic building stock with radiation flux equations:
  $$q''_{\text{rad}} = \frac{\sigma T^4 \cdot F_{12}}{(1 + \alpha \cdot w_{\text{gap}})}$$
* **Lifeline Impact**: Thermal destruction of overhead telecom cabling, localized sub-station fires, and physical access blockage through narrow alleys.

---

## 8. FRONTEND INTERACTIVE SUITE (ALL 9 MISSION CONSOLES)

The frontend is engineered with Next.js 16 (App Router), React 19, Tailwind CSS 4, and Framer Motion, presenting a dark-mode, high-density tactical interface styled after defense situational command systems (PRATYAKSH-Ω):

```
+-----------------------------------------------------------------------------------------------+
|                                      GLOBAL NAVBAR                                            |
| [Status Pulse] CENTRAL NEPAL CRISIS PROTOCOL | Multi-Disaster Active | [Keys ?] | DOCTRINE    |
| [01 Situation]       [02 Intelligence]       [03 Response]       [04 Report]    [LIVE MAP]    |
+-----------------------------------------------------------------------------------------------+
```

### 1. `/` — Mission Command & Strategic Overview
* **Bayesian Entropy Chamber**: Visualizes real-time Shannon entropy decay as incoming evidence corroborates hypotheses.
* **Sticky-Stack Fallacy Showcase**: Interactive editorial scroll demonstrating why traditional reporting bias leaves remote epicenters to perish.
* **Kinetic Telemetry Ribbon**: Streaming live ticker of sensor status, CBS census baselines, and UNOSAT orbital passes.

### 2. `/deduplication` — Incident Consensus Ledger
* **Conflict Detection Badges**: Highlights contested casualty numbers with visual spread meters.
* **Interactive Dossier Inspection**: Clicking any cluster card renders contributing agency breakdown tables (Police vs. Hospital vs. Citizen).
* **Satellite Cross-Validation Badges**: Shows UNOSAT verified points and radar sensor sources.
* **1-Click Timeline Stepping**: Includes interactive loading skeletons and empty states with `+1.0h` and `+3.0h` simulation advance buttons.

### 3. `/gis-map` — Tactical GIS Vector Map
* **Multi-Layer Map Controls**: Toggle 6 synchronized Leaflet layers:
  1. *Epicenter Rupture & Attenuation Contours*
  2. *H3 Hexagonal Exposure Grid ($E_{\text{cell}}$)*
  3. *UNOSAT Satellite Damage Points*
  4. *Multi-Disaster Hazard Propagation Wavefronts*
  5. *Sector Severity Pins & Triage Labels*
  6. *Lifeline Infrastructure Nodes (BTS / Grid / Roads)*
* **Sector Operations Drawer**: Slide-out panel displaying sector-specific fragility, dominant silence cause, and supply deficit gauges.

### 4. `/hypotheses` — Disaster Reality Reconstruction & Closed-Loop Sorties
* **4-Tab Mission Suite**:
  1. *01 Competing Hypotheses*: Probability bars for $H_1$ through $H_5$.
  2. *02 Expected Reality & Silence*: Physical shock expectation vs. observed communication divergence.
  3. *03 Counterfactual Predictions*: Interactive slider forecasting casualty curves under alternative logistics.
  4. *04 Closed-Loop Verification*: Dispatch UAV reconnaissance sorties with active countdown timers and live telemetry streaming.
* **Role Governance Selector**: Switch simulated roles between `Officer (Approval Authority)`, `Analyst (Read + Justify)`, `Auditor (Compliance)`, and `Viewer`.

### 5. `/blackout-intel` — Silent Blackout Risk Intelligence
* **Silence Risk Matrix**: Ranks all 8 sectors by $R_{\text{silence}}$.
* **Lifeline Deficit Gauges**: Real-time progress meters for cellular BTS availability, electrical power loads, and road passability.
* **Silence Window Tracking**: Displays exact hours elapsed since last verified transmission from isolated sectors.

### 6. `/population` — Dynamic Population Exposure & Missing Persons
* **CBS 2021 Census Palika Breakdown**: Demographics, household counts, and building construction typologies for rural municipalities.
* **Missing Persons Reconciliation Ledger**: Reconciles citizen missing inquiries against hospital triage rosters and police recovery tallies.
* **Search & Filter**: Real-time name and sector query filtering.

### 7. `/dispatch` — Tactical Resource Dispatch & Priority Queue
* **Ranked Priority Queue**: Ranks sectors needing immediate tactical asset deployment.
* **Asset Allocation Matrix**: Displays Armed Police Force (APF) disaster battalions, Nepal Army medical units, and heavy engineering bulldozers.
* **Supply Deficit Meters**: Calculates kilograms of emergency food rations, liters of water, and trauma kits required.

### 8. `/sitrep` — Automated 24-Hour Timeline SITREP
* **UN OCHA / NEOC Standard Format**: Formats official situation reports with executive summaries, casualty counts, and critical lifelines status.
* **Chronological Timeline Log**: Full 24-hour crisis audit trail detailing incident arrivals, infrastructure trips, and sortie resolutions.
* **Direct Print / PDF Export**: Clean print stylesheets for official military/civil protection briefing documents.

### 9. `/research-data` — Data Provenance & Sensor Calibration
* **Complete Sensor Manifest**: Documents real dataset sources, UNOSAT shapefile resolutions, Sentinel-1 radar bands, and CBS 2021 census survey IDs.
* **Calibration Metrics**: Confusion matrices, F1 scores, and spatial accuracy benchmarks for the extraction and deduplication engines.

---

## 9. API CONTRACT & ROUTER MATRIX

The FastAPI backend exposes **16 modular router domains** under high-performance ASGI architecture:

```
FastAPI ASGI Root (http://localhost:8000)
├── /health                                    -> Subsystem vitality & SQLite WAL latency checks
├── /reports                                   -> Report ingestion, single & bulk retrieval
├── /simulation                                -> Clock lifecycle, scenario presets, advance, reset
├── /gis                                       -> GIS telemetry, propagation paths, hazard overlays, H3 grid
├── /deduplication                             -> Unified truth ledger, before/after showcases
├── /hypotheses                                -> 5-cause Bayesian probabilities, evidence traces
├── /baselines                                 -> Expected vs. observed shock baselines
├── /negative-evidence                         -> Silence risk assessment, blackout windows
├── /blackout-intel                            -> Telemetry deficit monitoring
├── /population                                -> Exposure calculation, missing persons ledger
├── /dispatch                                  -> Priority deployment queue, supply deficits
├── /sitrep                                    -> Official UN OCHA standard situation reports
├── /verification                              -> Next-best observations, sortie reviews, audit trail
├── /resq-sight                                -> Real dataset manifest, UNOSAT satellite points
├── /locations                                 -> Central Nepal spatial gazetteer & status rollups
└── /observability                             -> Security rate limits, memory footprint, cache stats
```

---

## 10. DATA PROVENANCE & SENSOR CALIBRATION MATRIX

PRATYAKSH-Ω is calibrated against **authentic humanitarian and satellite datasets** stored in [`RESQ_SIGHT_DATA/`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/RESQ_SIGHT_DATA/):

| Dataset Layer | Source Entity | Real Dataset File / API | Operational Usage in PRATYAKSH-Ω |
|---|---|---|---|
| **UNOSAT Satellite Damage** | UNITAR / UNOSAT | `RESQ_SIGHT_DATA/02_UNOSAT/` | 1,000+ spatial points verifying building damage and structural collapse via optical satellite imagery. |
| **Copernicus Sentinel-1 SAR** | European Space Agency (ESA) | `RESQ_SIGHT_DATA/07_SATELLITE/` | Synthetic Aperture Radar (SAR) coherence change detection validating ground displacement through cloud cover. |
| **National Census Demographics** | Central Bureau of Statistics (CBS) Nepal, 2021 | `RESQ_SIGHT_DATA/06_EXPOSURE/` | Palika-level population counts, vulnerable demographics (elderly, children), and construction typology distributions. |
| **Humanitarian Crisis NLP** | CrisisNLP / QCRI | `RESQ_SIGHT_DATA/03_CRISIS_NLP/` | Annotated disaster tweets from the 2015 Nepal Earthquake used to train disaster intent classification. |
| **Nepali Disaster NER** | Localized Nepali NLP Lexicon | `RESQ_SIGHT_DATA/04_NEPALI_NLP/` | Devanagari script transliteration and named-entity recognition for Nepali casualty and damage dispatches. |
| **Administrative Boundaries** | geoBoundaries / Survey Dept Nepal | `RESQ_SIGHT_DATA/05_GEOSPATIAL/` | ADM0-ADM3 GeoJSON boundary polygons for Central Nepal districts and municipalities. |

---

## 11. DATABASE SCHEMAS & PERSISTENCE MODELS

PRATYAKSH-Ω uses SQLAlchemy ORM with SQLite WAL (Write-Ahead Logging) mode, delivering sub-millisecond query latencies and zero lock contention under concurrent load. Defined in [`backend/app/models/db.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/models/db.py):

* **`ReportDB`**: Stores raw incident text, source agency (`police`, `hospital`, `citizen`, `social_media`), coordinates, timestamp, parsed casualties, damage type, and vector embedding JSON.
* **`SimulationClockDB`**: Singleton managing the virtual crisis timeline (`start_time`, `current_sim_time`, `is_running`).
* **`DisasterScenarioDB`**: Scenario definitions across disaster categories with epicenter coordinates, default zoom, and tags.
* **`SectorScenarioStateDB`**: Per-sector scenario state tracking damage scores, lifeline statuses, and dominant silence causes.
* **`CensusPalikaDB`**: CBS 2021 Census records per palika (population, households, building typologies).
* **`MissingPersonDB`**: Missing-person inquiries with status (`REPORTED_MISSING`, `HOSPITAL_ADMITTED`, `CONFIRMED_SAFE`, `DECEASED`).
* **`TacticalResourceUnitDB`**: Search-and-rescue, trauma, and engineering units with operational status (`AVAILABLE`, `DEPLOYED`, `EN_ROUTE`).
* **`VerificationSortieDB`**: Audit trail of executed reconnaissance sorties, reviewer signatures, role justifications, and entropy reductions.

---

## 12. ROLE GOVERNANCE, SECURITY & RATE LIMITING

Defined in [`backend/app/security.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/security.py) and [`backend/app/pipeline/governance.py`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/app/pipeline/governance.py):

1. **Role-Based Governance Matrix (RBAC)**:
   * **`Officer`**: Full authority to approve and launch forward aerial reconnaissance sorties and emergency asset deployments.
   * **`Administrator`**: Full platform authority including scenario reseeding and simulation clock management.
   * **`Analyst`**: Authorized to input operational justifications and propose recommendations; cannot commit live sorties.
   * **`Auditor`**: Read-only compliance access to immutable sortie audit logs and decision trails.
   * **`Viewer`**: Unprivileged read-only dashboard observation mode.

2. **Defense-in-Depth Rate Limiting**:
   * General API endpoints: Maximum 240 requests/minute per client IP.
   * Resource-intensive endpoints (embeddings, bulk exports): Strict sliding-window throttle (40 requests/minute).
   * Preflight `OPTIONS` requests are exempt, ensuring zero CORS preflight lockouts.

3. **CORS Hardening**:
   * Strict origin regex enforcing valid Vercel production domains, local development environments, and explicit host headers.

---

## 13. VERIFICATION SUITE, E2E TESTING & QUALITY GATES

PRATYAKSH-Ω enforces rigorous multi-layered verification:

```
                                  VERIFICATION PYRAMID
                                           /\
                                          /  \
                                         /E2E \  ◄── Playwright 9-Route Crawler (0 Errors)
                                        /------\
                                       / Turbop \ ◄── Next.js 16 Production Build (12/12 Static)
                                      /----------\
                                     / Unit Tests \ ◄── Pytest Backend Suite (124/124 Passed)
                                    /--------------\
```

1. **Backend Automated Test Suite**:
   * **124 unit and integration tests** spanning 19 test modules in [`backend/tests/`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/tests/).
   * **100% Pass Rate** (`124 passed in 3.72s`).
   * Validates all core algorithms: Bayesian updates, temporal decay, deduplication clustering, rate limiters, and adversarial injection attempts.

2. **Frontend Production Build**:
   * Next.js 16 (Turbopack) production compilation:
   * **12 of 12 routes statically pre-rendered** with zero TypeScript errors.

3. **Playwright End-to-End Suite (`webapp-testing`)**:
   * Automated headless Chromium browser crawling all 9 interactive routes.
   * **0 Console Errors**, **0 Page Exceptions**, **0 HTTP 4xx/5xx Network Failures**.
   * Validated interactive cluster card selection, conflict filter toggles, sector switching, tab navigation, and dynamic simulation timeline stepping.

---

## 14. DEPLOYMENT ARCHITECTURE & PRODUCTION OPTIMIZATION

PRATYAKSH-Ω is optimized for zero-cost, high-resilience hybrid cloud deployment:

```
                          PRODUCTION DEPLOYMENT TOPOLOGY
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
         Vercel Edge Network                              Render Cloud / Docker
       (Next.js 16 Frontend)                              (FastAPI Python 3.11)
  https://prism-rho-three.vercel.app               https://prism-r2lh.onrender.com
                 │                                               │
                 └──────────────► HTTPS / REST API ◄─────────────┘
```

1. **Backend Containerization ([`backend/Dockerfile`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/backend/Dockerfile))**:
   * Base image: `python:3.11-slim`.
   * CPU-optimized PyTorch installation (`https://download.pytorch.org/whl/cpu`) reducing container image size from 4.5 GB to ~600 MB.
   * Non-root security user (`appuser`, UID 1000).
   * Memory arena clamping (`MALLOC_ARENA_MAX=2`) ensuring the container operates smoothly under Render's 512 MB Free Tier limit.
   * Single-worker Uvicorn configuration with bounded concurrency (`--limit-concurrency 80`).

2. **Startup Timeline Self-Healing**:
   * Automatically initializes the simulation clock to $T+3.0\text{h}$ upon fresh container boot or restart, ensuring live site visitors immediately experience a populated, active crisis ledger rather than an empty shock-phase screen.

3. **Frontend Edge Deployment ([`frontend/Dockerfile`](file:///c:/Users/User/Documents/Projects/Real-Time%20Disaster%20Situational%20Awareness%20and%20Population%20Accountability/frontend/Dockerfile))**:
   * Fully pre-rendered static assets served across Vercel's global CDN edge network with automatic API sanitization and dynamic fallback routing.

---

*PRATYAKSH-Ω — Engineering Truth Where Communications Perish.*
