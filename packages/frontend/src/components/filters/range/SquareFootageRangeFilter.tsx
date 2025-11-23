"use client";

import { GenericRangeFilter, RangeFilterValue } from './GenericRangeFilter';

interface SquareFootageRangeFilterProps {
  value?: RangeFilterValue;
  onChange: (value: RangeFilterValue | undefined) => void;
  label?: string;
}

export function SquareFootageRangeFilter({
  value,
  onChange,
  label = "Surface",
}: SquareFootageRangeFilterProps): React.ReactElement {
  return (
    <GenericRangeFilter
      label={label}
      value={value}
      onChange={onChange}
      placeholder={{ min: 'Min', max: 'Max' }}
      unit="m²"
    />
  );
}