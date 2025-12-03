import { ChevronDown, Download } from 'lucide-react'
import type { OpportunityType } from '@/types'
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

interface OpportunityHeaderProps {
  opportunityType: OpportunityType
  total?: number
  isCountLoading?: boolean
  itemsOnPage?: number
  onExport?: (format: 'csv' | 'xlsx') => void
}

export function OpportunityHeader({
  opportunityType,
  total,
  isCountLoading,
  onExport,
}: OpportunityHeaderProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">
          {TYPE_LABELS[opportunityType] ?? opportunityType}
        </h1>
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
