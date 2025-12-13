import { OpportunityType, type Succession } from '@linkinvests/shared'
import { AddressCell, DateCell, LabelCell, StatusCell } from './shared'
import { QuickActionsDropdown } from './QuickActionsDropdown'

import type { Column } from './types'

// Extended type for succession with favorite info
type SuccessionWithFavorite = Succession & {
  favoriteId: string
  status: string
}

export interface SuccessionColumnsOptions {
  onViewDetails?: (item: SuccessionWithFavorite) => void
  onEmailClick?: (favoriteId: string) => void
}

export function getSuccessionColumns(
  options?: SuccessionColumnsOptions,
): Array<Column<SuccessionWithFavorite>> {
  return [
    {
      key: 'label',
      header: 'Bien',
      cell: (succession) => <LabelCell label={succession.label} />,
    },
    {
      key: 'address',
      header: 'Adresse',
      cell: (succession) => (
        <AddressCell
          streetAddress={succession.streetAddress}
          city={succession.city}
        />
      ),
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
      key: 'status',
      header: 'Statut',
      cell: (succession) => <StatusCell status={succession.status} />,
    },
    {
      key: 'actions',
      header: '',
      cell: (succession) => (
        <QuickActionsDropdown
          opportunityType={OpportunityType.SUCCESSION}
          onViewDetails={() => options?.onViewDetails?.(succession)}
          favoriteId={succession.favoriteId}
          status={succession.status}
          mairieEmail={succession.mairieContact?.email}
          onEmailClick={options?.onEmailClick}
        />
      ),
      className: 'text-right',
    },
  ]
}
