import { Heart } from 'lucide-react'

import { Button } from './button'

import type { OpportunityType } from '@linkinvests/shared'

import { useFavorite } from '@/hooks'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  opportunityId: string
  opportunityType: OpportunityType
  className?: string
}

export function FavoriteButton({
  opportunityId,
  opportunityType,
  className,
}: FavoriteButtonProps) {
  const { isFavorite, isLoading, isToggling, toggleFavorite } = useFavorite(
    opportunityId,
    opportunityType,
  )

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    toggleFavorite()
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn('rounded-full', className)}
      onClick={handleClick}
      disabled={isLoading || isToggling}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground',
        )}
      />
    </Button>
  )
}
