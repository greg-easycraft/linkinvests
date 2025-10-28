"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

interface StreetViewProps {
  address?: string | null;
  latitude: number;
  longitude: number;
  className?: string;
}

// Global flag to ensure setOptions is only called once
let isConfigured = false;

export function StreetView({
  address,
  latitude,
  longitude,
  className = "",
}: StreetViewProps): React.ReactElement {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStreetView, setHasStreetView] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set");
      setError("Configuration API manquante");
      setHasStreetView(false);
      setIsLoading(false);
      return;
    }

    // Configure the loader only once
    if (!isConfigured) {
      setOptions({
        apiKey: apiKey,
        version: "weekly",
      });
      isConfigured = true;
    }

    // Load Street View library
    Promise.all([importLibrary("streetView"), importLibrary("core")])
      .then(async ([streetViewLib, coreLib]) => {
        if (!streetViewRef.current) return;

        const position = { lat: latitude, lng: longitude };

        // Access StreetViewService from core library
        const { StreetViewService, StreetViewStatus } = coreLib as google.maps.CoreLibrary;
        const { StreetViewPanorama } = streetViewLib as google.maps.StreetViewLibrary;

        // Check if Street View is available at this location
        const streetViewService = new StreetViewService();
        streetViewService.getPanorama(
          { location: position, radius: 50 },
          (data, status) => {
            if (status === StreetViewStatus.OK && data) {
              // Street View is available
              setHasStreetView(true);

              if (streetViewRef.current) {
                new StreetViewPanorama(streetViewRef.current, {
                  position: position,
                  pov: {
                    heading: 0,
                    pitch: 0,
                  },
                  zoom: 1,
                  addressControl: false,
                  linksControl: true,
                  panControl: true,
                  enableCloseButton: false,
                  fullscreenControl: false,
                });
              }
            } else {
              // No Street View available
              setHasStreetView(false);
            }
            setIsLoading(false);
          },
        );
      })
      .catch((err) => {
        console.error("Failed to load Google Maps API", err);
        setError("Erreur de chargement");
        setHasStreetView(false);
        setIsLoading(false);
      });
  }, [latitude, longitude]);

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-neutral-100 text-neutral-500 text-sm ${className}`}
      >
        <div className="text-center p-4">
          <div className="animate-pulse">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!hasStreetView || error) {
    return (
      <div
        className={`flex items-center justify-center bg-neutral-100 text-neutral-500 text-sm ${className}`}
      >
        <div className="text-center p-4">
          <p>{error ?? "Street View non disponible"}</p>
          {address && <p className="text-xs mt-1">{address}</p>}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={streetViewRef}
      className={`bg-neutral-100 ${className}`}
      style={{ minHeight: "200px" }}
    />
  );
}
