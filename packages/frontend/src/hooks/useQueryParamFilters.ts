"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { OpportunityFilters } from "~/types/filters";

import { z } from "zod";

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
export function useQueryParamFilters<T extends OpportunityFilters>(schema: z.ZodSchema<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [debouncedFilters, setDebouncedFilters] = useState<T>(getRetainedFiltersFromParams(searchParams, schema));
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const setFilters = useCallback((newFilters: T) => {
    console.log({newFilters})
    const filtersToUse = { ...newFilters };
    delete filtersToUse.page;
    console.log({filtersToUse})
    const newSearchParams = createURLSearchParams(filtersToUse);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  }, [router, pathname]);

  const debouncedUpdateFilters = useCallback((newFilters: T) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedFilters(newFilters);
    }, 1000); // 300ms debounce delay
  }, [setDebouncedFilters]);

  const currentFilters = useMemo(() => {
    const result = getRetainedFiltersFromParams(searchParams, schema);
    return result;
  }, [searchParams, schema]);

  useEffect(() => {
    debouncedUpdateFilters(currentFilters);

    // Cleanup function to clear timer when component unmounts
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentFilters, debouncedUpdateFilters]);

  return {
    // Current state
    currentFilters,
    debouncedFilters,
    // State setters
    setFilters,
  };
}

function getRetainedFiltersFromParams<T extends OpportunityFilters>(searchParams: URLSearchParams, schema: z.ZodSchema<T>): T {
  const queryParams = parseURLSearchParams(searchParams);
  const result = schema.safeParse(queryParams);

  if (result.success) {
    return result.data;
  }

  // If parsing fails, try to salvage valid individual fields
  const partialFilters: Record<string, unknown> = {};

  // Get the shape of the schema to know which fields are valid
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;

    for (const [key, fieldSchema] of Object.entries(shape)) {
      if (queryParams[key] !== undefined) {
        const fieldResult = (fieldSchema as z.ZodSchema).safeParse(queryParams[key]);
        if (fieldResult.success) {
          partialFilters[key] = fieldResult.data;
        }
        // Invalid fields are simply omitted (removed from object)
      }
    }
  }

  // Fall back to empty object if we can't salvage anything
  const finalResult = schema.safeParse(partialFilters);
  return finalResult.success ? finalResult.data : ({} as T);
}

function createURLSearchParams<T extends OpportunityFilters = OpportunityFilters>(
  params: T): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === null) {
      return;
    }
    if (typeof value === "string") {
      searchParams.set(key, value);
      return;
    } 
    if (typeof value === "number") {
      searchParams.set(key, value.toString());
      return;
    }
    if (typeof value === "boolean") {
      searchParams.set(key, value.toString());
      return;
    }
    if(Array.isArray(value) && value.length) {
      searchParams.set(key, value.join(","));
      return;
    }
  });

  return searchParams;
}

/**
 * Parses URLSearchParams into a Record<string, string> object
 */
function parseURLSearchParams(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {};

  for (const [key, value] of searchParams.entries()) {
    if (key === "view") {
      params.view = value === "map" ? "map" : "list";
      continue;
    }
    params[key] = value;
  }

  return params;
}