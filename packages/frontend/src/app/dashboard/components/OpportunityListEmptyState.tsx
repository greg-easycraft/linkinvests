import { Search, Filter } from "lucide-react";
import { Card } from "~/components/ui/card";

// Empty state component for when no opportunities match criteria
export function OpportunityListEmptyState(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 px-4 py-12">
      <Card className="w-full max-w-md bg-[var(--secundary)] border-0 shadow-sm">
        <div className="p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-[var(--primary)] bg-opacity-10 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-[var(--secundary)] opacity-80" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--secundary)] rounded-full flex items-center justify-center border border-[var(--primary)] border-opacity-20">
                <Filter className="w-3 h-3 text-[var(--primary)] opacity-60" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--primary)] font-heading">
              Aucune opportunité trouvée
            </h3>
            <p className="text-sm text-[var(--primary)] opacity-70 leading-relaxed">
              Aucune opportunité ne correspond à vos critères de recherche actuels.
            </p>
          </div>

          {/* Suggestions */}
          <div className="space-y-3 text-left">
            <p className="text-xs font-medium text-[var(--primary)] opacity-80 uppercase tracking-wide">
              Suggestions :
            </p>
            <ul className="space-y-2 text-sm text-[var(--primary)] opacity-70">
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-[var(--primary)] opacity-80 mt-2 flex-shrink-0"></div>
                <span>Modifiez vos filtres de recherche</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-[var(--primary)] opacity-80 mt-2 flex-shrink-0"></div>
                <span>Essayez des mots-clés différents</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-[var(--primary)] opacity-80 mt-2 flex-shrink-0"></div>
                <span>Élargissez votre zone géographique</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-[var(--primary)] opacity-80 mt-2 flex-shrink-0"></div>
                <span>Vérifiez les types d'opportunités sélectionnés</span>
              </li>
            </ul>
          </div>

          {/* Action hint */}
          <div className="pt-2">
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--primary)] opacity-60">
              <div className="w-4 h-4 rounded border border-dashed border-[var(--primary)] border-opacity-30 flex items-center justify-center">
                <div className="w-1 h-1 bg-[var(--primary)] opacity-60 rounded-full"></div>
              </div>
              <span>Utilisez les filtres ci-dessus pour affiner votre recherche</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}