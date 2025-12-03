import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Clock, Loader2, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Succession } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { useOpportunityById } from '@/hooks'
import { SuccessionDetails } from '@/components/opportunities/OpportunityDetailsModal/SuccessionDetails'
import { OpportunityType } from '@/types'

export function SuccessionDetailPage(): React.ReactElement {
  const { successionId } = useParams({ strict: false })
  const { data: succession, isLoading } = useOpportunityById<Succession>(
    OpportunityType.SUCCESSION,
    successionId,
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!succession) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Succession non trouvée</h1>
          <p className="text-muted-foreground mb-6">
            La succession que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Button asChild>
            <Link to="/search/successions">Retour aux successions</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/search/successions">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux successions
        </Link>
      </Button>

      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge variant="outline">Succession</Badge>
        </div>

        <h1 className="text-2xl font-bold mb-4">{succession.label}</h1>

        {/* Address */}
        <div className="flex items-start gap-2 text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 mt-1 shrink-0" />
          <span>
            {succession.address}, {succession.zipCode} {succession.department}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-muted-foreground mb-6">
          <Calendar className="h-4 w-4" />
          <span>
            Date de décès :{' '}
            {format(new Date(succession.opportunityDate), 'PPP', { locale: fr })}
          </span>
        </div>

        <Separator className="my-6" />

        {/* Succession Details */}
        <SuccessionDetails opportunity={succession} />

        <Separator className="my-6" />

        {/* Timestamps */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Créé le{' '}
            {format(new Date(succession.createdAt), 'Pp', { locale: fr })}
          </div>
          <div>
            Mis à jour le{' '}
            {format(new Date(succession.updatedAt), 'Pp', { locale: fr })}
          </div>
        </div>
      </Card>
    </div>
  )
}
