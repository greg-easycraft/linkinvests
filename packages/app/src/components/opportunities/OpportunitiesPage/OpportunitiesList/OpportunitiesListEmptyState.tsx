import { SearchX } from 'lucide-react'

export function OpportunitiesListEmptyState(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
      <p className="text-muted-foreground max-w-md">
        Aucune opportunité ne correspond à vos critères de recherche. Essayez de
        modifier vos filtres pour obtenir plus de résultats.
      </p>
    </div>
  )
}
