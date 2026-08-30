"use client";

import React, { useEffect, useRef, useState } from "react";
import { GisSectorTelemetry } from "@/lib/api";
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
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Fetch district polygons
  useEffect(() => {
    fetch("/data/central_nepal_districts.json")
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error("Failed to load district GeoJSON:", err));
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

    const epicMarker = L.marker([EPICENTER_LAT, EPICENTER_LON], { icon: epicenterIcon }).addTo(map);
    epicMarker.bindPopup(`
      <div style="font-family: monospace; font-size: 11px; color: #111318; padding: 4px;">
        <strong style="color: #E11D48;">M7.8 SEISMIC EPICENTER</strong><br/>
        Barpak, Gorkha (28.00°N, 84.63°E)<br/>
        Depth: 15.0 km | Focal Shaking: IX
      </div>
    `);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Smooth flyTo camera transition when selectedSectorId changes
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

  // 4. Render GeoJSON District Polygons
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !geojsonData) return;
    
    try {
      const L = require("leaflet");
      const map = mapInstanceRef.current;

      if (geojsonLayerRef.current) {
        map.removeLayer(geojsonLayerRef.current);
        geojsonLayerRef.current = null;
      }

      const sectorMap = new Map(sectors.map((s) => [s.sector_id.toLowerCase(), s]));

      const styleFeature = (feature: any) => {
        const sectorId = feature.properties?.sector_id?.toLowerCase();
        const sector = sectorMap.get(sectorId);
        const isSelected = selectedSectorId?.toLowerCase() === sectorId;
        const baseColor = getSectorColor(sector);

        return {
          fillColor: baseColor,
          weight: isSelected ? 3 : 1.5,
          opacity: 1,
          color: isSelected ? "#2563EB" : "#94A3B8",
          dashArray: isSelected ? "" : "2, 4",
          fillOpacity: isSelected ? 0.45 : 0.2,
        };
      };

      const layer = L.geoJSON(geojsonData, {
        style: styleFeature,
        onEachFeature: (feature: any, polygonLayer: any) => {
          const sectorId = feature.properties?.sector_id?.toLowerCase();
          const sector = sectorMap.get(sectorId);
          const name = feature.properties?.sector_name || sector?.sector_name || sectorId || "District";

          polygonLayer.on({
            click: () => {
              if (sectorId) {
                onSelectSector(sectorId);
              }
            },
            mouseover: (e: any) => {
              const l = e.target;
              l.setStyle({
                fillOpacity: 0.55,
                weight: 2.5,
              });
              l.bringToFront();
            },
            mouseout: (e: any) => {
              layer.resetStyle(e.target);
            },
          });

          const sevText = sector ? `Severity: ${sector.severity_index.toFixed(1)}/10` : "No Telemetry";
          const casText = sector ? `Est. Casualties: ${sector.estimated_casualties}` : "";
          const statusBadge = sector?.status ? sector.status.replace("_", " ").toUpperCase() : "UNKNOWN";
          const satBadge = sector?.satellite_corroborated ? " • 🛰️ SATELLITE VERIFIED" : "";

          polygonLayer.bindTooltip(`
            <div style="font-family: var(--font-mono, monospace); font-size: 11px; background: #111318; color: #F4F4F0; border: 1px solid #334155; padding: 6px 10px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
              <strong style="color: #60A5FA; text-transform: uppercase;">${name}</strong> [${statusBadge}${satBadge}]<br/>
              <span>${sevText}</span>${casText ? `<br/><span>${casText}</span>` : ""}
            </div>
          `, { sticky: true, opacity: 0.98 });
        },
      }).addTo(map);

      geojsonLayerRef.current = layer;
    } catch (err) {
      console.error("Leaflet GeoJSON layer render error:", err);
    }
  }, [isMapReady, geojsonData, sectors, selectedSectorId, activeLayer, onSelectSector]);

  return (
    <div className="relative w-full h-[540px] surface-calm overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 surface-elevated p-3 z-10 font-mono-data text-[10px] space-y-1.5 shadow-md select-none max-w-xs">
        <div className="text-[#2563EB] dark:text-[#60A5FA] font-bold tracking-wider text-[11px]">
          🗺️ CENTRAL NEPAL CRISIS RADAR
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] inline-block" />
          <span className="text-[#111318] dark:text-[#F4F4F0]">CRITICAL / DAMAGED / BLACKOUT</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] inline-block" />
          <span className="text-[#111318] dark:text-[#F4F4F0]">MODERATE / UNVERIFIED</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#059669] inline-block" />
          <span className="text-[#111318] dark:text-[#F4F4F0]">VERIFIED SAFE LOGISTICS</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-[#E5E4DC] dark:border-[#232733] text-[9px] text-[#5C6270]">
          <span className="w-2 h-2 rounded-full bg-[#E11D48] inline-block animate-ping" />
          <span>M7.8 BARPAK RUPTURE EPICENTER</span>
        </div>
      </div>
    </div>
  );
}
