import { OpportunityType } from '@linkinvests/shared'
import {
  ActionsCell,
  AddressCell,
  DateCell,
  LabelCell,
  SiretCell,
} from './shared'
import type { Liquidation } from '@linkinvests/shared'

import type { Column } from './types'

export function getLiquidationColumns(): Array<Column<Liquidation>> {
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
      key: 'actions',
      header: '',
      cell: (liquidation) => (
        <ActionsCell
          opportunityId={liquidation.id}
          opportunityType={OpportunityType.LIQUIDATION}
        />
      ),
      className: 'text-right',
    },
  ]
}
