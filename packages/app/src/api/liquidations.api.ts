import { ApiError, apiRequest } from './client'
import type { ILiquidationFilters, Liquidation } from '@/types'
import type { CountResponse, SearchResponse } from './types'

export async function searchLiquidations(
  filters: ILiquidationFilters,
): Promise<SearchResponse<Liquidation>> {
  return apiRequest<SearchResponse<Liquidation>>('/liquidations/search', {
    method: 'POST',
    body: filters,
  })
}

export async function countLiquidations(
  filters: ILiquidationFilters,
): Promise<number> {
  const response = await apiRequest<CountResponse>('/liquidations/count', {
    method: 'POST',
    body: filters,
  })
  return response.count
}

export async function getLiquidationById(
  id: string,
): Promise<Liquidation | null> {
  try {
    return await apiRequest<Liquidation>(`/liquidations/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}
