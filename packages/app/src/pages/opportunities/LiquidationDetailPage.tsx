import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { getLiquidationById } from '@/data'
import { LiquidationDetails } from '@/components/opportunities/OpportunityDetailsModal/LiquidationDetails'

export function LiquidationDetailPage(): React.ReactElement {
  const { liquidationId } = useParams({ strict: false })
  const liquidation = liquidationId
    ? getLiquidationById(liquidationId)
    : undefined

  if (!liquidation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Liquidation non trouvée</h1>
          <p className="text-muted-foreground mb-6">
            La liquidation que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Button asChild>
            <Link to="/search/liquidations">Retour aux liquidations</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/search/liquidations">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux liquidations
        </Link>
      </Button>

      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge variant="outline">Liquidation judiciaire</Badge>
        </div>

        <h1 className="text-2xl font-bold mb-4">{liquidation.label}</h1>

        {/* Address */}
        <div className="flex items-start gap-2 text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mt-1 shrink-0" />
          <span>
            {liquidation.address}, {liquidation.zipCode} {liquidation.department}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-muted-foreground mb-6">
          <Calendar className="h-4 w-4" />
          <span>
            Date de publication :{' '}
            {format(new Date(liquidation.opportunityDate), 'PPP', {
              locale: fr,
            })}
          </span>
        </div>

        <Separator className="my-6" />

        {/* Liquidation Details */}
        <LiquidationDetails opportunity={liquidation} />

        <Separator className="my-6" />

        {/* Timestamps */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Créé le{' '}
            {format(new Date(liquidation.createdAt), 'Pp', { locale: fr })}
          </div>
          <div>
            Mis à jour le{' '}
            {format(new Date(liquidation.updatedAt), 'Pp', { locale: fr })}
          </div>
        </div>
      </Card>
    </div>
  )
}
