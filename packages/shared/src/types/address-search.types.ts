import { EnergyClass } from "../constants/opportunity";

// Address search input interface for the search form
export interface AddressSearchInput {
  // DPE energy class (A-G rating)
  energyClass: EnergyClass;
  // Square footage in square meters
  squareFootage: number;
  // 5-digit postal code (required)
  zipCode: string;
  // Optional partial address for additional matching
  address?: string;
  // Optional photo file for reference
  photo?: File;
}

// Address search result interface
export interface AddressSearchResult {
  id: string;
  // Confidence score from 0-100 indicating match quality
  matchScore: number;
  // Full property address
  address: string;
  // Postal code
  zipCode: string;
  // Department number
  department: string;
  // Energy class if available
  energyClass: string;
  // Square footage if available (estimated or actual)
  squareFootage: number;
  // Coordinates for map display
  latitude?: number;
  longitude?: number;
  // Additional context about the match
  matchReasons?: string[];
  // Original energy diagnostic data
  energyDiagnosticId: string;
}

// Energy classes enum for type safety
export const ENERGY_CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;