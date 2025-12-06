import { ApiError, apiRequest } from './client'
import type { EnergyDiagnostic, IEnergyDiagnosticFilters } from '@/types'
import type { CountResponse, SearchResponse } from './types'

export async function searchEnergyDiagnostics(
  filters: IEnergyDiagnosticFilters,
): Promise<SearchResponse<EnergyDiagnostic>> {
  return apiRequest<SearchResponse<EnergyDiagnostic>>(
    '/energy-diagnostics/search',
    {
      method: 'POST',
      body: filters,
    },
  )
}

export async function countEnergyDiagnostics(
  filters: IEnergyDiagnosticFilters,
): Promise<number> {
  const response = await apiRequest<CountResponse>(
    '/energy-diagnostics/count',
    {
      method: 'POST',
      body: filters,
    },
  )
  return response.count
}

export async function getEnergyDiagnosticById(
  id: string,
): Promise<EnergyDiagnostic | null> {
  try {
    return apiRequest<EnergyDiagnostic>(`/energy-diagnostics/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

export async function getEnergyDiagnosticByExternalId(
  externalId: string,
): Promise<EnergyDiagnostic | null> {
  try {
    return apiRequest<EnergyDiagnostic>(
      `/energy-diagnostics/external/${externalId}`,
    )
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}
