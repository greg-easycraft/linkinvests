import { OpportunityType } from '@linkinvests/shared';

const AUCTION_HEADERS: Record<string, string> = {
  id: 'ID',
  label: 'Titre',
  address: 'Adresse',
  zipCode: 'Code postal',
  department: 'Département',
  opportunityDate: 'Date de vente',
  currentPrice: 'Prix actuel',
  reservePrice: 'Mise à prix',
  lowerEstimate: 'Estimation basse',
  upperEstimate: 'Estimation haute',
  squareFootage: 'Surface (m²)',
  rooms: 'Pièces',
  propertyType: 'Type de bien',
  energyClass: 'DPE',
  auctionVenue: 'Lieu de vente',
  occupationStatus: 'Statut d\'occupation',
  url: 'URL',
  source: 'Source',
  createdAt: 'Date de création',
};

const LISTING_HEADERS: Record<string, string> = {
  id: 'ID',
  label: 'Titre',
  address: 'Adresse',
  zipCode: 'Code postal',
  department: 'Département',
  opportunityDate: 'Date de publication',
  price: 'Prix',
  squareFootage: 'Surface (m²)',
  rooms: 'Pièces',
  bedrooms: 'Chambres',
  propertyType: 'Type de bien',
  energyClass: 'DPE',
  sellerType: 'Type de vendeur',
  url: 'URL',
  source: 'Source',
  createdAt: 'Date de création',
};

const SUCCESSION_HEADERS: Record<string, string> = {
  id: 'ID',
  label: 'Titre',
  firstName: 'Prénom',
  lastName: 'Nom',
  address: 'Adresse',
  zipCode: 'Code postal',
  department: 'Département',
  opportunityDate: 'Date du décès',
  createdAt: 'Date de création',
};

const LIQUIDATION_HEADERS: Record<string, string> = {
  id: 'ID',
  label: 'Entreprise',
  siret: 'SIRET',
  address: 'Adresse',
  zipCode: 'Code postal',
  department: 'Département',
  opportunityDate: 'Date de liquidation',
  createdAt: 'Date de création',
};

const ENERGY_DIAGNOSTIC_HEADERS: Record<string, string> = {
  id: 'ID',
  label: 'Titre',
  address: 'Adresse',
  zipCode: 'Code postal',
  department: 'Département',
  energyClass: 'DPE',
  squareFootage: 'Surface (m²)',
  opportunityDate: 'Date du diagnostic',
  createdAt: 'Date de création',
};

export function getOpportunityHeaders(type: OpportunityType): Record<string, string> {
  switch (type) {
    case OpportunityType.AUCTION:
      return AUCTION_HEADERS;
    case OpportunityType.REAL_ESTATE_LISTING:
      return LISTING_HEADERS;
    case OpportunityType.SUCCESSION:
      return SUCCESSION_HEADERS;
    case OpportunityType.LIQUIDATION:
      return LIQUIDATION_HEADERS;
    case OpportunityType.ENERGY_SIEVE:
      return ENERGY_DIAGNOSTIC_HEADERS;
    default:
      return {};
  }
}
