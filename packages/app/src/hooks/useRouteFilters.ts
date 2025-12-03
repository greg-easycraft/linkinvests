import { useCallback, useEffect, useRef, useState } from 'react'
import type { NavigateOptions } from '@tanstack/react-router'

/**
 * Type for the Route API that useRouteFilters accepts
 */
interface RouteApi<TSearch> {
  useSearch: () => TSearch
  useNavigate: () => (options: NavigateOptions) => void
}

/**
 * Custom hook to manage opportunity filters via URL query parameters
 * Works with TanStack Router's type-safe search params
 *
 * This hook provides:
 * - Automatic URL synchronization with filters
 * - Debounced filter updates for performance
 * - Browser history support
 * - Full type safety from route schema
 *
 * @param Route - The route API object from createFileRoute
 * @returns Object containing current state and setter functions
 */
export function useRouteFilters<TSearch extends Record<string, unknown>>(
  Route: RouteApi<TSearch>,
) {
  const currentFilters = Route.useSearch()
  const navigate = Route.useNavigate()

  const [debouncedFilters, setDebouncedFilters] =
    useState<TSearch>(currentFilters)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Update filters in URL
  const setFilters = useCallback(
    (newFilters: TSearch) => {
      // Remove page when filters change (reset pagination)
      const filtersToUse = { ...newFilters }
      delete (filtersToUse as Record<string, unknown>).page

      navigate({
        search: filtersToUse,
        replace: true,
      } as NavigateOptions)
    },
    [navigate],
  )

  // Debounced filter update
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedFilters(currentFilters)
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [currentFilters])

  return {
    currentFilters,
    debouncedFilters,
    setFilters,
  }
}

/**
 * Alternative hook that accepts search and navigate directly
 * Useful when you need more control over the route integration
 */
export function useFiltersState<TSearch extends Record<string, unknown>>(
  search: TSearch,
  navigate: (options: NavigateOptions) => void,
) {
  const [debouncedFilters, setDebouncedFilters] = useState<TSearch>(search)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setFilters = useCallback(
    (newFilters: TSearch) => {
      const filtersToUse = { ...newFilters }
      delete (filtersToUse as Record<string, unknown>).page

      navigate({
        search: filtersToUse,
        replace: true,
      } as NavigateOptions)
    },
    [navigate],
  )

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedFilters(search)
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [search])

  return {
    currentFilters: search,
    debouncedFilters,
    setFilters,
  }
}
