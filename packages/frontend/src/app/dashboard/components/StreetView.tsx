"use client";
import { useApiIsLoaded } from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';

interface StreetViewProps {
  address?: string | null;
  latitude: number;
  longitude: number;
  className?: string;
}

export function StreetView({ latitude, longitude }: StreetViewProps): React.ReactElement {
  // Define the coordinates (Latitude and Longitude) for Street View
  const position = { lat: latitude, lng: longitude }; // Example: Los Angeles

  // 1. Reference for the DOM element where the Panorama will render
  const panoRef = useRef(null);
  // 2. Check if the Maps API is loaded
  const apiLoaded = useApiIsLoaded();
  // The StreetViewPanorama is often a child of the Map component
  // to link the map's view and the panorama.
  useEffect(() => {
    // Check if both the API is loaded and the DOM element is available
    if (apiLoaded && panoRef.current) {
      // 3. Create the standard Google Maps StreetViewPanorama object
      new google.maps.StreetViewPanorama(
        panoRef.current,
        {
          position: position,
          pov: {
            heading: 270, // Initial compass heading (0-360)
            pitch: 0      // Initial up/down pitch (-90 to 90)
          },
          visible: true
        }
      );
    }
  }, [apiLoaded, position]); // Re-run effect if API loads or position changes

  // 4. Return the div container
  return (
    <div
      ref={panoRef}
      style={{ height: '300px', width: '90%', border: '1px solid black', margin: '0 auto', borderRadius: '10px' }}
    />
  );
};