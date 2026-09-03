"""
Disaster Types and Physical Domain Models for PRATYAKSH-Ω.
Implements Requirement 2: Five Selectable Disaster Types with distinct
physics, damage patterns, affected population profiles, and propagation behaviors.
"""

from typing import Literal, Any
from pydantic import BaseModel, Field

DisasterCategory = Literal[
    "earthquake",
    "flash_flood",
    "cyclone",
    "landslide",
    "urban_fire"
]

class DisasterTypeProfile(BaseModel):
    disaster_type: DisasterCategory
    display_name: str
    icon_name: str
    headline: str
    core_physics_description: str
    primary_hazard_metric: str
    secondary_hazards: list[str]
    propagation_model_type: Literal[
        "seismic_radial_attenuation",
        "hydrological_downstream_flow",
        "atmospheric_gale_corridor",
        "gravitational_slope_runout",
        "wind_driven_structural_spread"
    ]
    lifeline_failure_modes: list[str]
    silent_zone_primary_causes: list[str]
    recommended_primary_units: list[str]
    essential_supplies: list[str]


DISASTER_PROFILES: dict[DisasterCategory, DisasterTypeProfile] = {
    "earthquake": DisasterTypeProfile(
        disaster_type="earthquake",
        display_name="Seismic Rupture & Ground Motion",
        icon_name="Activity",
        headline="M7.8 Central Himalayan Thrust Rupture",
        core_physics_description=(
            "Continental collision along the Main Himalayan Thrust generating violent high-frequency "
            "ground accelerations (PGA > 0.45g). Radiates concentric isoseismal contours with rapid "
            "attenuation across mountainous gneiss topography."
        ),
        primary_hazard_metric="Peak Ground Acceleration (PGA / MMI VIII+)",
        secondary_hazards=[
            "Co-seismic valley landslides",
            "Unreinforced masonry building collapse",
            "Liquefaction in riverbed sediment basins",
            "Aftershock sequence along auxiliary fault splays"
        ],
        propagation_model_type="seismic_radial_attenuation",
        lifeline_failure_modes=[
            "BTS cellular tower mast buckling and generator fuel tank rupture",
            "High-voltage transmission substation automatic protective tripping",
            "Mountain arterial highway rockfall and bridge abutment fissure",
            "Underground fiber optic cable shear from surface fault offsets"
        ],
        silent_zone_primary_causes=[
            "Backhaul fiber severance combined with electrical blackout",
            "Physical isolation due to highway rockfalls trapping valley towns",
            "Severe local collapse paralyzing civilian handset operations"
        ],
        recommended_primary_units=[
            "Nepal Army Urban SAR Heavy Battalion (USAR)",
            "MI-17 Heavy Air Ambulance & High-Altitude Medevac",
            "Cell-on-Wheels (COW) Mobile Satellite BTS Units",
            "DoR Heavy Hydraulic Excavators & Rock Breakers"
        ],
        essential_supplies=[
            "Orthopedic trauma surgical kits & IV fluids",
            "Potable water purification bladders",
            "All-weather high-altitude emergency tents",
            "Handheld satellite messenger terminals (Iridium/InReach)"
        ],
    ),

    "flash_flood": DisasterTypeProfile(
        disaster_type="flash_flood",
        display_name="Flash Flood & River Basin Inundation",
        icon_name="Waves",
        headline="Indrawati / Melamchi Glacial-River Deluge",
        core_physics_description=(
            "Extreme precipitation and upstream glacial lake outburst triggering hyper-concentrated "
            "debris and water deluge. Discharges surge downstream at 14-22 km/h along steep river "
            "gorges, scouring riverbanks and inundating low-lying bazaars."
        ),
        primary_hazard_metric="Peak River Discharge (2,850 m³/s) & Inundation Depth (>3.5m)",
        secondary_hazards=[
            "Riverbank scour and bridge pier undermining",
            "Bazaar mud and boulder siltation",
            "Water treatment plant and fresh supply contamination",
            "Secondary debris dams causing flash backflooding"
        ],
        propagation_model_type="hydrological_downstream_flow",
        lifeline_failure_modes=[
            "Concrete vehicular suspension bridge decks swept into floodwaters",
            "Riverbed fiber optic conduits washed out by sediment scouring",
            "Low-lying electrical distribution substations submerged",
            "Riverside feeder roads completely washed out into raging waters"
        ],
        silent_zone_primary_causes=[
            "Total washing out of riverside transmission and telecom poles",
            "Physical river severance: bridge collapse cutting off opposite banks",
            "Civilian displacement up steep hills away from cellular reception"
        ],
        recommended_primary_units=[
            "Armed Police Force Disaster Water Rescue Taskforce (Boats/Zodiacs)",
            "Aviation Air Reconnaissance & Winch Rescue Helicopters",
            "DoR Modular Bailey Bridge Construction Battalions",
            "WHO Mobile Water Purification & Anti-Cholera Units"
        ],
        essential_supplies=[
            "Chlorine water purification tabs & mobile filtration units",
            "High-energy emergency food rations (MRE packets)",
            "Inflatable motorized rescue dinghies & life jackets",
            "LoRa solar mesh repeater buoys & emergency beacons"
        ],
    ),

    "cyclone": DisasterTypeProfile(
        disaster_type="cyclone",
        display_name="Cyclone & Severe Gale Storm",
        icon_name="Wind",
        headline="Severe Gale Front & Extreme Terai Squall",
        core_physics_description=(
            "Deep atmospheric tropical depression with central pressure dropping to 972 hPa. Generates "
            "destructive sustained gale-force winds exceeding 145 km/h, gusting to 185 km/h, accompanied "
            "by torrential rainbands exceeding 280 mm in 12 hours."
        ),
        primary_hazard_metric="Sustained Wind Speed (150 km/h) & Barometric Pressure (972 hPa)",
        secondary_hazards=[
            "Massive tree uprooting and powerline snapping",
            "Roof structural tear-off and wind-borne projectile hazard",
            "Wide-area urban street waterlogging and flash ponding",
            "Microwave backhaul antenna dish misalignment"
        ],
        propagation_model_type="atmospheric_gale_corridor",
        lifeline_failure_modes=[
            "Lattice power transmission towers collapsed along highway corridors",
            "Cellular base station antennas blown out of calibration/alignment",
            "Fallen timber blocking major inter-district arterial highways",
            "Grid-wide cascading power trip across multiple distribution feeders"
        ],
        silent_zone_primary_causes=[
            "Universal grid blackout combined with BTS backup battery exhaustion",
            "Microwave line-of-sight misalignment breaking cellular backhauls",
            "Flooded roads preventing diesel tanker access to backup generators"
        ],
        recommended_primary_units=[
            "Nepal Electricity Authority High-Voltage Grid Restoration Teams",
            "Armed Police Force Chain-Saw & Tree Clearing Columns",
            "Satellite Cell-on-Wheels (COW) Rugged Trucks",
            "Emergency Medical Field Triage Teams"
        ],
        essential_supplies=[
            "Heavy-duty tarpaulins and corrugated CGI sheet roofing",
            "Emergency diesel fuel containers for hospital generators",
            "Dry packaged emergency rations and infant nutrition",
            "Emergency battery banks and solar charging field units"
        ],
    ),

    "landslide": DisasterTypeProfile(
        disaster_type="landslide",
        display_name="Landslide & Mountain Debris Flow",
        icon_name="Mountain",
        headline="High-Gradient Slope Failure & Highway Choke",
        core_physics_description=(
            "Pore-water overpressure and seismic shear triggering massive translational slope failures "
            "across 40° mountain slopes. Over 220,000 m³ of rock, mud, and timber cascades down mountain "
            "gorges, obliterating switchback roads and severing valley access."
        ),
        primary_hazard_metric="Debris Volume (220,000 m³) & Slope Gradient (>38°)",
        secondary_hazards=[
            "River canyon damming forming hazardous landslide lakes",
            "Delayed secondary slumping during rainfall aftershocks",
            "Boulder ballistic impact on mountain hamlets",
            "Total lifeline highway severance trapping hundreds of vehicles"
        ],
        propagation_model_type="gravitational_slope_runout",
        lifeline_failure_modes=[
            "Mountain highway shelf completely cleaved away into 500m gorge",
            "Poles and overhead wires sheared away by descending boulders",
            "Culverts and drainage channels choked by giant sediment fans",
            "Cellular repeater huts on high mountain spurs crushed or buried"
        ],
        silent_zone_primary_causes=[
            "Physical cut-off of mountain spurs with no alternative road routes",
            "Crushing of solar/battery telecom repeater stations on peaks",
            "Total isolation of entire rural palikas with zero outgoing signal"
        ],
        recommended_primary_units=[
            "DoR Heavy Hydraulic Rock Breakers & Mountain Clearing Columns",
            "High-Altitude Mountain Rescue Bell 407 Helis (Callsign: RESCUE-9)",
            "Nepal Army Tactical Scout Patrol & First-Responder Patrol",
            "Drone VTOL Aerial Survey Reconnaissance Squads"
        ],
        essential_supplies=[
            "Emergency satellite emergency beacon transponders",
            "Portable mountain trauma splints and stretchers",
            "Helicopter-droppable ration packs and water bladders",
            "Emergency rope-way and winch rescue gear"
        ],
    ),

    "urban_fire": DisasterTypeProfile(
        disaster_type="urban_fire",
        display_name="Urban Structural Firestorm",
        icon_name="Flame",
        headline="Dense Historic Core Firestorm & Substation Cascade",
        core_physics_description=(
            "Multiple electrical transformer ruptures igniting dense timber-framed heritage buildings. "
            "Thermal radiation flux exceeding 30 kW/m² drives rapid building-to-building flame leaps "
            "across 2-meter wide medieval courtyards, creating violent smoke and thermal updrafts."
        ),
        primary_hazard_metric="Thermal Radiation Flux (32 kW/m²) & Smoke PM2.5 (>850 µg/m³)",
        secondary_hazards=[
            "Severe carbon monoxide and toxic smoke asphyxiation plume",
            "LPG cylinder and gas pipeline secondary BLEVE explosions",
            "Narrow alleyway blockage from falling brick facades",
            "Dense civilian panic crush in historical gallis"
        ],
        propagation_model_type="wind_driven_structural_spread",
        lifeline_failure_modes=[
            "Aerial fiber optic and power cable bundles melted in streets",
            "Emergency water mains depressurized by simultaneous hydrant draws",
            "Narrow historic streets impassable to standard 12-ton fire tenders",
            "Cellular base station rooftop shelters engulfed in flame"
        ],
        silent_zone_primary_causes=[
            "Physical destruction of rooftop cellular masts and fiber aerials",
            "Rapid evacuation of civilians abandoning phones and power sources",
            "Dense smoke obscuring line-of-sight and optical telemetry"
        ],
        recommended_primary_units=[
            "Kathmandu / Lalitpur Integrated Fire Brigade & Foam Units",
            "WHO Mobile Burn & Respiratory Intensive Care Triage Unit",
            "Nepal Red Cross Rapid Evacuation & Transit Shelter Teams",
            "Micro-UAV Thermal Imaging Plume Tracking Reconnaissance"
        ],
        essential_supplies=[
            "Burn dressing kits, silver sulfadiazine, and IV saline bags",
            "Emergency oxygen concentrators and N95/P100 smoke masks",
            "High-capacity portable fire pumps and relay hoses",
            "Emergency civilian transit shelter registration terminals"
        ],
    ),
}


def get_disaster_profile(disaster_type: str) -> DisasterTypeProfile:
    """Retrieve profile for disaster category, defaulting safely to earthquake."""
    cleaned = disaster_type.lower().strip()
    if cleaned in DISASTER_PROFILES:
        return DISASTER_PROFILES[cleaned]  # type: ignore
    return DISASTER_PROFILES["earthquake"]
