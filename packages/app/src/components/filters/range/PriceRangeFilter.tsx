import { GenericRangeFilter } from './GenericRangeFilter'

interface PriceRangeFilterProps {
  minPrice?: number
  maxPrice?: number
  onMinPriceChange: (value: number | undefined) => void
  onMaxPriceChange: (value: number | undefined) => void
  label?: string
}

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  label = 'Prix',
}: PriceRangeFilterProps): React.ReactElement {
  return (
    <GenericRangeFilter
      label={label}
      minValue={minPrice}
      maxValue={maxPrice}
      onMinChange={onMinPriceChange}
      onMaxChange={onMaxPriceChange}
      placeholder={{ min: 'Min', max: 'Max' }}
      unit="€"
    />
  )
}
