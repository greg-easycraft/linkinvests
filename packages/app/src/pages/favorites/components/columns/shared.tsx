import { Calendar, ExternalLink, MapPin } from 'lucide-react'

import type { OpportunityType } from '@linkinvests/shared'

import type { EnergyClassType } from '@/types'
import { Button } from '@/components/ui/button'
import { EnergyClassBadge } from '@/components/ui/energy-class-badge'
import { FavoriteButton } from '@/components/ui/favorite-button'
import { formatPrice, formatShortDate, formatSiret } from '@/lib/format'

interface AddressCellProps {
  address?: string
}

export function AddressCell({ address }: AddressCellProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2 max-w-[200px]">
      <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <span className="truncate">{address ?? 'Non disponible'}</span>
    </div>
  )
}

interface DateCellProps {
  date?: string
}

export function DateCell({ date }: DateCellProps): React.ReactElement {
  if (!date) {
    return <span className="text-muted-foreground">NC</span>
  }

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <span>{formatShortDate(date)}</span>
    </div>
  )
}

interface PriceCellProps {
  price?: number
  variant?: 'green' | 'orange'
}

export function PriceCell({
  price,
  variant = 'green',
}: PriceCellProps): React.ReactElement {
  if (!price) {
    return <span className="text-muted-foreground">NC</span>
  }

  return (
    <span
      className={
        variant === 'green'
          ? 'text-green-600 font-semibold'
          : 'text-orange-600 font-semibold'
      }
    >
      {formatPrice(price)}
    </span>
  )
}

interface SurfaceCellProps {
  squareFootage?: number
}

export function SurfaceCell({
  squareFootage,
}: SurfaceCellProps): React.ReactElement {
  if (!squareFootage) {
    return <span className="text-muted-foreground">NC</span>
  }

  return <span>{squareFootage} m²</span>
}

interface EnergyCellProps {
  energyClass?: EnergyClassType | string
}

export function EnergyCell({
  energyClass,
}: EnergyCellProps): React.ReactElement {
  return <EnergyClassBadge energyClass={energyClass} size="sm" />
}

interface LabelCellProps {
  label: string
}

export function LabelCell({ label }: LabelCellProps): React.ReactElement {
  return (
    <span className="font-medium truncate max-w-[200px] block">{label}</span>
  )
}

interface SiretCellProps {
  siret?: string
}

export function SiretCell({ siret }: SiretCellProps): React.ReactElement {
  if (!siret) {
    return <span className="text-muted-foreground">NC</span>
  }

  return <span className="font-mono text-sm">{formatSiret(siret)}</span>
}

interface ActionsCellProps {
  opportunityId: string
  opportunityType: OpportunityType
  url?: string
}

export function ActionsCell({
  opportunityId,
  opportunityType,
  url,
}: ActionsCellProps): React.ReactElement {
  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {url && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          onClick={handleExternalClick}
          title="Voir sur le site externe"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      )}
      <FavoriteButton
        opportunityId={opportunityId}
        opportunityType={opportunityType}
      />
    </div>
  )
}
