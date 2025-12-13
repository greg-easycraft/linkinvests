import { OpportunityType, type Listing } from '@linkinvests/shared'
import {
  AddressCell,
  DateCell,
  EnergyCell,
  LabelCell,
  PriceCell,
  StatusCell,
  SurfaceCell,
} from './shared'
import { QuickActionsDropdown } from './QuickActionsDropdown'

import type { Column } from './types'

// Extended type for listing with favorite info
type ListingWithFavorite = Listing & {
  favoriteId: string
  status: string
}

export interface ListingColumnsOptions {
  onViewDetails?: (item: ListingWithFavorite) => void
}

export function getListingColumns(
  options?: ListingColumnsOptions,
): Array<Column<ListingWithFavorite>> {
  return [
    {
      key: 'label',
      header: 'Bien',
      cell: (listing) => <LabelCell label={listing.label} />,
    },
    {
      key: 'address',
      header: 'Adresse',
      cell: (listing) => <AddressCell address={listing.address} />,
    },
    {
      key: 'publicationDate',
      header: 'Publication',
      cell: (listing) => <DateCell date={listing.opportunityDate} />,
    },
    {
      key: 'lastChangeDate',
      header: 'Modifié le',
      cell: (listing) => <DateCell date={listing.lastChangeDate} />,
    },
    {
      key: 'price',
      header: 'Prix',
      cell: (listing) => <PriceCell price={listing.price} variant="green" />,
    },
    {
      key: 'squareFootage',
      header: 'Surface',
      cell: (listing) => <SurfaceCell squareFootage={listing.squareFootage} />,
    },
    {
      key: 'energyClass',
      header: 'DPE',
      cell: (listing) => <EnergyCell energyClass={listing.energyClass} />,
    },
    {
      key: 'status',
      header: 'Statut',
      cell: (listing) => <StatusCell status={listing.status} />,
    },
    {
      key: 'actions',
      header: '',
      cell: (listing) => (
        <QuickActionsDropdown
          opportunityType={OpportunityType.REAL_ESTATE_LISTING}
          onViewDetails={() => options?.onViewDetails?.(listing)}
          externalUrl={listing.url}
        />
      ),
      className: 'text-right',
    },
  ]
}
