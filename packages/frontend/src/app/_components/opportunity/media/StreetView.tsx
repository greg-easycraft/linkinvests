"use client";
import { useApiIsLoaded } from '@vis.gl/react-google-maps';
import { useEffect, useRef, useState } from 'react'; // Import useState

interface StreetViewProps {
  address: string | null; // Use address as the primary input
  latitude: number; // Remove or make optional if address is primary
  longitude: number; // Remove or make optional if address is primary
  className?: string;
}

// Define the LatLng literal type for the position state
type LatLngLiteral = { lat: number; lng: number } | null;

export function StreetView({ address, latitude, longitude }: StreetViewProps): React.ReactElement {
  // 1. State to hold the resolved coordinates
  const [position, setPosition] = useState<LatLngLiteral>({ lat: latitude, lng: longitude });

  // 2. Reference for the DOM element where the Panorama will render
  const panoRef = useRef(null);
  // 3. Check if the Maps API is loaded
  const apiLoaded = useApiIsLoaded();

  // --- Geocoding Effect (Address to Coordinates) ---
  useEffect(() => {
    if (apiLoaded && address) {
      // Create a Geocoder instance
      const geocoder = new google.maps.Geocoder();

      // Geocode the address
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          // Set the position state with the first result's coordinates
          const newPosition = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          };
          setPosition(newPosition);
        } else {
          console.error(`Geocode failed for address "${address}" due to: ${status}`);
          // Handle error (e.g., set an error state, display a message)
        }
      });
    }
  }, [apiLoaded, address]); // Re-run effect if API loads or address changes

  // --- Street View Panorama Effect (Render the Panorama) ---
  useEffect(() => {
    // Check if both the API is loaded, the DOM element is available, AND we have coordinates
    if (apiLoaded && panoRef.current && position) {
      // 4. Create the standard Google Maps StreetViewPanorama object
      new google.maps.StreetViewPanorama(
        panoRef.current,
        {
          position: position, // Use the dynamically resolved position
          pov: {
            heading: 270,
            pitch: 0
          },
          visible: true
        }
      );
    }
    // Dependency on position ensures the panorama is created/updated once coordinates are found
  }, [apiLoaded, position]);

  // 5. Return the div container
  return (
    <div
      ref={panoRef}
      style={{ height: '300px', width: '90%', border: '1px solid black', margin: '0 auto', borderRadius: '10px' }}
    >
        {/* Optional: Add a loading state */}
        {!position && apiLoaded && address && <p>Loading Street View for {address}...</p>}
        {/* Optional: Add an error/not-found message */}
        {!position && apiLoaded && address && !panoRef.current && <p>Street View not available or address not found.</p>}
    </div>
  );
}
