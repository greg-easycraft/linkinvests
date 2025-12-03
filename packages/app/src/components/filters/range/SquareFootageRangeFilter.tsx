import { GenericRangeFilter } from './GenericRangeFilter'

interface SquareFootageRangeFilterProps {
  minSquareFootage?: number
  maxSquareFootage?: number
  onMinChange: (value: number | undefined) => void
  onMaxChange: (value: number | undefined) => void
}

export function SquareFootageRangeFilter({
  minSquareFootage,
  maxSquareFootage,
  onMinChange,
  onMaxChange,
}: SquareFootageRangeFilterProps): React.ReactElement {
  return (
    <GenericRangeFilter
      label="Surface"
      minValue={minSquareFootage}
      maxValue={maxSquareFootage}
      onMinChange={onMinChange}
      onMaxChange={onMaxChange}
      placeholder={{ min: 'Min', max: 'Max' }}
      unit="m²"
    />
  )
}
