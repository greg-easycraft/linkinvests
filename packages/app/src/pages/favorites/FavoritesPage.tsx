import { useCallback, useState } from 'react'
import { Heart } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import {
  FavoritesDataTable,
  FavoritesSectionAccordion,
  getColumnsForType,
} from './components'
import type { Opportunity } from '@/types'
import { OpportunityType } from '@/types'
import { useFavorites } from '@/hooks'
import { OpportunityDetailsModal } from '@/components/opportunities/OpportunityDetailsModal'
import { Accordion } from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

const SECTIONS = [
  {
    key: 'auctions' as const,
    label: 'Enchères',
    type: OpportunityType.AUCTION,
  },
  {
    key: 'listings' as const,
    label: 'Annonces Immobilières',
    type: OpportunityType.REAL_ESTATE_LISTING,
  },
  {
    key: 'successions' as const,
    label: 'Successions',
    type: OpportunityType.SUCCESSION,
  },
  {
    key: 'liquidations' as const,
    label: 'Liquidations',
    type: OpportunityType.LIQUIDATION,
  },
  {
    key: 'energySieves' as const,
    label: 'Passoires Énergétiques',
    type: OpportunityType.ENERGY_SIEVE,
  },
]

function FavoritesPageSkeleton() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg">
            <Skeleton className="h-14 w-full rounded-b-none" />
            <div className="p-4">
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyFavoritesState() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Aucun favori</h2>
        <p className="text-muted-foreground mb-6">
          Vous n'avez pas encore ajouté d'opportunités à vos favoris.
        </p>
        <Button asChild>
          <Link to="/search">Découvrir les opportunités</Link>
        </Button>
      </div>
    </div>
  )
}

export function FavoritesPage(): React.ReactElement {
  const { data, isLoading, isError } = useFavorites()
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null)
  const [selectedType, setSelectedType] = useState<OpportunityType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSelectOpportunity = useCallback(
    (opportunity: Opportunity, type: OpportunityType) => {
      setSelectedOpportunity(opportunity)
      setSelectedType(type)
      setIsModalOpen(true)
    },
    [],
  )

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedOpportunity(null)
    setSelectedType(null)
  }, [])

  if (isLoading) {
    return <FavoritesPageSkeleton />
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-16">
          <p className="text-destructive">
            Une erreur est survenue lors du chargement de vos favoris.
          </p>
        </div>
      </div>
    )
  }

  const totalFavorites = data
    ? Object.values(data).reduce((sum, arr) => sum + arr.length, 0)
    : 0

  if (!data || totalFavorites === 0) {
    return <EmptyFavoritesState />
  }

  // All sections with data, expanded by default
  const defaultOpenSections = SECTIONS.filter(
    ({ key }) => data[key].length > 0,
  ).map(({ key }) => key)

  return (
    <div className="container mx-auto py-6 px-4">
      <header className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          Mes Favoris
        </h1>
        <p className="text-muted-foreground mt-1">
          {totalFavorites} opportunité{totalFavorites > 1 ? 's' : ''}{' '}
          enregistrée{totalFavorites > 1 ? 's' : ''}
        </p>
      </header>

      <Accordion
        type="multiple"
        defaultValue={defaultOpenSections}
        className="space-y-4"
      >
        {SECTIONS.map(({ key, label, type }) => {
          const items = data[key]
          if (items.length === 0) return null

          const columns = getColumnsForType(type)

          return (
            <FavoritesSectionAccordion
              key={key}
              sectionKey={key}
              label={label}
              count={items.length}
              type={type}
            >
              <FavoritesDataTable
                data={items}
                columns={columns}
                onRowClick={(item) =>
                  handleSelectOpportunity(item as Opportunity, type)
                }
              />
            </FavoritesSectionAccordion>
          )
        })}
      </Accordion>

      {selectedOpportunity && selectedType && (
        <OpportunityDetailsModal
          opportunity={selectedOpportunity}
          type={selectedType}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
