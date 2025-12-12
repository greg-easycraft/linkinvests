import { OpportunityType } from '@linkinvests/shared'

import { getAuctionColumns } from './AuctionColumns'
import { getEnergySieveColumns } from './EnergySieveColumns'
import { getLiquidationColumns } from './LiquidationColumns'
import { getListingColumns } from './ListingColumns'
import { getSuccessionColumns } from './SuccessionColumns'
import type { Column } from './types'
import type {
  Auction,
  EnergyDiagnostic,
  Liquidation,
  Listing,
  Succession,
} from '@linkinvests/shared'

export type { Column } from './types'

export type OpportunityItem =
  | Auction
  | Listing
  | Succession
  | Liquidation
  | EnergyDiagnostic

export function getColumnsForType(type: OpportunityType): Array<Column<any>> {
  switch (type) {
    case OpportunityType.AUCTION:
      return getAuctionColumns()
    case OpportunityType.REAL_ESTATE_LISTING:
      return getListingColumns()
    case OpportunityType.SUCCESSION:
      return getSuccessionColumns()
    case OpportunityType.LIQUIDATION:
      return getLiquidationColumns()
    case OpportunityType.ENERGY_SIEVE:
      return getEnergySieveColumns()
    default:
      return []
  }
}
