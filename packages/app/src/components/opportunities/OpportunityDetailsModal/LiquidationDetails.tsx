import { Briefcase, Building2, FileText, Mail, Phone, User } from 'lucide-react'
import type { Liquidation } from '@linkinvests/shared'
import { Card } from '@/components/ui/card'

interface LiquidationDetailsProps {
  opportunity: Liquidation
}

export function LiquidationDetails({
  opportunity,
}: LiquidationDetailsProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Company Info */}
      <Card className="p-4">
        <div className="font-medium mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Entreprise en liquidation
        </div>
        <div className="space-y-2 text-sm">
          <div className="text-lg font-medium">{opportunity.label}</div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>SIRET: {opportunity.siret}</span>
          </div>
        </div>
      </Card>

      {/* Company Contact */}
      {opportunity.companyContact && (
        <Card className="p-4">
          <div className="font-medium mb-3 flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Contacts
          </div>
          <div className="space-y-3 text-sm">
            {opportunity.companyContact.name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{opportunity.companyContact.name}</span>
              </div>
            )}

            {opportunity.companyContact.legalRepresentative && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-muted-foreground">
                    Représentant légal
                  </div>
                  <div>{opportunity.companyContact.legalRepresentative}</div>
                </div>
              </div>
            )}

            {opportunity.companyContact.administrateur && (
              <div className="flex items-start gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-muted-foreground">
                    Administrateur judiciaire
                  </div>
                  <div>{opportunity.companyContact.administrateur}</div>
                </div>
              </div>
            )}

            {opportunity.companyContact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${opportunity.companyContact.phone}`}
                  className="text-primary hover:underline"
                >
                  {opportunity.companyContact.phone}
                </a>
              </div>
            )}

            {opportunity.companyContact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${opportunity.companyContact.email}`}
                  className="text-primary hover:underline"
                >
                  {opportunity.companyContact.email}
                </a>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Information Notice */}
      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
        <p>
          Les informations sur cette liquidation proviennent du BODACC (Bulletin
          Officiel des Annonces Civiles et Commerciales). L'entreprise peut
          disposer de biens immobiliers à vendre dans le cadre de la procédure
          de liquidation.
        </p>
      </div>
    </div>
  )
}
