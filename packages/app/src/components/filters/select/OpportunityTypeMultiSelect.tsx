import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { OpportunityType } from '@linkinvests/shared'
import { TYPE_LABELS } from '@/constants/opportunity-types'

const OPPORTUNITY_TYPE_DISPLAY_ORDER: Array<OpportunityType> = [
  OpportunityType.AUCTION,
  OpportunityType.REAL_ESTATE_LISTING,
  OpportunityType.SUCCESSION,
  OpportunityType.LIQUIDATION,
  OpportunityType.ENERGY_SIEVE,
]

interface OpportunityTypeMultiSelectProps {
  selectedTypes?: Array<OpportunityType>
  onTypesChange: (types: Array<OpportunityType> | undefined) => void
}

export function OpportunityTypeMultiSelect({
  selectedTypes = [],
  onTypesChange,
}: OpportunityTypeMultiSelectProps): React.ReactElement {
  // Empty array or all types selected means "all types"
  const isAllSelected =
    selectedTypes.length === 0 ||
    selectedTypes.length === OPPORTUNITY_TYPE_DISPLAY_ORDER.length

  const isTypeSelected = (type: OpportunityType): boolean => {
    return isAllSelected || selectedTypes.includes(type)
  }

  const handleToggle = (type: OpportunityType) => {
    if (isAllSelected) {
      // Switching from "all" to a specific selection: unselect this type
      const newTypes = OPPORTUNITY_TYPE_DISPLAY_ORDER.filter((t) => t !== type)
      onTypesChange(newTypes)
    } else if (selectedTypes.includes(type)) {
      // Unselecting a type
      const newTypes = selectedTypes.filter((t) => t !== type)
      // If only one left, keep it (can't have empty selection)
      if (newTypes.length === 0) {
        // If trying to unselect the last one, select all instead
        onTypesChange(undefined)
      } else if (
        newTypes.length ===
        OPPORTUNITY_TYPE_DISPLAY_ORDER.length - 1
      ) {
        // If unselecting brings us to all but one, just return to "all"
        onTypesChange(undefined)
      } else {
        onTypesChange(newTypes)
      }
    } else {
      // Selecting a type
      const newTypes = [...selectedTypes, type]
      // If selecting all, switch to "all types" mode
      if (newTypes.length === OPPORTUNITY_TYPE_DISPLAY_ORDER.length) {
        onTypesChange(undefined)
      } else {
        onTypesChange(newTypes)
      }
    }
  }

  const handleSelectAll = () => {
    onTypesChange(undefined)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Types d'opportunités</Label>
        {!isAllSelected && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleSelectAll}
          >
            Tout sélectionner
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {OPPORTUNITY_TYPE_DISPLAY_ORDER.map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <Checkbox
              id={`type-${type}`}
              checked={isTypeSelected(type)}
              onCheckedChange={() => handleToggle(type)}
            />
            <label
              htmlFor={`type-${type}`}
              className="text-sm cursor-pointer select-none"
            >
              {TYPE_LABELS[type]}
            </label>
          </div>
        ))}
      </div>
      {isAllSelected && (
        <p className="text-xs text-muted-foreground">
          Tous les types sont sélectionnés
        </p>
      )}
    </div>
  )
}
