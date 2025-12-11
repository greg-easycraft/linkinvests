import { AuctionInput, EnergyClass, GazClass } from '@linkinvests/shared';

export interface AuctionListing {
  url: string;
  auctionDate?: string;
}

// JSON data structure interfaces for type safety
export interface NextDataJson {
  query?: {
    lot_id?: string;
    categorie?: string;
    sous_categorie?: string;
  };
  props: {
    pageProps?: {
      apolloState?: {
        data?: {
          [key: string]: LotData | AdressData;
        };
      };
    };
  };
}

export interface AddressData {
  text?: string;
  coords?: [number, number]; // [longitude, latitude]
  ville?: string;
  region?: string;
}

export interface OrganisateurData {
  nom?: string;
  __typename?: string;
}

export enum LotOccupationStatus {
  OCCUPIED_BY_OWNER = 'Occupé',
  RENTED = 'Loué',
  FREE = 'Libre de toute occupation',
}

export interface LotData {
  __typename?: 'Lot';
  id: string;
  nom: string;
  description?: string;
  photo?: string;
  offre_actuelle?: number | string;
  estimation_basse?: number | string;
  estimation_haute?: number | string;
  prix_plancher?: number | string;
  fermeture_reelle_date?: number | string;
  encheres_fermeture_date?: number | string;
  fermeture_date?: number | string;
  critere_consommation_energetique?: EnergyClass;
  critere_emissions_de_gaz?: GazClass;
  critere_surface_habitable?: number | string;
  critere_nombre_de_pieces?: number | string;
  critere_occupation_du_bien?: LotOccupationStatus;
  photos?: {
    src: string;
  }[];
  adresse?: {
    _ref: string;
  };
  adresse_physique?: {
    _ref: string;
  };
  organisateur?: OrganisateurData;
}

export interface AdressData {
  __typename: 'Adresse';
  id: string;
  ville: string;
  ville_slug: string;
  text: string;
  region: string;
  departement: string;
  region_slug: string;
  department_slug: string;
  coords: [number, number];
}

export type RawAuctionInput = Omit<AuctionInput, 'zipCode'> & {
  city: string;
  latitude?: number;
  longitude?: number;
};

export interface ScraperResult {
  success: boolean;
  totalFound: number;
  totalProcessed: number;
  totalInserted: number;
  errors: string[];
}
