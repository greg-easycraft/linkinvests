import { useNavigate } from '@tanstack/react-router'
import { Bookmark, ChevronRight, Search } from 'lucide-react'
import type { SavedSearch } from '@linkinvests/shared'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getOpportunityTypeFromUrl } from '@/utils/parse-filter-recap'

interface SavedSearchesListProps {
  savedSearches: Array<SavedSearch>
}

const MAX_DISPLAYED = 5

export function SavedSearchesList({ savedSearches }: SavedSearchesListProps) {
  const navigate = useNavigate()

  const handleSearchClick = (search: SavedSearch) => {
    navigate({ to: search.url })
  }

  const displayedSearches = savedSearches.slice(0, MAX_DISPLAYED)
  const remainingCount = savedSearches.length - MAX_DISPLAYED

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-blue-500" />
          Recherches sauvegardees
        </CardTitle>
        <CardDescription>Acces rapide a vos recherches</CardDescription>
      </CardHeader>
      <CardContent>
        {savedSearches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucune recherche sauvegardee
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Sauvegardez vos recherches depuis la page de recherche
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedSearches.map((search) => {
              const typeLabel = getOpportunityTypeFromUrl(search.url)
              return (
                <button
                  key={search.id}
                  type="button"
                  onClick={() => handleSearchClick(search)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {typeLabel}
                    </Badge>
                    <span className="font-medium truncate">{search.name}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </button>
              )
            })}
          </div>
        )}
      </CardContent>
      {remainingCount > 0 && (
        <CardFooter>
          <Button
            variant="outline"
            asChild
            className="w-full"
            onClick={() => navigate({ to: '/search' })}
          >
            <span>+{remainingCount} autres recherches</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
