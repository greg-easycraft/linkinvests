import { useNavigate } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { OpportunityType } from '@/types'
import {
  OPPORTUNITY_TYPE_PATHS,
  TYPE_LABELS,
} from '@/constants/opportunity-types'

const OPPORTUNITY_TYPE_DISPLAY_ORDER: Array<OpportunityType> = [
  OpportunityType.AUCTION,
  OpportunityType.REAL_ESTATE_LISTING,
  OpportunityType.SUCCESSION,
  OpportunityType.LIQUIDATION,
  OpportunityType.ENERGY_SIEVE,
]

const PATH_TO_TYPE: Record<string, OpportunityType> = {
  '/search/auctions': OpportunityType.AUCTION,
  '/search/listings': OpportunityType.REAL_ESTATE_LISTING,
  '/search/successions': OpportunityType.SUCCESSION,
  '/search/liquidations': OpportunityType.LIQUIDATION,
  '/search/energy-sieves': OpportunityType.ENERGY_SIEVE,
}

interface OpportunityTypeFilterProps {
  currentPath: string
}

export function OpportunityTypeFilter({
  currentPath,
}: OpportunityTypeFilterProps): React.ReactElement {
  const navigate = useNavigate()
  const currentType = PATH_TO_TYPE[currentPath] ?? OpportunityType.AUCTION

  const handleTypeChange = (type: OpportunityType) => {
    const targetPath = OPPORTUNITY_TYPE_PATHS[type]
    navigate({ to: targetPath })
  }

  return (
    <div className="space-y-2">
      <Label>Type d'opportunité</Label>
      <Select value={currentType} onValueChange={handleTypeChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPPORTUNITY_TYPE_DISPLAY_ORDER.map((type) => (
            <SelectItem key={type} value={type}>
              {TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
