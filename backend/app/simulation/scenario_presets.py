"""
Predefined Scenario Presets for PRATYAKSH-Ω.
Implements Requirement 7: Scenario Presets and Location-Based Simulation.
Enables instant loading of disaster type, spatial center, origin point, and operational conditions.
"""

from typing import Optional, Any
from pydantic import BaseModel, Field
from app.simulation.disaster_types import DisasterCategory, get_disaster_profile


class ScenarioPreset(BaseModel):
    preset_id: str
    disaster_type: DisasterCategory
    title: str
    subtitle: str
    location_name: str
    description: str
    center_lat: float
    center_lon: float
    default_zoom: int
    origin_point: dict[str, Any]
    initial_affected_sectors: list[str]
    suspected_silent_zones: list[str]
    critical_lifelines_at_risk: list[str]
    tags: list[str] = Field(default_factory=list)


SCENARIO_PRESETS: dict[str, ScenarioPreset] = {
    "gorkha_earthquake": ScenarioPreset(
        preset_id="gorkha_earthquake",
        disaster_type="earthquake",
        title="Gorkha Earthquake (M7.8 Main Frontal Rupture)",
        subtitle="Barpak Epicenter to Kathmandu Valley Corridor",
        location_name="Central Nepal (Gorkha - Nuwakot - Kathmandu - Sindhupalchok)",
        description=(
            "A catastrophic M7.8 megathrust earthquake ruptures along the Main Himalayan Thrust. "
            "Violent shaking (MMI VIII+) radiates across high mountain districts down to the Kathmandu "
            "sedimentary basin. High-altitude rural sectors (Gorkha, Rasuwa) immediately plunge into total "
            "communication silence due to severed fiber optic trunks, power grid collapses, and massive "
            "co-seismic landslides blocking mountain roads."
        ),
        center_lat=27.95,
        center_lon=85.20,
        default_zoom=9,
        origin_point={
            "id": "orig_barpak",
            "name": "M7.8 Barpak Epicenter Ridge",
            "lat": 28.147,
            "lon": 84.708,
            "magnitude": 7.8,
            "depth_km": 15.0,
            "type": "seismic_epicenter"
        },
        initial_affected_sectors=["gorkha", "rasuwa", "nuwakot", "kathmandu", "bhaktapur", "sindhupalchok", "dolakha"],
        suspected_silent_zones=["gorkha", "rasuwa"],
        critical_lifelines_at_risk=[
            "Prithvi Highway (Malekhu-Mugling gorge)",
            "Trishuli 132kV transmission corridor",
            "Araniko Highway (Bahrabise mountain shelf)",
            "NTC Central Mountain Microwave Relay Trunk"
        ],
        tags=["High Casualty", "Seismic", "Mountain Blackout", "National Emergency"]
    ),

    "melamchi_flood": ScenarioPreset(
        preset_id="melamchi_flood",
        disaster_type="flash_flood",
        title="Melamchi Flash Flood & Debris Inundation",
        subtitle="Upper Indrawati Basin Hydrological Deluge",
        location_name="Sindhupalchok District (Melamchi - Bahrabise - Helambu)",
        description=(
            "An intense cloudburst combined with glacial moraine failure in upper Helambu triggers a "
            "hyper-concentrated flash flood carrying giant boulders and mud down the Melamchi River. "
            "Key concrete suspension and vehicular bridges are completely swept away. Riverside bazaars "
            "are inundated up to the second floor, cutting off telecommunication poles along the river banks "
            "and isolating settlements on the eastern banks into severe silent pockets."
        ),
        center_lat=27.83,
        center_lon=85.58,
        default_zoom=10,
        origin_point={
            "id": "orig_melamchi_glacial",
            "name": "Upper Melamchi Glacial Moraine Breach",
            "lat": 27.96,
            "lon": 85.55,
            "discharge_m3s": 2850.0,
            "gauge_height_m": 6.8,
            "type": "hydrological_breach"
        },
        initial_affected_sectors=["sindhupalchok", "nuwakot", "dolakha"],
        suspected_silent_zones=["sindhupalchok"],
        critical_lifelines_at_risk=[
            "Melamchi Drinking Water Supply Intake & Tunnel Portal",
            "Helambu Access Highway & Concrete Vehicular Bridges",
            "Upper Bhotekoshi Hydroelectric Transmission Interconnect",
            "Riverside Cellular BTS Towers"
        ],
        tags=["Hydrological", "Bridge Collapse", "Valley Isolation", "Flash Flood"]
    ),

    "rasuwa_landslide": ScenarioPreset(
        preset_id="rasuwa_landslide",
        disaster_type="landslide",
        title="Rasuwa Landslide & Mountain Debris Flow",
        subtitle="Pasang Lhamu Highway Gorge Cleavage",
        location_name="Rasuwa District (Dhunche - Syabrubesi - Langtang)",
        description=(
            "Pore-pressure saturation triggers massive 220,000 m³ rock and debris slides on the steep 42° "
            "gorges above Dhunche. Over 4.5 kilometers of the Pasang Lhamu Highway are sheared off into the "
            "Trishuli gorge, burying micro-hydro lines and mountain telephone cables. Hamlets in upper Rasuwa "
            "produce zero telemetry, creating an acute Silent Zone with unknown survivor counts."
        ),
        center_lat=28.13,
        center_lon=85.30,
        default_zoom=10,
        origin_point={
            "id": "orig_dhunche_shear",
            "name": "Dhunche Mountain Ridge Structural Shear",
            "lat": 28.13,
            "lon": 85.30,
            "debris_volume_m3": 220000.0,
            "slope_deg": 42.0,
            "type": "slope_failure_choke"
        },
        initial_affected_sectors=["rasuwa", "nuwakot"],
        suspected_silent_zones=["rasuwa"],
        critical_lifelines_at_risk=[
            "Pasang Lhamu International Highway (China border trade route)",
            "Chilime Hydroelectric Transmission Lines",
            "Trishuli Valley Optical Fiber Cable Conduit",
            "Syabrubesi Mountain Access Foot-Bridges"
        ],
        tags=["Geotechnical", "Mountain Choke", "Total Road Severance", "Silent Hamlet"]
    ),

    "kathmandu_fire": ScenarioPreset(
        preset_id="kathmandu_fire",
        disaster_type="urban_fire",
        title="Kathmandu Urban Structural Firestorm",
        subtitle="Dense Historic Core Substation & Courtyard Firestorm",
        location_name="Kathmandu Valley Core (Asan - New Road - Thamel - Patan)",
        description=(
            "Multiple cascading transformer ruptures at the Bhotahiti and New Road substations ignite dense, "
            "timber-framed historic multi-story masonry structures. High thermal radiation (>32 kW/m²) creates "
            "rapid building-to-building leaps through medieval gallis. Melts aerial telecom wire bundles and "
            "engulfs rooftop cellular BTS sites. Narrow alleyways prevent heavy fire engine entry, trapping "
            "dense civilian populations in dense smoke pockets."
        ),
        center_lat=27.710,
        center_lon=85.318,
        default_zoom=13,
        origin_point={
            "id": "orig_newroad_substation",
            "name": "Bhotahiti / New Road Substation Explosion",
            "lat": 27.706,
            "lon": 85.313,
            "thermal_flux_kw": 32.0,
            "pm25_ugm3": 880.0,
            "type": "urban_firestorm_ignition"
        },
        initial_affected_sectors=["kathmandu", "bhaktapur"],
        suspected_silent_zones=["kathmandu"],
        critical_lifelines_at_risk=[
            "Kathmandu Central Power Substation (New Road Grid)",
            "Aerial Fiber Optic Bundles (Asan/Indrachowk Choke)",
            "Water Supply Mains in Heritage Core",
            "Civilian Evacuation Escape Alleys"
        ],
        tags=["Urban Firestorm", "Dense Population", "Toxic Smoke", "Alley Blockage"]
    ),

    "terai_cyclone": ScenarioPreset(
        preset_id="terai_cyclone",
        disaster_type="cyclone",
        title="Terai Severe Gale & Squall Front",
        subtitle="Eastern Basin High-Velocity Storm Track",
        location_name="Southern Basin Corridor (Sindhuli - Terai Foothills)",
        description=(
            "A violent gale storm front strikes the southern foothills with sustained winds of 145 km/h "
            "and 280 mm torrential downpours. Hundreds of trees collapse over the BP Highway and high-voltage "
            "transmission towers buckle across the floodplain. Cell tower microwave antennae are misaligned, "
            "causing wide-area telemetry blackout across Sindhuli and southern mountain passes."
        ),
        center_lat=27.20,
        center_lon=85.95,
        default_zoom=9,
        origin_point={
            "id": "orig_koshi_gale",
            "name": "Terai Gale Squall Eye-Wall",
            "lat": 26.90,
            "lon": 86.15,
            "wind_speed_kmh": 150.0,
            "pressure_hpa": 972.0,
            "type": "cyclonic_storm_center"
        },
        initial_affected_sectors=["sindhuli", "dolakha", "kathmandu"],
        suspected_silent_zones=["sindhuli"],
        critical_lifelines_at_risk=[
            "BP Highway (Dhulikhel-Sindhuli-Bardibas link)",
            "East-West 400kV Power Transmission Corridor",
            "Cellular BTS Lattice Towers across Foothills",
            "Kamala River Embankments and Drainage Sluices"
        ],
        tags=["Extreme Wind", "Grid Collapse", "Tree Blockage", "Microwave Misalignment"]
    ),
}


def get_scenario_preset(preset_id: str) -> ScenarioPreset:
    """Retrieve preset by ID, defaulting safely to gorkha_earthquake."""
    cleaned = preset_id.lower().strip()
    if cleaned in SCENARIO_PRESETS:
        return SCENARIO_PRESETS[cleaned]
    # If passed a disaster type string, map to corresponding preset
    for p in SCENARIO_PRESETS.values():
        if p.disaster_type == cleaned:
            return p
    return SCENARIO_PRESETS["gorkha_earthquake"]


def list_all_scenario_presets() -> list[ScenarioPreset]:
    """List all available scenario presets."""
    return list(SCENARIO_PRESETS.values())
