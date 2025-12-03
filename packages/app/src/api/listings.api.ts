import { ApiError, apiRequest } from './client'
import type { IListingFilters, Listing } from '@/types'
import type { CountResponse, SearchResponse } from './types'

export async function searchListings(
  filters: IListingFilters,
): Promise<SearchResponse<Listing>> {
  return apiRequest<SearchResponse<Listing>>('/listings/search', {
    method: 'POST',
    body: filters,
  })
}

export async function countListings(filters: IListingFilters): Promise<number> {
  const response = await apiRequest<CountResponse>('/listings/count', {
    method: 'POST',
    body: filters,
  })
  return response.count
}

export async function getListingById(id: string): Promise<Listing | null> {
  try {
    return await apiRequest<Listing>(`/listings/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}
