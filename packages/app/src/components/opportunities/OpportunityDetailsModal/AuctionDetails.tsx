import {
  Building,
  DoorOpen,
  Euro,
  Home,
  Mail,
  Phone,
  Ruler,
  User,
  Zap,
} from 'lucide-react'
import type { Auction } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/format'

interface AuctionDetailsProps {
  opportunity: Auction
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  flat: 'Appartement',
  house: 'Maison',
  commercial: 'Local commercial',
  land: 'Terrain',
  other: 'Autre',
}

const OCCUPATION_STATUS_LABELS: Record<string, string> = {
  occupied_by_owner: 'Occupé par le propriétaire',
  rented: 'Loué',
  free: 'Libre',
  unknown: 'Inconnu',
}

export function AuctionDetails({
  opportunity,
}: AuctionDetailsProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Prices Section */}
      <div className="grid grid-cols-2 gap-4">
        {opportunity.currentPrice !== undefined && (
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">Prix actuel</div>
            <div className="text-lg font-semibold text-primary flex items-center gap-1">
              <Euro className="h-4 w-4" />
              {formatPrice(opportunity.currentPrice)}
            </div>
          </Card>
        )}
        {opportunity.reservePrice !== undefined && (
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">Mise à prix</div>
            <div className="text-lg font-semibold flex items-center gap-1">
              <Euro className="h-4 w-4" />
              {formatPrice(opportunity.reservePrice)}
            </div>
          </Card>
        )}
      </div>

      {/* Estimates */}
      {(opportunity.lowerEstimate !== undefined ||
        opportunity.upperEstimate !== undefined) && (
        <div className="text-sm text-muted-foreground">
          Estimation:{' '}
          {opportunity.lowerEstimate !== undefined &&
            formatPrice(opportunity.lowerEstimate)}
          {opportunity.lowerEstimate !== undefined &&
            opportunity.upperEstimate !== undefined &&
            ' - '}
          {opportunity.upperEstimate !== undefined &&
            formatPrice(opportunity.upperEstimate)}
        </div>
      )}

      {/* Property Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {opportunity.propertyType && (
          <div className="flex items-center gap-2 text-sm">
            <Home className="h-4 w-4 text-muted-foreground" />
            <span>{PROPERTY_TYPE_LABELS[opportunity.propertyType] ?? opportunity.propertyType}</span>
          </div>
        )}
        {opportunity.squareFootage !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <span>{opportunity.squareFootage} m²</span>
          </div>
        )}
        {opportunity.rooms !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
            <span>{opportunity.rooms} pièces</span>
          </div>
        )}
        {opportunity.energyClass !== 'UNKNOWN' && (
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">DPE {opportunity.energyClass}</Badge>
          </div>
        )}
      </div>

      {/* Occupation Status */}
      <div className="text-sm">
        <span className="text-muted-foreground">Statut d'occupation: </span>
        <span>{OCCUPATION_STATUS_LABELS[opportunity.occupationStatus] ?? opportunity.occupationStatus}</span>
      </div>

      {/* Description */}
      {opportunity.description && (
        <div className="text-sm">
          <div className="font-medium mb-1">Description</div>
          <p className="text-muted-foreground whitespace-pre-line">
            {opportunity.description}
          </p>
        </div>
      )}

      {/* Auction Venue */}
      {opportunity.auctionVenue && (
        <div className="text-sm">
          <span className="text-muted-foreground">Lieu de la vente: </span>
          <span>{opportunity.auctionVenue}</span>
        </div>
      )}

      {/* Auction House Contact */}
      {opportunity.auctionHouseContact && (
        <Card className="p-4">
          <div className="font-medium mb-3 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Contact Étude
          </div>
          <div className="space-y-2 text-sm">
            {opportunity.auctionHouseContact.name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{opportunity.auctionHouseContact.name}</span>
              </div>
            )}
            {opportunity.auctionHouseContact.auctioneer && (
              <div className="text-muted-foreground ml-6">
                Commissaire-priseur: {opportunity.auctionHouseContact.auctioneer}
              </div>
            )}
            {opportunity.auctionHouseContact.address && (
              <div className="text-muted-foreground ml-6">
                {opportunity.auctionHouseContact.address}
              </div>
            )}
            {opportunity.auctionHouseContact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${opportunity.auctionHouseContact.phone}`}
                  className="text-primary hover:underline"
                >
                  {opportunity.auctionHouseContact.phone}
                </a>
              </div>
            )}
            {opportunity.auctionHouseContact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${opportunity.auctionHouseContact.email}`}
                  className="text-primary hover:underline"
                >
                  {opportunity.auctionHouseContact.email}
                </a>
              </div>
            )}
            {opportunity.auctionHouseContact.depositAmount !== undefined && (
              <div className="text-muted-foreground">
                Consignation: {formatPrice(opportunity.auctionHouseContact.depositAmount)}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
