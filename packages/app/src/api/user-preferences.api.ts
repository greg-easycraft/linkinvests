import { apiRequest } from './client'
import type { QuickActionId } from '@linkinvests/shared'

interface QuickActionsResponse {
  actions: Array<QuickActionId>
}

export async function getQuickActions(): Promise<Array<QuickActionId>> {
  const response = await apiRequest<QuickActionsResponse>(
    '/user-preferences/quick-actions',
  )
  return response.actions
}

export async function updateQuickActions(
  actions: Array<QuickActionId>,
): Promise<Array<QuickActionId>> {
  const response = await apiRequest<QuickActionsResponse>(
    '/user-preferences/quick-actions',
    {
      method: 'PUT',
      body: { actions },
    },
  )
  return response.actions
}
