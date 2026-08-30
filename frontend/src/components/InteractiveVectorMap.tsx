"use client";

import React, { useEffect, useRef, useState } from "react";
import { GisSectorTelemetry, fetchH3GridTelemetry, H3HexagonItem } from "@/lib/api";
import "leaflet/dist/leaflet.css";

interface InteractiveVectorMapProps {
  sectors: GisSectorTelemetry[];
  selectedSectorId: string | null;
  onSelectSector: (sectorId: string) => void;
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

const EPICENTER_LAT = 28.0000;
const EPICENTER_LON = 84.6333;

export default function InteractiveVectorMap({
  sectors,
  selectedSectorId,
  onSelectSector,
}: InteractiveVectorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geojsonLayerRef = useRef<any>(null);
  const h3LayerGroupRef = useRef<any>(null);

  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [h3Hexagons, setH3Hexagons] = useState<H3HexagonItem[]>([]);
  const [showH3Grid, setShowH3Grid] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

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

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let L: any;
    try {
      L = require("leaflet");
    } catch {
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: [27.80, 85.35],
      zoom: 8.5,
      minZoom: 7,
      maxZoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "bottomleft" }).addTo(map);

    // Esri Dark Gray Canvas for a premium, unmarked, clean dark map
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 16,
        opacity: 0.9,
      }
    ).addTo(map);

    const epicenterIcon = L.divIcon({
      className: "epicenter-beacon",
      html: `
        <div style="position: relative; width: 22px; height: 22px;">
          <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: #E11D48; opacity: 0.75; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 3px; border-radius: 9999px; background-color: #E11D48; border: 2px solid #090B0E; box-shadow: 0 0 8px rgba(225,29,72,0.6);"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    L.marker([EPICENTER_LAT, EPICENTER_LON], { icon: epicenterIcon }).addTo(map);

    h3LayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

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
          weight: isSelected ? 2 : 1,
          opacity: 0.8,
          color: isSelected ? "#FFFFFF" : "#1F2937",
          dashArray: sector?.status === "blackout" ? "4, 4" : undefined,
          fillOpacity: showH3Grid ? 0.05 : isSelected ? 0.3 : 0.15,
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
  }, [isMapReady, geojsonData, sectors, selectedSectorId, showH3Grid]);

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
  }, [isMapReady, showH3Grid, h3Hexagons]);

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
    <div className="absolute inset-0 z-0 bg-[#090B0E]">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Sleek Floating Controls */}
      <div className="absolute top-24 left-8 z-[400] flex flex-col gap-4 pointer-events-auto">
        <button
          type="button"
          onClick={() => setShowH3Grid(!showH3Grid)}
          className="px-4 py-2 rounded-full backdrop-blur-md bg-[#090B0E]/60 border border-white/10 font-mono-data text-[10px] tracking-widest text-[#94A3B8] hover:text-white transition-all cursor-pointer uppercase shadow-lg"
        >
          {showH3Grid ? "Disable H3 Mesh" : "Enable H3 Mesh"}
        </button>
      </div>

      <div className="absolute bottom-8 left-8 z-[400] flex flex-col gap-3 font-mono-data text-[9px] tracking-[0.2em] text-[#64748B] pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
          CRITICAL SEVERITY
        </div>
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
          MODERATE RISK
        </div>
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
          VERIFIED SAFE
        </div>
      </div>
    </div>
  );
}
