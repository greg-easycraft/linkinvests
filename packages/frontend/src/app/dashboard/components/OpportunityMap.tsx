"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { X } from "lucide-react";
import type { Opportunity } from "~/server/domains/opportunities/lib.types";
import { OpportunityType } from "@linkinvests/shared";

interface OpportunityMapProps {
  opportunities: Opportunity[];
  selectedId?: number;
  onSelect: (opportunity: Opportunity) => void;
  onBoundsChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  isLimited?: boolean;
  total?: number;
}

const TYPE_COLORS: Record<OpportunityType, string> = {
  [OpportunityType.SUCCESSION]: "#3b82f6",
  [OpportunityType.LIQUIDATION]: "#ef4444",
  [OpportunityType.ENERGY_SIEVE]: "#10b981",
  [OpportunityType.REAL_ESTATE_LISTING]: "#f59e0b",
  [OpportunityType.AUCTION]: "#8b5cf6",
  [OpportunityType.DIVORCE]: "#ec4899",
};

const TYPE_LABELS: Record<OpportunityType, string> = {
  [OpportunityType.SUCCESSION]: "Succession",
  [OpportunityType.LIQUIDATION]: "Liquidation",
  [OpportunityType.ENERGY_SIEVE]: "Passoire énergétique",
  [OpportunityType.REAL_ESTATE_LISTING]: "Annonce immobilière",
  [OpportunityType.AUCTION]: "Vente aux enchères",
  [OpportunityType.DIVORCE]: "Divorce",
};

export function OpportunityMap({
  opportunities,
  selectedId,
  onSelect,
  onBoundsChange,
  isLimited = false,
  total = 0,
}: OpportunityMapProps): React.ReactElement {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isDisclaimerVisible, setIsDisclaimerVisible] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not set");
      return;
    }

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
      const color = TYPE_COLORS[opportunity.type as OpportunityType];

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
              <div style="font-size: 12px; color: #666;">${TYPE_LABELS[opportunity.type as OpportunityType]}</div>
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

      {/* Disclaimer for limited results */}
      {isLimited && isDisclaimerVisible && (
        <div className="absolute top-4 left-4 right-4 bg-amber-500 text-white p-4 rounded-lg shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <div className="font-semibold mb-1 font-heading">Affichage limité</div>
              <div className="text-sm">
                {total} opportunités correspondent à vos critères, mais seules les 500
                premières sont affichées. Veuillez affiner vos filtres pour voir des
                résultats plus précis.
              </div>
            </div>
            <button
              onClick={() => setIsDisclaimerVisible(false)}
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-[var(--secundary)] text-[var(--primary)] p-4 rounded-lg shadow-lg">
        <div className="text-sm font-semibold mb-2 font-heading">Types d'opportunités</div>
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
