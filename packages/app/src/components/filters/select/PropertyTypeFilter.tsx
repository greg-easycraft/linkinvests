import type { PropertyType } from '@linkinvests/shared'
import { Checkbox } from '@/components/ui/checkbox'
import { PROPERTY_TYPE_OPTIONS } from '@/constants'

interface PropertyTypeFilterProps {
  value?: Array<PropertyType>
  onValueChange: (value: Array<PropertyType> | undefined) => void
}

export function PropertyTypeFilter({
  value = [],
  onValueChange,
}: PropertyTypeFilterProps): React.ReactElement {
  const handleToggle = (propertyType: PropertyType) => {
    const currentValues = value
    const newValues = currentValues.includes(propertyType)
      ? currentValues.filter((v) => v !== propertyType)
      : [...currentValues, propertyType]

    onValueChange(newValues.length > 0 ? newValues : undefined)
  }

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Type de bien</label>
      <div className="space-y-2">
        {PROPERTY_TYPE_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`property-type-${option.value}`}
              checked={value.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
            />
            <label
              htmlFor={`property-type-${option.value}`}
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
