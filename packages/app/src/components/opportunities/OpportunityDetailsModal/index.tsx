import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Clock, ExternalLink, MapPin } from 'lucide-react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { AuctionDetails } from './AuctionDetails'
import { EnergySieveDetails } from './EnergySieveDetails'
import { ImageCarousel } from './ImageCarousel'
import { LiquidationDetails } from './LiquidationDetails'
import { ListingDetails } from './ListingDetails'
import { SuccessionDetails } from './SuccessionDetails'
import type {
  Auction,
  EnergyClass,
  EnergyDiagnostic,
  Liquidation,
  Listing,
  Opportunity,
  Succession,
} from '@linkinvests/shared'
import { OpportunityType } from '@linkinvests/shared'
import {
  getDiagnosticLinks,
  searchAndLinkDiagnostics,
} from '@/api/addresses.api'
import {
  AddressRefinementButton,
  DiagnosticLinksTable,
} from '@/components/opportunities/AddressRefinement'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { TYPE_LABELS } from '@/constants/opportunity-types'

interface OpportunityDetailsModalProps {
  opportunity: Opportunity | null
  isOpen: boolean
  onClose: () => void
  type?: OpportunityType
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

function getEnergyClass(
  opportunity: Opportunity,
  type: OpportunityType,
): string | null {
  if (
    type === OpportunityType.AUCTION ||
    type === OpportunityType.REAL_ESTATE_LISTING
  ) {
    const opp = opportunity as Auction | Listing
    return opp.energyClass
  }
  return null
}

function getSquareFootage(
  opportunity: Opportunity,
  type: OpportunityType,
): number | null {
  if (
    type === OpportunityType.AUCTION ||
    type === OpportunityType.REAL_ESTATE_LISTING
  ) {
    const opp = opportunity as Auction | Listing
    return opp.squareFootage ?? null
  }
  return null
}

function getOpportunityTypeForApi(
  type: OpportunityType,
): 'auction' | 'listing' | null {
  if (type === OpportunityType.AUCTION) return 'auction'
  if (type === OpportunityType.REAL_ESTATE_LISTING) return 'listing'
  return null
}

export function OpportunityDetailsModal({
  opportunity,
  isOpen,
  onClose,
  type: propType,
}: OpportunityDetailsModalProps): React.ReactElement | null {
  const queryClient = useQueryClient()

  // Get type from opportunity (AllOpportunity) or fall back to prop
  const type =
    opportunity && 'type' in opportunity && opportunity.type
      ? (opportunity.type as OpportunityType)
      : propType!

  const opportunityType = getOpportunityTypeForApi(type)
  const energyClass = opportunity ? getEnergyClass(opportunity, type) : null
  const squareFootage = opportunity ? getSquareFootage(opportunity, type) : null

  // Fetch existing diagnostic links
  const { data: diagnosticLinks = [], isLoading: isLoadingLinks } = useQuery({
    queryKey: ['diagnosticLinks', opportunity?.id, opportunityType],
    queryFn: () =>
      getDiagnosticLinks(
        opportunity!.id,
        opportunityType as 'auction' | 'listing',
      ),
    enabled: !!opportunity && !!opportunityType,
  })

  // Mutation to search and link diagnostics
  const searchMutation = useMutation({
    mutationFn: searchAndLinkDiagnostics,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['diagnosticLinks', opportunity?.id, opportunityType],
      })
    },
  })

  const handleRefineAddress = () => {
    if (!opportunity || !opportunityType || !energyClass || !squareFootage) {
      return
    }
    searchMutation.mutate({
      opportunityId: opportunity.id,
      opportunityType,
      input: {
        energyClass: energyClass as EnergyClass,
        squareFootage,
        zipCode: opportunity.zipCode,
        address: opportunity.streetAddress ?? undefined,
      },
    })
  }

  if (!opportunity) return null

  const detailPageUrl = getDetailPageUrl(opportunity, type)
  const supportsAddressRefinement = opportunityType !== null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 mt-1 shrink-0" />
            <span>
              {opportunity.streetAddress
                ? `${opportunity.streetAddress}, ${opportunity.city}`
                : opportunity.city}
              , {opportunity.zipCode} {opportunity.department}
            </span>
          </div>
          {supportsAddressRefinement && (
            <AddressRefinementButton
              address={opportunity.streetAddress ?? null}
              energyClass={energyClass}
              onRefine={handleRefineAddress}
              isLoading={searchMutation.isPending}
              hasExistingLinks={diagnosticLinks.length > 0}
            />
          )}
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

        {/* Diagnostic Links Table */}
        {supportsAddressRefinement && (
          <DiagnosticLinksTable
            links={diagnosticLinks}
            isLoading={isLoadingLinks || searchMutation.isPending}
          />
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
