import type { OpportunityFilters, DatePeriod, EnergyClass } from "~/types/filters";
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