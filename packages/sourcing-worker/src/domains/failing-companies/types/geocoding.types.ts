export interface GeocodingResponse {
  type: 'FeatureCollection';
  version: string;
  features: GeocodingFeature[];
  attribution: string;
  licence: string;
  query: string;
  limit: number;
}

export interface GeocodingFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    label: string;
    score: number;
    housenumber?: string;
    id?: string;
    name?: string;
    postcode?: string;
    citycode?: string;
    x?: number;
    y?: number;
    city?: string;
    context?: string;
    type?: string;
    importance?: number;
    street?: string;
  };
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
