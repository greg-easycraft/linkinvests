import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OpportunityHeader } from './Header'
import { OpportunitiesList } from './OpportunitiesList'
import { OpportunitiesMap } from './OpportunitiesMap'
import { useDelayedSkeleton } from '@/hooks'
import type {
  BaseOpportunity,
  Opportunity,
  OpportunitiesDataQueryResult,
  OpportunityType,
} from '@/types'

interface OpportunitiesPageProps<T extends BaseOpportunity> {
  data?: OpportunitiesDataQueryResult<T>
  count?: number
  isCountLoading?: boolean
  isLoading: boolean
  opportunityType: OpportunityType
  FiltersComponent: React.ReactNode
  viewMode?: 'list' | 'map'
  onExport?: (format: 'csv' | 'xlsx') => void
}

export function OpportunitiesPage<T extends BaseOpportunity>({
  data,
  count,
  isCountLoading,
  isLoading,
  opportunityType,
  FiltersComponent,
  viewMode = 'list',
  onExport,
}: OpportunitiesPageProps<T>): React.ReactElement {
  // Use delayed skeleton to prevent flashing when data loads quickly
  const showSkeleton = useDelayedSkeleton(isLoading)
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null)
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(true)

  const handleSelectOpportunity = useCallback(
    (opportunity: Opportunity): void => {
      setSelectedOpportunity(opportunity)
      // Could open a modal here
    },
    [],
  )

  const handleToggleSidebar = useCallback((): void => {
    setIsFiltersSidebarOpen((prev) => !prev)
  }, [])

  const opportunities = data?.opportunities ?? []

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Toggle Button for Filters */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-r-md rounded-l-none"
        style={{ left: isFiltersSidebarOpen ? '303px' : '0' }}
        onClick={handleToggleSidebar}
      >
        {isFiltersSidebarOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* Content Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Filters Sidebar */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isFiltersSidebarOpen ? 'w-80' : 'w-0'
          }`}
        >
          {isFiltersSidebarOpen && (
            <div className="p-4 pr-0 h-full overflow-y-auto">
              {FiltersComponent}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          {/* Header with count and export */}
          <OpportunityHeader
            opportunityType={opportunityType}
            total={count}
            isCountLoading={isCountLoading}
            itemsOnPage={opportunities.length}
            onExport={onExport}
          />

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'list' ? (
              <OpportunitiesList
                opportunities={opportunities as unknown as Opportunity[]}
                type={opportunityType}
                isLoading={showSkeleton}
                selectedId={selectedOpportunity?.id}
                onSelect={handleSelectOpportunity}
              />
            ) : (
              <OpportunitiesMap
                opportunities={opportunities as unknown as Opportunity[]}
                type={opportunityType}
                isLoading={showSkeleton}
                selectedId={selectedOpportunity?.id}
                onSelect={handleSelectOpportunity}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpportunitiesPage
