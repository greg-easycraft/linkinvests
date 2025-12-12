import { LayoutGrid, List, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type ViewMode = 'list' | 'cards' | 'map'

interface ViewToggleGroupProps {
  value: ViewMode
  onChange: (view: ViewMode) => void
}

const VIEW_OPTIONS: Array<{
  value: ViewMode
  icon: typeof List
  label: string
}> = [
  { value: 'list', icon: List, label: 'Vue liste' },
  { value: 'cards', icon: LayoutGrid, label: 'Vue cartes' },
  { value: 'map', icon: Map, label: 'Vue carte' },
]

export function ViewToggleGroup({
  value,
  onChange,
}: ViewToggleGroupProps): React.ReactElement {
  return (
    <div className="inline-flex rounded-md border" role="group">
      {VIEW_OPTIONS.map(({ value: optionValue, icon: Icon, label }, index) => (
        <Tooltip key={optionValue}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'rounded-none h-9 w-9 cursor-pointer',
                index === 0 && 'rounded-l-md',
                index === VIEW_OPTIONS.length - 1 && 'rounded-r-md',
                value === optionValue && 'bg-accent text-accent-foreground',
              )}
              onClick={() => onChange(optionValue)}
            >
              <Icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
