"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Opportunity, OpportunityType } from "@linkinvests/shared";
import { env } from "~/lib/env";
import { TYPE_LABELS, TYPE_COLORS } from "~/constants/opportunity-types";

interface OpportunityMapProps {
  opportunities: Opportunity[];
  selectedId?: string;
  onSelect: (opportunity: Opportunity) => void;
  onBoundsChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  type: OpportunityType;
}


export function OpportunityMap({
  opportunities,
  selectedId,
  onSelect,
  onBoundsChange,
  type,
}: OpportunityMapProps): React.ReactElement {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = env.NEXT_PUBLIC_MAPBOX_TOKEN;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [2.3522, 48.8566], // Paris
      zoom: 5,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    map.current.on("moveend", () => {
      if (map.current && onBoundsChange) {
        const bounds = map.current.getBounds();
        if (bounds) {
          onBoundsChange({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          });
        }
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [onBoundsChange]);

  // Handle window resize events (e.g., when sidebar toggles)
  useEffect(() => {
    const handleResize = () => {
      if (map.current) {
        map.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (opportunities.length === 0) return;

    // Add new markers
    opportunities.forEach((opportunity) => {
      const color = TYPE_COLORS[type];

      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.backgroundColor = color;
      el.style.width = "12px";
      el.style.height = "12px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid white";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

      if (selectedId === opportunity.id) {
        el.style.width = "16px";
        el.style.height = "16px";
        el.style.border = "3px solid white";
      }

      if (!map.current) return;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([opportunity.longitude, opportunity.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 15 }).setHTML(
            `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${opportunity.label}</div>
              <div style="font-size: 12px; color: #666;">${TYPE_LABELS[type]}</div>
              <div style="font-size: 12px; color: #666;">${opportunity.address ?? "Non disponible"}</div>
            </div>
          `,
          ),
        )
        .addTo(map.current);

      el.addEventListener("click", () => {
        onSelect(opportunity);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (opportunities.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      opportunities.forEach((opp) => {
        bounds.extend([opp.longitude, opp.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [opportunities, selectedId, onSelect, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-[var(--secundary)] text-[var(--primary)] p-4 rounded-lg shadow-lg">
        <div className="text-sm font-semibold mb-2 font-heading">Types d&apos;opportunités</div>
        <div className="space-y-1">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>{TYPE_LABELS[type as OpportunityType]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
