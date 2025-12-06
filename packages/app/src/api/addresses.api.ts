import { apiRequest } from './client'
import type { EnergyClass } from '@/types'

export interface AddressSearchInput {
  energyClass: EnergyClass
  squareFootage: number
  zipCode: string
  address?: string
}

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
