import {
  Bed,
  Building,
  Calendar,
  DoorOpen,
  Euro,
  Globe,
  Home,
  Mail,
  Phone,
  Ruler,
  TreeDeciduous,
  User,
  Zap,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Listing } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/format'

interface ListingDetailsProps {
  opportunity: Listing
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  flat: 'Appartement',
  house: 'Maison',
  commercial: 'Local commercial',
  land: 'Terrain',
  other: 'Autre',
}

export function ListingDetails({
  opportunity,
}: ListingDetailsProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Price Section */}
      <div className="grid grid-cols-2 gap-4">
        {opportunity.price !== undefined && (
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">Prix</div>
            <div className="text-lg font-semibold text-primary flex items-center gap-1">
              <Euro className="h-4 w-4" />
              {formatPrice(opportunity.price)}
              {opportunity.priceType && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({opportunity.priceType})
                </span>
              )}
            </div>
          </Card>
        )}
        {opportunity.fees !== undefined && (
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">Frais d'agence</div>
            <div className="text-lg font-semibold flex items-center gap-1">
              <Euro className="h-4 w-4" />
              {formatPrice(opportunity.fees)}
            </div>
          </Card>
        )}
      </div>

      {/* Charges */}
      {opportunity.charges !== undefined && (
        <div className="text-sm text-muted-foreground">
          Charges: {formatPrice(opportunity.charges)}/mois
        </div>
      )}

      {/* Property Details */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Home className="h-4 w-4 text-muted-foreground" />
          <span>{PROPERTY_TYPE_LABELS[opportunity.propertyType]}</span>
        </div>
        {opportunity.squareFootage !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <span>{opportunity.squareFootage} m²</span>
          </div>
        )}
        {opportunity.landArea !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <TreeDeciduous className="h-4 w-4 text-muted-foreground" />
            <span>{opportunity.landArea} m² terrain</span>
          </div>
        )}
        {opportunity.rooms !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
            <span>{opportunity.rooms} pièces</span>
          </div>
        )}
        {opportunity.bedrooms !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <span>{opportunity.bedrooms} chambres</span>
          </div>
        )}
        {opportunity.constructionYear !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Construit en {opportunity.constructionYear}</span>
          </div>
        )}
        {opportunity.energyClass !== 'UNKNOWN' && (
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">DPE {opportunity.energyClass}</Badge>
          </div>
        )}
      </div>

      {/* Floor info */}
      {opportunity.floor !== undefined && (
        <div className="text-sm">
          <span className="text-muted-foreground">Étage: </span>
          <span>
            {opportunity.floor}
            {opportunity.totalFloors !== undefined &&
              `/${opportunity.totalFloors}`}
          </span>
        </div>
      )}

      {/* Status badges */}
      <div className="flex flex-wrap gap-2">
        {opportunity.isSoldRented && (
          <Badge variant="destructive">Vendu/Loué</Badge>
        )}
        <Badge variant="outline">
          {opportunity.sellerType === 'professional'
            ? 'Professionnel'
            : 'Particulier'}
        </Badge>
      </div>

      {/* Options/Features */}
      {opportunity.options && opportunity.options.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">Équipements</div>
          <div className="flex flex-wrap gap-2">
            {opportunity.options.map((option) => (
              <Badge key={option} variant="secondary">
                {option}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {opportunity.description && (
        <div className="text-sm">
          <div className="font-medium mb-1">Description</div>
          <p className="text-muted-foreground whitespace-pre-line line-clamp-6">
            {opportunity.description}
          </p>
        </div>
      )}

      {/* Last change date */}
      {opportunity.lastChangeDate && (
        <div className="text-sm text-muted-foreground">
          Dernière modification:{' '}
          {format(new Date(opportunity.lastChangeDate), 'PPP', { locale: fr })}
        </div>
      )}

      {/* Seller Contact */}
      {opportunity.sellerContact && (
        <Card className="p-4">
          <div className="font-medium mb-3 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Contact Vendeur
          </div>
          <div className="space-y-2 text-sm">
            {opportunity.sellerContact.name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{opportunity.sellerContact.name}</span>
              </div>
            )}
            {opportunity.sellerContact.address && (
              <div className="text-muted-foreground ml-6">
                {opportunity.sellerContact.address}
              </div>
            )}
            {opportunity.sellerContact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${opportunity.sellerContact.phone}`}
                  className="text-primary hover:underline"
                >
                  {opportunity.sellerContact.phone}
                </a>
              </div>
            )}
            {opportunity.sellerContact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${opportunity.sellerContact.email}`}
                  className="text-primary hover:underline"
                >
                  {opportunity.sellerContact.email}
                </a>
              </div>
            )}
            {opportunity.sellerContact.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={opportunity.sellerContact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {opportunity.sellerContact.website}
                </a>
              </div>
            )}
            {opportunity.sellerContact.siret && (
              <div className="text-muted-foreground">
                SIRET: {opportunity.sellerContact.siret}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
