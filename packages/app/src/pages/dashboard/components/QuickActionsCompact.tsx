import { Pencil } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { getActionById } from './quick-actions-config'
import type { QuickActionId } from '@linkinvests/shared'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface QuickActionsCompactProps {
  actions: Array<QuickActionId>
  onEdit: () => void
  isLoading?: boolean
}

export function QuickActionsCompact({
  actions,
  onEdit,
  isLoading,
}: QuickActionsCompactProps) {
  if (isLoading) {
    return (
      <Card className="flex-shrink-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex-shrink-0">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {actions.map((actionId, index) => {
            const action = getActionById(actionId)
            if (!action) return null

            const Icon = action.icon
            const isFirst = index === 0

            return (
              <Button
                key={actionId}
                variant={isFirst ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link to={action.link} search={action.searchParams}>
                  <Icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Link>
              </Button>
            )
          })}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-1"
            onClick={onEdit}
            title="Personnaliser les actions"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
