"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  GisSectorTelemetry,
  fetchH3GridTelemetry,
  H3HexagonItem,
  fetchSatellitePoints,
  SatelliteDamagePointItem,
} from "@/lib/api";
import "leaflet/dist/leaflet.css";

interface InteractiveVectorMapProps {
  sectors: GisSectorTelemetry[];
  selectedSectorId: string | null;
  onSelectSector: (sectorId: string) => void;
  activeLayer?: "isolation" | "severity" | "epicenter";
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

export default function InteractiveVectorMap({
  sectors,
  selectedSectorId,
  onSelectSector,
  className = "",
}: InteractiveVectorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const baseTileLayerRef = useRef<any>(null);
  const geojsonLayerRef = useRef<any>(null);
  const calloutsLayerGroupRef = useRef<any>(null);
  const corridorsLayerGroupRef = useRef<any>(null);
  const h3LayerGroupRef = useRef<any>(null);
  const satelliteLayerGroupRef = useRef<any>(null);

  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [h3Hexagons, setH3Hexagons] = useState<H3HexagonItem[]>([]);
  const [satellitePoints, setSatellitePoints] = useState<SatelliteDamagePointItem[]>([]);
  const [showH3Grid, setShowH3Grid] = useState(false);
  const [showSatelliteLayer, setShowSatelliteLayer] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);
  const [baseMapStyle, setBaseMapStyle] = useState<"opentopo" | "satellite" | "dark">("opentopo");
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    fetch("/data/central_nepal_districts.json")
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error("Failed to load district GeoJSON:", err));

    fetchH3GridTelemetry()
      .then((res) => setH3Hexagons(res.hexagons))
      .catch((err) => console.error("Failed to load H3 Grid:", err));

    fetchSatellitePoints()
      .then((res) => setSatellitePoints(res.damage_points))
      .catch((err) => console.error("Failed to load satellite points:", err));
  }, []);

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

  // Initialize Map Instance
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

    // Initial OpenTopoMap Tile Layer (High-Relief Topographic Terrain)
    const topoLayer = L.tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 17,
        subdomains: ["a", "b", "c"],
        opacity: 0.95,
      }
    ).addTo(map);
    baseTileLayerRef.current = topoLayer;

    // Epicenter Beacon & Marker Box (Top Left near Barpak)
    const epicenterIcon = L.divIcon({
      className: "m78-epicenter-marker",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; pointer-events: auto; cursor: pointer;">
          <div style="background: rgba(0, 0, 0, 0.85); border: 1.5px solid #EF4444; color: #EF4444; font-family: monospace; font-size: 10px; font-weight: 800; padding: 2px 6px; letter-spacing: 0.1em; border-radius: 2px; white-space: nowrap; box-shadow: 0 0 10px rgba(239,68,68,0.5);">
            M7.8 EPICENTER
          </div>
          <div style="margin-top: 3px; width: 22px; height: 22px; background: rgba(239, 68, 68, 0.35); border: 2px solid #EF4444; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-weight: 900; font-size: 12px; box-shadow: 0 0 16px #EF4444;">
            ☒
          </div>
        </div>
      `,
      iconSize: [110, 44],
      iconAnchor: [55, 40],
    });

    const epicMarker = L.marker([EPICENTER_LAT, EPICENTER_LON], { icon: epicenterIcon }).addTo(map);
    epicMarker.on("click", () => onSelectSector("gorkha"));

    // Initialize Layer Groups
    corridorsLayerGroupRef.current = L.layerGroup().addTo(map);
    h3LayerGroupRef.current = L.layerGroup().addTo(map);
    satelliteLayerGroupRef.current = L.layerGroup().addTo(map);
    calloutsLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onSelectSector]);

  // Switch Base Map Tiles (OpenTopoMap vs Satellite vs Dark)
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;
    const L = require("leaflet");
    const map = mapInstanceRef.current;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    let url = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
    let options: any = { maxZoom: 17, subdomains: ["a", "b", "c"], opacity: 0.95 };

    if (baseMapStyle === "satellite") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      options = { maxZoom: 17, opacity: 0.95 };
    } else if (baseMapStyle === "dark") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
      options = { maxZoom: 16, opacity: 0.9 };
    }

    const newLayer = L.tileLayer(url, options).addTo(map);
    newLayer.bringToBack();
    baseTileLayerRef.current = newLayer;
  }, [isMapReady, baseMapStyle]);

  // Render Lifeline Highway Corridors (Yellow arterial lifelines cutting through mountains)
  useEffect(() => {
    if (!isMapReady || !corridorsLayerGroupRef.current) return;
    const L = require("leaflet");
    const group = corridorsLayerGroupRef.current;
    group.clearLayers();

    if (!showCorridors) return;

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
        color: "#FACC15",
        weight: 2,
        opacity: 0.9,
        dashArray: "6, 3",
        lineCap: "round",
      }).addTo(group);
    });
  }, [isMapReady, showCorridors]);

  // Render District Polygon Boundaries
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !geojsonData) return;
    const L = require("leaflet");
    const map = mapInstanceRef.current;

    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    const layer = L.geoJSON(geojsonData, {
      style: (feature: any) => {
        const distName = (feature.properties.DISTRICT || feature.properties.name || "").toLowerCase();
        const isSelected = selectedSectorId?.toLowerCase() === distName;

        return {
          fillColor: "#000000",
          weight: isSelected ? 2.5 : 1.2,
          opacity: isSelected ? 0.95 : 0.6,
          color: isSelected ? "#F59E0B" : "#CA8A04",
          fillOpacity: showH3Grid ? 0.0 : isSelected ? 0.15 : 0.05,
        };
      },
      onEachFeature: (feature: any, featureLayer: any) => {
        const distName = (feature.properties.DISTRICT || feature.properties.name || "").toLowerCase();
        featureLayer.on({
          click: () => onSelectSector(distName),
        });
      },
    }).addTo(map);

    geojsonLayerRef.current = layer;
  }, [isMapReady, geojsonData, selectedSectorId, showH3Grid, onSelectSector]);

  // Render Tactical Sector Callouts (Matching Reference Screenshot)
  useEffect(() => {
    if (!isMapReady || !calloutsLayerGroupRef.current) return;
    const L = require("leaflet");
    const group = calloutsLayerGroupRef.current;
    group.clearLayers();

    Object.entries(SECTOR_COORDS).forEach(([sectorId, coords]) => {
      const sector = sectors.find((s) => s.sector_id.toLowerCase() === sectorId);
      const isSelected = selectedSectorId?.toLowerCase() === sectorId;
      const statusColor = getSectorStatusColor(sector);
      const isolationPct = getSectorIsolationPct(sectorId);
      const displayName = sector?.sector_name || sectorId.toUpperCase();

      let calloutHtml = "";

      if (isSelected) {
        // Selected Kathmandu-style elevated cream/white card with glowing amber border
        calloutHtml = `
          <div style="pointer-events: auto; cursor: pointer; display: inline-block; background: rgba(240, 243, 246, 0.95); border: 2px solid #F59E0B; box-shadow: 0 0 25px rgba(245, 158, 11, 0.7), 0 4px 16px rgba(0,0,0,0.5); padding: 6px 12px; border-radius: 4px; text-align: left; min-width: 120px;">
            <div style="display: flex; align-items: center; gap: 5px; font-family: monospace; font-size: 11px; font-weight: 900; color: #090B0E; letter-spacing: 0.08em; text-transform: uppercase;">
              <span style="display: inline-block; width: 7px; height: 7px; background: #E11D48; border-radius: 1px;"></span>
              ${displayName}
            </div>
            <div style="font-family: monospace; font-size: 10px; font-weight: 700; color: #1E293B; margin-top: 2px; letter-spacing: 0.04em;">
              ${isolationPct}% Isolated
            </div>
          </div>
        `;
      } else {
        // Standard tactical dark box with amber/gold isolation percentage
        calloutHtml = `
          <div style="pointer-events: auto; cursor: pointer; display: inline-block; background: rgba(12, 14, 18, 0.88); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 3px; text-align: left; min-width: 100px; transition: all 0.2s ease;">
            <div style="display: flex; align-items: center; gap: 4px; font-family: monospace; font-size: 10px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.06em; text-transform: uppercase;">
              <span style="display: inline-block; width: 6px; height: 6px; background: ${statusColor}; border-radius: 1px;"></span>
              ${displayName}
            </div>
            <div style="font-family: monospace; font-size: 9px; font-weight: 700; color: #F59E0B; margin-top: 1px; letter-spacing: 0.04em;">
              ${isolationPct}% Isolated
            </div>
          </div>
        `;
      }

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

  // UNOSAT Satellite Damage Points Overlay
  useEffect(() => {
    if (!isMapReady || !satelliteLayerGroupRef.current) return;
    const L = require("leaflet");
    const satGroup = satelliteLayerGroupRef.current;
    satGroup.clearLayers();

    if (!showSatelliteLayer || satellitePoints.length === 0) return;

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
  }, [isMapReady, showSatelliteLayer, satellitePoints, onSelectSector]);

  // H3 Spatial Hexagonal Mesh Overlay
  useEffect(() => {
    if (!isMapReady || !h3LayerGroupRef.current) return;
    const L = require("leaflet");
    const h3Group = h3LayerGroupRef.current;
    h3Group.clearLayers();

    if (!showH3Grid || h3Hexagons.length === 0) return;

    h3Hexagons.forEach((hex) => {
      const polygon = L.polygon(hex.polygon_coordinates, {
        fillColor: hex.status_color,
        fillOpacity: hex.is_blackout ? 0.5 : 0.2,
        color: hex.is_blackout ? "#090B0E" : hex.status_color,
        weight: hex.is_blackout ? 2 : 0.5,
      });
      polygon.on("click", () => onSelectSector(hex.sector_id));
      polygon.addTo(h3Group);
    });
  }, [isMapReady, showH3Grid, h3Hexagons, onSelectSector]);

  // Pan / Fly to selected sector
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSectorId) return;
    const coords = SECTOR_COORDS[selectedSectorId.toLowerCase()];
    if (coords) {
      mapInstanceRef.current.flyTo(coords, 9.2, {
        duration: 1.0,
        easeLinearity: 0.25,
      });
    }
  }, [selectedSectorId]);

  return (
    <div className={`absolute inset-0 z-0 bg-[#090B0E] ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Tactical Layer Controls (Top Left) */}
      <div className="absolute top-24 left-8 z-[400] flex flex-col gap-2 pointer-events-auto">
        {/* Base Map Style Selector */}
        <div className="flex bg-[#0C0E12]/90 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg text-[10px] font-mono-data">
          <button
            type="button"
            onClick={() => setBaseMapStyle("opentopo")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
              baseMapStyle === "opentopo"
                ? "bg-[#D97706] text-black shadow-md"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            🏔️ Relief
          </button>
          <button
            type="button"
            onClick={() => setBaseMapStyle("satellite")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
              baseMapStyle === "satellite"
                ? "bg-[#2563EB] text-white shadow-md"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            🛰️ Satellite
          </button>
          <button
            type="button"
            onClick={() => setBaseMapStyle("dark")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
              baseMapStyle === "dark"
                ? "bg-white/20 text-white shadow-md"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            🌑 Dark
          </button>
        </div>

        {/* Feature Layer Toggles */}
        <button
          type="button"
          onClick={() => setShowCorridors(!showCorridors)}
          className={`px-3.5 py-1.5 rounded-xl backdrop-blur-md border font-mono-data text-[10px] tracking-wider transition-all cursor-pointer uppercase shadow-lg flex items-center gap-2 ${
            showCorridors
              ? "bg-[#D97706]/20 border-[#F59E0B] text-amber-300"
              : "bg-[#090B0E]/70 border-white/10 text-[#94A3B8] hover:text-white"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${showCorridors ? "bg-amber-400" : "bg-[#64748B]"}`} />
          {showCorridors ? "Lifeline Corridors: ON" : "Lifelines: OFF"}
        </button>

        <button
          type="button"
          onClick={() => setShowSatelliteLayer(!showSatelliteLayer)}
          className={`px-3.5 py-1.5 rounded-xl backdrop-blur-md border font-mono-data text-[10px] tracking-wider transition-all cursor-pointer uppercase shadow-lg flex items-center gap-2 ${
            showSatelliteLayer
              ? "bg-[#2563EB]/20 border-[#60A5FA] text-blue-300"
              : "bg-[#090B0E]/70 border-white/10 text-[#94A3B8] hover:text-white"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${showSatelliteLayer ? "bg-blue-400 animate-pulse" : "bg-[#64748B]"}`} />
          {showSatelliteLayer ? "UNOSAT Points: ON" : "UNOSAT: OFF"}
        </button>

        <button
          type="button"
          onClick={() => setShowH3Grid(!showH3Grid)}
          className={`px-3.5 py-1.5 rounded-xl backdrop-blur-md border font-mono-data text-[10px] tracking-wider transition-all cursor-pointer uppercase shadow-lg flex items-center gap-2 ${
            showH3Grid
              ? "bg-emerald-600/20 border-emerald-400 text-emerald-300"
              : "bg-[#090B0E]/70 border-white/10 text-[#94A3B8] hover:text-white"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${showH3Grid ? "bg-emerald-400" : "bg-[#64748B]"}`} />
          {showH3Grid ? "H3 Hexagons: ON" : "H3 Grid: OFF"}
        </button>
      </div>

      {/* Map Legend & OpenTopoMap Attribution Bar (Matching Screenshot Bottom Attribution) */}
      <div className="absolute bottom-2 left-2 z-[400] flex items-center gap-2 font-mono-data text-[9px] text-[#94A3B8] bg-[#0C0E12]/85 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 pointer-events-auto">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-[#EF4444] inline-block rounded-xs"></span>
          <span>Critical Isolation</span>
        </span>
        <span className="text-white/20">|</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-[#F59E0B] inline-block rounded-xs"></span>
          <span>Moderate Risk</span>
        </span>
        <span className="text-white/20">|</span>
        <span className="text-white/50">
          Leaflet | Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap
        </span>
      </div>
    </div>
  );
}
