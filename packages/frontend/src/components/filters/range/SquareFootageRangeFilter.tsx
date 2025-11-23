"use client";

import { GenericRangeFilter } from './GenericRangeFilter';

interface SquareFootageRangeFilterProps {
  minValue?: number;
  maxValue?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  label?: string;
}

export function SquareFootageRangeFilter({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  label = "Surface",
}: SquareFootageRangeFilterProps): React.ReactElement {
  return (
    <GenericRangeFilter
      label={label}
      minValue={minValue}
      maxValue={maxValue}
      onMinChange={onMinChange}
      onMaxChange={onMaxChange}
      placeholder={{ min: 'Min', max: 'Max' }}
      unit="m²"
    />
  );
}