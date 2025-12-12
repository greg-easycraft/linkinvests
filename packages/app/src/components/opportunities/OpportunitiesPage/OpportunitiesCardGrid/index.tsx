import { OpportunityGridCard } from './OpportunityGridCard'
import type { BaseOpportunity, Opportunity, OpportunityType } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

interface OpportunitiesCardGridProps<T extends BaseOpportunity> {
  opportunities: Array<T>
  type?: OpportunityType
  isLoading: boolean
  selectedId?: string
  onSelect: (opportunity: T) => void
}

export function OpportunitiesCardGrid<T extends BaseOpportunity>({
  opportunities,
  type,
  isLoading,
  onSelect,
}: OpportunitiesCardGridProps<T>): React.ReactElement {
  if (isLoading) {
    return (
      <ScrollArea className="h-full">
        <OpportunitiesCardGridSkeleton />
      </ScrollArea>
    )
  }

  if (opportunities.length === 0) {
    return <OpportunitiesCardGridEmptyState />
  }

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
        {opportunities.map((opportunity) => (
          <OpportunityGridCard
            key={opportunity.id}
            opportunity={opportunity as unknown as Opportunity}
            type={type}
            onSelect={(opp) => onSelect(opp as unknown as T)}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

function OpportunitiesCardGridSkeleton(): React.ReactElement {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </Card>
      ))}
    </div>
  )
}

function OpportunitiesCardGridEmptyState(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="text-muted-foreground">
        <p className="text-lg font-medium">Aucune opportunité trouvée</p>
        <p className="text-sm mt-1">
          Essayez de modifier vos filtres pour voir plus de résultats.
        </p>
      </div>
    </div>
  )
}

export { OpportunityGridCard } from './OpportunityGridCard'
