"use client";

import { GenericRangeFilter } from './GenericRangeFilter';

interface PriceRangeFilterProps {
  minValue?: number;
  maxValue?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  label?: string;
}

export function PriceRangeFilter({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  label = "Prix",
}: PriceRangeFilterProps): React.ReactElement {
  return (
    <GenericRangeFilter
      label={label}
      minValue={minValue}
      maxValue={maxValue}
      onMinChange={onMinChange}
      onMaxChange={onMaxChange}
      placeholder={{ min: 'Prix min', max: 'Prix max' }}
      unit="€"
    />
  );
}