import { Link, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Listing } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { useOpportunityById } from '@/hooks'
import { ListingDetails } from '@/components/opportunities/OpportunityDetailsModal/ListingDetails'
import { ImageCarousel } from '@/components/opportunities/OpportunityDetailsModal/ImageCarousel'
import { OpportunityType } from '@/types'

export function ListingDetailPage(): React.ReactElement {
  const { listingId } = useParams({ strict: false })
  const { data: listing, isLoading } = useOpportunityById<Listing>(
    OpportunityType.REAL_ESTATE_LISTING,
    listingId,
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Annonce non trouvée</h1>
          <p className="text-muted-foreground mb-6">
            L'annonce que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Button asChild>
            <Link to="/search/listings">Retour aux annonces</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/search/listings">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux annonces
        </Link>
      </Button>

      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge variant="outline">Annonce immobilière</Badge>
          {listing.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={listing.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Voir l'annonce originale
              </a>
            </Button>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-4">{listing.label}</h1>

        {/* Image Section */}
        <div className="mb-6">
          <ImageCarousel opportunity={listing} />
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mt-1 shrink-0" />
          <span>
            {listing.address ?? listing.label}, {listing.zipCode}{' '}
            {listing.department}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-muted-foreground mb-6">
          <Calendar className="h-4 w-4" />
          <span>
            Publiée le :{' '}
            {format(new Date(listing.opportunityDate), 'PPP', { locale: fr })}
          </span>
        </div>

        <Separator className="my-6" />

        {/* Listing Details */}
        <ListingDetails opportunity={listing} />

        <Separator className="my-6" />

        {/* Timestamps */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Créé le {format(new Date(listing.createdAt), 'Pp', { locale: fr })}
          </div>
          <div>
            Mis à jour le{' '}
            {format(new Date(listing.updatedAt), 'Pp', { locale: fr })}
          </div>
        </div>
      </Card>
    </div>
  )
}
