"use client";

import { GenericRangeFilter } from './GenericRangeFilter';

interface ConstructionYearRangeFilterProps {
  minValue?: number;
  maxValue?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  label?: string;
}

export function ConstructionYearRangeFilter({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  label = "Année de construction",
}: ConstructionYearRangeFilterProps): React.ReactElement {
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