export interface DeceasesJobData {
  departmentId?: number;
  sinceDate: string;
  untilDate?: string;
}

export interface InseeDeathRecord {
  nomPrenom: string;
  sexe: string; // '1' for Homme, '2' for Femme
  dateNaissance: string; // Format: YYYYMMDD
  lieuNaissance: string; // INSEE code
  communeNaissance: string;
  paysNaissance: string;
  dateDeces: string; // Format: YYYYMMDD
  lieuDeces: string; // INSEE code
  acteDeces: string;
}

export interface ApiGouvCommuneResponse {
  nom: string;
  code: string;
  codeDepartement: string;
  codeRegion: string;
  codesPostaux: string[];
  population: number;
  centre?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface ApiLannuaireMairieRecord {
  nom: string;
  telephone?: string;
  email?: string;
  adresse_courriel?: string;
  telephone_accueil?: string;
}

export interface ApiLannuaireResponse {
  total_count: number;
  results: Array<{
    nom?: string;
    telephone?: string;
    email?: string;
    adresse_courriel?: string;
    telephone_accueil?: string;
  }>;
}

// Contact data for mairie information
export interface MairieInfo {
  name?: string;
  telephone?: string;
  email?: string;
  adresse_courriel?: string;
  telephone_accueil?: string;
}

export interface DeceasesOpportunity {
  inseeDeathId: string; // For externalId: combination of lieuDeces + dateDeces
  label: string;
  siret: null;
  address: string;
  zipCode: string;
  department: string;
  latitude: number;
  longitude: number;
  opportunityDate: string; // Format: YYYY-MM-DD
  mairieInfo?: MairieInfo; // For contactData
}
