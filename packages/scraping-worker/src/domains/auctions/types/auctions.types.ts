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
  critere_consommation_energetique?: string;
  critere_surface_habitable?: number | string;
  critere_nombre_de_pieces?: number | string;
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

// Local type for scraping worker - includes URL and uses auctionDate
export interface AuctionOpportunity {
  url: string; // URL of the auction listing (for externalId)
  label: string;
  address: string;
  zipCode: string;
  department: string;
  latitude: number;
  longitude: number;
  auctionDate: string; // Will be mapped to opportunityDate in repository
  extraData?: {
    id?: string; // Auction ID from query
    url?: string; // Original auction URL
    auctionType?: string; // Type of auction
    propertyType?: string; // Property category
    currentPrice?: number; // Current bid amount
    lowerEstimate?: number; // Lower price estimate
    upperEstimate?: number; // Upper price estimate
    reservePrice?: number; // Reserve price (prix_plancher)
    price?: number; // Legacy field for compatibility
    description?: string;
    dpe?: string; // Energy performance rating
    squareFootage?: number; // Surface area in m²
    rooms?: number; // Number of rooms
    auctionVenue?: string; // Will be used for contactData
  };
  images?: string[];
}

export type RawAuctionOpportunity = Omit<AuctionOpportunity, 'zipCode'> & {
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
