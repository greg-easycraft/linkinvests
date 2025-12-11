import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Bookmark, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { useSavedSearches } from '@/hooks'
import {
  getOpportunityTypeFromUrl,
  parseFilterRecap,
} from '@/utils/parse-filter-recap'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SavedSearchesSectionProps {
  onSaveCurrentSearch: () => void
}

export function SavedSearchesSection({
  onSaveCurrentSearch,
}: SavedSearchesSectionProps) {
  const navigate = useNavigate()
  const { savedSearches, isLoading, deleteSavedSearch, isDeleting } =
    useSavedSearches()
  const [isOpen, setIsOpen] = useState(true)

  const handleNavigate = (url: string) => {
    navigate({ to: url })
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Supprimer cette recherche sauvegardee ?')) {
      deleteSavedSearch(id)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 font-medium text-sm hover:text-primary transition-colors"
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span>Recherches sauvegardees ({savedSearches.length})</span>
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSaveCurrentSearch}
          title="Sauvegarder la recherche actuelle"
          className="h-8 w-8 p-0"
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground px-2">Chargement...</p>
          ) : savedSearches.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2">
              Aucune recherche sauvegardee
            </p>
          ) : (
            savedSearches.map((search) => {
              const recap = parseFilterRecap(search.url)
              const typeLabel = getOpportunityTypeFromUrl(search.url)
              return (
                <div
                  key={search.id}
                  className="p-2 border rounded-md hover:bg-accent cursor-pointer group transition-colors"
                  onClick={() => handleNavigate(search.url)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {typeLabel}
                      </Badge>
                      <span className="font-medium text-sm truncate">
                        {search.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => handleDelete(search.id, e)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                  {recap.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {recap.map((item, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs px-1.5 py-0"
                        >
                          {item.value}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
