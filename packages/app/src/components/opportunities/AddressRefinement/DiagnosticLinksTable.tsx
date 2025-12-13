import { Loader2, MapPin, Zap } from 'lucide-react'

import type { DiagnosticLink } from '@/api/addresses.api'
import type { EnergyClass } from '@linkinvests/shared'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EnergyClassBadge } from '@/components/ui/energy-class-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DiagnosticLinksTableProps {
  links: Array<DiagnosticLink>
  isLoading?: boolean
}

function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-600 text-white'
  if (score >= 60) return 'bg-yellow-600 text-white'
  if (score >= 40) return 'bg-orange-600 text-white'
  return 'bg-red-100 text-red-800 border-red-200'
}

export function DiagnosticLinksTable({
  links,
  isLoading = false,
}: DiagnosticLinksTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5" />
            Diagnostics énergétiques associés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Recherche en cours...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (links.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5" />
          Diagnostics énergétiques associés ({links.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Adresse</TableHead>
              <TableHead className="w-24">Code Postal</TableHead>
              <TableHead className="w-28">Date</TableHead>
              <TableHead className="w-20 text-center">DPE</TableHead>
              <TableHead className="w-28 text-right">Surface</TableHead>
              <TableHead className="w-28 text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.id}>
                <TableCell>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      {link.energyDiagnostic.address}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {link.energyDiagnostic.zipCode}
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(
                    link.energyDiagnostic.opportunityDate,
                  ).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell className="text-center">
                  <EnergyClassBadge
                    energyClass={
                      link.energyDiagnostic.energyClass as EnergyClass
                    }
                  />
                </TableCell>
                <TableCell className="text-right text-sm">
                  {link.energyDiagnostic.squareFootage} m²
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="outline"
                    className={`${getMatchScoreColor(link.matchScore)} px-2 py-0.5 text-xs font-medium`}
                  >
                    {link.matchScore}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
