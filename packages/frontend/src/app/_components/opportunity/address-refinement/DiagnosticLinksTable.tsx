'use client';

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Zap, MapPin, Loader2 } from "lucide-react";
import type { DiagnosticLink } from "~/app/_actions/address-refinement/queries";

interface DiagnosticLinksTableProps {
  links: DiagnosticLink[];
  isLoading?: boolean;
}

function getMatchScoreColor(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
  if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (score >= 40) return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-red-100 text-red-800 border-red-200";
}

function getDpeColor(energyClass: string): string {
  const energyClassColors: Record<string, string> = {
    'A': 'bg-green-600 text-white',
    'B': 'bg-green-500 text-white',
    'C': 'bg-yellow-500 text-white',
    'D': 'bg-yellow-600 text-white',
    'E': 'bg-orange-500 text-white',
    'F': 'bg-red-500 text-white',
    'G': 'bg-red-600 text-white',
  };
  return energyClassColors[energyClass] || 'bg-gray-500 text-white';
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
            <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
            <span className="ml-2 text-neutral-500">Recherche en cours...</span>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Adresse</TableHead>
              <TableHead className="w-24">Code Postal</TableHead>
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
                    <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{link.energyDiagnostic.address}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{link.energyDiagnostic.zipCode}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`${getDpeColor(link.energyDiagnostic.energyClass)} px-2 py-0.5 text-xs font-bold`}>
                    {link.energyDiagnostic.energyClass}
                  </Badge>
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
