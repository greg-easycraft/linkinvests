import { apiRequest } from './client'
import type { AllOpportunity, IAllOpportunitiesFilters } from '@/types'
import type { CountResponse, SearchResponse } from './types'

export async function searchAllOpportunities(
  filters: IAllOpportunitiesFilters,
): Promise<SearchResponse<AllOpportunity>> {
  return apiRequest<SearchResponse<AllOpportunity>>(
    '/all-opportunities/search',
    {
      method: 'POST',
      body: filters,
    },
  )
}

export async function countAllOpportunities(
  filters: IAllOpportunitiesFilters,
): Promise<number> {
  const response = await apiRequest<CountResponse>('/all-opportunities/count', {
    method: 'POST',
    body: filters,
  })
  return response.count
}
