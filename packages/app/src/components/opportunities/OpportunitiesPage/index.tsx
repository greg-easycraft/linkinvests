import { useCallback, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { OpportunityDetailsModal } from '../OpportunityDetailsModal'
import { OpportunityHeader } from './Header'
import { OpportunitiesList } from './OpportunitiesList'
import { OpportunitiesMap } from './OpportunitiesMap'
import type {
  BaseOpportunity,
  OpportunitiesDataQueryResult,
  Opportunity,
  OpportunityType,
} from '@/types'
import type { SortOption } from '@/constants/sort-options'
import { useDelayedSkeleton } from '@/hooks'
import { Button } from '@/components/ui/button'

interface OpportunitiesPageProps<T extends BaseOpportunity> {
  data?: OpportunitiesDataQueryResult<T>
  count?: number
  isCountLoading?: boolean
  isLoading: boolean
  opportunityType?: OpportunityType
  FiltersComponent: React.ReactNode
  viewMode?: 'list' | 'map'
  onExport?: (format: 'csv' | 'xlsx') => void
  sortOptions?: Array<SortOption>
  currentSortBy?: string
  currentSortOrder?: 'asc' | 'desc'
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
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
  sortOptions,
  currentSortBy,
  currentSortOrder,
  onSortChange,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: OpportunitiesPageProps<T>): React.ReactElement {
  // Use delayed skeleton to prevent flashing when data loads quickly
  const showSkeleton = useDelayedSkeleton(isLoading)
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(true)

  const handleSelectOpportunity = useCallback(
    (opportunity: Opportunity): void => {
      setSelectedOpportunity(opportunity)
      setIsModalOpen(true)
    },
    [],
  )

  const handleCloseModal = useCallback((): void => {
    setIsModalOpen(false)
    setSelectedOpportunity(null)
  }, [])

  const handleToggleSidebar = useCallback((): void => {
    setIsFiltersSidebarOpen((prev) => !prev)
  }, [])

  const opportunities = data?.opportunities ?? []

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header spanning full width */}
      <div className="flex-shrink-0 px-4 pt-4">
        <OpportunityHeader
          opportunityType={opportunityType}
          total={count}
          isCountLoading={isCountLoading}
          itemsOnPage={opportunities.length}
          onExport={onExport}
          sortOptions={sortOptions}
          currentSortBy={currentSortBy}
          currentSortOrder={currentSortOrder}
          onSortChange={onSortChange}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>

      {/* Content area with filters sidebar and main content */}
      <div className="flex flex-1 overflow-hidden relative">
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
          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'list' ? (
              <OpportunitiesList
                opportunities={opportunities as unknown as Array<Opportunity>}
                type={opportunityType}
                isLoading={showSkeleton}
                selectedId={selectedOpportunity?.id}
                onSelect={handleSelectOpportunity}
              />
            ) : (
              <OpportunitiesMap
                opportunities={opportunities as unknown as Array<Opportunity>}
                type={opportunityType}
                isLoading={showSkeleton}
                selectedId={selectedOpportunity?.id}
                onSelect={handleSelectOpportunity}
              />
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <OpportunityDetailsModal
        opportunity={selectedOpportunity}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        type={opportunityType}
      />
    </div>
  )
}

export default OpportunitiesPage
