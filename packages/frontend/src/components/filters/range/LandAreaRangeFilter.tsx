"use client";

import { GenericRangeFilter } from './GenericRangeFilter';

interface LandAreaRangeFilterProps {
  minValue?: number;
  maxValue?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  label?: string;
}

export function LandAreaRangeFilter({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  label = "Surface terrain",
}: LandAreaRangeFilterProps): React.ReactElement {
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