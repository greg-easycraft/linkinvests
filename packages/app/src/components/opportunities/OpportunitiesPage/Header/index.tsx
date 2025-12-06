import { ArrowUpDown, Check, ChevronDown, Download } from 'lucide-react'
import type { OpportunityType } from '@/types'
import type { SortOption } from '@/constants/sort-options'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TYPE_LABELS } from '@/constants'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

interface OpportunityHeaderProps {
  opportunityType: OpportunityType
  total?: number
  isCountLoading?: boolean
  itemsOnPage?: number
  onExport?: (format: 'csv' | 'xlsx') => void
  sortOptions?: Array<SortOption>
  currentSortBy?: string
  currentSortOrder?: 'asc' | 'desc'
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

export function OpportunityHeader({
  opportunityType,
  total,
  isCountLoading,
  onExport,
  sortOptions,
  currentSortBy,
  currentSortOrder,
  onSortChange,
}: OpportunityHeaderProps): React.ReactElement {
  const currentSortValue = `${currentSortBy ?? 'opportunityDate'}_${currentSortOrder ?? 'desc'}`

  const handleSortChange = (option: SortOption): void => {
    onSortChange?.(option.sortBy, option.sortOrder)
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{TYPE_LABELS[opportunityType]}</h1>
        <div className="text-sm text-muted-foreground">
          {isCountLoading ? (
            <Skeleton className="h-5 w-24 inline-block" />
          ) : (
            <span>
              {formatNumber(total ?? 0)} résultat{(total ?? 0) > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Sort dropdown */}
        {sortOptions && sortOptions.length > 0 && onSortChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
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
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
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

export function CountSkeleton(): React.ReactElement {
  return <Skeleton className="h-5 w-24" />
}
