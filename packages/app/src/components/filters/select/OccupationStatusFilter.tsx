import type { AuctionOccupationStatus } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { OCCUPATION_STATUS_OPTIONS } from '@/constants'

interface OccupationStatusFilterProps {
  value?: Array<AuctionOccupationStatus>
  onValueChange: (value: Array<AuctionOccupationStatus> | undefined) => void
}

export function OccupationStatusFilter({
  value = [],
  onValueChange,
}: OccupationStatusFilterProps): React.ReactElement {
  const handleToggle = (status: AuctionOccupationStatus) => {
    const currentValues = value ?? []
    const newValues = currentValues.includes(status)
      ? currentValues.filter((v) => v !== status)
      : [...currentValues, status]

    onValueChange(newValues.length > 0 ? newValues : undefined)
  }

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        Statut d'occupation
      </label>
      <div className="space-y-2">
        {OCCUPATION_STATUS_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`occupation-${option.value}`}
              checked={value?.includes(option.value) ?? false}
              onCheckedChange={() => handleToggle(option.value)}
            />
            <label
              htmlFor={`occupation-${option.value}`}
              className="text-sm cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
