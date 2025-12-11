import { apiRequest } from './client'
import type {
  CreateSavedSearchRequest,
  SavedSearch,
} from '@linkinvests/shared'

interface SavedSearchListResponse {
  savedSearches: Array<SavedSearch>
}

export async function getSavedSearches(): Promise<Array<SavedSearch>> {
  const response =
    await apiRequest<SavedSearchListResponse>('/saved-searches')
  return response.savedSearches
}

export async function createSavedSearch(
  data: CreateSavedSearchRequest,
): Promise<SavedSearch> {
  return apiRequest<SavedSearch>('/saved-searches', {
    method: 'POST',
    body: data,
  })
}

export async function deleteSavedSearch(id: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/saved-searches/${id}`, {
    method: 'DELETE',
  })
}
