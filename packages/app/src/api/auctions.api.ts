import { ApiError, apiRequest } from './client'
import type { Auction, IAuctionFilters } from '@/types'
import type { CountResponse, SearchResponse } from './types'

export async function searchAuctions(
  filters: IAuctionFilters,
): Promise<SearchResponse<Auction>> {
  return apiRequest<SearchResponse<Auction>>('/auctions/search', {
    method: 'POST',
    body: filters,
  })
}

export async function countAuctions(
  filters: IAuctionFilters,
): Promise<number> {
  const response = await apiRequest<CountResponse>('/auctions/count', {
    method: 'POST',
    body: filters,
  })
  return response.count
}

export async function getAuctionById(id: string): Promise<Auction | null> {
  try {
    return await apiRequest<Auction>(`/auctions/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}
