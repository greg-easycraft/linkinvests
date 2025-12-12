import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QuickActionId } from '@linkinvests/shared'
import { getQuickActions, updateQuickActions } from '@/api'

export function useQuickActions() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['quick-actions'],
    queryFn: getQuickActions,
    staleTime: 5 * 60 * 1000,
  })

  const updateMutation = useMutation({
    mutationFn: (actions: Array<QuickActionId>) => updateQuickActions(actions),
    onSuccess: (data) => {
      queryClient.setQueryData(['quick-actions'], data)
    },
  })

  return {
    actions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    updateActions: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  }
}
