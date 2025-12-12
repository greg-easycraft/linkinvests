import { OpportunityCard } from './OpportunityCard'
import { OpportunitiesListSkeleton } from './OpportunitiesListSkeleton'
import { OpportunitiesListEmptyState } from './OpportunitiesListEmptyState'
import type { BaseOpportunity, Opportunity, OpportunityType } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'

interface OpportunitiesListProps<T extends BaseOpportunity> {
  opportunities: Array<T>
  type?: OpportunityType
  isLoading: boolean
  selectedId?: string
  onSelect: (opportunity: T) => void
}

export function OpportunitiesList<T extends BaseOpportunity>({
  opportunities,
  type,
  isLoading,
  selectedId,
  onSelect,
}: OpportunitiesListProps<T>): React.ReactElement {
  if (isLoading) {
    return (
      <ScrollArea className="h-full">
        <OpportunitiesListSkeleton />
      </ScrollArea>
    )
  }

  if (opportunities.length === 0) {
    return <OpportunitiesListEmptyState />
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pb-4">
        {opportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity as unknown as Opportunity}
            type={type}
            selectedId={selectedId}
            onSelect={(opp) => onSelect(opp as unknown as T)}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

export { OpportunityCard } from './OpportunityCard'
export { OpportunitiesListSkeleton } from './OpportunitiesListSkeleton'
export { OpportunitiesListEmptyState } from './OpportunitiesListEmptyState'
