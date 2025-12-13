export interface FailingCompanyCsvRow {
  numerodepartement: string;
  departement_nom_officiel: string;
  familleavis_lib: string;
  typeavis_lib: string;
  dateparution: string;
  commercant: string;
  ville: string;
  cp: string;
  listepersonnes: string; // JSON string
  jugement: string;
  error_reason?: string; // Optional field for tracking processing errors
}

export interface NumeroImmatriculation {
  numeroIdentification: string; // SIREN (9 digits)
}

export interface PersonneData {
  numeroImmatriculation?: NumeroImmatriculation;
  denomination?: string;
  activite?: string;
  nomPatronymique?: string;
  prenom?: string;
}

export interface ListePersonnesData {
  personne?: PersonneData;
  [key: string]: any; // Allow for additional fields
}

export interface CompanyEstablishment {
  siret: string;
  companyName: string;
  streetAddress: string;
  zipCode: string;
  city: string;
  department: string;
  latitude: number;
  longitude: number;
  opportunityDate: string; // Date de parution from CSV
}
