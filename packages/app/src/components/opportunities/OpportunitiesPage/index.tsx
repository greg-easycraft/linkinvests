import { useCallback, useState } from 'react'
import { OpportunityDetailsModal } from '../OpportunityDetailsModal'
import { OpportunityHeader } from './Header'
import { OpportunitiesList } from './OpportunitiesList'
import { OpportunitiesMap } from './OpportunitiesMap'
import { OpportunitiesCardGrid } from './OpportunitiesCardGrid'
import type {
  BaseOpportunity,
  OpportunitiesDataQueryResult,
  Opportunity,
  OpportunityType,
} from '@linkinvests/shared'
import type { SortOption } from '@/constants/sort-options'
import type { ViewMode } from '@/components/filters/ViewToggleGroup'
import type { MapBounds } from '@/schemas/filters.schema'
import { useDelayedSkeleton } from '@/hooks'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'

interface OpportunitiesPageProps<T extends BaseOpportunity> {
  data?: OpportunitiesDataQueryResult<T>
  count?: number
  isCountLoading?: boolean
  isLoading: boolean
  opportunityType?: OpportunityType
  FiltersComponent: React.ReactNode
  viewMode?: ViewMode
  onViewChange?: (view: ViewMode) => void
  onBoundsChange?: (bounds: MapBounds) => void
  onExport?: (format: 'csv' | 'xlsx') => void
  sortOptions?: Array<SortOption>
  currentSortBy?: string
  currentSortOrder?: 'asc' | 'desc'
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  mapViewLimit?: number
}

export function OpportunitiesPage<T extends BaseOpportunity>({
  data,
  count,
  isCountLoading,
  isLoading,
  opportunityType,
  FiltersComponent,
  viewMode = 'list',
  onViewChange,
  onBoundsChange,
  onExport,
  sortOptions,
  currentSortBy,
  currentSortOrder,
  onSortChange,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  mapViewLimit,
}: OpportunitiesPageProps<T>): React.ReactElement {
  // Use delayed skeleton to prevent flashing when data loads quickly
  const showSkeleton = useDelayedSkeleton(isLoading)
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

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

  const opportunities = data?.opportunities ?? []

  const renderContent = (): React.ReactElement => {
    switch (viewMode) {
      case 'cards':
        return (
          <OpportunitiesCardGrid
            opportunities={opportunities as unknown as Array<Opportunity>}
            type={opportunityType}
            isLoading={showSkeleton}
            selectedId={selectedOpportunity?.id}
            onSelect={handleSelectOpportunity}
          />
        )
      case 'map':
        return (
          <OpportunitiesMap
            opportunities={opportunities as unknown as Array<Opportunity>}
            type={opportunityType}
            isLoading={showSkeleton}
            selectedId={selectedOpportunity?.id}
            onSelect={handleSelectOpportunity}
            onBoundsChange={onBoundsChange}
          />
        )
      default:
        return (
          <OpportunitiesList
            opportunities={opportunities as unknown as Array<Opportunity>}
            type={opportunityType}
            isLoading={showSkeleton}
            selectedId={selectedOpportunity?.id}
            onSelect={handleSelectOpportunity}
          />
        )
    }
  }

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
          viewMode={viewMode}
          onViewChange={onViewChange}
          onOpenFilters={() => setIsFiltersOpen(true)}
          mapViewLimit={mapViewLimit}
        />
      </div>

      {/* Main Content - full width */}
      <div className="flex-1 overflow-hidden p-4">{renderContent()}</div>

      {/* Filters Sheet */}
      <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <SheetContent side="left" className="w-screen max-w-[40rem] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Filtres</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-4">{FiltersComponent}</div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

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
