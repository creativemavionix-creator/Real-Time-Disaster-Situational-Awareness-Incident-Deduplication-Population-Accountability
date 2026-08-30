"use client";

import React, { useEffect, useRef, useState } from "react";
import { GisSectorTelemetry } from "@/lib/api";
import "leaflet/dist/leaflet.css";

interface InteractiveVectorMapProps {
  sectors: GisSectorTelemetry[];
  selectedSectorId: string | null;
  onSelectSector: (sectorId: string) => void;
  activeLayer: "severity" | "epicenter" | "isolation";
}

// Barpak, Gorkha Epicenter
const EPICENTER_LAT = 28.0000;
const EPICENTER_LON = 84.6333;

export default function InteractiveVectorMap({
  sectors,
  selectedSectorId,
  onSelectSector,
  activeLayer,
}: InteractiveVectorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geojsonLayerRef = useRef<any>(null);
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Fetch the 8 central Nepal district boundary polygons
  useEffect(() => {
    fetch("/data/central_nepal_districts.json")
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error("Failed to load district GeoJSON:", err));
  }, []);

  const getSectorColor = (sector?: GisSectorTelemetry) => {
    if (!sector) return "#71717A";
    if (sector.status === "verified_safe") return "#3FB950";
    if (sector.status === "verified_damaged" || sector.status === "blackout") return "#E5484D";
    return "#FFB800";
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

    // Fix default marker icon issues in Leaflet with webpack/next
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapContainerRef.current, {
      center: [27.78, 85.35],
      zoom: 8.5,
      minZoom: 7,
      maxZoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // High-contrast Keyless Dark Tactical Basemap (ESRI World Dark Gray Canvas)
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 16,
        opacity: 0.9,
      }
    ).addTo(map);

    // Subtle District & Geographic Labels Layer
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 16,
        opacity: 0.65,
      }
    ).addTo(map);

    // Epicenter Pulsating Marker
    const epicenterIcon = L.divIcon({
      className: "epicenter-beacon",
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: #E5484D; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 3px; border-radius: 9999px; background-color: #E5484D; border: 2px solid #EDEDE8; box-shadow: 0 0 10px #E5484D;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const epicMarker = L.marker([EPICENTER_LAT, EPICENTER_LON], { icon: epicenterIcon }).addTo(map);
    epicMarker.bindPopup(`
      <div style="font-family: monospace; font-size: 11px; color: #0A0A0A; padding: 4px;">
        <strong style="color: #E5484D;">M7.8 SEISMIC EPICENTER</strong><br/>
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

  // 3. Render GeoJSON District Polygons
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
          color: isSelected ? "#FFB800" : "#EDEDE8",
          dashArray: isSelected ? "" : "2, 4",
          fillOpacity: isSelected ? 0.45 : 0.22,
        };
      };

      const layer = L.geoJSON(geojsonData, {
        style: styleFeature,
        onEachFeature: (feature: any, polygonLayer: any) => {
          const sectorId = feature.properties?.sector_id?.toLowerCase();
          const sector = sectorMap.get(sectorId);
          const name = feature.properties?.sector_name || sector?.sector_name || sectorId || "District";

          // Interactive click selection
          polygonLayer.on({
            click: () => {
              if (sectorId) {
                onSelectSector(sectorId);
              }
            },
            mouseover: (e: any) => {
              const l = e.target;
              l.setStyle({
                fillOpacity: 0.6,
                weight: 3,
              });
              l.bringToFront();
            },
            mouseout: (e: any) => {
              layer.resetStyle(e.target);
            },
          });

          // Rich Tooltip
          const sevText = sector ? `Severity: ${sector.severity_index.toFixed(1)}/10` : "No Telemetry";
          const casText = sector ? `Est. Casualties: ${sector.estimated_casualties}` : "";
          const statusBadge = sector?.status ? sector.status.replace("_", " ").toUpperCase() : "UNKNOWN";
          const satBadge = sector?.satellite_corroborated ? " • 🛰️ UNOSAT VERIFIED" : "";

          polygonLayer.bindTooltip(`
            <div style="font-family: monospace; font-size: 11px; background: #0A0A0A; color: #EDEDE8; border: 1px solid #EDEDE840; padding: 6px 10px; border-radius: 2px;">
              <strong style="color: #FFB800; text-transform: uppercase;">${name}</strong> [${statusBadge}${satBadge}]<br/>
              <span>${sevText}</span>${casText ? `<br/><span>${casText}</span>` : ""}
            </div>
          `, { sticky: true, opacity: 0.95 });
        },
      }).addTo(map);

      geojsonLayerRef.current = layer;
    } catch (err) {
      console.error("Leaflet GeoJSON layer render error:", err);
    }
  }, [isMapReady, geojsonData, sectors, selectedSectorId, activeLayer]);

  return (
    <div className="relative w-full h-[520px] bg-[#0A0A0A] border border-[#EDEDE8]/15 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-[#0A0A0A]/90 backdrop-blur-md border border-[#EDEDE8]/20 p-2.5 z-10 font-mono-data text-[10px] space-y-1.5 shadow-lg select-none">
        <div className="text-[#FFB800] font-bold tracking-wider text-[11px]">
          🗺️ HDX UN OCHA DISTRICT COD
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-2 bg-[#E5484D] inline-block" />
          <span className="text-[#EDEDE8]">CRITICAL / DAMAGED / BLACKOUT</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-2 bg-[#FFB800] inline-block" />
          <span className="text-[#EDEDE8]">MODERATE / UNVERIFIED</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-2 bg-[#3FB950] inline-block" />
          <span className="text-[#EDEDE8]">VERIFIED SAFE</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-[#EDEDE8]/10 text-[9px] text-[#EDEDE8]/60">
          <span className="w-2 h-2 rounded-full bg-[#E5484D] inline-block" />
          <span>BARPAK M7.8 EPICENTER</span>
        </div>
      </div>
    </div>
  );
}
