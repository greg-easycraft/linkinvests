import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Building2,
  Calendar,
  Euro,
  ExternalLink,
  Gavel,
  MapPin,
  RefreshCcw,
  Zap,
} from 'lucide-react'
import type { EnergyClass, Opportunity, OpportunityType } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EnergyClassBadge } from '@/components/ui/energy-class-badge'
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

// Type guard to check if opportunity has property details
const hasPropertyDetails = (
  opportunity: Opportunity,
): opportunity is Extract<
  Opportunity,
  { energyClass?: string; squareFootage?: number }
> => {
  return 'energyClass' in opportunity || 'squareFootage' in opportunity
}

// Type guard to check if opportunity has price fields
const hasPriceFields = (
  opportunity: Opportunity,
): opportunity is Extract<
  Opportunity,
  { price?: number; currentPrice?: number; reservePrice?: number }
> => {
  return (
    'price' in opportunity ||
    'currentPrice' in opportunity ||
    'reservePrice' in opportunity
  )
}

// Type guard to check if opportunity is a listing with lastChangeDate
const hasLastChangeDate = (
  opportunity: Opportunity,
): opportunity is Extract<Opportunity, { lastChangeDate?: string }> => {
  return 'lastChangeDate' in opportunity
}

// Type guard to check if opportunity is an auction
const isAuction = (
  opportunity: Opportunity,
): opportunity is Extract<
  Opportunity,
  { currentPrice?: number; reservePrice?: number }
> => {
  return 'currentPrice' in opportunity || 'reservePrice' in opportunity
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

// Get external URL from opportunity
const getExternalUrl = (opportunity: Opportunity): string | undefined => {
  if ('url' in opportunity) {
    return opportunity.url
  }
  return undefined
}

interface OpportunityCardProps {
  opportunity: Opportunity
  onSelect: (opportunity: Opportunity) => void
  selectedId?: string
  type: OpportunityType
}

export function OpportunityCard({
  opportunity,
  onSelect,
  type,
}: OpportunityCardProps): React.ReactElement {
  const externalUrl = getExternalUrl(opportunity)

  return (
    <Card
      onClick={() => onSelect(opportunity)}
      className="cursor-pointer transition-all border-none shadow-sm hover:shadow-xl hover:border-blue-100 duration-300 transform"
    >
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {hasPictureFields(opportunity) && opportunity.mainPicture ? (
            <img
              src={opportunity.mainPicture}
              alt="Property main picture"
              className="w-24 h-[72px] rounded-sm object-cover"
            />
          ) : (
            <div className="w-24 h-[72px] rounded-sm bg-muted flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-lg font-semibold truncate">
                {opportunity.label}
              </h3>
              <div className="flex gap-2 flex-shrink-0">
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: TYPE_COLORS[type],
                    color: 'white',
                    border: 'none',
                  }}
                >
                  {TYPE_LABELS[type]}
                </Badge>
                {externalUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(externalUrl, '_blank', 'noopener,noreferrer')
                    }}
                    title="Voir l'annonce originale"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-70" />
                <div className="min-w-0">
                  <div className="text-xs opacity-70">Adresse</div>
                  <div className="truncate">
                    {opportunity.address ?? 'Non disponible'}
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-70" />
                <div>
                  <div className="text-xs opacity-70">
                    {type === 'real_estate_listing' ? 'Publication' : 'Date'}
                  </div>
                  <div>
                    {format(
                      new Date(opportunity.opportunityDate),
                      'dd MMMM yyyy',
                      {
                        locale: fr,
                      },
                    )}
                  </div>
                </div>
              </div>

              {/* Last Change Date (listings only) */}
              {hasLastChangeDate(opportunity) && opportunity.lastChangeDate && (
                <div className="flex items-start gap-2">
                  <RefreshCcw className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-70" />
                  <div>
                    <div className="text-xs opacity-70">Modification</div>
                    <div>
                      {format(
                        new Date(opportunity.lastChangeDate),
                        'dd MMMM yyyy',
                        { locale: fr },
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Reserve Price - For auctions */}
              {type === 'auction' && isAuction(opportunity) && (
                <div className="flex items-start gap-2">
                  <Gavel className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-70" />
                  <div>
                    <div className="text-xs opacity-70">Prix de réserve</div>
                    <div className="font-semibold text-orange-600">
                      {opportunity.reservePrice
                        ? formatPrice(opportunity.reservePrice)
                        : 'NC'}
                    </div>
                  </div>
                </div>
              )}

              {/* Price - For non-auctions */}
              {type !== 'auction' &&
                hasPriceFields(opportunity) &&
                getPriceValue(opportunity) && (
                  <div className="flex items-start gap-2">
                    <Euro className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-70" />
                    <div>
                      <div className="text-xs opacity-70">Prix</div>
                      <div className="font-semibold text-green-600">
                        {formatPrice(getPriceValue(opportunity)!)}
                      </div>
                    </div>
                  </div>
                )}

              {/* Square Meters */}
              {hasPropertyDetails(opportunity) && opportunity.squareFootage && (
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-70" />
                  <div>
                    <div className="text-xs opacity-70">Surface</div>
                    <div>{opportunity.squareFootage} m²</div>
                  </div>
                </div>
              )}

              {/* Energy Class */}
              {hasPropertyDetails(opportunity) && (
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-70" />
                  <div>
                    <div className="text-xs opacity-70">Classe énergétique</div>
                    <EnergyClassBadge
                      energyClass={opportunity.energyClass as EnergyClass}
                    />
                  </div>
                </div>
              )}

              {/* Current Price - For auctions */}
              {type === 'auction' &&
                isAuction(opportunity) &&
                opportunity.currentPrice && (
                  <div className="flex items-start gap-2">
                    <Euro className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-70" />
                    <div>
                      <div className="text-xs opacity-70">Prix actuel</div>
                      <div className="font-semibold text-green-600">
                        {formatPrice(opportunity.currentPrice)}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
