import { useState } from 'react'

import {
  DashboardSkeleton,
  FavoritesOverview,
  QuickActionsCompact,
  QuickActionsModal,
  SavedSearchesList,
  StatisticsCards,
  WelcomeBanner,
} from './components'
import { useAuth } from '@/components/providers/auth-provider'
import { useFavorites, useQuickActions, useSavedSearches } from '@/hooks'

export function DashboardPage(): React.ReactElement {
  const { user, isAdmin } = useAuth()
  const { data: favorites, isLoading: favoritesLoading } = useFavorites()
  const { savedSearches, isLoading: searchesLoading } = useSavedSearches()
  const {
    actions: quickActions,
    isLoading: quickActionsLoading,
    updateActions,
    isUpdating,
  } = useQuickActions()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSaveActions = (actions: typeof quickActions) => {
    updateActions(actions, {
      onSuccess: () => setIsModalOpen(false),
    })
  }

  if (favoritesLoading || searchesLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-8">
      <WelcomeBanner userName={user?.name} />

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-start">
        <StatisticsCards
          favorites={favorites}
          savedSearchesCount={savedSearches.length}
          className="flex-1"
        />
        <QuickActionsCompact
          actions={quickActions}
          onEdit={() => setIsModalOpen(true)}
          isLoading={quickActionsLoading}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <FavoritesOverview favorites={favorites} />
        <SavedSearchesList savedSearches={savedSearches} />
      </div>

      <QuickActionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentActions={quickActions}
        onSave={handleSaveActions}
        isSaving={isUpdating}
        isAdmin={isAdmin}
      />
    </div>
  )
}
