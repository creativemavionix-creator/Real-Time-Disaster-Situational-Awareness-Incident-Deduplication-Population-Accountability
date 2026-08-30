#!/usr/bin/env python3
"""
prepare_dataset.py

Downloads the datasets needed for the Post-Disaster Information Fog project
into ./dataset/<dataset_id>/.

Honesty note: not everything here can be scripted. Some sources (DrivenData,
CrisisNLP, Copernicus, national census portals) require a free account,
a request form, or credentials, and don't have a stable anonymous download
URL. Those are marked MANUAL below and the script prints exactly where to
go and what to grab instead of pretending to automate something it can't.

Usage:
    python prepare_dataset.py --list
    python prepare_dataset.py --all
    python prepare_dataset.py --dataset nepal_admin_boundaries nepali_ner
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

import requests

OUT_ROOT = Path(__file__).resolve().parent / "dataset"

HDX_API = "https://data.humdata.org/api/3/action/package_show"


# ---------------------------------------------------------------------------
# Dataset registry
# ---------------------------------------------------------------------------
# method: "git" | "http" | "hdx" | "manual"
DATASETS = [
    {
        "id": "nepal_admin_boundaries",
        "name": "Nepal administrative boundaries (ADM0-3), geoBoundaries",
        "why": "Gazetteer for resolving report text/coordinates to a location.",
        "method": "http",
        "urls": [
            f"https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/"
            f"releaseData/gbOpen/NPL/ADM{level}/geoBoundaries-NPL-ADM{level}.geojson"
            for level in range(4)
        ],
    },
    {
        "id": "nepal_admin_boundaries_cod",
        "name": "Nepal Subnational Administrative Boundaries (OCHA COD-AB)",
        "why": "Higher-detail official alternative/supplement to geoBoundaries "
               "(includes a tabular gazetteer with P-codes).",
        "method": "hdx",
        "hdx_slug": "cod-ab-npl",
    },
    {
        "id": "nepal_earthquake_severity_index",
        "name": "Nepal Earthquake Severity Index (2015, HDX/OCHA)",
        "why": "Independent, non-report-derived severity estimate — useful as a "
               "rough prior/ground-truth reference, not something derived from "
               "our own pipeline's reports.",
        "method": "hdx",
        "hdx_slug": "nepal-earthquake-severity-index",
    },
    {
        "id": "nepali_ner",
        "name": "Nepali NER dataset (oya163/nepali-ner, EBIQUITY corpus)",
        "why": "Real Nepali-language labeled text — needed to move extraction "
               "past a hand-rolled English keyword list.",
        "method": "git",
        "repo": "https://github.com/oya163/nepali-ner.git",
    },
    {
        "id": "kathmandu_living_labs_building_damage",
        "name": "2015 Gorkha earthquake building damage assessment "
                "(Kathmandu Living Labs / Central Bureau of Statistics)",
        "why": "The closest thing to real ground truth for calibrating the "
               "reliability-scoring formula against actual outcomes.",
        "method": "manual",
        "instructions": [
            "Create a free account at https://www.drivendata.org/",
            "Go to the 'Richter's Predictor' competition data page: "
            "https://www.drivendata.org/competitions/57/nepal-earthquake/data/",
            "Download train_values.csv, train_labels.csv, and the data "
            "dictionary, then place them in dataset/kathmandu_living_labs_building_damage/",
        ],
    },
    {
        "id": "crisisnlp_humaid",
        "name": "CrisisNLP / HumAID labeled disaster social-media datasets",
        "why": "Standard labeled corpus (informativeness, damage type, "
               "humanitarian category) to sanity-check extraction/reliability "
               "logic against real crisis text instead of only synthetic data.",
        "method": "manual",
        "instructions": [
            "Go to https://crisisnlp.qcri.org/ and https://crisisnlp.qcri.org/humaid_dataset",
            "Most datasets require filling a short request form for research "
            "use — submit it and download the released archives.",
            "Place extracted files in dataset/crisisnlp_humaid/",
        ],
    },
    {
        "id": "unosat_satellite_damage_maps",
        "name": "UNOSAT/UNITAR satellite-derived damage assessment maps for Nepal",
        "why": "Independent damage labels not derived from citizen reports — "
               "useful to cross-check report-based confidence against reality.",
        "method": "manual",
        "instructions": [
            "Browse https://data.humdata.org/group/nepal-earthquake and search "
            "for entries from 'UNOSAT' / 'UNITAR' (these vary by specific event, "
            "so there's no single stable dataset id to script against).",
            "Download the relevant GeoTIFF/shapefile products and place them "
            "in dataset/unosat_satellite_damage_maps/",
        ],
    },
    {
        "id": "nepal_census_2021",
        "name": "Nepal Census 2021 (Central Bureau of Statistics)",
        "why": "Official baseline population by administrative unit, for any "
               "population-exposure work later.",
        "method": "manual",
        "instructions": [
            "Go to https://censusnepal.cbs.gov.np/ (Central Bureau of "
            "Statistics) and download the relevant tables — these are "
            "published as reports/PDFs/XLSX, not a single machine-readable "
            "bulk file.",
            "Place downloaded files in dataset/nepal_census_2021/",
        ],
    },
    {
        "id": "worldpop_nepal",
        "name": "WorldPop Nepal gridded population estimates",
        "why": "Higher-resolution population estimate than census alone.",
        "method": "manual",
        "instructions": [
            "Go to https://www.worldpop.org/ , search 'Nepal', and download "
            "the population count GeoTIFF for the year you need.",
            "Place it in dataset/worldpop_nepal/",
        ],
    },
    {
        "id": "sentinel_sar_optical",
        "name": "Sentinel-1 SAR / Sentinel-2 optical imagery (Copernicus)",
        "why": "Independent change-detection signal for blackout zones — "
               "SAR works through cloud cover and at night.",
        "method": "manual",
        "instructions": [
            "Create a free account at the Copernicus Data Space Ecosystem: "
            "https://dataspace.copernicus.eu/",
            "Once you have credentials, use the 'sentinelsat' or 'openeo' "
            "Python package to query/download scenes for your area of "
            "interest — this needs your own API key, so it can't be "
            "scripted anonymously here.",
            "Save scenes to dataset/sentinel_sar_optical/",
        ],
    },
    {
        "id": "building_footprints",
        "name": "Microsoft Global ML Building Footprints / Google Open Buildings (Nepal)",
        "why": "Pre-disaster building locations to diff satellite change-"
               "detection results against.",
        "method": "manual",
        "instructions": [
            "Microsoft: https://github.com/microsoft/GlobalMLBuildingFootprints "
            "— the repo links to per-country download files; find Nepal's "
            "entry in the dataset-links CSV.",
            "Google: https://sites.research.google/open-buildings/ — export "
            "via Earth Engine or the public data downloads for Nepal's "
            "S2 cells.",
            "Place downloaded files in dataset/building_footprints/",
        ],
    },
]


def download_http(entry: dict) -> bool:
    dest = OUT_ROOT / entry["id"]
    dest.mkdir(parents=True, exist_ok=True)
    ok = True
    for url in entry["urls"]:
        filename = url.split("/")[-1]
        target = dest / filename
        try:
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            target.write_bytes(resp.content)
            print(f"  ✓ {filename}")
        except requests.RequestException as e:
            print(f"  ✗ {filename} — {e}")
            ok = False
    return ok


def download_git(entry: dict) -> bool:
    dest = OUT_ROOT / entry["id"]
    if dest.exists() and any(dest.iterdir()):
        print(f"  already present at {dest}, skipping clone")
        return True
    try:
        subprocess.run(
            ["git", "clone", "--depth", "1", entry["repo"], str(dest)],
            check=True,
        )
        return True
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"  ✗ git clone failed — {e}")
        return False


def download_hdx(entry: dict) -> bool:
    dest = OUT_ROOT / entry["id"]
    dest.mkdir(parents=True, exist_ok=True)
    try:
        resp = requests.get(HDX_API, params={"id": entry["hdx_slug"]}, timeout=30)
        resp.raise_for_status()
        payload = resp.json()
        if not payload.get("success"):
            print(f"  ✗ HDX package '{entry['hdx_slug']}' not found")
            return False
        resources = payload["result"]["resources"]
        if not resources:
            print("  ✗ no resources listed for this package")
            return False
        ok = True
        for res in resources:
            url = res.get("url")
            fname = res.get("name") or url.split("/")[-1]
            if not url:
                continue
            try:
                r = requests.get(url, timeout=60)
                r.raise_for_status()
                (dest / fname.replace("/", "_")).write_bytes(r.content)
                print(f"  ✓ {fname}")
            except requests.RequestException as e:
                print(f"  ✗ {fname} — {e}")
                ok = False
        return ok
    except requests.RequestException as e:
        print(f"  ✗ HDX API request failed — {e}")
        return False


def print_manual(entry: dict) -> None:
    dest = OUT_ROOT / entry["id"]
    dest.mkdir(parents=True, exist_ok=True)
    print("  MANUAL — requires an account, request form, or credentials:")
    for step in entry["instructions"]:
        print(f"    - {step}")


def run(entry: dict) -> str:
    print(f"\n[{entry['id']}] {entry['name']}")
    print(f"  why: {entry['why']}")
    method = entry["method"]
    if method == "http":
        return "done" if download_http(entry) else "failed"
    if method == "git":
        return "done" if download_git(entry) else "failed"
    if method == "hdx":
        return "done" if download_hdx(entry) else "failed"
    if method == "manual":
        print_manual(entry)
        return "manual"
    print(f"  ✗ unknown method '{method}'")
    return "failed"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--all", action="store_true", help="fetch every dataset")
    parser.add_argument(
        "--dataset", nargs="+", metavar="ID",
        help="fetch only these dataset ids (see --list)",
    )
    parser.add_argument("--list", action="store_true", help="list dataset ids and exit")
    args = parser.parse_args()

    if args.list or not (args.all or args.dataset):
        print("Available datasets:\n")
        for d in DATASETS:
            print(f"  {d['id']:<35} [{d['method']:<6}] {d['name']}")
        if not (args.all or args.dataset):
            print("\nRun with --all or --dataset <id> [<id> ...] to fetch.")
        return

    OUT_ROOT.mkdir(exist_ok=True)
    selected = DATASETS if args.all else [
        d for d in DATASETS if d["id"] in set(args.dataset)
    ]
    if args.dataset:
        missing = set(args.dataset) - {d["id"] for d in DATASETS}
        for m in missing:
            print(f"unknown dataset id: {m}")

    status = {}
    for entry in selected:
        status[entry["id"]] = run(entry)

    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    for k, v in status.items():
        print(f"  {k:<35} {v}")

    manifest = OUT_ROOT / "MANIFEST.json"
    manifest.write_text(json.dumps(status, indent=2))
    print(f"\nWrote {manifest}")


if __name__ == "__main__":
    main()