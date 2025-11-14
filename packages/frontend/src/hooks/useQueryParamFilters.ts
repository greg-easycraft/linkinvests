"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { OpportunityType } from "@linkinvests/shared";
import type { OpportunityFilters } from "~/types/filters";
import {
  filtersToQueryParams,
  queryParamsToFilters,
  createURLSearchParams,
  parseURLSearchParams,
  type ViewType,
} from "~/utils/query-params";

/**
 * Custom hook to manage opportunity filters and view type via URL query parameters
 *
 * This hook provides:
 * - Automatic URL synchronization with filters and view state
 * - URL persistence (survives page refresh)
 * - Shareable URLs
 * - Browser history support
 *
 * @param opportunityType - The opportunity type for the current page
 * @returns Object containing current state and setter functions
 */
export function useQueryParamFilters(opportunityType: OpportunityType) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse current URL query parameters
  const currentQueryParams = useMemo(() => {
    return parseURLSearchParams(searchParams);
  }, [searchParams]);

  // Convert query parameters to filters and view type
  const { filters: currentFilters, viewType: currentViewType } = useMemo(() => {
    return queryParamsToFilters(currentQueryParams, opportunityType);
  }, [currentQueryParams, opportunityType]);

  /**
   * Updates the URL with new filters and view type
   */
  const updateURL = useCallback(
    (filters: OpportunityFilters, viewType: ViewType) => {
      const newQueryParams = filtersToQueryParams(filters, viewType);
      const newSearchParams = createURLSearchParams(newQueryParams);

      // Build new URL
      const newURL = newSearchParams.toString()
        ? `${pathname}?${newSearchParams.toString()}`
        : pathname;

      // Use replace to avoid cluttering browser history on every filter change
      router.replace(newURL, { scroll: false });
    },
    [router, pathname]
  );

  /**
   * Updates filters and syncs to URL
   */
  const setFilters = useCallback(
    (newFilters: OpportunityFilters) => {
      updateURL(newFilters, currentViewType);
    },
    [updateURL, currentViewType]
  );

  /**
   * Updates view type and syncs to URL
   */
  const setViewType = useCallback(
    (newViewType: ViewType) => {
      updateURL(currentFilters, newViewType);
    },
    [updateURL, currentFilters]
  );

  /**
   * Updates both filters and view type simultaneously
   */
  const setFiltersAndViewType = useCallback(
    (newFilters: OpportunityFilters, newViewType: ViewType) => {
      updateURL(newFilters, newViewType);
    },
    [updateURL]
  );

  /**
   * Resets filters to default values while preserving opportunity type
   */
  const resetFilters = useCallback(() => {
    const defaultFilters: OpportunityFilters = {
      types: [opportunityType],
      limit: 25,
      offset: 0,
    };
    updateURL(defaultFilters, "list");
  }, [opportunityType, updateURL]);

  /**
   * Checks if current filters are at default values
   */
  const isDefaultFilters = useMemo(() => {
    const hasCustomFilters =
      currentFilters.departments?.length ||
      currentFilters.zipCodes?.length ||
      currentFilters.datePeriod ||
      currentFilters.energyClasses?.length ||
      currentFilters.sortBy ||
      currentFilters.sortOrder !== "asc" ||
      (currentFilters.limit && currentFilters.limit !== 25) ||
      (currentFilters.offset && currentFilters.offset !== 0);

    return !hasCustomFilters && currentViewType === "list";
  }, [currentFilters, currentViewType]);

  return {
    // Current state
    filters: currentFilters,
    viewType: currentViewType,
    isDefaultFilters,

    // State setters
    setFilters,
    setViewType,
    setFiltersAndViewType,
    resetFilters,

    // Utility functions
    updateURL,
  };
}

/**
 * Hook variant that provides filters state without URL integration
 * Useful for components that need to display current filter state without modifying it
 */
export function useCurrentFiltersFromURL(opportunityType: OpportunityType) {
  const searchParams = useSearchParams();

  const { filters, viewType } = useMemo(() => {
    const queryParams = parseURLSearchParams(searchParams);
    return queryParamsToFilters(queryParams, opportunityType);
  }, [searchParams, opportunityType]);

  return { filters, viewType };
}