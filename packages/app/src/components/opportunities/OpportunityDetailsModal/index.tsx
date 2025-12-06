import { Calendar, Clock, ExternalLink, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Link } from '@tanstack/react-router'
import { AuctionDetails } from './AuctionDetails'
import { ListingDetails } from './ListingDetails'
import { SuccessionDetails } from './SuccessionDetails'
import { LiquidationDetails } from './LiquidationDetails'
import { EnergySieveDetails } from './EnergySieveDetails'
import { ImageCarousel } from './ImageCarousel'
import type {
  Auction,
  EnergyDiagnostic,
  Liquidation,
  Listing,
  Opportunity,
  Succession,
} from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { OpportunityType } from '@/types'
import { TYPE_LABELS } from '@/constants/opportunity-types'

interface OpportunityDetailsModalProps {
  opportunity: Opportunity | null
  isOpen: boolean
  onClose: () => void
  type: OpportunityType
}

const getDetailPageUrl = (
  opportunity: Opportunity,
  type: OpportunityType,
): string => {
  const typeToPath: Record<OpportunityType, string> = {
    [OpportunityType.AUCTION]: 'auctions',
    [OpportunityType.REAL_ESTATE_LISTING]: 'listings',
    [OpportunityType.SUCCESSION]: 'successions',
    [OpportunityType.LIQUIDATION]: 'liquidations',
    [OpportunityType.ENERGY_SIEVE]: 'energy-sieves',
    [OpportunityType.DIVORCE]: 'divorces',
  }
  return `/${typeToPath[type]}/${opportunity.id}`
}

export function OpportunityDetailsModal({
  opportunity,
  isOpen,
  onClose,
  type,
}: OpportunityDetailsModalProps): React.ReactElement | null {
  if (!opportunity) return null

  const detailPageUrl = getDetailPageUrl(opportunity, type)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline">{TYPE_LABELS[type]}</Badge>
            <Button variant="outline" size="sm" asChild>
              <Link to={detailPageUrl}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Voir le détail
              </Link>
            </Button>
          </div>
          <DialogTitle className="text-xl">{opportunity.label}</DialogTitle>
        </DialogHeader>

        {/* Image Section */}
        <ImageCarousel opportunity={opportunity} />

        {/* Address */}
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 mt-1 shrink-0" />
          <span>
            {opportunity.address ?? opportunity.label}, {opportunity.zipCode}{' '}
            {opportunity.department}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(opportunity.opportunityDate), 'PPP', {
              locale: fr,
            })}
          </span>
        </div>

        <Separator />

        {/* Type-specific details */}
        {type === OpportunityType.AUCTION && (
          <AuctionDetails opportunity={opportunity as Auction} />
        )}
        {type === OpportunityType.REAL_ESTATE_LISTING && (
          <ListingDetails opportunity={opportunity as Listing} />
        )}
        {type === OpportunityType.SUCCESSION && (
          <SuccessionDetails opportunity={opportunity as Succession} />
        )}
        {type === OpportunityType.LIQUIDATION && (
          <LiquidationDetails opportunity={opportunity as Liquidation} />
        )}
        {type === OpportunityType.ENERGY_SIEVE && (
          <EnergySieveDetails opportunity={opportunity as EnergyDiagnostic} />
        )}

        <Separator />

        {/* Timestamps */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Créé le{' '}
            {format(new Date(opportunity.createdAt), 'Pp', { locale: fr })}
          </div>
          <div>
            Mis à jour le{' '}
            {format(new Date(opportunity.updatedAt), 'Pp', { locale: fr })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
