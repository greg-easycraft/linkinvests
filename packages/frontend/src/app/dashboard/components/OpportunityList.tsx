"use client";

import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { Opportunity } from "~/server/domains/opportunities/repositories/IOpportunityRepository";
import type { OpportunityListResult } from "~/server/domains/opportunities/services/OpportunityService";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StreetView } from "./StreetView";

interface OpportunityListProps {
  data: OpportunityListResult;
  selectedId?: number;
  onSelect: (opportunity: Opportunity) => void;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  succession: "Succession",
  liquidation: "Liquidation",
  energy_sieve: "Passoire énergétique",
  real_estate_listing: "Annonce immobilière",
  auction: "Vente aux enchères",
  divorce: "Divorce",
};

export function OpportunityList({
  data,
  selectedId,
  onSelect,
  onPageChange,
  isLoading = false,
}: OpportunityListProps): React.ReactElement {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-neutral-500">Chargement...</div>
      </div>
    );
  }

  if (data.opportunities.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-neutral-500">Aucune opportunité trouvée</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-neutral-500">
        Affichage de {data.opportunities.length} sur {data.total} opportunités
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">Aperçu</TableHead>
              <TableHead>Libellé</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.opportunities.map((opportunity) => (
              <TableRow
                key={opportunity.id}
                onClick={() => onSelect(opportunity)}
                className="cursor-pointer"
                data-state={selectedId === opportunity.id ? "selected" : undefined}
              >
                <TableCell>
                  <StreetView
                    address={opportunity.address}
                    latitude={opportunity.latitude}
                    longitude={opportunity.longitude}
                    className="w-40 h-24 rounded"
                  />
                </TableCell>
                <TableCell className="font-medium font-heading">{opportunity.label}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {TYPE_LABELS[opportunity.type] ?? opportunity.type}
                  </Badge>
                </TableCell>
                <TableCell>{opportunity.status}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {opportunity.address ?? "N/A"}
                </TableCell>
                <TableCell>{opportunity.department}</TableCell>
                <TableCell>
                  {format(new Date(opportunity.opportunityDate), "dd/MM/yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-500">
            Page {data.page} sur {data.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(data.page - 1)}
              disabled={data.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(data.page + 1)}
              disabled={data.page === data.totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
