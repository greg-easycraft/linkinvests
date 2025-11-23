"use client";

import { GenericRangeFilter } from './GenericRangeFilter';

interface RoomsRangeFilterProps {
  minValue?: number;
  maxValue?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  label?: string;
}

export function RoomsRangeFilter({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  label = "Nombre de pièces",
}: RoomsRangeFilterProps): React.ReactElement {
  return (
    <GenericRangeFilter
      label={label}
      minValue={minValue}
      maxValue={maxValue}
      onMinChange={onMinChange}
      onMaxChange={onMaxChange}
      placeholder={{ min: 'Min', max: 'Max' }}
    />
  );
}