'use client';

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Zap, MapPin, Loader2 } from "lucide-react";
import type { DiagnosticLink } from "~/app/_actions/address-refinement/queries";
import { EnergyClassBadge } from "~/components/ui/energy-class-badge";
import { EnergyClass } from "@linkinvests/shared";

interface DiagnosticLinksTableProps {
  links: DiagnosticLink[];
  isLoading?: boolean;
}

function getMatchScoreColor(score: number): string {
  if (score >= 80) return "bg-green-600 text-white";
  if (score >= 60) return "bg-yellow-600 text-white";
  if (score >= 40) return "bg-orange-600 text-white";
  return "bg-red-100 text-red-800 border-red-200";
}

export function DiagnosticLinksTable({ links, isLoading = false }: DiagnosticLinksTableProps) {
  if (isLoading) {
    return (
      <Card className="bg-[var(--secundary)]">
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
    );
  }

  if (links.length === 0) {
    return null;
  }

  return (
    <Card className="bg-[var(--secundary)] text-[var(--primary)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5" />
          Diagnostics énergétiques associés ({links.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table className="border-[var(--primary)]">
          <TableHeader>
            <TableRow className="hover:!bg-transparent border-[var(--primary)]">
              <TableHead className="!text-[var(--primary)]">Adresse</TableHead>
              <TableHead className="w-24 !text-[var(--primary)]">Code Postal</TableHead>
              <TableHead className="w-36 !text-[var(--primary)]">N° DPE</TableHead>
              <TableHead className="w-28 !text-[var(--primary)]">Date</TableHead>
              <TableHead className="w-20 text-center !text-[var(--primary)]">DPE</TableHead>
              <TableHead className="w-28 text-right !text-[var(--primary)]">Surface</TableHead>
              <TableHead className="w-28 text-right !text-[var(--primary)]">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.id} className="hover:!bg-transparent border-[var(--primary)]">
                <TableCell>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{link.energyDiagnostic.address}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{link.energyDiagnostic.zipCode}</TableCell>
                <TableCell className="text-sm font-mono">{link.energyDiagnostic.externalId}</TableCell>
                <TableCell className="text-sm">{new Date(link.energyDiagnostic.opportunityDate).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell className="text-center">
                  <EnergyClassBadge energyClass={link.energyDiagnostic.energyClass as EnergyClass}/>
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
  );
}
