// INSEE Scraper related types
export interface InseeFileMetadata {
  fileName: string;
  url: string;
  year: number;
  month: number;
  fileType: 'monthly' | 'yearly';
}

export interface ScrapedDeceasesFile {
  id: string;
  fileName: string;
  createdAt: Date;
}

export interface DeceasesJobData {
  departmentId?: number;
  sinceDate: string;
  untilDate?: string;
}

export interface DeceasesIngestJobData {
  s3Path?: string; // Optional for manual triggering with specific S3 path
  year?: number; // For scheduled downloads
  month?: number; // For scheduled downloads
}

export interface DeceasesCsvProcessJobData {
  fileName: string;
  s3Path?: string; // Optional S3 path for the CSV file
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

export interface InseeCsvRow {
  nomprenom: string; // "LASTNAME*FIRSTNAME/"
  sexe: string; // "1" (male) or "2" (female)
  datenaiss: string; // Birth date YYYYMMDD
  lieunaiss: string; // INSEE birth location code
  commnaiss: string; // Birth commune name
  paysnaiss: string; // Birth country (empty if France)
  datedeces: string; // Death date YYYYMMDD
  lieudeces: string; // INSEE death location code
  actedeces: string; // Death certificate number
}

export interface CsvProcessingStats {
  totalRecords: number;
  recordsProcessed: number;
  recordsFiltered: number; // Filtered by age
  mairieInfoAttempts: number;
  mairieInfoSuccesses: number;
  opportunitiesInserted: number;
  errors: number;
  failedRows: Array<{
    row: InseeCsvRow;
    error: string;
  }>;
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

export interface MairieAddress {
  complement1: string;
  complement2: string;
  numero_voie: string;
  service_distribution: string;
  code_postal: string;
  nom_commune: string;
}

export interface RawMairieAddress {
  type_adresse: 'Adresse' | 'Adresse postale';
  complement1: string;
  complement2: string;
  numero_voie: string;
  service_distribution: string;
  code_postal: string;
  nom_commune: string;
  pays: string;
  continent: string;
  longitude: string;
  latitude: string;
}

export interface RawMairieData {
  nom: string;
  telephone?: string;
  adresse_courriel?: string;
  telephone_accueil?: string;
  adresse: string;
}

export interface ApiLannuaireResponse {
  total_count: number;
  results: RawMairieData[];
}

// Contact data for mairie information
export interface MairieContactInfo {
  name?: string;
  phone?: string;
  email?: string;
  address: MairieAddress;
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
  mairieInfo?: MairieContactInfo; // For contactData
  extraData: {
    firstName: string;
    lastName: string;
  };
}
