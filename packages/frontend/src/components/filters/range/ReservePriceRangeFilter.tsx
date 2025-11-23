"use client";

import { GenericRangeFilter } from './GenericRangeFilter';

interface ReservePriceRangeFilterProps {
  minValue?: number;
  maxValue?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  label?: string;
}

export function ReservePriceRangeFilter({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  label = "Prix de réserve",
}: ReservePriceRangeFilterProps): React.ReactElement {
  return (
    <GenericRangeFilter
      label={label}
      minValue={minValue}
      maxValue={maxValue}
      onMinChange={onMinChange}
      onMaxChange={onMaxChange}
      placeholder={{ min: 'Min', max: 'Max' }}
      unit="€"
    />
  );
}