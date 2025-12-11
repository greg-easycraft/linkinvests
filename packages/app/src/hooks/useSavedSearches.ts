import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateSavedSearchRequest } from '@linkinvests/shared'
import {
  createSavedSearch,
  deleteSavedSearch,
  getSavedSearches,
} from '@/api'

export function useSavedSearches() {
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['saved-searches'],
    queryFn: getSavedSearches,
    staleTime: 5 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateSavedSearchRequest) => createSavedSearch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSavedSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] })
    },
  })

  return {
    savedSearches: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    createSavedSearch: createMutation.mutate,
    isCreating: createMutation.isPending,
    deleteSavedSearch: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}
