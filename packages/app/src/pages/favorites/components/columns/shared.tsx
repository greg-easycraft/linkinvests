import { Calendar, MapPin } from 'lucide-react'

import type { EnergyClassType } from '@linkinvests/shared'
import { Badge } from '@/components/ui/badge'
import { EnergyClassBadge } from '@/components/ui/energy-class-badge'
import { formatPrice, formatShortDate, formatSiret } from '@/lib/format'

interface StatusConfig {
  label: string
  className: string
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  added_to_favorites: {
    label: 'Ajouté',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  email_sent: {
    label: 'Email envoyé',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
}

interface StatusCellProps {
  status: string
}

export function StatusCell({ status }: StatusCellProps): React.ReactElement {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  }
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

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

