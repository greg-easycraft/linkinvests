import { OpportunityType } from '@linkinvests/shared'

import { getAuctionColumns } from './AuctionColumns'
import { getEnergySieveColumns } from './EnergySieveColumns'
import { getLiquidationColumns } from './LiquidationColumns'
import { getListingColumns } from './ListingColumns'
import {
  getSuccessionColumns,
  type SuccessionColumnsOptions,
} from './SuccessionColumns'
import type { Column } from './types'
import type {
  Auction,
  EnergyDiagnostic,
  Liquidation,
  Listing,
  Succession,
} from '@linkinvests/shared'

export type { Column } from './types'
export type { SuccessionColumnsOptions } from './SuccessionColumns'

export type OpportunityItem =
  | Auction
  | Listing
  | Succession
  | Liquidation
  | EnergyDiagnostic

export interface ColumnsOptions {
  onViewDetails?: (item: any, type: OpportunityType) => void
  succession?: SuccessionColumnsOptions
}

export function getColumnsForType(
  type: OpportunityType,
  options?: ColumnsOptions,
): Array<Column<any>> {
  // Create type-specific onViewDetails callback
  const createViewDetailsCallback = (item: any) => {
    options?.onViewDetails?.(item, type)
  }

  switch (type) {
    case OpportunityType.AUCTION:
      return getAuctionColumns({ onViewDetails: createViewDetailsCallback })
    case OpportunityType.REAL_ESTATE_LISTING:
      return getListingColumns({ onViewDetails: createViewDetailsCallback })
    case OpportunityType.SUCCESSION:
      return getSuccessionColumns({
        ...options?.succession,
        onViewDetails: createViewDetailsCallback,
      })
    case OpportunityType.LIQUIDATION:
      return getLiquidationColumns({ onViewDetails: createViewDetailsCallback })
    case OpportunityType.ENERGY_SIEVE:
      return getEnergySieveColumns({ onViewDetails: createViewDetailsCallback })
    default:
      return []
  }
}
