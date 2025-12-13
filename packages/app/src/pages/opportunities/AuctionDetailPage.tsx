import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
} from 'lucide-react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'

import type { Auction, EnergyClass } from '@linkinvests/shared'
import { OpportunityType } from '@linkinvests/shared'
import {
  getDiagnosticLinks,
  searchAndLinkDiagnostics,
} from '@/api/addresses.api'
import {
  AddressRefinementButton,
  DiagnosticLinksTable,
} from '@/components/opportunities/AddressRefinement'
import { AuctionDetails } from '@/components/opportunities/OpportunityDetailsModal/AuctionDetails'
import { ImageCarousel } from '@/components/opportunities/OpportunityDetailsModal/ImageCarousel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useOpportunityById } from '@/hooks'

export function AuctionDetailPage(): React.ReactElement {
  const { auctionId } = useParams({ strict: false })
  const queryClient = useQueryClient()
  const { data: auction, isLoading } = useOpportunityById<Auction>(
    OpportunityType.AUCTION,
    auctionId,
  )

  // Fetch existing diagnostic links
  const { data: diagnosticLinks = [], isLoading: isLoadingLinks } = useQuery({
    queryKey: ['diagnosticLinks', auctionId, 'auction'],
    queryFn: () => getDiagnosticLinks(auctionId!, 'auction'),
    enabled: !!auctionId,
  })

  // Mutation to search and link diagnostics
  const searchMutation = useMutation({
    mutationFn: searchAndLinkDiagnostics,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['diagnosticLinks', auctionId, 'auction'],
      })
    },
  })

  const handleRefineAddress = () => {
    if (!auction || !auction.squareFootage) {
      return
    }
    searchMutation.mutate({
      opportunityId: auction.id,
      opportunityType: 'auction',
      input: {
        energyClass: auction.energyClass as EnergyClass,
        squareFootage: auction.squareFootage,
        zipCode: auction.zipCode,
        address: auction.address ?? undefined,
      },
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Enchère non trouvée</h1>
          <p className="text-muted-foreground mb-6">
            L'enchère que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Button asChild>
            <Link to="/search">Retour aux opportunités</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/search">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux enchères
        </Link>
      </Button>

      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge variant="outline">Enchère</Badge>
          {auction.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={auction.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Voir l'annonce originale
              </a>
            </Button>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-4">{auction.label}</h1>

        {/* Image Section */}
        <div className="mb-6">
          <ImageCarousel opportunity={auction} />
        </div>

        {/* Address */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 mt-1 shrink-0" />
            <span>
              {auction.address ?? auction.label}, {auction.zipCode}{' '}
              {auction.department}
            </span>
          </div>
          <AddressRefinementButton
            address={auction.address ?? null}
            energyClass={auction.energyClass}
            onRefine={handleRefineAddress}
            isLoading={searchMutation.isPending}
            hasExistingLinks={diagnosticLinks.length > 0}
          />
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-muted-foreground mb-6">
          <Calendar className="h-4 w-4" />
          <span>
            Date de vente :{' '}
            {format(new Date(auction.opportunityDate), 'PPP', { locale: fr })}
          </span>
        </div>

        <Separator className="my-6" />

        {/* Auction Details */}
        <AuctionDetails opportunity={auction} />

        {/* Diagnostic Links */}
        <div className="mt-6">
          <DiagnosticLinksTable
            links={diagnosticLinks}
            isLoading={isLoadingLinks || searchMutation.isPending}
          />
        </div>

        <Separator className="my-6" />

        {/* Timestamps */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Créé le {format(new Date(auction.createdAt), 'Pp', { locale: fr })}
          </div>
          <div>
            Mis à jour le{' '}
            {format(new Date(auction.updatedAt), 'Pp', { locale: fr })}
          </div>
        </div>
      </Card>
    </div>
  )
}
