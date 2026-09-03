"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  GisSectorTelemetry,
  fetchH3GridTelemetry,
  H3HexagonItem,
  fetchSatellitePoints,
  SatelliteDamagePointItem,
  fetchHazardOverlays,
  HazardOverlayItem,
  fetchPropagationPath,
  PropagationPathResponse,
} from "@/lib/api";
import { MapLayerVisibility } from "@/components/MapLayerControl";
import "leaflet/dist/leaflet.css";

interface InteractiveVectorMapProps {
  sectors: GisSectorTelemetry[];
  selectedSectorId: string | null;
  onSelectSector: (sectorId: string) => void;
  onSelectHexagon?: (hex: H3HexagonItem) => void;
  layerVisibility?: MapLayerVisibility;
  activeLayer?: "isolation" | "severity" | "epicenter";
  disasterType?: string;
  simTime?: string;
  className?: string;
}

const SECTOR_COORDS: Record<string, [number, number]> = {
  gorkha: [28.00, 84.63],
  sindhupalchok: [27.77, 85.70],
  kathmandu: [27.7172, 85.3240],
  bhaktapur: [27.6710, 85.4298],
  rasuwa: [28.13, 85.30],
  nuwakot: [27.91, 85.16],
  dolakha: [27.70, 86.05],
  sindhuli: [27.25, 85.92],
};

const DEFAULT_ISOLATION_PCT: Record<string, number> = {
  rasuwa: 95,
  sindhupalchok: 90,
  gorkha: 85,
  dolakha: 70,
  kathmandu: 40,
  nuwakot: 35,
  bhaktapur: 20,
  sindhuli: 15,
};

const EPICENTER_LAT = 28.147;
const EPICENTER_LON = 84.708;

// Mountain Lifeline Highway Corridors across Central Nepal
const HIGHWAY_CORRIDORS: Array<[number, number][]> = [
  // Prithvi Highway (Kathmandu -> Naubise -> Mugling -> Gorkha)
  [
    [27.7172, 85.3240],
    [27.7100, 85.1800],
    [27.7300, 85.0000],
    [27.8100, 84.8000],
    [27.8600, 84.6500],
    [28.0000, 84.6300],
  ],
  // Pasang Lhamu Highway (Kathmandu -> Bidur Nuwakot -> Dhunche Rasuwa)
  [
    [27.7172, 85.3240],
    [27.8000, 85.2500],
    [27.9100, 85.1600],
    [28.0200, 85.2200],
    [28.1300, 85.3000],
  ],
  // Araniko Highway (Kathmandu -> Bhaktapur -> Dhulikhel -> Melamchi -> Chautara Sindhupalchok -> Kodari)
  [
    [27.7172, 85.3240],
    [27.6710, 85.4298],
    [27.6200, 85.5500],
    [27.7000, 85.6500],
    [27.7700, 85.7000],
    [27.9000, 85.8800],
    [27.9700, 85.9500],
  ],
  // BP Highway (Kathmandu -> Dhulikhel -> Nepalthok -> Kamalamai Sindhuli)
  [
    [27.6200, 85.5500],
    [27.5000, 85.7000],
    [27.4200, 85.8200],
    [27.2500, 85.9200],
  ],
  // Charikot Eastern Lifeline (Dhulikhel -> Lamosangu -> Charikot Dolakha)
  [
    [27.7000, 85.6500],
    [27.7300, 85.8000],
    [27.7000, 86.0500],
  ],
];

const DEFAULT_LAYER_VISIBILITY: MapLayerVisibility = {
  showH3Grid: true,
  showHazardOverlays: true,
  showPropagationPath: true,
  showSilentHalos: true,
  showCorridors: true,
  showSatelliteLayer: true,
  baseMapStyle: "opentopo",
};

export default function InteractiveVectorMap({
  sectors,
  selectedSectorId,
  onSelectSector,
  onSelectHexagon,
  layerVisibility = DEFAULT_LAYER_VISIBILITY,
  disasterType = "earthquake",
  simTime,
  className = "",
}: InteractiveVectorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const baseTileLayerRef = useRef<any>(null);

  // 6 Leaflet Layer Groups
  const geojsonLayerRef = useRef<any>(null);
  const h3LayerGroupRef = useRef<any>(null);
  const hazardLayerGroupRef = useRef<any>(null);
  const propagationLayerGroupRef = useRef<any>(null);
  const silentHalosLayerGroupRef = useRef<any>(null);
  const corridorsLayerGroupRef = useRef<any>(null);
  const satelliteLayerGroupRef = useRef<any>(null);
  const calloutsLayerGroupRef = useRef<any>(null);

  // Local Data Stores
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [h3Hexagons, setH3Hexagons] = useState<H3HexagonItem[]>([]);
  const [hazardOverlays, setHazardOverlays] = useState<HazardOverlayItem[]>([]);
  const [propagationData, setPropagationData] = useState<PropagationPathResponse | null>(null);
  const [satellitePoints, setSatellitePoints] = useState<SatelliteDamagePointItem[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Fetch static boundaries once
  useEffect(() => {
    fetch("/data/central_nepal_districts.json")
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error("Failed to load district GeoJSON:", err));

    fetchSatellitePoints()
      .then((res) => setSatellitePoints(res.damage_points))
      .catch((err) => console.error("Failed to load satellite points:", err));
  }, []);

  // Fetch dynamic H3 Grid, Hazard Overlays & Propagation Path on load and when simTime or disasterType changes
  useEffect(() => {
    const currentDisaster = disasterType || "earthquake";

    fetchH3GridTelemetry(simTime)
      .then((res) => setH3Hexagons(res.hexagons))
      .catch((err) => console.error("Failed to load H3 Grid:", err));

    fetchHazardOverlays(currentDisaster, simTime)
      .then((res) => setHazardOverlays(res.overlays))
      .catch((err) => console.error("Failed to load hazard overlays:", err));

    fetchPropagationPath(currentDisaster, simTime)
      .then((res) => setPropagationData(res))
      .catch((err) => console.error("Failed to load propagation path:", err));
  }, [simTime, disasterType]);

  const getSectorStatusColor = useCallback((sector?: GisSectorTelemetry) => {
    if (!sector) return "#E11D48";
    if (sector.status === "verified_safe") return "#059669";
    if (sector.status === "verified_damaged" || sector.status === "blackout") return "#E11D48";
    return "#D97706";
  }, []);

  const getSectorIsolationPct = useCallback(
    (sectorId: string) => {
      const sId = sectorId.toLowerCase();
      const sec = sectors.find((s) => s.sector_id.toLowerCase() === sId);
      if (sec && sec.severity_index !== undefined) {
        return Math.min(100, Math.round(sec.severity_index * 10));
      }
      return DEFAULT_ISOLATION_PCT[sId] || 50;
    },
    [sectors]
  );

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let L: any;
    try {
      L = require("leaflet");
    } catch {
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: [27.78, 85.35],
      zoom: 8.8,
      minZoom: 7.5,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Initial OpenTopoMap Tile Layer
    const topoLayer = L.tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 17,
        subdomains: ["a", "b", "c"],
        opacity: 0.95,
      }
    ).addTo(map);
    baseTileLayerRef.current = topoLayer;

    // Initialize 6 Synchronized Layer Groups in order of z-index
    geojsonLayerRef.current = L.layerGroup().addTo(map);
    hazardLayerGroupRef.current = L.layerGroup().addTo(map);
    h3LayerGroupRef.current = L.layerGroup().addTo(map);
    corridorsLayerGroupRef.current = L.layerGroup().addTo(map);
    propagationLayerGroupRef.current = L.layerGroup().addTo(map);
    satelliteLayerGroupRef.current = L.layerGroup().addTo(map);
    silentHalosLayerGroupRef.current = L.layerGroup().addTo(map);
    calloutsLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Basemap Style Switcher
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;
    const L = require("leaflet");
    const map = mapInstanceRef.current;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    let url = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
    let options: any = { maxZoom: 17, subdomains: ["a", "b", "c"], opacity: 0.95 };

    if (layerVisibility.baseMapStyle === "satellite") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      options = { maxZoom: 17, opacity: 0.95 };
    } else if (layerVisibility.baseMapStyle === "dark") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
      options = { maxZoom: 16, opacity: 0.9 };
    }

    const newLayer = L.tileLayer(url, options).addTo(map);
    newLayer.bringToBack();
    baseTileLayerRef.current = newLayer;
  }, [isMapReady, layerVisibility.baseMapStyle]);

  // 3. Layer 2: District Administrative Boundaries
  useEffect(() => {
    if (!isMapReady || !geojsonLayerRef.current || !geojsonData) return;
    const L = require("leaflet");
    const group = geojsonLayerRef.current;
    group.clearLayers();

    L.geoJSON(geojsonData, {
      style: (feature: any) => {
        const sId = (feature.properties?.sector_id || "").toLowerCase();
        const isSelected = selectedSectorId?.toLowerCase() === sId;
        const sec = sectors.find((s) => s.sector_id.toLowerCase() === sId);
        const statusCol = getSectorStatusColor(sec);

        return {
          color: isSelected ? "#FFFFFF" : statusCol,
          weight: isSelected ? 3 : 1.5,
          opacity: isSelected ? 0.9 : 0.5,
          fillColor: statusCol,
          fillOpacity: isSelected ? 0.15 : 0.04,
          dashArray: isSelected ? undefined : "4, 4",
        };
      },
      onEachFeature: (feature: any, layer: any) => {
        const sId = (feature.properties?.sector_id || "").toLowerCase();
        const secName = feature.properties?.sector_name || sId;
        
        layer.on({
          mouseover: (e: any) => {
            const l = e.target;
            l.setStyle({ weight: 2.5, fillOpacity: 0.18, color: "#60A5FA" });
          },
          mouseout: (e: any) => {
            const isSelected = selectedSectorId?.toLowerCase() === sId;
            const sec = sectors.find((s) => s.sector_id.toLowerCase() === sId);
            const statusCol = getSectorStatusColor(sec);
            e.target.setStyle({
              color: isSelected ? "#FFFFFF" : statusCol,
              weight: isSelected ? 3 : 1.5,
              fillOpacity: isSelected ? 0.15 : 0.04,
              dashArray: isSelected ? undefined : "4, 4",
            });
          },
          click: () => onSelectSector(sId),
        });

        layer.bindTooltip(
          `<div style="font-family: monospace; font-size: 11px; padding: 3px 8px; background: #0C0E12; color: #FFF; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);">
            <strong>${secName.toUpperCase()}</strong> (Click to inspect)
          </div>`,
          { sticky: true, opacity: 0.95 }
        );
      },
    }).addTo(group);
  }, [isMapReady, geojsonData, selectedSectorId, sectors, getSectorStatusColor, onSelectSector]);

  // 4. Layer 4: Physical Hazard Extent Overlays (Isoseismal Rings)
  useEffect(() => {
    if (!isMapReady || !hazardLayerGroupRef.current) return;
    const L = require("leaflet");
    const group = hazardLayerGroupRef.current;
    group.clearLayers();

    if (!layerVisibility.showHazardOverlays || hazardOverlays.length === 0) return;

    // Render from outermost to innermost
    const sortedOverlays = [...hazardOverlays].sort((a, b) => b.radius_km - a.radius_km);

    sortedOverlays.forEach((hz) => {
      const polygon = L.polygon(hz.polygon_coordinates, {
        fillColor: hz.color,
        fillOpacity: hz.fill_opacity,
        color: hz.border_color,
        weight: hz.border_weight,
        dashArray: "6, 4",
      });

      polygon.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; padding: 6px 10px; background: rgba(12,14,18,0.95); color: #FFF; border-radius: 6px; border: 1px solid ${hz.border_color};">
          <strong style="color: ${hz.color};">${hz.name}</strong><br/>
          <span style="font-size: 10px; opacity: 0.85;">${hz.description}</span><br/>
          <span style="font-size: 9px; opacity: 0.6;">Radius: ~${hz.radius_km} km</span>
        </div>`,
        { sticky: true, opacity: 0.95 }
      );

      polygon.addTo(group);
    });
  }, [isMapReady, layerVisibility.showHazardOverlays, hazardOverlays]);

  // 5. Layer 3: Microgrid H3 Hexagons with Live Glowing Styling & Tooltips
  useEffect(() => {
    if (!isMapReady || !h3LayerGroupRef.current) return;
    const L = require("leaflet");
    const h3Group = h3LayerGroupRef.current;
    h3Group.clearLayers();

    if (!layerVisibility.showH3Grid || h3Hexagons.length === 0) return;

    h3Hexagons.forEach((hex) => {
      const isBlackout = hex.is_blackout || hex.status === "blackout";
      const isCritical = hex.status === "critical";

      const polygon = L.polygon(hex.polygon_coordinates, {
        fillColor: isBlackout ? "#EF4444" : hex.status_color,
        fillOpacity: isBlackout ? 0.45 : isCritical ? 0.3 : 0.16,
        color: isBlackout ? "#FF0044" : hex.status_color,
        weight: isBlackout ? 2.2 : 0.8,
      });

      // Rich Dark-Glassmorphism Hover Tooltip
      const freqColor = hex.report_frequency_delta_t === 0 ? "#EF4444" : "#10B981";
      polygon.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; padding: 8px 12px; background: rgba(9,11,14,0.95); color: #F3F4F6; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <div style="font-weight: 800; color: #60A5FA;">[H3-RES8] ${hex.sub_region}</div>
          <div style="font-size: 10px; color: #94A3B8;">Sector: ${hex.sector_name} &bull; ${hex.h3_index}</div>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 5px 0;" />
          <div>Baseline Pop: <strong style="color: #FFF;">${hex.baseline_population.toLocaleString()}</strong></div>
          <div>Signals/Hour: <strong style="color: ${freqColor};">${hex.report_frequency_delta_t} / hr</strong></div>
          <div>Hazard Index: <strong>${hex.adjacent_hazard_index}</strong></div>
          <div>Silent Exposure (E_cell): <strong style="color: #F59E0B;">${hex.silent_exposure_metric_ecell}</strong></div>
          <div style="margin-top: 4px; font-size: 10px; font-weight: bold; color: ${hex.status_color};">${hex.threat_tier}</div>
        </div>`,
        { direction: "top", offset: [0, -4], opacity: 0.98 }
      );

      polygon.on("mouseover", (e: any) => {
        e.target.setStyle({ fillOpacity: 0.65, weight: 2.5, color: "#FFFFFF" });
      });

      polygon.on("mouseout", (e: any) => {
        e.target.setStyle({
          fillColor: isBlackout ? "#EF4444" : hex.status_color,
          fillOpacity: isBlackout ? 0.45 : isCritical ? 0.3 : 0.16,
          color: isBlackout ? "#FF0044" : hex.status_color,
          weight: isBlackout ? 2.2 : 0.8,
        });
      });

      polygon.on("click", () => {
        if (onSelectHexagon) onSelectHexagon(hex);
        onSelectSector(hex.sector_id);
      });

      polygon.addTo(h3Group);
    });
  }, [isMapReady, layerVisibility.showH3Grid, h3Hexagons, onSelectSector, onSelectHexagon]);

  // 6. Layer 5: Propagation Path (Flow Vectors & Origin Marker)
  useEffect(() => {
    if (!isMapReady || !propagationLayerGroupRef.current) return;
    const L = require("leaflet");
    const group = propagationLayerGroupRef.current;
    group.clearLayers();

    if (!layerVisibility.showPropagationPath || !propagationData) return;

    // A. Draw Animated Flow Vector Polyline
    if (propagationData.path_coordinates.length > 1) {
      // Glow underlay
      L.polyline(propagationData.path_coordinates, {
        color: "#F59E0B",
        weight: 6,
        opacity: 0.3,
        lineCap: "round",
      }).addTo(group);

      // Core animated dashed line
      L.polyline(propagationData.path_coordinates, {
        color: "#FBBF24",
        weight: 3,
        opacity: 0.9,
        dashArray: "8, 6",
        lineCap: "round",
      }).addTo(group);
    }

    // B. Draw Origin Marker (Dynamic per disaster)
    const origin = propagationData.origin as any;
    const originLabel = origin.name || "DISASTER ORIGIN";
    const metricText = origin.initial_metric_label
      ? `${origin.initial_metric_label}: ${origin.initial_metric_value}`
      : "ORIGIN [T+0h]";

    const originIcon = L.divIcon({
      className: "propagation-origin-marker",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: rgba(0,0,0,0.92); border: 1.5px solid #EF4444; color: #EF4444; font-family: monospace; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 3px; white-space: nowrap; box-shadow: 0 0 12px rgba(239,68,68,0.6);">
            ORIGIN: ${originLabel}
          </div>
          <div style="margin-top: 1px; background: rgba(12,14,18,0.9); border: 1px solid #F59E0B; color: #FBBF24; font-family: monospace; font-size: 8px; padding: 1px 4px; border-radius: 2px; white-space: nowrap;">
            ${metricText}
          </div>
          <div style="margin-top: 2px; width: 18px; height: 18px; background: rgba(239,68,68,0.4); border: 2px solid #EF4444; display: flex; align-items: center; justify-content: center; color: #FFF; font-weight: 900; font-size: 11px; box-shadow: 0 0 16px #EF4444; border-radius: 3px;">
            ⨁
          </div>
        </div>
      `,
      iconSize: [200, 52],
      iconAnchor: [100, 48],
    });

    const originMarker = L.marker([origin.lat, origin.lon], { icon: originIcon }).addTo(group);

    // C. Draw Propagation Waypoint Nodes
    propagationData.nodes.forEach((node) => {
      const isWavefront = node.status === "ACTIVE_WAVEFRONT";
      const isImpacted = node.status === "IMPACTED";
      const nodeColor = isWavefront ? "#F59E0B" : isImpacted ? "#EF4444" : "#6B7280";

      const nodeIcon = L.divIcon({
        className: `prop-node-${node.node_id}`,
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background: rgba(12,14,18,0.85); border: 1px solid ${nodeColor}; color: ${nodeColor}; font-family: monospace; font-size: 9px; padding: 1px 4px; border-radius: 2px; white-space: nowrap;">
              ${isWavefront ? "⚡ ACTIVE WAVEFRONT" : `T+${node.timestamp_offset_hours}h`}
            </div>
            <div style="position: relative; width: 10px; height: 10px; margin-top: 1px;">
              ${isWavefront ? `<div style="position: absolute; inset: -4px; border-radius: 9999px; background: #F59E0B; opacity: 0.5; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ""}
              <div style="width: 10px; height: 10px; border-radius: 9999px; background: ${nodeColor}; border: 1.5px solid #FFF;"></div>
            </div>
          </div>
        `,
        iconSize: [110, 32],
        iconAnchor: [55, 28],
      });

      const nodeMarker = L.marker([node.lat, node.lon], { icon: nodeIcon }).addTo(group);
      nodeMarker.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; padding: 6px 10px; background: #0C0E12; color: #FFF; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2);">
          <strong style="color: ${nodeColor}">${node.name}</strong><br/>
          <span style="font-size: 10px; opacity: 0.85">${node.lifeline_impact}</span><br/>
          <span style="font-size: 9px; opacity: 0.6">Arrival: T+${node.timestamp_offset_hours} hours &bull; Status: ${node.status}</span>
        </div>`,
        { direction: "top", offset: [0, -8], opacity: 0.95 }
      );
    });
  }, [isMapReady, layerVisibility.showPropagationPath, propagationData, onSelectSector]);

  // 7. Layer 6: Pulsing Silent Zone Blackout Halos
  useEffect(() => {
    if (!isMapReady || !silentHalosLayerGroupRef.current) return;
    const L = require("leaflet");
    const group = silentHalosLayerGroupRef.current;
    group.clearLayers();

    if (!layerVisibility.showSilentHalos) return;

    sectors.forEach((sec) => {
      const isBlackout = sec.status === "blackout" || (sec.severity_index >= 7.0 && sec.active_incidents_count === 0);
      if (!isBlackout) return;

      const haloIcon = L.divIcon({
        className: `silent-halo-${sec.sector_id}`,
        html: `
          <div style="position: relative; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; pointer-events: auto; cursor: pointer;">
            <!-- Radar ping halo 1 -->
            <div style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(239, 68, 68, 0.25); border: 2px solid #EF4444; animation: ping 2.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <!-- Radar ping halo 2 -->
            <div style="position: absolute; inset: 8px; border-radius: 9999px; background: rgba(239, 68, 68, 0.35); border: 1.5px solid #EF4444; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
            <!-- Center label badge -->
            <div style="position: relative; z-index: 10; background: #000; border: 1.5px solid #EF4444; color: #EF4444; font-family: monospace; font-size: 8px; font-weight: 900; padding: 2px 4px; border-radius: 2px; white-space: nowrap; box-shadow: 0 0 12px #EF4444;">
              SILENT ZONE
            </div>
          </div>
        `,
        iconSize: [64, 64],
        iconAnchor: [32, 32],
      });

      const marker = L.marker([sec.latitude, sec.longitude], { icon: haloIcon }).addTo(group);
      marker.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; padding: 6px 10px; background: #0C0E12; color: #F87171; border-radius: 6px; border: 1px solid #EF4444;">
          <strong>CRITICAL BLACKOUT: ${sec.sector_name.toUpperCase()}</strong><br/>
          <span style="color: #FFF; font-size: 10px;">Zero incoming reports detected. Telecom &amp; physical isolation inferred.</span>
        </div>`,
        { direction: "top", offset: [0, -16], opacity: 0.95 }
      );
      marker.on("click", () => onSelectSector(sec.sector_id));
    });
  }, [isMapReady, layerVisibility.showSilentHalos, sectors, onSelectSector]);

  // 8. Highway Lifeline Corridors
  useEffect(() => {
    if (!isMapReady || !corridorsLayerGroupRef.current) return;
    const L = require("leaflet");
    const group = corridorsLayerGroupRef.current;
    group.clearLayers();

    if (!layerVisibility.showCorridors) return;

    HIGHWAY_CORRIDORS.forEach((coords) => {
      // Glow underlay
      L.polyline(coords, {
        color: "#F59E0B",
        weight: 4,
        opacity: 0.35,
        lineCap: "round",
      }).addTo(group);

      // Core yellow line
      L.polyline(coords, {
        color: "#FBBF24",
        weight: 2,
        opacity: 0.85,
        dashArray: "8, 6",
        lineCap: "round",
      }).addTo(group);
    });
  }, [isMapReady, layerVisibility.showCorridors]);

  // 9. UNOSAT Satellite Damage Points Overlay
  useEffect(() => {
    if (!isMapReady || !satelliteLayerGroupRef.current) return;
    const L = require("leaflet");
    const satGroup = satelliteLayerGroupRef.current;
    satGroup.clearLayers();

    if (!layerVisibility.showSatelliteLayer || satellitePoints.length === 0) return;

    satellitePoints.forEach((pt) => {
      const isDestroyed = pt.grading.toLowerCase().includes("destroyed");
      const markerColor = isDestroyed ? "#E11D48" : "#D97706";
      const icon = L.divIcon({
        className: "satellite-damage-marker",
        html: `
          <div style="position: relative; width: 14px; height: 14px; cursor: pointer;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: ${markerColor}; opacity: 0.6; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; inset: 2px; border-radius: 9999px; background-color: ${markerColor}; border: 1.5px solid #FFFFFF;"></div>
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([pt.lat, pt.lon], { icon });
      marker.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; padding: 4px 8px; background: #0C0E12; color: #F4F4F0; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
          <strong style="color: ${markerColor}">${pt.grading}</strong><br/>
          <span style="opacity: 0.8">${pt.sensor_name}</span><br/>
          <span style="font-size: 9px; opacity: 0.6">UNOSAT Corroborated</span>
        </div>`,
        { direction: "top", offset: [0, -6], opacity: 0.95 }
      );
      marker.on("click", () => onSelectSector(pt.sector_id));
      marker.addTo(satGroup);
    });
  }, [isMapReady, layerVisibility.showSatelliteLayer, satellitePoints, onSelectSector]);

  // 10. Sector Tactical Callouts & Badges
  useEffect(() => {
    if (!isMapReady || !calloutsLayerGroupRef.current) return;
    const L = require("leaflet");
    const group = calloutsLayerGroupRef.current;
    group.clearLayers();

    sectors.forEach((sector) => {
      const sectorId = sector.sector_id.toLowerCase();
      const coords = SECTOR_COORDS[sectorId] || [sector.latitude, sector.longitude];
      const isSelected = selectedSectorId?.toLowerCase() === sectorId;
      const statusColor = getSectorStatusColor(sector);
      const isoPct = getSectorIsolationPct(sectorId);
      const isBlackout = sector.status === "blackout";

      const calloutHtml = `
        <div style="
          position: relative;
          background: rgba(9, 11, 14, 0.92);
          backdrop-filter: blur(12px);
          border: ${isSelected ? `2px solid #FFFFFF` : `1.5px solid ${statusColor}`};
          border-radius: 6px;
          padding: 4px 8px;
          color: #F4F4F0;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: ${isSelected ? "0 0 20px rgba(255,255,255,0.4)" : `0 0 10px rgba(0,0,0,0.5)`};
          transition: all 0.2s ease;
        ">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="font-weight: 800; font-size: 11px; letter-spacing: 0.05em; color: ${statusColor};">
              ${sector.sector_name.toUpperCase()}
            </span>
            <span style="
              font-size: 9px;
              font-weight: 800;
              padding: 1px 4px;
              border-radius: 3px;
              background: ${isBlackout ? "#EF4444" : statusColor}22;
              color: ${isBlackout ? "#EF4444" : statusColor};
              border: 1px solid ${isBlackout ? "#EF4444" : statusColor}55;
            ">
              ${isBlackout ? "BLACKOUT" : `${isoPct}% ISO`}
            </span>
          </div>
          ${
            sector.estimated_casualties > 0
              ? `<div style="font-size: 9px; color: #EF4444; font-weight: 700; margin-top: 2px;">
                  ~${sector.estimated_casualties} casualties est.
                 </div>`
              : ""
          }
        </div>
      `;

      const icon = L.divIcon({
        className: `sector-callout-${sectorId}`,
        html: calloutHtml,
        iconSize: isSelected ? [140, 48] : [110, 36],
        iconAnchor: isSelected ? [70, 24] : [55, 18],
      });

      const marker = L.marker(coords, { icon });
      marker.on("click", () => onSelectSector(sectorId));
      marker.addTo(group);
    });
  }, [isMapReady, sectors, selectedSectorId, getSectorStatusColor, getSectorIsolationPct, onSelectSector]);

  // Pan / Fly to selected sector smoothly
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSectorId) return;
    const coords = SECTOR_COORDS[selectedSectorId.toLowerCase()];
    if (coords) {
      mapInstanceRef.current.flyTo(coords, 9.4, {
        duration: 1.0,
        easeLinearity: 0.25,
      });
    }
  }, [selectedSectorId]);

  return (
    <div className={`absolute inset-0 z-0 bg-[#090B0E] ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
}
