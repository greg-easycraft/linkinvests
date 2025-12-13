import { Building, Clock, Globe, Mail, MapPin, Phone, User } from 'lucide-react'
import type { Succession } from '@linkinvests/shared'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SuccessionDetailsProps {
  opportunity: Succession
}

export function SuccessionDetails({
  opportunity,
}: SuccessionDetailsProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Deceased Person */}
      <Card className="p-4">
        <div className="font-medium mb-3 flex items-center gap-2">
          <User className="h-4 w-4" />
          Personne décédée
        </div>
        <div className="text-lg">
          {opportunity.firstName} {opportunity.lastName}
        </div>
      </Card>

      {/* Mairie Contact */}
      <Card className="p-4">
        <div className="font-medium mb-3 flex items-center gap-2">
          <Building className="h-4 w-4" />
          Mairie de rattachement
        </div>
        <div className="space-y-3 text-sm">
          {opportunity.mairieContact.name && (
            <div className="font-medium">{opportunity.mairieContact.name}</div>
          )}

          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-muted-foreground">
              {opportunity.mairieContact.address.numero_voie && (
                <div>{opportunity.mairieContact.address.numero_voie}</div>
              )}
              {opportunity.mairieContact.address.complement1 && (
                <div>{opportunity.mairieContact.address.complement1}</div>
              )}
              {opportunity.mairieContact.address.complement2 && (
                <div>{opportunity.mairieContact.address.complement2}</div>
              )}
              {opportunity.mairieContact.address.service_distribution && (
                <div>
                  {opportunity.mairieContact.address.service_distribution}
                </div>
              )}
              <div>
                {opportunity.mairieContact.address.code_postal}{' '}
                {opportunity.mairieContact.address.nom_commune}
              </div>
            </div>
          </div>

          {opportunity.mairieContact.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a
                href={`tel:${opportunity.mairieContact.phone}`}
                className="text-primary hover:underline"
              >
                {opportunity.mairieContact.phone}
              </a>
            </div>
          )}

          {opportunity.mairieContact.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${opportunity.mairieContact.email}`}
                className="text-primary hover:underline"
              >
                {opportunity.mairieContact.email}
              </a>
            </div>
          )}

          {opportunity.mairieContact.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a
                href={opportunity.mairieContact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Site web de la mairie
              </a>
            </div>
          )}

          {opportunity.mairieContact.openingHours && (
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-muted-foreground whitespace-pre-line">
                {opportunity.mairieContact.openingHours}
              </div>
            </div>
          )}

          {/* Contact Mairie Button */}
          <div className="pt-2">
            <Button variant="outline" className="w-full" asChild>
              <a
                href={`mailto:${opportunity.mairieContact.email ?? ''}?subject=Demande d'information - Succession ${opportunity.lastName}`}
              >
                <Mail className="h-4 w-4 mr-2" />
                Contacter la mairie
              </a>
            </Button>
          </div>
        </div>
      </Card>

      {/* Information Notice */}
      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
        <p>
          Les informations sur cette succession sont publiques et proviennent
          des avis de décès publiés par les mairies. Pour plus d'informations,
          veuillez contacter la mairie de rattachement.
        </p>
      </div>
    </div>
  )
}
