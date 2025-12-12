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
import type { Auction } from '@linkinvests/shared'

import type { Column } from './types'

export function getAuctionColumns(): Array<Column<Auction>> {
  return [
    {
      key: 'label',
      header: 'Bien',
      cell: (auction) => <LabelCell label={auction.label} />,
    },
    {
      key: 'address',
      header: 'Adresse',
      cell: (auction) => <AddressCell address={auction.address} />,
    },
    {
      key: 'auctionDate',
      header: 'Date enchère',
      cell: (auction) => <DateCell date={auction.opportunityDate} />,
    },
    {
      key: 'reservePrice',
      header: 'Mise à prix',
      cell: (auction) => (
        <PriceCell price={auction.reservePrice} variant="orange" />
      ),
    },
    {
      key: 'currentPrice',
      header: 'Prix actuel',
      cell: (auction) => (
        <PriceCell price={auction.currentPrice} variant="green" />
      ),
    },
    {
      key: 'squareFootage',
      header: 'Surface',
      cell: (auction) => <SurfaceCell squareFootage={auction.squareFootage} />,
    },
    {
      key: 'energyClass',
      header: 'DPE',
      cell: (auction) => <EnergyCell energyClass={auction.energyClass} />,
    },
    {
      key: 'actions',
      header: '',
      cell: (auction) => (
        <ActionsCell
          opportunityId={auction.id}
          opportunityType={OpportunityType.AUCTION}
          url={auction.url}
        />
      ),
      className: 'text-right',
    },
  ]
}
