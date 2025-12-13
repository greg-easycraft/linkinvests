import { OpportunityType, type Auction } from '@linkinvests/shared'
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

// Extended type for auction with favorite info
type AuctionWithFavorite = Auction & {
  favoriteId: string
  status: string
}

export interface AuctionColumnsOptions {
  onViewDetails?: (item: AuctionWithFavorite) => void
}

export function getAuctionColumns(
  options?: AuctionColumnsOptions,
): Array<Column<AuctionWithFavorite>> {
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
      key: 'status',
      header: 'Statut',
      cell: (auction) => <StatusCell status={auction.status} />,
    },
    {
      key: 'actions',
      header: '',
      cell: (auction) => (
        <QuickActionsDropdown
          opportunityType={OpportunityType.AUCTION}
          onViewDetails={() => options?.onViewDetails?.(auction)}
          externalUrl={auction.url}
        />
      ),
      className: 'text-right',
    },
  ]
}
