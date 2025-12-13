import { OpportunityType, type Liquidation } from '@linkinvests/shared'
import {
  AddressCell,
  DateCell,
  LabelCell,
  SiretCell,
  StatusCell,
} from './shared'
import { QuickActionsDropdown } from './QuickActionsDropdown'

import type { Column } from './types'

// Extended type for liquidation with favorite info
type LiquidationWithFavorite = Liquidation & {
  favoriteId: string
  status: string
}

export interface LiquidationColumnsOptions {
  onViewDetails?: (item: LiquidationWithFavorite) => void
}

export function getLiquidationColumns(
  options?: LiquidationColumnsOptions,
): Array<Column<LiquidationWithFavorite>> {
  return [
    {
      key: 'label',
      header: 'Entreprise',
      cell: (liquidation) => <LabelCell label={liquidation.label} />,
    },
    {
      key: 'address',
      header: 'Adresse',
      cell: (liquidation) => <AddressCell address={liquidation.address} />,
    },
    {
      key: 'publicationDate',
      header: 'Date publication',
      cell: (liquidation) => <DateCell date={liquidation.opportunityDate} />,
    },
    {
      key: 'siret',
      header: 'SIRET',
      cell: (liquidation) => <SiretCell siret={liquidation.siret} />,
    },
    {
      key: 'status',
      header: 'Statut',
      cell: (liquidation) => <StatusCell status={liquidation.status} />,
    },
    {
      key: 'actions',
      header: '',
      cell: (liquidation) => (
        <QuickActionsDropdown
          opportunityType={OpportunityType.LIQUIDATION}
          onViewDetails={() => options?.onViewDetails?.(liquidation)}
        />
      ),
      className: 'text-right',
    },
  ]
}
