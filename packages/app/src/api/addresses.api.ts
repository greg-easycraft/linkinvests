import { apiRequest } from './client'
import type { AddressSearchResult, EnergyClass } from '@/types'

export interface AddressSearchInput {
  energyClass: EnergyClass
  squareFootage: number
  zipCode: string
  address?: string
}

export type { AddressSearchResult }

export interface AddressLinkRequest {
  input: AddressSearchInput
  opportunityId: string
  opportunityType: 'auction' | 'listing'
}

export interface DiagnosticLink {
  id: string
  energyDiagnosticId: string
  matchScore: number
  energyDiagnostic: {
    id: string
    address: string
    zipCode: string
    energyClass: string
    squareFootage: number
    opportunityDate: string
    externalId: string
  }
}

export async function searchAndLinkDiagnostics(
  request: AddressLinkRequest,
): Promise<Array<DiagnosticLink>> {
  return apiRequest<Array<DiagnosticLink>>('/addresses/link', {
    method: 'POST',
    body: request,
  })
}

export async function getDiagnosticLinks(
  opportunityId: string,
  opportunityType: 'auction' | 'listing',
): Promise<Array<DiagnosticLink>> {
  return apiRequest<Array<DiagnosticLink>>(
    `/addresses/links/${opportunityId}?opportunityType=${opportunityType}`,
  )
}

export async function searchAddresses(
  input: AddressSearchInput,
): Promise<Array<AddressSearchResult>> {
  return apiRequest<Array<AddressSearchResult>>('/addresses/search', {
    method: 'POST',
    body: input,
  })
}
