"use client";

import React, { useEffect, useRef, useState } from "react";
import { GisSectorTelemetry, fetchH3GridTelemetry, H3HexagonItem } from "@/lib/api";
import "leaflet/dist/leaflet.css";

interface InteractiveVectorMapProps {
  sectors: GisSectorTelemetry[];
  selectedSectorId: string | null;
  onSelectSector: (sectorId: string) => void;
  activeLayer?: "severity" | "epicenter" | "isolation";
}

// Coordinates for strategic Nepal crisis sectors
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

const EPICENTER_LAT = 28.0000;
const EPICENTER_LON = 84.6333;

export default function InteractiveVectorMap({
  sectors,
  selectedSectorId,
  onSelectSector,
  activeLayer = "severity",
}: InteractiveVectorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geojsonLayerRef = useRef<any>(null);
  const h3LayerGroupRef = useRef<any>(null);

  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [h3Hexagons, setH3Hexagons] = useState<H3HexagonItem[]>([]);
  const [showH3Grid, setShowH3Grid] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Fetch district polygons and H3 grid
  useEffect(() => {
    fetch("/data/central_nepal_districts.json")
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error("Failed to load district GeoJSON:", err));

    fetchH3GridTelemetry()
      .then((res) => setH3Hexagons(res.hexagons))
      .catch((err) => console.error("Failed to load H3 Grid:", err));
  }, []);

  const getSectorColor = (sector?: GisSectorTelemetry) => {
    if (!sector) return "#64748B";
    if (sector.status === "verified_safe") return "#059669";
    if (sector.status === "verified_damaged" || sector.status === "blackout") return "#E11D48";
    return "#D97706";
  };

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let L: any;
    try {
      L = require("leaflet");
    } catch {
      return;
    }

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapContainerRef.current, {
      center: [27.80, 85.35],
      zoom: 8.5,
      minZoom: 7,
      maxZoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // CartoDB Positron clean basemap
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 16,
        opacity: 0.95,
      }
    ).addTo(map);

    // Epicenter Pulsating Marker
    const epicenterIcon = L.divIcon({
      className: "epicenter-beacon",
      html: `
        <div style="position: relative; width: 22px; height: 22px;">
          <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: #E11D48; opacity: 0.75; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 3px; border-radius: 9999px; background-color: #E11D48; border: 2px solid #FFFFFF; box-shadow: 0 0 8px rgba(225,29,72,0.6);"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    L.marker([EPICENTER_LAT, EPICENTER_LON], { icon: epicenterIcon })
      .bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; padding: 2px;">
          <strong style="color: #E11D48;">M7.8 BARPAK EPICENTER</strong><br/>
          Depth: 8.2 km | Depth Phase: Thrust
        </div>`,
        { permanent: false, direction: "top", offset: [0, -10] }
      )
      .addTo(map);

    // Create LayerGroup for H3 Hexagons
    h3LayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Render District Polygon Layer
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
        const sector = sectors.find((s) => s.sector_id.toLowerCase() === distName);
        const isSelected = selectedSectorId?.toLowerCase() === distName;
        const color = getSectorColor(sector);

        return {
          fillColor: color,
          weight: isSelected ? 3 : 1.5,
          opacity: 0.9,
          color: isSelected ? "#2563EB" : "#334155",
          dashArray: sector?.status === "blackout" ? "4, 4" : undefined,
          fillOpacity: showH3Grid ? 0.08 : isSelected ? 0.45 : 0.25,
        };
      },
      onEachFeature: (feature: any, featureLayer: any) => {
        const distName = (feature.properties.DISTRICT || feature.properties.name || "").toLowerCase();
        const sector = sectors.find((s) => s.sector_id.toLowerCase() === distName);

        featureLayer.on({
          click: () => {
            onSelectSector(distName);
          },
        });

        if (sector) {
          featureLayer.bindTooltip(
            `<div style="font-family: monospace; font-size: 11px; padding: 4px;">
              <strong>${sector.sector_name.toUpperCase()}</strong><br/>
              Status: <span style="font-weight: bold; color: ${getSectorColor(sector)};">${sector.status.replace("_", " ").toUpperCase()}</span><br/>
              Confidence: ${(sector.confidence_score * 100).toFixed(0)}%<br/>
              Epicenter Dist: ${sector.distance_to_epicenter_km.toFixed(0)} km
            </div>`,
            { sticky: true, direction: "auto" }
          );
        }
      },
    }).addTo(map);

    geojsonLayerRef.current = layer;
  }, [isMapReady, geojsonData, sectors, selectedSectorId, showH3Grid]);

  // 4. Render Dynamic H3 Hexagonal Grid
  useEffect(() => {
    if (!isMapReady || !h3LayerGroupRef.current) return;
    const L = require("leaflet");
    const h3Group = h3LayerGroupRef.current;
    h3Group.clearLayers();

    if (!showH3Grid || h3Hexagons.length === 0) return;

    h3Hexagons.forEach((hex) => {
      const polygon = L.polygon(hex.polygon_coordinates, {
        fillColor: hex.status_color,
        fillOpacity: hex.is_blackout ? 0.6 : 0.35,
        color: hex.is_blackout ? "#0C0E12" : hex.status_color,
        weight: hex.is_blackout ? 2.5 : 1,
        dashArray: hex.is_blackout ? "3, 3" : undefined,
      });

      polygon.on("click", () => {
        onSelectSector(hex.sector_id);
      });

      polygon.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; padding: 5px;">
          <strong style="color: ${hex.status_color};">⬡ H3 CELL #${hex.h3_index}</strong><br/>
          <strong>${hex.sector_name.toUpperCase()} (${hex.sub_region})</strong><br/>
          Status: <strong>${hex.threat_tier}</strong><br/>
          Silent Exposure (E_cell): <strong>${hex.silent_exposure_metric_ecell.toLocaleString()}</strong><br/>
          Baseline Pop: ${hex.baseline_population.toLocaleString()} | Reports: ${hex.report_frequency_delta_t}
        </div>`,
        { sticky: true, direction: "auto" }
      );

      polygon.addTo(h3Group);
    });
  }, [isMapReady, showH3Grid, h3Hexagons]);

  // 5. Smooth Camera FlyTo on Sector Selection
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSectorId) return;
    const coords = SECTOR_COORDS[selectedSectorId.toLowerCase()];
    if (coords) {
      mapInstanceRef.current.flyTo(coords, 9.5, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [selectedSectorId]);

  return (
    <div className="surface-calm overflow-hidden relative shadow-sm border border-[#E5E4DC] dark:border-[#232733] rounded-2xl">
      {/* Map Control Floating Bar */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2 font-mono-data text-xs">
        <div className="bg-[#FAF9F5]/90 dark:bg-[#0C0E12]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E5E4DC] dark:border-[#232733] flex items-center gap-2 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-ping" />
          <span className="font-bold text-[#111318] dark:text-[#F4F4F0] text-[11px]">
            CARTOGRAPHY // M7.8 SEQUENCE
          </span>
        </div>

        {/* H3 Grid Toggle */}
        <button
          type="button"
          onClick={() => setShowH3Grid(!showH3Grid)}
          className={`px-3 py-1.5 rounded-xl border font-bold cursor-pointer transition-all ${
            showH3Grid
              ? "bg-[#111318] dark:bg-[#F4F4F0] text-[#FFFFFF] dark:text-[#0C0E12] border-transparent shadow-xs"
              : "bg-[#FAF9F5]/90 dark:bg-[#0C0E12]/90 text-[#5C6270] border-[#E5E4DC] dark:border-[#232733]"
          }`}
        >
          {showH3Grid ? "⬡ H3 MESH (ACTIVE)" : "⬡ ENABLE H3 MESH"}
        </button>
      </div>

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-[440px] sm:h-[500px] z-0"
      />

      {/* Map Legend Footer */}
      <div className="p-3 bg-[#FAF9F5]/95 dark:bg-[#0C0E12]/95 border-t border-[#E5E4DC] dark:border-[#232733] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono-data text-[#5C6270]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" />
            <span>CRITICAL SEVERITY / BLACKOUT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
            <span>MODERATE RISK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
            <span>VERIFIED SAFE</span>
          </div>
        </div>

        <div className="text-[10px]">
          SENTINEL-1 SAR &bull; H3 RES 8 APERTURE
        </div>
      </div>
    </div>
  );
}
