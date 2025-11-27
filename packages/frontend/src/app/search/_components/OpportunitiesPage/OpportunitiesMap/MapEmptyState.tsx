import { MapPin, Filter } from "lucide-react";
import { Card } from "~/components/ui/card";

/**
 * Overlay component for the map when no opportunities match the current criteria
 * Shows helpful suggestions for refining search filters over the actual map
 */
export function MapEmptyState(): React.ReactElement {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none z-10">
      <div className="pointer-events-auto">
        <Card className="w-full max-w-md bg-white shadow-lg border-0">
          <div className="p-6 text-center space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-blue-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center border border-amber-200">
                  <Filter className="w-3 h-3 text-amber-600" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 font-heading">
                Aucune opportunité sur la carte
              </h3>
              <p className="text-sm  leading-relaxed">
                Aucune opportunité ne correspond à vos critères de recherche dans cette zone géographique.
              </p>
            </div>

            {/* Suggestions */}
            <div className="space-y-3 text-left">
              <p className="text-xs font-medium text-gray-800 uppercase tracking-wide">
                Suggestions :
              </p>
              <ul className="space-y-2 text-sm ">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span>Élargissez votre zone de recherche</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span>Modifiez vos filtres de prix ou de surface</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span>Sélectionnez d&apos;autres types d&apos;opportunités</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span>Réinitialisez les filtres pour voir toutes les opportunités</span>
                </li>
              </ul>
            </div>

            {/* Action hint */}
            <div className="pt-2">
              <div className="flex items-center justify-center gap-2 text-xs ">
                <div className="w-4 h-4 rounded border border-dashed border-gray-300 flex items-center justify-center">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
                <span>Ajustez vos filtres pour voir des résultats sur la carte</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}