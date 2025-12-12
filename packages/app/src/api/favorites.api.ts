import { apiRequest } from './client'
import type { GroupedFavorites, OpportunityType } from '@linkinvests/shared'

export async function getFavorites(): Promise<GroupedFavorites> {
  return apiRequest<GroupedFavorites>('/favorites')
}

export async function addFavorite(
  opportunityId: string,
  opportunityType: OpportunityType,
): Promise<void> {
  await apiRequest<{ success: boolean }>('/favorites/add', {
    method: 'POST',
    body: { opportunityId, opportunityType },
  })
}

export async function removeFavorite(
  opportunityId: string,
  opportunityType: OpportunityType,
): Promise<void> {
  await apiRequest<{ success: boolean }>('/favorites/remove', {
    method: 'POST',
    body: { opportunityId, opportunityType },
  })
}

export async function checkFavorite(
  opportunityId: string,
  opportunityType: OpportunityType,
): Promise<boolean> {
  const response = await apiRequest<{ isFavorite: boolean }>(
    '/favorites/check',
    {
      method: 'POST',
      body: { opportunityId, opportunityType },
    },
  )
  return response.isFavorite
}

export async function checkBatchFavorites(
  opportunityIds: Array<string>,
  opportunityType: OpportunityType,
): Promise<Array<string>> {
  const response = await apiRequest<{ favoriteIds: Array<string> }>(
    '/favorites/check-batch',
    {
      method: 'POST',
      body: { opportunityIds, opportunityType },
    },
  )
  return response.favoriteIds
}
