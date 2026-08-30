"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export function HeroMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let L: any;
    try {
      L = require("leaflet");
    } catch {
      return;
    }

    // Fix marker icons
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapContainerRef.current, {
      center: [27.95, 85.25],
      zoom: 8.4,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    // Clean OpenStreetMap style / Positron Carto tile layer for soft, modern backdrop
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 16,
      subdomains: "abcd",
    }).addTo(map);

    // Radar Circles representing crisis zones matching reference screenshots
    // 1. Gorkha (Purple Radar - Epicenter)
    L.circle([28.005, 84.633], {
      color: "#8B5CF6",
      fillColor: "#8B5CF6",
      fillOpacity: 0.25,
      radius: 28000,
      weight: 2,
      dashArray: "4, 6",
    }).addTo(map);

    // 2. Sindhupalchok (Rose Radar - Severe Destruction)
    L.circle([27.95, 85.70], {
      color: "#F43F5E",
      fillColor: "#F43F5E",
      fillOpacity: 0.22,
      radius: 22000,
      weight: 2,
    }).addTo(map);

    // 3. Kathmandu (Gold/Amber Radar - High Density Urban Impact)
    L.circle([27.717, 85.324], {
      color: "#F59E0B",
      fillColor: "#F59E0B",
      fillOpacity: 0.22,
      radius: 18000,
      weight: 2,
    }).addTo(map);

    // 4. Rasuwa (Indigo Radar - Remote Cutoff Zone)
    L.circle([28.15, 85.30], {
      color: "#6366F1",
      fillColor: "#6366F1",
      fillOpacity: 0.22,
      radius: 20000,
      weight: 2,
      dashArray: "4, 6",
    }).addTo(map);

    // Custom Glowing Marker Pins
    const createPin = (color: string, label: string) => {
      return L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
            <div style="background-color: ${color}; color: white; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; box-shadow: 0 4px 10px rgba(0,0,0,0.25); white-space: nowrap; border: 2px solid white; display: flex; align-items: center; gap: 4px;">
              <span style="width: 5px; height: 5px; border-radius: 50%; background-color: white;"></span>
              ${label}
            </div>
            <div style="width: 2px; height: 8px; background-color: ${color};"></div>
          </div>
        `,
        iconSize: [0, 0],
      });
    };

    L.marker([28.005, 84.633], { icon: createPin("#8B5CF6", "गोर्खा // Gorkha (Epicenter)") }).addTo(map);
    L.marker([27.95, 85.70], { icon: createPin("#F43F5E", "सिन्धुपाल्चोक // Sindhupalchok") }).addTo(map);
    L.marker([27.717, 85.324], { icon: createPin("#F59E0B", "काठमाडौँ // Kathmandu") }).addTo(map);
    L.marker([28.15, 85.30], { icon: createPin("#6366F1", "रसुवा // Rasuwa") }).addTo(map);

    mapInstanceRef.current = map;

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Floating Status Pill Overlay */}
      <div className="absolute top-4 right-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 text-[11px] font-semibold text-slate-800 dark:text-slate-200">
        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
        <span>LIVE SATELLITE & TELEMETRY RADAR</span>
      </div>

      {/* Bottom Map Info Pill */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-md shadow-xs border border-slate-200/60 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
        Leaflet | OpenStreetMap | CartoDB
      </div>
    </div>
  );
}
