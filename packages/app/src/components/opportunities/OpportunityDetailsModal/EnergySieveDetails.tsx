import { Zap, FileText, AlertTriangle, Ruler } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { EnergyDiagnostic } from '@/types'

interface EnergySieveDetailsProps {
  opportunity: EnergyDiagnostic
}

const ENERGY_CLASS_COLORS: Record<string, string> = {
  E: 'bg-orange-500',
  F: 'bg-orange-600',
  G: 'bg-red-600',
}

export function EnergySieveDetails({
  opportunity,
}: EnergySieveDetailsProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Energy Class */}
      <Card className="p-4">
        <div className="font-medium mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Diagnostic de Performance Énergétique
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold ${ENERGY_CLASS_COLORS[opportunity.energyClass] ?? 'bg-gray-500'}`}
          >
            {opportunity.energyClass}
          </div>
          <div>
            <div className="text-lg font-medium">
              Classe énergétique {opportunity.energyClass}
            </div>
            <div className="text-sm text-muted-foreground">
              Passoire thermique
            </div>
          </div>
        </div>
      </Card>

      {/* Property Info */}
      <div className="grid grid-cols-2 gap-4">
        {opportunity.squareFootage !== undefined && (
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">Surface</div>
            <div className="text-lg font-semibold flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              {opportunity.squareFootage} m²
            </div>
          </Card>
        )}
        {opportunity.externalId && (
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">Numéro DPE</div>
            <div className="text-sm font-mono flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {opportunity.externalId}
            </div>
          </Card>
        )}
      </div>

      {/* Warning about energy class */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <div className="font-medium text-amber-800 dark:text-amber-200 mb-1">
            Passoire énergétique
          </div>
          <p className="text-amber-700 dark:text-amber-300">
            Ce bien est classé {opportunity.energyClass} au DPE, ce qui correspond à une passoire
            énergétique. Depuis 2023, les logements classés G ne peuvent plus être mis en location.
            Les logements classés F seront concernés à partir de 2028, et les E à partir de 2034.
          </p>
        </div>
      </div>

      {/* Investment Opportunity Notice */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="font-medium mb-2 flex items-center gap-2">
          <Badge variant="secondary">Opportunité</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Les passoires thermiques représentent une opportunité d'investissement : leur prix est
          souvent décoté de 10 à 20% par rapport au marché. Après rénovation énergétique, la
          plus-value peut être significative et le bien devient éligible à la location.
        </p>
      </Card>

      {/* Data Source */}
      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
        <p>
          Les données de ce DPE proviennent de la base de données de l'ADEME (Agence de
          l'environnement et de la maîtrise de l'énergie). Consultez le diagnostic complet sur
          l'Observatoire DPE.
        </p>
      </div>
    </div>
  )
}
