import { Map as MapIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { BaseOpportunity, OpportunityType } from '@/types'

interface OpportunitiesMapProps<T extends BaseOpportunity> {
  opportunities: T[]
  type: OpportunityType
  isLoading: boolean
  selectedId?: string
  onSelect: (opportunity: T) => void
}

export function OpportunitiesMap<T extends BaseOpportunity>({
  opportunities,
  isLoading,
}: OpportunitiesMapProps<T>): React.ReactElement {
  if (isLoading) {
    return <MapSkeleton />
  }

  // Placeholder - map integration would go here
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-muted/30 rounded-lg border border-dashed">
      <MapIcon className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Vue carte</h3>
      <p className="text-muted-foreground text-center max-w-md">
        La vue carte afficherait {opportunities.length} opportunité(s) sur une
        carte interactive.
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Intégration Google Maps / Mapbox à venir
      </p>
    </div>
  )
}

export function MapSkeleton(): React.ReactElement {
  return (
    <div className="h-full w-full">
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
  )
}

export function MapEmptyState(): React.ReactElement {
  return (
    <div className="h-full w-full flex items-center justify-center bg-muted/30 rounded-lg">
      <div className="text-center">
        <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">
          Aucune opportunité à afficher sur la carte
        </p>
      </div>
    </div>
  )
}
