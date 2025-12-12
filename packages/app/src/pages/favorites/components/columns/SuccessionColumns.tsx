import { OpportunityType } from '@linkinvests/shared'
import { ActionsCell, AddressCell, DateCell, LabelCell } from './shared'
import type { Succession } from '@linkinvests/shared'

import type { Column } from './types'

export function getSuccessionColumns(): Array<Column<Succession>> {
  return [
    {
      key: 'label',
      header: 'Bien',
      cell: (succession) => <LabelCell label={succession.label} />,
    },
    {
      key: 'address',
      header: 'Adresse',
      cell: (succession) => <AddressCell address={succession.address} />,
    },
    {
      key: 'publicationDate',
      header: 'Date publication',
      cell: (succession) => <DateCell date={succession.opportunityDate} />,
    },
    {
      key: 'deceasedName',
      header: 'Défunt',
      cell: (succession) => (
        <span className="truncate max-w-[150px] block">
          {succession.firstName} {succession.lastName}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (succession) => (
        <ActionsCell
          opportunityId={succession.id}
          opportunityType={OpportunityType.SUCCESSION}
        />
      ),
      className: 'text-right',
    },
  ]
}
