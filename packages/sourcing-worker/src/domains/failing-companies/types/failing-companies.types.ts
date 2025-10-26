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
}

export interface ListePersonnesData {
  numeroIdentification: string; // SIREN (9 digits)
  denomination?: string;
  activite?: string;
  nomPatronymique?: string;
  prenom?: string;
  [key: string]: any; // Allow for additional fields
}

export interface CompanyEstablishment {
  siret: string;
  companyName: string;
  address: string;
  zipCode: string;
  city: string;
  department: number;
  latitude: number;
  longitude: number;
}
