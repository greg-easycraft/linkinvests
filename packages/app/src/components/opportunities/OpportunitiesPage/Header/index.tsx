import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  SlidersHorizontal,
} from 'lucide-react'
import type { ViewMode } from '@/components/filters/ViewToggleGroup'
import type { SortOption } from '@/constants/sort-options'
import type { OpportunityType } from '@/types'
import { ViewToggleGroup } from '@/components/filters/ViewToggleGroup'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200]

interface OpportunityHeaderProps {
  opportunityType?: OpportunityType
  total?: number
  isCountLoading?: boolean
  itemsOnPage?: number
  onExport?: (format: 'csv' | 'xlsx') => void
  sortOptions?: Array<SortOption>
  currentSortBy?: string
  currentSortOrder?: 'asc' | 'desc'
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  viewMode?: ViewMode
  onViewChange?: (view: ViewMode) => void
  onOpenFilters?: () => void
}

export function OpportunityHeader({
  total,
  isCountLoading,
  itemsOnPage = 0,
  onExport,
  sortOptions,
  currentSortBy,
  currentSortOrder,
  onSortChange,
  currentPage = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  onPageSizeChange,
  viewMode = 'list',
  onViewChange,
  onOpenFilters,
}: OpportunityHeaderProps): React.ReactElement {
  const currentSortValue = `${currentSortBy ?? 'opportunityDate'}_${currentSortOrder ?? 'desc'}`
  const totalPages = Math.ceil((total ?? 0) / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(startItem + itemsOnPage - 1, total ?? 0)

  const handleSortChange = (option: SortOption): void => {
    onSortChange?.(option.sortBy, option.sortOrder)
  }

  return (
    <div className="flex items-center justify-between">
      {/* Left side: Results count and pagination */}
      <div className="flex items-center gap-6">
        <div className="text-sm">
          Affichage de{' '}
          <span className="font-bold">
            {startItem}-{endItem}
          </span>{' '}
          sur{' '}
          {isCountLoading ? (
            <Skeleton className="h-5 w-16 inline-block align-middle" />
          ) : (
            <span className="font-bold">{formatNumber(total ?? 0)}</span>
          )}{' '}
          opportunités
        </div>

        {/* Pagination */}
        {totalPages > 1 && onPageChange && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}

        {/* Page size selector */}
        {onPageSizeChange && (
          <PageSizeSelector
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>

      {/* Right side: View toggle, Filter, Sort, Export */}
      <div className="flex items-center gap-2">
        {/* View toggle */}
        {onViewChange && (
          <ViewToggleGroup value={viewMode} onChange={onViewChange} />
        )}

        {/* Filter button */}
        {onOpenFilters && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenFilters}
                className="cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ouvrir les filtres</TooltipContent>
          </Tooltip>
        )}

        {/* Sort dropdown */}
        {sortOptions && sortOptions.length > 0 && onSortChange && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="cursor-pointer">
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Trier les résultats</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option)}
                  className={cn(
                    'flex items-center justify-between',
                    currentSortValue === option.value && 'bg-accent',
                  )}
                >
                  {option.label}
                  {currentSortValue === option.value && (
                    <Check className="h-4 w-4 ml-2" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Export dropdown */}
        {onExport && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Exporter les opportunités</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport('csv')}>
                Exporter en CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('xlsx')}>
                Exporter en Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}): React.ReactElement {
  return (
    <div className="flex items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="gap-2 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
        </TooltipTrigger>
        <TooltipContent>Aller à la page précédente</TooltipContent>
      </Tooltip>

      <div className="text-sm px-4">
        Page <b>{currentPage}</b> sur <b>{totalPages}</b>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="gap-2 cursor-pointer"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Aller à la page suivante</TooltipContent>
      </Tooltip>
    </div>
  )
}

function PageSizeSelector({
  pageSize,
  onPageSizeChange,
}: {
  pageSize: number
  onPageSizeChange: (pageSize: number) => void
}): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">Éléments par page:</span>
      <Select
        value={pageSize.toString()}
        onValueChange={(value: string) => onPageSizeChange(parseInt(value, 10))}
      >
        <SelectTrigger className="w-20 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function CountSkeleton(): React.ReactElement {
  return <Skeleton className="h-5 w-24" />
}
