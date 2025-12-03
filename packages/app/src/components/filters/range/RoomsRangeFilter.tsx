import { GenericRangeFilter } from './GenericRangeFilter'

interface RoomsRangeFilterProps {
  minRooms?: number
  maxRooms?: number
  onMinChange: (value: number | undefined) => void
  onMaxChange: (value: number | undefined) => void
}

export function RoomsRangeFilter({
  minRooms,
  maxRooms,
  onMinChange,
  onMaxChange,
}: RoomsRangeFilterProps): React.ReactElement {
  return (
    <GenericRangeFilter
      label="Pièces"
      minValue={minRooms}
      maxValue={maxRooms}
      onMinChange={onMinChange}
      onMaxChange={onMaxChange}
      placeholder={{ min: 'Min', max: 'Max' }}
    />
  )
}
