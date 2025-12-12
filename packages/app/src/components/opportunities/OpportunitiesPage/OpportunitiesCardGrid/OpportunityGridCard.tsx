import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Building2, MapPin, Ruler } from 'lucide-react'
import type { EnergyClass, Opportunity, OpportunityType } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EnergyClassBadge } from '@/components/ui/energy-class-badge'
import { FavoriteButton } from '@/components/ui/favorite-button'
import { ImageCarouselMini } from '@/components/ui/image-carousel-mini'
import { TYPE_COLORS, TYPE_LABELS } from '@/constants'
import { formatPrice } from '@/lib/format'

// Type guard to check if opportunity has pictures
const hasPictureFields = (
  opportunity: Opportunity,
): opportunity is Extract<
  Opportunity,
  { mainPicture?: string; pictures?: Array<string> }
> => {
  return 'mainPicture' in opportunity
}

// Check if opportunity has multiple pictures for carousel
const hasMultiplePictures = (opportunity: Opportunity): boolean => {
  if (!hasPictureFields(opportunity)) return false
  const picturesCount = opportunity.pictures?.length ?? 0
  const mainPictureCount = opportunity.mainPicture ? 1 : 0
  // Count unique pictures (main picture may be in pictures array)
  const mainInPictures = opportunity.pictures?.includes(
    opportunity.mainPicture ?? '',
  )
  const totalUnique = mainInPictures
    ? picturesCount
    : picturesCount + mainPictureCount
  return totalUnique > 1
}

// Type guard to check if opportunity has property details
const hasPropertyDetails = (
  opportunity: Opportunity,
): opportunity is Extract<
  Opportunity,
  { energyClass?: string; squareFootage?: number }
> => {
  return 'energyClass' in opportunity || 'squareFootage' in opportunity
}

// Get price value based on opportunity type
const getPriceValue = (opportunity: Opportunity): number | undefined => {
  if ('currentPrice' in opportunity && opportunity.currentPrice) {
    return opportunity.currentPrice
  }
  if ('reservePrice' in opportunity && opportunity.reservePrice) {
    return opportunity.reservePrice
  }
  if ('price' in opportunity && opportunity.price) {
    return opportunity.price
  }
  return undefined
}

interface OpportunityGridCardProps {
  opportunity: Opportunity
  onSelect: (opportunity: Opportunity) => void
  type?: OpportunityType
}

export function OpportunityGridCard({
  opportunity,
  onSelect,
  type: propType,
}: OpportunityGridCardProps): React.ReactElement {
  // Get type from opportunity (AllOpportunity) or fall back to prop
  const type =
    'type' in opportunity && opportunity.type
      ? (opportunity.type as OpportunityType)
      : propType!

  const price = getPriceValue(opportunity)
  const hasImage = hasPictureFields(opportunity) && opportunity.mainPicture
  const showCarousel = hasMultiplePictures(opportunity)

  // Get pictures for carousel
  const mainPicture = hasPictureFields(opportunity)
    ? opportunity.mainPicture
    : undefined
  const pictures = hasPictureFields(opportunity)
    ? opportunity.pictures
    : undefined

  return (
    <Card
      onClick={() => onSelect(opportunity)}
      className="cursor-pointer overflow-hidden transition-all border-none shadow-sm hover:shadow-xl duration-300 group"
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] bg-muted">
        {showCarousel ? (
          <ImageCarouselMini
            mainPicture={mainPicture}
            pictures={pictures}
            alt={opportunity.label}
          />
        ) : hasImage ? (
          <img
            src={opportunity.mainPicture}
            alt={opportunity.label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        {/* Type Badge - Top Left */}
        <Badge
          className="absolute top-2 left-2"
          style={{
            backgroundColor: TYPE_COLORS[type],
            color: 'white',
            border: 'none',
          }}
        >
          {TYPE_LABELS[type]}
        </Badge>

        {/* Favorite Button - Top Right */}
        <div
          className="absolute top-2 right-2"
          onClick={(e) => e.stopPropagation()}
        >
          <FavoriteButton
            opportunityId={opportunity.id}
            opportunityType={type}
          />
        </div>

        {/* Price Badge - Bottom Right */}
        {price && (
          <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md">
            <span className="font-bold text-green-600">
              {formatPrice(price)}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-base line-clamp-2 min-h-[2.5rem]">
          {opportunity.label}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {opportunity.zipCode} {opportunity.department}
          </span>
        </div>

        {/* Details Row */}
        <div className="flex items-center gap-3 text-sm">
          {/* Square Footage */}
          {hasPropertyDetails(opportunity) && opportunity.squareFootage && (
            <div className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{opportunity.squareFootage} m²</span>
            </div>
          )}

          {/* Energy Class */}
          {'energyClass' in opportunity && Boolean(opportunity.energyClass) && (
            <EnergyClassBadge
              energyClass={opportunity.energyClass as EnergyClass}
              size="sm"
            />
          )}
        </div>

        {/* Date */}
        <div className="text-xs text-muted-foreground">
          {format(new Date(opportunity.opportunityDate), 'dd MMM yyyy', {
            locale: fr,
          })}
        </div>
      </div>
    </Card>
  )
}
