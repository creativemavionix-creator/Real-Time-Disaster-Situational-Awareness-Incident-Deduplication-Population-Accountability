# 🛰️ RESQ-SIGHT Local Research & Data Repository

> **Project Name**: RESQ-SIGHT (Real-Time Disaster Situational Awareness + Population Accountability)  
> **Repository Purpose**: Authoritative, reproducible, multi-modal research dataset store for historical ground-truth validation, NLP training, geospatial reference, dynamic population exposure, and satellite change detection.

---

## 📂 Directory Layout & Dataset Inventory

```
RESQ_SIGHT_DATA/
│
├── 01_GROUND_TRUTH/
│   └── GORKHA_EARTHQUAKE/          # Primary Historical Ground-Truth Reference
│       ├── building_damage.csv     # Building damage grades (1-3) & locations
│       ├── building_ownership.csv  # Legal ownership, family counts, plan config
│       └── building_structure.csv  # Floor count, age, foundation, roof, superstructure
│
├── 02_UNOSAT/
│   ├── SANKHU/                     # Independent Satellite Damage Evidence (Sankhu)
│   │   ├── damage.shp / .shx / .dbf / .prj
│   └── DARAUDI/                    # Independent Satellite Damage Evidence (Daraudi)
│       ├── damage.shp / .shx / .dbf / .prj
│
├── 03_CRISIS_NLP/
│   ├── HUMAID/                     # Humanitarian AI Text Classification Corpus
│   ├── CRISISMMD/                  # Multimodal Crisis Event Categorization Dataset
│   └── NEPAL_EARTHQUAKE_TWEETS/    # 2015 Nepal Earthquake Crisis Twitter Dataset
│
├── 04_NEPALI_NLP/
│   └── EBIQUITY_NER/
│       └── v2_BIO/                 # Ebiquity Nepali Named Entity Recognition (BIO)
│           ├── total.bio / train.bio / dev.bio / test.bio
│
├── 05_GEOSPATIAL/
│   ├── HDX_NEPAL_COD/              # Official UN OCHA Admin Boundaries (Country/District/Ward)
│   └── OSM_NEPAL/
│       └── nepal-latest.osm.pbf    # Geofabrik OpenStreetMap Infrastructure Extract (412 MB)
│
├── 06_EXPOSURE/
│   └── NEPAL_CENSUS_2021/
│       └── population_local_level.csv # Nepal NSO 2021 Census Local Level Population Baseline
│
└── 07_SATELLITE/
    ├── SENTINEL_1/                 # Synthetic Aperture Radar (SAR) VV/VH Granules
    │   ├── PRE_EVENT/ (2015-04-17)
    │   └── POST_EVENT/ (2015-04-29)
    └── SENTINEL_2/                 # Optical Multispectral Tile T45RRL
        ├── PRE_EVENT/ (2015-04-08)
        └── POST_EVENT/ (2015-05-03)
```

---

## 🏷️ Role Taxonomy & Intended RESQ-SIGHT Architecture Module

| Dataset Category | Exact Directory | Architectural Role | Function in RESQ-SIGHT System |
| :--- | :--- | :--- | :--- |
| **Gorkha Building Damage** | `01_GROUND_TRUTH/GORKHA_EARTHQUAKE/` | `GROUND_TRUTH` | Calibrates reliability & confidence scoring against historical ground reality. |
| **UNOSAT Satellite Damage** | `02_UNOSAT/SANKHU/` & `DARAUDI/` | `INDEPENDENT_VALIDATION` | Corroborates field claims with independent remote sensing evidence. |
| **HumAID & CrisisMMD** | `03_CRISIS_NLP/HUMAID/` & `CRISISMMD/` | `NLP_TRAINING` | Benchmarks report categorization & multi-modal evidence parsing. |
| **Nepal Earthquake Tweets** | `03_CRISIS_NLP/NEPAL_EARTHQUAKE_TWEETS/` | `NLP_EVALUATION` | Evaluates crisis text classification on Nepal-specific disaster language. |
| **Ebiquity Nepali NER** | `04_NEPALI_NLP/EBIQUITY_NER/v2_BIO/` | `NLP_TRAINING` | Extracts Nepali locations, landmarks, and person entities from Devanagari text. |
| **HDX Nepal COD** | `05_GEOSPATIAL/HDX_NEPAL_COD/` | `GEOSPATIAL_REFERENCE` | Normalizes administrative boundaries (Province, District, Municipality, Ward). |
| **OSM Nepal PBF** | `05_GEOSPATIAL/OSM_NEPAL/` | `GEOSPATIAL_REFERENCE` | Spatial queries for roads, bridges, hospitals, rivers, and critical POIs. |
| **Nepal Census 2021** | `06_EXPOSURE/NEPAL_CENSUS_2021/` | `EXPOSURE` | Baseline exposed population calculator across 753 local level units. |
| **Sentinel-1 & Sentinel-2** | `07_SATELLITE/SENTINEL_1/` & `SENTINEL_2/` | `SATELLITE_EVIDENCE` | Radar (SAR) & optical pre/post event change detection for blackout zones. |

---

## 📜 Licensing & Usage Guidelines

- **01_GROUND_TRUTH**: National Reconstruction Authority (NRA) Open Data License / DrivenData Competition License.
- **02_UNOSAT**: UNITAR / UNOSAT Terms of Use (Humanitarian Non-Commercial License).
- **03_CRISIS_NLP & 04_NEPALI_NLP**: QCRI & UMBC Ebiquity Academic License.
- **05_GEOSPATIAL**: OCHA HDX Creative Commons Attribution for Intergovernmental Organisations (CC-BY-IGO) & OpenStreetMap ODbL.
- **06_EXPOSURE**: Nepal National Statistics Office (NSO) Open Government Data License.
- **07_SATELLITE**: Copernicus Sentinel Open Data License (Free & Open Access).
