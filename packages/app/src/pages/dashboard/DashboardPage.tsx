import {
  DashboardSkeleton,
  FavoritesOverview,
  QuickActions,
  SavedSearchesList,
  StatisticsCards,
  WelcomeBanner,
} from './components'
import { useAuth } from '@/components/providers/auth-provider'
import { useFavorites, useSavedSearches } from '@/hooks'

export function DashboardPage(): React.ReactElement {
  const { user } = useAuth()
  const { data: favorites, isLoading: favoritesLoading } = useFavorites()
  const { savedSearches, isLoading: searchesLoading } = useSavedSearches()

  if (favoritesLoading || searchesLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-8">
      <WelcomeBanner userName={user?.name} />
      <StatisticsCards
        favorites={favorites}
        savedSearchesCount={savedSearches.length}
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <FavoritesOverview favorites={favorites} />
        <SavedSearchesList savedSearches={savedSearches} />
      </div>
      <QuickActions />
    </div>
  )
}
