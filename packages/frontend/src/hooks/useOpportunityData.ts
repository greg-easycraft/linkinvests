"use client";

import { useQuery } from "@tanstack/react-query";
import { BaseOpportunity, OpportunityType } from "@linkinvests/shared";
import type { OpportunityFilters } from "~/types/filters";
import { OpportunitiesDataQueryResult } from "~/types/query-result";

// Unified data fetching hook for all opportunity types
// This replaces the separate list/map query approach with a single unified approach
export function useOpportunityData<T extends BaseOpportunity = BaseOpportunity>(
  opportunityType: OpportunityType,
  filters: OpportunityFilters,
  getDataFn: (filters: OpportunityFilters) => Promise<OpportunitiesDataQueryResult<T>>,
  getCountFn: (filters: OpportunityFilters) => Promise<number>
) {
  const filtersWithoutView = removeViewFromFilters(filters);
  // Single data query - used for both list and map views
  const dataQuery = useQuery({
    queryKey: [opportunityType.toLowerCase(), 'data', filtersWithoutView],
    queryFn: () => getDataFn(filtersWithoutView),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Single count query - used for pagination and total display
  const countQuery = useQuery({
    queryKey: [opportunityType.toLowerCase(), 'count', filtersWithoutView],
    queryFn: () => getCountFn(filtersWithoutView),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: dataQuery.data,
    count: countQuery.data,
    isDataLoading: dataQuery.isLoading,
    isCountLoading: countQuery.isLoading,
    isLoading: dataQuery.isLoading || countQuery.isLoading,
    isError: dataQuery.isError || countQuery.isError,
    error: dataQuery.error || countQuery.error,
    refetch: () => {
      dataQuery.refetch();
      countQuery.refetch();
    },
  };
}

function removeViewFromFilters(filters: OpportunityFilters): OpportunityFilters {
  const newFilters = { ...filters };
  delete newFilters.view;
  return newFilters;
}