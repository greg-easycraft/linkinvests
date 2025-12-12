import { OpportunityType } from '@linkinvests/shared'
import {
  ActionsCell,
  AddressCell,
  DateCell,
  EnergyCell,
  LabelCell,
  PriceCell,
  SurfaceCell,
} from './shared'
import type { Listing } from '@linkinvests/shared'

import type { Column } from './types'

export function getListingColumns(): Array<Column<Listing>> {
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
      key: 'actions',
      header: '',
      cell: (listing) => (
        <ActionsCell
          opportunityId={listing.id}
          opportunityType={OpportunityType.REAL_ESTATE_LISTING}
          url={listing.url}
        />
      ),
      className: 'text-right',
    },
  ]
}
