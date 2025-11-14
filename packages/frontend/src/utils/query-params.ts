import type { OpportunityFilters, DatePeriod, EnergyClass, AuctionFilters, ListingFilters } from "~/types/filters";
import { OpportunityType } from "@linkinvests/shared";

export type ViewType = "list" | "map";

/**
 * Expected query parameter structure for opportunity filters
 */
export interface OpportunityQueryParams {
  // View and display
  view?: ViewType;

  // Filters
  departments?: string; // Comma-separated department codes
  zipCodes?: string; // Comma-separated zip codes
  datePeriod?: DatePeriod;
  energyClasses?: string; // Comma-separated energy classes (A-G)

  // Auction-specific filters
  auctionTypes?: string; // Comma-separated auction types
  propertyTypes?: string; // Comma-separated property types
  priceRange?: string; // Format: "min,max" (e.g. "100000,500000")
  reservePriceRange?: string; // Format: "min,max"
  squareFootageRange?: string; // Format: "min,max"
  roomsRange?: string; // Format: "min,max"
  auctionVenues?: string; // Comma-separated auction venues

  // Listing-specific filters
  transactionTypes?: string; // Comma-separated transaction types
  listingPropertyTypes?: string; // Comma-separated property types for listings
  listingPriceRange?: string; // Format: "min,max"
  listingSquareFootageRange?: string; // Format: "min,max"
  landAreaRange?: string; // Format: "min,max"
  listingRoomsRange?: string; // Format: "min,max"
  bedroomsRange?: string; // Format: "min,max"
  constructionYearRange?: string; // Format: "min,max"
  dpe?: string; // Comma-separated energy classes (A-G) for listings
  features?: string; // Comma-separated features like "balcony,garage"

  // Pagination
  page?: string; // Page number (1-based)
  pageSize?: string; // Items per page

  // Sorting
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Converts OpportunityFilters object to query parameters
 */
export function filtersToQueryParams(
  filters: OpportunityFilters,
  viewType?: ViewType
): OpportunityQueryParams {
  const params: OpportunityQueryParams = {};

  // Add view type
  if (viewType && viewType !== "list") {
    params.view = viewType;
  }

  // Add departments (comma-separated)
  if (filters.departments && filters.departments.length > 0) {
    params.departments = filters.departments.join(",");
  }

  // Add zip codes (comma-separated)
  if (filters.zipCodes && filters.zipCodes.length > 0) {
    params.zipCodes = filters.zipCodes.join(",");
  }

  // Add date period
  if (filters.datePeriod) {
    params.datePeriod = filters.datePeriod;
  }

  // Add energy classes (comma-separated)
  if (filters.energyClasses && filters.energyClasses.length > 0) {
    params.energyClasses = filters.energyClasses.join(",");
  }

  // Cast to AuctionFilters to access auction-specific properties
  const auctionFilters = filters as AuctionFilters;

  // Add auction-specific filters
  if (auctionFilters.auctionTypes && auctionFilters.auctionTypes.length > 0) {
    params.auctionTypes = auctionFilters.auctionTypes.join(",");
  }

  if (auctionFilters.propertyTypes && auctionFilters.propertyTypes.length > 0) {
    params.propertyTypes = auctionFilters.propertyTypes.join(",");
  }

  if (auctionFilters.priceRange && (auctionFilters.priceRange.min !== undefined || auctionFilters.priceRange.max !== undefined)) {
    const min = auctionFilters.priceRange.min ?? '';
    const max = auctionFilters.priceRange.max ?? '';
    params.priceRange = `${min},${max}`;
  }

  if (auctionFilters.reservePriceRange && (auctionFilters.reservePriceRange.min !== undefined || auctionFilters.reservePriceRange.max !== undefined)) {
    const min = auctionFilters.reservePriceRange.min ?? '';
    const max = auctionFilters.reservePriceRange.max ?? '';
    params.reservePriceRange = `${min},${max}`;
  }

  if (auctionFilters.squareFootageRange && (auctionFilters.squareFootageRange.min !== undefined || auctionFilters.squareFootageRange.max !== undefined)) {
    const min = auctionFilters.squareFootageRange.min ?? '';
    const max = auctionFilters.squareFootageRange.max ?? '';
    params.squareFootageRange = `${min},${max}`;
  }

  if (auctionFilters.roomsRange && (auctionFilters.roomsRange.min !== undefined || auctionFilters.roomsRange.max !== undefined)) {
    const min = auctionFilters.roomsRange.min ?? '';
    const max = auctionFilters.roomsRange.max ?? '';
    params.roomsRange = `${min},${max}`;
  }

  if (auctionFilters.auctionVenues && auctionFilters.auctionVenues.length > 0) {
    params.auctionVenues = auctionFilters.auctionVenues.join(",");
  }

  // Cast to ListingFilters to access listing-specific properties
  const listingFilters = filters as ListingFilters;

  // Add listing-specific filters
  if (listingFilters.transactionTypes && listingFilters.transactionTypes.length > 0) {
    params.transactionTypes = listingFilters.transactionTypes.join(",");
  }

  if (listingFilters.propertyTypes && listingFilters.propertyTypes.length > 0) {
    params.listingPropertyTypes = listingFilters.propertyTypes.join(",");
  }

  if (listingFilters.priceRange && (listingFilters.priceRange.min !== undefined || listingFilters.priceRange.max !== undefined)) {
    const min = listingFilters.priceRange.min ?? '';
    const max = listingFilters.priceRange.max ?? '';
    params.listingPriceRange = `${min},${max}`;
  }

  if (listingFilters.squareFootageRange && (listingFilters.squareFootageRange.min !== undefined || listingFilters.squareFootageRange.max !== undefined)) {
    const min = listingFilters.squareFootageRange.min ?? '';
    const max = listingFilters.squareFootageRange.max ?? '';
    params.listingSquareFootageRange = `${min},${max}`;
  }

  if (listingFilters.landAreaRange && (listingFilters.landAreaRange.min !== undefined || listingFilters.landAreaRange.max !== undefined)) {
    const min = listingFilters.landAreaRange.min ?? '';
    const max = listingFilters.landAreaRange.max ?? '';
    params.landAreaRange = `${min},${max}`;
  }

  if (listingFilters.roomsRange && (listingFilters.roomsRange.min !== undefined || listingFilters.roomsRange.max !== undefined)) {
    const min = listingFilters.roomsRange.min ?? '';
    const max = listingFilters.roomsRange.max ?? '';
    params.listingRoomsRange = `${min},${max}`;
  }

  if (listingFilters.bedroomsRange && (listingFilters.bedroomsRange.min !== undefined || listingFilters.bedroomsRange.max !== undefined)) {
    const min = listingFilters.bedroomsRange.min ?? '';
    const max = listingFilters.bedroomsRange.max ?? '';
    params.bedroomsRange = `${min},${max}`;
  }

  if (listingFilters.constructionYearRange && (listingFilters.constructionYearRange.min !== undefined || listingFilters.constructionYearRange.max !== undefined)) {
    const min = listingFilters.constructionYearRange.min ?? '';
    const max = listingFilters.constructionYearRange.max ?? '';
    params.constructionYearRange = `${min},${max}`;
  }

  if (listingFilters.dpe && listingFilters.dpe.length > 0) {
    params.dpe = listingFilters.dpe.join(",");
  }

  if (listingFilters.features && Object.keys(listingFilters.features).length > 0) {
    const enabledFeatures = Object.entries(listingFilters.features)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key);
    if (enabledFeatures.length > 0) {
      params.features = enabledFeatures.join(",");
    }
  }

  // Add pagination (convert offset/limit to page/pageSize)
  const limit = filters.limit ?? 25;
  const offset = filters.offset ?? 0;
  const currentPage = Math.floor(offset / limit) + 1;

  if (currentPage > 1) {
    params.page = currentPage.toString();
  }
  if (limit !== 25) {
    params.pageSize = limit.toString();
  }

  // Add sorting
  if (filters.sortBy) {
    params.sortBy = filters.sortBy;
  }
  if (filters.sortOrder && filters.sortOrder !== "asc") {
    params.sortOrder = filters.sortOrder;
  }

  return params;
}

/**
 * Converts query parameters to OpportunityFilters object
 */
export function queryParamsToFilters(
  params: OpportunityQueryParams,
  defaultOpportunityType: OpportunityType
): { filters: OpportunityFilters; viewType: ViewType } {
  const filters: OpportunityFilters = {
    types: [defaultOpportunityType],
    limit: 25,
    offset: 0,
  };

  // Parse departments
  if (params.departments) {
    const departments = params.departments.split(",").filter(Boolean);
    if (departments.length > 0) {
      filters.departments = departments;
    }
  }

  // Parse zip codes
  if (params.zipCodes) {
    const zipCodes = params.zipCodes.split(",").filter(Boolean);
    if (zipCodes.length > 0) {
      filters.zipCodes = zipCodes;
    }
  }

  // Parse date period
  if (params.datePeriod) {
    filters.datePeriod = params.datePeriod;
  }

  // Parse energy classes
  if (params.energyClasses) {
    const energyClasses = params.energyClasses
      .split(",")
      .filter(Boolean)
      .filter((cls): cls is EnergyClass =>
        ["A", "B", "C", "D", "E", "F", "G"].includes(cls)
      );
    if (energyClasses.length > 0) {
      filters.energyClasses = energyClasses;
    }
  }

  // Cast to AuctionFilters to add auction-specific properties
  const auctionFilters = filters as AuctionFilters;

  // Parse auction-specific filters
  if (params.auctionTypes) {
    const auctionTypes = params.auctionTypes.split(",").filter(Boolean);
    if (auctionTypes.length > 0) {
      auctionFilters.auctionTypes = auctionTypes;
    }
  }

  if (params.propertyTypes) {
    const propertyTypes = params.propertyTypes.split(",").filter(Boolean);
    if (propertyTypes.length > 0) {
      auctionFilters.propertyTypes = propertyTypes;
    }
  }

  if (params.priceRange) {
    const [minStr, maxStr] = params.priceRange.split(",");
    const min = minStr ? parseFloat(minStr) : undefined;
    const max = maxStr ? parseFloat(maxStr) : undefined;
    if (!isNaN(min!) || !isNaN(max!)) {
      auctionFilters.priceRange = { min: isNaN(min!) ? undefined : min, max: isNaN(max!) ? undefined : max };
    }
  }

  if (params.reservePriceRange) {
    const [minStr, maxStr] = params.reservePriceRange.split(",");
    const min = minStr ? parseFloat(minStr) : undefined;
    const max = maxStr ? parseFloat(maxStr) : undefined;
    if (!isNaN(min!) || !isNaN(max!)) {
      auctionFilters.reservePriceRange = { min: isNaN(min!) ? undefined : min, max: isNaN(max!) ? undefined : max };
    }
  }

  if (params.squareFootageRange) {
    const [minStr, maxStr] = params.squareFootageRange.split(",");
    const min = minStr ? parseFloat(minStr) : undefined;
    const max = maxStr ? parseFloat(maxStr) : undefined;
    if (!isNaN(min!) || !isNaN(max!)) {
      auctionFilters.squareFootageRange = { min: isNaN(min!) ? undefined : min, max: isNaN(max!) ? undefined : max };
    }
  }

  if (params.roomsRange) {
    const [minStr, maxStr] = params.roomsRange.split(",");
    const min = minStr ? parseFloat(minStr) : undefined;
    const max = maxStr ? parseFloat(maxStr) : undefined;
    if (!isNaN(min!) || !isNaN(max!)) {
      auctionFilters.roomsRange = { min: isNaN(min!) ? undefined : min, max: isNaN(max!) ? undefined : max };
    }
  }

  if (params.auctionVenues) {
    const auctionVenues = params.auctionVenues.split(",").filter(Boolean);
    if (auctionVenues.length > 0) {
      auctionFilters.auctionVenues = auctionVenues;
    }
  }

  // Cast to ListingFilters to add listing-specific properties
  const listingFilters = filters as ListingFilters;

  // Parse listing-specific filters
  if (params.transactionTypes) {
    const transactionTypes = params.transactionTypes.split(",").filter(Boolean);
    if (transactionTypes.length > 0) {
      listingFilters.transactionTypes = transactionTypes;
    }
  }

  if (params.listingPropertyTypes) {
    const propertyTypes = params.listingPropertyTypes.split(",").filter(Boolean);
    if (propertyTypes.length > 0) {
      listingFilters.propertyTypes = propertyTypes;
    }
  }

  if (params.listingPriceRange) {
    const [minStr, maxStr] = params.listingPriceRange.split(",");
    const min = minStr ? parseFloat(minStr) : undefined;
    const max = maxStr ? parseFloat(maxStr) : undefined;
    if (!isNaN(min!) || !isNaN(max!)) {
      listingFilters.priceRange = { min: isNaN(min!) ? undefined : min, max: isNaN(max!) ? undefined : max };
    }
  }

  if (params.listingSquareFootageRange) {
    const [minStr, maxStr] = params.listingSquareFootageRange.split(",");
    const min = minStr ? parseFloat(minStr) : undefined;
    const max = maxStr ? parseFloat(maxStr) : undefined;
    if (!isNaN(min!) || !isNaN(max!)) {
      listingFilters.squareFootageRange = { min: isNaN(min!) ? undefined : min, max: isNaN(max!) ? undefined : max };
    }
  }

  if (params.landAreaRange) {
    const [minStr, maxStr] = params.landAreaRange.split(",");
    const min = minStr ? parseFloat(minStr) : undefined;
    const max = maxStr ? parseFloat(maxStr) : undefined;
    if (!isNaN(min!) || !isNaN(max!)) {
      listingFilters.landAreaRange = { min: isNaN(min!) ? undefined : min, max: isNaN(max!) ? undefined : max };
    }
  }

  if (params.listingRoomsRange) {
    const [minStr, maxStr] = params.listingRoomsRange.split(",");
    const min = minStr ? parseFloat(minStr) : undefined;
    const max = maxStr ? parseFloat(maxStr) : undefined;
    if (!isNaN(min!) || !isNaN(max!)) {
      listingFilters.roomsRange = { min: isNaN(min!) ? undefined : min, max: isNaN(max!) ? undefined : max };
    }
  }

  if (params.bedroomsRange) {
    const [minStr, maxStr] = params.bedroomsRange.split(",");
    const min = minStr ? parseFloat(minStr) : undefined;
    const max = maxStr ? parseFloat(maxStr) : undefined;
    if (!isNaN(min!) || !isNaN(max!)) {
      listingFilters.bedroomsRange = { min: isNaN(min!) ? undefined : min, max: isNaN(max!) ? undefined : max };
    }
  }

  if (params.constructionYearRange) {
    const [minStr, maxStr] = params.constructionYearRange.split(",");
    const min = minStr ? parseFloat(minStr) : undefined;
    const max = maxStr ? parseFloat(maxStr) : undefined;
    if (!isNaN(min!) || !isNaN(max!)) {
      listingFilters.constructionYearRange = { min: isNaN(min!) ? undefined : min, max: isNaN(max!) ? undefined : max };
    }
  }

  if (params.dpe) {
    const dpe = params.dpe
      .split(",")
      .filter(Boolean)
      .filter((cls): cls is EnergyClass =>
        ["A", "B", "C", "D", "E", "F", "G"].includes(cls)
      );
    if (dpe.length > 0) {
      listingFilters.dpe = dpe;
    }
  }

  if (params.features) {
    const featureKeys = params.features.split(",").filter(Boolean);
    if (featureKeys.length > 0) {
      const features: any = {};
      featureKeys.forEach(key => {
        features[key] = true;
      });
      listingFilters.features = features;
    }
  }

  // Parse pagination
  const page = parseInt(params.page ?? "1", 10);
  const pageSize = parseInt(params.pageSize ?? "25", 10);

  if (!isNaN(pageSize) && pageSize > 0) {
    filters.limit = pageSize;
  }
  if (!isNaN(page) && page > 0) {
    filters.offset = (page - 1) * (filters.limit ?? 25);
  }

  // Parse sorting
  if (params.sortBy) {
    filters.sortBy = params.sortBy;
  }
  if (params.sortOrder === "desc") {
    filters.sortOrder = "desc";
  }

  // Determine view type
  const viewType: ViewType = params.view === "map" ? "map" : "list";

  return { filters, viewType };
}

/**
 * Removes empty/default query parameters to keep URLs clean
 */
export function cleanQueryParams(params: OpportunityQueryParams): OpportunityQueryParams {
  const cleaned: OpportunityQueryParams = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "list") {
      cleaned[key as keyof OpportunityQueryParams] = value;
    }
  });

  return cleaned;
}

/**
 * Converts query params object to URLSearchParams
 */
export function createURLSearchParams(params: OpportunityQueryParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(cleanQueryParams(params)).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, value);
    }
  });

  return searchParams;
}

/**
 * Parses URLSearchParams into query params object
 */
export function parseURLSearchParams(searchParams: URLSearchParams): OpportunityQueryParams {
  const params: OpportunityQueryParams = {};

  for (const [key, value] of searchParams.entries()) {
    switch (key) {
      case "view":
        if (value === "map" || value === "list") {
          params.view = value;
        }
        break;
      case "departments":
      case "zipCodes":
      case "energyClasses":
      case "auctionTypes":
      case "propertyTypes":
      case "priceRange":
      case "reservePriceRange":
      case "squareFootageRange":
      case "roomsRange":
      case "auctionVenues":
      case "transactionTypes":
      case "listingPropertyTypes":
      case "listingPriceRange":
      case "listingSquareFootageRange":
      case "landAreaRange":
      case "listingRoomsRange":
      case "bedroomsRange":
      case "constructionYearRange":
      case "dpe":
      case "features":
        params[key] = value;
        break;
      case "datePeriod":
        params.datePeriod = value as DatePeriod;
        break;
      case "page":
      case "pageSize":
        params[key] = value;
        break;
      case "sortBy":
        params.sortBy = value;
        break;
      case "sortOrder":
        if (value === "asc" || value === "desc") {
          params.sortOrder = value;
        }
        break;
    }
  }

  return params;
}