export interface RechercheEntreprisesResponse {
  results: RechercheEntreprisesResult[];
  total_results: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface RechercheEntreprisesResult {
  siren: string;
  nom_complet: string;
  nom_raison_sociale?: string;
  nombre_etablissements: number;
  siege: Etablissement;
  matching_etablissements: Etablissement[];
  section_activite_principale?: string;
  activite_principale?: string;
  nature_juridique?: string;
  date_creation?: string;
  etat_administratif?: string;
}

export interface Etablissement {
  siret: string;
  activite_principale?: string;
  adresse: string;
  code_postal: string;
  commune: string;
  libelle_commune: string;
  departement?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  geo_adresse?: string;
  etat_administratif?: string;
  est_siege?: boolean;
  date_creation?: string;
  date_debut_activite?: string;
}
