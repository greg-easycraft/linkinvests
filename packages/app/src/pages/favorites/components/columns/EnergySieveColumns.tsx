import { OpportunityType } from '@linkinvests/shared'
import {
  ActionsCell,
  AddressCell,
  DateCell,
  EnergyCell,
  SurfaceCell,
} from './shared'
import type { EnergyDiagnostic } from '@linkinvests/shared'

import type { Column } from './types'

export function getEnergySieveColumns(): Array<Column<EnergyDiagnostic>> {
  return [
    {
      key: 'address',
      header: 'Adresse',
      cell: (diagnostic) => <AddressCell address={diagnostic.address} />,
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
      key: 'actions',
      header: '',
      cell: (diagnostic) => (
        <ActionsCell
          opportunityId={diagnostic.id}
          opportunityType={OpportunityType.ENERGY_SIEVE}
        />
      ),
      className: 'text-right',
    },
  ]
}
