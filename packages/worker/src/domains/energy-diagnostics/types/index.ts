import { EnergyDiagnosticInput } from '@linkinvests/shared';

export abstract class EnergyDiagnosticsRepository {
  abstract insertOpportunities(
    opportunities: EnergyDiagnosticInput[],
    batchSize?: number
  ): Promise<number>;
}

export interface DpeRecord {
  numero_dpe: string; // DPE certificate number
  adresse_ban: string; // Standardized address
  code_postal_ban: string; // Postal code
  nom_commune_ban: string; // Municipality name
  code_departement_ban: string; // Department code
  etiquette_dpe: string; // Energy efficiency rating (A-G)
  etiquette_ges: string; // GHG emissions rating (A-G)
  _geopoint: string; // Coordinates in format "lat,lon"
  date_etablissement_dpe?: string; // DPE establishment date (YYYY-MM-DD)
  date_reception_dpe?: string; // DPE reception date (YYYY-MM-DD)
  type_batiment?: string; // Building type (appartement, maison, immeuble)
  annee_construction?: string; // Construction year
  surface_habitable_logement: number; // Living area in m²
}

export interface DpeApiResponse {
  total: number; // Total number of records matching the query
  results: DpeRecord[]; // Array of DPE records
}

export interface EnergyDiagnosticJobData {
  departmentId: string; // French department code (e.g., 75 for Paris)
  sinceDate: string; // Filter DPE records since this date (format: YYYY-MM-DD)
  beforeDate?: string; // Filter DPE records before this date (format: YYYY-MM-DD, optional)
  energyClasses?: string[]; // Array of energy classes to fetch (default: ["F", "G"])
}
