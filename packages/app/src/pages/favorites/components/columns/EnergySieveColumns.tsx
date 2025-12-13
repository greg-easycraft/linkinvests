import { OpportunityType, type EnergyDiagnostic } from '@linkinvests/shared'
import {
  AddressCell,
  DateCell,
  EnergyCell,
  StatusCell,
  SurfaceCell,
} from './shared'
import { QuickActionsDropdown } from './QuickActionsDropdown'

import type { Column } from './types'

// Extended type for energy diagnostic with favorite info
type EnergySieveWithFavorite = EnergyDiagnostic & {
  favoriteId: string
  status: string
}

export interface EnergySieveColumnsOptions {
  onViewDetails?: (item: EnergySieveWithFavorite) => void
}

export function getEnergySieveColumns(
  options?: EnergySieveColumnsOptions,
): Array<Column<EnergySieveWithFavorite>> {
  return [
    {
      key: 'address',
      header: 'Adresse',
      cell: (diagnostic) => (
        <AddressCell
          streetAddress={diagnostic.streetAddress}
          city={diagnostic.city}
        />
      ),
    },
    {
      key: 'diagnosticDate',
      header: 'Date diagnostic',
      cell: (diagnostic) => <DateCell date={diagnostic.opportunityDate} />,
    },
    {
      key: 'squareFootage',
      header: 'Surface',
      cell: (diagnostic) => (
        <SurfaceCell squareFootage={diagnostic.squareFootage} />
      ),
    },
    {
      key: 'energyClass',
      header: 'DPE',
      cell: (diagnostic) => <EnergyCell energyClass={diagnostic.energyClass} />,
    },
    {
      key: 'status',
      header: 'Statut',
      cell: (diagnostic) => <StatusCell status={diagnostic.status} />,
    },
    {
      key: 'actions',
      header: '',
      cell: (diagnostic) => (
        <QuickActionsDropdown
          opportunityType={OpportunityType.ENERGY_SIEVE}
          onViewDetails={() => options?.onViewDetails?.(diagnostic)}
        />
      ),
      className: 'text-right',
    },
  ]
}
