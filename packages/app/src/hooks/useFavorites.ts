import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { OpportunityType } from '@linkinvests/shared'
import {
  addFavorite,
  checkBatchFavorites,
  checkFavorite,
  getFavorites,
  markEmailSent,
  removeFavorite,
} from '@/api'
import { toast } from 'sonner'

/**
 * Hook to manage a single favorite
 */
export function useFavorite(
  opportunityId: string,
  opportunityType: OpportunityType,
) {
  const queryClient = useQueryClient()

  const { data: isFavorite = false, isLoading } = useQuery({
    queryKey: ['favorite', opportunityId, opportunityType],
    queryFn: () => checkFavorite(opportunityId, opportunityType),
    staleTime: 5 * 60 * 1000,
  })

  const addMutation = useMutation({
    mutationFn: () => addFavorite(opportunityId, opportunityType),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['favorite', opportunityId, opportunityType],
      })
      // Optimistic update
      queryClient.setQueryData(
        ['favorite', opportunityId, opportunityType],
        true,
      )
    },
    onError: () => {
      // Rollback on error
      queryClient.setQueryData(
        ['favorite', opportunityId, opportunityType],
        false,
      )
    },
    onSettled: () => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: () => removeFavorite(opportunityId, opportunityType),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['favorite', opportunityId, opportunityType],
      })
      // Optimistic update
      queryClient.setQueryData(
        ['favorite', opportunityId, opportunityType],
        false,
      )
    },
    onError: () => {
      // Rollback on error
      queryClient.setQueryData(
        ['favorite', opportunityId, opportunityType],
        true,
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  const toggleFavorite = () => {
    if (isFavorite) {
      removeMutation.mutate()
    } else {
      addMutation.mutate()
    }
  }

  return {
    isFavorite,
    isLoading,
    isToggling: addMutation.isPending || removeMutation.isPending,
    toggleFavorite,
  }
}

/**
 * Hook to get all user favorites grouped by type
 */
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to batch check favorites for a list of opportunities
 */
export function useBatchFavoriteCheck(
  opportunityIds: Array<string>,
  opportunityType: OpportunityType,
) {
  return useQuery({
    queryKey: ['favorites', 'batch', opportunityType, opportunityIds],
    queryFn: () => checkBatchFavorites(opportunityIds, opportunityType),
    enabled: opportunityIds.length > 0,
    staleTime: 5 * 60 * 1000,
    select: (data) => new Set(data),
  })
}

/**
 * Hook to mark succession email as sent
 */
export function useMarkEmailSent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markEmailSent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du statut')
    },
  })
}
