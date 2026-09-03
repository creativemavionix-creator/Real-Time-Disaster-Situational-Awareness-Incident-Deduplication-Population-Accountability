"""
Dynamic Disaster Propagation Engine for PRATYAKSH-Ω.
Implements Requirement 3: Disaster Propagation and Village Flow Tracking.
Models time-indexed propagation paths, active wavefronts, arrival timelines,
and spatial hazard polygons across all 5 disaster categories.
"""

import math
from datetime import datetime, timezone
from typing import Optional, Any
from pydantic import BaseModel, Field

from app.simulation.disaster_types import DisasterCategory, get_disaster_profile
from app.simulation.scenario_presets import SCENARIO_PRESETS, get_scenario_preset


class PropagationNode(BaseModel):
    node_id: str
    name: str
    lat: float
    lon: float
    timestamp_offset_hours: float
    arrival_time_iso: Optional[str] = None
    status: str  # "IMPACTED", "ACTIVE_WAVEFRONT", "PROJECTED_IMPACT"
    damage_severity: str  # "CATASTROPHIC", "SEVERE", "MODERATE", "WATCH"
    lifeline_impact: str
    affected_sector_id: str
    population_exposed: int
    is_silent_zone_risk: bool


class DisasterOrigin(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    disaster_type: DisasterCategory
    initial_metric_label: str
    initial_metric_value: str
    timestamp_offset_hours: float = 0.0
    status: str = "IMPACTED"


class HazardOverlayItem(BaseModel):
    id: str
    name: str
    hazard_type: str
    severity: str
    color: str
    fill_opacity: float
    border_color: str
    border_weight: float
    radius_km: Optional[float] = None
    center: Optional[list[float]] = None
    polygon_coordinates: list[list[float]]
    description: str


class PropagationPathResponse(BaseModel):
    type: str = "PropagationPathCollection"
    disaster_type: DisasterCategory
    scenario_id: str
    simulated_time: str
    elapsed_hours: float
    origin: DisasterOrigin
    nodes: list[PropagationNode]
    path_coordinates: list[list[float]]
    active_wavefront: PropagationNode
    affected_nodes_count: int
    total_nodes_count: int
    movement_history: list[dict[str, Any]]


def _generate_circle_polygon(center_lat: float, center_lon: float, radius_km: float, num_points: int = 36) -> list[list[float]]:
    """Generate polygon coordinates for a circle/ellipse on WGS84."""
    coords = []
    lat_scale = 1.0 / 111.0
    lon_scale = 1.0 / (111.0 * math.cos(math.radians(center_lat)))

    for i in range(num_points):
        angle = math.radians(i * (360.0 / num_points))
        d_lat = radius_km * math.cos(angle) * lat_scale
        d_lon = radius_km * math.sin(angle) * lon_scale
        coords.append([round(center_lat + d_lat, 5), round(center_lon + d_lon, 5)])

    coords.append(coords[0])  # close ring
    return coords


def _generate_swath_corridor_polygon(points: list[list[float]], width_km: float) -> list[list[float]]:
    """Generate a buffered corridor polygon along a polyline of [lat, lon] points."""
    if len(points) < 2:
        return []
    
    left_coords = []
    right_coords = []
    
    for i in range(len(points) - 1):
        p1 = points[i]
        p2 = points[i+1]
        
        d_lat = p2[0] - p1[0]
        d_lon = p2[1] - p1[1]
        length = math.sqrt(d_lat**2 + d_lon**2)
        if length == 0:
            continue
            
        norm_lat = -d_lon / length
        norm_lon = d_lat / length
        
        lat_scale = (width_km / 2.0) / 111.0
        lon_scale = (width_km / 2.0) / (111.0 * math.cos(math.radians(p1[0])))
        
        offset_lat = norm_lat * lat_scale
        offset_lon = norm_lon * lon_scale
        
        left_coords.append([round(p1[0] + offset_lat, 5), round(p1[1] + offset_lon, 5)])
        right_coords.append([round(p1[0] - offset_lat, 5), round(p1[1] - offset_lon, 5)])
        
    # Append end point offsets
    p_last = points[-1]
    left_coords.append([round(p_last[0] + offset_lat, 5), round(p_last[1] + offset_lon, 5)])
    right_coords.append([round(p_last[0] - offset_lat, 5), round(p_last[1] - offset_lon, 5)])
    
    polygon = left_coords + list(reversed(right_coords))
    polygon.append(polygon[0])
    return polygon


# ---------------------------------------------------------------------------
# Raw Topological Propagation Networks for all 5 Disaster Categories
# ---------------------------------------------------------------------------

PROPAGATION_NETWORKS: dict[DisasterCategory, dict[str, Any]] = {
    "earthquake": {
        "origin": DisasterOrigin(
            id="orig_barpak",
            name="Barpak Epicenter Ridge (Gorkha)",
            lat=28.147,
            lon=84.708,
            disaster_type="earthquake",
            initial_metric_label="Magnitude",
            initial_metric_value="M7.8 (PGA 0.48g)",
            timestamp_offset_hours=0.0,
        ),
        "raw_nodes": [
            {
                "node_id": "eq_gorkha_bazar",
                "name": "Gorkha Bazar Core",
                "lat": 28.00,
                "lon": 84.63,
                "timestamp_offset_hours": 0.3,
                "damage_severity": "CATASTROPHIC",
                "lifeline_impact": "Cellular BTS Tower Outage & Access Trail Loss",
                "affected_sector_id": "gorkha",
                "population_exposed": 38000,
                "is_silent_zone_risk": True,
            },
            {
                "node_id": "eq_rasuwa_dhunche",
                "name": "Dhunche Mountain Pass (Rasuwa)",
                "lat": 28.13,
                "lon": 85.30,
                "timestamp_offset_hours": 1.0,
                "damage_severity": "CATASTROPHIC",
                "lifeline_impact": "Massive Rockfall Corridor & Highway Severance",
                "affected_sector_id": "rasuwa",
                "population_exposed": 18500,
                "is_silent_zone_risk": True,
            },
            {
                "node_id": "eq_nuwakot_bidur",
                "name": "Bidur Highway Choke Point (Nuwakot)",
                "lat": 27.91,
                "lon": 85.16,
                "timestamp_offset_hours": 1.8,
                "damage_severity": "SEVERE",
                "lifeline_impact": "Trishuli River Bridge Deck Failure & Power Trip",
                "affected_sector_id": "nuwakot",
                "population_exposed": 62000,
                "is_silent_zone_risk": False,
            },
            {
                "node_id": "eq_ktm_valley",
                "name": "Kathmandu Valley Core",
                "lat": 27.7172,
                "lon": 85.3240,
                "timestamp_offset_hours": 2.5,
                "damage_severity": "SEVERE",
                "lifeline_impact": "Dense Masonry Collapse & High Civilian 911 Surge",
                "affected_sector_id": "kathmandu",
                "population_exposed": 850000,
                "is_silent_zone_risk": False,
            },
            {
                "node_id": "eq_bhaktapur_heritage",
                "name": "Bhaktapur Heritage Core",
                "lat": 27.6710,
                "lon": 85.4298,
                "timestamp_offset_hours": 2.9,
                "damage_severity": "SEVERE",
                "lifeline_impact": "Historic Brick Masonry Collapse & Street Blockage",
                "affected_sector_id": "bhaktapur",
                "population_exposed": 195000,
                "is_silent_zone_risk": False,
            },
            {
                "node_id": "eq_sindhupalchok_chautara",
                "name": "Chautara / Melamchi Ridgeline (Sindhupalchok)",
                "lat": 27.77,
                "lon": 85.70,
                "timestamp_offset_hours": 3.4,
                "damage_severity": "CATASTROPHIC",
                "lifeline_impact": "Araniko Highway Severed & Total Comms Blackout",
                "affected_sector_id": "sindhupalchok",
                "population_exposed": 142000,
                "is_silent_zone_risk": True,
            },
            {
                "node_id": "eq_dolakha_charikot",
                "name": "Charikot Eastern Spur (Dolakha)",
                "lat": 27.70,
                "lon": 86.05,
                "timestamp_offset_hours": 4.8,
                "damage_severity": "SEVERE",
                "lifeline_impact": "High-Altitude Slope Failure & Auxiliary Fault Rupture",
                "affected_sector_id": "dolakha",
                "population_exposed": 45000,
                "is_silent_zone_risk": False,
            },
            {
                "node_id": "eq_sindhuli_highway",
                "name": "BP Highway Corridor (Sindhuli)",
                "lat": 27.25,
                "lon": 85.92,
                "timestamp_offset_hours": 6.0,
                "damage_severity": "MODERATE",
                "lifeline_impact": "Southern Evacuation Choke Point & Landslide Debris",
                "affected_sector_id": "sindhuli",
                "population_exposed": 88000,
                "is_silent_zone_risk": False,
            },
        ],
    },

    "flash_flood": {
        "origin": DisasterOrigin(
            id="orig_melamchi_glacial",
            name="Upper Melamchi Glacial Moraine Breach",
            lat=27.96,
            lon=85.55,
            disaster_type="flash_flood",
            initial_metric_label="Peak Discharge",
            initial_metric_value="2,850 m³/s (Gauge +6.8m)",
            timestamp_offset_hours=0.0,
        ),
        "raw_nodes": [
            {
                "node_id": "fld_helambu_upper",
                "name": "Helambu Upper Settlement & Fish Farms",
                "lat": 27.91,
                "lon": 85.54,
                "timestamp_offset_hours": 0.5,
                "damage_severity": "CATASTROPHIC",
                "lifeline_impact": "Suspension Footbridges Washed Out & Trail Severance",
                "affected_sector_id": "sindhupalchok",
                "population_exposed": 8200,
                "is_silent_zone_risk": True,
            },
            {
                "node_id": "fld_melamchi_bazar",
                "name": "Melamchi Bazar River Confluence",
                "lat": 27.83,
                "lon": 85.58,
                "timestamp_offset_hours": 1.2,
                "damage_severity": "CATASTROPHIC",
                "lifeline_impact": "Concrete Vehicular Bridge Collapsed & Riverside Submersion",
                "affected_sector_id": "sindhupalchok",
                "population_exposed": 28000,
                "is_silent_zone_risk": True,
            },
            {
                "node_id": "fld_bahrabise_crossing",
                "name": "Bahrabise River Gorge Crossing",
                "lat": 27.79,
                "lon": 85.90,
                "timestamp_offset_hours": 2.2,
                "damage_severity": "CATASTROPHIC",
                "lifeline_impact": "Araniko Highway Embankment Undermined & Power Substation Flooded",
                "affected_sector_id": "sindhupalchok",
                "population_exposed": 31000,
                "is_silent_zone_risk": True,
            },
            {
                "node_id": "fld_dolalghat_bridge",
                "name": "Dolalghat Indrawati-Koshi Confluence",
                "lat": 27.64,
                "lon": 85.71,
                "timestamp_offset_hours": 3.5,
                "damage_severity": "SEVERE",
                "lifeline_impact": "Highway Bridge Deck Overtopped & Fiber Conduit Severed",
                "affected_sector_id": "bhaktapur",
                "population_exposed": 24000,
                "is_silent_zone_risk": False,
            },
            {
                "node_id": "fld_nuwakot_downstream",
                "name": "Trishuli Valley Runoff Junction (Nuwakot)",
                "lat": 27.88,
                "lon": 85.18,
                "timestamp_offset_hours": 4.8,
                "damage_severity": "SEVERE",
                "lifeline_impact": "Hydroelectric Intake Siltation & Tailrace Backflooding",
                "affected_sector_id": "nuwakot",
                "population_exposed": 45000,
                "is_silent_zone_risk": False,
            },
            {
                "node_id": "fld_sunkoshi_basin",
                "name": "Sun Koshi River Floodplain (Sindhuli)",
                "lat": 27.28,
                "lon": 85.90,
                "timestamp_offset_hours": 6.5,
                "damage_severity": "MODERATE",
                "lifeline_impact": "Agricultural Floodplain Inundation & Wells Contaminated",
                "affected_sector_id": "sindhuli",
                "population_exposed": 52000,
                "is_silent_zone_risk": False,
            },
        ],
    },

    "cyclone": {
        "origin": DisasterOrigin(
            id="orig_terai_gale",
            name="Terai Gale Squall Eye-Wall",
            lat=26.90,
            lon=86.15,
            disaster_type="cyclone",
            initial_metric_label="Sustained Winds",
            initial_metric_value="150 km/h (972 hPa)",
            timestamp_offset_hours=0.0,
        ),
        "raw_nodes": [
            {
                "node_id": "cyc_terai_foothills",
                "name": "Southern Foothill Outer Gale Ring",
                "lat": 27.05,
                "lon": 86.05,
                "timestamp_offset_hours": 0.8,
                "damage_severity": "CATASTROPHIC",
                "lifeline_impact": "High-Voltage Transmission Pylons Collapsed & Tree Blowdown",
                "affected_sector_id": "sindhuli",
                "population_exposed": 64000,
                "is_silent_zone_risk": True,
            },
            {
                "node_id": "cyc_sindhuli_bazar",
                "name": "Kamalamai / Sindhuli Madi Core",
                "lat": 27.24,
                "lon": 85.92,
                "timestamp_offset_hours": 1.6,
                "damage_severity": "CATASTROPHIC",
                "lifeline_impact": "BP Highway Snagged by Trees & Cell Tower Dishes Blown Off",
                "affected_sector_id": "sindhuli",
                "population_exposed": 48000,
                "is_silent_zone_risk": True,
            },
            {
                "node_id": "cyc_charikot_ridge",
                "name": "Charikot High-Elevation Ridge (Dolakha)",
                "lat": 27.70,
                "lon": 86.05,
                "timestamp_offset_hours": 2.9,
                "damage_severity": "SEVERE",
                "lifeline_impact": "Extreme Orographic Torrential Rains & Micro-Hydro Shutoff",
                "affected_sector_id": "dolakha",
                "population_exposed": 38000,
                "is_silent_zone_risk": False,
            },
            {
                "node_id": "cyc_bhaktapur_east",
                "name": "Sanga Pass Eastern Gate (Bhaktapur)",
                "lat": 27.67,
                "lon": 85.45,
                "timestamp_offset_hours": 4.1,
                "damage_severity": "SEVERE",
                "lifeline_impact": "Corrugated Roof Blow-off & Feeder Power Wire Snapping",
                "affected_sector_id": "bhaktapur",
                "population_exposed": 120000,
                "is_silent_zone_risk": False,
            },
            {
                "node_id": "cyc_ktm_air_corridor",
                "name": "Kathmandu Valley Central Basin",
                "lat": 27.7172,
                "lon": 85.3240,
                "timestamp_offset_hours": 5.4,
                "damage_severity": "MODERATE",
                "lifeline_impact": "Widespread Urban Electrical Blackout & Flash Ponding",
                "affected_sector_id": "kathmandu",
                "population_exposed": 620000,
                "is_silent_zone_risk": False,
            },
            {
                "node_id": "cyc_nuwakot_dissipation",
                "name": "Bidur Mountain Ridge Squall End",
                "lat": 27.91,
                "lon": 85.16,
                "timestamp_offset_hours": 7.0,
                "damage_severity": "WATCH",
                "lifeline_impact": "Persistent Rain Squalls & Low Ground Cloud Obscuration",
                "affected_sector_id": "nuwakot",
                "population_exposed": 35000,
                "is_silent_zone_risk": False,
            },
        ],
    },

    "landslide": {
        "origin": DisasterOrigin(
            id="orig_dhunche_shear",
            name="Dhunche Mountain Ridge Structural Shear",
            lat=28.13,
            lon=85.30,
            disaster_type="landslide",
            initial_metric_label="Debris Volume",
            initial_metric_value="220,000 m³ (Slope 42°)",
            timestamp_offset_hours=0.0,
        ),
        "raw_nodes": [
            {
                "node_id": "ls_dhunche_shelf",
                "name": "Pasang Lhamu Highway Choke Mile 42",
                "lat": 28.12,
                "lon": 85.29,
                "timestamp_offset_hours": 0.4,
                "damage_severity": "CATASTROPHIC",
                "lifeline_impact": "400m Road Shelf Sheared Into Gorge & Total Isolation",
                "affected_sector_id": "rasuwa",
                "population_exposed": 14500,
                "is_silent_zone_risk": True,
            },
            {
                "node_id": "ls_syabrubesi_trail",
                "name": "Syabrubesi Mountain Trail Junction",
                "lat": 28.16,
                "lon": 85.34,
                "timestamp_offset_hours": 1.2,
                "damage_severity": "CATASTROPHIC",
                "lifeline_impact": "Suspension Footbridge Crushed by Ballistic Boulders",
                "affected_sector_id": "rasuwa",
                "population_exposed": 9800,
                "is_silent_zone_risk": True,
            },
            {
                "node_id": "ls_trishuli_dam",
                "name": "Trishuli Canyon Temporary Debris Dam",
                "lat": 28.05,
                "lon": 85.24,
                "timestamp_offset_hours": 2.2,
                "damage_severity": "SEVERE",
                "lifeline_impact": "River Flow Choked & Upstream Backflooding Threat",
                "affected_sector_id": "nuwakot",
                "population_exposed": 22000,
                "is_silent_zone_risk": True,
            },
            {
                "node_id": "ls_bidur_north",
                "name": "Bidur North Approach Highway Cut",
                "lat": 27.93,
                "lon": 85.17,
                "timestamp_offset_hours": 3.8,
                "damage_severity": "SEVERE",
                "lifeline_impact": "Sediment Fans Overrunning Bridges & Mud Runoff",
                "affected_sector_id": "nuwakot",
                "population_exposed": 39000,
                "is_silent_zone_risk": False,
            },
            {
                "node_id": "ls_gorkha_spur",
                "name": "Budhi Gandaki Mountain Spur (Gorkha)",
                "lat": 28.02,
                "lon": 84.75,
                "timestamp_offset_hours": 5.5,
                "damage_severity": "MODERATE",
                "lifeline_impact": "Secondary Valley Slumping & Feeder Mule Track Cut",
                "affected_sector_id": "gorkha",
                "population_exposed": 16000,
                "is_silent_zone_risk": False,
            },
        ],
    },

    "urban_fire": {
        "origin": DisasterOrigin(
            id="orig_newroad_substation",
            name="Bhotahiti / New Road Substation Explosion",
            lat=27.706,
            lon=85.313,
            disaster_type="urban_fire",
            initial_metric_label="Thermal Radiation",
            initial_metric_value="32 kW/m² (PM2.5 880 µg/m³)",
            timestamp_offset_hours=0.0,
        ),
        "raw_nodes": [
            {
                "node_id": "fir_asan_chowk",
                "name": "Asan Medieval Chowk Timber Structures",
                "lat": 27.708,
                "lon": 85.314,
                "timestamp_offset_hours": 0.6,
                "damage_severity": "CATASTROPHIC",
                "lifeline_impact": "Building-to-Building Courtyard Leap & Aerial Wire Meltdown",
                "affected_sector_id": "kathmandu",
                "population_exposed": 45000,
                "is_silent_zone_risk": True,
            },
            {
                "node_id": "fir_indrachowk_galli",
                "name": "Indrachowk Narrow Alleys & Market",
                "lat": 27.705,
                "lon": 85.310,
                "timestamp_offset_hours": 1.4,
                "damage_severity": "CATASTROPHIC",
                "lifeline_impact": "2m Alleys Blocked by Masonry & Toxic Smoke Suffocation",
                "affected_sector_id": "kathmandu",
                "population_exposed": 62000,
                "is_silent_zone_risk": True,
            },
            {
                "node_id": "fir_thamel_core",
                "name": "Thamel Chaksibari & Hotel Enclave",
                "lat": 27.715,
                "lon": 85.312,
                "timestamp_offset_hours": 2.5,
                "damage_severity": "SEVERE",
                "lifeline_impact": "Transformer Arcs & Rooftop Telecom Shelter Burnout",
                "affected_sector_id": "kathmandu",
                "population_exposed": 80000,
                "is_silent_zone_risk": False,
            },
            {
                "node_id": "fir_basantapur_durbar",
                "name": "Basantapur Durbar Heritage Perimeter",
                "lat": 27.704,
                "lon": 85.307,
                "timestamp_offset_hours": 3.6,
                "damage_severity": "SEVERE",
                "lifeline_impact": "Ember Fallouts on Timber Temples & Civilian Evacuation Rush",
                "affected_sector_id": "kathmandu",
                "population_exposed": 110000,
                "is_silent_zone_risk": False,
            },
            {
                "node_id": "fir_patan_gateway",
                "name": "Patan / Lalitpur Northern Gateway",
                "lat": 27.685,
                "lon": 85.320,
                "timestamp_offset_hours": 5.2,
                "damage_severity": "MODERATE",
                "lifeline_impact": "Bagmati River Smoke Drift & Power Grid Tripping",
                "affected_sector_id": "bhaktapur",
                "population_exposed": 95000,
                "is_silent_zone_risk": False,
            },
        ],
    },
}


def calculate_propagation_flow(
    disaster_type: str = "earthquake",
    elapsed_hours: float = 3.5,
    simulated_now: Optional[datetime] = None,
) -> PropagationPathResponse:
    """
    Computes active wavefront, node arrival timeline, and path polyline for the given disaster.
    """
    cleaned_type = disaster_type.lower().strip()
    if cleaned_type not in PROPAGATION_NETWORKS:
        cleaned_type = "earthquake"
    
    preset = get_scenario_preset(cleaned_type)
    network = PROPAGATION_NETWORKS[cleaned_type]  # type: ignore
    origin: DisasterOrigin = network["origin"]
    raw_nodes: list[dict[str, Any]] = network["raw_nodes"]

    now_iso = simulated_now.isoformat() if simulated_now else datetime.now(timezone.utc).isoformat()

    processed_nodes: list[PropagationNode] = []
    active_wavefront_node: Optional[PropagationNode] = None
    affected_count = 0
    movement_history: list[dict[str, Any]] = []

    for item in raw_nodes:
        offset = item["timestamp_offset_hours"]
        if elapsed_hours >= offset:
            affected_count += 1
            if active_wavefront_node is None or offset > active_wavefront_node.timestamp_offset_hours:
                st = "ACTIVE_WAVEFRONT"
            else:
                st = "IMPACTED"
        else:
            st = "PROJECTED_IMPACT"

        node_obj = PropagationNode(
            node_id=item["node_id"],
            name=item["name"],
            lat=item["lat"],
            lon=item["lon"],
            timestamp_offset_hours=offset,
            arrival_time_iso=now_iso,
            status=st,
            damage_severity=item["damage_severity"],
            lifeline_impact=item["lifeline_impact"],
            affected_sector_id=item["affected_sector_id"],
            population_exposed=item["population_exposed"],
            is_silent_zone_risk=item["is_silent_zone_risk"],
        )
        processed_nodes.append(node_obj)

        if st in ("IMPACTED", "ACTIVE_WAVEFRONT"):
            movement_history.append({
                "node_id": node_obj.node_id,
                "name": node_obj.name,
                "t_offset_hours": node_obj.timestamp_offset_hours,
                "coordinates": [node_obj.lat, node_obj.lon],
                "status": st,
                "lifeline_impact": node_obj.lifeline_impact,
            })

        if st == "ACTIVE_WAVEFRONT":
            active_wavefront_node = node_obj

    if active_wavefront_node is None:
        active_wavefront_node = processed_nodes[0]

    # Full coordinates polyline starting from origin
    path_coords = [[origin.lat, origin.lon]] + [[n.lat, n.lon] for n in processed_nodes]

    return PropagationPathResponse(
        disaster_type=cleaned_type,  # type: ignore
        scenario_id=preset.preset_id,
        simulated_time=now_iso,
        elapsed_hours=round(elapsed_hours, 2),
        origin=origin,
        nodes=processed_nodes,
        path_coordinates=path_coords,
        active_wavefront=active_wavefront_node,
        affected_nodes_count=affected_count,
        total_nodes_count=len(processed_nodes),
        movement_history=movement_history,
    )


def generate_hazard_overlays_for_disaster(
    disaster_type: str = "earthquake",
    elapsed_hours: float = 3.5,
) -> list[HazardOverlayItem]:
    """
    Generates dynamic multi-tier spatial hazard overlays tailored to disaster physics.
    """
    cleaned_type = disaster_type.lower().strip()
    if cleaned_type not in PROPAGATION_NETWORKS:
        cleaned_type = "earthquake"

    network = PROPAGATION_NETWORKS[cleaned_type]  # type: ignore
    origin: DisasterOrigin = network["origin"]
    lat, lon = origin.lat, origin.lon

    overlays: list[HazardOverlayItem] = []

    if cleaned_type == "earthquake":
        # Seismic isoseismal ground shaking attenuation rings
        overlays.append(
            HazardOverlayItem(
                id="mmi_viii_critical",
                name="Violent Ground Shaking (MMI VIII+ / Critical)",
                hazard_type="seismic_isoseismal",
                severity="CRITICAL",
                color="#EF4444",
                fill_opacity=0.22,
                border_color="#DC2626",
                border_weight=2.5,
                radius_km=38.0,
                center=[lat, lon],
                polygon_coordinates=_generate_circle_polygon(lat, lon, 38.0),
                description="PGA > 0.45g. Heavy unreinforced masonry destruction, bridge fissures, and high silent zone risk.",
            )
        )
        overlays.append(
            HazardOverlayItem(
                id="mmi_vii_heavy",
                name="Very Strong Shaking (MMI VII / Heavy Damage)",
                hazard_type="seismic_isoseismal",
                severity="HIGH",
                color="#F97316",
                fill_opacity=0.14,
                border_color="#EA580C",
                border_weight=1.8,
                radius_km=82.0,
                center=[lat, lon],
                polygon_coordinates=_generate_circle_polygon(lat, lon, 82.0),
                description="PGA 0.22g - 0.45g. Moderate-to-heavy structural damage, electrical trips, and cellular tower outages.",
            )
        )
        overlays.append(
            HazardOverlayItem(
                id="mmi_vi_moderate",
                name="Strong Shaking (MMI VI / Moderate Alarm)",
                hazard_type="seismic_isoseismal",
                severity="MODERATE",
                color="#FBBF24",
                fill_opacity=0.08,
                border_color="#D97706",
                border_weight=1.2,
                radius_km=145.0,
                center=[lat, lon],
                polygon_coordinates=_generate_circle_polygon(lat, lon, 145.0),
                description="PGA 0.10g - 0.22g. Strongly felt, minor wall plaster cracks and cellular call congestion.",
            )
        )

    elif cleaned_type == "flash_flood":
        # River corridor inundation buffer
        points = [[lat, lon]] + [[n["lat"], n["lon"]] for n in network["raw_nodes"]]
        corridor_severe = _generate_swath_corridor_polygon(points, width_km=4.5)
        corridor_moderate = _generate_swath_corridor_polygon(points, width_km=10.0)

        overlays.append(
            HazardOverlayItem(
                id="fld_inundation_critical",
                name="Active River Inundation & Scour Zone (>3.5m Depth)",
                hazard_type="river_inundation",
                severity="CRITICAL",
                color="#06B6D4",
                fill_opacity=0.28,
                border_color="#0891B2",
                border_weight=2.5,
                polygon_coordinates=corridor_severe,
                description="Peak river discharge 2,850 m³/s. Concrete bridge deck washouts, underwater fiber loss, riverside homes submerged.",
            )
        )
        overlays.append(
            HazardOverlayItem(
                id="fld_inundation_buffer",
                name="Flash Flood Valley Inundation Buffer",
                hazard_type="river_inundation",
                severity="HIGH",
                color="#38BDF8",
                fill_opacity=0.14,
                border_color="#0284C7",
                border_weight=1.6,
                polygon_coordinates=corridor_moderate,
                description="High velocity runoff zone. Siltation, drinking water contamination, and road embankment erosion.",
            )
        )

    elif cleaned_type == "cyclone":
        # Cyclone gale cone corridor + expanding radius
        points = [[lat, lon]] + [[n["lat"], n["lon"]] for n in network["raw_nodes"]]
        gale_swath = _generate_swath_corridor_polygon(points, width_km=35.0)
        outer_swath = _generate_swath_corridor_polygon(points, width_km=70.0)

        overlays.append(
            HazardOverlayItem(
                id="cyc_core_squall",
                name="Destructive Gale Front Core (>140 km/h Winds)",
                hazard_type="atmospheric_gale",
                severity="CRITICAL",
                color="#8B5CF6",
                fill_opacity=0.25,
                border_color="#7C3AED",
                border_weight=2.4,
                polygon_coordinates=gale_swath,
                description="Sustained gale winds >140 km/h. High-voltage transmission tower collapse, blown-off microwave dishes, universal blackout.",
            )
        )
        overlays.append(
            HazardOverlayItem(
                id="cyc_outer_rainband",
                name="Outer Torrential Rainband (>250mm / 12h)",
                hazard_type="atmospheric_gale",
                severity="HIGH",
                color="#A78BFA",
                fill_opacity=0.12,
                border_color="#6D28D9",
                border_weight=1.5,
                polygon_coordinates=outer_swath,
                description="Extensive rainfall ponding, tree falls blocking inter-district highways, cellular tower battery exhaustion.",
            )
        )

    elif cleaned_type == "landslide":
        # Gravitational slope runout fans
        overlays.append(
            HazardOverlayItem(
                id="ls_debris_runout_critical",
                name="Catastrophic Debris Flow & Gorge Choke (220,000 m³)",
                hazard_type="slope_debris_runout",
                severity="CRITICAL",
                color="#D97706",
                fill_opacity=0.30,
                border_color="#B45309",
                border_weight=2.6,
                radius_km=14.0,
                center=[lat, lon],
                polygon_coordinates=_generate_circle_polygon(lat, lon, 14.0),
                description="Massive slope failure burying highway shelf in boulders. Mountain hamlets severed from vehicular and cellular reach.",
            )
        )
        overlays.append(
            HazardOverlayItem(
                id="ls_secondary_hazard",
                name="Secondary Slope Instability Corridor (>38° Slopes)",
                hazard_type="slope_debris_runout",
                severity="HIGH",
                color="#F59E0B",
                fill_opacity=0.15,
                border_color="#D97706",
                border_weight=1.6,
                radius_km=32.0,
                center=[lat, lon],
                polygon_coordinates=_generate_circle_polygon(lat, lon, 32.0),
                description="Active rockfall threat along Trishuli gorge road cuts. Heavy excavator clearing and aerial reconnaissance required.",
            )
        )

    elif cleaned_type == "urban_fire":
        # Urban firestorm perimeter + thermal radiation core
        overlays.append(
            HazardOverlayItem(
                id="fir_thermal_core",
                name="Thermal Radiation Flashover Core (>32 kW/m²)",
                hazard_type="structural_firestorm",
                severity="CRITICAL",
                color="#DC2626",
                fill_opacity=0.35,
                border_color="#991B1B",
                border_weight=2.8,
                radius_km=2.2,
                center=[lat, lon],
                polygon_coordinates=_generate_circle_polygon(lat, lon, 2.2),
                description="Continuous structural firestorm leaping through medieval timber courtyards. Aerial fiber melted, rooftop cell BTS incinerated.",
            )
        )
        overlays.append(
            HazardOverlayItem(
                id="fir_smoke_dispersion",
                name="Toxic Smoke & CO Asphyxiation Plume (PM2.5 >850 µg/m³)",
                hazard_type="structural_firestorm",
                severity="HIGH",
                color="#EA580C",
                fill_opacity=0.18,
                border_color="#C2410C",
                border_weight=1.6,
                radius_km=5.5,
                center=[lat, lon],
                polygon_coordinates=_generate_circle_polygon(lat, lon, 5.5),
                description="Heavy carbon monoxide and particulate plume covering historic gallis. Urgent civilian evacuation to open fields.",
            )
        )

    return overlays
