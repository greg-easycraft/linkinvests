import { ApiError, apiRequest } from './client'
import type { ISuccessionFilters, Succession } from '@/types'
import type { CountResponse, SearchResponse } from './types'

export async function searchSuccessions(
  filters: ISuccessionFilters,
): Promise<SearchResponse<Succession>> {
  return apiRequest<SearchResponse<Succession>>('/successions/search', {
    method: 'POST',
    body: filters,
  })
}

export async function countSuccessions(
  filters: ISuccessionFilters,
): Promise<number> {
  const response = await apiRequest<CountResponse>('/successions/count', {
    method: 'POST',
    body: filters,
  })
  return response.count
}

export async function getSuccessionById(id: string): Promise<Succession | null> {
  try {
    return await apiRequest<Succession>(`/successions/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}
