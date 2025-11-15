import { OpportunityType } from "@linkinvests/shared";

/**
 * French header labels for export functionality
 * Maps database field names to user-friendly French labels
 */

// Base opportunity headers (common to all types)
const baseOpportunityHeaders: Record<string, string> = {
  id: "Identifiant",
  label: "Libellé",
  address: "Adresse",
  zipCode: "Code postal",
  department: "Département",
  latitude: "Latitude",
  longitude: "Longitude",
  opportunityDate: "Date de l'opportunité",
  externalId: "Identifiant externe",
  url: "URL",
  createdAt: "Date de création",
  updatedAt: "Date de mise à jour"
};

// Auction-specific headers
const auctionHeaders: Record<string, string> = {
  ...baseOpportunityHeaders,
  auctionType: "Type de vente aux enchères",
  propertyType: "Type de bien",
  description: "Description",
  squareFootage: "Surface (m²)",
  rooms: "Nombre de pièces",
  dpe: "DPE",
  auctionVenue: "Lieu des enchères",
  currentPrice: "Prix actuel (€)",
  reservePrice: "Prix de réserve (€)",
  lowerEstimate: "Estimation basse (€)",
  upperEstimate: "Estimation haute (€)",
  mainPicture: "Photo principale",
  pictures: "Photos",
  auctionHouseContact: "Contact étude"
};

// Energy diagnostic headers
const energyDiagnosticHeaders: Record<string, string> = {
  ...baseOpportunityHeaders,
  energyClass: "Classe énergétique",
  dpeNumber: "Numéro DPE"
};

// Liquidation headers
const liquidationHeaders: Record<string, string> = {
  ...baseOpportunityHeaders,
  siret: "SIRET",
  companyContact: "Contact entreprise"
};

// Succession headers
const successionHeaders: Record<string, string> = {
  ...baseOpportunityHeaders,
  firstName: "Prénom",
  lastName: "Nom",
  mairieContact: "Contact mairie"
};

// Listing headers
const listingHeaders: Record<string, string> = {
  ...baseOpportunityHeaders,
  transactionType: "Type de transaction",
  propertyType: "Type de bien",
  description: "Description",
  squareFootage: "Surface habitable (m²)",
  landArea: "Surface terrain (m²)",
  rooms: "Nombre de pièces",
  bedrooms: "Nombre de chambres",
  dpe: "DPE",
  constructionYear: "Année de construction",
  floor: "Étage",
  totalFloors: "Nombre d'étages total",
  balcony: "Balcon",
  terrace: "Terrasse",
  garden: "Jardin",
  garage: "Garage",
  parking: "Parking",
  elevator: "Ascenseur",
  price: "Prix (€)",
  priceType: "Type de prix",
  fees: "Frais (€)",
  charges: "Charges (€)",
  mainPicture: "Photo principale",
  pictures: "Photos",
  notaryContact: "Contact notaire"
};

/**
 * Get French header labels for a specific opportunity type
 */
export function getOpportunityHeaders(type: OpportunityType): Record<string, string> {
  switch (type) {
    case OpportunityType.AUCTION:
      return auctionHeaders;
    case OpportunityType.ENERGY_SIEVE:
      return energyDiagnosticHeaders;
    case OpportunityType.LIQUIDATION:
      return liquidationHeaders;
    case OpportunityType.SUCCESSION:
      return successionHeaders;
    case OpportunityType.REAL_ESTATE_LISTING:
      return listingHeaders;
    case OpportunityType.DIVORCE:
      // Divorce not yet implemented, use base headers for now
      return baseOpportunityHeaders;
    default:
      return baseOpportunityHeaders;
  }
}

/**
 * Get all available header mappings
 */
export const getAllHeaderMappings = () => ({
  base: baseOpportunityHeaders,
  auction: auctionHeaders,
  energyDiagnostic: energyDiagnosticHeaders,
  liquidation: liquidationHeaders,
  succession: successionHeaders,
  listing: listingHeaders
});