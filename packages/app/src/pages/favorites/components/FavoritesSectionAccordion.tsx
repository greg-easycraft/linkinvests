import type { OpportunityType } from '@linkinvests/shared'

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { TYPE_COLORS, TYPE_LABELS } from '@/constants'

interface FavoritesSectionAccordionProps {
  sectionKey: string
  label: string
  count: number
  type: OpportunityType
  children: React.ReactNode
}

export function FavoritesSectionAccordion({
  sectionKey,
  label,
  count,
  type,
  children,
}: FavoritesSectionAccordionProps): React.ReactElement {
  return (
    <AccordionItem
      value={sectionKey}
      className="border rounded-lg overflow-hidden"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline bg-muted/30">
        <div className="flex items-center gap-3">
          <Badge
            style={{
              backgroundColor: TYPE_COLORS[type],
              color: 'white',
            }}
          >
            {TYPE_LABELS[type]}
          </Badge>
          <span className="text-lg font-semibold">{label}</span>
          <span className="text-muted-foreground">({count})</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-0">{children}</AccordionContent>
    </AccordionItem>
  )
}
