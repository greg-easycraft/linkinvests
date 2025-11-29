"use client";

import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { MapPin, Star, Award, ExternalLink } from "lucide-react";
import type { AddressSearchResult } from "@linkinvests/shared";

interface SearchResultsProps {
  results: AddressSearchResult[];
  onViewDetails?: (result: AddressSearchResult) => void;
}

export function SearchResults({ results, onViewDetails }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="">
              <MapPin className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Aucune adresse trouvée</p>
              <p className="text-sm">
                Essayez d&apos;ajuster vos critères de recherche ou de supprimer certains filtres optionnels pour obtenir plus de résultats.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto border-none">
      <CardTitle className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5" />
        Résultats de Recherche ({results.length} correspondance{results.length === 1 ? '' : 's'} trouvée{results.length === 1 ? '' : 's'})
      </CardTitle>
      <div className="space-y-4">
        {results.map((result) => (
          <AddressResultCard
            key={result.id}
            result={result}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
}

interface AddressResultCardProps {
  result: AddressSearchResult;
  onViewDetails?: (result: AddressSearchResult) => void;
}

function AddressResultCard({ result, onViewDetails }: AddressResultCardProps) {
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (score >= 40) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return "Excellente Correspondance";
    if (score >= 60) return "Bonne Correspondance";
    if (score >= 40) return "Correspondance Correcte";
    return "Correspondance Possible";
  };

  const getDpeColor = (energyClass?: string) => {
    const energyClassColors: Record<string, string> = {
      'A': 'bg-green-600 text-white',
      'B': 'bg-green-500 text-white',
      'C': 'bg-yellow-500 text-white',
      'D': 'bg-yellow-600 text-white',
      'E': 'bg-orange-500 text-white',
      'F': 'bg-red-500 text-white',
      'G': 'bg-red-600 text-white',
    };
    return energyClass ? energyClassColors[energyClass] || 'bg-gray-500 text-white' : 'bg-gray-500 text-white';
  };

  return (
    <Card className="bg-[var(--secundary)] shadow-sm hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          {/* Address and Location */}
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="h-4 w-4  mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-lg text-gray-900">{result.address}</p>
                <p className="text-sm ">
                  {result.zipCode} • Department {result.department}
                </p>
              </div>
            </div>
          </div>

          {/* Match Score */}
          <div className="flex-shrink-0 ml-4">
            <Badge
              className={`px-3 py-1 text-sm font-medium border ${getMatchScoreColor(result.matchScore)}`}
              variant="outline"
            >
              <Star className="h-3 w-3 mr-1" />
              {result.matchScore}% • {getMatchScoreLabel(result.matchScore)}
            </Badge>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex flex-wrap items-center gap-4 mb-3">
          {/* DPE Class */}
          <div className="flex items-center gap-2">
            <span className="text-sm ">DPE:</span>
            <Badge className={`px-2 py-1 text-xs font-bold ${getDpeColor(result.energyClass)}`}>
              {result.energyClass}
            </Badge>
          </div>

          {/* Square Footage */}
          <div className="flex items-center gap-1">
            <span className="text-sm ">Superficie :</span>
            <span className="text-sm font-medium">{result.squareFootage} m²</span>
          </div>

          {/* DPE Number */}
          <div className="flex items-center gap-1">
            <span className="text-sm ">N° DPE :</span>
            <span className="text-sm font-mono text-gray-800">{result.energyDiagnosticId}</span>
          </div>
        </div>

        {/* Match Reasons */}
        {result.matchReasons && result.matchReasons.length > 0 && (
          <div className="mb-3">
            <p className="text-xs  mb-1">Facteurs de correspondance :</p>
            <div className="flex flex-wrap gap-1">
              {result.matchReasons.map((reason: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {onViewDetails && (
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(result)}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-3 w-3" />
              Voir Détails
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}